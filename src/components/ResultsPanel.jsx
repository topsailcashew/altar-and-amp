import React from 'react';
import GradientCard from './ui/GradientCard';

const ResultsPanel = ({ songData, onViewSong }) => {
    if (!songData) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <GradientCard variant="glass" className="text-center max-w-md">
                    <p className="text-xl text-white/70 mb-6">No song generated yet.</p>
                    <button
                        onClick={onViewSong}
                        className="px-6 py-3 rounded-2xl font-semibold bg-green-500 text-white hover:bg-green-600 transition-all duration-300"
                    >
                        View Song
                    </button>
                </GradientCard>
            </div>
        );
    }

    const { title, theme, scripture_reference, suggested_key, suggested_bpm, suggested_progression, sections } = songData;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metadata Card (Orange) */}
            <GradientCard variant="orange-red" glowIntensity="medium" className="lg:col-span-1">
                <h2 className="text-3xl font-bold text-white mb-6">{title}</h2>

                <div className="space-y-4">
                    <div>
                        <p className="text-white/70 text-sm uppercase tracking-wide mb-1">Theme</p>
                        <p className="text-white text-lg">{theme || 'N/A'}</p>
                    </div>

                    {scripture_reference && (
                        <div>
                            <p className="text-white/70 text-sm uppercase tracking-wide mb-1">Scripture</p>
                            <p className="text-white text-lg">{scripture_reference}</p>
                        </div>
                    )}

                    {suggested_key && (
                        <div>
                            <p className="text-white/70 text-sm uppercase tracking-wide mb-1">Key</p>
                            <p className="text-white text-lg">{suggested_key}</p>
                        </div>
                    )}

                    {suggested_bpm && (
                        <div>
                            <p className="text-white/70 text-sm uppercase tracking-wide mb-1">BPM</p>
                            <p className="text-white text-lg">{suggested_bpm}</p>
                        </div>
                    )}

                    {suggested_progression && (
                        <div>
                            <p className="text-white/70 text-sm uppercase tracking-wide mb-1">Progression</p>
                            <p className="text-white text-lg font-mono">{suggested_progression}</p>
                        </div>
                    )}
                </div>
            </GradientCard>

            {/* Lyrics Preview Card (Green) */}
            <GradientCard variant="green-teal" glowIntensity="medium" className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-white mb-6">Lyrics Preview</h2>

                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                    {sections?.slice(0, 2).map((section, index) => (
                        <div key={index} className="pb-4 border-b border-white/10 last:border-b-0">
                            <p className="text-green-200 font-semibold mb-2 uppercase tracking-wide text-sm">
                                {section.type}
                            </p>
                            <p className="text-white whitespace-pre-line leading-relaxed">
                                {section.lyrics}
                            </p>
                        </div>
                    ))}

                    {sections?.length > 2 && (
                        <p className="text-white/50 italic text-center">
                            + {sections.length - 2} more sections...
                        </p>
                    )}
                </div>

                <button
                    onClick={onViewSong}
                    className="mt-6 w-full px-6 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105"
                    style={{
                        background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.9) 0%, rgba(20, 184, 166, 0.9) 100%)',
                        boxShadow: '0 20px 40px -20px rgba(34, 197, 94, 0.6)',
                    }}
                >
                    View Full Song
                </button>
            </GradientCard>
        </div>
    );
};

export default ResultsPanel;
