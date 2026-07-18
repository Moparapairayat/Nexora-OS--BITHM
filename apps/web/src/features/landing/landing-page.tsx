"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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

const workflows = [
  {
    title: "Assignment reports",
    detail:
      "Prepare reports, organize evidence, submit work, and follow its status.",
    icon: FileCheck2,
    label: "Plan · Write · Submit",
  },
  {
    title: "Practical lab work",
    detail:
      "Turn a task brief into tested code and a well-structured lab report.",
    icon: FlaskConical,
    label: "Build · Test · Report",
  },
  {
    title: "Progress and feedback",
    detail:
      "Keep up with deadlines, requested changes, submissions, and progress.",
    icon: BarChart3,
    label: "Review · Improve · Resubmit",
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

  // Auto-scrolling system
  useEffect(() => {
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

    return () => clearInterval(interval);
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
    isDown.current = false;
    setIsHovered(false);
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftVal.current - walk;
  };

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_50%_0%,rgba(var(--theme-accent-primary-rgb-raw),0.13),transparent_42rem),radial-gradient(circle_at_92%_32%,rgba(20,184,108,0.07),transparent_30rem),linear-gradient(180deg,rgba(18,24,21,0.98)_0%,rgba(7,13,10,0.99)_38%,rgba(5,7,6,1)_100%)] text-white light:bg-[radial-gradient(circle_at_15%_10%,rgba(167,139,250,0.06),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(52,211,153,0.09),transparent_35%),radial-gradient(circle_at_80%_45%,rgba(110,231,183,0.05),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f6faf7_55%,#fafdfb_100%)] light:text-[#15251f]">
      <div className="absolute inset-0 bg-dot-grid pointer-events-none z-0" />
      <LandingNav />

      {/* HERO SECTION */}
      <section id="about" className="relative overflow-hidden pb-16 pt-32 sm:pt-36 lg:pb-20">
        <div className="landing-hero-arc-left nexora-brand-arc pointer-events-none absolute w-[320px] h-[320px] -left-[240px] top-[-60px] -rotate-12 opacity-60 sm:w-[480px] sm:h-[480px] sm:-left-[360px] sm:top-[-90px] sm:opacity-70 md:w-[560px] md:h-[560px] md:-left-[420px] md:top-[-100px] xl:w-[620px] xl:h-[620px] xl:-left-[455px] xl:top-[-120px] xl:opacity-75" />
        <div className="landing-hero-arc-right nexora-brand-arc pointer-events-none absolute w-[340px] h-[340px] -right-[260px] bottom-[-70px] rotate-[148deg] opacity-50 sm:w-[520px] sm:h-[520px] sm:-right-[400px] sm:bottom-[-100px] sm:opacity-55 md:w-[600px] md:h-[600px] md:-right-[450px] md:bottom-[-110px] xl:w-[680px] xl:h-[680px] xl:-right-[490px] xl:bottom-[-150px] xl:opacity-65" />
        <div className="pointer-events-none absolute -left-20 -top-20 z-0 h-[380px] w-[380px] rounded-full bg-emerald-500/10 blur-[130px] light:bg-violet-500/10" />
        <div className="pointer-events-none absolute -right-20 bottom-10 z-0 h-[380px] w-[380px] rounded-full bg-emerald-500/15 blur-[130px] light:bg-emerald-500/12" />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 md:grid-cols-2 md:px-8 lg:gap-16">
          <div className="relative w-full max-w-[560px]">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300 shadow-[0_2px_10px_rgba(16,185,129,0.05)] light:border-emerald-600/15 light:bg-emerald-50 light:text-emerald-700">
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
                  { src: "/landing/avatars/avatar-student.png", alt: "Student" },
                  { src: "/landing/avatars/avatar-teacher.png", alt: "Teacher" },
                  { src: "/landing/avatars/avatar-admin.png", alt: "Administrator" },
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
              "/landing/mentor-modern/logos/bithm-logo.png?v=3",
              "/landing/mentor-modern/logos/othm-logo.png",
              "/landing/mentor-modern/logos/bithm-shield-logo.png?v=3",
              "/landing/mentor-modern/logos/standard-logo.png?v=3",
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
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
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


      <section
        id="how-it-works"
        className="relative overflow-hidden border-y border-white/8 bg-[#050b08] px-5 py-20 light:border-emerald-950/8 light:bg-[#eaf3ee] md:px-8 sm:py-24"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[70%] -translate-x-1/2 rounded-full bg-emerald-500/8 blur-[130px] light:bg-emerald-300/16" />

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-emerald-300/12 bg-[linear-gradient(135deg,#0b2b21_0%,#072018_58%,#06140f_100%)] shadow-[0_26px_70px_rgba(0,0,0,0.28)] light:border-emerald-950/10 light:bg-[linear-gradient(135deg,#ffffff_0%,#edf8f1_58%,#e4f2ea_100%)] light:shadow-[0_22px_55px_rgba(25,80,53,0.11)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[42px] border-emerald-300/6 light:border-emerald-700/5" />
          <div className="pointer-events-none absolute left-[42%] top-[-15%] h-72 w-72 rounded-full bg-emerald-400/8 blur-[100px] light:bg-emerald-300/16" />

          <div className="relative grid items-center lg:grid-cols-[0.96fr_1.04fr]">
            <div className="flex flex-col justify-center px-7 py-10 sm:px-11 sm:py-14 lg:px-14 lg:py-16">
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-emerald-300/70 light:bg-emerald-700/55" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 light:text-emerald-700">
                  Core workflows
                </p>
              </div>

              <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-5xl light:text-slate-900">
                A clear path from task brief to final submission.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-emerald-50/70 sm:text-base light:text-slate-600">
                Keep the brief, practical work, evidence, and feedback connected so you always know what to work on next.
              </p>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-emerald-100/75 light:text-emerald-900/70">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 light:bg-emerald-600" />
                  Coursework
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 light:bg-cyan-600" />
                  Practical labs
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300 light:bg-amber-600" />
                  Instructor feedback
                </span>
              </div>
            </div>

            <div className="relative flex min-h-[350px] items-center justify-center overflow-hidden px-5 pb-4 sm:min-h-[430px] sm:px-10 lg:min-h-[500px] lg:px-8 lg:pb-0">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/10 light:border-emerald-700/8" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/7 blur-3xl light:bg-emerald-400/10" />
              <Image
                src="/landing/workflows/academic-workspace-cutout.png"
                alt="Laptop, study notes, books, and coursework folder"
                width={1536}
                height={1024}
                sizes="(min-width: 1024px) 48vw, 92vw"
                className="relative z-10 h-auto w-full max-w-[720px] object-contain drop-shadow-[0_26px_32px_rgba(0,0,0,0.25)] light:drop-shadow-[0_22px_28px_rgba(25,75,50,0.16)]"
              />
              <div className="absolute bottom-7 right-6 z-20 max-w-[210px] border-l-2 border-emerald-300 bg-[#09271e]/88 px-4 py-3 text-xs leading-5 text-emerald-50/80 shadow-lg backdrop-blur-md sm:right-10 light:border-emerald-600 light:bg-white/88 light:text-slate-600">
                <span className="mb-1 block font-semibold text-emerald-300 light:text-emerald-700">
                  One connected workspace
                </span>
                Notes, practical work, and submissions stay in context.
              </div>
            </div>
          </div>

          <ol className="relative grid border-t border-white/10 md:grid-cols-3 light:border-emerald-950/10">
            {workflows.map(({ title, detail, icon: Icon, label }, index) => (
              <li
                key={title}
                className="group grid grid-cols-[2.5rem_1fr] gap-4 border-b border-white/10 px-6 py-7 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 sm:px-8 light:border-emerald-950/10"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full border border-emerald-300/18 bg-emerald-300/7 text-xs font-bold text-emerald-200 light:border-emerald-700/15 light:bg-emerald-50 light:text-emerald-700">
                  0{index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-emerald-300 light:text-emerald-700" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200/60 light:text-emerald-800/65">
                      {label}
                    </p>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-white light:text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/62 light:text-slate-600">
                    {detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/8 bg-[#07100b] px-5 py-20 light:border-emerald-950/8 light:bg-white md:px-8 sm:py-24">
        <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-emerald-500/7 blur-[110px] light:bg-emerald-300/14" />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-emerald-300/65 light:bg-emerald-700/50" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300 light:text-emerald-700">
                Available now
              </p>
            </div>
            <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl light:text-slate-900">
              Start with the tools available today
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400 sm:text-base light:text-slate-600">
              Open the working modules now. Features still in development remain clearly marked until they are ready.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition-colors hover:text-white light:text-emerald-700 light:hover:text-emerald-900"
            >
              Open Nexora OS <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="border-y border-white/12 light:border-emerald-950/12">
            {latestAreas.map(({ label, title, detail, icon: Icon }, index) => (
              <article
                key={title}
                className={`group grid gap-4 py-7 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:gap-5 sm:py-8 ${
                  index !== latestAreas.length - 1
                    ? "border-b border-white/10 light:border-emerald-950/10"
                    : ""
                }`}
              >
                <div className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-emerald-200 transition-colors group-hover:border-emerald-300/30 group-hover:bg-emerald-300/6 light:border-emerald-950/10 light:text-emerald-700 light:group-hover:border-emerald-700/25 light:group-hover:bg-emerald-50">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold text-white light:text-slate-900">{title}</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300/65 light:text-emerald-700/70">
                      {label}
                    </span>
                  </div>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 light:text-slate-600">{detail}</p>
                </div>

                <Link
                  href="/login"
                  aria-label={`Open ${title}`}
                  className="inline-flex h-9 w-9 items-center justify-center justify-self-start rounded-full text-slate-500 transition-all hover:bg-emerald-300/8 hover:text-emerald-200 sm:justify-self-end light:text-slate-400 light:hover:bg-emerald-50 light:hover:text-emerald-700"
                >
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-5 pb-20 pt-28 md:px-8 xl:py-24 bg-[#070d0a] light:bg-[#f0f6f2]">
        <div className="mx-auto max-w-7xl relative">
          {/* Outer card */}
          <div className="group/coursework relative rounded-3xl border border-emerald-500/15 light:border-emerald-700/20 bg-gradient-to-b from-[#0d1f18]/80 to-[#06100c]/95 light:from-white light:to-[#f0f9f4] backdrop-blur-md overflow-hidden shadow-[0_20px_50px_rgba(4,20,13,0.4)] light:shadow-[0_20px_50px_rgba(16,185,129,0.08)]">

            {/* Subtle grid pattern specifically inside the card */}
            <div className="absolute inset-0 opacity-[0.03] light:opacity-[0.06] pointer-events-none mix-blend-overlay"
              style={{ backgroundImage: "linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)", backgroundSize: "20px 20px" }}
            />

            {/* Glowing spot lights */}
            <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 light:bg-emerald-500/5 blur-3xl pointer-events-none" />
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-400/5 light:bg-emerald-400/5 blur-3xl pointer-events-none" />

            {/* Ribbon Badge: VERIFIED */}
            <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none z-20">
              <div className="absolute top-6 -right-8 w-32 py-1 bg-gradient-to-r from-accent-primary to-accent-secondary light:from-accent-solid light:to-accent-primary text-center text-[10px] font-bold uppercase tracking-wider text-white shadow-md transform rotate-45 border-y border-white/10 select-none">
                Verified
              </div>
            </div>

            {/* Subtle background watermark */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
              <div className="absolute -bottom-8 -right-8 text-[11rem] font-black tracking-tighter text-accent-primary/[0.015] light:text-accent-solid/[0.03] uppercase leading-none">OS</div>
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">

              {/* LEFT PANEL - Credentials Presentation */}
              <div className="p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-emerald-500/10 light:border-emerald-700/10">
                <div>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 light:border-emerald-700/20 bg-emerald-500/5 light:bg-emerald-50/70 px-3.5 py-1.5 mb-8">
                    <svg className="w-3.5 h-3.5 text-emerald-400 light:text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 light:text-emerald-700">Official Coursework</span>
                  </div>

                  {/* Premium Seal / Badge Symbol */}
                  <div className="relative flex items-center gap-4 mb-8">
                    <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-emerald-500/5 light:bg-emerald-50 border border-emerald-500/20 light:border-emerald-700/15 shadow-[0_0_15px_rgba(16,185,129,0.05)] overflow-hidden">
                      {/* Metallic Sheen Overlay */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 light:via-white/60 to-transparent -translate-x-[150%] -skew-x-[25deg] transition-transform duration-1000 ease-out group-hover/coursework:translate-x-[150%] pointer-events-none" />

                      {/* Laurel Wreath Certificate SVG */}
                      <svg className="w-10 h-10 text-emerald-400 light:text-emerald-600 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3a9 9 0 0 1 8.7 7M18 3a9 9 0 0 0-8.7 7M12 7v10M9 14l3 3 3-3" />
                        <circle cx="12" cy="17" r="1" fill="currentColor" />
                        <path d="M5.5 10a7 7 0 0 0 6.5 6 7 7 0 0 0 6.5-6" />
                      </svg>
                      {/* Small floating pulse dot */}
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 light:bg-emerald-600 border-2 border-[#0d1f18] light:border-white shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse z-20" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium tracking-wide text-slate-400 light:text-slate-500">Nexora Integrity Protocol</p>
                      <p className="text-xs font-bold text-emerald-400 light:text-emerald-700">Verified Submission Ledger</p>
                    </div>
                  </div>

                  {/* Heading */}
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white light:text-slate-900 leading-tight">
                    Developed for<br />Academic Coursework
                  </h2>

                  {/* Emerald gradient underline bar */}
                  <div className="mt-5 w-14 h-[4px] rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary light:from-accent-solid light:to-accent-primary" />

                  {/* Description */}
                  <p className="mt-6 text-sm leading-relaxed text-slate-400 light:text-slate-600 max-w-md">
                    Nexora OS bridges the gap between study and practice. It brings assignments, hands-on coding labs, submission evidence, and instructor feedback together into one unified platform.
                  </p>
                </div>

                {/* Footer status row */}
                <div className="mt-10 flex items-center gap-3 text-sm text-slate-500 light:text-slate-500">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 light:bg-emerald-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-emerald-400 light:text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 light:text-slate-800">Summer 2026</span>
                    <span className="mx-2 text-slate-700 light:text-slate-300">·</span>
                    <span className="text-xs text-slate-400 light:text-slate-500">Academic Submission Verified</span>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL — Academic details, grouped without nested cards */}
              <div className="grid grid-cols-1 bg-black/10 sm:grid-cols-2 light:bg-slate-50/30">

                {/* Institution */}
                <div className="group border-b border-emerald-500/10 px-7 py-8 transition-colors hover:bg-emerald-500/[0.025] sm:border-r light:border-slate-200/80 light:hover:bg-emerald-50/60">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl border border-emerald-500/20 light:border-emerald-200 bg-emerald-500/5 light:bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400 light:text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 22h18M6 18V9M10 18V9M14 18V9M18 18V9M2 9l10-6 10 6" />
                      </svg>
                    </div>
                    {/* Small tag icon for metadata */}
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/60 light:text-emerald-600/60">Verified</span>
                  </div>
                  <div className="mt-6">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 light:text-emerald-700 mb-1.5">Institution</p>
                    <p className="text-base font-bold text-white light:text-slate-800 leading-snug tracking-wide group-hover:text-emerald-300 light:group-hover:text-emerald-600 transition-colors">BITHM College of Professionals</p>
                    <p className="text-xs text-slate-500 light:text-slate-500 mt-1">Academic partner</p>
                  </div>
                </div>

                {/* Student */}
                <div className="group border-b border-emerald-500/10 px-7 py-8 transition-colors hover:bg-emerald-500/[0.025] light:border-slate-200/80 light:hover:bg-emerald-50/60">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl border border-emerald-500/20 light:border-emerald-200 bg-emerald-500/5 light:bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400 light:text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/60 light:text-emerald-600/60">Profile</span>
                  </div>
                  <div className="mt-6">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 light:text-emerald-700 mb-1.5">Student</p>
                    <p className="text-base font-bold text-white light:text-slate-800 leading-snug tracking-wide group-hover:text-emerald-300 light:group-hover:text-emerald-600 transition-colors">Mopara Pair Ayat</p>
                    <p className="text-xs text-slate-500 light:text-slate-500 mt-1">IT202510001 · Information Technology</p>
                  </div>
                </div>

                {/* Instructor */}
                <div className="group border-b border-emerald-500/10 px-7 py-8 transition-colors hover:bg-emerald-500/[0.025] sm:border-r sm:border-b-0 light:border-slate-200/80 light:hover:bg-emerald-50/60">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl border border-emerald-500/20 light:border-emerald-200 bg-emerald-500/5 light:bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400 light:text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/60 light:text-emerald-600/60">Faculty</span>
                  </div>
                  <div className="mt-6">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 light:text-emerald-700 mb-1.5">Instructor</p>
                    <p className="text-base font-bold text-white light:text-slate-800 leading-snug tracking-wide group-hover:text-emerald-300 light:group-hover:text-emerald-600 transition-colors">Afsana Tabassum Tamishra</p>
                    <p className="text-xs text-slate-500 light:text-slate-500 mt-1">Lecturer · Dept. of IT</p>
                  </div>
                </div>

                {/* Course */}
                <div className="group px-7 py-8 transition-colors hover:bg-emerald-500/[0.025] light:hover:bg-emerald-50/60">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl border border-emerald-500/20 light:border-emerald-200 bg-emerald-500/5 light:bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400 light:text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/60 light:text-emerald-600/60">Module</span>
                  </div>
                  <div className="mt-6">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 light:text-emerald-700 mb-1.5">Course</p>
                    <p className="text-base font-bold text-white light:text-slate-800 leading-snug tracking-wide group-hover:text-emerald-300 light:group-hover:text-emerald-600 transition-colors">Web and Mobile Applications</p>
                    <p className="text-xs text-slate-500 light:text-slate-500 mt-1">OTHM Unit H/650/3385</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Hanging interactive Panda mascot, synced to track user cursor */}
          <PandaCTA mascotOnly className="absolute top-[-130px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] xl:top-[-100px] xl:right-[-280px] xl:left-auto xl:translate-x-0 xl:w-[450px] xl:h-[450px]" />
        </div>
      </section>


      <section
        id="team"
        className="relative overflow-hidden py-24 text-white light:text-[#0d2a1d]"
      >
        <style dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
          .font-sans {
            font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          }
          #team {
            background: linear-gradient(180deg, rgba(8, 12, 10, 0.88) 0%, rgba(5, 8, 7, 0.95) 100%), url('/landing/footer-bg-brand.png') no-repeat center center / cover;
            border-top: 1px solid rgba(var(--theme-accent-primary-rgb-raw),0.1);
            border-bottom: 1px solid rgba(var(--theme-accent-primary-rgb-raw),0.1);
            --center-card-bg-start: #082219;
            --center-card-bg-end: #030e0a;
          }
          .light #team {
            background:
              radial-gradient(circle at 50% 34%, rgba(16, 185, 129, 0.09), transparent 31%),
              radial-gradient(circle at 7% 82%, rgba(110, 231, 183, 0.07), transparent 24%),
              linear-gradient(180deg, #ffffff 0%, #f6faf8 52%, #ffffff 100%);
            border-top: 1px solid rgba(15, 70, 45, 0.1);
            border-bottom: 1px solid rgba(15, 70, 45, 0.1);
            --center-card-bg-start: #ffffff;
            --center-card-bg-end: #f2f8f4;
          }
          .light #team .team-profile-card {
            background: #ffffff;
            border-color: rgba(15, 70, 45, 0.11);
            box-shadow: 0 12px 30px rgba(25, 75, 50, 0.06);
            backdrop-filter: none;
          }
          .light #team .team-profile-card:hover {
            border-color: rgba(5, 150, 105, 0.24);
            box-shadow: 0 16px 36px rgba(25, 75, 50, 0.09);
          }
          .light #team .team-ornament {
            opacity: 0.45;
          }
          .light #team .team-center-shell {
            filter: drop-shadow(0 14px 28px rgba(25, 75, 50, 0.07));
          }
          .light #team .font-sans {
            font-family: inherit;
          }
          .light #team .team-dot-grid {
            background-image: radial-gradient(rgba(5, 150, 105, 0.12) 1px, transparent 1px) !important;
          }
        `}} />

        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-emerald-950/15 light:bg-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-emerald-950/20 light:bg-transparent blur-3xl pointer-events-none" />
        <div className="team-dot-grid absolute inset-0 opacity-[0.015] light:opacity-[0.012] pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          {/* Section Header */}
          <ScrollReveal>
            <div className="mb-12 flex items-center justify-center gap-6 text-center">
              {/* Left Ornament */}
              <div className="team-ornament hidden shrink-0 sm:block">
                <svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 0,12 L 80,12" stroke="url(#gold-line-left)" strokeWidth="1" />
                  <path d="M 85,12 L 91,6 L 97,12 L 91,18 Z" fill="url(#gold-grad-ornament)" />
                  <circle cx="91" cy="12" r="1.2" fill="currentColor" className="text-[#020d0a] light:text-[#f4fbf7]" />
                  <path d="M 103,12 L 107,8 L 111,12 L 107,16 Z" fill="url(#gold-grad-ornament)" />
                  <circle cx="117" cy="12" r="2" fill="url(#gold-grad-ornament)" />
                  <defs>
                    <linearGradient id="gold-line-left" x1="0" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="100%" stopColor="#6ee7b7" />
                    </linearGradient>
                    <linearGradient id="gold-grad-ornament" x1="85" y1="6" x2="117" y2="18" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#d1fae5" />
                      <stop offset="50%" stopColor="#6ee7b7" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <h2 className="text-4xl sm:text-5xl font-semibold tracking-[-0.04em] font-sans text-[#f8fffb] light:text-[#0b2419] drop-shadow-sm select-none">
                Our Team
              </h2>

              {/* Right Ornament */}
              <div className="team-ornament hidden shrink-0 sm:block">
                <svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 120,12 L 40,12" stroke="url(#gold-line-right)" strokeWidth="1" />
                  <path d="M 35,12 L 29,6 L 23,12 L 29,18 Z" fill="url(#gold-grad-ornament)" />
                  <circle cx="29" cy="12" r="1.2" fill="currentColor" className="text-[#020d0a] light:text-[#f4fbf7]" />
                  <path d="M 17,12 L 13,8 L 9,12 L 13,16 Z" fill="url(#gold-grad-ornament)" />
                  <circle cx="3" cy="12" r="2" fill="url(#gold-grad-ornament)" />
                  <defs>
                    <linearGradient id="gold-line-right" x1="120" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="100%" stopColor="#6ee7b7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </ScrollReveal>

          {/* Cards Grid */}
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-3">

            {/* Left Column - Kati & Amin */}
            <ScrollReveal delay={0} className="h-full flex flex-col">
              <div className="flex flex-col gap-8 order-2 md:order-none w-full">

                {/* Mopara Pair Ayat */}
                <div className="team-profile-card group relative flex flex-col items-center rounded-[24px] border border-[#6ee7b7]/10 bg-gradient-to-b from-[#091b15]/40 to-[#040d0a]/90 p-6 pt-8 backdrop-blur-md transition-all duration-500 hover:border-[#6ee7b7]/35 hover:shadow-[0_15px_30px_rgba(52,211,153,0.06)]">
                  <div className="relative w-[130px] h-[160px] rounded-t-full border border-white/80 light:border-emerald-700/15 overflow-hidden shadow-lg shadow-black/40 light:shadow-[#0d2a1d]/5">
                    <Image
                      src="/landing/team/ayat.png"
                      alt="Mopara Pair Ayat"
                      fill
                      sizes="130px"
                      draggable={false}
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                    />
                    {/* Transparent overlay to prevent right click save */}
                    <div
                      className="absolute inset-0 z-10 bg-transparent select-none"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                  <h3 className="text-xl font-medium font-sans text-[#f8fffb] light:text-[#0b2419] tracking-wide text-center mt-5">
                    Mopara Pair Ayat
                  </h3>
                  <p className="text-xs text-[#6ee7b7]/80 light:text-[#047857] tracking-wider text-center mt-1 uppercase font-semibold">
                    Founder & Lead Developer
                  </p>
                </div>

                {/* Emre Demir */}
                <div className="team-profile-card group relative flex flex-col items-center rounded-[24px] border border-[#6ee7b7]/10 bg-gradient-to-b from-[#091b15]/40 to-[#040d0a]/90 p-6 pt-8 backdrop-blur-md transition-all duration-500 hover:border-[#6ee7b7]/35 hover:shadow-[0_15px_30px_rgba(52,211,153,0.06)]">
                  <div className="relative w-[130px] h-[160px] rounded-t-full border border-white/80 light:border-emerald-700/15 overflow-hidden shadow-lg shadow-black/40 light:shadow-[#0d2a1d]/5 bg-emerald-950/20 light:bg-emerald-100/10">
                    <Image
                      src="/landing/team/emre_avatar.png"
                      alt="Emre Demir"
                      fill
                      sizes="130px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-xl font-medium font-sans text-[#f8fffb] light:text-[#0b2419] tracking-wide text-center mt-5">
                    Emre Demir
                  </h3>
                  <p className="text-xs text-[#6ee7b7]/80 light:text-[#047857] tracking-wider text-center mt-1 uppercase font-semibold">
                    Database Architect
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Center Column - Featured Mopara Pair Ayat */}
            <ScrollReveal delay={150} className="h-full flex flex-col justify-center">
              <div className="team-center-shell relative order-1 mx-auto flex h-[592px] w-full max-w-[360px] flex-col items-center justify-between px-8 pb-9 pt-16 md:order-none group">
                {/* Custom Pointed Arch Background */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 transition-transform duration-500 group-hover:scale-[1.01]" viewBox="0 0 360 520" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 2,518 L 2,90 L 180,2 L 358,90 L 358,518 Z" fill="url(#center-card-bg-gradient)" stroke="url(#center-gold-border-gradient)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="stroke-[#6ee7b7]/50 light:stroke-[#6ee7b7]/80" />
                  <defs>
                    <linearGradient id="center-card-bg-gradient" x1="180" y1="0" x2="180" y2="520" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="var(--center-card-bg-start)" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="var(--center-card-bg-end)" stopOpacity="0.95" />
                    </linearGradient>
                    <linearGradient id="center-gold-border-gradient" x1="0" y1="0" x2="360" y2="520" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="25%" stopColor="#6ee7b7" />
                      <stop offset="75%" stopColor="#d1fae5" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="relative z-10 w-full flex flex-col items-center">
                  {/* Photo */}
                  <div className="relative w-[160px] h-[195px] rounded-t-full border border-white/95 light:border-emerald-700/20 overflow-hidden shadow-xl shadow-black/50 light:shadow-[#0d2a1d]/8 bg-emerald-950/20 light:bg-emerald-100/10">
                    <Image
                      src="/landing/team/afsana_tabassum.png"
                      alt="Afsana Tabassum Tamishra"
                      fill
                      sizes="160px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Info */}
                  <h3 className="text-2xl font-bold font-sans text-[#f8fffb] light:text-[#0b2419] tracking-wide text-center mt-4">
                    Afsana Tabassum Tamishra
                  </h3>
                  <p className="text-xs text-[#6ee7b7] light:text-[#047857] tracking-wider text-center mt-1.5 uppercase font-semibold">
                    Lecturer & Project Advisor
                  </p>
                  <p className="text-xs text-slate-300 light:text-[#2d4d3f] leading-relaxed text-center mt-3 px-4 font-light max-w-[280px]">
                    Lecturer at BITHM College of Professionals. Project advisor and coordinator guiding the design and development of Nexora OS.
                  </p>

                  {/* Social Links */}
                  <div className="flex items-center justify-center gap-5 mt-3">
                    <a href="#" className="text-slate-400 light:text-[#386450] hover:text-[#6ee7b7] light:hover:text-[#047857] transition-colors duration-300" aria-label="LinkedIn">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                    <a href="#" className="text-slate-400 light:text-[#386450] hover:text-[#6ee7b7] light:hover:text-[#047857] transition-colors duration-300" aria-label="Facebook">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                    </a>
                    <a href="#" className="text-slate-400 light:text-[#386450] hover:text-[#6ee7b7] light:hover:text-[#047857] transition-colors duration-300" aria-label="Twitter">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Read More button */}
                <div className="relative z-10 mt-5 flex w-full justify-center">
                  <button className="border border-[#6ee7b7]/50 bg-black/40 px-8 py-2.5 text-xs font-medium tracking-widest text-white transition-colors duration-300 hover:bg-[#6ee7b7] hover:text-black light:border-emerald-700/25 light:bg-white light:text-[#0b2419] light:shadow-[0_8px_20px_rgba(25,75,50,0.07)] light:hover:bg-emerald-700 light:hover:text-white">
                    Read More
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Column - Mopara Pair Ayat & Tomas */}
            <ScrollReveal delay={300} className="h-full flex flex-col">
              <div className="flex flex-col gap-8 order-3 md:order-none w-full">

                {/* Taen Ahammed */}
                <div className="team-profile-card group relative flex flex-col items-center rounded-[24px] border border-[#6ee7b7]/10 bg-gradient-to-b from-[#091b15]/40 to-[#040d0a]/90 p-6 pt-8 backdrop-blur-md transition-all duration-500 hover:border-[#6ee7b7]/35 hover:shadow-[0_15px_30px_rgba(52,211,153,0.06)]">
                  <div className="relative w-[130px] h-[160px] rounded-t-full border border-white/80 light:border-emerald-700/15 overflow-hidden shadow-lg shadow-black/40 light:shadow-[#0d2a1d]/5 bg-emerald-950/20 light:bg-emerald-100/10">
                    <Image
                      src="/landing/team/tomas_avatar.png"
                      alt="Taen Ahammed"
                      fill
                      sizes="130px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-xl font-medium font-sans text-[#f8fffb] light:text-[#0b2419] tracking-wide text-center mt-5">
                    Taen Ahammed
                  </h3>
                  <p className="text-xs text-[#6ee7b7]/80 light:text-[#047857] tracking-wider text-center mt-1 uppercase font-semibold">
                    UI/UX Designer
                  </p>
                </div>

                {/* Fatima Rahman */}
                <div className="team-profile-card group relative flex flex-col items-center rounded-[24px] border border-[#6ee7b7]/10 bg-gradient-to-b from-[#091b15]/40 to-[#040d0a]/90 p-6 pt-8 backdrop-blur-md transition-all duration-500 hover:border-[#6ee7b7]/35 hover:shadow-[0_15px_30px_rgba(52,211,153,0.06)]">
                  <div className="relative w-[130px] h-[160px] rounded-t-full border border-white/80 light:border-emerald-700/15 overflow-hidden shadow-lg shadow-black/40 light:shadow-[#0d2a1d]/5 bg-emerald-950/20 light:bg-emerald-100/10">
                    <Image
                      src="/landing/team/kati_avatar.png"
                      alt="Fatima Rahman"
                      fill
                      sizes="130px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-xl font-medium font-sans text-[#f8fffb] light:text-[#0b2419] tracking-wide text-center mt-5">
                    Fatima Rahman
                  </h3>
                  <p className="text-xs text-[#6ee7b7]/80 light:text-[#047857] tracking-wider text-center mt-1 uppercase font-semibold">
                    Lead Frontend Engineer
                  </p>
                </div>
              </div>
            </ScrollReveal>

          </div>

          {/* Bottom pulsing arrow indicator */}
          <div className="mt-12 flex justify-center">
            <a href="#faq" className="group flex items-center justify-center w-11 h-11 rounded-full border border-white/10 light:border-emerald-800/15 hover:border-[#6ee7b7]/40 light:hover:border-[#6ee7b7]/60 bg-black/20 light:bg-white/40 hover:bg-emerald-950/30 light:hover:bg-emerald-50/50 transition-all duration-300 select-none cursor-pointer">
              <svg className="w-5 h-5 text-white/50 light:text-emerald-800/60 group-hover:text-[#6ee7b7] light:group-hover:text-[#047857] transition-colors duration-300 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

        </div>
      </section>

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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300 light:text-emerald-700">
                Questions
              </p>
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
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-accent-primary/15 bg-gradient-to-br from-accent-solid via-accent-solid to-accent-primary/20 px-6 py-14 text-center shadow-[0_24px_64px_rgba(var(--theme-accent-primary-rgb-raw),0.18)] sm:px-10">
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

      <footer id="site-footer" className="px-5 py-12 md:px-8 bg-[#07100b] light:bg-[#e5eee8]">
        <style dangerouslySetInnerHTML={{
          __html: `
          .footer-card {
            position: relative;
            background: linear-gradient(145deg, rgba(8, 12, 10, 0.85) 0%, rgba(5, 8, 7, 0.96) 100%), url('/landing/footer-bg-brand.png') no-repeat center center / cover;
            border: 1px solid rgba(var(--theme-accent-primary-rgb-raw),0.16);
            border-radius: 20px;
            padding: 0;
            max-width: 1280px; /* Matched to 7xl header width */
            margin: 0 auto;
            overflow: hidden;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.5), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(var(--theme-accent-primary-rgb-raw),0.05);
          }
          .light .footer-card {
            background: linear-gradient(145deg, rgba(250, 253, 251, 0.88) 0%, rgba(243, 248, 245, 0.94) 100%), url('/landing/footer-bg-brand-light.png') no-repeat center center / cover;
            border: 1px solid rgba(var(--theme-emerald-rgb-raw),0.18);
            box-shadow: 0 0 0 1px rgba(0,0,0,0.02), 0 20px 48px rgba(var(--theme-emerald-rgb-raw),0.08);
          }
          .footer-card-inner {
            padding: 24px 20px 20px; /* Small screen padding */
          }
          @media (min-width: 768px) {
            .footer-card-inner {
              padding: 36px 40px 28px; /* Desktop padding */
            }
          }
          .footer-accent-bar {
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, rgba(var(--theme-accent-primary-rgb-raw),0.7) 30%, rgba(var(--theme-accent-secondary-rgb-raw),0.6) 65%, transparent 100%);
          }
          .light .footer-accent-bar {
            background: linear-gradient(90deg, transparent 0%, rgba(var(--theme-emerald-rgb-raw),0.5) 30%, rgba(var(--theme-accent-secondary-rgb-raw),0.4) 65%, transparent 100%);
          }
          .footer-social-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.10);
            color: rgba(255,255,255,0.45);
            transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
          }
          .light .footer-social-icon {
            border-color: rgba(15,23,42,0.12);
            color: rgba(15,23,42,0.55);
          }
          .footer-social-icon:hover {
            border-color: rgba(var(--theme-accent-primary-rgb-raw), 0.5);
            color: var(--theme-accent-primary);
            background: rgba(var(--theme-accent-primary-rgb-raw), 0.08);
            box-shadow: 0 0 12px rgba(var(--theme-accent-primary-rgb-raw), 0.25);
            transform: translateY(-2px);
          }
          .light .footer-social-icon:hover {
            border-color: rgba(var(--theme-accent-primary-rgb-raw), 0.6);
            color: var(--theme-accent-solid);
            background: rgba(var(--theme-accent-primary-rgb-raw), 0.06);
            box-shadow: 0 0 12px rgba(var(--theme-accent-primary-rgb-raw), 0.2);
            transform: translateY(-2px);
          }
          .footer-nav-link {
            font-size: 13px;
            color: rgba(255,255,255,0.4);
            transition: color 0.25s ease, text-shadow 0.25s ease, padding-left 0.25s ease;
            text-decoration: none;
          }
          .light .footer-nav-link {
            color: rgba(15,23,42,0.6);
          }
          .footer-nav-link:hover { 
            color: var(--theme-accent-primary); 
            text-shadow: 0 0 8px rgba(var(--theme-accent-primary-rgb-raw), 0.4);
            padding-left: 2px;
          }
          .light .footer-nav-link:hover { 
            color: var(--theme-accent-solid); 
            text-shadow: none;
            padding-left: 2px;
          }
          
          .footer-divider {
            height: 1px;
            border: none;
            background: linear-gradient(90deg, 
              rgba(255,255,255,0.02) 0%, 
              rgba(var(--theme-accent-primary-rgb-raw), 0.15) 50%, 
              rgba(255,255,255,0.02) 100%
            );
            margin: 32px 0 20px;
          }
          .light .footer-divider {
            background: linear-gradient(90deg, 
              rgba(15,23,42,0.02) 0%, 
              rgba(var(--theme-accent-primary-rgb-raw), 0.18) 50%, 
              rgba(15,23,42,0.02) 100%
            );
          }
          
          .footer-column-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: rgba(255,255,255,0.75);
          }
          .light .footer-column-title {
            color: rgba(15,23,42,0.8);
          }
          
          .footer-bithm-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: rgba(var(--theme-accent-primary-rgb-raw),0.55);
            border: 1px solid rgba(var(--theme-accent-primary-rgb-raw),0.15);
            border-radius: 99px;
            padding: 3px 10px;
          }
          .light .footer-bithm-badge {
            color: #047857;
            border-color: rgba(var(--theme-emerald-rgb-raw),0.25);
          }
          .footer-status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: rgba(52, 211, 153, 0.7);
            border: 1px solid rgba(52, 211, 153, 0.15);
            border-radius: 99px;
            padding: 3px 10px;
            background: rgba(52, 211, 153, 0.03);
          }
          .light .footer-status-badge {
            color: #059669;
            border-color: rgba(5, 150, 105, 0.2);
            background: rgba(5, 150, 105, 0.02);
          }
          .footer-logo-container img {
            mix-blend-mode: screen;
            filter: brightness(1.1) saturate(1.5);
          }
          .light .footer-logo-container img {
            mix-blend-mode: normal !important;
            filter: none !important;
          }
        ` }} />

        <div className="footer-card">
          <div className="footer-accent-bar" />

          <div className="footer-card-inner">
            {/* Grid layout for brand and link columns */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {/* Brand column - spans 2 columns on larger screens */}
              <div className="lg:col-span-2 md:col-span-2 sm:col-span-2">
                <div className="footer-logo-container">
                  <NexoraLogo
                    size="md"
                    className="h-11 w-[168px]"
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-400 light:text-slate-600 max-w-sm">
                  Assignments, lab work, coding tools, feedback, and course
                  administration — all in one place.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="footer-bithm-badge">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <circle cx="4" cy="4" r="3" fill="var(--theme-accent-primary)" className="light:fill-[#059669]" />
                    </svg>
                    Built for BITHM
                  </span>
                  <span className="footer-status-badge">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    All services online
                  </span>
                </div>
              </div>

              {/* Column 2: Platform */}
              <div>
                <h3 className="footer-column-title">Platform</h3>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <a href="#" className="footer-nav-link block">Home</a>
                  </li>
                  <li>
                    <a href="#platform" className="footer-nav-link block">Features</a>
                  </li>
                  <li>
                    <a href="#demo" className="footer-nav-link block">Workspaces & Roles</a>
                  </li>
                </ul>
              </div>

              {/* Column 3: Resources */}
              <div>
                <h3 className="footer-column-title">Resources</h3>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <a href="#how-it-works" className="footer-nav-link block">How It Works</a>
                  </li>
                  <li>
                    <a href="#faq" className="footer-nav-link block">FAQs</a>
                  </li>
                  <li>
                    <a href="#team" className="footer-nav-link block">Meet The Team</a>
                  </li>
                </ul>
              </div>

              {/* Column 4: Connect */}
              <div>
                <h3 className="footer-column-title">Connect</h3>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <a href="#contact" className="footer-nav-link block">Contact Us</a>
                  </li>
                </ul>
                <div className="mt-5 flex items-center gap-2">
                  <a href="#" aria-label="Facebook" className="footer-social-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                  <a href="#" aria-label="X / Twitter" className="footer-social-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="#" aria-label="Instagram" className="footer-social-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>
                  <a href="#" aria-label="LinkedIn" className="footer-social-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Column 5: Stay Updated */}
              <div>
                <h3 className="footer-column-title">Stay Updated</h3>
                <p className="mt-4 text-xs leading-5 text-slate-400 light:text-slate-600">
                  Subscribe to receive platform news and local updates.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Thank you for subscribing to Nexora OS updates!");
                    (e.target as HTMLFormElement).reset();
                  }}
                  className="mt-4 flex gap-1.5"
                >
                  <input
                    type="email"
                    required
                    placeholder="Your email..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-[var(--theme-accent-primary)]/50 focus:bg-white/8 light:border-slate-200 light:bg-slate-50 light:text-slate-900 light:placeholder-slate-400 light:focus:border-emerald-500/50 light:focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90 active:scale-95 shadow-md"
                    aria-label="Subscribe"
                  >
                    Join
                  </button>
                </form>
              </div>
            </div>

            {/* Divider */}
            <hr className="footer-divider" />

            {/* Bottom: copyright | tagline */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
              <p className="text-xs text-slate-500">
                © 2026 Nexora OS · BITHM. All Rights Reserved. <span className="mx-1">·</span> Developed by <span className="text-emerald-400 font-semibold">Mopara Pair Ayat</span>
              </p>
              
              <div className="flex items-center justify-center gap-4 sm:justify-end">
                <span className="text-xs text-slate-650 light:text-slate-600">Designed for students. Built for institutions.</span>
                
                {/* Back to top button */}
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="group/totop flex h-7 w-7 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:border-[var(--theme-accent-primary)]/50 hover:bg-[rgba(var(--theme-accent-primary-rgb-raw),0.08)] hover:text-white hover:scale-105 active:scale-95 light:border-slate-200 light:bg-slate-50 light:text-slate-600 light:hover:border-emerald-500/50 light:hover:bg-emerald-50 light:hover:text-emerald-700 shadow-md"
                  title="Scroll to Top"
                  aria-label="Scroll to Top"
                >
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover/totop:-translate-y-0.5"
                  >
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <PandaChat />
    </main>
  );
}


