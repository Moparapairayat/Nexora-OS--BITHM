"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { NexoraLogo } from "@/components/brand/nexora-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pageScrollProgress, setPageScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("#about");

  useEffect(() => {
    let ticking = false;
    let lastSection = "";

    const handlePageScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // 1. Calculate vertical page scroll progress percentage
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          setPageScrollProgress(progress);

          // 2. Scroll spy to detect active section
          const sections = ["about", "platform", "how-it-works", "download", "team", "faq", "contact"];
          let currentSection = "#about";

          for (const sectionId of sections) {
            const el = document.getElementById(sectionId);
            if (el) {
              const rect = el.getBoundingClientRect();
              // Detect active section if top is above 35% of viewport height
              if (rect.top <= window.innerHeight * 0.35) {
                currentSection = `#${sectionId}`;
              }
            }
          }

          if (currentSection !== lastSection) {
            lastSection = currentSection;
            setActiveSection(currentSection);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handlePageScroll, { passive: true });
    // Run initial execution to set active section immediately
    handlePageScroll();

    return () => {
      window.removeEventListener("scroll", handlePageScroll);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [mobileOpen]);

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#platform", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#download", label: "Download" },
    { href: "#team", label: "Team" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact Us" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent px-3 pt-3 sm:px-5 md:px-8">
      {/* Viewport Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent-primary to-accent-secondary light:from-[#059669] light:to-[#10b981] z-[100] origin-left transition-all duration-75"
        style={{ width: `${pageScrollProgress}%` }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        .hk-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          padding: 0 20px;
          background: #000;
          color: #fff;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(.2,.8,.2,1),
                      box-shadow 0.4s ease,
                      filter 0.4s ease;
          box-shadow: 0 0 0 rgba(170, 60, 220, 0);
          z-index: 10;
          text-decoration: none;
        }

        .hk-button::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          aspect-ratio: 1/1;
          width: 220%;
          height: auto;
          border-radius: 50%;
          background: conic-gradient(var(--theme-accent-primary) 0%, #000 15%, var(--theme-accent-secondary) 50%, var(--theme-accent-primary) 100%);
          animation: spin linear 3s infinite;
          transform: translate(-50%, -50%);
          transition: filter 0.4s ease;
        }

        .hk-button::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: calc(100% - 5px);
          height: calc(100% - 5px);
          background: rgba(6, 9, 7, 0.9);
          transform: translate(-50%, -50%);
          border-radius: 9999px;
          backdrop-filter: blur(4px);
          transition: background 0.4s ease;
        }

        .light .hk-button::after {
          background: rgba(255, 255, 255, 0.95);
        }

        .hk-button span {
          display: block;
          position: relative;
          z-index: 2;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #ffffff;
          transition: letter-spacing 0.4s ease, text-shadow 0.4s ease, color 0.4s ease;
        }

        .light .hk-button span {
          color: #042f1a;
        }

        .hk-button:hover {
          transform: scale(1.05);
          box-shadow: 0 0 16px rgba(50, 245, 154, 0.35);
        }
        .hk-button:hover::before {
          animation-duration: 1.5s;
          filter: saturate(1.4) brightness(1.1);
        }
        .hk-button:hover::after {
          background: rgba(6, 9, 7, 0.82);
        }
        .light .hk-button:hover::after {
          background: rgba(255, 255, 255, 0.88);
        }
        .hk-button:hover span {
          letter-spacing: 0.08em;
          text-shadow: 0 0 8px rgba(var(--theme-emerald-rgb-raw), 0.6);
        }

        .hk-button:active {
          transform: scale(0.96);
        }

        .hk-button:focus-visible {
          outline: 2px solid var(--theme-accent-primary);
          outline-offset: 4px;
        }

        @keyframes spin {
          0%   { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .nav-link {
          position: relative;
          color: #cbd5e1;
          text-decoration: none;
          padding: 6px 0;
          font-weight: 500;
          transition: color 0.25s ease;
        }
        .light .nav-link {
          color: #334155;
          font-weight: 600;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: 0;
          left: 0;
          background: linear-gradient(90deg, var(--theme-accent-primary), var(--theme-accent-secondary));
          transform-origin: bottom right;
          transition: transform 0.3s cubic-bezier(0.86, 0, 0.07, 1);
        }
        .light .nav-link::after {
          background: linear-gradient(90deg, var(--theme-accent-solid), var(--theme-accent-primary));
        }
        .nav-link:hover, .nav-link.active {
          color: var(--theme-accent-primary);
        }
        .light .nav-link:hover, .light .nav-link.active {
          color: var(--theme-accent-solid);
        }
        .nav-link:hover::after, .nav-link.active::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
        /* ── Mobile menu drawer ── */
        .mobile-drawer {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transform: translateY(-10px) scale(0.97);
          transition: max-height 0.38s cubic-bezier(0.4, 0, 0.2, 1), 
                      opacity 0.28s ease, 
                      transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .mobile-drawer.open {
          max-height: 520px;
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .ham-bar {
          display: block;
          width: 20px;
          height: 2px;
          border-radius: 2px;
          background: currentColor;
          transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
          transform-origin: center;
        }
        .ham-open .ham-bar:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .ham-open .ham-bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .ham-open .ham-bar:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
        
        /* ── Navbar Hover Glow & Crisp Elevation ── */
        .command-border {
          transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
        }
        .command-border:hover {
          border-color: rgba(var(--theme-accent-primary-rgb-raw), 0.25);
          box-shadow: 
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 16px 46px rgba(0,0,0,0.28),
            0 0 40px rgba(var(--theme-accent-primary-rgb-raw), 0.08);
        }
        .light .command-border {
          border-color: rgba(6, 78, 59, 0.14) !important;
          box-shadow: 
            inset 0 1px 0 rgba(255,255,255,1),
            0 12px 32px -4px rgba(4,75,59,0.12),
            0 4px 12px -2px rgba(0,0,0,0.05);
        }
        .light .command-border:hover {
          border-color: rgba(5, 150, 105, 0.35) !important;
          box-shadow: 
            inset 0 1px 0 rgba(255,255,255,1),
            0 18px 42px -4px rgba(4,75,59,0.18),
            0 0 24px rgba(5,150,105,0.12);
        }
      ` }} />
      <div className="command-border mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 rounded-2xl border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.075),rgba(var(--theme-accent-primary-rgb-raw),0.025)),rgba(6,9,7,0.68)] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_46px_rgba(0,0,0,0.24),0_0_34px_rgba(var(--theme-accent-primary-rgb-raw),0.055)] backdrop-blur-2xl backdrop-saturate-150 sm:px-5 md:px-6 light:border-emerald-950/10 light:bg-white/92 light:backdrop-blur-xl light:backdrop-saturate-180">
        <div className="relative flex shrink-0 items-center">
          <Link href="/" aria-label="Nexora OS home">
            <NexoraLogo size="md" priority className="h-8 w-[124px] sm:h-10 sm:w-[158px]" />
          </Link>
        </div>

        <nav className="hidden items-center gap-4 text-[13px] min-[1180px]:flex 2xl:gap-8 2xl:text-sm">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`nav-link ${activeSection === l.href ? "active" : ""}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <div>
            <ThemeToggle />
          </div>

          <div className="relative !hidden sm:!inline-block">
            <div className="pointer-events-none absolute top-1/2 -left-4 h-12 w-12 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[18px]" />
            <Link
              href="/login"
              className="group relative z-10 inline-flex items-center gap-3.5 rounded-full border border-emerald-400/40 bg-[#044b3b] pl-5 pr-1.5 py-1.5 text-sm font-extrabold !text-white shadow-[0_12px_28px_rgba(4,75,59,0.4)] transition-all duration-300 hover:scale-[1.03] hover:bg-[#033b2e] hover:border-emerald-300/60 active:scale-[0.98]"
            >
              <span>Login</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5500] text-white shadow-[0_4px_12px_rgba(255,85,0,0.4)] transition-transform duration-300 group-hover:scale-105 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </span>
            </Link>
          </div>

          {/* Hamburger — only on mobile/tablet < lg */}
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v: boolean) => !v)}
            className={`flex flex-col items-center justify-center gap-[5px] rounded-xl border border-white/12 bg-white/5 p-2.5 text-slate-300 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white min-[1180px]:hidden light:border-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200 ${mobileOpen ? "ham-open" : ""}`}
          >
            <span className="ham-bar" />
            <span className="ham-bar" />
            <span className="ham-bar" />
          </button>
        </div>
      </div>

      {/* Mobile slide-down drawer */}
      <div className={`mobile-drawer mx-auto mt-2 max-w-7xl rounded-2xl border border-white/10 bg-[rgba(6,9,7,0.92)] backdrop-blur-2xl min-[1180px]:hidden light:border-slate-200/90 light:bg-[rgba(255,255,255,0.97)] light:shadow-2xl ${mobileOpen ? "open" : ""}`}>
        <nav className="flex flex-col gap-1 px-4 py-4">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${activeSection === l.href
                  ? "bg-emerald-500/10 text-[#32f59a] light:bg-emerald-50 light:text-[#065f46]"
                  : "text-slate-300 hover:bg-white/8 hover:text-white light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900"
                }`}
            >
              {l.label}
            </a>
          ))}
          <div className="my-2 h-px bg-white/8 light:bg-slate-200" />
          <div className="relative mt-1">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="group relative z-10 flex items-center justify-between rounded-full border border-emerald-400/40 bg-[#044b3b] pl-6 pr-2 py-2.5 text-base font-extrabold !text-white shadow-[0_12px_28px_rgba(4,75,59,0.4)] transition-all duration-300 hover:bg-[#033b2e] active:scale-[0.98]"
            >
              <span>Login to Nexora OS</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5500] text-white shadow-[0_4px_12px_rgba(255,85,0,0.4)] transition-transform duration-300 group-hover:scale-105 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
