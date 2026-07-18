"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
};

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.6,
  className,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 },
    );

    const element = ref.current;
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  detail: string;
};

export function SectionHeading({ eyebrow, title, detail }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="inline-flex rounded-full border border-emerald-300/15 bg-emerald-400/7 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300 light:border-emerald-700/12 light:bg-emerald-50 light:text-emerald-700">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-slate-400 light:text-slate-600 sm:text-base">
        {detail}
      </p>
    </div>
  );
}
