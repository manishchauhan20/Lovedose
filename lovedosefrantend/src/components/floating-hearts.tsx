"use client";

import { motion } from "framer-motion";

const hearts = [
  { left: "8%", top: "16%", delay: 0, duration: 8, size: "text-xl", blur: "" },
  { left: "20%", top: "72%", delay: 1.1, duration: 10, size: "text-2xl", blur: "blur-[1px]" },
  { left: "48%", top: "10%", delay: 2.2, duration: 9, size: "text-lg", blur: "" },
  { left: "74%", top: "18%", delay: 0.8, duration: 11, size: "text-3xl", blur: "blur-[1px]" },
  { left: "86%", top: "70%", delay: 1.8, duration: 9.5, size: "text-xl", blur: "" },
  { left: "58%", top: "82%", delay: 0.5, duration: 10.5, size: "text-2xl", blur: "" },
];

export function FloatingHearts() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={`${heart.left}-${heart.top}`}
          initial={{ opacity: 0, y: 24, scale: 0.8 }}
          animate={{
            opacity: [0.18, 0.42, 0.18],
            y: [0, -24, 0],
            x: [0, 12, -8, 0],
            scale: [0.9, 1.1, 0.95],
          }}
          transition={{
            delay: heart.delay,
            duration: heart.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className={`absolute ${heart.size} ${heart.blur} text-rose-300/80`}
          style={{ left: heart.left, top: heart.top }}
        >
          ❤
        </motion.div>
      ))}
    </div>
  );
}
