"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from "lucide-react";

type Message = {
  id: string;
  sender: "user" | "penguin";
  text: string;
  time: string;
};

const PREDEFINED_QA = [
  {
    question: "What is Nexora OS?",
    answer:
      "Nexora OS is a unified academic workspace designed for BITHM College of Professionals. It integrates modules, lab work, submissions, grades, and teacher feedback inside a single interactive dashboard.",
  },
  {
    question: "How do I try the demo?",
    answer:
      "You can click the 'Log In' button in the navbar or scroll to the 'Explore Workspace' preview section. We have pre-configured demo profiles for Student, Teacher, and Admin workspace dashboards!",
  },
  {
    question: "Tell me about Unit H/650/3385",
    answer:
      "That is the OTHM Unit H/650/3385: 'Web and Mobile Applications' coursework. It covers state-of-the-art web architectures, under the unit unit instructor Afsana Tabassum Tamishra.",
  },
  {
    question: "Who developed this?",
    answer:
      "Nexora OS was developed by Mopara Pair Ayat (student developer) as a premium submission project for the Web and Mobile Applications unit coursework at BITHM.",
  },
];

export function PandaChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    setMessages([
      {
        id: "greet",
        sender: "penguin",
        text: "Hi there! I am Nexora's Assistant Penguin 🐧. Ask me anything about the platform or BITHM coursework!",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Find predefined answer or fallback
    const matchedQA = PREDEFINED_QA.find(
      (qa) => qa.question.toLowerCase().trim() === text.toLowerCase().trim(),
    );

    setTimeout(() => {
      setIsTyping(false);
      const replyMsg: Message = {
        id: Math.random().toString(),
        sender: "penguin",
        text: matchedQA
          ? matchedQA.answer
          : "I'm still learning! Try clicking one of the quick questions below to learn about Nexora OS.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleSendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <style>{`
        @keyframes blink {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }
        .penguin-eye-blink {
          animation: blink 4.2s infinite;
          transform-origin: center;
        }
        
        /* Premium custom scrollbar */
        .scrollbar-chat::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-chat::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-chat::-webkit-scrollbar-thumb {
          background: rgba(var(--theme-emerald-rgb-raw), 0.2);
          border-radius: 99px;
          transition: background 0.3s ease;
        }
        .scrollbar-chat::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--theme-emerald-rgb-raw), 0.45);
        }
        
        /* Custom hover actions to bypass tailwind path JIT issues */
        .penguin-btn {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .penguin-btn:hover {
          transform: scale(1.1);
        }
        .penguin-btn:active {
          transform: scale(0.95);
        }
        .penguin-btn:hover .penguin-tooltip {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>

      {/* ── Collapsed Floating Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="penguin-btn flex h-20 w-20 md:h-24 md:w-24 items-center justify-center relative bg-transparent border-none outline-none"
          aria-label="Open helper chat"
          data-cursor="hover"
        >
          {/* Bouncing Chat Label on Top */}
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-accent-primary/30 text-[9px] font-extrabold uppercase tracking-wider text-accent-primary whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.35)] animate-[bounce_2s_infinite] flex items-center gap-1 z-30">
            Chat 💬
          </span>

          {/* Orbiting dashed line shapes around the penguin */}
          <div className="absolute inset-[-6px] rounded-full border border-dashed border-accent-primary/45 animate-[spin_25s_linear_infinite] pointer-events-none z-10" />
          <div className="absolute inset-[-12px] rounded-full border border-accent-primary/15 pointer-events-none z-10 opacity-60" />

          {/* Breathing notification dot */}
          <span className="absolute top-1 right-1 flex h-3.5 w-3.5 z-30">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-slate-900"></span>
          </span>

          <img
            src="/mascots/you-rang-hello.gif"
            alt="Ask Helper Penguin"
            className="h-full w-full object-contain relative z-20"
          />

          <span className="penguin-tooltip absolute right-24 md:right-28 scale-75 rounded-xl bg-slate-950/90 border border-white/10 px-3 py-1.5 text-[11px] font-bold text-white opacity-0 transition-all duration-300 whitespace-nowrap shadow-xl z-30 pointer-events-none origin-right">
            Ask Helper Penguin 🐧
          </span>
        </button>
      )}

      {/* ── Expanded Chat Window ── */}
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] h-[500px] flex flex-col rounded-3xl border border-white/15 light:border-black/10 bg-white/[0.04] light:bg-white/45 backdrop-blur-3xl shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.1)] light:shadow-[0_20px_50px_rgba(16,185,129,0.05),inset_0_1px_1px_rgba(255,255,255,0.4)] overflow-hidden transition-all duration-350 transform origin-bottom-right">
          {/* Header Block */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 light:border-black/5 bg-gradient-to-r from-accent-primary/10 to-transparent z-10">
            <div className="flex items-center gap-3">
              {/* Mascot Mini Logo */}
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center relative">
                <img
                  src="/mascots/you-rang-hello.gif"
                  alt="Helper Penguin"
                  className="h-full w-full object-cover"
                />
                {/* Active Status Dot */}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#0b0f0d] animate-pulse" />
              </div>
              <div className="leading-tight">
                <h4 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-1.5">
                  Penguin Assistant
                </h4>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                  Active Helper
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white light:text-slate-500 light:hover:text-slate-800 transition p-1.5 rounded-full hover:bg-white/5 light:hover:bg-black/5"
              data-cursor="hover"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-chat relative z-10">
            {/* Ambient Background Light Orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent-primary/8 rounded-full blur-[80px] pointer-events-none -z-10" />

            {messages.map((msg) => {
              const isPenguin = msg.sender === "penguin";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isPenguin ? "justify-start" : "justify-end"} relative z-10`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isPenguin
                        ? "bg-white/[0.06] light:bg-black/[0.04] text-slate-200 light:text-slate-700 rounded-tl-none border border-white/10 light:border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md"
                        : "bg-gradient-to-r from-accent-primary to-accent-secondary text-slate-950 font-semibold rounded-tr-none shadow-[0_4px_12px_rgba(var(--theme-emerald-rgb-raw),0.25)]"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`block text-[8px] mt-1.5 text-right ${isPenguin ? "text-slate-500" : "text-slate-950/70"}`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing Loader */}
            {isTyping && (
              <div className="flex justify-start relative z-10">
                <div className="bg-white/5 light:bg-black/5 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-accent-primary animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 rounded-full bg-accent-primary animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 rounded-full bg-accent-primary animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick choices row */}
          <div className="px-4 py-2.5 border-t border-white/5 light:border-black/5 bg-white/[0.02] light:bg-black/[0.02] flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto justify-start z-10">
            {PREDEFINED_QA.map((qa) => (
              <button
                key={qa.question}
                onClick={() => handleSendMessage(qa.question)}
                className="text-[10px] px-3 py-1.5 rounded-full border border-white/10 hover:border-accent-primary/40 bg-white/5 hover:bg-accent-primary/10 text-slate-400 hover:text-white light:text-slate-600 light:hover:text-emerald-700 light:border-black/10 transition duration-300 truncate max-w-[170px] hover:shadow-[0_0_10px_rgba(var(--theme-emerald-rgb-raw),0.12)]"
                data-cursor="hover"
                title={qa.question}
              >
                {qa.question}
              </button>
            ))}
          </div>

          {/* Footer Input Area */}
          <form
            onSubmit={handleInputSubmit}
            className="p-3 border-t border-white/5 light:border-black/5 bg-white/[0.02] light:bg-white/20 backdrop-blur-sm flex items-center gap-2 z-10"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-white/5 light:bg-black/5 border border-white/10 light:border-black/10 rounded-xl px-3.5 py-2 text-xs text-white light:text-slate-900 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 light:focus:border-emerald-600 transition"
            />
            <button
              type="submit"
              className="h-8.5 w-8.5 flex items-center justify-center rounded-xl bg-accent-primary hover:bg-accent-primary/95 text-slate-950 transition active:scale-95 hover:shadow-[0_0_12px_rgba(var(--theme-emerald-rgb-raw),0.4)]"
              data-cursor="hover"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
