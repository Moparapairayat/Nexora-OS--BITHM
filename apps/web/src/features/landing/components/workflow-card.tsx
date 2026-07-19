import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  FileCheck2,
  FileText,
  FlaskConical,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type WorkflowCardProps = {
  action: string;
  detail: string;
  icon: LucideIcon;
  index: number;
  label: string;
  title: string;
};

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

function CourseworkMedia() {
  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_78%_18%,rgba(52,211,153,0.16),transparent_34%),linear-gradient(145deg,#07130e_0%,#0a2118_100%)] light:bg-[radial-gradient(circle_at_78%_18%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(145deg,#eef8f2_0%,#e4f2ea_100%)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-25 light:opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(rgba(52,211,153,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.12) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "linear-gradient(to bottom, transparent, black 28%, black)",
        }}
      />

      <div className="absolute inset-x-3 bottom-[-12px] top-5 sm:inset-x-5">
        <Image
          src="/landing/workflows/academic-workspace-cutout.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 32vw, (min-width: 768px) 46vw, 92vw"
          className="object-contain object-bottom drop-shadow-[0_22px_24px_rgba(0,0,0,0.24)] light:drop-shadow-[0_18px_20px_rgba(32,89,60,0.14)]"
        />
      </div>

      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#07120e]/75 px-3 py-1.5 text-[10px] font-semibold text-emerald-100 shadow-sm backdrop-blur-md light:border-white/80 light:bg-white/78 light:text-emerald-800">
        <FileText className="h-3.5 w-3.5" />
        Coursework workspace
      </div>
      <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-[#07120e]/82 px-3 py-1.5 text-[10px] font-semibold text-emerald-200 shadow-md backdrop-blur-md light:border-emerald-700/12 light:bg-white/86 light:text-emerald-800">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Evidence organised
      </div>
    </div>
  );
}

function LabMedia() {
  return (
    <div className="relative h-full overflow-hidden bg-[#07110d]">
      <Image
        src="/landing/student_desk_portrait.png"
        alt=""
        fill
        sizes="(min-width: 1024px) 32vw, (min-width: 768px) 46vw, 92vw"
        className="object-cover object-[58%_62%] saturate-[0.78] contrast-[1.03] light:saturate-[0.9]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,10,7,0.08)_0%,rgba(2,12,8,0.22)_46%,rgba(2,12,8,0.9)_100%)]" />
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#06110c]/45 to-transparent" />

      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/18 bg-black/30 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md">
        <Code2 className="h-3.5 w-3.5 text-cyan-200" />
        Live practice
      </div>
      <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/18 bg-black/30 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md">
        <FlaskConical className="h-3.5 w-3.5 text-emerald-200" />
        Tests ready
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/75">
            Practical workflow
          </p>
          <p className="mt-1 text-sm font-semibold text-white">Code, test, then document</p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/18 bg-white/10 text-white backdrop-blur-md">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function ProgressMedia() {
  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_76%_28%,rgba(251,191,36,0.12),transparent_34%),linear-gradient(145deg,#07110d_0%,#101a14_100%)] light:bg-[radial-gradient(circle_at_76%_28%,rgba(245,158,11,0.12),transparent_34%),linear-gradient(145deg,#f6f8f5_0%,#edf2ed_100%)]">
      <div className="absolute -right-6 bottom-[-42px] top-2 w-[82%] sm:-right-3 sm:w-[78%]">
        <Image
          src="/landing/desktop-mockup.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 27vw, (min-width: 768px) 40vw, 78vw"
          className="object-contain object-right-bottom drop-shadow-[0_20px_24px_rgba(0,0,0,0.28)] light:drop-shadow-[0_18px_20px_rgba(43,62,50,0.15)]"
        />
      </div>
      <div className="absolute inset-y-0 left-0 w-[58%] bg-gradient-to-r from-[#07110d] via-[#07110d]/88 to-transparent light:from-[#f4f7f3] light:via-[#f4f7f3]/88" />

      <div className="absolute left-5 top-5 max-w-[160px]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200 light:text-amber-700">
          Progress in context
        </p>
        <p className="mt-2 text-sm font-semibold leading-5 text-white light:text-slate-900">
          Feedback stays beside the work.
        </p>
      </div>
      <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-amber-300/18 bg-[#111a14]/80 px-3 py-1.5 text-[10px] font-semibold text-amber-100 shadow-md backdrop-blur-md light:border-amber-700/12 light:bg-white/86 light:text-amber-800">
        <FileCheck2 className="h-3.5 w-3.5" />
        Ready for review
      </div>
    </div>
  );
}

function WorkflowMedia({ index }: { index: number }) {
  return (
    <div
      aria-hidden="true"
      className="relative h-[205px] shrink-0 overflow-hidden border-t border-white/9 sm:h-[220px] light:border-slate-200/90"
    >
      {index === 0 && <CourseworkMedia />}
      {index === 1 && <LabMedia />}
      {index === 2 && <ProgressMedia />}
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
