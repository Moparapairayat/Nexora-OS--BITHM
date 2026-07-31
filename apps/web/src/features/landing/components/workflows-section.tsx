"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  FileCheck2,
  Lightbulb,
  PenTool,
} from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "./landing-primitives";
import { NextGenBrandDivider } from "./nextgen-brand-divider";

type WorkflowFeature = {
  title: string;
  description: string;
  icon: any;
  customImage?: string;
};

const workflowFeatures: WorkflowFeature[] = [
  {
    title: "Understand & Start",
    description:
      "Break down your task prompt immediately and dive straight into coding without tricky setup steps.",
    icon: Lightbulb,
    customImage: "/landing/icons/plan-start.png",
  },
  {
    title: "Build & Auto-Save",
    description:
      "Focus on writing code. Every test run, terminal output, and revision is automatically saved as you go.",
    icon: PenTool,
    customImage: "/landing/icons/build-code.png",
  },
  {
    title: "Review & Refine",
    description:
      "Receive clear inline feedback from teachers, fix issues on the spot, and polish your work effortlessly.",
    icon: Brain,
    customImage: "/landing/icons/review-refine.png",
  },
  {
    title: "Instant Submission",
    description:
      "Submit your completed lab work in one click with a verified digital receipt and total peace of mind.",
    icon: CheckCircle2,
    customImage: "/landing/icons/one-click-submission.png",
  },
];

export function WorkflowsSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#06100c] px-5 py-20 light:bg-[#fbfdfc] sm:py-24 md:px-8"
    >
      {/* Next-Gen Brand Divider with Running Laser & HUD Seal */}
      <NextGenBrandDivider toBgColorClass="fill-[#020906] light:fill-[#f8fcf9]" badgeText="HOW IT WORKS" />
      {/* 3D Script Font Style */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

        .font-3d-neon-script {
          font-family: 'Pacifico', cursive;
          background: linear-gradient(180deg, #f7fee7 0%, #bef264 35%, #84cc16 70%, #3f6212 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.5))
                  drop-shadow(0px 0px 12px rgba(190, 242, 100, 0.5));
          line-height: 1.35;
          padding: 0.15em 0.25em 0.35em;
          display: inline-block;
        }

        .light .font-3d-neon-script {
          background: linear-gradient(180deg, #047857 0%, #065f46 50%, #064e3b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0px 1px 3px rgba(5, 150, 105, 0.2));
        }
      `}} />

      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -left-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px] light:bg-emerald-500/6" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Pill Badge, Title, Subtitle & 2x2 Feature Grid */}
          <div className="lg:col-span-7">
            <ScrollReveal>
              <div>
                {/* 3D Volumetric Script "How It Works" Headline */}
                <div className="mb-2 overflow-visible inline-flex items-center justify-start max-w-full">
                  <span className="font-3d-neon-script text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-wide transform -rotate-2 select-none">
                    How It Works
                  </span>
                </div>

                {/* Main Heading */}
                <h2 className="text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[44px] light:text-slate-900">
                  A clear path from task brief to final submission
                </h2>

                {/* Subtitle */}
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base light:text-slate-600">
                  Understand your prompt, build your solution, track teacher feedback, and submit your work with total confidence — all in one connected workspace.
                </p>
              </div>

              {/* 2x2 Feature Grid matching photo styling */}
              <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
                {workflowFeatures.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="group flex items-start gap-4 transition-transform duration-300 hover:translate-x-1"
                    >
                      {/* Circular Icon Container */}
                      <div className="flex h-16 w-16 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-[#0e241c] text-emerald-400 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:bg-emerald-900/60 light:border-transparent light:bg-[#e2efe9] light:text-[#1b5042] light:group-hover:bg-[#d4e8df]">
                        {item.customImage ? (
                          <Image
                            src={item.customImage}
                            alt={item.title}
                            width={36}
                            height={36}
                            className="h-8.5 w-8.5 sm:h-9 sm:w-9 object-contain"
                          />
                        ) : (
                          <IconComponent className="h-7.5 w-7.5 sm:h-8 sm:w-8 stroke-[2.2]" />
                        )}
                      </div>

                      {/* Text Content */}
                      <div className="pt-0.5">
                        <h3 className="text-base sm:text-lg font-bold text-white transition-colors group-hover:text-emerald-300 light:text-slate-900 light:group-hover:text-[#1b5042]">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm leading-snug text-slate-400 light:text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Link / Button */}
              <div className="mt-10 flex items-center gap-4">
                <Link
                  href="/login"
                  className="group relative z-10 inline-flex items-center gap-3.5 rounded-full border border-emerald-400/40 bg-[#044b3b] pl-6 pr-2 py-2 text-sm sm:text-base font-extrabold !text-white shadow-[0_12px_28px_rgba(4,75,59,0.4)] transition-all duration-300 hover:scale-[1.03] hover:bg-[#033b2e] hover:border-emerald-300/60 active:scale-[0.98]"
                >
                  <span>Explore How It Works</span>
                  <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#ff5500] text-white shadow-[0_4px_12px_rgba(255,85,0,0.4)] transition-transform duration-300 group-hover:scale-105 group-hover:translate-x-0.5 shrink-0">
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </span>
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Exact Photo Image Showcase with Circular Images & Orange Badge */}
          <div className="relative flex justify-center lg:col-span-5">
            <ScrollReveal delay={150} className="relative w-full max-w-[480px]">
              {/* Giant Outer Sage Accent Ring behind main circle */}
              <div className="absolute top-4 right-0 h-[360px] w-[360px] sm:h-[440px] sm:w-[440px] rounded-full border-[18px] sm:border-[26px] border-emerald-900/30 bg-emerald-950/20 pointer-events-none -z-10 light:border-[#e2efe9] light:bg-[#e2efe9]/40" />

              {/* Central Main Circular Frame */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 mx-auto h-[310px] w-[310px] sm:h-[390px] sm:w-[390px] overflow-hidden rounded-full border-4 sm:border-8 border-[#08130e] bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] light:border-white light:bg-slate-100 light:shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
              >
                <Image
                  src="/landing/workflows/choose-1.png"
                  alt="Student working on task"
                  fill
                  className="object-cover object-center"
                  priority
                />
              </motion.div>

              {/* Floating Top-Left Circle Image */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 left-0 sm:-top-8 sm:-left-4 z-20 h-28 w-28 sm:h-40 sm:w-40 overflow-hidden rounded-full border-4 sm:border-6 border-[#08130e] bg-slate-900 shadow-xl transition-transform duration-300 hover:scale-105 light:border-white light:bg-slate-100"
              >
                <Image
                  src="/landing/workflows/choose-2.png"
                  alt="Student writing in notebook"
                  fill
                  className="object-cover object-center"
                />
              </motion.div>

              {/* Floating Bottom-Left Circle Image */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 5.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute -bottom-4 left-2 sm:-bottom-8 sm:-left-6 z-20 h-32 w-32 sm:h-44 sm:w-44 overflow-hidden rounded-full border-4 sm:border-6 border-[#08130e] bg-slate-900 shadow-xl transition-transform duration-300 hover:scale-105 light:border-white light:bg-slate-100"
              >
                <Image
                  src="/landing/workflows/choose-3.png"
                  alt="Group discussion and work"
                  fill
                  className="object-cover object-center"
                />
              </motion.div>

              {/* Right Side Floating Orange Metric Card (Nexora OS Context) */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
                className="absolute top-1/2 -right-3 sm:-right-8 -translate-y-1/2 z-30 flex items-center gap-3.5 rounded-2xl bg-[#ff5500] px-4 py-3.5 sm:px-5 sm:py-4.5 text-white shadow-[0_16px_36px_rgba(255,85,0,0.35)] transition-transform duration-300 hover:scale-105"
              >
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  100%
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white/95 leading-tight max-w-[110px]">
                  Connected Workflows.
                </span>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

