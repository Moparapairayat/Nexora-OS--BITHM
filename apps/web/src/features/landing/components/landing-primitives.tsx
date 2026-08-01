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
      { threshold: 0.05, rootMargin: "0px 0px -30px 0px" },
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
        transform: isVisible ? "translate3d(0, 0, 0)" : "translate3d(0, 18px, 0)",
        transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: "transform, opacity",
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
      <div className="overflow-visible inline-flex items-center justify-center max-w-full">
        <span className="font-3d-neon-script text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-wide transform -rotate-2 select-none text-center">
          {eyebrow}
        </span>
      </div>
      <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-xs font-medium leading-relaxed text-slate-300/85 sm:text-sm light:text-slate-600">
        {detail}
      </p>
    </div>
  );
}
