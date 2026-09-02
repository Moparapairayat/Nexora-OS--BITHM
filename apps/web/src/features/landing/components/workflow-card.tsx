import { useState, useEffect, useRef, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  FileText,
  Folder,
  Play,
  Check,
  MessageSquare,
  Clock,
  Terminal,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type WorkflowCardProps = {
  action: string;
  detail: string;
  icon: LucideIcon;
  index: number;
  label: string;
  title: string;
};

function useIntersection(elementRef: React.RefObject<Element | null>) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => {
      observer.unobserve(el);
    };
  }, [elementRef]);

  return isIntersecting;
}

const cardTones = [
  {
    accent: "bg-emerald-400 light:bg-emerald-600",
    icon: "border-emerald-300/18 bg-emerald-300/8 text-emerald-300 light:border-emerald-700/12 light:bg-emerald-50 light:text-emerald-700",
    meta: "text-emerald-300 light:text-emerald-700",
  },
  {
    accent: "bg-cyan-300 light:bg-cyan-600",
    icon: "border-cyan-300/18 bg-cyan-300/8 text-cyan-200 light:border-cyan-700/12 light:bg-cyan-50 light:text-cyan-700",
    meta: "text-cyan-200 light:text-cyan-700",
  },
  {
    accent: "bg-amber-300 light:bg-amber-500",
    icon: "border-amber-300/18 bg-amber-300/8 text-amber-200 light:border-amber-700/12 light:bg-amber-50 light:text-amber-700",
    meta: "text-amber-200 light:text-amber-700",
  },
] as const;

function CourseworkMedia(_: { isActive?: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07130e] text-left font-sans select-none light:bg-[#f3f9f5]">
      {/* Grid Pattern overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03] light:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="flex h-full w-full">
        {/* Mock File explorer */}
        <div className="w-[32%] shrink-0 border-r border-white/5 bg-[#050d0a]/60 p-2.5 light:border-slate-200 light:bg-slate-100/50">
          <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-500 light:text-slate-400 mb-2">Files</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[9px] text-emerald-300 light:text-emerald-700 font-medium">
              <Folder className="h-2.5 w-2.5" />
              <span className="truncate">assignment-1</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-300 light:text-slate-700 pl-2 font-medium">
              <FileText className="h-2.5 w-2.5 text-emerald-400" />
              <span className="truncate">brief.md</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-500 pl-2">
              <Folder className="h-2.5 w-2.5" />
              <span className="truncate">src/</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-500 pl-2">
              <Folder className="h-2.5 w-2.5" />
              <span className="truncate">tests/</span>
            </div>
          </div>
        </div>

        {/* Mock Document Pane */}
        <div className="flex-1 p-3.5 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium text-emerald-400 light:bg-emerald-50 light:text-emerald-700">
                Lab 01
              </span>
              <span className="text-[8px] text-slate-500 light:text-slate-400 flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" /> Due in 3d
              </span>
            </div>
            <h4 className="mt-1.5 text-xs font-semibold text-white light:text-slate-900 leading-tight">
              Routing & Layouts in NextJS
            </h4>
            <p className="mt-1 text-[9.5px] text-slate-400 light:text-slate-600 leading-normal line-clamp-2">
              Implement dynamic route parameters, define nested layouts, and manage responses.
            </p>

            <div className="mt-2.5 space-y-1">
              <div className="flex items-center gap-1 text-[9px] text-slate-300 light:text-slate-700">
                <Check className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                <span className="truncate">Implement nested layouts in /app</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-slate-300 light:text-slate-700">
                <Check className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                <span className="truncate">Add dynamic handler in /api</span>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <button className="w-full inline-flex items-center justify-center gap-1 rounded bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold text-white shadow shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all">
              <Play className="h-2.5 w-2.5 fill-current animate-pulse" />
              Start Lab Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabMedia({ isActive = true }: { isActive?: boolean }) {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<"idle" | "typing" | "running" | "success">("idle");
  const [typedText, setTypedText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const isIntersected = useIntersection(containerRef);

  const fullCommand = "npm run test";

  const pendingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearPendingTimers = useCallback(() => {
    pendingTimers.current.forEach(clearTimeout);
    pendingTimers.current = [];
  }, []);

  const triggerTestRun = useCallback(() => {
    clearPendingTimers();
    setTestStatus("typing");
    setTerminalLines([]);
    setTypedText("");

    let charIndex = 0;

    const typeNextChar = () => {
      if (charIndex < fullCommand.length) {
        setTypedText(fullCommand.slice(0, charIndex + 1));
        const char = fullCommand[charIndex];
        charIndex++;

        // Variable human typing speeds
        let delay = 40 + Math.random() * 40; // 40-80ms standard
        if (char === " ") {
          delay = 180 + Math.random() * 80; // space reflection
        } else if (char === "-" || char === ".") {
          delay = 150 + Math.random() * 80; // symbols delay
        }

        pendingTimers.current.push(setTimeout(typeNextChar, delay));
      } else {
        setTestStatus("running");
        setTerminalLines(["$ npm run test"]);

        pendingTimers.current.push(
          setTimeout(() => {
            setTerminalLines((prev) => [...prev, "✓ page.test.tsx passed (118ms)"]);
          }, 700),
          setTimeout(() => {
            setTerminalLines((prev) => [
              ...prev,
              "✓ route.test.ts passed (45ms)",
              "ALL TESTS PASSING (12 Passed, 0 Failed)"
            ]);
            setTestStatus("success");
          }, 1500),
        );
      }
    };

    // Human pause delay before typing begins
    pendingTimers.current.push(setTimeout(typeNextChar, 600));
  }, [clearPendingTimers, fullCommand]);

  useEffect(() => {
    if (!isActive || !isIntersected) {
      clearPendingTimers();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting UI state alongside ref-based timer cleanup, which can't happen during render
      setTestStatus("idle");
      setTerminalLines([]);
      setTypedText("");
      return;
    }

    triggerTestRun();

    return clearPendingTimers;
  }, [isActive, isIntersected, triggerTestRun, clearPendingTimers]);

  const handleRunTestsManually = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (testStatus === "running" || testStatus === "typing") return;
    triggerTestRun();
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-[#071113] text-left font-mono select-none light:bg-[#f3f8f9]">
      <div className="flex h-full w-full flex-col">
        {/* Editor tabs */}
        <div className="flex h-6.5 w-full border-b border-white/5 bg-[#050b0c]/60 px-2 light:border-slate-200 light:bg-slate-100/50 items-center justify-between">
          <div className="flex items-center h-full">
            <div className="flex items-center gap-1 border-r border-white/5 bg-[#071113] px-2.5 text-[9px] text-cyan-300 font-medium h-full light:border-slate-200 light:bg-[#f3f8f9] light:text-cyan-700">
              <Code2 className="h-2.5 w-2.5 animate-pulse" />
              <span>page.tsx</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 text-[9px] text-slate-500 h-full">
              <span>route.ts</span>
            </div>
          </div>

          {/* Interactive Button */}
          <button
            onClick={handleRunTestsManually}
            disabled={testStatus === "typing" || testStatus === "running"}
            className={`mr-1 px-1.5 py-0.5 rounded text-[8px] font-semibold flex items-center gap-1 transition-all ${
              testStatus === "typing" || testStatus === "running"
                ? "bg-cyan-500/10 text-cyan-400/40 cursor-not-allowed"
                : "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 active:scale-95 light:bg-cyan-100 light:text-cyan-800"
            }`}
          >
            {testStatus === "running" ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : (
              <Play className="h-2.5 w-2.5 fill-current" />
            )}
            Run Tests
          </button>
        </div>

        {/* Code Content & Terminal */}
        <div className="flex-1 flex flex-col justify-between p-2.5 overflow-hidden">
          {/* Mock code block */}
          <div className="text-[9.5px] leading-relaxed space-y-0.5 text-slate-300 light:text-slate-750">
            <div>
              <span className="text-pink-400 font-medium">import</span>{" "}
              <span className="text-blue-350 dark:text-blue-300 light:text-blue-700">{"{ NextResponse }"}</span>{" "}
              <span className="text-pink-400">from</span>{" "}
              <span className="text-emerald-450 dark:text-emerald-300 light:text-emerald-700 font-semibold">&quot;next/server&quot;</span>;
            </div>
            <div>
              <span className="text-pink-400">export async function</span>{" "}
              <span className="text-yellow-250 dark:text-yellow-200 light:text-yellow-750 font-medium">GET</span>() {"{"}
            </div>
            <div className="pl-3">
              <span className="text-pink-400">return</span>{" "}
              <span className="text-blue-355 dark:text-blue-300 light:text-blue-700">NextResponse</span>.
              <span className="text-yellow-255 dark:text-yellow-200 light:text-yellow-750">json</span>({"{"}
            </div>
            <div className="pl-6">
              <span className="text-orange-400 dark:text-orange-300">status</span>:{" "}
              <span className="text-emerald-450 dark:text-emerald-300 light:text-emerald-700">&quot;success&quot;</span>,
            </div>
            <div className="pl-6">
              <span className="text-orange-400 dark:text-orange-300">evidence</span>:{" "}
              <span className="text-emerald-450 dark:text-emerald-300 light:text-emerald-700">&quot;bundled&quot;</span>
            </div>
            <div className="pl-3">{"});"}</div>
            <div>{"}"}</div>
          </div>

          {/* Terminal output box */}
          <div className="rounded border border-cyan-500/10 bg-[#040809]/95 p-2 light:border-slate-200 light:bg-slate-100/80 min-h-[58px] flex flex-col justify-center">
            <div className="flex items-center gap-1 text-[8px] text-slate-500 light:text-slate-400 mb-0.5">
              <Terminal className="h-2.5 w-2.5 text-cyan-400" />
              <span>terminal</span>
            </div>

            {testStatus === "typing" && (
              <p className="text-[8.5px] text-slate-300 light:text-slate-700 leading-none">
                $ {typedText}
                <span className="animate-pulse bg-cyan-300 text-transparent ml-0.5">|</span>
              </p>
            )}

            {testStatus === "running" && (
              <div className="space-y-0.5">
                <p className="text-[8.5px] text-slate-300 light:text-slate-700 leading-none">$ npm run test</p>
                <p className="text-[8.5px] text-cyan-400/80 leading-none animate-pulse flex items-center gap-1">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  Running test suites...
                </p>
                {terminalLines.slice(1).map((line, idx) => (
                  <p key={idx} className="text-[8px] text-slate-450 light:text-slate-650 leading-none">{line}</p>
                ))}
              </div>
            )}

            {testStatus === "success" && (
              <div className="space-y-0.5">
                <p className="text-[8.5px] text-slate-300 light:text-slate-700 leading-none">$ npm run test</p>
                <p className="text-[8px] text-slate-450 light:text-slate-600 leading-none">✓ page.test.tsx passed (118ms)</p>
                <p className="text-[8px] text-slate-450 light:text-slate-600 leading-none">✓ route.test.ts passed (45ms)</p>
                <p className="text-[8.5px] text-cyan-300 light:text-cyan-700 leading-none font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5 text-cyan-400 light:text-cyan-600" />
                  <span>ALL TESTS PASSING (12 Passed, 0 Failed)</span>
                </p>
              </div>
            )}

            {testStatus === "idle" && (
              <p className="text-[8.5px] text-slate-500 light:text-slate-450 leading-none">$ </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const confettiParticles = Array.from({ length: 28 }).map((_, i) => {
  const size = Math.random() * 5 + 3;
  const left = Math.random() * 100;
  const delay = Math.random() * 1.5;
  const duration = 1.6 + Math.random() * 1.4;
  const colors = ["#10b981", "#06b6d4", "#f59e0b", "#3b82f6", "#ec4899"];
  const color = colors[i % colors.length];
  // Sway multiplier: horizontal sway factor
  const sway = Math.random() > 0.5 ? 12 : -12;
  return { id: i, size, left, delay, duration, color, sway };
});

function ProgressMedia({ isActive = true }: { isActive?: boolean }) {
  const [submittingStatus, setSubmittingStatus] = useState<"editing" | "submitting" | "submitted">("editing");
  const [loadingStep, setLoadingStep] = useState(0);
  const pendingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearPendingTimers = useCallback(() => {
    pendingTimers.current.forEach(clearTimeout);
    pendingTimers.current = [];
  }, []);

  // Reset (and cancel any in-flight timers) when this card becomes inactive.
  // Ref cleanup can't happen during render, so this must stay an effect.
  useEffect(() => {
    if (!isActive) {
      clearPendingTimers();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting UI state alongside ref-based timer cleanup, which can't happen during render
      setSubmittingStatus("editing");
      setLoadingStep(0);
    }

    return clearPendingTimers;
  }, [isActive, clearPendingTimers]);

  const handleResubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (submittingStatus !== "editing") return;
    setSubmittingStatus("submitting");
    setLoadingStep(0);

    // Cycle loaders sequentially
    pendingTimers.current.push(
      setTimeout(() => setLoadingStep(1), 500),
      setTimeout(() => setLoadingStep(2), 1100),
      setTimeout(() => {
        setSubmittingStatus("submitted");
      }, 1700),
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0f1107] text-left font-sans select-none light:bg-[#fafaf4]">
      {/* CSS Confetti keyframes with horizontal translation sway */}
      <style>{`
        @keyframes driftDown {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(100px) translateX(12px) rotate(180deg);
            opacity: 0.95;
          }
          100% {
            transform: translateY(220px) translateX(-12px) rotate(360deg);
            opacity: 0;
          }
        }
        .confetti-particle {
          position: absolute;
          top: 0;
          animation: driftDown linear infinite;
        }
      `}</style>

      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <div className="flex h-6.5 w-full items-center justify-between border-b border-white/5 bg-[#0b0c05]/60 px-3 light:border-slate-200 light:bg-slate-100/50">
          <span className="text-[8px] font-semibold uppercase tracking-wider text-amber-300 light:text-amber-700">Review Dashboard</span>
          <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/10 px-1 py-0.2 text-[8px] font-medium text-amber-400 light:bg-amber-50 light:text-amber-700">
            Feedback loop active
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-2.5 flex flex-col justify-between overflow-hidden relative">
          
          {/* Main review view */}
          <div className="text-[9px] font-mono leading-relaxed text-slate-400 light:text-slate-500">
            <div>{"const cache = new Map();"}</div>
            <div className="bg-amber-500/10 -mx-2.5 px-2.5 py-0.2 border-l-2 border-amber-500 text-slate-200 light:text-slate-800">
              {"export const revalidate = 3600; // cache for 1 hr"}
            </div>
            <div>{"export async function fetchUser(id) {"}</div>
          </div>

          {/* Feedback comment bubble card */}
          <div className="rounded-lg border border-amber-500/15 bg-[#14160a]/98 p-2.5 shadow-lg backdrop-blur-sm light:border-slate-200 light:bg-white z-10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[8px] font-bold text-amber-200 light:text-amber-800">
                  SM
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-semibold text-white light:text-slate-900 leading-none">Prof. Sarah Miller</span>
                  <span className="text-[7px] text-slate-500 light:text-slate-400 mt-0.5">Mentor · 2h ago</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[7px] text-slate-400 light:text-slate-500">
                <MessageSquare className="h-2 w-2" /> Line 2
              </span>
            </div>
            <p className="mt-1 text-[8.5px] leading-relaxed text-slate-300 light:text-slate-600">
              &quot;Great dynamic routing choice! Let&apos;s ensure cache validation headers are added to optimize final build speed.&quot;
            </p>
            <div className="mt-2 flex items-center gap-1.5 justify-end">
              <button className="rounded px-1.5 py-0.5 text-[8px] font-medium text-slate-400 hover:text-white transition-colors">
                Resolve
              </button>
              <button
                onClick={handleResubmit}
                disabled={submittingStatus !== "editing"}
                className={`rounded bg-amber-500 px-1.5 py-0.5 text-[8px] font-bold text-white shadow hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-1`}
              >
                Update & Resubmit
              </button>
            </div>
          </div>

          {/* Submitting Loading Overlay */}
          {submittingStatus === "submitting" && (
            <div className="absolute inset-0 bg-[#0f1107]/90 light:bg-[#fafaf4]/90 z-20 flex flex-col items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
              <p className="mt-3 text-[10px] font-semibold text-white light:text-slate-900 transition-all duration-300">
                {loadingStep === 0 && "Analyzing revision changes..."}
                {loadingStep === 1 && "Running regression tests..."}
                {loadingStep === 2 && "Syncing report evidence..."}
              </p>
              <p className="mt-1 text-[8px] text-slate-500">Uploading revision to Nexora grading queue</p>
            </div>
          )}

          {/* Submitted Confetti Success Overlay */}
          {submittingStatus === "submitted" && (
            <div className="absolute inset-0 bg-[#0f1107]/95 light:bg-[#fafaf4]/95 z-20 flex flex-col items-center justify-center p-4 overflow-hidden">
              
              {/* Confetti Rain particles */}
              {confettiParticles.map((p) => (
                <div
                  key={p.id}
                  className="confetti-particle rounded-sm pointer-events-none"
                  style={{
                    left: `${p.left}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                  }}
                />
              ))}

              <div className="relative z-30 flex flex-col items-center text-center">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-450 light:text-emerald-700 animate-bounce">
                  <Check className="h-4 w-4 stroke-[3px]" />
                </div>
                <h5 className="mt-2.5 text-xs font-bold text-white light:text-slate-900 leading-none">Assignment Resubmitted!</h5>
                <p className="mt-1.5 text-[9px] text-slate-400 light:text-slate-650">Score: 100/100 · All checks passed</p>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSubmittingStatus("editing");
                  }}
                  className="mt-3.5 px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[8px] text-slate-350 hover:bg-white/10 transition-all light:border-slate-200 light:bg-slate-50 light:text-slate-700"
                >
                  View Review again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkflowMedia({ index, className, isActive = true }: { index: number; className?: string; isActive?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={className || "relative h-[205px] shrink-0 overflow-hidden border-t border-white/9 sm:h-[220px] light:border-slate-200/90"}
    >
      {index === 0 && <CourseworkMedia isActive={isActive} />}
      {index === 1 && <LabMedia isActive={isActive} />}
      {index === 2 && <ProgressMedia isActive={isActive} />}
    </div>
  );
}

export function WorkflowCard({ action, detail, icon: Icon, index, label, title }: WorkflowCardProps) {
  const tone = cardTones[index] ?? cardTones[0];
  const step = String(index + 1).padStart(2, "0");

  return (
    <article className="relative flex h-full min-h-[470px] flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#0b1510] shadow-[0_24px_54px_rgba(0,0,0,0.18)] transition-colors hover:border-white/18 sm:min-h-[490px] light:border-slate-200/90 light:bg-[#fbfcfb] light:shadow-[0_22px_48px_rgba(32,65,47,0.08)] light:hover:border-emerald-900/18">
      <span aria-hidden="true" className={`absolute inset-x-7 top-0 h-[2px] ${tone.accent}`} />

      <div className="flex flex-1 flex-col px-6 pb-6 pt-7 sm:px-7 sm:pb-7 sm:pt-8">
        <div className="flex items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${tone.icon}`}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className={`min-w-0 text-[9px] font-semibold uppercase leading-4 tracking-[0.12em] sm:text-[10px] sm:tracking-[0.15em] ${tone.meta}`}>
              {label}
            </span>
          </div>
          <span className="shrink-0 font-mono text-xs font-semibold text-slate-500 light:text-slate-400">
            {step}<span className="hidden text-slate-700 sm:inline light:text-slate-300"> / 03</span>
          </span>
        </div>

        <h3 className="mt-6 text-[1.55rem] font-semibold leading-[1.14] tracking-[-0.035em] text-white light:text-slate-900">
          {title}
        </h3>
        <p className="mt-3 max-w-[34rem] text-sm leading-6 text-slate-400 light:text-slate-600">
          {detail}
        </p>

        <Link
          href="/login"
          className="landing-focus-ring mt-auto inline-flex w-fit items-center gap-2 pt-5 text-sm font-semibold text-slate-100 transition-colors hover:text-emerald-200 light:text-slate-800 light:hover:text-emerald-800"
        >
          {action}
          <span className="grid h-7 w-7 place-items-center rounded-full border border-white/12 bg-white/5 light:border-slate-300 light:bg-white">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      <WorkflowMedia index={index} />
    </article>
  );
}
