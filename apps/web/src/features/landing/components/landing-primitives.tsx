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
