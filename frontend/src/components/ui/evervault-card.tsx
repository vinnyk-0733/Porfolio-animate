"use client";
import { useMotionValue, useMotionTemplate, motion } from "framer-motion";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export const EvervaultBackground = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [randomString, setRandomString] = useState("");
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setRandomString(generateRandomString(5000));
  }, []);

  const onMouseMove = useCallback(({ currentTarget, clientX, clientY }: React.MouseEvent) => {
    // Throttle mouse tracking to every animation frame
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    });
  }, [mouseX, mouseY]);

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      onMouseMove={onMouseMove}
      className={cn("relative w-full h-full group/card flex-1 flex flex-col", className)}
    >
      <div className="absolute inset-0 z-0 h-full w-full bg-transparent overflow-hidden rounded-[inherit] pointer-events-none">
        <CardPattern
          mouseX={mouseX}
          mouseY={mouseY}
          randomString={randomString}
        />
      </div>
      <div className="relative z-10 w-full h-full flex-1 pointer-events-auto flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export const CardPattern = React.memo(function CardPattern({ mouseX, mouseY, randomString }: any) {
  let maskImage = useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`;
  let style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div className="pointer-events-none h-full w-full">
      <div className="absolute inset-0 rounded-[inherit] [mask-image:linear-gradient(white,transparent)] group-hover/card:opacity-50"></div>
      
      <motion.div
        className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-green-500 to-blue-700 opacity-0 group-hover/card:opacity-100 backdrop-blur-sm transition duration-500"
        style={style}
      />
      
      <motion.div
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover/card:opacity-100 mix-blend-overlay"
        style={style}
      >
        <p className="absolute inset-x-0 text-[10px] sm:text-[11px] leading-[1.4] h-full break-words whitespace-pre-wrap text-white font-mono font-bold transition duration-500 overflow-hidden columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-8 gap-4 px-4 pt-4">
          {randomString}
        </p>
      </motion.div>
    </div>
  );
});

const pythonSnippets = [
  "def calculate_metrics(data):",
  "    return sum(data) / len(data)",
  "import numpy as np",
  "import pandas as pd",
  "import torch",
  "import torch.nn as nn",
  "class Model(nn.Module):",
  "    def __init__(self, depth=10):",
  "        super(Model, self).__init__()",
  "        self.depth = depth",
  "model = Sequential([",
  "    Dense(64, activation='relu'),",
  "    Dropout(0.2)",
  "])",
  "def fetch_api(url, params):",
  "    response = requests.get(url, params=params)",
  "    return response.json()",
  "with open('dataset.json', 'r') as f:",
  "    reader = json.load(f)",
  "for row in data:",
  "    process_data(row['id'])",
  "if __name__ == '__main__':",
  "    main()",
  "def get_user_by_id(db, user_id: int):",
  "    return db.query(User).filter(User.id == user_id).first()",
  "yield item.value",
  "try:",
  "    await asyncio.sleep(1)",
  "except asyncio.CancelledError:",
  "    pass",
  "@dataclass",
  "class Config:",
  "    api_key: str",
  "    timeout: int = 30",
  "df = pd.DataFrame(data)",
  "df.groupby('category').mean()",
  "assert len(data) > 0",
];

export const generateRandomString = (length: number) => {
  let result = "";
  while (result.length < length) {
    result += pythonSnippets[Math.floor(Math.random() * pythonSnippets.length)] + "\n";
  }
  return result.substring(0, length);
};
