'use client';
import { useRef, useEffect, HTMLAttributes } from 'react';

interface SpotlightConfig {
  radius?: number;
  brightness?: number;
  color?: string;
  smoothing?: number;
}

const useSpotlightEffect = (config: SpotlightConfig) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    const smoothing = config.smoothing || 0.15;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const handleMouseLeave = () => {
      targetX = -1000;
      targetY = -1000;
    };

    const hexToRgb = (hex: string) => {
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `${r},${g},${b}`;
    };

    const rgbColor = hexToRgb(config.color || '#ffffff');
    const radius = config.radius || 200;
    const brightness = config.brightness || 0.15;

    let lastDrawnX = -1000;
    let lastDrawnY = -1000;

    const draw = () => {
      // Lerp toward target for smooth movement
      currentX += (targetX - currentX) * smoothing;
      currentY += (targetY - currentY) * smoothing;

      // Only redraw if the position has changed by a meaningful amount
      const dx = currentX - lastDrawnX;
      const dy = currentY - lastDrawnY;
      if (dx * dx + dy * dy > 0.25) {
        lastDrawnX = currentX;
        lastDrawnY = currentY;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentX > -500 && currentY > -500) {
          const gradient = ctx.createRadialGradient(
            currentX, currentY, 0,
            currentX, currentY, radius
          );
          gradient.addColorStop(0, `rgba(${rgbColor}, ${brightness})`);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config.radius, config.brightness, config.color, config.smoothing]);

  return canvasRef;
};

export interface SpotlightCursorProps extends HTMLAttributes<HTMLCanvasElement> {
  config?: SpotlightConfig;
}

export const SpotlightCursor = ({
  config = {},
  className,
  ...rest
}: SpotlightCursorProps) => {
  const spotlightConfig = {
    radius: 400,
    brightness: 0.15,
    color: '#ffffff',
    smoothing: 0.15,
    ...config,
  };

  const canvasRef = useSpotlightEffect(spotlightConfig);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 pointer-events-none z-10 w-full h-full ${className || ''}`}
      {...rest}
    />
  );
};
