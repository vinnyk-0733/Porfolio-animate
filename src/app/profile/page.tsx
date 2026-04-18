'use client'

import dynamic from "next/dynamic";

const CyberneticGridShader = dynamic(
  () => import("@/components/ui/cybernetic-grid-shader"),
  { ssr: false }
);

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";

const words = ["I am Vinaya", "I'm an AI & ML developer."];

function Typewriter() {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }, 40);
    } else {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length + 1));
        if (text.length === currentWord.length) {
          timeout = setTimeout(() => setIsDeleting(true), 2500);
        }
      }, 75);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex]);

  return (
    <span className="inline-block">
      {text}
      <span className="animate-[pulse_1s_ease-in-out_infinite] opacity-70 ml-1">|</span>
    </span>
  );
}

export default function SplineSceneBasic() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex items-center p-6 sm:p-12 md:p-24">
      {/* Cybernetic Grid Background */}
      <div className="absolute inset-0 z-0">
        <CyberneticGridShader maxDpr={1} pauseOffscreen />
      </div>

      {/* Front Interface */}
      <div className="relative z-10 w-full max-w-3xl pointer-events-none mt-20">
        <Link
          href="/"
          className="absolute -top-24 left-0 z-20 text-white/50 hover:text-white transition-colors inline-flex items-center gap-2 text-sm backdrop-blur-md bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 pointer-events-auto shadow-xl"
        >
          <ArrowLeft size={16} /> Back to Resume
        </Link>
        
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 min-h-[3em] sm:min-h-[2em] lg:min-h-[2.5em] flex items-center font-sans tracking-tight drop-shadow-lg">
          <Typewriter />
        </h1>
        <p className="mt-4 text-neutral-300 max-w-xl text-lg md:text-xl leading-relaxed backdrop-blur-sm bg-black/40 p-6 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto relative">
          A Machine Learning enthusiast who loves teaching machines to understand data.
        </p>
      </div>
    </div>
  )
}
