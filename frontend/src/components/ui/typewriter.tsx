"use client";

import React, { useState, useEffect } from "react";

export function Typewriter({ words }: { words: string[] }) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const currentWord = words[wordIndex % words.length] || "";
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setText((prev) => currentWord.substring(0, prev.length - 1));
        if (text.length <= 1) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }, 40);
    } else {
      timeout = setTimeout(() => {
        setText((prev) => currentWord.substring(0, prev.length + 1));
        if (text.length >= currentWord.length) {
          timeout = setTimeout(() => setIsDeleting(true), 2200);
        }
      }, 75);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return (
    <span className="inline-block">
      <span>{text}</span>
      <span className="animate-pulse opacity-80 ml-1 text-emerald-400 font-bold">|</span>
    </span>
  );
}

export default Typewriter;
