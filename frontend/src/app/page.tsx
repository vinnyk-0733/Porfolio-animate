import ResumeDemo from "@/components/resume-demo";
import { ProfileHero } from "@/components/profile-hero";
import { ScrollSpy } from "@/components/scroll-spy";
import { SonarGrid } from "@/components/ui/sonar-grid";

export default function Home() {
  return (
    <main className="min-h-screen bg-black scroll-smooth">
      <ScrollSpy />
      <SonarGrid
        spacing={28}
        dotRadius={1.3}
        baseOpacity={0.25}
        color="#10b981"
        pingEvery={2.8}
        speed={260}
        ringWidth={90}
        amplitude={2.2}
        interactive={true}
        className="w-full min-h-screen bg-black text-white"
      >
        <ProfileHero />
        <div id="resume" className="min-h-screen relative flex items-center justify-center pt-8 pb-28 sm:py-0">
          <ResumeDemo />
        </div>
      </SonarGrid>
    </main>
  );
}
