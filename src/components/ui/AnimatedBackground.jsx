import React from 'react';

const AnimatedBackground = ({ theme = 'blue-purple', intensity = 'subtle' }) => {
  const themeGradients = {
    'blue-purple': {
      gradient1: 'radial-gradient(circle at 20% 30%, rgba(30, 58, 138, 0.4), transparent 50%)',
      gradient2: 'radial-gradient(circle at 80% 70%, rgba(67, 56, 202, 0.4), transparent 50%)',
      gradient3: 'radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.2), transparent 40%)',
    },
    'purple-pink': {
      gradient1: 'radial-gradient(circle at 20% 30%, rgba(126, 34, 206, 0.4), transparent 50%)',
      gradient2: 'radial-gradient(circle at 80% 70%, rgba(219, 39, 119, 0.4), transparent 50%)',
      gradient3: 'radial-gradient(circle at 50% 50%, rgba(244, 114, 182, 0.2), transparent 40%)',
    },
    'orange-green': {
      gradient1: 'radial-gradient(circle at 20% 30%, rgba(234, 88, 12, 0.4), transparent 50%)',
      gradient2: 'radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.4), transparent 50%)',
      gradient3: 'radial-gradient(circle at 50% 50%, rgba(74, 222, 128, 0.2), transparent 40%)',
    },
  };

  const intensityDurations = {
    subtle: '30s',
    medium: '20s',
    prominent: '15s',
  };

  const gradients = themeGradients[theme] || themeGradients['blue-purple'];
  const duration = intensityDurations[intensity] || intensityDurations.subtle;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute w-full h-full"
        style={{
          background: gradients.gradient1,
          animation: `gradient-mesh-1 ${duration} ease-in-out infinite`,
        }}
      />
      <div
        className="absolute w-full h-full"
        style={{
          background: gradients.gradient2,
          animation: `gradient-mesh-2 ${duration} ease-in-out infinite`,
          animationDelay: `${parseFloat(duration) / 3}s`,
        }}
      />
      <div
        className="absolute w-full h-full"
        style={{
          background: gradients.gradient3,
          animation: `gradient-mesh-3 ${duration} ease-in-out infinite`,
          animationDelay: `${parseFloat(duration) / 2}s`,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
