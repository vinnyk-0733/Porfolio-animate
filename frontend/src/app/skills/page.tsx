"use client"

import dynamic from "next/dynamic"
import type { BarMarker } from "@/components/ui/cobe-globe-bars"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const GlobeBars = dynamic(
  () => import("@/components/ui/cobe-globe-bars").then((mod) => mod.GlobeBars),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    ),
  }
);

const technicalSkills: BarMarker[] = [
  { id: "skl-1", location: [37.77, -122.41], value: 85, label: "PYTHON" },
  { id: "skl-2", location: [40.71, -74.01], value: 70, label: "GENERATIVE AI" },
  { id: "skl-3", location: [60.16, 24.93], value: 75, label: "FINE TUNING(LoRA)" },
  { id: "skl-4", location: [19.43, -99.13], value: 80, label: "PANDAS" },
  { id: "skl-5", location: [-41.28, 174.77], value: 78, label: "DEEP LEARNING" },
  { id: "skl-6", location: [1.35, 103.82], value: 78, label: "FastAPI" },
  { id: "skl-7", location: [-14.23, -51.92], value: 50, label: "JAVA" },
  { id: "skl-8", location: [51.51, -0.13], value: 70, label: "DATA STRUCTURE" },
  { id: "skl-9", location: [35.68, 139.65], value: 80, label: "MACHINE LEARNING" },
  { id: "skl-10", location: [12.97, 77.59], value: 70, label: "MySQL/DATABASE" },
  { id: "skl-11", location: [-33.86, 151.20], value: 65, label: "TENSORFLOW(Keras)" },
  { id: "skl-12", location: [-30.55, 22.93], value: 85, label: "SCIKIT-LEARN" },
]

export default function SkillsPage() {
  return (
    <main className="relative min-h-screen bg-black overflow-hidden flex flex-col md:flex-row items-center justify-center p-6 sm:p-12 md:p-24 selection:bg-white/20">



      {/* Top Left Navigation Header */}
      <div className="absolute top-8 left-8 z-20 pointer-events-auto">
        <Link
          href="/#resume"
          className="text-white/50 hover:text-white transition-colors inline-flex items-center gap-2 text-sm backdrop-blur-md bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-xl"
        >
          <ArrowLeft size={16} /> Back to Hub
        </Link>
      </div>

      {/* Main Split Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24 h-full pointer-events-auto mt-20 md:mt-0">

        {/* Left Column Text Content */}
        <div className="flex flex-col justify-center max-w-xl shrink-0 w-full md:w-1/2 space-y-6">
          <Badge className="w-fit bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1">TECH STACK</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-4">
            My <span className="text-emerald-400">Skills</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl leading-relaxed">
            I specialize in intelligent systems, processing large amounts of data using <strong className="text-white">Python</strong>, and fine-tuning cutting edge <strong className="text-white">Generative AI models</strong>. Grab and spin the globe to view my technical proficiency loadouts across the world.
          </p>

          <div className="pt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg">
              <h3 className="text-white font-bold mb-1">Data Science</h3>
              <p className="text-sm text-neutral-400">Pandas, NumPy, Deep Learning Models</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg">
              <h3 className="text-white font-bold mb-1">Software Dev</h3>
              <p className="text-sm text-neutral-400">Java</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg">
              <h3 className="text-white font-bold mb-1">AI Engineering</h3>
              <p className="text-sm text-neutral-400">TensorFlow, Scikit, LLM Fine-Tuning, FastAPI</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg">
              <h3 className="text-white font-bold mb-1">Data Storage</h3>
              <p className="text-sm text-neutral-400">MySQL, Relational Databases</p>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Interactive Cobe Globe */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
          <GlobeBars markers={technicalSkills} className="w-full max-w-xl aspect-square drop-shadow-[0_0_50px_rgba(52,211,152,0.2)]" />
        </div>

      </div>
    </main>
  )
}
