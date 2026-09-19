"use client";

import { useEffect, useRef } from "react";
import { watchVisualActivity } from "@/lib/visual-activity";

export function Typewriter({ words }: { words: string[] }) {
  const root = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!root.current || !text.current || words.length === 0) return;
    const output = text.current;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let index = 0;
    let length = 0;
    let deleting = false;
    let running = false;
    let reduced = false;
    const tick = () => {
      timer = undefined;
      if (!running || reduced) return;
      const word = words[index];
      length += deleting ? -1 : 1;
      output.textContent = word.slice(0, length);
      let delay = deleting ? 40 : 75;
      if (!deleting && length >= word.length) {
        deleting = true;
        delay = 2500;
      } else if (deleting && length <= 0) {
        deleting = false;
        index = (index + 1) % words.length;
        delay = 75;
      }
      timer = setTimeout(tick, delay);
    };
    const unsubscribe = watchVisualActivity(root.current, (state) => {
      running = state.active;
      reduced = state.reducedMotion;
      root.current?.setAttribute("data-visual-paused", String(!running || reduced));
      clearTimeout(timer);
      timer = undefined;
      if (reduced) output.textContent = words[0];
      else if (running) timer = setTimeout(tick, 75);
    });
    return () => { clearTimeout(timer); unsubscribe(); };
  }, [words]);

  return (
    <span ref={root} className="inline-block">
      <span className="sr-only">{words[0]}</span>
      <span ref={text} aria-hidden="true" />
      <span aria-hidden="true" className="animate-[pulse_1s_ease-in-out_infinite] opacity-70 ml-1">|</span>
    </span>
  );
}
