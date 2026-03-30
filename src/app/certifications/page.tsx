"use client"

import { MorphingCardStack } from "@/components/ui/morphing-card-stack";
import { Award, Medal, ShieldCheck, FileBadge, CheckCircle, Sparkles, BarChart, Cpu, Activity, Database, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const certificationsData = [
  {
    id: "data-Science-intern-millennium",
    title: "Data Science Intern from Millennium Software Solutions",
    description: "Successfully completed an intensive Data Science technical internship, transforming large-scale relational datasets into actionable insights through visualizations and reporting dashboards.",
    icon: <Activity className="h-6 w-6 text-cyan-400" />,
    color: "rgba(34, 211, 238, 0.05)",
    link: "https://drive.google.com/file/d/1DkU6kCC7Z9cTMwwdVZhKIwHAfbx5KrL9/view?usp=drive_link", // Placeholder
  },
  {
    id: "Oracle-database-intern-naresh",
    title: "Oracle database Intern from Naresh I Technology",
    description: "Completed an internship working with Oracle Database, gaining hands-on experience in managing structured data, writing SQL queries, and performing data analysis to extract meaningful insights.",
    icon: <Database className="h-6 w-6 text-indigo-400" />,
    color: "rgba(129, 140, 248, 0.05)",
    link: "https://drive.google.com/file/d/1cTpiCz320g1RrmgcIQpVXH7mhz7c-x5X/view?usp=drive_link", // Placeholder
  },
  {
    id: "ibm-data-analysis",
    title: "Data Analysis with Python by IBM",
    description: "IBM endorsed skills in analyzing data using Python. Demonstrated proficiency in utilizing pandas, NumPy, and SciPy to extract insights and prepare predictive models.",
    icon: <FileBadge className="h-6 w-6 text-blue-500" />,
    color: "rgba(5, 48, 173, 0.05)",
    link: "https://coursera.org/share/70026f7f3a9263094fc17c5bb180f286",
  },
  {
    id: "oracle-data-science",
    title: "Data Science Professional by Oracle Corp.",
    description: "Oracle recognized competence in implementing machine learning models, deploying data science environments, and managing end-to-end data processing pipelines.",
    icon: <Award className="h-6 w-6 text-red-500" />,
    color: "rgba(248, 0, 0, 0.05)",
    link: "https://catalog-education.oracle.com/pls/certview/sharebadge?id=EBEB3C0F427A22612293AF30DE09ADAB9D1371BA3DA083D7436D0086578F0150",
  },
  {
    id: "ML-coincent",
    title: "Machine Learning intern from Coincent",
    description: "Completed a course in Machine Learning with Python by Microsoft, gaining knowledge of core ML concepts, data preprocessing, model building, and evaluation techniques.",
    icon: <BrainCircuit className="h-6 w-6 text-pink-500" />,
    color: "rgba(236, 72, 153, 0.05)",
    link: "https://coincent.ai/verify-qrcode/53Zytux4cL",
  },
  {
    id: "microsoft-ai-ml",
    title: "Foundations of AI and ML by Microsoft",
    description: "Microsoft validation of foundational knowledge extending across artificial intelligence constructs, supervised and unsupervised machine learning algorithms, and cognitive analytics.",
    icon: <CheckCircle className="h-6 w-6 text-sky-400" />,
    color: "rgba(0, 164, 239, 0.05)",
    link: "https://coursera.org/share/4dbd581b7c70d08f7ca4864228a73681",
  },
  {
    id: "jpmorgan-quant",
    title: "Quantitative Research by JPM.Co",
    description: "JPMorgan program completing active market simulations focusing on quantitative financial analysis, algorithmic trading signals, and predictive forecasting pipelines.",
    icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
    color: "rgba(16, 185, 129, 0.05)",
    link: "https://www.theforage.com/completion-certificates/Sj7temL583QAYpHXD/bWqaecPDbYAwSDqJy_Sj7temL583QAYpHXD_68fb59ad407ba3d5c8270c52_1761315192272_completion_certificate.pdf",
  },
  {
    id: "the-power-of-statics",
    title: "The Power of Statistics by Google",
    description: "Completed The Power of Statistics by Google, gaining a strong understanding of core statistical concepts such as data analysis, probability, and interpreting data. Learned how to use statistics to draw insights and support data-driven decision-making.",
    icon: <BarChart className="h-6 w-6 text-emerald-400" />,
    color: "rgba(16, 185, 129, 0.05)",
    link: "https://coursera.org/share/25c95b5b9fb42ae79df2759aabe5877f",
  },
  {
    id: "Gen-ai-in-action",
    title: "Gen AI in Action by IBM",
    description: "I completed the Generative AI in Action certification from IBM SkillsBuild, where I learned the fundamentals of generative AI, including how AI models generate text and content. I gained hands-on understanding of prompt engineering, real-world AI applications, and how generative AI can be used to solve practical problems across different domains.",
    icon: <Sparkles className="h-6 w-6 text-purple-400" />,
    color: "rgba(168, 85, 247, 0.05)",
    link: "https://www.credly.com/badges/5c0bd3b7-ed3b-4cfc-b0ea-58cf18d515a2/public_url", // Placeholder
  },
  {
    id: "Generative-ai-oci",
    title: "Generative AI by Oracle Corp.",
    description: "Earned the Oracle Certified Professional certification in Generative AI, gaining a strong understanding of generative AI concepts, model capabilities, prompt engineering, and real-world applications of AI in solving practical problems.",
    icon: <Cpu className="h-6 w-6 text-red-400" />,
    color: "rgba(248, 113, 113, 0.05)",
    link: "https://catalog-education.oracle.com/pls/certview/sharebadge?id=5D85BEC04B65A067160F6F36B44E74E1E4282C0D15DC7F08F30FA88BE39BD120",
  }
];

export default function CertificationsPage() {
  return (
    <main className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 selection:bg-white/20">

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center h-full pointer-events-auto mt-20 md:mt-0">
        <div className="w-full flex justify-start mb-12 sm:mb-16">
          <Link
            href="/"
            className="text-white/50 hover:text-white transition-colors inline-flex items-center gap-2 text-sm backdrop-blur-md bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-xl"
          >
            <ArrowLeft size={16} /> Back to Hub
          </Link>
        </div>

        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-neutral-500 tracking-tight drop-shadow-sm mb-6">
            Certifications
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed font-light">
            A comprehensive record of standard professional validations, showcasing recognized expertise across cloud infrastructure, machine learning, and orchestration ecosystems.
          </p>
        </div>

        <div className="w-full flex-grow flex flex-col items-center justify-center min-h-[500px]">
          <MorphingCardStack cards={certificationsData} defaultLayout="stack" />
        </div>
      </div>
    </main>
  );
}
