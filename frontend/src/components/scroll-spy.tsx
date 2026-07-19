"use client";

import { useEffect } from "react";

export function ScrollSpy() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            // Update the URL without refreshing the page or causing a re-render
            if (id === "profile") {
              window.history.replaceState(null, "", "/");
            } else if (id === "resume") {
              window.history.replaceState(null, "", "/#resume");
            }
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the section is visible
    );

    const profileEl = document.getElementById("profile");
    const resumeEl = document.getElementById("resume");

    if (profileEl) observer.observe(profileEl);
    if (resumeEl) observer.observe(resumeEl);

    return () => observer.disconnect();
  }, []);

  return null;
}
