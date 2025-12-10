import React from 'react';
import { Music, Layers, Tag } from 'lucide-react';
import AnimatedBackground from '../ui/AnimatedBackground';
import GradientCard from '../ui/GradientCard';

const Slide2_Refinements = ({ tone, setTone, structure, setStructure, tags, setTags, onBack, onGenerate }) => {
    const toneOptions = ['Uplifting', 'Contemplative', 'Celebratory', 'Intimate'];
    const structureOptions = ['Chorus-Heavy', 'Verse-Driven', 'Bridge-Focused', 'Simple'];

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            setTags([...tags, e.target.value.trim()]);
            e.target.value = '';
        }
    };

    const removeTag = (indexToRemove) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="relative flex flex-col items-center justify-center h-full p-8 overflow-y-auto bg-gray-950 overflow-x-hidden">
            {/* Animated background */}
            <AnimatedBackground theme="purple-pink" intensity="subtle" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-2xl space-y-6">
                <h1 className="text-4xl font-bold text-white text-center mb-8">Refine Your Song</h1>

                {/* Tone Card */}
                <GradientCard variant="purple-pink" glowIntensity="medium">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <Music className="w-6 h-6 mr-3" />
                        Tone
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {toneOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => setTone(option)}
                                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                                    tone === option
                                        ? 'bg-white text-purple-700 scale-105'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </GradientCard>

                {/* Structure Card */}
                <GradientCard variant="purple-pink" glowIntensity="medium">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <Layers className="w-6 h-6 mr-3" />
                        Structure
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {structureOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => setStructure(option)}
                                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                                    structure === option
                                        ? 'bg-white text-pink-600 scale-105'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </GradientCard>

                {/* Tags Card */}
                <GradientCard variant="purple-pink" glowIntensity="medium">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <Tag className="w-6 h-6 mr-3" />
                        Tags (Optional)
                    </h2>
                    <input
                        type="text"
                        onKeyDown={handleAddTag}
                        placeholder="Add tags (press Enter)..."
                        className="w-full p-3 mb-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm flex items-center gap-2 border border-white/10 hover:bg-pink-400/30 transition-all duration-300"
                            >
                                #{tag}
                                <button
                                    onClick={() => removeTag(index)}
                                    className="text-white/70 hover:text-white"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </GradientCard>

                {/* Buttons */}
                <div className="flex justify-between items-center pt-4">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-2xl font-semibold text-white bg-white/10 hover:bg-white/20 transition-all duration-300"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={onGenerate}
                        className="px-8 py-4 rounded-3xl text-xl font-bold text-white transition-all duration-300 hover:scale-105 animate-border-pulse"
                        style={{
                            background: 'linear-gradient(180deg, rgba(126, 34, 206, 0.9) 0%, rgba(219, 39, 119, 0.9) 100%)',
                            boxShadow: '0 20px 40px -20px rgba(219, 39, 119, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.1) inset',
                        }}
                    >
                        Generate Song →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Slide2_Refinements;
