import ResumeDemo from "@/components/resume-demo";
import { ProfileHero } from "@/components/profile-hero";
import { ScrollSpy } from "@/components/scroll-spy";

export default function Home() {
  return (
    <main className="min-h-screen bg-black scroll-smooth">
      <ScrollSpy />
      <ProfileHero />
      <div id="resume" className="min-h-screen relative">
        <ResumeDemo />
      </div>
    </main>
  );
}
