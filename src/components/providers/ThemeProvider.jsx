import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const themeConfigs = {
  0: {
    name: 'blue-purple',
    colors: {
      primary: 'rgba(30, 58, 138, 0.9)',
      secondary: 'rgba(67, 56, 202, 0.9)',
      accent: 'rgba(96, 165, 250, 1)',
      glow: 'rgba(147, 197, 253, 0.6)',
    },
  },
  1: {
    name: 'purple-pink',
    colors: {
      primary: 'rgba(126, 34, 206, 0.9)',
      secondary: 'rgba(219, 39, 119, 0.9)',
      accent: 'rgba(244, 114, 182, 1)',
      glow: 'rgba(216, 180, 254, 0.6)',
    },
  },
  2: {
    name: 'orange-green',
    colors: {
      primary: 'rgba(234, 88, 12, 0.9)',
      secondary: 'rgba(34, 197, 94, 0.9)',
      accent: 'rgba(74, 222, 128, 1)',
      glow: 'rgba(251, 146, 60, 0.6)',
    },
  },
};

export const ThemeProvider = ({ children, currentSlide = 0 }) => {
  const [theme, setTheme] = useState(themeConfigs[currentSlide]);

  useEffect(() => {
    const newTheme = themeConfigs[currentSlide] || themeConfigs[0];
    setTheme(newTheme);

    // Inject CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', newTheme.colors.primary);
    root.style.setProperty('--theme-secondary', newTheme.colors.secondary);
    root.style.setProperty('--theme-accent', newTheme.colors.accent);
    root.style.setProperty('--theme-glow', newTheme.colors.glow);
  }, [currentSlide]);

  return (
    <ThemeContext.Provider value={{ theme, currentSlide }}>
      {children}
    </ThemeContext.Provider>
  );
};
