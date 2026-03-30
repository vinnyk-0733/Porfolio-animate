'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const Component = () => {
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle with rAF to avoid excessive updates
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;

        setMousePosition({ x: e.clientX, y: e.clientY });

        const last = lastPosRef.current;
        if (last !== null) {
          const dx = e.clientX - last.x;
          const dy = e.clientY - last.y;

          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            if (Math.abs(dx) > Math.abs(dy)) {
              setDirection(dx > 0 ? 'right' : 'left');
            } else {
              setDirection(dy > 0 ? 'down' : 'up');
            }
          }
        }
        lastPosRef.current = { x: e.clientX, y: e.clientY };

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setDirection(null);
        }, 150);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []); // Empty deps — stable effect, no re-renders

  const getRotation = () => {
    switch (direction) {
      case 'up': return 0;
      case 'right': return 90;
      case 'down': return 180;
      case 'left': return -90;
      default: return 0;
    }
  };

  const arrowVariants: any = {
    initial: {
      opacity: 0,
      scale: 0.5,
      rotate: getRotation(),
    },
    animate: {
      opacity: 1,
      scale: 1,
      rotate: getRotation(),
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.15, ease: "easeIn" }
    },
  };

  return (
    <div className='fixed top-0 left-0 w-full h-full pointer-events-none z-50'>
      <AnimatePresence>
        {direction && (
          <motion.div
            key="arrow"
            style={{
              position: 'fixed',
              top: mousePosition.y - 25,
              left: mousePosition.x + 15,
            }}
            initial='initial'
            animate='animate'
            exit='exit'
            variants={arrowVariants}
          >
            <div className='w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='30'
                height='30'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-black'
              >
                <line x1='12' y1='19' x2='12' y2='5'></line>
                <polyline points='5 12 12 5 19 12'></polyline>
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
