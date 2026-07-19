"use client";

import { UserRound, Wrench, Briefcase, FolderGit2, GraduationCap, Award } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Summary",
    date: "Profile",
    content: (
      <div className="space-y-2">
        <p>Data Science is skilled in Python, MySQL and machine learning, with experience in data cleaning, building predictive models and work with generative models.</p>
        <p>Proficient in Pandas, NumPy, Scikit-learn, and able to integrate with the generative models. Worked on real-world NLP and data science projects, including sentiment analysis and classification systems.</p>
        <p>Strong communication, problem-solving, and collaboration skills, with a passion for using data to drive practical business decisions.</p>
      </div>
    ),
    category: "Summary",
    icon: UserRound,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
    actionUrl: "#profile",
  },
  {
    id: 2,
    title: "Skills & Interests",
    date: "Technical",
    content: (
      <div className="space-y-4">
        <div>
          <strong className="text-white block mb-1">Technical Skills</strong>
          <p className="text-white/60 leading-tight">Python, Java, Pandas, MySQL, TensorFlow(Keras), Scikit-learn, Basics of Langchain, LLMs, Fine Tuning(LoRA), Numpy</p>
        </div>
        <div>
          <strong className="text-white block mb-1">Interests</strong>
          <p className="text-white/60 leading-tight">Data analysis, Data Science, Machine Learning, Gen AI</p>
        </div>
        <div>
          <strong className="text-white block mb-1">Soft Skills</strong>
          <p className="text-white/60 leading-tight">Attention to detail, Time Management, Teamwork, Adaptability</p>
        </div>
      </div>
    ),
    category: "Skills",
    icon: Wrench,
    relatedIds: [1, 3, 4],
    status: "completed" as const,
    energy: 95,
    actionUrl: "/skills",
  },
  {
    id: 3,
    title: "Experience",
    date: "Internships",
    content: (
      <div className="space-y-4">
        <div>
          <strong className="text-white block">Millennium Software Solutions</strong>
          <span className="text-[10px] text-white/50 block mb-1">Data Science Intern (Apr 2024 - Aug 2024)</span>
          <ul className="list-disc list-inside text-white/60 space-y-1">
            <li>Optimized & transformed 1M+ records, increasing data reliability by 15%.</li>
            <li>Developed high-accuracy ML models & dashboards, boosting predictive performance by 25%.</li>
          </ul>
        </div>
        <div>
          <strong className="text-white block">Naresh I Technology</strong>
          <span className="text-[10px] text-white/50 block mb-1">Python Data Science Intern (May 2025 - Jul 2025)</span>
          <ul className="list-disc list-inside text-white/60 space-y-1">
            <li>Processed 50k+ text samples avoiding noise by 30%.</li>
            <li>Built ML models achieving 92% precision in spam detection.</li>
          </ul>
        </div>
      </div>
    ),
    category: "Experience",
    icon: Briefcase,
    relatedIds: [2],
    status: "completed" as const,
    energy: 85,
    actionUrl: "/experience",
  },
  {
    id: 4,
    title: "Projects",
    date: "Portfolio",
    content: (
      <div className="space-y-4">
        <div>
          <strong className="text-white block mb-1">Intelligent Customer Sentiment</strong>
          <p className="text-white/60 leading-tight">Developed DistilBERT sentiment analysis pipeline with an interactive dashboard to cut false positives by 20%.</p>
        </div>
        <div>
          <strong className="text-white block mb-1">EmoFusion: Emotion Assistant</strong>
          <p className="text-white/60 leading-tight">Dual-modal emotion engine fusing text sentiment and facial tracking. Integrated context-aware Mistral 3B LLM via WebSocket.</p>
        </div>
        <div>
          <strong className="text-white block mb-1">Mr. Analyst: AI Data Analyst</strong>
          <p className="text-white/60 leading-tight">Fine-tuned Qwen2.5-3B with QLoRA across 10 chart types and served via llama.cpp + FastAPI + React UI.</p>
        </div>
      </div>
    ),
    category: "Projects",
    icon: FolderGit2,
    relatedIds: [2],
    status: "completed" as const,
    energy: 90,
    actionUrl: "/projects",
  },
  {
    id: 5,
    title: "Education",
    date: "Certification",
    content: (
      <div className="space-y-4">
        <div>
          <strong className="text-white block">Gandhi Institute of Engineering</strong>
          <span className="text-[10px] text-white/50 block mb-1">B.Tech CSE (Graduation: Jul 2026)</span>
        </div>
        <div>
          <strong className="text-white block mb-1">Certifications</strong>
          <ul className="list-disc list-inside text-white/60 space-y-1">
            <li>Data Science Professional (Oracle)</li>
            <li>Data Analysis Intern</li>
            <li>Data Analysis with Python (IBM)</li>
            <li>Foundations of AI and ML (Microsoft)</li>
            <li>Quantitative Research (JPMorgan)</li>
          </ul>
        </div>
      </div>
    ),
    category: "Education",
    icon: GraduationCap,
    relatedIds: [3],
    status: "pending" as const,
    energy: 50,
    actionUrl: "/certifications"
  }
];

export function ResumeDemo() {
  return (
    <>
      <RadialOrbitalTimeline timelineData={timelineData} />
    </>
  );
}

export default ResumeDemo;
