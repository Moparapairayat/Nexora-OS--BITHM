"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  Layers3,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { NexoraLogo } from "@/components/brand/nexora-logo";
import { DemoLoginButtons } from "@/features/auth/demo-login-buttons";
import { PandaCTA } from "@/components/ui/panda-cta";
import { PandaChat } from "@/components/ui/panda-chat";
import { LandingNav } from "./components/landing-nav";
import { ScrollReveal, SectionHeading } from "./components/landing-primitives";
import { WorkflowsSection } from "./components/workflows-section";
import { WhyNexoraSection } from "./components/why-nexora-section";
import { TeamShowcaseSection } from "./components/team-showcase-section";
import { NextGenBrandDivider } from "./components/nextgen-brand-divider";
import { NextGenFooter } from "./components/nextgen-footer";
import { toolCardStyles } from "./landing-theme";

const cardShape: Record<string, string> = {
  violet: "border-violet-300/30",
  emerald: "border-emerald-300/30",
  cyan: "border-cyan-300/30",
  amber: "border-amber-300/30",
  rose: "border-rose-300/30",
  sky: "border-sky-300/30",
  orange: "border-orange-300/30",
};

const cardRingFrom: Record<string, string> = {
  violet: "from-violet-400/70",
  emerald: "from-emerald-400/70",
  cyan: "from-cyan-400/70",
  amber: "from-amber-400/70",
  rose: "from-rose-400/70",
  sky: "from-sky-400/70",
  orange: "from-orange-400/70",
};

const cardDot: Record<string, string> = {
  violet: "bg-violet-300",
  emerald: "bg-emerald-300",
  cyan: "bg-cyan-300",
  amber: "bg-amber-300",
  rose: "bg-rose-300",
  sky: "bg-sky-300",
  orange: "bg-orange-300",
};

const cardGlow: Record<string, string> = {
  violet: "bg-violet-500/20",
  emerald: "bg-emerald-500/20",
  cyan: "bg-cyan-500/20",
  amber: "bg-amber-500/20",
  rose: "bg-rose-500/20",
  sky: "bg-sky-500/20",
  orange: "bg-orange-500/20",
};

const platformAreas = [
  {
    title: "Student essentials",
    detail: "Core student dashboard and notices.",
    icon: GraduationCap,
    tone: "bg-violet-500/10 text-violet-300 light:bg-violet-50 light:text-violet-700",
    tools: ["Dashboard", "Activity", "Notifications"],
  },
  {
    title: "Academic work",
    detail: "Follow coursework and feedback.",
    icon: BookOpen,
    tone: "bg-emerald-500/10 text-emerald-300 light:bg-emerald-50 light:text-emerald-700",
    tools: [
      "Assignment Reports",
      "Lab Classes",
      "Lab Reports",
      "My Submissions",
      "Teacher Feedback",
    ],
  },
  {
    title: "AI workspace",
    detail: "AI tools for planning and code.",
    icon: Layers3,
    tone: "bg-cyan-500/10 text-cyan-300 light:bg-cyan-50 light:text-cyan-700",
    tools: [
      "AI Project Architect",
      "AI Code Doctor",
      "AI Feedback Engine",
      "AI Brief Analyzer",
    ],
  },
  {
    title: "Developer tools",
    detail: "Write code and inspect databases.",
    icon: Code2,
    tone: "bg-amber-500/10 text-amber-300 light:bg-amber-50 light:text-amber-700",
    tools: [
      "Code Lab",
      "Database Visualizer",
      "ERD to Code",
      "API Tester",
      "GitHub Analyzer",
      "Deployment Assistant",
    ],
  },
  {
    title: "ML & data",
    detail: "Prepare datasets and ML work.",
    icon: Database,
    tone: "bg-rose-500/10 text-rose-300 light:bg-rose-50 light:text-rose-700",
    tools: ["Dataset Manager", "ML Studio", "AutoML Assistant", "ML Reports"],
  },
  {
    title: "Content studio",
    detail: "Create slides and documents.",
    icon: FileCheck2,
    tone: "bg-sky-500/10 text-sky-300 light:bg-sky-50 light:text-sky-700",
    tools: [
      "Slide Maker",
      "Documentation Generator",
      "Research Assistant",
      "OCR Document Reader",
    ],
  },
  {
    title: "AcademicShield",
    detail: "Check originality and citations.",
    icon: ShieldCheck,
    tone: "bg-orange-500/10 text-orange-300 light:bg-orange-50 light:text-orange-700",
    tools: [
      "Plagiarism Checker",
      "Web Source Scan",
      "AI Writing Risk",
      "Academic Rewrite",
      "Citation Generator",
      "Originality Reports",
    ],
  },
  {
    title: "Portfolio & skills",
    detail: "Track skills and portfolios.",
    icon: BarChart3,
    tone: "bg-lime-500/10 text-lime-300 light:bg-lime-50 light:text-lime-700",
    tools: [
      "Portfolio Builder",
      "Skill DNA",
      "Learning Roadmap",
      "Achievements",
    ],
  },
  {
    title: "Feedback",
    detail: "Track feedback and changes.",
    icon: UsersRound,
    tone: "bg-fuchsia-500/10 text-fuchsia-300 light:bg-fuchsia-50 light:text-fuchsia-700",
    tools: ["Feedback Center", "Fix Requests"],
  },
];

const latestAreas = [
  {
    label: "Available now",
    title: "Code Lab workspace",
    detail:
      "Write and test code with an editor, console, file explorer, and saved drafts.",
    icon: Code2,
  },
  {
    label: "Available now",
    title: "Database Visualizer",
    detail:
      "View DBML, SQL DDL, Prisma, or Mongoose schemas as an interactive ERD.",
    icon: Database,
  },
  {
    label: "Academic integrity",
    title: "AcademicShield",
    detail:
      "Review matched sources, citation gaps, originality, and writing-risk indicators.",
    icon: ShieldCheck,
  },
  {
    label: "Role based",
    title: "Connected dashboards",
    detail: "Each role sees the information and controls relevant to its work.",
    icon: UsersRound,
  },
];

const availableCardThemes = [
  {
    surface: "bg-[#31270f] text-[#fff5ce] light:bg-[#f5d77f] light:text-[#16130c]",
    foreground: "text-[#fff5ce] light:text-[#16130c]",
    icon: "text-[#fff5ce] light:text-black",
    muted: "text-[#fff5ce]/70 light:text-black/65",
    decor: "text-[#f5d77f]/55 light:text-white/90",
  },
  {
    surface: "bg-[#2b1c5c] text-white light:bg-[#7048e8] light:text-white",
    foreground: "text-white",
    icon: "text-white light:text-black",
    muted: "text-white/72",
    decor: "text-white/45 light:text-white/85",
  },
  {
    surface: "bg-[#302345] text-[#f5e9ff] light:bg-[#dbc1f5] light:text-[#181020]",
    foreground: "text-[#f5e9ff] light:text-[#181020]",
    icon: "text-[#f5e9ff] light:text-black",
    muted: "text-[#f5e9ff]/70 light:text-[#181020]/65",
    decor: "text-[#dbc1f5]/45 light:text-white/85",
  },
  {
    surface: "bg-[#073c33] text-white light:bg-[#087f6e] light:text-white",
    foreground: "text-white",
    icon: "text-white light:text-black",
    muted: "text-white/70",
    decor: "text-[#57d6bc]/45 light:text-white/85",
  },
] as const;



const faqs = [
  {
    question: "Who can use Nexora OS?",
    answer:
      "Nexora OS has dedicated workspaces for students, teachers, and administrators. Each role only sees the pages and actions relevant to their work.",
  },
  {
    question: "Can students write and run code in the platform?",
    answer:
      "Yes. Code Lab provides a browser-based editor, console, test workflow, files, and draft saving for practical programming tasks.",
  },
  {
    question: "Does the platform support database design?",
    answer:
      "Yes. Database Visualizer accepts common schema formats and turns them into an interactive relationship diagram that can be inspected and exported.",
  },
  {
    question: "Are all modules available now?",
    answer:
      "Core dashboards and selected tools are available. Modules still in development are clearly marked as Coming Soon instead of showing simulated functionality.",
  },
];

export function LandingPage() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const [downloadStates, setDownloadStates] = useState<Record<string, string>>({});

  const handleDownloadSimulate = (platform: string) => {
    if (downloadStates[platform]) return;

    setDownloadStates(prev => ({ ...prev, [platform]: "Downloading..." }));

    setTimeout(() => {
      setDownloadStates(prev => ({ ...prev, [platform]: "Completed" }));
      setTimeout(() => {
        setDownloadStates(prev => {
          const updated = { ...prev };
          delete updated[platform];
          return updated;
        });
      }, 3000);
    }, 2000);
  };
  // Safe-scrolling helpers to temporarily bypass CSS scroll snap conflicts
  const safeScroll = (amount: number) => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.classList.remove("snap-x", "snap-mandatory");
    slider.scrollBy({ left: amount, behavior: "smooth" });

    setTimeout(() => {
      if (sliderRef.current) {
        sliderRef.current.classList.add("snap-x", "snap-mandatory");
      }
    }, 600);
  };

  const safeScrollTo = (position: number) => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.classList.remove("snap-x", "snap-mandatory");
    slider.scrollTo({ left: position, behavior: "smooth" });

    setTimeout(() => {
      if (sliderRef.current) {
        sliderRef.current.classList.add("snap-x", "snap-mandatory");
      }
    }, 600);
  };

  // Auto-scrolling system & Global drag safety
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDown.current = false;
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDown.current || !sliderRef.current) return;
      e.preventDefault();
      const x = e.pageX - sliderRef.current.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      sliderRef.current.scrollLeft = scrollLeftVal.current - walk;
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);

    if (isHovered || isDown.current) return;

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        // Check if we are at the end
        if (scrollLeft >= scrollWidth - clientWidth - 25) {
          safeScrollTo(0);
        } else {
          // Scroll by one card width (350px card + 20px gap = 370px)
          safeScroll(370);
        }
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isHovered]);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      const amount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      safeScroll(amount);
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      // Scroll progress percentage
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);
      }

      // Active card index (1-based, out of 9)
      const cardWidth = 350 + 20; // card width + gap
      const index = Math.min(
        Math.max(Math.round(scrollLeft / cardWidth) + 1, 1),
        9
      );
      setActiveIdx(index);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDown.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftVal.current = sliderRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_50%_0%,rgba(var(--theme-accent-primary-rgb-raw),0.13),transparent_42rem),radial-gradient(circle_at_92%_32%,rgba(20,184,108,0.07),transparent_30rem),linear-gradient(180deg,rgba(18,24,21,0.98)_0%,rgba(7,13,10,0.99)_38%,rgba(5,7,6,1)_100%)] text-white light:bg-[radial-gradient(circle_at_12%_85%,rgba(252,228,198,0.55),transparent_42%),radial-gradient(circle_at_88%_12%,rgba(195,236,220,0.65),transparent_45%),linear-gradient(130deg,#fcf8f3_0%,#f5faf7_50%,#f2f8f5_100%)] light:text-[#15251f]">
      <div className="absolute inset-0 bg-dot-grid pointer-events-none z-0" />
      <LandingNav />

      {/* HERO SECTION */}
      <section id="about" className="landing-hero relative overflow-hidden pb-16 pt-32 sm:pt-36 lg:pb-20">
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
        ` }} />

        <div className="landing-hero-arc-left nexora-brand-arc pointer-events-none absolute w-[320px] h-[320px] -left-[240px] top-[-60px] -rotate-12 opacity-60 sm:w-[480px] sm:h-[480px] sm:-left-[360px] sm:top-[-90px] sm:opacity-70 md:w-[560px] md:h-[560px] md:-left-[420px] md:top-[-100px] xl:w-[620px] xl:h-[620px] xl:-left-[455px] xl:top-[-120px] xl:opacity-75" />
        <div className="landing-hero-arc-right nexora-brand-arc pointer-events-none absolute w-[340px] h-[340px] -right-[260px] bottom-[-70px] rotate-[148deg] opacity-50 sm:w-[520px] sm:h-[520px] sm:-right-[400px] sm:bottom-[-100px] sm:opacity-55 md:w-[600px] md:h-[600px] md:-right-[450px] md:bottom-[-110px] xl:w-[680px] xl:h-[680px] xl:-right-[490px] xl:bottom-[-150px] xl:opacity-65" />
        <div className="pointer-events-none absolute -left-36 -bottom-10 z-0 h-[540px] w-[540px] rounded-full bg-amber-400/10 blur-[140px] light:bg-[#fce5cb]/80" />
        <div className="pointer-events-none absolute -right-36 -top-10 z-0 h-[580px] w-[580px] rounded-full bg-emerald-500/15 blur-[150px] light:bg-[#c9ead9]/85" />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 md:grid-cols-2 md:px-8 lg:gap-16">
          <div className="relative w-full max-w-[560px]">

            <div className="mb-2 overflow-visible inline-block">
              <span className="font-3d-neon-script text-sm sm:text-base font-normal tracking-wide select-none !py-0 !px-0">
                Nexora OS · BITHM Academic Platform
              </span>
            </div>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[54px] text-white light:text-slate-800">
              A practical place to{" "}
              <span className="bg-gradient-to-r from-accent-secondary to-accent-primary bg-clip-text text-transparent light:from-emerald-700 light:to-emerald-500">
                study, build, and submit
              </span>{" "}
              your work.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 light:text-slate-600 sm:text-lg">
              Keep assignments, lab work, coding tools, feedback, and course
              administration close at hand.
            </p>

            <div className="relative mt-8 flex flex-wrap items-center gap-4 z-10">
              <div className="relative inline-block">
                <div className="pointer-events-none absolute top-1/2 -left-6 h-[72px] w-[72px] -translate-y-1/2 rounded-full bg-accent-solid/16 blur-[24px]" />
                <Link
                  href="/login"
                  className="relative z-10 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-300/15 bg-accent-solid px-6 text-sm font-semibold !text-white shadow-[0_12px_28px_rgba(var(--theme-emerald-rgb-raw),0.22)] hover:bg-accent-solid-hover light:bg-accent-solid light:!text-white light:hover:bg-accent-solid-hover"
                >
                  Login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <a
                href="#contact"
                className="hk-button !h-12"
              >
                <span>Contact Us</span>
              </a>
            </div>

            <div className="mt-10 flex items-center gap-4 text-sm text-slate-400 light:text-slate-600">
              <div className="flex -space-x-2">
                {[
                  { src: "/landing/team/ayat.png", alt: "Mopara Pair Ayat" },
                  { src: "/landing/team/afsana_tabassum.png", alt: "Afsana Tabassum Tamishra" },
                  { src: "/landing/team/kati_avatar.png", alt: "Fatima Rahman" },
                ].map((avatar, index) => (
                  <div
                    key={avatar.alt}
                    className="h-10 w-10 rounded-full border-2 border-[#060907] overflow-hidden light:border-[#f8fbf9] shadow-md"
                    style={{ zIndex: 3 - index }}
                  >
                    <Image
                      src={avatar.src}
                      alt={avatar.alt}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-emerald-300 light:text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  Role-based access
                </div>
                <p className="mt-0.5">Students, teachers, and administrators</p>
              </div>
            </div>
          </div>

          <div className="landing-float relative flex w-full max-w-[660px] select-none items-center justify-center justify-self-center md:justify-self-end">
            {/* Giant Background Text */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 select-none font-black tracking-tighter text-white/20 dark:text-white/15 light:text-slate-900/10 text-[6.5rem] sm:text-[9.5rem] md:text-[8rem] lg:text-[11.5rem] uppercase pointer-events-none transition-all duration-300">
              NEXORA
            </div>

            {/* Floating Decorative Shape 03 near image illustration */}
            <motion.div
              animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="pointer-events-none absolute -top-4 -right-4 sm:-top-8 sm:-right-8 z-30 drop-shadow-xl"
            >
              <Image
                src="/landing/shape-03.png"
                alt="Decorative accent shape"
                width={68}
                height={94}
                className="h-14 w-auto sm:h-20 object-contain opacity-90"
              />
            </motion.div>

            <div className="landing-orbit absolute -inset-8 rounded-full border border-emerald-300/10 before:absolute before:left-1/2 before:top-0 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full before:bg-emerald-300 before:shadow-[0_0_18px_rgba(110,255,185,0.9)] z-10" />
            <Image
              src="/landing/mentor-modern/hero-image.png"
              alt="Student using Nexora OS for academic work"
              width={720}
              height={620}
              priority
              className="relative z-20 h-auto w-full animate-[float_4s_ease-in-out_infinite]"
            />
          </div>
        </div>
      </section>

      {/* PARTNERS SECTION */}
      <section className="relative z-10 overflow-hidden py-10 light:bg-[#fcfdfc]">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent light:via-slate-200" />
            <h2 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 light:text-slate-600 sm:text-sm">
              Academic pathways supported in Nexora OS
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent light:via-slate-200" />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
            {[
              "/landing/mentor-modern/logos/bithm-logo.png",
              "/landing/mentor-modern/logos/othm-logo.png",
              "/landing/mentor-modern/logos/bithm-shield-logo.png",
              "/landing/mentor-modern/logos/standard-logo.png",
              "/landing/mentor-modern/logos/koc.png",
            ].map((src, index) => {
              const isBithmText = src.includes("bithm-logo.png");
              const isBithmShield = src.includes("bithm-shield-logo.png");
              const isOthm = src.includes("othm-logo.png");
              const isStandard = src.includes("standard-logo.png");
              const isKoc = src.includes("koc.png");
              const isEastTexas = src.includes("logo-4.png");

              let containerClass = "w-[130px] h-12";
              let pxClass = "px-4 py-2";

              if (isBithmText) {
                containerClass = "h-14 w-full max-w-[360px]";
                pxClass = "px-3 py-0.5";
              } else if (isBithmShield) {
                containerClass = "w-[160px] h-14";
                pxClass = "px-3 py-0.5";
              } else if (isOthm) {
                containerClass = "w-[120px] h-12";
                pxClass = "px-3 py-1";
              } else if (isStandard) {
                containerClass = "w-[210px] h-12";
                pxClass = "px-3 py-1";
              } else if (isKoc) {
                containerClass = "w-[190px] h-12";
                pxClass = "px-2 py-0.5";
              } else if (isEastTexas) {
                containerClass = "w-[240px] h-12";
                pxClass = "px-2 py-1";
              }

              return (
                <div
                  key={index}
                  className={`flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-default bg-white/95 border border-white/5 shadow-sm rounded-2xl light:bg-transparent light:border-transparent light:shadow-none light:p-0 ${pxClass} ${containerClass}`}
                >
                  <Image
                    src={src}
                    alt={`Partner ${index + 1}`}
                    width={320}
                    height={48}
                    unoptimized
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual Infinite Marquee Ribbon (Branded & Frameless) */}
        <div className="relative w-full h-[90px] sm:h-[130px] mt-6 sm:mt-8 overflow-hidden select-none pointer-events-none z-20">
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

            @keyframes marquee-ltr {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes marquee-rtl {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            .animate-marquee-ltr {
              display: flex;
              width: max-content;
              animation: marquee-ltr 28s linear infinite;
            }
            .animate-marquee-rtl {
              display: flex;
              width: max-content;
              animation: marquee-rtl 28s linear infinite;
            }
            .marquee-ribbon-dark {
              transform: rotate(-5deg) scale(1.05);
              box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            }
            .marquee-ribbon-light {
              transform: rotate(5deg) scale(1.05);
              box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            }
            @media (min-width: 640px) {
              .marquee-ribbon-dark {
                transform: rotate(-2.5deg) scale(1.05);
                box-shadow: 0 15px 35px rgba(0,0,0,0.5);
              }
              .marquee-ribbon-light {
                transform: rotate(2.5deg) scale(1.05);
                box-shadow: 0 15px 35px rgba(0,0,0,0.2);
              }
            }
          `}} />

          {/* Ribbon 1: Dark (on top) - Rich Deep Brand Green with Neon Text */}
          <div className="marquee-ribbon-dark absolute inset-x-0 top-1/2 -translate-y-1/2 w-[110%] -left-[5%] py-2.5 sm:py-4 bg-[#0a1b13] light:bg-[#f0f9f4] z-10 flex items-center overflow-hidden">
            <div className="animate-marquee-ltr flex items-center whitespace-nowrap gap-6 sm:gap-12 text-[9px] sm:text-xs font-black tracking-[0.2em] text-accent-primary light:text-[#065f46] uppercase">
              {Array(2).fill([
                "Student Workspace",
                "Code Lab Workspace",
                "Academic Shield Scan",
                "Evidence Submission",
                "Gradebook Analytics",
                "Syllabus Tracker",
                "Integrity Verification",
                "Instructor Feedback"
              ]).flat().map((word, i) => (
                <span key={i} className="flex items-center gap-6 sm:gap-12">
                  <span>{word}</span>
                  <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-accent-secondary light:bg-[#059669] shadow-[0_0_8px_rgba(var(--theme-emerald-rgb-raw),0.7)] light:shadow-[0_0_8px_rgba(5,150,105,0.4)]" />
                </span>
              ))}
            </div>
          </div>

          {/* Ribbon 2: Light (underneath) - High-Impact Neon Green with Dark Text */}
          <div className="marquee-ribbon-light absolute inset-x-0 top-1/2 -translate-y-1/2 w-[110%] -left-[5%] py-2.5 sm:py-4 bg-accent-primary light:bg-accent-solid z-0 flex items-center overflow-hidden">
            <div className="animate-marquee-rtl flex items-center whitespace-nowrap gap-6 sm:gap-12 text-[9px] sm:text-xs font-black tracking-[0.2em] text-[#031d11] light:text-white uppercase">
              {Array(2).fill([
                "Interactive Preview",
                "Integrity Protocol",
                "Submission Ledger",
                "Academic Partner",
                "Enrollment Management",
                "System Diagnostics",
                "Coursework Verification",
                "Faculty Review"
              ]).flat().map((word, i) => (
                <span key={i} className="flex items-center gap-6 sm:gap-12">
                  <span>{word}</span>
                  <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>


      <section
        id="platform"
        className="relative z-10 overflow-hidden py-20 light:bg-[#f3f7f4] sm:py-24"
      >
        {/* Next-Gen Brand Divider with Running Laser & HUD Seal */}
        <NextGenBrandDivider toBgColorClass="fill-[#06100c] light:fill-[#fbfdfc]" badgeText="NEXORA OS" />
        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-emerald-500/9 blur-[120px]" />
        <div className="absolute -right-32 bottom-16 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Explore Nexora OS"
            title="The tools students use throughout their course"
            detail="Core tools are available now. Modules still in development are clearly marked Coming Soon."
          />
          {/* Slider Container with Fades */}
          <div className="relative mt-10 group/slider">
            {/* Left Edge Fade Mask */}
            <div className="pointer-events-none absolute left-0 bottom-6 top-0 z-20 w-16 bg-gradient-to-r from-[#070d0a]/95 dark:from-[#070d0a]/95 light:from-[#f3f7f4]/95 to-transparent" />

            {/* Right Edge Fade Mask */}
            <div className="pointer-events-none absolute right-0 bottom-6 top-0 z-20 w-16 bg-gradient-to-l from-[#050706]/95 dark:from-[#050706]/95 light:from-[#f3f7f4]/95 to-transparent" />

            {/* Floating Left Button */}
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="absolute left-6 top-[calc(50%-12px)] -translate-y-1/2 z-30 hidden lg:flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#070d0a]/60 text-slate-200 backdrop-blur-md shadow-lg transition-all duration-300 opacity-0 group-hover/slider:opacity-100 hover:scale-110 hover:bg-[#070d0a]/80 active:scale-95 disabled:opacity-0 disabled:pointer-events-none light:border-black/5 light:bg-white/60 light:text-slate-800 light:hover:bg-white/80 pointer-events-auto"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Floating Right Button */}
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="absolute right-6 top-[calc(50%-12px)] -translate-y-1/2 z-30 hidden lg:flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#070d0a]/60 text-slate-200 backdrop-blur-md shadow-lg transition-all duration-300 opacity-0 group-hover/slider:opacity-100 hover:scale-110 hover:bg-[#070d0a]/80 active:scale-95 disabled:opacity-0 disabled:pointer-events-none light:border-black/5 light:bg-white/60 light:text-slate-800 light:hover:bg-white/80 pointer-events-auto"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div
              ref={sliderRef}
              onScroll={handleScroll}
              onMouseDown={handleMouseDown}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-6 cursor-grab active:cursor-grabbing select-none"
            >
              {platformAreas.map(({ title, detail, icon: Icon, tone, tools }, index) => {
                const color = tone.split(" ").find((c) => c.startsWith("bg-"))?.split("-")[1] ?? "emerald";
                const style = toolCardStyles[color] ?? toolCardStyles.emerald;
                const patternIdx = index % 3;

                return (
                  <article
                    key={title}
                    className={`group relative flex w-[310px] sm:w-[350px] shrink-0 snap-start min-h-[250px] flex-col justify-between overflow-hidden rounded-[24px] p-6 transition duration-300 hover:-translate-y-0.5 ${style.bgClass} ${style.hoverShadow}`}
                  >
                    {/* Wavy lines SVG overlay */}
                    {patternIdx === 0 && (
                      <svg viewBox="0 0 100 100" fill="none" stroke={style.svgStroke} strokeWidth="3" strokeLinecap="round" className="absolute top-0 right-0 w-24 h-24 pointer-events-none translate-x-3 -translate-y-3">
                        <path d="M30 20 C40 10, 50 30, 60 20 C70 10, 80 30, 90 20" />
                        <path d="M25 35 C35 25, 45 45, 55 35 C65 25, 75 45, 85 35" />
                        <path d="M20 50 C30 40, 40 60, 50 50 C60 40, 70 60, 80 50" />
                      </svg>
                    )}
                    {patternIdx === 1 && (
                      <svg viewBox="0 0 100 100" fill="none" stroke={style.svgStroke} strokeWidth="2.5" strokeLinecap="round" className="absolute top-0 right-0 w-24 h-24 pointer-events-none translate-x-3 -translate-y-3">
                        <path d="M50 15 C 65 17, 85 35, 85 55 C 85 70, 68 85, 50 85 C 32 85, 15 70, 15 55 C 15 35, 35 15, 50 15 Z" />
                        <path d="M50 30 C 60 32, 70 42, 70 55 C 70 64, 58 72, 50 72 C 42 72, 30 64, 30 55 C 30 42, 40 30, 50 30 Z" />
                        <path d="M50 45 C 54 46, 58 50, 58 55 C 58 59, 54 62, 50 62 C 46 62, 42 59, 42 55 C 42 50, 46 45, 50 45 Z" />
                      </svg>
                    )}
                    {patternIdx === 2 && (
                      <svg viewBox="0 0 100 100" fill="none" stroke={style.svgStroke} strokeWidth="2.5" strokeLinecap="round" className="absolute top-0 right-0 w-24 h-24 pointer-events-none translate-x-3 -translate-y-3">
                        <path d="M50 50 A 10 10 0 1 0 60 60 A 20 20 0 1 0 40 70 A 30 30 0 1 0 70 30 A 40 40 0 1 0 10 70" />
                      </svg>
                    )}

                    {/* Icon Circle */}
                    <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${style.iconCircleBg}`}>
                      <Icon className="h-5.5 w-5.5 stroke-[1.8]" />
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 mt-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className={`text-2xl font-bold tracking-tight ${style.textClass}`}>
                          {title}
                        </h3>
                        <p className={`mt-1 text-sm leading-5 ${style.textMutedClass}`}>
                          {detail}
                        </p>

                        {/* Tool Tags */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {tools.map((tool) => (
                            <span
                              key={tool}
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badgeClass}`}
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer / Actions */}
                      <div className="mt-4 pt-3 flex items-center justify-between border-t border-black/5 dark:border-white/5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${style.textClass}`}>
                          {tools.length} modules
                        </span>
                        <Link
                          href="/login"
                          className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${style.textClass}`}
                          data-cursor="hover"
                        >
                          Explore
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Next-Gen Slider Control Hub */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row light:border-black/5">
            {/* Left side: Index counter and Progress bar */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs font-bold tracking-widest text-slate-500 light:text-slate-400 select-none">
                <span className="text-accent-primary light:text-accent-solid">
                  {activeIdx.toString().padStart(2, "0")}
                </span>
                <span className="opacity-40"> / </span>
                <span className="opacity-70">{platformAreas.length.toString().padStart(2, "0")}</span>
              </span>

              {/* Progress Line */}
              <div className="relative w-36 h-[2px] rounded-full bg-white/10 dark:bg-white/10 light:bg-black/10 overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-150 ease-out"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>

              {/* Progress Dots Indicator */}
              <div className="hidden items-center gap-1.5 ml-2 md:flex">
                {platformAreas.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => {
                      if (sliderRef.current) {
                        const cardWidth = 350 + 20; // card + gap
                        safeScrollTo(dotIdx * cardWidth);
                      }
                    }}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${activeIdx === dotIdx + 1
                        ? "w-4 bg-accent-primary light:bg-accent-solid"
                        : "w-1.5 bg-white/20 hover:bg-white/40 light:bg-black/10 light:hover:bg-black/25"
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Middle: Help text */}
            <div className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-500 light:text-slate-400 opacity-60 sm:block">
              Drag anywhere or scroll to explore tools
            </div>

            {/* Right side: Arrow buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none light:border-slate-200 light:bg-slate-50 light:text-slate-700 light:hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none light:border-slate-200 light:bg-slate-50 light:text-slate-700 light:hover:bg-slate-100"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>


      <WorkflowsSection />

      <WhyNexoraSection />

      <section id="available-now" className="relative overflow-hidden border-y border-white/8 bg-[#07100b] px-5 py-16 light:border-emerald-950/8 light:bg-[radial-gradient(circle_at_76%_40%,rgba(16,185,129,0.085),transparent_38%),linear-gradient(180deg,#ffffff_0%,#f8fbf9_100%)] md:px-8 sm:py-20">
        {/* Next-Gen Brand Divider with Running Laser & HUD Seal */}
        <NextGenBrandDivider toBgColorClass="fill-[#070d0a] light:fill-[#ffffff]" badgeText="AVAILABLE NOW" />
        <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-emerald-500/7 blur-[110px] light:bg-emerald-300/14" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden light:block"
          style={{
            backgroundImage: "radial-gradient(rgba(15, 118, 110, 0.1) 0.6px, transparent 0.6px)",
            backgroundSize: "18px 18px",
            opacity: 0.22,
            maskImage: "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-16">
          <div className="lg:self-center">
            <div className="mb-2 overflow-visible inline-flex items-center justify-start max-w-full">
              <span className="font-3d-neon-script text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-wide transform -rotate-2 select-none">
                Available now
              </span>
            </div>
            <h2 className="mt-2 max-w-xl text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:text-4xl md:text-5xl light:text-slate-900">
              Start with the tools available today
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400 sm:text-base light:text-slate-600">
              Open the working modules now. Features still in development remain clearly marked until they are ready.
            </p>
            <Link
              href="/login"
              className="landing-focus-ring mt-7 inline-flex h-10 items-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-4 text-sm font-semibold text-emerald-100 transition-colors hover:border-emerald-300/30 hover:bg-white/[0.07] hover:text-white light:border-emerald-950/12 light:bg-white/80 light:text-emerald-900 light:shadow-[0_8px_24px_rgba(25,75,50,0.06)] light:hover:border-emerald-700/25 light:hover:bg-white"
            >
              Open Nexora OS <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
            {latestAreas.map(({ label, title, detail, icon: Icon }, index) => (
              <Link
                key={title}
                href="/login"
                aria-label={`Open ${title}`}
                className={`landing-focus-ring group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-[24px] border border-white/8 p-6 shadow-[0_16px_38px_rgba(4,20,13,0.14)] transition-[border-color,box-shadow] duration-300 hover:border-white/18 hover:shadow-[0_20px_46px_rgba(4,20,13,0.2)] ${availableCardThemes[index].surface}`}
              >
                <svg
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-3 -top-3 h-32 w-32 ${availableCardThemes[index].decor}`}
                  viewBox="0 0 120 120"
                  fill="none"
                >
                  {index === 0 && (
                    <>
                      <path d="M22 12c0 17-9 25-25 25" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                      <path d="M54 10c0 27-14 41-41 41" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                      <path d="M88 7c0 39-20 59-59 59" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                      <path d="M120 5c0 53-27 80-80 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <path d="M28 18c18-13 52-9 67 7 13 15 5 32-14 34-14 2-18 16-33 17-18 2-31-10-28-25 3-12-4-22 8-33Z" stroke="currentColor" strokeWidth="4" />
                      <path d="M39 30c12-8 35-6 44 4 8 9 3 18-9 20-10 1-12 10-22 11-11 1-19-6-17-15 2-8-3-14 4-20Z" stroke="currentColor" strokeWidth="4" />
                      <path d="M50 40c6-4 18-3 22 2 4 5 1 9-5 10-5 1-6 5-11 5-6 1-10-3-9-8 1-4-1-7 3-9Z" stroke="currentColor" strokeWidth="4" />
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <circle cx="76" cy="41" r="34" stroke="currentColor" strokeWidth="4" />
                      <path d="M82 22c-20-5-34 12-28 29 5 14 23 18 33 8 8-8 5-22-5-26-8-3-17 3-16 11 1 6 8 9 13 5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </>
                  )}
                  {index === 3 && (
                    <>
                      <ellipse cx="54" cy="18" rx="8" ry="17" transform="rotate(38 54 18)" stroke="currentColor" strokeWidth="4" />
                      <ellipse cx="82" cy="20" rx="8" ry="17" transform="rotate(38 82 20)" stroke="currentColor" strokeWidth="4" />
                      <ellipse cx="106" cy="33" rx="8" ry="17" transform="rotate(38 106 33)" stroke="currentColor" strokeWidth="4" />
                      <ellipse cx="64" cy="50" rx="8" ry="17" transform="rotate(38 64 50)" stroke="currentColor" strokeWidth="4" />
                      <ellipse cx="92" cy="54" rx="8" ry="17" transform="rotate(38 92 54)" stroke="currentColor" strokeWidth="4" />
                      <ellipse cx="112" cy="75" rx="8" ry="17" transform="rotate(38 112 75)" stroke="currentColor" strokeWidth="4" />
                    </>
                  )}
                </svg>

                <div className={`relative z-10 grid h-11 w-11 place-items-center rounded-full bg-white/12 ring-1 ring-white/10 light:bg-black/10 light:ring-black/5 ${availableCardThemes[index].icon}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </div>

                <div className="relative z-10 mt-auto pt-4">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] opacity-65 ${availableCardThemes[index].foreground}`}>
                    {label}
                  </span>
                  <h3 className={`mt-2 flex min-h-14 max-w-[15rem] items-end text-[1.55rem] font-semibold leading-[1.12] tracking-[-0.03em] ${availableCardThemes[index].foreground}`}>
                    {title}
                  </h3>
                  <p className={`mt-2 min-h-[3.75rem] max-w-[19rem] text-[13px] leading-5 ${availableCardThemes[index].muted}`}>
                    {detail}
                  </p>
                </div>

                <span className={`absolute bottom-6 right-6 z-10 grid h-9 w-9 place-items-center rounded-full border border-current/15 bg-white/8 ${availableCardThemes[index].foreground}`}>
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="group/credential relative w-full overflow-hidden py-10 sm:py-14 bg-[#070d0a]">
        {/* Next-Gen Brand Divider with Running Laser & HUD Seal */}
        <NextGenBrandDivider toBgColorClass="fill-[#080e15] light:fill-[#f8fafc]" badgeText="ACADEMIC CREDENTIAL" />

        {/* Full Background Image spanning full screen width */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/landing/gettyimages-2153780024-640x640.jpg"
            alt="BITHM Academic Workspace"
            fill
            className="object-cover object-right md:object-[80%_center] opacity-100 transition-transform duration-700 group-hover/credential:scale-105"
            priority
          />
          {/* Soft ambient gradient overlay on left for text legibility, leaving background image 100% bright & clear */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 via-40% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
        </div>

        {/* Content Container aligned with standard page grid */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <ScrollReveal>
            <div className="max-w-xl md:max-w-2xl">
              {/* Bright Glowing 3D Script Headline */}
              <div className="mb-2 overflow-visible inline-flex items-center justify-start">
                <span className="font-3d-neon-script text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-wide transform -rotate-2 select-none !bg-[linear-gradient(180deg,#f7fee7_0%,#bef264_35%,#84cc16_70%,#3f6212_100%)] ![-webkit-text-fill-color:transparent] ![-webkit-background-clip:text] filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  Academic Excellence
                </span>
              </div>

              {/* Main Title */}
              <h2 className="mt-2 text-balance text-2xl font-black leading-[1.12] tracking-tight !text-white sm:text-3xl md:text-4xl lg:text-[40px] drop-shadow-md">
                Developed for BITHM Academic Coursework
              </h2>

              {/* Subtitle */}
              <p className="mt-3 max-w-xl text-xs sm:text-sm leading-relaxed !text-slate-200 font-medium drop-shadow">
                Official coursework submission for BITHM College of Professionals. Designed & built by Mopara Pair Ayat under supervision of Afsana Tabassum Tamishra.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/login?role=student"
                  className="group/btn inline-flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-[#044b3b] px-6 py-3 text-xs font-extrabold !text-white shadow-xl shadow-emerald-950/50 transition-all duration-300 hover:scale-105 hover:bg-[#033b2e]"
                >
                  <span className="font-extrabold !text-white">Become A Student</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff5500] !text-white shadow-md transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-12">
                    <ArrowRight className="h-4 w-4 stroke-[2.5] !text-white" />
                  </span>
                </Link>

                <Link
                  href="/login?role=teacher"
                  className="group/btn inline-flex items-center gap-2.5 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-xs font-extrabold !text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20"
                >
                  <span className="font-extrabold !text-white">Become A Teacher</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white !text-[#06100c] shadow-md transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-12">
                    <ArrowRight className="h-4 w-4 stroke-[2.5] !text-[#06100c]" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Bottom Metadata Grid (Clean Frameless Dividers) */}
            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/20 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Institution */}
              <div className="border-l-2 border-emerald-400/80 pl-3">
                <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Institution
                </p>
                <p className="mt-0.5 text-xs font-extrabold !text-white truncate drop-shadow">
                  BITHM College of Professionals
                </p>
                <p className="text-[10.5px] !text-slate-300 font-medium">Academic Partner</p>
              </div>

              {/* Student */}
              <div className="border-l-2 border-emerald-400/80 pl-3">
                <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Student
                </p>
                <p className="mt-0.5 text-xs font-extrabold !text-white truncate drop-shadow">
                  Mopara Pair Ayat
                </p>
                <p className="text-[10.5px] !text-slate-300 font-medium">ID: IT202510001</p>
              </div>

              {/* Instructor */}
              <div className="border-l-2 border-emerald-400/80 pl-3">
                <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Instructor
                </p>
                <p className="mt-0.5 text-xs font-extrabold !text-white truncate drop-shadow">
                  Afsana Tabassum Tamishra
                </p>
                <p className="text-[10.5px] !text-slate-300 font-medium">Lecturer - Dept. of IT</p>
              </div>

              {/* Course */}
              <div className="border-l-2 border-emerald-400/80 pl-3">
                <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Course
                </p>
                <p className="mt-0.5 text-xs font-extrabold !text-white truncate drop-shadow">
                  Web & Mobile Applications
                </p>
                <p className="text-[10.5px] !text-slate-300 font-medium">OTHM Unit H/650/3385</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <TeamShowcaseSection />
      <section
        id="faq"
        className="relative overflow-hidden border-y border-white/8 py-20 light:border-emerald-950/8 light:bg-[#f4f7f5] sm:py-24"
      >
        {/* ── Large warm amber sun-like orb — bottom right ── */}
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-[560px] w-[560px] rounded-full light:hidden"
          style={{
            background: "radial-gradient(circle at center, rgba(251,146,60,0.55) 0%, rgba(245,101,19,0.35) 28%, rgba(217,70,0,0.18) 55%, transparent 75%)",
            filter: "blur(2px)",
          }}
        />
        {/* Smaller secondary warm glow */}
        <div
          className="pointer-events-none absolute -bottom-8 right-32 h-[280px] w-[280px] rounded-full light:hidden"
          style={{
            background: "radial-gradient(circle at center, rgba(251,191,36,0.3) 0%, rgba(245,101,19,0.15) 50%, transparent 70%)",
            filter: "blur(1px)",
          }}
        />
        <div className="pointer-events-none absolute -bottom-32 -right-20 hidden h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.14)_0%,rgba(110,231,183,0.07)_42%,transparent_72%)] light:block" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <ScrollReveal>
            <div>
              <div className="mb-2 overflow-visible inline-flex items-center justify-start max-w-full">
                <span className="font-3d-neon-script text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-wide transform -rotate-2 select-none">
                  Frequently Asked Questions
                </span>
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                A few things to know before signing in
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-400 light:text-slate-600">
                These answers explain how Nexora is organized and which tools are
                currently available.
              </p>
              <Image
                src="/landing/mentor-modern/faqs.png"
                alt="Student reviewing common questions"
                width={360}
                height={300}
                className="mx-auto mt-8 h-auto w-full max-w-[300px]"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150} className="grid content-start gap-3">
            {faqs.map(({ question, answer }, index) => (
              <details
                key={question}
                open={index === 0}
                className="group rounded-2xl border border-white/10 bg-white/[0.035] px-5 backdrop-blur-sm transition open:border-emerald-300/20 open:bg-white/[0.05] light:border-emerald-950/9 light:bg-white/85 light:shadow-[0_10px_28px_rgba(31,67,49,0.04)] light:open:bg-white"
              >
                <summary className="cursor-pointer list-none py-5 text-sm font-semibold marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {question}
                    <span className="text-xl text-emerald-300 transition group-open:rotate-45 light:text-emerald-700">
                      +
                    </span>
                  </span>
                </summary>
                <p className="pb-5 text-sm leading-6 text-slate-400 light:text-slate-600">
                  {answer}
                </p>
              </details>
            ))}
          </ScrollReveal>
        </div>
      </section>



      <section id="demo" className="px-5 py-20 light:bg-[#f4f7f5] md:px-8 sm:py-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-white/20 bg-gradient-to-br from-emerald-900 via-accent-solid to-emerald-950 px-6 py-14 text-center shadow-[0_24px_64px_rgba(var(--theme-accent-primary-rgb-raw),0.25)] sm:px-10">
          <div className="absolute inset-0 bg-[url('/landing/mentor-modern/cta-bg-vector.png')] bg-cover bg-center opacity-35" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Explore Nexora OS with a demo account
            </h2>
            <p className="mt-4 text-sm leading-7 text-emerald-50/85 sm:text-base">
              Open a student, teacher, or admin workspace to see how the
              platform is organized.
            </p>
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/15 bg-black/15 p-3">
              <DemoLoginButtons onDark />
            </div>
          </div>
        </div>
      </section>

      <section id="download" className="relative px-5 py-16 md:px-8 sm:py-24 overflow-hidden border-t border-white/8 light:border-emerald-950/8 bg-[#07100b] light:bg-[#eef3f0]">
        {/* Glow ambient effects */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Desktop Card */}
            <ScrollReveal className="h-full flex flex-col">
              <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-b from-[#121624]/80 to-[#0c0e17]/90 light:from-white light:to-slate-50/80 border border-white/10 light:border-slate-200/80 shadow-2xl p-8 md:p-10 w-full h-full">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300 light:text-emerald-600">
                    Desktop Experience
                  </p>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl text-white light:text-slate-900">
                    Nexora OS for Desktop
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400 light:text-slate-600">
                    Run Nexora OS natively on your computer with custom shortcuts, background sync, and deep system integration.
                  </p>

                  {/* Desktop Store Badges */}
                  <div className="mt-6 flex flex-wrap items-center gap-2.5">
                    {/* Windows Badge */}
                    <div
                      onClick={() => handleDownloadSimulate("Windows")}
                      className="flex items-center gap-2.5 px-4 py-2 bg-white light:bg-slate-950 hover:bg-slate-50 light:hover:bg-[#1e2439] text-slate-900 light:text-white border border-slate-200 light:border-white/10 hover:border-emerald-500/30 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer select-none"
                    >
                      <svg className="h-5.5 w-5.5 fill-[#00ADEF]" viewBox="0 0 24 24">
                        <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zM10.8 12.45H24v11.55l-13.2-1.95v-9.6z" />
                      </svg>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[7.5px] uppercase tracking-wider text-slate-500 light:text-slate-400 font-bold">Download for</span>
                        <span className="text-xs font-extrabold mt-0.5">Windows</span>
                      </div>
                    </div>

                    {/* macOS Badge */}
                    <div
                      onClick={() => handleDownloadSimulate("macOS")}
                      className="flex items-center gap-2.5 px-4 py-2 bg-white light:bg-slate-950 hover:bg-slate-50 light:hover:bg-[#1e2439] text-slate-900 light:text-white border border-slate-200 light:border-white/10 hover:border-emerald-500/30 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer select-none"
                    >
                      <svg className="h-5.5 w-5.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.64.73-1.2 1.87-1.05 2.98 1.12.09 2.27-.58 3-1.43z" />
                      </svg>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[7.5px] uppercase tracking-wider text-slate-500 light:text-slate-400 font-bold">Download for</span>
                        <span className="text-xs font-extrabold mt-0.5">macOS</span>
                      </div>
                    </div>

                    {/* Linux Badge */}
                    <div
                      onClick={() => handleDownloadSimulate("Linux")}
                      className="flex items-center gap-2.5 px-4 py-2 bg-white light:bg-slate-950 hover:bg-slate-50 light:hover:bg-[#1e2439] text-slate-900 light:text-white border border-slate-200 light:border-white/10 hover:border-emerald-500/30 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer select-none"
                    >
                      <svg className="h-5.5 w-5.5 stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="4 17 10 11 4 5" />
                        <line x1="12" y1="19" x2="20" y2="19" />
                      </svg>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[7.5px] uppercase tracking-wider text-slate-500 light:text-slate-400 font-bold">Download for</span>
                        <span className="text-xs font-extrabold mt-0.5">Linux</span>
                      </div>
                    </div>
                  </div>

                  {/* Download State Loader Indicator */}
                  {(downloadStates["Windows"] || downloadStates["macOS"] || downloadStates["Linux"]) && (
                    <div className="mt-5 flex justify-start">
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 animate-pulse">
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>
                          {downloadStates["Windows"]
                            ? `Windows App: ${downloadStates["Windows"]}`
                            : downloadStates["macOS"]
                              ? `macOS App: ${downloadStates["macOS"]}`
                              : `Linux App: ${downloadStates["Linux"]}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Mobile Card */}
            <ScrollReveal delay={150} className="h-full flex flex-col">
              <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-b from-[#121624]/80 to-[#0c0e17]/90 light:from-white light:to-slate-50/80 border border-white/10 light:border-slate-200/80 shadow-2xl p-8 md:p-10 w-full h-full">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300 light:text-emerald-600">
                    Mobile Experience
                  </p>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl text-white light:text-slate-900">
                    Nexora OS for Mobile
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400 light:text-slate-600">
                    Stay connected on the go. Access your class feeds, track schedules, submit assignments, and chat with peers instantly.
                  </p>

                  {/* Mobile Store Badges */}
                  <div className="mt-6 flex flex-wrap items-center gap-2.5">
                    {/* App Store Badge */}
                    <div
                      onClick={() => handleDownloadSimulate("iOS")}
                      className="flex items-center gap-2.5 px-4 py-2 bg-white light:bg-slate-950 hover:bg-slate-50 light:hover:bg-[#1e2439] text-slate-900 light:text-white border border-slate-200 light:border-white/10 hover:border-emerald-500/30 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer select-none"
                    >
                      <svg className="h-5.5 w-5.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.64.73-1.2 1.87-1.05 2.98 1.12.09 2.27-.58 3-1.43z" />
                      </svg>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[7.5px] uppercase tracking-wider text-slate-500 light:text-slate-400 font-bold">Download on the</span>
                        <span className="text-xs font-extrabold mt-0.5">App Store</span>
                      </div>
                    </div>

                    {/* Google Play Badge */}
                    <div
                      onClick={() => handleDownloadSimulate("Android")}
                      className="flex items-center gap-2.5 px-4 py-2 bg-white light:bg-slate-950 hover:bg-slate-50 light:hover:bg-[#1e2439] text-slate-900 light:text-white border border-slate-200 light:border-white/10 hover:border-emerald-500/30 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer select-none"
                    >
                      <svg className="h-5.5 w-5.5" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3.2c-.2.2-.3.5-.3.9v15.8c0 .4.1.7.3.9l.1.1 8.9-8.9V11.8L3.1 3.1l-.1.1z" fill="#3BCCFF" />
                        <path d="M15.8 15.9l-3.5-3.5v-.2l3.5-3.5.1.1 4.2 2.4c1.2.7 1.2 1.8 0 2.5l-4.2 2.4-.1.3z" fill="#FFC729" />
                        <path d="M15.9 15.8L12.3 12.2 3.1 21.4c.4.4 1 .4 1.6.1l11.2-5.7z" fill="#FF3A44" />
                        <path d="M15.9 8.2L4.7 1.8c-.6-.3-1.2-.3-1.6.1L12.3 12l3.6-3.8z" fill="#00E676" />
                      </svg>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[7.5px] uppercase tracking-wider text-slate-500 light:text-slate-400 font-bold">GET IT ON</span>
                        <span className="text-xs font-extrabold mt-0.5">Google Play</span>
                      </div>
                    </div>
                  </div>

                  {(downloadStates["iOS"] || downloadStates["Android"]) && (
                    <div className="mt-5 flex justify-start">
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 animate-pulse">
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>{downloadStates["iOS"] ? `iOS App: ${downloadStates["iOS"]}` : `Android App: ${downloadStates["Android"]}`}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <ScrollReveal>
        <PandaCTA />
      </ScrollReveal>

      <div id="contact">
        <NextGenFooter />
      </div>

      <PandaChat />
    </main>
  );
}


