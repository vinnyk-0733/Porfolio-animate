export interface ProfileData {
  name: string;
  typewriterWords: string[];
  heroTypewriterWords: string[];
  bio: string;
  heroBio: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  iconName: "BarChart3" | "Fingerprint" | "CodeIcon" | string;
  colors: string[];
  repoUrl: string;
  liveUrl: string;
  order: number;
}

export interface SkillMarker {
  id: string;
  location: [number, number];
  value: number;
  label: string;
}

export interface SkillCategory {
  title: string;
  skills: string;
}

export interface SkillsData {
  badge: string;
  heading: string;
  subheading: string;
  intro: string;
  markers: SkillMarker[];
  categories: SkillCategory[];
}

export interface CertificationItem {
  id: string;
  title: string;
  description: string;
  iconName: "Activity" | "Database" | "FileBadge" | "Award" | "BrainCircuit" | "CheckCircle" | "ShieldCheck" | "BarChart" | "Sparkles" | "Cpu" | string;
  color: string;
  link: string;
  order: number;
}

export interface WorkflowNodeData {
  id: string;
  type: "pending" | "completed";
  title: string;
  description: string;
  iconName: "GraduationCap" | "Briefcase" | "Zap" | "Settings" | "Database" | "ArrowRight" | "Webhook" | string;
  color: "emerald" | "blue" | "purple" | "amber" | "indigo" | string;
  position: { x: number; y: number };
}

export interface WorkflowConnectionData {
  from: string;
  to: string;
}

export interface ExperienceData {
  heading: string;
  subheading: string;
  nodes: WorkflowNodeData[];
  connections: WorkflowConnectionData[];
}

export interface TimelineSectionItem {
  id: number;
  title: string;
  date: string;
  category: string;
  iconName: "UserRound" | "Wrench" | "Briefcase" | "FolderGit2" | "GraduationCap" | "Award" | string;
  relatedIds: number[];
  status: "completed" | "pending";
  energy: number;
  actionUrl: string;
  details: {
    paragraphs?: string[];
    sections?: {
      title: string;
      subtitle?: string;
      items?: string[];
      text?: string;
    }[];
  };
}

export interface SocialItem {
  id: string;
  label: string;
  iconName: "Linkedin" | "Instagram" | "Github" | "LucideBackpack" | "Download" | string;
  href: string;
  download?: boolean;
}

export const defaultProfile: ProfileData = {
  name: "Vinaya Kumar",
  typewriterWords: ["I am Vinaya", "I'm an AI & ML developer."],
  heroTypewriterWords: ["I am Vinaya Kumar", "A Software developer", "A ML Engineer."],
  bio: "A Machine Learning enthusiast who loves teaching machines to understand data.",
  heroBio: "A Machine Learning enthusiast who loves teaching machines to understand data.",
};

export const defaultProjects: ProjectItem[] = [
  {
    id: "proj-1",
    title: "Intelligent Customer Sentiment",
    description: "Developed DistilBERT sentiment analysis pipeline with an interactive dashboard to drastically cut false positives by 20%.",
    iconName: "BarChart3",
    colors: ["#fca5a5", "#ef4444", "#dc2626"],
    repoUrl: "https://github.com/vinnyk-0733/text-base-emotion-recognition",
    liveUrl: "#",
    order: 1,
  },
  {
    id: "proj-2",
    title: "EmoFusion: Emotion Assistant",
    description: "Dual-modal emotion engine fusing text sentiment and facial tracking. Integrated context-aware Mistral 3B LLM via WebSocket.",
    iconName: "Fingerprint",
    colors: ["#e9d5ff", "#7dd3fc", "#38bdf8"],
    repoUrl: "https://github.com/vinnyk-0733/EmoFusion",
    liveUrl: "#",
    order: 2,
  },
  {
    id: "proj-3",
    title: "Mr. Analyst: AI Data Analyst",
    description: "Fine-tuned Qwen2.5-3B with QLoRA across 10 chart types and served via llama.cpp and FastAPI React integration.",
    iconName: "CodeIcon",
    colors: ["#bbf7d0", "#4ade80", "#16a34a"],
    repoUrl: "https://github.com/vinnyk-0733/Mr.-Analyst",
    liveUrl: "#",
    order: 3,
  },
];

export const defaultSkills: SkillsData = {
  badge: "TECH STACK",
  heading: "My Skills",
  subheading: "I specialize in intelligent systems, processing large amounts of data using Python, and fine-tuning cutting edge Generative AI models. Grab and spin the globe to view my technical proficiency loadouts across the world.",
  intro: "I specialize in intelligent systems, processing large amounts of data using Python, and fine-tuning cutting edge Generative AI models.",
  markers: [
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
  ],
  categories: [
    { title: "Data Science", skills: "Pandas, NumPy, Deep Learning Models" },
    { title: "Software Dev", skills: "Java" },
    { title: "AI Engineering", skills: "TensorFlow, Scikit, LLM Fine-Tuning, FastAPI" },
    { title: "Data Storage", skills: "MySQL, Relational Databases" },
  ],
};

export const defaultCertifications: CertificationItem[] = [
  {
    id: "data-Science-intern-millennium",
    title: "Data Science Intern from Millennium Software Solutions",
    description: "Successfully completed an intensive Data Science technical internship, transforming large-scale relational datasets into actionable insights through visualizations and reporting dashboards.",
    iconName: "Activity",
    color: "rgba(34, 211, 238, 0.05)",
    link: "https://drive.google.com/file/d/1DkU6kCC7Z9cTMwwdVZhKIwHAfbx5KrL9/view?usp=drive_link",
    order: 1,
  },
  {
    id: "Oracle-database-intern-naresh",
    title: "Oracle database Intern from Naresh I Technology",
    description: "Completed an internship working with Oracle Database, gaining hands-on experience in managing structured data, writing SQL queries, and performing data analysis to extract meaningful insights.",
    iconName: "Database",
    color: "rgba(129, 140, 248, 0.05)",
    link: "https://drive.google.com/file/d/1cTpiCz320g1RrmgcIQpVXH7mhz7c-x5X/view?usp=drive_link",
    order: 2,
  },
  {
    id: "ibm-data-analysis",
    title: "Data Analysis with Python by IBM",
    description: "IBM endorsed skills in analyzing data using Python. Demonstrated proficiency in utilizing pandas, NumPy, and SciPy to extract insights and prepare predictive models.",
    iconName: "FileBadge",
    color: "rgba(5, 48, 173, 0.05)",
    link: "https://coursera.org/share/70026f7f3a9263094fc17c5bb180f286",
    order: 3,
  },
  {
    id: "oracle-data-science",
    title: "Data Science Professional by Oracle Corp.",
    description: "Oracle recognized competence in implementing machine learning models, deploying data science environments, and managing end-to-end data processing pipelines.",
    iconName: "Award",
    color: "rgba(248, 0, 0, 0.05)",
    link: "https://catalog-education.oracle.com/pls/certview/sharebadge?id=EBEB3C0F427A22612293AF30DE09ADAB9D1371BA3DA083D7436D0086578F0150",
    order: 4,
  },
  {
    id: "ML-coincent",
    title: "Machine Learning intern from Coincent",
    description: "Completed a course in Machine Learning with Python by Microsoft, gaining knowledge of core ML concepts, data preprocessing, model building, and evaluation techniques.",
    iconName: "BrainCircuit",
    color: "rgba(236, 72, 153, 0.05)",
    link: "https://coincent.ai/verify-qrcode/53Zytux4cL",
    order: 5,
  },
  {
    id: "microsoft-ai-ml",
    title: "Foundations of AI and ML by Microsoft",
    description: "Microsoft validation of foundational knowledge extending across artificial intelligence constructs, supervised and unsupervised machine learning algorithms, and cognitive analytics.",
    iconName: "CheckCircle",
    color: "rgba(0, 164, 239, 0.05)",
    link: "https://coursera.org/share/4dbd581b7c70d08f7ca4864228a73681",
    order: 6,
  },
  {
    id: "jpmorgan-quant",
    title: "Quantitative Research by JPM.Co",
    description: "JPMorgan program completing active market simulations focusing on quantitative financial analysis, algorithmic trading signals, and predictive forecasting pipelines.",
    iconName: "ShieldCheck",
    color: "rgba(16, 185, 129, 0.05)",
    link: "https://www.theforage.com/completion-certificates/Sj7temL583QAYpHXD/bWqaecPDbYAwSDqJy_Sj7temL583QAYpHXD_68fb59ad407ba3d5c8270c52_1761315192272_completion_certificate.pdf",
    order: 7,
  },
  {
    id: "the-power-of-statics",
    title: "The Power of Statistics by Google",
    description: "Completed The Power of Statistics by Google, gaining a strong understanding of core statistical concepts such as data analysis, probability, and interpreting data. Learned how to use statistics to draw insights and support data-driven decision-making.",
    iconName: "BarChart",
    color: "rgba(16, 185, 129, 0.05)",
    link: "https://coursera.org/share/25c95b5b9fb42ae79df2759aabe5877f",
    order: 8,
  },
  {
    id: "Gen-ai-in-action",
    title: "Gen AI in Action by IBM",
    description: "I completed the Generative AI in Action certification from IBM SkillsBuild, where I learned the fundamentals of generative AI, including how AI models generate text and content. I gained hands-on understanding of prompt engineering, real-world AI applications, and how generative AI can be used to solve practical problems across different domains.",
    iconName: "Sparkles",
    color: "rgba(168, 85, 247, 0.05)",
    link: "https://www.credly.com/badges/5c0bd3b7-ed3b-4cfc-b0ea-58cf18d515a2/public_url",
    order: 9,
  },
  {
    id: "Generative-ai-oci",
    title: "Generative AI by Oracle Corp.",
    description: "Earned the Oracle Certified Professional certification in Generative AI, gaining a strong understanding of generative AI concepts, model capabilities, prompt engineering, and real-world applications of AI in solving practical problems.",
    iconName: "Cpu",
    color: "rgba(248, 113, 113, 0.05)",
    link: "https://catalog-education.oracle.com/pls/certview/sharebadge?id=5D85BEC04B65A067160F6F36B44E74E1E4282C0D15DC7F08F30FA88BE39BD120",
    order: 10,
  },
];

export const defaultExperience: ExperienceData = {
  heading: "My Experience Map",
  subheading: "A node-based technical history of my journey. Drag nodes around to explore the timeline map.",
  nodes: [
    {
      id: "node-edu",
      type: "completed",
      title: "B.Tech CSE",
      description: "Gandhi Institute of Engineering",
      iconName: "GraduationCap",
      color: "emerald",
      position: { x: 80, y: 210 },
    },
    {
      id: "node-exp1",
      type: "completed",
      title: "Millennium Solutions",
      description: "Data Science Intern (Apr - Aug 2024)",
      iconName: "Briefcase",
      color: "blue",
      position: { x: 440, y: 50 },
    },
    {
      id: "node-exp2",
      type: "completed",
      title: "Naresh I Technology",
      description: "Oracle Database (May - Jul 2025)",
      iconName: "Briefcase",
      color: "purple",
      position: { x: 440, y: 210 },
    },
    {
      id: "node-1774829864044-1",
      type: "completed",
      title: "Data Research Analyst",
      description: "search and validate the data - present",
      iconName: "Zap",
      color: "purple",
      position: { x: 440, y: 370 },
    },
  ],
  connections: [
    { from: "node-edu", to: "node-exp1" },
    { from: "node-edu", to: "node-exp2" },
    { from: "node-edu", to: "node-1774829864044-1" },
  ],
};

export const defaultTimeline: TimelineSectionItem[] = [
  {
    id: 1,
    title: "Summary",
    date: "Profile",
    category: "Summary",
    iconName: "UserRound",
    relatedIds: [2],
    status: "completed",
    energy: 100,
    actionUrl: "#profile",
    details: {
      paragraphs: [
        "Data Science is skilled in Python, MySQL and machine learning, with experience in data cleaning, building predictive models and work with generative models.",
        "Proficient in Pandas, NumPy, Scikit-learn, and able to integrate with the generative models. Worked on real-world NLP and data science projects, including sentiment analysis and classification systems.",
        "Strong communication, problem-solving, and collaboration skills, with a passion for using data to drive practical business decisions.",
      ],
    },
  },
  {
    id: 2,
    title: "Skills & Interests",
    date: "Technical",
    category: "Skills",
    iconName: "Wrench",
    relatedIds: [1, 3, 4],
    status: "completed",
    energy: 95,
    actionUrl: "/skills",
    details: {
      sections: [
        {
          title: "Technical Skills",
          text: "Python, Java, Pandas, MySQL, TensorFlow(Keras), Scikit-learn, Basics of Langchain, LLMs, Fine Tuning(LoRA), Numpy",
        },
        {
          title: "Interests",
          text: "Data analysis, Data Science, Machine Learning, Gen AI",
        },
        {
          title: "Soft Skills",
          text: "Attention to detail, Time Management, Teamwork, Adaptability",
        },
      ],
    },
  },
  {
    id: 3,
    title: "Experience",
    date: "Internships",
    category: "Experience",
    iconName: "Briefcase",
    relatedIds: [2],
    status: "completed",
    energy: 85,
    actionUrl: "/experience",
    details: {
      sections: [
        {
          title: "Millennium Software Solutions",
          subtitle: "Data Science Intern (Apr 2024 - Aug 2024)",
          items: [
            "Optimized & transformed 1M+ records, increasing data reliability by 15%.",
            "Developed high-accuracy ML models & dashboards, boosting predictive performance by 25%.",
          ],
        },
        {
          title: "Naresh I Technology",
          subtitle: "Python Data Science Intern (May 2025 - Jul 2025)",
          items: [
            "Processed 50k+ text samples avoiding noise by 30%.",
            "Built ML models achieving 92% precision in spam detection.",
          ],
        },
      ],
    },
  },
  {
    id: 4,
    title: "Projects",
    date: "Portfolio",
    category: "Projects",
    iconName: "FolderGit2",
    relatedIds: [2],
    status: "completed",
    energy: 90,
    actionUrl: "/projects",
    details: {
      sections: [
        {
          title: "Intelligent Customer Sentiment",
          text: "Developed DistilBERT sentiment analysis pipeline with an interactive dashboard to cut false positives by 20%.",
        },
        {
          title: "EmoFusion: Emotion Assistant",
          text: "Dual-modal emotion engine fusing text sentiment and facial tracking. Integrated context-aware Mistral 3B LLM via WebSocket.",
        },
        {
          title: "Mr. Analyst: AI Data Analyst",
          text: "Fine-tuned Qwen2.5-3B with QLoRA across 10 chart types and served via llama.cpp + FastAPI + React UI.",
        },
      ],
    },
  },
  {
    id: 5,
    title: "Education",
    date: "Certification",
    category: "Education",
    iconName: "GraduationCap",
    relatedIds: [3],
    status: "pending",
    energy: 50,
    actionUrl: "/certifications",
    details: {
      sections: [
        {
          title: "Gandhi Institute of Engineering",
          subtitle: "B.Tech CSE (Graduation: Jul 2026)",
        },
        {
          title: "Certifications",
          items: [
            "Data Science Professional (Oracle)",
            "Data Analysis Intern",
            "Data Analysis with Python (IBM)",
            "Foundations of AI and ML (Microsoft)",
            "Quantitative Research (JPMorgan)",
          ],
        },
      ],
    },
  },
];

export const defaultSocials: SocialItem[] = [
  {
    id: "soc-1",
    label: "LinkedIn",
    iconName: "Linkedin",
    href: "https://www.linkedin.com/in/vinaya-kumar-49472031b/",
  },
  {
    id: "soc-2",
    label: "Instagram",
    iconName: "Instagram",
    href: "https://www.instagram.com/vinnyk__073?igsh=YjY0bW8zb3k0Z3E1",
  },
  {
    id: "soc-3",
    label: "GitHub",
    iconName: "Github",
    href: "https://github.com/vinnyk-0733",
  },
  {
    id: "soc-4",
    label: "My Dinq",
    iconName: "LucideBackpack",
    href: "https://dinq.me/admin/mydinq?domain=vinaya",
  },
  {
    id: "soc-5",
    label: "Download Resume",
    iconName: "Download",
    href: "https://drive.google.com/file/d/1bmiGMIKuHn1kB2iZQuj2pjgPNahXe9BB/view?usp=drive_link",
    download: true,
  },
];
