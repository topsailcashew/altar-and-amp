import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import GlassContainer from './ui/GlassContainer';
import WaveformCanvas from './ui/WaveformCanvas';

const LyricsModal = ({ isOpen, onClose, songData }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !songData) return null;

    const { title, sections } = songData;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            {/* Ambient waveform */}
            <div className="absolute inset-0 opacity-25 pointer-events-none">
                <WaveformCanvas
                    variant="sine"
                    color="rgba(34, 197, 94, 0.4)"
                    speed={0.6}
                    amplitude={0.4}
                />
            </div>

            {/* Modal content */}
            <div
                className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <GlassContainer tint="green" blur="heavy" className="relative">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    {/* Title */}
                    <h1 className="text-4xl font-bold text-white mb-8 pr-12">{title}</h1>

                    {/* Lyrics sections */}
                    <div className="overflow-y-auto max-h-[calc(90vh-200px)] pr-4 space-y-6">
                        {sections?.map((section, index) => (
                            <div
                                key={index}
                                className="pb-6 border-b border-white/10 last:border-b-0"
                            >
                                <p className="text-green-300 font-bold mb-3 uppercase tracking-wide">
                                    {section.type}
                                </p>
                                <p className="text-white text-lg whitespace-pre-line leading-relaxed">
                                    {section.lyrics}
                                </p>
                            </div>
                        ))}
                    </div>
                </GlassContainer>
            </div>
        </div>
    );
};

export default LyricsModal;
