'use client'

import React, { useState } from "react"
import dynamic from "next/dynamic"
import { CodeIcon, Fingerprint, BarChart3, ArrowLeft, ExternalLink, Github } from "lucide-react"
import Link from "next/link"

const PixelCanvas = dynamic(
  () => import("@/components/ui/pixel-canvas").then((mod) => mod.PixelCanvas),
  { ssr: false }
);

const CursorCardsContainer = dynamic(
  () => import("@/components/ui/cursor-cards").then((mod) => mod.CursorCardsContainer),
  { ssr: false }
);

const CursorCard = dynamic(
  () => import("@/components/ui/cursor-cards").then((mod) => mod.CursorCard),
  { ssr: false }
);

const projects = [
  {
    title: "Intelligent Customer Sentiment",
    description: "Developed DistilBERT sentiment analysis pipeline with an interactive dashboard to drastically cut false positives by 20%.",
    icon: BarChart3,
    colors: ["#fca5a5", "#ef4444", "#dc2626"],
    repoUrl: "https://github.com/vinnyk-0733/text-base-emotion-recognition",
    liveUrl: "#",
  },
  {
    title: "EmoFusion: Emotion Assistant",
    description: "Dual-modal emotion engine fusing text sentiment and facial tracking. Integrated context-aware Mistral 3B LLM via WebSocket.",
    icon: Fingerprint,
    colors: ["#e9d5ff", "#7dd3fc", "#38bdf8"],
    repoUrl: "https://github.com/vinnyk-0733/EmoFusion",
    liveUrl: "#",
  },
  {
    title: "Mr. Analyst: AI Data Analyst",
    description: "Fine-tuned Qwen2.5-3B with QLoRA across 10 chart types and served via llama.cpp and FastAPI React integration.",
    icon: CodeIcon,
    colors: ["#bbf7d0", "#4ade80", "#16a34a"],
    repoUrl: "https://github.com/vinnyk-0733/Mr.-Analyst",
    liveUrl: "#",
  }
]

export default function ProjectsPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Clear active box if clicking the background
  const handleBackgroundClick = () => {
    setActiveIndex(null);
  };

  return (
    <div 
      className="h-[100dvh] w-full bg-black text-white p-4 md:p-8 lg:p-12 relative overflow-hidden flex flex-col justify-center"
      onClick={handleBackgroundClick}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-60 z-0 pointer-events-none"></div>
      
      <Link
        href="/"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20 text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm backdrop-blur-md bg-white/5 px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/10 hover:shadow-lg"
      >
        <ArrowLeft size={16} /> Back to Resume
      </Link>

      <div className="max-w-7xl mx-auto relative z-10 w-full mt-8 md:mt-0">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-6 lg:mb-12 text-center drop-shadow-lg tracking-tight">
          Featured Projects
        </h1>

        <CursorCardsContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projects.map((project, idx) => {
            const Icon = project.icon;
            const isActive = activeIndex === idx;

            return (
              <CursorCard 
                key={idx} 
                className="flex flex-col items-center group rounded-[40px] p-6 lg:p-8 border border-white/5 transition-transform duration-500 hover:-translate-y-2"
                primaryHue={project.colors[1]}
                secondaryHue={project.colors[2]}
                illuminationRadius={400}
                illuminationOpacity={0}
                illuminationColor="transparent"
              >
                <div className="w-[180px] sm:w-[220px] lg:w-[240px] xl:w-[280px] mx-auto mb-6 md:mb-10">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(isActive ? null : idx);
                    }}
                    className="cursor-pointer relative w-full overflow-hidden border border-white/10 bg-white/5 rounded-[32px] aspect-square transition-all duration-300 hover:border-white/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus:outline-[5px] focus:outline-[Highlight]"
                    style={{ "--active-color": project.colors[1] } as React.CSSProperties}
                  >
                    <PixelCanvas
                      gap={10}
                      speed={25}
                      colors={project.colors}
                      variant="icon"
                    />
                    
                    {/* Active Split Overlay Overlay */}
                    <div 
                      className={`absolute inset-0 z-20 flex transition-all duration-300 backdrop-blur-lg bg-black/60 ${isActive ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
                    >
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="flex-1 flex flex-col items-center justify-center hover:bg-white/10 transition-colors border-r border-white/10 group/link cursor-not-allowed"
                      >
                        <ExternalLink className="w-10 h-10 mb-2 text-white/50 group-hover/link:text-white transition-all duration-300 group-hover/link:scale-110" />
                        <span className="text-sm font-medium text-white/50 group-hover/link:text-white transition-colors">Live</span>
                        <span className="text-xs text-white/30 mt-1 font-light tracking-wide">coming soon</span>
                      </a>
                      
                      <a 
                        href={project.repoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex flex-col items-center justify-center hover:bg-white/10 transition-colors group/repo"
                      >
                        <Github className="w-10 h-10 mb-3 text-white/50 group-hover/repo:text-white transition-all duration-300 group-hover/repo:scale-110" />
                        <span className="text-sm font-medium text-white/50 group-hover/repo:text-white transition-colors">Repository</span>
                      </a>
                    </div>
                    
                    <div className={`relative z-10 h-full w-full flex items-center justify-center transition-all duration-500 ${isActive ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                      <Icon className="w-16 h-16 md:w-24 md:h-24 text-white/20 transition-all duration-500 ease-out group-hover:scale-110 group-hover:text-[var(--active-color)] group-hover:drop-shadow-[0_0_20px_var(--active-color)]" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg md:text-2xl font-semibold mb-2 md:mb-3 text-center text-white/90 group-hover:text-white transition-colors duration-300 px-2">
                  {project.title}
                </h3>
                <p className="text-xs md:text-base text-white/50 text-center leading-relaxed max-w-sm px-2">
                  {project.description}
                </p>
              </CursorCard>
            )
          })}
        </CursorCardsContainer>
      </div>
    </div>
  )
}
