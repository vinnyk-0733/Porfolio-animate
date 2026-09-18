"use client";

import { useEffect, useRef, useState } from "react";

/** One cancellable timer, active only while this heading is on screen. */
export function Typewriter({ words }: { words: string[] }) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(words[0] ?? "");

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !words.length) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let wordIndex = 0;
    let characterCount = words[0].length;
    let deleting = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const cancel = () => {
      clearTimeout(timer);
      timer = undefined;
    };
    const tick = () => {
      const word = words[wordIndex];
      characterCount += deleting ? -1 : 1;
      setText(word.slice(0, Math.max(0, characterCount)));
      let delay = deleting ? 45 : 80;
      if (deleting && characterCount <= 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 200;
      } else if (!deleting && characterCount >= word.length) {
        deleting = true;
        delay = 2500;
      }
      timer = setTimeout(tick, delay);
    };
    const update = () => {
      cancel();
      if (motionPreference.matches) {
        setText(words[0]);
      } else if (visible && !document.hidden && words.length > 1) {
        timer = setTimeout(tick, 2500);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    motionPreference.addEventListener("change", update);

    return () => {
      cancel();
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      motionPreference.removeEventListener("change", update);
    };
  }, [words]);

  return (
    <span ref={elementRef} className="grid min-w-0 max-w-full break-words">
      {/* Reserve the tallest phrase so typing never shifts the content below. */}
      {words.map((word, index) => (
        <span key={index} aria-hidden="true" className="invisible col-start-1 row-start-1">
          {word}<span className="ml-1">|</span>
        </span>
      ))}
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {text}<span className="ml-1 opacity-70">|</span>
      </span>
      <span className="sr-only">{words.join(". ")}</span>
    </span>
  );
}
