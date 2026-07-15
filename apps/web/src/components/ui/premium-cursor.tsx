"use client";

import { useEffect, useRef, useState } from "react";
import { MousePointer, Zap } from "lucide-react";

export function PremiumCursor() {
  const [isEpicMode, setIsEpicMode] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  // Dragon Mode Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const screenRef = useRef<SVGGElement>(null);
  const glowFilterRef = useRef<SVGFEGaussianBlurElement>(null);

  // Minimal Mode Refs
  const minDotRef = useRef<HTMLDivElement>(null);
  const minRingRef = useRef<HTMLDivElement>(null);

  // Shared pointer references
  const pointer = useRef({ x: -200, y: -200 });
  const minRingPos = useRef({ x: -200, y: -200 });

  // Mouse / Interaction states
  const interactionState = useRef({
    isHoveringInteractive: false,
    isHoveringText: false,
    isMouseDown: false,
    rad: 0,
  });

  // Load configuration on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("nexora-epic-cursor");
    if (saved === "off") {
      setIsEpicMode(false);
    }
  }, []);

  // Main Cursor System
  useEffect(() => {
    if (!mounted) return;

    // Hide default cursor globally
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    const xmlns = "http://www.w3.org/2000/svg";
    const xlinkns = "http://www.w3.org/1999/xlink";

    let width = window.innerWidth;
    let height = window.innerHeight;

    const handlePointerMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      interactionState.current.rad = 0; // Reset idle timer on move
    };

    const handleMouseDown = () => {
      interactionState.current.isMouseDown = true;
      if (!isEpicMode) {
        const ring = minRingRef.current;
        const dot = minDotRef.current;
        if (ring) {
          ring.style.width = "14px";
          ring.style.height = "14px";
          ring.style.borderColor = "rgba(50,245,154,1)";
          ring.style.background = "rgba(50,245,154,0.18)";
          ring.style.boxShadow = "0 0 16px rgba(50,245,154,0.6), 0 0 6px rgba(50,245,154,0.9)";
          ring.style.transition = "width 0.1s ease, height 0.1s ease, border-color 0.1s ease, box-shadow 0.1s ease, background 0.1s ease";
        }
        if (dot) {
          dot.style.transform = dot.style.transform + " scale(1.8)";
          dot.style.transition = "transform 0.1s ease, box-shadow 0.1s ease";
          dot.style.boxShadow = "0 0 16px rgba(50,245,154,1), 0 0 32px rgba(50,245,154,0.5)";
        }
      }
    };

    const handleMouseUp = () => {
      interactionState.current.isMouseDown = false;
      if (!isEpicMode) {
        const ring = minRingRef.current;
        const dot = minDotRef.current;
        // Restore the correct state depending on where we are
        const isHover = interactionState.current.isHoveringInteractive;
        if (ring) {
          ring.style.width = isHover ? "24px" : "32px";
          ring.style.height = isHover ? "24px" : "32px";
          ring.style.borderColor = isHover ? "rgba(50, 245, 154, 0.9)" : "";
          ring.style.background = isHover ? "rgba(50,245,154,0.06)" : "";
          ring.style.boxShadow = isHover ? "0 0 14px rgba(50,245,154,0.35)" : "";
          ring.style.transition = "width 0.25s cubic-bezier(0.34,1.56,0.64,1), height 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease";
        }
        if (dot) {
          dot.style.transition = "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, width 0.18s ease, height 0.18s ease";
          dot.style.boxShadow = "";
        }
      }
    };

    window.addEventListener("pointermove", handlePointerMove, false);
    window.addEventListener("mousedown", handleMouseDown, false);
    window.addEventListener("mouseup", handleMouseUp, false);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize, false);

    // ── DRAGON MODE INITIALIZATION ──────────────────────────────────────────
    const N = 28;
    interface DragonElement {
      use: SVGUseElement | null;
      x: number;
      y: number;
    }

    const elems: DragonElement[] = [];
    const screen = screenRef.current;
    if (isEpicMode && screen) {
      screen.innerHTML = "";
      // Start all segments off-screen so dragon doesn't cover content on load.
      // They will snap to the pointer position on first mouse move.
      for (let i = 0; i < N; i++) {
        elems[i] = { use: null, x: -200, y: -200 };
      }

      const prepend = (useId: string, i: number) => {
        const elem = document.createElementNS(xmlns, "use") as SVGUseElement;
        elems[i].use = elem;
        elem.setAttributeNS(xlinkns, "xlink:href", "#" + useId);
        screen.prepend(elem);
      };

      for (let i = 1; i < N; i++) {
        if (i === 1) prepend("Cabeza", i);
        else if (i === 7 || i === 13) prepend("Aletas", i);
        else if (i === N - 1) prepend("Cola", i);
        else prepend("Espina", i);
      }
    }

    let animationFrameId: number;
    let frm = Math.random();
    const radm = Math.min(width, height) / 2 - 20;

    // ── ANIMATION FRAME LOOP ───────────────────────────────────────────────
    const run = () => {
      animationFrameId = requestAnimationFrame(run);

      const state = interactionState.current;
      const mx = pointer.current.x;
      const my = pointer.current.y;

      if (isEpicMode) {
        // ── DRAGON ANIMATION LOOP (faithful to provided HTML) ──────────────
        const e = elems[0];
        if (e) {
          const ax = (Math.cos(3 * frm) * state.rad * width) / height;
          const ay = (Math.sin(4 * frm) * state.rad * height) / width;

          // Head follows pointer at /10 — matches original.
          // If pointer is still at the initial off-screen position, snap the head
          // directly there instead of lerping so dragon never drifts on-screen.
          if (mx < -100 && my < -100) {
            e.x = -200;
            e.y = -200;
          } else {
            e.x += (ax + mx - e.x) / 10;
            e.y += (ay + my - e.y) / 10;
          }

          for (let i = 1; i < N; i++) {
            const currentElem = elems[i];
            const prevElem = elems[i - 1];
            if (!currentElem?.use || !prevElem) continue;

            const a = Math.atan2(currentElem.y - prevElem.y, currentElem.x - prevElem.x);

            // Exact physics from provided HTML
            currentElem.x += (prevElem.x - currentElem.x + (Math.cos(a) * (100 - i)) / 5) / 4;
            currentElem.y += (prevElem.y - currentElem.y + (Math.sin(a) * (100 - i)) / 5) / 4;

            // Custom power-curve scale: tapers down gracefully toward the tail
            const progress = i / N;
            const s = 3.3 * Math.pow(1 - progress, 1.1) + 0.25;

            currentElem.use.setAttributeNS(
              null,
              "transform",
              `translate(${(prevElem.x + currentElem.x) / 2},${(prevElem.y + currentElem.y) / 2}) rotate(${(180 / Math.PI) * a}) scale(${s},${s})`
            );
          }

          if (state.rad < radm) state.rad++;
          frm += 0.003;
          // NOTE: idle-drift toward center removed — it caused the dragon to
          // drift over the hero heading when the user stopped moving the mouse.
        }
      } else {
        // ── PREMIUM MINIMALIST CURSOR ANIMATION LOOP ───────────────────────
        const dot = minDotRef.current;
        const ring = minRingRef.current;

        if (dot && ring) {
          // Dot follows instantly
          dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
          dot.style.opacity = state.isHoveringText ? "0" : "1";

          // Ring trails with lerp — tighter when hovering for precision feel
          const lerpSpeed = state.isHoveringInteractive ? 0.14 : 0.09;
          minRingPos.current.x += (mx - minRingPos.current.x) * lerpSpeed;
          minRingPos.current.y += (my - minRingPos.current.y) * lerpSpeed;

          // Text caret: ring snaps to dot position instantly
          if (state.isHoveringText) {
            minRingPos.current.x += (mx - minRingPos.current.x) * 0.6;
            minRingPos.current.y += (my - minRingPos.current.y) * 0.6;
          }

          ring.style.transform = `translate(${minRingPos.current.x}px, ${minRingPos.current.y}px) translate(-50%, -50%)`;
          ring.style.opacity = "1";
        }
      }
    };

    run();

    // ── INTERACTIVE HOVER EVENT LISTENERS ──────────────────────────────────
    const interactiveSelector = 'a, button, [role="button"], label, summary, [data-cursor], .premium-button';
    const textSelector = "input, textarea, [contenteditable]";
    const attachedElements = new WeakSet<Element>();

    const onEnterInteractive = () => {
      interactionState.current.isHoveringInteractive = true;
      if (!isEpicMode) {
        const ring = minRingRef.current;
        const dot = minDotRef.current;
        if (ring) {
          // Subtle: ring shrinks slightly + brightens — magnetic pull feel
          ring.style.width = "24px";
          ring.style.height = "24px";
          ring.style.borderColor = "rgba(50, 245, 154, 0.9)";
          ring.style.boxShadow = "0 0 14px rgba(50,245,154,0.35), 0 0 4px rgba(50,245,154,0.6)";
          ring.style.background = "rgba(50, 245, 154, 0.06)";
          ring.style.backdropFilter = "blur(3px)";
        }
        if (dot) {
          dot.style.width = "3px";
          dot.style.height = "3px";
          dot.style.boxShadow = "0 0 10px rgba(50,245,154,1), 0 0 24px rgba(50,245,154,0.5)";
        }
      }
    };

    const onLeaveInteractive = () => {
      interactionState.current.isHoveringInteractive = false;
      if (!isEpicMode) {
        const ring = minRingRef.current;
        const dot = minDotRef.current;
        if (ring) {
          ring.style.width = "32px";
          ring.style.height = "32px";
          ring.style.borderColor = "";
          ring.style.background = "";
          ring.style.backdropFilter = "";
          ring.style.boxShadow = "";
          ring.style.borderRadius = "50%";
        }
        if (dot) {
          dot.style.width = "5px";
          dot.style.height = "5px";
          dot.style.boxShadow = "";
        }
      }
    };

    const onEnterText = () => {
      interactionState.current.isHoveringText = true;
      if (!isEpicMode) {
        const ring = minRingRef.current;
        if (ring) {
          ring.style.width = "1.5px";
          ring.style.height = "22px";
          ring.style.borderRadius = "1px";
          ring.style.border = "none";
          ring.style.background = "var(--cursor-accent-color)";
          ring.style.backdropFilter = "none";
          ring.style.boxShadow = "0 0 8px rgba(50,245,154,0.9), 0 0 20px rgba(50,245,154,0.4)";
        }
      }
    };

    const onLeaveText = () => {
      interactionState.current.isHoveringText = false;
      if (!isEpicMode) {
        const ring = minRingRef.current;
        if (ring) {
          ring.style.width = "32px";
          ring.style.height = "32px";
          ring.style.border = "1px solid rgba(50, 245, 154, 0.45)";
          ring.style.borderRadius = "50%";
          ring.style.background = "";
          ring.style.backdropFilter = "";
          ring.style.boxShadow = "";
        }
      }
    };

    const attach = () => {
      document.querySelectorAll<HTMLElement>(interactiveSelector).forEach((el) => {
        if (attachedElements.has(el)) return;
        attachedElements.add(el);
        el.addEventListener("mouseenter", onEnterInteractive);
        el.addEventListener("mouseleave", onLeaveInteractive);
      });
      document.querySelectorAll<HTMLElement>(textSelector).forEach((el) => {
        if (attachedElements.has(el)) return;
        attachedElements.add(el);
        el.addEventListener("mouseenter", onEnterText);
        el.addEventListener("mouseleave", onLeaveText);
      });
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      if (screen) {
        screen.innerHTML = "";
      }
    };
  }, [isEpicMode, mounted]);

  const toggleMode = () => {
    const newVal = !isEpicMode;
    setIsEpicMode(newVal);
    localStorage.setItem("nexora-epic-cursor", newVal ? "on" : "off");
  };

  if (!mounted) return null;

  return (
    <>
      {/* ── CSS Variable Styles ────────────────────────────────────────────── */}
      <style>{`
        :root {
          --cursor-accent-color: #32f59a;
          --cursor-dot-color: #32f59a;
          --cursor-ring-color: rgba(50, 245, 154, 0.45);
        }
        html.light {
          --cursor-accent-color: #059669;
          --cursor-dot-color: #059669;
          --cursor-ring-color: rgba(5, 150, 105, 0.40);
        }
      `}</style>

      {/* ── EPIC MODE: FIRE DRAGON CURSOR ─────────────────────────────────── */}
      {isEpicMode && (
        <svg
          ref={svgRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 999999,
            filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.8))",
          }}
        >
          <defs>
            <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur ref={glowFilterRef} in="SourceGraphic" stdDeviation="2" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="obsidian" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a4a4a" />
              <stop offset="40%" stopColor="#1f1f1f" />
              <stop offset="100%" stopColor="#050505" />
            </linearGradient>

            <linearGradient id="emberPulse" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffea00">
                <animate attributeName="stop-color" values="#ffea00;#ff5500;#ffea00" dur="1.5s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#ff2200">
                <animate attributeName="stop-color" values="#ff2200;#aa0000;#ff2200" dur="1.5s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#ffaa00">
                <animate attributeName="stop-color" values="#ffaa00;#ffea00;#ffaa00" dur="1.5s" repeatCount="indefinite" />
              </stop>
            </linearGradient>

            <linearGradient id="fireMembraneTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffaa00">
                <animate attributeName="stop-color" values="#ffaa00;#ff2200;#ffaa00" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#d62d00">
                <animate attributeName="stop-color" values="#d62d00;#ffaa00;#d62d00" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#1a0200" />
            </linearGradient>

            <linearGradient id="fireMembraneBot" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffaa00">
                <animate attributeName="stop-color" values="#ffaa00;#ff2200;#ffaa00" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#d62d00">
                <animate attributeName="stop-color" values="#d62d00;#ffaa00;#d62d00" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#1a0200" />
            </linearGradient>

            {/* HEAD */}
            <g id="Cabeza">
              <g transform="scale(0.38)">
                <path d="M 10 0 L 20 -12 L 8 -9 L 18 -26 L -4 -13 L -12 -15 L -22 -8 L -32 -7 L -38 -2 L -38 2 L -32 7 L -22 8 L -12 15 L -4 13 L 18 26 L 8 9 L 20 12 Z" fill="#ff3300" filter="url(#strongGlow)" opacity="0.6" />
                <path d="M 10 0 L 20 -12 L 8 -9 L 18 -26 L -4 -13 L -12 -15 L -22 -8 L -32 -7 L -38 -2 L -38 2 L -32 7 L -22 8 L -12 15 L -4 13 L 18 26 L 8 9 L 20 12 Z" fill="url(#obsidian)" stroke="#050505" strokeWidth="1.5" />
                <path d="M -4 -13 L 18 -26 L 6 -14 Z" fill="#2a2a2a" />
                <path d="M 8 -9 L 20 -12 L 10 -4 Z" fill="#2a2a2a" />
                <path d="M -4 13 L 18 26 L 6 14 Z" fill="#2a2a2a" />
                <path d="M 8 9 L 20 12 L 10 4 Z" fill="#2a2a2a" />
                <path d="M 8 0 L 2 -3 L -8 -2 L -20 -4 L -34 -1 L -34 1 L -20 4 L -8 2 L 2 3 Z" fill="url(#emberPulse)" />
                <path d="M -10 -13 L -14 -10 L -8 -8 Z" fill="#ff5500" />
                <path d="M -10 13 L -14 10 L -8 8 Z" fill="#ff5500" />
                <path d="M -6 0 L 0 -4 L 6 0 L 0 4 Z" fill="#1a1a1a" stroke="#000" strokeWidth="0.5" />
                <path d="M -16 0 L -10 -3 L -4 0 L -10 3 Z" fill="#222" stroke="#000" strokeWidth="0.5" />
                <path d="M -26 0 L -21 -2 L -16 0 L -21 2 Z" fill="#111" stroke="#000" strokeWidth="0.5" />
                <path d="M -16 -6 L -8 -11 L -12 -4 Z" fill="#ffffff" filter="url(#strongGlow)" />
                <path d="M -16 6 L -8 11 L -12 4 Z" fill="#ffffff" filter="url(#strongGlow)" />
                <path d="M -35 -3 L -32 -5 L -31 -2 Z" fill="#ffea00" filter="url(#strongGlow)" opacity="0.8" />
                <path d="M -35 3 L -32 5 L -31 2 Z" fill="#ffea00" filter="url(#strongGlow)" opacity="0.8" />
              </g>
            </g>

            {/* WINGS */}
            <g id="Aletas">
              <g transform="scale(0.38)">
                <path d="M 15 -20 C 25 -40, 30 -50, 40 -70 C 15 -100, -10 -130, -20 -170 Q -40 -120, -60 -100 Q -80 -140, -100 -180 Q -85 -100, -80 -70 Q -110 -90, -130 -100 C -90 -50, -50 -25, -25 -15 Z" fill="#ff2200" filter="url(#strongGlow)" opacity="0.5" />
                <path d="M 15 20 C 25 40, 30 50, 40 70 C 15 100, -10 130, -20 170 Q -40 120, -60 100 Q -80 140, -100 180 Q -85 100, -80 70 Q -110 90, -130 100 C -90 50, -50 25, -25 15 Z" fill="#ff2200" filter="url(#strongGlow)" opacity="0.5" />
                <path d="M 15 -20 C 25 -40, 30 -50, 40 -70 C 15 -100, -10 -130, -20 -170 Q -40 -120, -60 -100 Q -80 -140, -100 -180 Q -85 -100, -80 -70 Q -110 -90, -130 -100 C -90 -50, -50 -25, -25 -15 Z" fill="url(#fireMembraneTop)" />
                <path d="M 15 20 C 25 40, 30 50, 40 70 C 15 100, -10 130, -20 170 Q -40 120, -60 100 Q -80 140, -100 180 Q -85 100, -80 70 Q -110 90, -130 100 C -90 50, -50 25, -25 15 Z" fill="url(#fireMembraneBot)" />
                <path d="M 15 -20 L 40 -70 L -20 -170" stroke="url(#obsidian)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 40 -70 L -100 -180" stroke="url(#obsidian)" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 40 -70 L -130 -100" stroke="url(#obsidian)" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 15 20 L 40 70 L -20 170" stroke="url(#obsidian)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 40 70 L -100 180" stroke="url(#obsidian)" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 40 70 L -130 100" stroke="url(#obsidian)" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 20 -15 L 45 -80 L 35 -85 L 15 -25 Z" fill="url(#obsidian)" />
                <path d="M 20 15 L 45 80 L 35 85 L 15 25 Z" fill="url(#obsidian)" />
                <path d="M 45 -80 L -20 -170 L -15 -160 Z" fill="url(#emberPulse)" />
                <path d="M 45 -80 L -100 -180 L -95 -170 Z" fill="url(#emberPulse)" />
                <path d="M 45 -80 L -130 -100 L -125 -95 Z" fill="url(#emberPulse)" />
                <path d="M 45 80 L -20 170 L -15 160 Z" fill="url(#emberPulse)" />
                <path d="M 45 80 L -100 180 L -95 170 Z" fill="url(#emberPulse)" />
                <path d="M 45 80 L -130 100 L -125 95 Z" fill="url(#emberPulse)" />
              </g>
            </g>

            {/* BODY SEGMENTS / SPINE */}
            <g id="Espina">
              <g transform="scale(0.38)">
                <path d="M 12 0 L 0 -14 L -18 -21 L -12 -7 L -28 0 L -12 7 L -18 21 L 0 14 Z" fill="#ff3300" opacity="0.3" />
                <path d="M 10 0 L 0 -12 L -15 -18 L -10 -6 L -25 0 L -10 6 L -15 18 L 0 12 Z" fill="url(#obsidian)" stroke="#050505" strokeWidth="1" />
                <path d="M 6 0 L 0 -8 L -10 -12 L -6 -4 L -18 0 L -6 4 L -10 12 L 0 8 Z" fill="url(#emberPulse)" />
                <path d="M 8 0 L 0 -4 L -10 0 L 0 4 Z" fill="#111" />
                <path d="M -2 0 L -8 -3 L -16 0 L -8 3 Z" fill="#222" />
              </g>
            </g>

            {/* TAIL TIP */}
            <g id="Cola">
              <g transform="scale(0.38)">
                {/* Long thin tapering tail spike */}
                <path d="M 8 0 L 0 -5 L -20 -3 L -45 -1 L -75 0 L -45 1 L -20 3 L 0 5 Z" fill="url(#obsidian)" stroke="#050505" strokeWidth="0.8"/>
                {/* Molten core running through */}
                <path d="M 6 0 L -1 -2 L -44 -0.5 L -73 0 L -44 0.5 L -1 2 Z" fill="url(#emberPulse)" opacity="0.8"/>
                {/* Very sharp needle tip */}
                <path d="M -75 0 L -95 -1.5 L -115 0 L -95 1.5 Z" fill="#ff3300" filter="url(#strongGlow)" opacity="0.9"/>
                <path d="M -112 0 L -130 -0.5 L -145 0 L -130 0.5 Z" fill="#ffaa00" filter="url(#strongGlow)" opacity="0.7"/>
              </g>
            </g>
          </defs>
          <g ref={screenRef} id="screen" />
        </svg>
      )}

      {/* ── PREMIUM MINIMAL MODE: DOT & LAGGING RING CURSOR ───────────────── */}
      {!isEpicMode && (
        <>
          {/* Sharp precision dot — follows cursor instantly */}
          <div
            ref={minDotRef}
            aria-hidden="true"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              pointerEvents: "none",
              zIndex: 999999,
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 0 6px rgba(50,245,154,0.8), 0 0 14px rgba(50,245,154,0.35)",
              willChange: "transform, opacity",
              transition: "width 0.18s ease, height 0.18s ease, box-shadow 0.18s ease, opacity 0.15s ease",
            }}
          />
          {/* Precision ring — trails behind with lerp, morphs on state */}
          <div
            ref={minRingRef}
            aria-hidden="true"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              pointerEvents: "none",
              zIndex: 999998,
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "1px solid rgba(50, 245, 154, 0.45)",
              background: "transparent",
              willChange: "transform",
              transition: "width 0.3s cubic-bezier(0.34,1.56,0.64,1), height 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease, border-radius 0.3s ease, border 0.22s ease",
            }}
          />
        </>
      )}

      {/* ── FLOATING TOGGLE SWITCH WIDGET ─────────────────────────────────── */}
      {/* ── FLOATING TOGGLE SWITCH WIDGET (SWITCH SLIDER STYLE) ───────────── */}
      <button
        onClick={toggleMode}
        type="button"
        title={isEpicMode ? "Switch to Classic Cursor (Off)" : "Switch to Epic Cursor (On)"}
        className="fixed bottom-6 right-6 z-[9999999] pointer-events-auto hidden md:flex h-[32px] w-[58px] items-center rounded-full border backdrop-blur-xl transition-all duration-300 shadow-xl bg-black/40 light:bg-white/85 border-white/10 light:border-black/10 shadow-black/10 dark:shadow-black/40 hover:scale-105 active:scale-95 group/cursor-toggle"
        style={{
          borderColor: isEpicMode 
            ? "rgba(249, 115, 22, 0.4)" 
            : "var(--cursor-ring-color)",
          boxShadow: isEpicMode
            ? "0 0 20px rgba(249, 115, 22, 0.12), 0 8px 30px rgba(0,0,0,0.3)"
            : "0 0 20px rgba(50, 245, 154, 0.12), 0 8px 30px rgba(0,0,0,0.3)",
        }}
        data-cursor="hover"
      >
        {/* Sliding Knob */}
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 shadow-md ${
            isEpicMode 
              ? "translate-x-[26px] bg-orange-500/10 border border-orange-500/30" 
              : "translate-x-[4px] bg-[rgba(50,245,154,0.1)] border border-[rgba(50,245,154,0.25)]"
          }`}
        >
          {isEpicMode ? (
            <Zap 
              className="w-3.5 h-3.5 text-orange-500 light:text-orange-600 transition-transform duration-300 group-hover/cursor-toggle:scale-110"
              style={{
                filter: "drop-shadow(0 0 3px rgba(249,115,22,0.8))"
              }}
            />
          ) : (
            <MousePointer 
              className="w-3.5 h-3.5 text-[var(--cursor-accent-color)] transition-transform duration-300 group-hover/cursor-toggle:scale-110"
              style={{
                filter: "drop-shadow(0 0 3px var(--cursor-accent-color))"
              }}
            />
          )}
        </div>
      </button>
    </>
  );
}
