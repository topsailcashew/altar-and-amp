import React from 'react';
import WaveformCanvas from './ui/WaveformCanvas';

const LoadingIndicator = () => {
    return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="w-64 h-32 mb-6">
                <WaveformCanvas
                    variant="bars"
                    barCount={7}
                    color="rgba(74, 222, 128, 0.8)"
                    speed={1.5}
                    amplitude={0.8}
                />
            </div>
            <p className="text-xl text-white/80 animate-pulse">
                Generating your song...
            </p>
        </div>
    );
};

export default LoadingIndicator;
