"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const N8nWorkflowBlock = dynamic(
  () => import("@/components/ui/n8n-workflow-block-shadcnui").then((mod) => mod.N8nWorkflowBlock),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    ),
  }
);

export default function ExperiencePage() {
  return (
    <main className="relative min-h-screen bg-black overflow-y-auto overflow-x-hidden flex flex-col p-4 sm:p-6 md:p-8 selection:bg-white/20 pb-28 md:pb-32">

      {/* Top Left Navigation Header */}
      <div className="absolute top-6 left-6 z-20 pointer-events-auto">
        <Link
          href="/#resume"
          className="text-white/50 hover:text-white transition-colors inline-flex items-center gap-2 text-sm backdrop-blur-md bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-xl"
        >
          <ArrowLeft size={16} /> Back to Hub
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col flex-1 pointer-events-auto mt-12 md:mt-8">
        <div className="text-center space-y-1 sm:space-y-2 mb-3 sm:mb-4 shrink-0">
           <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              My <span className="text-emerald-400">Experience</span> Map
           </h1>
           <p className="text-neutral-400 max-w-2xl mx-auto text-xs sm:text-sm md:text-base">
             A node-based technical history of my journey. Drag nodes around to explore the timeline map.
           </p>
        </div>

        <div className="w-full flex-1 flex flex-col items-center">
          <N8nWorkflowBlock />
        </div>
      </div>
    </main>
  )
}
