"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
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
    <footer className="relative w-full overflow-hidden px-4 pb-8 pt-12 sm:px-6 md:px-8 lg:px-12">
      {/* Background Ambient Glow Orbs */}
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px] light:bg-emerald-300/25" />
      <div className="pointer-events-none absolute bottom-10 -left-20 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px] light:bg-cyan-300/20" />

      {/* Main Glassmorphism Cyber Footer Card Container */}
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-emerald-400/20 bg-[#040a07]/90 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl light:border-emerald-800/15 light:bg-[linear-gradient(145deg,#f4faf6_0%,#e8f5ee_100%)] light:shadow-[0_20px_60px_rgba(20,80,50,0.08)] sm:p-12 md:p-14">
        
        {/* Top Watermark Decorative Branding Text */}
        <div className="pointer-events-none absolute -top-4 right-0 select-none opacity-[0.035] light:opacity-[0.05]">
          <span className="font-mono text-7xl sm:text-9xl font-black uppercase tracking-tighter text-emerald-300 light:text-emerald-900">
            NEXORA OS
          </span>
        </div>

        {/* Top Header Row: System Status & Live Network Badge */}
        <div className="flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between light:border-black/10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            </div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-emerald-300 light:text-emerald-800">
              All Systems Operational · Academic Grid v2.4 Online
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-400 light:text-emerald-600" />
            <span>Official BITHM Academic Platform</span>
          </div>
        </div>

        {/* Middle Main Content Grid */}
        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 lg:gap-8">
          
          {/* Brand Info Column (Spans 4 columns) */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <NexoraLogo size="md" className="h-11 w-[168px]" />
            </div>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-300/90 light:text-slate-600">
              The next-generation unified Operating System for BITHM College of Professionals. Assignments, lab work, live coding environments, and course administration in one connected space.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-300 light:border-emerald-800/20 light:bg-emerald-100 light:text-emerald-900">
                <Sparkles className="h-3 w-3 text-emerald-400 light:text-emerald-700" />
                Built for BITHM
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold text-cyan-300 light:border-cyan-800/20 light:bg-cyan-100 light:text-cyan-900">
                <Globe className="h-3 w-3 text-cyan-400 light:text-cyan-700" />
                Cloud Connected
              </span>
            </div>
          </div>

          {/* Quick Links: Platform */}
          <div className="lg:col-span-2">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-800">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm font-medium">
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
                    <ChevronRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 text-emerald-400/60" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links: Resources & BITHM */}
          <div className="lg:col-span-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-800">
              Resources & Roles
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm font-medium">
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
                    <ChevronRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 text-emerald-400/60" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social Column */}
          <div className="lg:col-span-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-800">
              Stay Connected
            </h4>
            <p className="mt-4 text-xs leading-relaxed text-slate-300/80 light:text-slate-600">
              Get academic announcements and system release notes directly in your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2">
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter student / staff email..."
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-12 text-xs text-white placeholder-slate-400 outline-none backdrop-blur-md transition-all focus:border-emerald-400 focus:bg-white/10 light:border-black/15 light:bg-white light:text-slate-900 light:placeholder-slate-400 light:focus:border-emerald-600"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                >
                  <Send className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </div>
              {subscribed && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 light:text-emerald-700 animate-pulse">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Subscribed successfully to Nexora OS grid!</span>
                </div>
              )}
            </form>

            {/* Social Icons Bar */}
            <div className="mt-5 flex items-center gap-2">
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
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-white light:border-black/10 light:bg-white light:text-slate-700 light:hover:border-emerald-600 light:hover:bg-emerald-100 light:hover:text-emerald-900"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar Divider */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent light:via-black/10" />

        {/* Bottom Copyright & Back to Top */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-center sm:text-left">
          <p className="text-xs text-slate-400 light:text-slate-600">
            © 2026 <span className="font-bold text-white light:text-slate-900">Nexora OS</span> · BITHM Academic Platform. All Rights Reserved.
            <span className="block sm:inline sm:ml-2">
              Developed by <a href="https://github.com/Moparapairayat" target="_blank" rel="noreferrer" className="font-extrabold text-emerald-400 hover:underline light:text-emerald-700">Mopara Pair Ayat</a> under supervision of Afsana Tabassum Tamishra.
            </span>
          </p>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold text-slate-400 sm:inline light:text-slate-600">
              Designed for students. Built for institutions.
            </span>

            {/* Back to Top Floating Button */}
            <button
              onClick={scrollToTop}
              className="group flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-emerald-300 hover:bg-emerald-500 hover:text-slate-950 active:scale-95 light:border-emerald-800/25 light:bg-white light:text-emerald-800 light:hover:bg-emerald-600 light:hover:text-white"
              title="Back to Top"
              aria-label="Back to Top"
            >
              <ArrowUp className="h-4 w-4 stroke-[2.5] transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
