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
    <footer className="relative w-full overflow-hidden px-4 pb-4 pt-4 sm:px-6 md:px-8">
      {/* Background Ambient Glow Orbs */}
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[130px] light:bg-emerald-300/20" />
      <div className="pointer-events-none absolute bottom-5 -left-20 h-[220px] w-[220px] rounded-full bg-cyan-500/10 blur-[100px] light:bg-cyan-300/15" />

      {/* Main Glassmorphism Cyber Footer Card Container */}
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[24px] border border-emerald-400/20 bg-[#040a07]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl light:border-emerald-800/15 light:bg-[linear-gradient(145deg,#f4faf6_0%,#e8f5ee_100%)] sm:p-7 md:p-8">
        
        {/* Top Watermark Decorative Branding Text */}
        <div className="pointer-events-none absolute -top-4 right-0 select-none opacity-[0.03] light:opacity-[0.04]">
          <span className="font-mono text-6xl sm:text-8xl font-black uppercase tracking-tighter text-emerald-300 light:text-emerald-900">
            NEXORA
          </span>
        </div>

        {/* Middle Main Content Grid */}
        <div className="mt-1 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 lg:gap-6">
          
          {/* Brand Info Column (Spans 4 columns) */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <NexoraLogo size="md" className="h-9 w-[140px]" />
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-300/85 light:text-slate-600 max-w-sm">
              Unified Operating System for BITHM College of Professionals. Assignments, labs, and course feedback in one connected workspace.
            </p>
          </div>

          {/* Quick Links: Platform */}
          <div className="lg:col-span-2">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-800">
              Platform
            </h4>
            <ul className="mt-3 space-y-1.5 text-xs font-medium">
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
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-800">
              Resources & Roles
            </h4>
            <ul className="mt-3 space-y-1.5 text-xs font-medium">
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
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-800">
              Stay Connected
            </h4>
            <p className="mt-2.5 text-xs leading-snug text-slate-300/80 light:text-slate-600">
              Get academic release notes directly in your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="mt-3 flex flex-col gap-1.5">
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter email..."
                  className="w-full rounded-lg border border-white/15 bg-white/5 py-2 pl-9 pr-10 text-xs text-white placeholder-slate-400 outline-none backdrop-blur-md transition-all focus:border-emerald-400 focus:bg-white/10 light:border-black/15 light:bg-white light:text-slate-900 light:placeholder-slate-400 light:focus:border-emerald-600"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1 flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
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
            <div className="mt-3.5 flex items-center gap-1.5">
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-300 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-white light:border-black/10 light:bg-white light:text-slate-700 light:hover:border-emerald-600 light:hover:bg-emerald-100 light:hover:text-emerald-900"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar Divider */}
        <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent light:via-black/10" />

        {/* Bottom Copyright & Back to Top */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row text-center sm:text-left">
          <p className="text-[11px] sm:text-xs text-slate-400 light:text-slate-600">
            © 2026 <span className="font-bold text-white light:text-slate-900">Nexora OS</span> · BITHM. All Rights Reserved.
            <span className="block sm:inline sm:ml-1.5">
              Dev: <a href="https://github.com/Moparapairayat" target="_blank" rel="noreferrer" className="font-bold text-emerald-400 hover:underline light:text-emerald-700">Mopara Pair Ayat</a> (Supervised by Afsana Tabassum Tamishra).
            </span>
          </p>

          <div className="flex items-center gap-2.5">
            <span className="hidden text-[11px] font-medium text-slate-400 sm:inline light:text-slate-600">
              Designed for students.
            </span>

            {/* Back to Top Floating Button */}
            <button
              onClick={scrollToTop}
              className="group flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-emerald-300 hover:bg-emerald-500 hover:text-slate-950 active:scale-95 light:border-emerald-800/25 light:bg-white light:text-emerald-800 light:hover:bg-emerald-600 light:hover:text-white"
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
