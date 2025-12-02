import React, { useState, useCallback } from 'react';
// Import utility icons from Lucide for better aesthetics in the React environment
import { Loader2, Feather, Music, BookOpen, Download, Layout, Edit3, X } from 'lucide-react';

// --- Global Constants and Configuration ---
const API_MODEL = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent`;
// FIX: Removed reference to 'import.meta.env' as it causes compilation errors in some environments. 
// For this environment, the apiKey must be an empty string for the platform to handle authentication.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// --- Structured Output Schema (Kept outside for clean JSON parsing) ---
const RESPONSE_SCHEMA = {
    // ... (Schema remains unchanged)
    type: "OBJECT",
    properties: {
        "title": { "type": "STRING", "description": "A concise, powerful song title suitable for modern worship." },
        "theme": { "type": "STRING", "description": "The central theological theme of the lyrics." },
        "scripture_reference": { "type": "STRING", "description": "The primary Bible verse or passage used as the foundation." },
        "suggested_key": { "type": "STRING", "description": "The best key for the song (e.g., G Major, C Major, E Minor)." },
        "suggested_bpm": { "type": "INTEGER", "description": "The suggested tempo in beats per minute (e.g., 72, 128)." },
        "suggested_progression": { "type": "STRING", "description": "A simple, modern chord progression for the Chorus/Verse (e.g., G - C - Em - D)." },
        "lyrical_analysis": {
            "type": "OBJECT",
            "description": "Technical analysis of the generated lyrics for craft and structure.",
            "properties": {
                "rhyme_scheme": { "type": "STRING", "description": "The rhyme scheme used (e.g., AABB, ABAB, or Free Verse)." },
                "meter_and_flow_critique": { "type": "STRING", "description": "A brief analysis of the meter, rhythm, and singability." },
                "complexity_rating": { "type": "STRING", "description": "A simple rating of the lyrical complexity (e.g., Simple, Moderate, Poetic)." }
            },
            "required": ["rhyme_scheme", "meter_and_flow_critique", "complexity_rating"]
        },
        "sections": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "type": { "type": "STRING", "enum": ["Verse 1", "Verse 2", "Chorus", "Pre-Chorus", "Bridge", "Tag", "Revision"] },
                    "lyrics": { "type": "STRING", "description": "The complete, formatted lyrics for this section. Must be memorable, contemporary, and flow well for singing." }
                },
                "required": ["type", "lyrics"]
            }
        }
    },
    "required": ["title", "sections", "lyrical_analysis"]
};

// --- System Instruction Function (Dynamically generated) ---
const createSystemInstruction = (tone, structure) => {
    return `
    You are a skilled Contemporary Christian Music (CCM) songwriter and theological editor, specializing in creating modern worship songs suitable for congregational singing.
    
    **Mission:** Your primary goal is to produce lyrically profound, theologically accurate, and highly memorable song sections based on the user's request and the following constraints.
    
    **Customization Filters:**
    1.  **Emotional Tone:** The song must convey a ${tone} mood.
    2.  **Structure Focus:** The song structure and lyric style should be geared towards a ${structure} approach (e.g., prioritize repetition if Chorus-Heavy, or detailed story if Narrative).
    
    **Style Constraints (The 'Modern Melodies & Memorable Lines' improvement):**
    1.  **Language:** Use contemporary, accessible, and powerful language (e.g., modern worship like Hillsong, Elevation, Maverick City). Avoid archaic words or overly complex sentence structures.
    2.  **Rhythm/Flow:** Lines must be easily singable, rhythmically balanced, and highly repeatable (memorable). Use strong, clear imagery.
    3.  **Theology (The 'Heavy Scriptural Basis' improvement):** The content must be firmly grounded in specific Bible verses. Use your knowledge of Scripture to ensure accurate theological framing and proper citation sources.
    4.  **Musical Guidance:** Based on the lyrical content and theme, generate a modern and simple suggested key, tempo (BPM), and a common four-chord progression suitable for congregational worship.
    5.  **Lyrical Analysis:** Provide a detailed technical analysis of the resulting lyrics (including rhyme, meter, and complexity) in the designated JSON object field.
    
    **Output:** Always respond with a single, perfectly formatted JSON object that adheres strictly to the provided JSON schema. Do not include any text, conversation, or markdown formatting outside of the JSON object itself.
    `;
};

// --- Utility Functions (General) ---
const backoffFetch = async (url, options, retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                continue;
            }
            if (!response.ok) {
                const errorBody = await response.text();
                console.error('API Error Response:', errorBody);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
            }
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
};

// Markdown Formatting
const formatSongDataForMarkdown = (data) => {
    if (!data) return "No song data available.";

    let mdContent = `# ${data.title || 'Untitled Song'}\n\n`;
    mdContent += `## 🎵 Musical Core\n`;
    mdContent += `* **Theme:** ${data.theme || 'N/A'}\n`;
    mdContent += `* **Key:** ${data.suggested_key || 'N/A'}\n`;
    mdContent += `* **BPM:** ${data.suggested_bpm || 'N/A'}\n`;
    mdContent += `* **Progression:** ${data.suggested_progression || 'N/A'}\n\n`;
    
    if (data.lyrical_analysis) {
        const analysis = data.lyrical_analysis;
        mdContent += `## 📝 Lyrical Analysis\n`;
        mdContent += `* **Rhyme Scheme:** ${analysis.rhyme_scheme || 'N/A'}\n`;
        mdContent += `* **Complexity:** ${analysis.complexity_rating || 'N/A'}\n`;
        mdContent += `* **Meter/Flow Critique:** ${analysis.meter_and_flow_critique || 'N/A'}\n\n`;
    }

    if (data.sections && data.sections.length > 0) {
        mdContent += `## 🎤 Lyrics\n\n`;
        data.sections.forEach(section => {
            mdContent += `### ${section.type}\n`;
            mdContent += `${section.lyrics}\n\n`;
        });
    }

    if (data.scripture_reference) {
        mdContent += `## ✨ Scriptural Foundation\n`;
        mdContent += `${data.scripture_reference}\n\n`;
    }

    mdContent += `\n---\n*Generated by The Altar & Amp.*\n`;

    return mdContent;
};

// --- Custom Hook for API and State Management ---
const useSongForge = () => {
    const [conceptPrompt, setConceptPrompt] = useState('');
    const [revisionLyrics, setRevisionLyrics] = useState('');
    const [toneFilter, setToneFilter] = useState('Uplifting');
    const [structureFilter, setStructureFilter] = useState('Chorus-Heavy');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentSongData, setCurrentSongData] = useState(null);
    const [sources, setSources] = useState([]);

    const handleGenerate = useCallback(async () => {
        const conceptQuery = conceptPrompt.trim();
        const revisionText = revisionLyrics.trim();

        if (!conceptQuery) {
            setError({ message: "Please enter a concept or instruction in the Blueprint box." });
            return;
        }

        const systemInstruction = createSystemInstruction(toneFilter, structureFilter);

        let finalUserQuery = revisionText
            ? `REVISION TASK: The user wants to revise existing lyrics. The user's instruction is: "${conceptQuery}". The existing lyrics for revision are: --- ${revisionText} --- Please apply the style constraints (including the filters) to rewrite these lyrics, focusing on the requested instruction. Structure the revised output under the 'Revision' section type in the required JSON format.`
            : conceptQuery;

        setIsLoading(true);
        setError(null);
        setCurrentSongData(null);
        setSources([]);

        const payload = {
            contents: [{ parts: [{ text: finalUserQuery }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        };

        let fetchUrl = API_URL;
        if (apiKey) {
            fetchUrl += `?key=${apiKey}`;
        }

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };

        try {
            const response = await backoffFetch(fetchUrl, options);
            const result = await response.json();

            const candidate = result.candidates?.[0];
            if (!candidate) {
                throw new Error("API response candidate is missing.");
            }

            const jsonText = candidate.content?.parts?.[0]?.text;
            let songData;
            try {
                songData = JSON.parse(jsonText);
                setCurrentSongData(songData);
            } catch (e) {
                console.error("JSON Parsing Error:", e);
                throw new Error("Model generated unparseable JSON. Please try again.");
            }

            const groundingMetadata = candidate.groundingMetadata;
            if (groundingMetadata && groundingMetadata.groundingAttributions) {
                const fetchedSources = groundingMetadata.groundingAttributions
                    .map(attribution => ({ uri: attribution.web?.uri, title: attribution.web?.title, }))
                    .filter(source => source.uri && source.title);
                setSources(fetchedSources);
            }

        } catch (err) {
            console.error("Gemini API Error:", err);
            setError({ message: err.message || 'An unknown error occurred while contacting the AI songwriter.' });
        } finally {
            setIsLoading(false);
        }
    }, [conceptPrompt, revisionLyrics, toneFilter, structureFilter]);

    return {
        conceptPrompt, setConceptPrompt,
        revisionLyrics, setRevisionLyrics,
        toneFilter, setToneFilter,
        structureFilter, setStructureFilter,
        isLoading, error, currentSongData, sources,
        handleGenerate,
    };
};

// --- Dedicated UI Components ---

const LoadingIndicator = () => (
    <div className="text-center p-12 bg-gray-800 rounded-3xl modular-card">
        <Loader2 className="animate-spin inline-block w-12 h-12 text-amber-500" />
        <p className="mt-4 text-xl text-amber-400 font-medium">Forging the word... Please wait.</p>
    </div>
);

const InputCard = ({ title, icon: Icon, children }) => (
    <div className="p-6 bg-gray-800 rounded-3xl modular-card">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 border-b border-amber-900 pb-2 flex items-center">
            {Icon && <Icon className="w-6 h-6 mr-2" />}
            {title}
        </h2>
        {children}
    </div>
);

const LyricsModal = ({ isOpen, onClose, currentSongData, sources, handleExport }) => {
    // Close on ESC key
    React.useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            // Lock body scroll
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            // Restore body scroll
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !currentSongData) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative w-screen h-screen bg-gray-900 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="fixed top-6 right-6 z-10 p-3 bg-gray-800 hover:bg-gray-700 text-amber-400 rounded-full transition-colors duration-200 shadow-lg"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Content Container */}
                <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-6">
                    {/* Export Button */}
                    <div className="text-center">
                        <button
                            onClick={handleExport}
                            className="px-6 py-3 bg-transparent text-amber-400 font-semibold rounded-2xl
                                border-2 border-amber-500 shadow-lg shadow-amber-900/50 flex items-center justify-center mx-auto
                                hover:bg-amber-900/50 hover:text-amber-300 transition duration-200 ease-in-out"
                        >
                            <Download className="w-5 h-5 mr-2" /> Export to Markdown (.md)
                        </button>
                    </div>

                    {/* 1. Title Card */}
                    <div className="bg-gradient-to-r from-amber-700 to-orange-800 text-white p-6 rounded-3xl shadow-xl shadow-amber-900/50">
                        <h2 className="text-4xl font-black mb-1">{currentSongData.title || 'Untitled Worship Song'}</h2>
                        <p className="text-xl text-amber-200">{currentSongData.theme || 'No theme specified'}</p>
                        {currentSongData.scripture_reference && (
                            <p className="text-amber-300 text-sm italic mt-2 border-t border-amber-600/50 pt-2">Foundation: {currentSongData.scripture_reference}</p>
                        )}
                    </div>

                    {/* 2. Music Guidance Card */}
                    {(currentSongData.suggested_key || currentSongData.suggested_bpm || currentSongData.suggested_progression) && (
                        <div className="p-6 bg-gray-800 rounded-3xl modular-card">
                            <h4 className="text-xl font-bold text-amber-400 mb-3 border-b border-amber-900 pb-2 flex items-center"><Music className="w-5 h-5 mr-2" /> Musical Core</h4>
                            <div className="flex flex-wrap justify-between items-center text-lg font-extrabold">
                                <p className="text-gray-300">Key: <span className="text-white">{currentSongData.suggested_key || 'N/A'}</span></p>
                                <p className="text-gray-300">BPM: <span className="text-white">{currentSongData.suggested_bpm || 'N/A'}</span></p>
                            </div>
                            <div className="mt-3 text-lg font-extrabold p-3 bg-gray-900 rounded-xl border border-gray-700">
                                <p className="text-gray-300">Progression: <span className="text-amber-300">{currentSongData.suggested_progression || 'N/A'}</span></p>
                            </div>
                        </div>
                    )}

                    {/* 3. Lyrics Sections - NOTE: Lyrical Analysis removed */}
                    {currentSongData.sections && currentSongData.sections.map((section, index) => {
                        const isRevision = section.type === 'Revision';
                        const sectionClasses = isRevision
                            ? "p-6 bg-orange-950/40 rounded-3xl border-2 border-orange-700 shadow-md"
                            : "p-6 bg-gray-800 rounded-3xl modular-card";
                        const typeColor = isRevision ? "text-orange-400" : "text-gray-200";

                        return (
                            <div key={index} className={sectionClasses}>
                                <div className="flex justify-between items-center mb-4 border-b pb-2 border-amber-900">
                                    <h3 className={`text-2xl font-bold ${typeColor}`}>{section.type}</h3>
                                </div>
                                <pre className="whitespace-pre-wrap text-lg text-gray-300 leading-relaxed">{section.lyrics}</pre>
                            </div>
                        );
                    })}

                    {/* 4. Citations */}
                    {sources.length > 0 ? (
                        <div className="p-6 bg-gray-800 rounded-3xl modular-card">
                            <h3 className="text-xl font-semibold text-gray-400 mb-3 border-b border-amber-900 pb-2 flex items-center"><BookOpen className="w-5 h-5 mr-2" /> Scriptural Grounding Sources</h3>
                            <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                                {sources.map((s, index) => (
                                    <li key={index}><a href={s.uri} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 underline">{s.title || s.uri}</a></li>
                                ))}
                            </ul>
                        </div>
                    ) : currentSongData.title && (
                        <div className="p-6 bg-gray-800 rounded-3xl modular-card">
                            <p className="text-sm text-gray-500">Note: Scriptural references were generated based on internal knowledge and the prompt.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ResultsPanel = ({ currentSongData, sources, error, handleExport, openModal }) => {
    if (error) {
        return (
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-3xl text-red-400 modular-card">
                <p className="font-semibold">Generation Failed:</p>
                <p className="text-sm">{error.message}</p>
            </div>
        );
    }

    if (!currentSongData) {
        return (
            <div className="text-center p-12 text-gray-500 rounded-3xl border-2 border-dashed border-gray-700/50">
                <Layout className="w-12 h-12 mx-auto mb-3" />
                <p className="text-lg">Your generated lyrics and musical guidance will appear here.</p>
            </div>
        );
    }

    return (
        <div className="text-center p-12 bg-gray-800 rounded-3xl modular-card">
            <Music className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h3 className="text-3xl font-bold text-amber-400 mb-2">{currentSongData.title || 'Untitled Song'}</h3>
            <p className="text-lg text-gray-400 mb-6">{currentSongData.theme || 'No theme specified'}</p>
            <button
                onClick={openModal}
                className="px-8 py-4 bg-transparent text-amber-400 font-semibold text-xl rounded-3xl
                    border-2 border-amber-500 shadow-xl shadow-amber-900/50
                    hover:bg-amber-900/50 hover:text-amber-300 transition duration-200 ease-in-out transform hover:scale-105"
            >
                View Song
            </button>
        </div>
    );
};


// --- Main App Component ---
const App = () => {
    // Use the custom hook to manage all app state and API logic
    const {
        conceptPrompt, setConceptPrompt,
        revisionLyrics, setRevisionLyrics,
        toneFilter, setToneFilter,
        structureFilter, setStructureFilter,
        isLoading, error, currentSongData, sources,
        handleGenerate,
    } = useSongForge();

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Auto-open modal when song data is set
    React.useEffect(() => {
        if (currentSongData && !isModalOpen) {
            setIsModalOpen(true);
        }
    }, [currentSongData]);

    // Export Handler using the data from the hook
    const handleExport = useCallback(() => {
        if (!currentSongData) return;
        const mdContent = formatSongDataForMarkdown(currentSongData);
        const rawFilename = currentSongData.title || 'untitled-song';
        const filename = `${rawFilename.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').substring(0, 50)}.md`;

        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [currentSongData]);


    return (
        // Inline CSS for the required fonts. Tailwind handles the rest.
        <div className="min-h-screen p-4 sm:p-8 flex justify-center items-start bg-gray-950 font-archivo">
            <div className="w-full max-w-4xl bg-gray-900 shadow-2xl rounded-[3rem] p-6 md:p-12 border border-amber-900">
                
                {/* HEADER */}
                <header className="mb-10 text-center border-b pb-6 border-amber-900/50">
                    <h1 className="text-6xl md:text-7xl font-black text-amber-500 mb-1 tracking-tight header-retro">
                        The <span className="text-white">Altar</span> & <span className="text-white">Amp</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-light font-archivo">The Engine for Scriptural Lyric Creation</p>
                </header>

                <main className="space-y-8">
                    
                    {/* 1. THE BLUEPRINT (Concept Input) */}
                    <InputCard title="1. The Blueprint" icon={Edit3}>
                        <label htmlFor="conceptPrompt" className="block text-base font-semibold text-gray-300 mb-2 mt-4">Song Concept / Instruction:</label>
                        <textarea 
                            id="conceptPrompt" 
                            rows="3" 
                            value={conceptPrompt} 
                            onChange={(e) => setConceptPrompt(e.target.value)}
                            className="w-full p-4 border border-gray-700 bg-gray-900 text-white rounded-2xl focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out"
                            placeholder="E.g., 'Write a triumphant bridge referencing the Resurrection.'"
                        ></textarea>
                    </InputCard>

                    {/* 2. REFINEMENT FILTERS (Controls) */}
                    <InputCard title="2. Refinement Filters" icon={Layout}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Tone/Mood Filter */}
                            <div>
                                <label htmlFor="toneFilter" className="block text-base font-semibold text-gray-300 mb-2">Emotional Tone:</label>
                                <select 
                                    id="toneFilter" 
                                    value={toneFilter}
                                    onChange={(e) => setToneFilter(e.target.value)}
                                    className="w-full p-4 border border-gray-700 bg-gray-900 text-white rounded-2xl focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out appearance-none cursor-pointer"
                                >
                                    <option value="Uplifting">Uplifting (Joy, Hope)</option>
                                    <option value="Reflective">Reflective (Worship, Awe)</option>
                                    <option value="Confessional">Confessional (Repentance, Need)</option>
                                    <option value="Triumphant">Triumphant (Victory, Declaration)</option>
                                    <option value="Somber">Somber (Lament, Longing)</option>
                                </select>
                            </div>

                            {/* Structure Focus Filter */}
                            <div>
                                <label htmlFor="structureFilter" className="block text-base font-semibold text-gray-300 mb-2">Structure Focus:</label>
                                <select 
                                    id="structureFilter" 
                                    value={structureFilter}
                                    onChange={(e) => setStructureFilter(e.target.value)}
                                    className="w-full p-4 border border-gray-700 bg-gray-900 text-white rounded-2xl focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out appearance-none cursor-pointer"
                                >
                                    <option value="Chorus-Heavy">Chorus-Heavy (Repetition, Singability)</option>
                                    <option value="Narrative/Verse-Focused">Narrative (Storytelling, Detail)</option>
                                    <option value="Lyrical/Poetic">Lyrical/Poetic (Imagery, Rich Vocabulary)</option>
                                    <option value="Simple Hymn">Simple Hymn (Classic structure, ABAB rhyme)</option>
                                </select>
                            </div>
                        </div>
                    </InputCard>

                    {/* 3. REVISION EDITOR (Optional Input) */}
                    <InputCard title="3. Revision Editor (Optional)" icon={Feather}>
                        <label htmlFor="revisionLyrics" className="block text-base font-semibold text-gray-300 mb-2">Lyrics to Refine:</label>
                        <textarea 
                            id="revisionLyrics" 
                            rows="4" 
                            value={revisionLyrics}
                            onChange={(e) => setRevisionLyrics(e.target.value)}
                            className="w-full p-4 border border-gray-700 bg-gray-900 text-white rounded-2xl focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out"
                            placeholder="Paste draft lyrics here for revision (e.g., 'I know God loves me very much, he holds me in his strong clutch.')."
                        ></textarea>
                    </InputCard>
                        
                    {/* GENERATE BUTTON */}
                    <button 
                        id="generateButton" 
                        onClick={handleGenerate}
                        disabled={isLoading || !conceptPrompt.trim()}
                        className="w-full mt-6 px-8 py-4 bg-transparent text-amber-400 font-semibold text-xl rounded-3xl 
                                border-2 border-amber-500 shadow-xl shadow-amber-900/50 
                                hover:bg-amber-900/50 hover:text-amber-300 transition duration-200 ease-in-out transform hover:scale-[1.005] 
                                disabled:bg-gray-800 disabled:border-gray-700 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {isLoading ? (revisionLyrics ? 'Refining Lyrics...' : 'Forging New Song Part...') : 'Forge New Song Part'}
                    </button>


                    {/* OUTPUT SECTION */}
                    {isLoading && <LoadingIndicator />}
                    
                    <div id="results" className="space-y-6">
                        <ResultsPanel
                            currentSongData={currentSongData}
                            sources={sources}
                            error={error}
                            handleExport={handleExport}
                            openModal={() => setIsModalOpen(true)}
                        />
                    </div>

                    <LyricsModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        currentSongData={currentSongData}
                        sources={sources}
                        handleExport={handleExport}
                    />
                </main>
            </div>
        </div>
    );
};

export default App;