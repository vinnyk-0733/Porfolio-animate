"use client";
import { useMotionValue, useMotionTemplate, motion, type MotionValue } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { watchVisualActivity } from "@/lib/visual-activity";

export const EvervaultBackground = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let rafId = 0;
    let listening = false;
    let bounds: DOMRect | null = null;
    let clientX = 0;
    let clientY = 0;

    const cancelFrame = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
    };
    const invalidateBounds = () => { bounds = null; };
    const updateMouse = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      // Bounds change on entry, resize, or scrolling, not on every pointer move.
      bounds ??= container.getBoundingClientRect();
      clientX = event.clientX;
      clientY = event.clientY;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!bounds) return;
        mouseX.set(clientX - bounds.left);
        mouseY.set(clientY - bounds.top);
      });
    };
    const enter = (event: PointerEvent) => {
      invalidateBounds();
      updateMouse(event);
    };
    const leave = () => {
      cancelFrame();
      invalidateBounds();
    };
    const stopListening = () => {
      container.removeEventListener("pointerenter", enter);
      container.removeEventListener("pointermove", updateMouse);
      container.removeEventListener("pointerleave", leave);
      listening = false;
      leave();
    };

    const resizeObserver = new ResizeObserver(invalidateBounds);
    resizeObserver.observe(container);
    window.addEventListener("resize", invalidateBounds, { passive: true });
    const stopWatching = watchVisualActivity(container, ({ active, touch, reducedMotion }) => {
      const enabled = active && !touch && !reducedMotion;
      container.dataset.hoverEnabled = String(enabled);
      invalidateBounds();
      if (enabled && !listening) {
        container.addEventListener("pointerenter", enter, { passive: true });
        container.addEventListener("pointermove", updateMouse, { passive: true });
        container.addEventListener("pointerleave", leave, { passive: true });
        listening = true;
      } else if (!enabled && listening) {
        stopListening();
      }
    }, { pauseOnScroll: true });

    return () => {
      stopWatching();
      stopListening();
      resizeObserver.disconnect();
      window.removeEventListener("resize", invalidateBounds);
    };
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full group/card flex-1 flex flex-col", className)}
    >
      <div className="absolute inset-0 z-0 h-full w-full bg-transparent overflow-hidden rounded-[inherit] pointer-events-none">
        <CardPattern
          mouseX={mouseX}
          mouseY={mouseY}
          randomString={patternText}
        />
      </div>
      <div className="relative z-10 w-full h-full flex-1 pointer-events-auto flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

interface CardPatternProps {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  randomString: string;
}

export const CardPattern = React.memo(function CardPattern({ mouseX, mouseY, randomString }: CardPatternProps) {
  const maskImage = useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div className="pointer-events-none h-full w-full">
      <div className="absolute inset-0 rounded-[inherit] [mask-image:linear-gradient(white,transparent)] group-data-[hover-enabled=true]/card:group-hover/card:opacity-50"></div>
      
      <motion.div
        className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-green-500 to-blue-700 opacity-0 group-data-[hover-enabled=true]/card:group-hover/card:opacity-100 backdrop-blur-sm transition duration-500"
        style={style}
      />
      
      <motion.div
        className="absolute inset-0 rounded-[inherit] opacity-0 group-data-[hover-enabled=true]/card:group-hover/card:opacity-100 mix-blend-overlay"
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

// A shared, deterministic buffer keeps the original code texture without a
// hydration update or repeatedly allocating and laying out 5,000 characters.
const codeText = pythonSnippets.join("\n") + "\n";
const patternText = codeText.repeat(Math.ceil(5000 / codeText.length)).slice(0, 5000);

export const generateRandomString = (length: number) => {
  let result = "";
  while (result.length < length) {
    result += pythonSnippets[Math.floor(Math.random() * pythonSnippets.length)] + "\n";
  }
  return result.substring(0, length);
};
