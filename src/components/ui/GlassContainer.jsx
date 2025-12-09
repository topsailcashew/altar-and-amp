import React from 'react';

const GlassContainer = ({
  tint = 'none',
  blur = 'medium',
  children,
  className = '',
  ...props
}) => {
  const tintColors = {
    blue: 'rgba(30, 58, 138, 0.2)',
    purple: 'rgba(126, 34, 206, 0.2)',
    pink: 'rgba(219, 39, 119, 0.2)',
    orange: 'rgba(234, 88, 12, 0.2)',
    green: 'rgba(34, 197, 94, 0.2)',
    none: 'rgba(10, 10, 10, 0.3)',
  };

  const blurStrengths = {
    light: '8px',
    medium: '12px',
    heavy: '20px',
  };

  const tintColor = tintColors[tint] || tintColors.none;
  const blurAmount = blurStrengths[blur] || blurStrengths.medium;

  return (
    <div
      className={`relative rounded-3xl p-6 border border-white/10 ${className}`}
      style={{
        background: tintColor,
        backdropFilter: `blur(${blurAmount})`,
        WebkitBackdropFilter: `blur(${blurAmount})`,
        boxShadow: '0 0 1px 1px rgba(255, 255, 255, 0.05) inset',
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassContainer;
