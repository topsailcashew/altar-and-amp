import React, { useState, useEffect } from 'react';
import LoadingIndicator from '../LoadingIndicator';
import ResultsPanel from '../ResultsPanel';
import LyricsModal from '../LyricsModal';
import AnimatedBackground from '../ui/AnimatedBackground';
import WaveformCanvas from '../ui/WaveformCanvas';

const Slide3_Result = ({ songData, isLoading, error, onStartOver }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (songData) {
            setIsModalOpen(true);
        }
    }, [songData]);

    return (
        <div className="relative flex flex-col items-center justify-center h-full p-8 overflow-y-auto bg-gray-950 overflow-x-hidden">
            {/* Animated background */}
            <AnimatedBackground theme="orange-green" intensity="subtle" />

            {/* Ambient waveform background */}
            {!isLoading && songData && (
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <WaveformCanvas
                        variant="sine"
                        color="rgba(34, 197, 94, 0.3)"
                        speed={0.8}
                        amplitude={0.3}
                    />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 w-full max-w-6xl">
                {isLoading && <LoadingIndicator />}

                {error && (
                    <div className="text-center">
                        <div
                            className="inline-block px-8 py-6 rounded-4xl mb-4"
                            style={{
                                background: 'linear-gradient(180deg, rgba(220, 38, 38, 0.9) 0%, rgba(127, 29, 29, 0.9) 100%)',
                                boxShadow: '0 20px 40px -20px rgba(220, 38, 38, 0.6)',
                            }}
                        >
                            <p className="text-2xl font-bold text-white mb-2">Error</p>
                            <p className="text-white/90">{error.message}</p>
                        </div>
                        <button
                            onClick={onStartOver}
                            className="px-6 py-3 rounded-2xl font-semibold text-white bg-white/10 hover:bg-white/20 transition-all duration-300"
                        >
                            ← Start Over
                        </button>
                    </div>
                )}

                {!isLoading && !error && songData && (
                    <>
                        <ResultsPanel songData={songData} onViewSong={() => setIsModalOpen(true)} />
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={onStartOver}
                                className="px-6 py-3 rounded-2xl font-semibold text-white bg-white/10 hover:bg-white/20 transition-all duration-300"
                            >
                                ← Start Over
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Lyrics Modal */}
            {songData && (
                <LyricsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    songData={songData}
                />
            )}
        </div>
    );
};

export default Slide3_Result;
