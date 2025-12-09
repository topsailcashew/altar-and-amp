import React, { useRef, useEffect, useState } from 'react';

const WaveformCanvas = ({
  variant = 'bars',
  barCount = 5,
  color = 'rgba(147, 197, 253, 0.8)',
  speed = 1.2,
  amplitude = 0.7,
  className = '',
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Intersection Observer for visibility
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000; // seconds

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (variant === 'bars') {
        drawBars(ctx, rect, elapsed, barCount, amplitude, speed, color);
      } else if (variant === 'sine') {
        drawSineWave(ctx, rect, elapsed, amplitude, speed, color);
      } else if (variant === 'pulse') {
        drawPulse(ctx, rect, elapsed, amplitude, speed, color);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [variant, barCount, color, speed, amplitude, isVisible, prefersReducedMotion]);

  // Fallback for reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        className={`w-full h-full ${className}`}
        style={{
          background: `linear-gradient(180deg, ${color.replace('0.8', '0.2')}, transparent)`,
          opacity: 0.5,
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ willChange: 'transform' }}
    />
  );
};

// Drawing functions
const drawBars = (ctx, rect, time, barCount, amplitude, speed, color) => {
  const barWidth = rect.width / (barCount * 2 - 1);
  const maxHeight = rect.height * amplitude;
  const centerY = rect.height / 2;

  for (let i = 0; i < barCount; i++) {
    const x = i * barWidth * 2 + barWidth / 2;
    const phase = (i / barCount) * Math.PI * 2;
    const height = Math.abs(Math.sin(time * speed + phase)) * maxHeight;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(
      x - barWidth / 4,
      centerY - height / 2,
      barWidth / 2,
      height,
      barWidth / 4
    );
    ctx.fill();
  }
};

const drawSineWave = (ctx, rect, time, amplitude, speed, color) => {
  const points = 100;
  const maxAmplitude = rect.height * amplitude * 0.3;
  const centerY = rect.height / 2;

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();

  for (let i = 0; i <= points; i++) {
    const x = (i / points) * rect.width;
    const phase = (i / points) * Math.PI * 4;
    const y = centerY + Math.sin(time * speed + phase) * maxAmplitude;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
};

const drawPulse = (ctx, rect, time, amplitude, speed, color) => {
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const maxRadius = Math.min(rect.width, rect.height) * 0.4 * amplitude;
  const radius = (Math.sin(time * speed) * 0.5 + 0.5) * maxRadius;

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
};

export default WaveformCanvas;
