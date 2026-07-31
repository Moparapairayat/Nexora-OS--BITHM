"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface NextGenBrandDividerProps {
  toBgColorClass?: string; // e.g. "fill-[#06100c] light:fill-[#fbfdfc]"
  badgeText?: string;
  className?: string;
}

export function NextGenBrandDivider({
  toBgColorClass = "fill-[#06100c] light:fill-[#fbfdfc]",
  badgeText = "NEXORA OS",
  className = "",
}: NextGenBrandDividerProps) {
  return (
    <div className={`pointer-events-none absolute left-0 right-0 bottom-0 z-20 w-full overflow-hidden leading-none select-none ${className}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes cyberLaserBeam {
          0% { stroke-dashoffset: 1440; }
          100% { stroke-dashoffset: -1440; }
        }
        .animate-laser-beam {
          stroke-dasharray: 240, 480;
          animation: cyberLaserBeam 4s linear infinite;
        }
      `}} />

      {/* SVG Container */}
      <svg
        className="relative block w-full h-14 sm:h-18 md:h-22"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cyber-glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="70%" stopColor="#a3e635" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="laser-beam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a3e635" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.2" />
          </linearGradient>

          <filter id="cyber-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Layer 1: Ambient Laser Glow Backing Ribbon */}
        <path
          d="M0,180 L0,90 C280,-15 600,180 920,70 C1200,-30 1360,150 1440,90 L1440,180 Z"
          fill="url(#cyber-glow-grad)"
          opacity="0.28"
          filter="url(#cyber-glow-filter)"
        />

        {/* Layer 2: Translucent Cyber Accenting Wave Layer */}
        <path
          d="M0,180 L0,120 C280,45 600,195 920,95 C1200,25 1360,140 1440,118 L1440,180 Z"
          fill="url(#cyber-glow-grad)"
          opacity="0.15"
        />

        {/* Layer 3: Solid Main Cut Body matching destination section background */}
        <path
          d="M0,180 L0,128 C280,38 600,205 920,105 C1200,15 1360,150 1440,128 L1440,180 Z"
          className={toBgColorClass}
        />

        {/* Layer 4: Static Base Neon Circuit Line */}
        <path
          d="M0,127 C280,37 600,204 920,104 C1200,14 1360,149 1440,127"
          stroke="url(#cyber-glow-grad)"
          strokeWidth="2.5"
          strokeOpacity="0.6"
          fill="none"
        />

        {/* Layer 5: Dynamic Running Laser Beam Animation */}
        <path
          d="M0,127 C280,37 600,204 920,104 C1200,14 1360,149 1440,127"
          stroke="url(#laser-beam-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          className="animate-laser-beam"
        />

        {/* Pulsing Particle Nodes along the curve */}
        <circle cx="280" cy="37" r="5" fill="#a3e635" className="animate-pulse" />
        <circle cx="920" cy="104" r="6" fill="#38bdf8" className="animate-pulse" />
        <circle cx="1360" cy="149" r="5" fill="#34d399" className="animate-pulse" />
      </svg>
    </div>
  );
}
