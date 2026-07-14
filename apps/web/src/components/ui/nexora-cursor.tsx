"use client";

import { useEffect } from "react";

export function NexoraCursor() {
  useEffect(() => {
    // Create elements
    const dot = document.createElement("div");
    dot.id = "nexora-cursor-dot";

    const ring = document.createElement("div");
    ring.id = "nexora-cursor-ring";

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // Ring lags behind with lerp
    let dotX = -100, dotY = -100;
    let ringX = -100, ringY = -100;
    let raf: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      ringX = lerp(ringX, dotX, 0.12);
      ringY = lerp(ringY, dotY, 0.12);

      dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;
    };

    const onEnter = (e: MouseEvent) => {
      const el = e.target as Element;
      if (el.closest("a, button, [role='button'], input, textarea, select, label, [tabindex]")) {
        document.body.classList.add("nx-hover");
      }
    };

    const onLeave = (e: MouseEvent) => {
      const el = e.target as Element;
      if (el.closest("a, button, [role='button'], input, textarea, select, label, [tabindex]")) {
        document.body.classList.remove("nx-hover");
      }
    };

    const onDown = () => {
      document.body.classList.add("nx-click");
    };

    const onUp = () => {
      document.body.classList.remove("nx-click");
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      dot.remove();
      ring.remove();
      document.body.classList.remove("nx-hover", "nx-click");
    };
  }, []);

  return null;
}
