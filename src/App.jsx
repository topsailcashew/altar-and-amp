import React, { useState, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { EffectFade } from 'swiper/modules';

import { ThemeProvider } from './components/providers/ThemeProvider';
import Slide1_Concept from './components/slides/Slide1_Concept';
import Slide2_Refinements from './components/slides/Slide2_Refinements';
import Slide3_Result from './components/slides/Slide3_Result';

// --- Global Constants and Configuration ---
const API_MODEL = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent`;
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// --- Structured Output Schema ---
const RESPONSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        "title": { "type": "STRING" },
        "theme": { "type": "STRING" },
        "scripture_reference": { "type": "STRING" },
        "suggested_key": { "type": "STRING" },
        "suggested_bpm": { "type": "INTEGER" },
        "suggested_progression": { "type": "STRING" },
        "lyrical_analysis": {
            "type": "OBJECT",
            "properties": {
                "rhyme_scheme": { "type": "STRING" },
                "meter_and_flow_critique": { "type": "STRING" },
                "complexity_rating": { "type": "STRING" }
            },
            "required": ["rhyme_scheme", "meter_and_flow_critique", "complexity_rating"]
        },
        "sections": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "type": { "type": "STRING" },
                    "lyrics": { "type": "STRING" }
                },
                "required": ["type", "lyrics"]
            }
        }
    },
    "required": ["title", "sections", "lyrical_analysis"]
};

// --- Main App Component ---
const App = () => {
    const [swiper, setSwiper] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [conceptPrompt, setConceptPrompt] = useState('');
    const [toneFilter, setToneFilter] = useState('Uplifting');
    const [structureFilter, setStructureFilter] = useState('Chorus-Heavy');
    const [tags, setTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentSongData, setCurrentSongData] = useState(null);

    const handleGenerate = useCallback(async () => {
        if (!conceptPrompt.trim()) {
            setError({ message: "Please enter a concept for your song." });
            return;
        }

        swiper?.slideTo(2);
        setIsLoading(true);
        setError(null);
        setCurrentSongData(null);

        // Build comprehensive prompt with worship music style guidelines
        const styleGuidelines = `Write in the style of contemporary worship music, employing accessible language to focus on God's power, grace, and a personal relationship with Him. Use experiential, emotional language to describe Holy Spirit encounter, incorporating vivid imagery (like fire, water, light, and heights) to convey the feeling of God's presence and spiritual revival. Blend theological depth with accessible declarations, focusing on God's attributes and the victory of Jesus. Utilize anthemic, universal language and poetic metaphors to capture the struggles and hope of the modern believer, centering on themes of surrender and God's unmatched glory. Move the worshipper from intellectual belief to a passionate, declarative, and emotional response to God's nature and actions.`;

        const tagsContext = tags.length > 0 ? ` Include themes related to: ${tags.join(', ')}.` : '';

        const finalUserQuery = `Write a contemporary worship song about ${conceptPrompt}. The song should be ${toneFilter} in tone and have a ${structureFilter} structure.${tagsContext}

${styleGuidelines}

Create lyrics that are singable, memorable, and suitable for congregational worship.`;

        const payload = {
            contents: [{ parts: [{ text: finalUserQuery }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        };

        try {
            const response = await fetch(`${API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];
            if (!candidate) throw new Error("API response candidate is missing.");
            
            const jsonText = candidate.content?.parts?.[0]?.text;
            setCurrentSongData(JSON.parse(jsonText));
        } catch (err) {
            console.error("Gemini API Error:", err);
            setError({ message: err.message || 'An unknown error occurred.' });
        } finally {
            setIsLoading(false);
        }
    }, [conceptPrompt, toneFilter, structureFilter, tags, swiper]);
    
    return (
        <ThemeProvider currentSlide={currentSlide}>
            <div className="min-h-screen bg-gray-950 font-sans text-white">
                <Swiper
                    modules={[EffectFade]}
                    effect="fade"
                    onSwiper={setSwiper}
                    onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
                    className="w-full h-screen"
                    allowTouchMove={false}
                >
                    <SwiperSlide>
                        <Slide1_Concept
                            concept={conceptPrompt}
                            setConcept={setConceptPrompt}
                            onNext={() => swiper?.slideNext()}
                        />
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide2_Refinements
                            tone={toneFilter}
                            setTone={setToneFilter}
                            structure={structureFilter}
                            setStructure={setStructureFilter}
                            tags={tags}
                            setTags={setTags}
                            onBack={() => swiper?.slidePrev()}
                            onGenerate={handleGenerate}
                        />
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide3_Result
                            songData={currentSongData}
                            isLoading={isLoading}
                            error={error}
                            onStartOver={() => swiper?.slideTo(0)}
                        />
                    </SwiperSlide>
                </Swiper>
            </div>
        </ThemeProvider>
    );
};

export default App;