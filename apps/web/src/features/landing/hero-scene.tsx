"use client";

import { motion } from "framer-motion";

const lanes = [
  "Assignment Report",
  "Live Lab",
  "AI Code Doctor",
  "AcademicShield",
  "Skill DNA",
];

export function HeroScene() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(138,95,61,0.18),transparent_34%),linear-gradient(250deg,rgba(50,245,154,0.16),transparent_40%),linear-gradient(180deg,rgba(5,7,6,0.38),rgba(5,7,6,0.98))] light:bg-[radial-gradient(circle_at_18%_12%,rgba(184,243,79,0.18),transparent_28rem),radial-gradient(circle_at_82%_10%,rgba(7,167,93,0.16),transparent_30rem),linear-gradient(180deg,#fbfdf9_0%,#f5fbf6_55%,#edf7f1_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(5,7,6,1),transparent)] light:bg-[linear-gradient(to_top,rgba(237,247,241,0.95),transparent)]" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[920px] -translate-x-1/2 -translate-y-1/2 rotate-[-9deg] opacity-80 hidden md:block">
        <div className="grid h-full grid-cols-5 gap-3">
          {lanes.map((lane, index) => (
            <motion.div
              key={lane}
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.08, duration: 0.7 }}
              className="glass-panel flex min-w-0 flex-col justify-between rounded-lg p-4 light:border-emerald-100/70 light:bg-white/62"
            >
              <div>
                <div className="h-2 w-12 rounded-full bg-[rgba(217,255,87,0.8)] light:bg-emerald-400" />
                <div className="mt-5 h-20 rounded-md border border-white/10 bg-white/[0.04] light:border-slate-200 light:bg-emerald-50/70" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-3/4 rounded-full bg-white/18 light:bg-slate-200" />
                <div className="h-2 w-1/2 rounded-full bg-white/12 light:bg-emerald-100" />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500 light:text-slate-400">
                {lane}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <motion.div
        className="absolute inset-x-0 top-1/4 h-px bg-[rgba(217,255,87,0.3)] light:bg-emerald-300/40"
        animate={{ opacity: [0.2, 0.7, 0.2], x: ["-8%", "8%", "-8%"] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-y-0 left-1/3 w-px bg-[rgba(108,246,179,0.2)] light:bg-emerald-200/50"
        animate={{ opacity: [0.15, 0.55, 0.15], y: ["-10%", "10%", "-10%"] }}
        transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
      />
    </div>
  );
}
