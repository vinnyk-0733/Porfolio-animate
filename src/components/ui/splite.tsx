'use client'

import dynamic from 'next/dynamic'
import React, { Component, ReactNode } from 'react';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white">
      <span className="animate-pulse">Loading 3D Scene...</span>
    </div>
  )
})

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

class SplineErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Spline WebGL Context Trapped Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (React.isValidElement(this.props.fallback) && this.props.fallback.type === SplineErrorFallback) {
         return React.cloneElement(this.props.fallback as React.ReactElement<any>, { 
           onRetry: () => this.setState({ hasError: false }) 
         });
      }
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function SplineErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-8 space-y-4">
      <span className="text-red-400 font-mono text-sm uppercase tracking-widest text-center">
        WebGL Context Exhausted
      </span>
      <p className="text-white/50 text-xs text-center max-w-xs">
        Your browser has temporarily run out of 3D memory due to hot-reloads.
      </p>
      <button 
        onClick={onRetry}
        className="px-6 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-full hover:bg-emerald-500 hover:text-black transition-all text-sm font-bold tracking-widest uppercase mt-4"
      >
        Retry Engine
      </button>
      <p className="text-white/30 text-[10px] text-center mt-2">
        If this fails, refresh the page directly to dump RAM.
      </p>
    </div>
  );
}

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <SplineErrorBoundary fallback={<SplineErrorFallback />}>
      <Spline
        scene={scene}
        className={className}
      />
    </SplineErrorBoundary>
  )
}
