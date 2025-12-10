import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import AnimatedBackground from '../ui/AnimatedBackground';
import GlassContainer from '../ui/GlassContainer';
import WaveformCanvas from '../ui/WaveformCanvas';

const Slide1_Concept = ({ concept, setConcept, onNext }) => {
    const [animationData, setAnimationData] = useState(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        fetch('https://lottie.host/8c69c59c-09ba-4b36-8186-066c4a8f9468/a5b1Zso14Q.json')
            .then(response => response.json())
            .then(data => setAnimationData(data));
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center h-full text-white p-8 bg-gray-950 overflow-hidden">
            {/* Animated gradient background */}
            <AnimatedBackground theme="blue-purple" intensity="subtle" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
                {/* Lottie with glow */}
                {animationData && (
                    <div className="relative mb-8">
                        <div className="absolute inset-0 blur-xl opacity-50" style={{ background: 'radial-gradient(circle, rgba(96, 165, 250, 0.6), transparent)' }} />
                        <Lottie animationData={animationData} loop={true} style={{ width: 300, height: 300 }} />
                    </div>
                )}

                <h1 className="text-4xl font-bold text-center mb-8">I want to write a song about...</h1>

                {/* Glass input container */}
                <div className="relative w-full max-w-lg">
                    {/* Waveform on focus */}
                    {isFocused && (
                        <div className="absolute inset-0 -z-10">
                            <WaveformCanvas
                                variant="sine"
                                color="rgba(96, 165, 250, 0.3)"
                                speed={1.5}
                                amplitude={0.5}
                            />
                        </div>
                    )}

                    <GlassContainer tint="blue" blur="medium" className="p-0">
                        <input
                            type="text"
                            value={concept}
                            onChange={(e) => setConcept(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full p-4 text-center bg-transparent border-none rounded-3xl text-2xl focus:outline-none text-white placeholder:text-white/50"
                            placeholder="...the resurrection of Jesus."
                        />
                    </GlassContainer>
                </div>

                {/* Gradient button */}
                <button
                    onClick={onNext}
                    disabled={!concept.trim()}
                    className="mt-8 px-8 py-4 rounded-3xl text-xl font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:grayscale"
                    style={{
                        background: concept.trim()
                            ? 'linear-gradient(180deg, rgba(30, 58, 138, 0.9) 0%, rgba(67, 56, 202, 0.9) 100%)'
                            : 'rgba(55, 65, 81, 0.5)',
                        boxShadow: concept.trim()
                            ? '0 20px 40px -20px rgba(67, 56, 202, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.1) inset'
                            : 'none',
                    }}
                >
                    Next &rarr;
                </button>
            </div>
        </div>
    );
};

export default Slide1_Concept;
