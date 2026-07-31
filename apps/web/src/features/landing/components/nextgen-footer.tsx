"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Send,
  Twitter,
} from "lucide-react";
import { NexoraLogo } from "@/components/brand/nexora-logo";

export function NextGenFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000);
    setEmail("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative w-full overflow-hidden px-3 pb-3 pt-3 sm:px-6 md:px-8">
      {/* Background Ambient Glow Orbs */}
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px] light:bg-emerald-300/20" />

      {/* Main Glassmorphism Cyber Footer Card Container */}
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[20px] border border-emerald-400/20 bg-[#040a07]/90 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl light:border-emerald-800/15 light:bg-[linear-gradient(145deg,#f4faf6_0%,#e8f5ee_100%)] sm:p-6 md:p-8">
        
        {/* Top Watermark Decorative Branding Text */}
        <div className="pointer-events-none absolute -top-4 right-0 hidden select-none opacity-[0.03] sm:block light:opacity-[0.04]">
          <span className="font-mono text-6xl sm:text-8xl font-black uppercase tracking-tighter text-emerald-300 light:text-emerald-900">
            NEXORA
          </span>
        </div>

        {/* Middle Main Content Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 lg:gap-6">
          
          {/* Brand Info Column (Spans 4 columns) */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <NexoraLogo size="md" className="h-8 w-[130px] sm:h-9 sm:w-[140px]" />
            </div>

            <p className="mt-2 text-[11px] sm:text-xs leading-relaxed text-slate-300/85 light:text-slate-600 max-w-sm">
              Unified Operating System for BITHM College of Professionals. Assignments, labs, and course feedback in one place.
            </p>
          </div>

          {/* Combined Links Wrapper for Mobile 2-Column Side-by-Side Grid */}
          <div className="grid grid-cols-2 gap-4 sm:contents lg:col-span-5">
            {/* Quick Links: Platform */}
            <div className="lg:col-span-2">
              <h4 className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-800">
                Platform
              </h4>
              <ul className="mt-2 space-y-1 text-[11px] sm:text-xs font-medium">
                {[
                  { label: "Overview", href: "#about" },
                  { label: "Features", href: "#platform" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Why Nexora", href: "#why-nexora" },
                  { label: "Available Tools", href: "#available-now" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="group inline-flex items-center gap-1 text-slate-300/80 transition-colors duration-200 hover:text-emerald-300 light:text-slate-600 light:hover:text-emerald-800"
                    >
                      <ChevronRight className="h-2.5 w-2.5 transition-transform duration-200 group-hover:translate-x-0.5 text-emerald-400/60" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links: Resources & BITHM */}
            <div className="lg:col-span-3">
              <h4 className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-800">
                Resources
              </h4>
              <ul className="mt-2 space-y-1 text-[11px] sm:text-xs font-medium">
                {[
                  { label: "Student Login", href: "/login?role=student" },
                  { label: "Teacher Portal", href: "/login?role=teacher" },
                  { label: "Academic Team", href: "#team" },
                  { label: "System FAQ", href: "#faq" },
                  { label: "Contact Support", href: "#contact" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-1 text-slate-300/80 transition-colors duration-200 hover:text-emerald-300 light:text-slate-600 light:hover:text-emerald-800"
                    >
                      <ChevronRight className="h-2.5 w-2.5 transition-transform duration-200 group-hover:translate-x-0.5 text-emerald-400/60" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter & Social Column */}
          <div className="lg:col-span-3">
            <h4 className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-800">
              Stay Connected
            </h4>

            <form onSubmit={handleSubscribe} className="mt-2 flex flex-col gap-1">
              <div className="relative flex items-center">
                <Mail className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter email..."
                  className="w-full rounded-lg border border-white/15 bg-white/5 py-1.5 pl-8 pr-9 text-[11px] sm:text-xs text-white placeholder-slate-400 outline-none backdrop-blur-md transition-all focus:border-emerald-400 focus:bg-white/10 light:border-black/15 light:bg-white light:text-slate-900 light:placeholder-slate-400 light:focus:border-emerald-600"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1 flex h-5.5 w-5.5 items-center justify-center rounded-md bg-emerald-500 text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                >
                  <Send className="h-3 w-3 stroke-[2.5]" />
                </button>
              </div>
              {subscribed && (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 light:text-emerald-700 animate-pulse">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Subscribed successfully!</span>
                </div>
              )}
            </form>

            {/* Social Icons Bar */}
            <div className="mt-3 flex items-center gap-1.5">
              {[
                { icon: Twitter, label: "X / Twitter", href: "#" },
                { icon: Linkedin, label: "LinkedIn", href: "#" },
                { icon: Instagram, label: "Instagram", href: "#" },
                { icon: Github, label: "GitHub", href: "https://github.com/Moparapairayat/Nexora-OS--BITHM" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-300 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-white light:border-black/10 light:bg-white light:text-slate-700 light:hover:border-emerald-600 light:hover:bg-emerald-100 light:hover:text-emerald-900"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar Divider */}
        <div className="my-3 sm:my-4 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent light:via-black/10" />

        {/* Bottom Copyright & Back to Top */}
        <div className="flex flex-col items-center justify-between gap-2.5 sm:flex-row text-center sm:text-left">
          <p className="text-[10px] sm:text-xs text-slate-400 light:text-slate-600">
            © 2026 <span className="font-bold text-white light:text-slate-900">Nexora OS</span> · BITHM. All Rights Reserved.
            <span className="block sm:inline sm:ml-1.5">
              Dev: <a href="https://github.com/Moparapairayat" target="_blank" rel="noreferrer" className="font-bold text-emerald-400 hover:underline light:text-emerald-700">Mopara Pair Ayat</a> (Supervised by Afsana Tabassum Tamishra).
            </span>
          </p>

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] font-medium text-slate-400 sm:inline light:text-slate-600">
              Designed for students.
            </span>

            {/* Back to Top Floating Button */}
            <button
              onClick={scrollToTop}
              className="group flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-emerald-300 hover:bg-emerald-500 hover:text-slate-950 active:scale-95 light:border-emerald-800/25 light:bg-white light:text-emerald-800 light:hover:bg-emerald-600 light:hover:text-white"
              title="Back to Top"
              aria-label="Back to Top"
            >
              <ArrowUp className="h-3.5 w-3.5 stroke-[2.5] transition-transform duration-200 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
