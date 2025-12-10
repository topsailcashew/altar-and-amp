import React from 'react';

const GradientCard = ({
  variant = 'blue-purple',
  glowIntensity = 'medium',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    'blue-purple': {
      background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.9) 0%, rgba(67, 56, 202, 0.9) 100%)',
      glowColor: 'rgba(67, 56, 202, 0.6)',
    },
    'purple-pink': {
      background: 'linear-gradient(180deg, rgba(126, 34, 206, 0.9) 0%, rgba(219, 39, 119, 0.9) 100%)',
      glowColor: 'rgba(219, 39, 119, 0.6)',
    },
    'orange-red': {
      background: 'linear-gradient(180deg, rgba(234, 88, 12, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)',
      glowColor: 'rgba(234, 88, 12, 0.6)',
    },
    'green-teal': {
      background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.9) 0%, rgba(20, 184, 166, 0.9) 100%)',
      glowColor: 'rgba(34, 197, 94, 0.6)',
    },
    'glass': {
      background: 'rgba(10, 10, 10, 0.5)',
      glowColor: 'rgba(250, 250, 250, 0.1)',
    },
  };

  const glowIntensities = {
    low: '20px',
    medium: '40px',
    high: '60px',
  };

  const style = variantStyles[variant] || variantStyles['blue-purple'];
  const blur = glowIntensities[glowIntensity] || glowIntensities.medium;

  return (
    <div
      className={`relative overflow-hidden rounded-4xl p-6 transition-all duration-300 hover:scale-[1.02] ${className}`}
      style={{
        background: style.background,
        boxShadow: `
          0 20px 60px -20px ${style.glowColor},
          0 0 1px 1px rgba(255, 255, 255, 0.1) inset
        `,
      }}
      role="article"
      {...props}
    >
      {/* Bottom glow effect */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at bottom, ${style.glowColor.replace('0.6', '0.5')}, transparent)`,
          borderRadius: 'inherit',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GradientCard;
