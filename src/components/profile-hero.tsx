"use client"

import { SplineScene } from "@/components/ui/splite";
import { SpotlightCursor } from "@/components/ui/spotlight-cursor"
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const words = ["I am Vinaya Kumar","A Software developer" ,"A ML Engineer."];

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

export function ProfileHero() {
  return (
    <div id="profile" className="relative min-h-screen bg-black overflow-hidden flex items-center p-6 sm:p-12 md:p-24">
      {/* Dynamic Background Spotlight */}
      <SpotlightCursor className="z-[5]" config={{ radius: 600, brightness: 0.12, color: "#ffffff" }} />
      
      {/* Fullscreen Spline Background */}
      <div className="absolute inset-y-0 right-0 md:left-0 z-0 w-[100vw] md:w-[150vw] lg:w-[130vw]">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Front Interface */}
      <div className="relative z-10 w-full max-w-3xl pointer-events-none mt-20">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 min-h-[3em] sm:min-h-[2em] lg:min-h-[2.5em] flex items-center font-sans tracking-tight drop-shadow-lg">
          <Typewriter />
        </h1>
        <p className="mt-4 text-neutral-300 max-w-xl text-lg md:text-xl leading-relaxed backdrop-blur-xl bg-black/40 p-6 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto relative">
          A Machine Learning enthusiast who loves teaching machines to understand data.
        </p>

        {/* Scroll down trigger */}
        <a 
          href="#resume" 
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('resume')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="mt-12 inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors pointer-events-auto animate-bounce backdrop-blur-md bg-white/5 border border-white/10 px-6 py-3 rounded-full shadow-2xl hover:bg-white/10"
        >
          <span className="text-sm tracking-widest uppercase font-bold">Scroll to Explore</span>
          <ChevronDown size={16} />
        </a>
      </div>
    </div>
  )
}
