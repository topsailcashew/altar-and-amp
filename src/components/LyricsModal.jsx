import React, { useEffect, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import GlassContainer from './ui/GlassContainer';
import WaveformCanvas from './ui/WaveformCanvas';

const LyricsModal = ({ isOpen, onClose, songData }) => {
    const [copied, setCopied] = useState(false);

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

    const handleCopy = async () => {
        const lyricsText = sections
            .map(section => `[${section.type.toUpperCase()}]\n${section.lyrics}`)
            .join('\n\n');

        const fullText = `${title}\n\n${lyricsText}`;

        try {
            await navigator.clipboard.writeText(fullText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

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
                    {/* Header buttons */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        {/* Copy button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopy();
                            }}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                            aria-label="Copy lyrics"
                            title="Copy lyrics to clipboard"
                        >
                            {copied ? (
                                <Check className="w-6 h-6 text-green-400" />
                            ) : (
                                <Copy className="w-6 h-6 text-white" />
                            )}
                        </button>

                        {/* Close button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-bold text-white mb-8 pr-24">{title}</h1>

                    {/* Lyrics sections */}
                    <div className="overflow-y-auto max-h-[calc(90vh-200px)] pr-4 space-y-8">
                        {sections?.map((section, index) => (
                            <div
                                key={index}
                                className="pb-8 border-b border-white/10 last:border-b-0"
                            >
                                <p className="text-green-300 font-bold mb-4 uppercase tracking-wide text-sm">
                                    {section.type}
                                </p>
                                <p className="text-white text-lg whitespace-pre-line leading-loose">
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
