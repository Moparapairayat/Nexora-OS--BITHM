"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

export function PandaCTA() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [submitBtnText, setSubmitBtnText] = useState("Send Message");
  const [submitBtnDisabled, setSubmitBtnDisabled] = useState(false);
  const [submitBtnBg, setSubmitBtnBg] = useState("");

  useEffect(() => {
    if (!rootRef.current) return;

    // Helper to select elements scoped to this component
    const select = (selector: string) => rootRef.current?.querySelector(selector) as HTMLElement | null;

    const mascotContainer = select("#mascot-container");
    const pupilLeft = select("#pupil-left");
    const pupilRight = select("#pupil-right");
    const headGroup = select("#panda-head");
    const bodyGroup = select("#panda-body");
    const branchGroup = select("#bamboo-branch");
    const pandaCharacter = select("#panda-character");

    if (!mascotContainer || !pupilLeft || !pupilRight || !headGroup || !bodyGroup || !branchGroup || !pandaCharacter) {
      return;
    }

    // ----------------------------------------------------
    // CURSOR TRACKING VARIABLES
    // ----------------------------------------------------
    const MAX_PUPIL_OFFSET_X = 6, MAX_PUPIL_OFFSET_Y = 8;
    const MAX_HEAD_ROTATION = 15, MAX_BODY_LEAN = 5;      
    const SENSITIVITY_RADIUS = 650;
    const EASE_EYES = 0.35, EASE_HEAD = 0.10, EASE_BODY = 0.045;
    const HEAD_ORIGIN_VB = { x: 300, y: 230 }, VIEWBOX_SIZE = 500;

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let headOriginScreen = { x: 0, y: 0 };
    let currentPupilX = 0, currentPupilY = 0, currentHeadRot = 0, currentBodyRot = 0;

    // We attach attention target to window/module scope
    (window as any).pandaAttentionTarget = null; 

    function updateHeadOrigin() {
      if (!mascotContainer) return;
      const rect = mascotContainer.getBoundingClientRect();
      const scaleX = rect.width / VIEWBOX_SIZE;
      const scaleY = rect.height / VIEWBOX_SIZE;
      headOriginScreen.x = rect.left + HEAD_ORIGIN_VB.x * scaleX;
      headOriginScreen.y = rect.top + HEAD_ORIGIN_VB.y * scaleY;
    }

    const onResize = () => {
      updateHeadOrigin();
      updateBranchOrigin();
    };

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      lastMouseTime = performance.now();
      if (state === "ASLEEP" || state === "FALLING_ASLEEP" || state === "LOOKING_AROUND" || state === "YAWNING") {
        cancelAllAnimations();
        wakeUpSequence();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    setTimeout(onResize, 200); // Initial alignment delay to ensure DOM is drawn

    // ----------------------------------------------------
    // BAMBOO PHYSICS VARIABLES
    // ----------------------------------------------------
    const BRANCH_STIFFNESS = 0.018, BRANCH_DAMPING = 0.22, BRANCH_MAX_BEND = 5;        
    const PANDA_STIFFNESS = 0.010, PANDA_DAMPING = 0.16, PANDA_SWING_FACTOR = 1.3;   
    const IDLE_SWAY_AMPLITUDE = 0.5, IDLE_SWAY_SPEED = 0.00035;  
    const CURSOR_INFLUENCE_RADIUS = 700, BRANCH_ORIGIN_VB = { x: 480, y: 20 };

    let branchOriginScreen = { x: 0, y: 0 }, branchAngle = 0, branchVelocity = 0;
    let pandaSwingAngle = 0, pandaVelocity = 0;

    function updateBranchOrigin() {
      if (!mascotContainer) return;
      const rect = mascotContainer.getBoundingClientRect();
      const scaleX = rect.width / VIEWBOX_SIZE;
      const scaleY = rect.height / VIEWBOX_SIZE;
      branchOriginScreen.x = rect.left + BRANCH_ORIGIN_VB.x * scaleX;
      branchOriginScreen.y = rect.top + BRANCH_ORIGIN_VB.y * scaleY;
    }

    function stepSpring(angle: number, velocity: number, target: number, stiffness: number, damping: number) {
      const acceleration = -stiffness * (angle - target) - damping * velocity;
      return [angle + velocity + acceleration, velocity + acceleration];
    }

    // ----------------------------------------------------
    // INTERACTION SYSTEM STUFF
    // ----------------------------------------------------
    const dom = {
      fallWrapper: select("#panda-fall-wrapper"),
      head: select("#panda-head-idle"),
      body: select("#panda-body-idle"),
      arm: select("#arm-free-idle"),
      armHanging: select("#arm-hanging-idle"),
      bamboo: select("#bamboo-branch-idle"),
      eyeLeftInner: select("#eye-left-inner"),
      eyeRightInner: select("#eye-right-inner"),
      pupilLeft: select("#pupil-left-idle"),
      pupilRight: select("#pupil-right-idle"),
      basePupils: rootRef.current?.querySelectorAll(".pupils") as NodeListOf<HTMLElement> | undefined,
      spiralEyesLayer: select("#spiral-eyes"),
      spiralL: select("#spiral-l"),
      spiralR: select("#spiral-r"),
      mouthLine: select("#mouth-line"),
      mouthYawn: select("#mouth-yawn"),
      mouthSmile: select("#mouth-smile"),
      mouthAnnoyed: select("#mouth-annoyed"),
      zzzLayer: select("#zzz-layer"),
      starsLayer: select("#stars-layer"),
      leavesLayer: select("#leaves-layer"),
      dustLayer: select("#dust-layer")
    };

    let state = "AWAKE"; 
    let lastMouseTime = performance.now();
    let clickCount = 0;
    let clickTimer: NodeJS.Timeout | null = null;
    
    const stateVals = {
      headRot: 0,
      eyeScaleY: 1,
      pupilX: 0,
      armRot: 0,
      armHangingRot: 0,
      legRightRot: 0,
      bodyScaleX: 1,
      bodyScaleY: 1,
      bambooProceduralBending: 0,
      fallX: 0,
      fallY: 0,
      fallRot: 0
    };

    let breath = { headRot: 0, scaleY: 0, scaleX: 0, bambooRot: 0 };
    interface Tween {
      prop: keyof typeof stateVals;
      startValue: number;
      endValue: number;
      duration: number;
      easing: (t: number) => number;
      startTime: number;
      resolve: () => void;
    }
    interface Delay {
      timerId: NodeJS.Timeout;
      resolve: () => void;
    }
    interface Particle {
      type: 'zzz' | 'star' | 'leaf' | 'dust';
      el: SVGElement;
      startTime: number;
      angleOffset?: number;
      x?: number;
      y?: number;
      vx?: number;
      vy?: number;
    }

    let activeTweens: Tween[] = [];
    let activeDelays: Delay[] = [];
    let particleEntities: Particle[] = [];

    const easeInCubic = (t: number) => t * t * t;
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeOutElastic = (t: number) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    };

    function animateProp(prop: keyof typeof stateVals, endValue: number, duration: number, easing = easeInOutCubic) {
      return new Promise<void>(resolve => {
        activeTweens.push({
          prop, startValue: stateVals[prop], endValue, duration, easing, startTime: performance.now(), resolve
        });
      });
    }

    function sleepDelay(ms: number) {
      return new Promise<void>(resolve => {
        const timerId = setTimeout(() => {
          activeDelays = activeDelays.filter(d => d.timerId !== timerId);
          resolve();
        }, ms);
        activeDelays.push({ timerId, resolve });
      });
    }

    function cancelAllAnimations() {
      activeTweens.forEach(t => t.resolve());
      activeTweens = [];
      activeDelays.forEach(d => { clearTimeout(d.timerId); d.resolve(); });
      activeDelays = [];
    }

    function setMouth(type: 'line' | 'yawn' | 'smile' | 'annoyed') {
      if (dom.mouthLine) dom.mouthLine.style.opacity = type === "line" ? "1" : "0";
      if (dom.mouthYawn) dom.mouthYawn.style.opacity = type === "yawn" ? "1" : "0";
      if (dom.mouthSmile) dom.mouthSmile.style.opacity = type === "smile" ? "1" : "0";
      if (dom.mouthAnnoyed) dom.mouthAnnoyed.style.opacity = type === "annoyed" ? "1" : "0";
    }

    async function playIdleSequence() {
      if (state !== "AWAKE") return;
      state = "LOOKING_AROUND";
      await Promise.all([animateProp("headRot", -12, 1000), animateProp("pupilX", -3, 1000)]);
      if (state === "WAKING_UP" || state === "CELEBRATING") return;
      await sleepDelay(600);
      await Promise.all([animateProp("headRot", 12, 1200), animateProp("pupilX", 3, 1200)]);
      if (state === "WAKING_UP" || state === "CELEBRATING") return;
      await sleepDelay(500);
      await Promise.all([animateProp("headRot", -4, 900), animateProp("pupilX", 0, 900)]);
      if (state === "WAKING_UP" || state === "CELEBRATING") return;

      state = "YAWNING";
      setMouth("yawn");
      await Promise.all([
        animateProp("armRot", -100, 900, easeOutCubic), 
        animateProp("headRot", -16, 1100),              
        animateProp("eyeScaleY", 0.25, 1000)            
      ]);
      if (state === "WAKING_UP" || state === "CELEBRATING") return;
      await sleepDelay(800);
      
      setMouth("line");
      await Promise.all([animateProp("armRot", 0, 1000), animateProp("headRot", 0, 1000), animateProp("eyeScaleY", 1, 900)]);
      if (state === "WAKING_UP" || state === "CELEBRATING") return;

      state = "FALLING_ASLEEP";
      await Promise.all([animateProp("eyeScaleY", 0.04, 1800), animateProp("headRot", 8, 1800)]);
      if (state === "WAKING_UP" || state === "CELEBRATING") return;
      state = "ASLEEP";
    }

    async function wakeUpSequence() {
      if (state === "CELEBRATING") return;
      state = "WAKING_UP";
      setMouth("line");
      if (dom.spiralEyesLayer) dom.spiralEyesLayer.style.opacity = "0";
      dom.basePupils?.forEach(p => p.style.opacity = "1");

      await Promise.all([
        animateProp("eyeScaleY", 1, 400, easeOutCubic),
        animateProp("headRot", -8, 400, easeOutCubic),
        animateProp("armRot", -30, 400, easeOutCubic),
        animateProp("pupilX", 0, 400),
        animateProp("bodyScaleX", 1, 400),
        animateProp("bodyScaleY", 1, 400)
      ]);
      
      await Promise.all([animateProp("headRot", 0, 500), animateProp("armRot", 0, 500)]);
      state = "AWAKE";
      lastMouseTime = performance.now(); 
    }

    async function playSubmitSequence() {
      if (state === "CELEBRATING") return;
      state = "CELEBRATING"; 
      cancelAllAnimations();
      
      setMouth("smile");
      await Promise.all([
        animateProp("headRot", -10, 300),
        animateProp("eyeScaleY", 1.3, 300),
        animateProp("pupilX", 0, 300)
      ]);
      
      animateProp("armHangingRot", 100, 200, easeOutCubic);
      animateProp("armRot", -100, 200, easeOutCubic);
      animateProp("legRightRot", 30, 300, easeOutCubic);
      
      let clapping = true;
      (async () => {
        while(clapping) {
          animateProp("armHangingRot", 130, 100);
          await animateProp("armRot", -130, 100);
          animateProp("armHangingRot", 90, 100);
          await animateProp("armRot", -90, 100);
          
          animateProp("fallY", -10, 100).then(()=>animateProp("fallY", 0, 100));
          
          animateProp("bambooProceduralBending", 15 + Math.random()*10, 100)
            .then(() => animateProp("bambooProceduralBending", 0, 100));
        }
      })();
      
      await sleepDelay(1500); 
      clapping = false;
      
      setMouth("line"); 
      animateProp("eyeScaleY", 1.5, 100);
      animateProp("headRot", -25, 100);
      
      animateProp("bambooProceduralBending", -25, 150, easeOutCubic).then(() => {
        animateProp("bambooProceduralBending", 0, 600, easeOutElastic);
      });
      for(let i=0; i<6; i++) setTimeout(spawnLeaf, i * 40);
      
      await sleepDelay(250); 
      
      Promise.all([
        animateProp("fallY", 320, 600, easeInCubic),
        animateProp("fallX", -180, 600, easeInCubic),
        animateProp("fallRot", -360, 600, easeInCubic),
        animateProp("armHangingRot", -180, 600),
        animateProp("armRot", 180, 600),
        animateProp("headRot", 25, 600)
      ]);
      
      await sleepDelay(600);
      
      setMouth("annoyed"); 
      animateProp("eyeScaleY", 0.1, 100);
      animateProp("bodyScaleY", 0.45, 150, easeOutCubic);
      animateProp("bodyScaleX", 1.45, 150, easeOutCubic);
      
      for(let i=0; i<5; i++) {
        spawnDust(300 + stateVals.fallX, 300 + stateVals.fallY + 100);
      }
      
      await sleepDelay(150);
      
      animateProp("bodyScaleY", 1, 600, easeOutElastic);
      animateProp("bodyScaleX", 1, 600, easeOutElastic);
      
      animateProp("armHangingRot", 0, 500); 
      animateProp("armRot", -140, 500);     
      animateProp("headRot", -15, 500);
      setMouth("smile");
      animateProp("eyeScaleY", 0.7, 400); 
      
      await sleepDelay(700);
      
      await animateProp("pupilX", -5, 400);
      await sleepDelay(300);
      await animateProp("pupilX", 5, 400);
      await sleepDelay(300);
      await animateProp("pupilX", 0, 400);
      
      await sleepDelay(200);
      
      animateProp("armHangingRot", 180, 300);
      animateProp("armRot", -180, 300);
      setMouth("line");
      animateProp("eyeScaleY", 1, 300);
      
      await sleepDelay(300);
      
      Promise.all([
        animateProp("fallY", 0, 900, easeInOutCubic),
        animateProp("fallX", 0, 900, easeInOutCubic),
        animateProp("fallRot", 0, 900, easeInOutCubic)
      ]);
      
      let climbing = true;
      (async () => {
        while(climbing) {
          animateProp("armHangingRot", 150, 100);
          await animateProp("armRot", -210, 100);
          animateProp("armHangingRot", 210, 100);
          await animateProp("armRot", -150, 100);
        }
      })();
      
      await sleepDelay(900);
      climbing = false;
      
      await Promise.all([
        animateProp("armHangingRot", 0, 500, easeOutElastic),
        animateProp("armRot", 0, 500, easeOutElastic),
        animateProp("legRightRot", 0, 500, easeOutElastic), 
        animateProp("headRot", 0, 500)
      ]);
      
      state = "AWAKE";
      lastMouseTime = performance.now();
    }

    async function playDizzySequence() {
      if (state !== "AWAKE") return;
      state = "DIZZY";
      cancelAllAnimations();
      dom.basePupils?.forEach(p => p.style.opacity = "0");
      if (dom.spiralEyesLayer) dom.spiralEyesLayer.style.opacity = "1";
      
      animateProp("headRot", -15, 300, easeOutCubic);
      animateProp("eyeScaleY", 1.2, 300, easeOutCubic);
      for(let i=0; i<3; i++) spawnStar(i * (Math.PI * 2 / 3));

      await sleepDelay(2000);

      await animateProp("headRot", 15, 100, easeOutCubic);
      await animateProp("headRot", -15, 150, easeOutCubic);
      await animateProp("headRot", 0, 150, easeOutCubic);

      dom.basePupils?.forEach(p => p.style.opacity = "1");
      if (dom.spiralEyesLayer) dom.spiralEyesLayer.style.opacity = "0";
      animateProp("eyeScaleY", 1, 300);
      state = "AWAKE";
      lastMouseTime = performance.now();
    }

    async function playWaveSequence() {
      if (state !== "AWAKE" && state !== "GIGGLING") return;
      state = "WAVING";
      cancelAllAnimations();
      setMouth("smile");

      await Promise.all([
        animateProp("armRot", -130, 400, easeOutCubic),
        animateProp("headRot", 8, 400)
      ]);

      for(let i=0; i<3; i++) {
        await animateProp("armRot", -100, 200);
        await animateProp("armRot", -140, 200);
      }

      setMouth("line");
      await Promise.all([animateProp("armRot", 0, 500), animateProp("headRot", 0, 500)]);
      state = "AWAKE";
      lastMouseTime = performance.now();
    }

    async function playGiggleSequence() {
      if (state !== "AWAKE") return;
      state = "GIGGLING";
      cancelAllAnimations();
      setMouth("smile");

      await Promise.all([
        animateProp("bodyScaleY", 0.92, 150, easeOutCubic),
        animateProp("bodyScaleX", 1.05, 150, easeOutCubic),
        animateProp("headRot", -5, 150)
      ]);
      await Promise.all([
        animateProp("bodyScaleY", 1.05, 150, easeOutCubic),
        animateProp("bodyScaleX", 0.97, 150, easeOutCubic),
        animateProp("headRot", 3, 150)
      ]);
      await Promise.all([
        animateProp("bodyScaleY", 1, 400, easeOutElastic),
        animateProp("bodyScaleX", 1, 400, easeOutElastic),
        animateProp("headRot", 0, 400)
      ]);

      setMouth("line");
      state = "AWAKE";
      lastMouseTime = performance.now();
    }

    async function playSneezeSequence() {
      if (state !== "AWAKE") return;
      state = "SNEEZING";
      cancelAllAnimations();
      setMouth("yawn");

      await Promise.all([
        animateProp("headRot", -20, 600, easeOutCubic),
        animateProp("eyeScaleY", 0.2, 600),
        animateProp("bodyScaleY", 1.05, 600),
        animateProp("bodyScaleX", 0.98, 600)
      ]);
      
      await sleepDelay(200);

      setMouth("line");
      spawnLeaf();
      await Promise.all([
        animateProp("headRot", 35, 150, easeOutCubic),
        animateProp("eyeScaleY", 0.05, 100),
        animateProp("bodyScaleY", 0.9, 150),
        animateProp("bodyScaleX", 1.05, 150),
        animateProp("armRot", -20, 150)
      ]);

      await sleepDelay(300);

      await Promise.all([
        animateProp("headRot", 0, 600, easeOutElastic),
        animateProp("eyeScaleY", 1, 400),
        animateProp("bodyScaleY", 1, 600, easeOutElastic),
        animateProp("bodyScaleX", 1, 600, easeOutElastic),
        animateProp("armRot", 0, 600)
      ]);

      state = "AWAKE";
      lastMouseTime = performance.now();
    }

    async function playAnnoyedSequence() {
      state = "ANNOYED";
      cancelAllAnimations();
      setMouth("annoyed");

      await Promise.all([
        animateProp("armRot", -80, 400, easeOutCubic), 
        animateProp("headRot", -15, 400, easeOutCubic), 
        animateProp("pupilX", -4, 400),
        animateProp("eyeScaleY", 0.5, 400)
      ]);

      await sleepDelay(3000);

      setMouth("smile");
      await Promise.all([
        animateProp("headRot", 0, 500),
        animateProp("pupilX", 0, 500),
        animateProp("eyeScaleY", 1, 500)
      ]);
      await sleepDelay(500);
      
      setMouth("line");
      animateProp("armRot", 0, 500);

      clickCount = 0;
      state = "AWAKE";
      lastMouseTime = performance.now();
    }

    function handleInputFocus(e: FocusEvent) {
      const el = e.target as HTMLElement;
      const rect = el.getBoundingClientRect();
      (window as any).pandaAttentionTarget = { x: rect.left + rect.width, y: rect.top + rect.height / 2 };
      if (state === "AWAKE") { state = "TYPING"; cancelAllAnimations(); }
    }

    function handleInputBlur() {
      (window as any).pandaAttentionTarget = null;
      if (state === "TYPING") { state = "AWAKE"; lastMouseTime = performance.now(); }
    }

    let nodTimer: NodeJS.Timeout | null = null;
    function handleInputType() {
      if (state !== "TYPING") return;
      if (!nodTimer) {
        nodTimer = setTimeout(() => { nodTimer = null; }, 1500);
        if (Math.random() > 0.3) animateProp("headRot", 8, 150).then(() => animateProp("headRot", 0, 250));
      }
    }

    async function hoverSendBtn() {
      if (state !== "AWAKE") return;
      state = "HOVER";
      cancelAllAnimations();
      setMouth("smile");
      await Promise.all([animateProp("armRot", 65, 400, easeOutCubic), animateProp("headRot", -5, 400)]);
    }

    async function unhoverSendBtn() {
      if (state !== "HOVER") return;
      setMouth("line");
      await Promise.all([animateProp("armRot", 0, 400), animateProp("headRot", 0, 400)]);
      state = "AWAKE";
      lastMouseTime = performance.now();
    }

    // ----------------------------------------------------
    // PARTICLES (Zzz, Stars, Leaves, Dust)
    // ----------------------------------------------------
    function spawnZzz() {
      if (!dom.zzzLayer) return;
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.textContent = "z";
      text.setAttribute("fill", "#dce1ee");
      text.setAttribute("font-family", "Outfit, sans-serif");
      text.setAttribute("font-weight", "600");
      text.setAttribute("font-size", "22px");
      dom.zzzLayer.appendChild(text);
      particleEntities.push({ type: "zzz", el: text, startTime: performance.now() });
    }

    function spawnStar(angleOffset: number) {
      if (!dom.starsLayer) return;
      const star = document.createElementNS("http://www.w3.org/2000/svg", "path");
      star.setAttribute("d", "M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z");
      star.setAttribute("fill", "#fbbf24");
      dom.starsLayer.appendChild(star);
      particleEntities.push({ type: "star", el: star, startTime: performance.now(), angleOffset });
    }

    function spawnLeaf() {
      if (!dom.leavesLayer) return;
      const leaf = document.createElementNS("http://www.w3.org/2000/svg", "path");
      leaf.setAttribute("d", "M 0 0 Q -10 -5 -15 5 Q 0 15 0 0");
      leaf.setAttribute("fill", "#4ade80");
      dom.leavesLayer.appendChild(leaf);
      particleEntities.push({ type: "leaf", el: leaf, startTime: performance.now() });
    }
    
    function spawnDust(x: number, y: number) {
      if (!dom.dustLayer) return;
      const puff = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      puff.setAttribute("r", (10 + Math.random() * 12).toString());
      puff.setAttribute("fill", "#cbd5e1");
      dom.dustLayer.appendChild(puff);
      particleEntities.push({ 
        type: "dust", 
        el: puff, 
        startTime: performance.now(),
        x, y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.08
      });
    }

    // Connect form listener
    const submitBtn = select("#submit-btn");
    const onHoverIn = () => { hoverSendBtn(); };
    const onHoverOut = () => { unhoverSendBtn(); };

    if (submitBtn) {
      submitBtn.addEventListener("mouseenter", onHoverIn);
      submitBtn.addEventListener("mouseleave", onHoverOut);
    }

    // Input listeners
    const inputs = rootRef.current?.querySelectorAll(".form-control") || [];
    inputs.forEach(el => {
      el.addEventListener("focus", handleInputFocus as any);
      el.addEventListener("blur", handleInputBlur as any);
      el.addEventListener("input", handleInputType as any);
    });

    // Panda click triggers
    const onPandaClick = (e: MouseEvent) => {
      clickCount++;
      if (clickTimer) clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
      
      if (clickCount >= 5 && state !== "ANNOYED" && state !== "CELEBRATING") {
        playAnnoyedSequence();
        return;
      }
      if (state !== "AWAKE") return;
      const target = e.target as SVGElement;
      if (target.id === "hit-nose") playSneezeSequence();
      else if (target.id === "hit-belly") playGiggleSequence();
    };

    const onPandaDblClick = () => {
      playWaveSequence();
    };

    pandaCharacter.addEventListener("click", onPandaClick);
    pandaCharacter.addEventListener("dblclick", onPandaDblClick);

    // Exposé submit trigger to window scope for react form submission
    (window as any).triggerPandaSubmitSequence = () => {
      playSubmitSequence();
    };

    // ----------------------------------------------------
    // MAIN ANIMATION LOOP
    // ----------------------------------------------------
    let lastZzzTime = 0, starSpin = 0;
    let frameId: number;
    let lastX = 0, lastY = 0, lastT = performance.now(), fastFrames = 0;

    function tick(timestamp: number) {
      if (state === "AWAKE" && (timestamp - lastMouseTime > 5000)) playIdleSequence();

      const dt = timestamp - lastT;
      if (dt > 0) {
        const vel = Math.hypot(mouseX - lastX, mouseY - lastY) / dt;
        if (vel > 3.0) fastFrames++; else fastFrames = 0;
        if (fastFrames > 5 && state === "AWAKE") playDizzySequence();
      }
      lastX = mouseX; lastY = mouseY; lastT = timestamp;

      // Process Tweens
      for (let i = activeTweens.length - 1; i >= 0; i--) {
        const t = activeTweens[i];
        const progress = Math.min((timestamp - t.startTime) / t.duration, 1);
        if (progress >= 1) {
          stateVals[t.prop] = t.endValue;
          t.resolve();
          activeTweens.splice(i, 1);
        } else {
          stateVals[t.prop] = t.startValue + (t.endValue - t.startValue) * t.easing(progress);
        }
      }

      // Procedural Breathing & Dizzy Modifiers
      if (state === "ASLEEP" || state === "FALLING_ASLEEP") {
        const cycle = timestamp * 0.002;
        breath.scaleY = Math.sin(cycle) * 0.015;
        breath.scaleX = Math.cos(cycle) * 0.005; 
        breath.headRot = Math.sin(cycle) * 1.5;
        breath.bambooRot = Math.sin(cycle - 0.5) * 0.4;
      } else {
        breath.scaleY *= 0.9; breath.scaleX *= 0.9;
        breath.headRot *= 0.9; breath.bambooRot *= 0.9;
      }

      if (state === "DIZZY") {
        const cycle = timestamp * 0.015;
        stateVals.headRot = Math.sin(cycle) * 6;
        starSpin = timestamp * 0.15;
        if (dom.spiralL) dom.spiralL.style.transform = `rotate(${timestamp * 0.5}deg)`;
        if (dom.spiralR) dom.spiralR.style.transform = `rotate(${timestamp * 0.5}deg)`;
      }

      // Apply Transforms
      if (dom.fallWrapper) {
        dom.fallWrapper.style.transform = `translate(${stateVals.fallX}px, ${stateVals.fallY}px) rotate(${stateVals.fallRot}deg)`;
      }
      if (dom.head) dom.head.style.transform = `rotate(${stateVals.headRot + breath.headRot}deg)`;
      if (dom.body) dom.body.style.transform = `scale(${stateVals.bodyScaleX + breath.scaleX}, ${stateVals.bodyScaleY + breath.scaleY})`;
      if (dom.arm) dom.arm.style.transform = `rotate(${stateVals.armRot}deg)`;
      if (dom.armHanging) dom.armHanging.style.transform = `rotate(${stateVals.armHangingRot}deg)`;
      
      const legR = select("#leg-right");
      if (legR) legR.style.transform = `rotate(${stateVals.legRightRot}deg)`;
      if (dom.bamboo) dom.bamboo.style.transform = `rotate(${breath.bambooRot + stateVals.bambooProceduralBending}deg)`;
      
      const eyeScale = `scaleY(${stateVals.eyeScaleY})`;
      if (dom.eyeLeftInner) dom.eyeLeftInner.style.transform = eyeScale;
      if (dom.eyeRightInner) dom.eyeRightInner.style.transform = eyeScale;
      
      const pupilTrans = `translateX(${stateVals.pupilX}px)`;
      if (dom.pupilLeft) dom.pupilLeft.style.transform = pupilTrans;
      if (dom.pupilRight) dom.pupilRight.style.transform = pupilTrans;

      // Particle Updates
      if (state === "ASLEEP" && (timestamp - lastZzzTime > 2500)) { spawnZzz(); lastZzzTime = timestamp; }

      for (let i = particleEntities.length - 1; i >= 0; i--) {
        const p = particleEntities[i];
        const age = timestamp - p.startTime;

        if (p.type === "zzz") {
          const life = age / 4000;
          if (life >= 1) { p.el.remove(); particleEntities.splice(i, 1); }
          else {
            const driftY = -life * 75, driftX = Math.sin(life * Math.PI * 3) * 12 + life * 15;
            let opacity = life < 0.2 ? life / 0.2 : life > 0.6 ? 1 - ((life - 0.6) / 0.4) : 1;
            p.el.setAttribute("transform", `translate(${290 + driftX}, ${240 + driftY}) scale(${0.5 + life})`);
            p.el.setAttribute("opacity", opacity.toString());
          }
        } 
        else if (p.type === "star") {
          if (state !== "DIZZY") { p.el.remove(); particleEntities.splice(i, 1); }
          else {
            const angle = (p.angleOffset ?? 0) + (starSpin * Math.PI / 180);
            p.el.setAttribute("transform", `translate(${300 + Math.cos(angle)*60}, ${200 + Math.sin(angle)*24}) rotate(${starSpin*2}) scale(1.5)`);
          }
        }
        else if (p.type === "leaf") {
          const life = age / 2000;
          if (life >= 1) { p.el.remove(); particleEntities.splice(i, 1); }
          else {
            const x = 350 - (life * 40) + Math.sin(life * 10) * 15;
            p.el.setAttribute("transform", `translate(${x}, ${140 + (life * 150)}) rotate(${life * 180})`);
            p.el.setAttribute("opacity", (1 - (life * life)).toString());
          }
        }
        else if (p.type === "dust") {
          const life = age / 800;
          if (life >= 1) { p.el.remove(); particleEntities.splice(i, 1); }
          else {
            const dx = (p.x ?? 0) + (p.vx ?? 0) * age;
            const dy = (p.y ?? 0) + (p.vy ?? 0) * age;
            p.el.setAttribute("transform", `translate(${dx}, ${dy}) scale(${1 + life})`);
            p.el.setAttribute("opacity", (0.8 * (1 - life)).toString());
          }
        }
      }

      // Bamboo branch swing & hanging swing updates
      const targetX = (window as any).pandaAttentionTarget ? (window as any).pandaAttentionTarget.x : mouseX;
      const targetY = (window as any).pandaAttentionTarget ? (window as any).pandaAttentionTarget.y : mouseY;
      
      const pDx = targetX - headOriginScreen.x;
      const pDy = targetY - headOriginScreen.y;
      const pDistance = Math.sqrt(pDx * pDx + pDy * pDy);
      const pAngle = Math.atan2(pDy, pDx);
      const pProximity = Math.min(pDistance / SENSITIVITY_RADIUS, 1);

      const targetPupilX = Math.cos(pAngle) * MAX_PUPIL_OFFSET_X * pProximity;
      const targetPupilY = Math.sin(pAngle) * MAX_PUPIL_OFFSET_Y * pProximity;
      const normX = Math.max(-1, Math.min(1, pDx / (window.innerWidth / 2)));
      const targetHeadRot = normX * MAX_HEAD_ROTATION;
      const targetBodyRot = normX * MAX_BODY_LEAN;

      currentPupilX += (targetPupilX - currentPupilX) * EASE_EYES;
      currentPupilY += (targetPupilY - currentPupilY) * EASE_EYES;
      currentHeadRot += (targetHeadRot - currentHeadRot) * EASE_HEAD;
      currentBodyRot += (targetBodyRot - currentBodyRot) * EASE_BODY;

      const pupilTransform = `translate(${currentPupilX.toFixed(2)}px, ${currentPupilY.toFixed(2)}px)`;
      if (pupilLeft) pupilLeft.style.transform = pupilTransform;
      if (pupilRight) pupilRight.style.transform = pupilTransform;
      if (headGroup) headGroup.style.transform = `rotate(${currentHeadRot.toFixed(2)}deg)`;
      if (bodyGroup) bodyGroup.style.transform = `rotate(${currentBodyRot.toFixed(2)}deg)`;

      // Bamboo branch swing updates
      const bDx = mouseX - branchOriginScreen.x;
      const bDy = mouseY - branchOriginScreen.y;
      const bProximity = Math.min(Math.sqrt(bDx * bDx + bDy * bDy) / CURSOR_INFLUENCE_RADIUS, 1);
      const bPull = Math.max(-1, Math.min(1, bDx / CURSOR_INFLUENCE_RADIUS)) * bProximity;
      const bIdleOffset = Math.sin(timestamp * IDLE_SWAY_SPEED) * IDLE_SWAY_AMPLITUDE;
      
      [branchAngle, branchVelocity] = stepSpring(branchAngle, branchVelocity, bPull * BRANCH_MAX_BEND + bIdleOffset, BRANCH_STIFFNESS, BRANCH_DAMPING);
      [pandaSwingAngle, pandaVelocity] = stepSpring(pandaSwingAngle, pandaVelocity, branchAngle * PANDA_SWING_FACTOR, PANDA_STIFFNESS, PANDA_DAMPING);

      if (branchGroup) branchGroup.style.transform = `rotate(${branchAngle.toFixed(3)}deg)`;
      if (pandaCharacter) pandaCharacter.style.transform = `rotate(${pandaSwingAngle.toFixed(3)}deg)`;

      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    // Cleanup
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameId);
      cancelAllAnimations();
      if (clickTimer) clearTimeout(clickTimer);
      if (submitBtn) {
        submitBtn.removeEventListener("mouseenter", onHoverIn);
        submitBtn.removeEventListener("mouseleave", onHoverOut);
      }
      inputs.forEach(el => {
        el.removeEventListener("focus", handleInputFocus as any);
        el.removeEventListener("blur", handleInputBlur as any);
        el.removeEventListener("input", handleInputType as any);
      });
      pandaCharacter.removeEventListener("click", onPandaClick);
      pandaCharacter.removeEventListener("dblclick", onPandaDblClick);
    };
  }, []);

  const handleFormSubmit = () => {
    const nameEl = selectField("#input-name") as HTMLInputElement | null;
    const emailEl = selectField("#input-email") as HTMLInputElement | null;
    const msgEl = selectField("#message-input") as HTMLTextAreaElement | null;

    const name = nameEl?.value.trim() || "";
    const email = emailEl?.value.trim() || "";
    const msg = msgEl?.value.trim() || "";

    if (name && email && msg) {
      setSubmitBtnText("Sent successfully!");
      setSubmitBtnBg("#10b981");
      setSubmitBtnDisabled(true);

      // Trigger the celebration sequence!
      if ((window as any).triggerPandaSubmitSequence) {
        (window as any).triggerPandaSubmitSequence();
      }

      // Reset form eventually
      setTimeout(() => {
        setSubmitBtnText("Send Message");
        setSubmitBtnBg("");
        setSubmitBtnDisabled(false);
        if (nameEl) nameEl.value = "";
        if (emailEl) emailEl.value = "";
        if (msgEl) msgEl.value = "";
      }, 6500);
    } else {
      if (!name && nameEl) nameEl.focus();
      else if (!email && emailEl) emailEl.focus();
      else if (!msg && msgEl) msgEl.focus();
    }
  };

  const selectField = (selector: string) => rootRef.current?.querySelector(selector) as HTMLElement | null;

  return (
    <section id="contact" className="relative w-full min-h-screen py-24 flex items-center justify-center bg-[#0b0d14] overflow-hidden" ref={rootRef}>
      {/* Scope embedded styles natively to this component */}
      <style jsx global>{`
        /* Spotlight Layer Variables */
        :root {
          --spotlight-color: rgba(255, 228, 180, 0.08);
          --spotlight-fade: rgba(255, 228, 180, 0.02);
        }

        .contact-container {
          position: relative;
          width: 100%;
          max-width: 520px;
          padding: 20px;
          z-index: 1;
        }

        /* Ambient Spotlight Layer */
        .ambient-spotlight {
          position: absolute;
          top: -250px;
          left: 50%;
          transform: translateX(-50%);
          width: 1000px;
          height: 800px;
          background: radial-gradient(ellipse at 50% 0%, var(--spotlight-color) 0%, var(--spotlight-fade) 40%, transparent 70%);
          filter: blur(6px);
          pointer-events: none;
          mix-blend-mode: screen;
          z-index: 50;
        }

        /* The Premium Contact Card */
        .contact-card {
          position: relative;
          background: rgba(22, 25, 37, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 50px 48px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 
            0 40px 80px rgba(0, 0, 0, 0.5), 
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 0 40px rgba(255, 255, 255, 0.02);
          z-index: 2;
        }

        .contact-header { margin-bottom: 36px; }
        .contact-header h2 {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .contact-header p {
          color: #8b92a5;
          font-size: 16px;
          font-weight: 300;
          line-height: 1.5;
        }

        .form-group { margin-bottom: 24px; position: relative; }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #8b92a5;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-control {
          width: 100%;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #f0f2f8;
          padding: 12px 18px;
          border-radius: 12px;
          font-family: inherit;
          font-size: 15px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .form-control:focus {
          outline: none;
          border-color: rgba(74, 222, 128, 0.5);
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.08);
        }
        textarea.form-control { resize: none; height: 120px; }

        /* AI Toolbar Styles */
        .ai-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }

        .ai-btn {
          background: rgba(165, 180, 252, 0.1);
          border: 1px solid rgba(165, 180, 252, 0.2);
          color: #a5b4fc;
          padding: 8px 14px;
          border-radius: 8px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ai-btn:hover:not(:disabled) {
          background: rgba(165, 180, 252, 0.2);
          border-color: rgba(165, 180, 252, 0.4);
          color: #f0f2f8;
        }

        .ai-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ai-status {
          font-size: 12px;
          color: #8b92a5;
          margin-left: auto;
          transition: opacity 0.3s ease;
          opacity: 0;
        }
        .ai-status.visible { opacity: 1; }
        .ai-status.error { color: #f87171; }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #4ade80, #10b981);
          color: #022c22;
          border: none;
          padding: 13px;
          border-radius: 12px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px rgba(74, 222, 128, 0.2);
          margin-top: 8px;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(74, 222, 128, 0.3);
          filter: brightness(1.05);
        }

        .mascot-container {
          position: absolute;
          top: -100px;
          right: -280px;
          width: 500px;
          height: 500px;
          z-index: 10;
          pointer-events: none; 
        }

        @media (max-width: 1100px) {
          .mascot-container {
            right: -180px;
            width: 420px;
            height: 420px;
            top: -80px;
          }
        }

        @media (max-width: 768px) {
          #contact {
            padding-top: 240px !important;
            padding-bottom: 80px !important;
          }
          .mascot-container {
            position: absolute;
            top: -200px;
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            width: 300px;
            height: 300px;
          }
          .contact-card {
            padding: 35px 24px;
          }
        }

        .mascot-svg {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible; 
          filter: drop-shadow(0 25px 35px rgba(0, 0, 0, 0.4));
        }

        #panda-character { pointer-events: auto; }
        .interactive-zone { cursor: pointer; }

        #panda-head { transform-origin: 300px 230px; }
        #panda-body { transform-origin: 300px 240px; }
        #arm-hanging { transform-origin: 360px 110px; }
        #arm-free { transform-origin: 260px 280px; }
        #leg-left { transform-origin: 290px 360px; }
        #leg-right { transform-origin: 360px 360px; }
        #bamboo-branch { transform-origin: 480px 20px; }
        #panda-character { transform-origin: 360px 110px; isolation: isolate; }

        #panda-fall-wrapper { transform-origin: 300px 300px; will-change: transform; }
        #panda-head-idle { transform-origin: 300px 230px; will-change: transform; }
        #panda-body-idle { transform-origin: 300px 240px; will-change: transform; }
        #arm-free-idle { transform-origin: 260px 280px; will-change: transform; }
        #arm-hanging-idle { transform-origin: 360px 110px; will-change: transform; }
        #bamboo-branch-idle { transform-origin: 480px 20px; will-change: transform; }
        #eye-left-inner { transform-origin: 254px 212px; will-change: transform; }
        #eye-right-inner { transform-origin: 334px 199px; will-change: transform; }
        
        #pupil-left-idle, #pupil-right-idle, #spiral-eyes, #eye-left-group, #eye-right-group { 
          will-change: transform; 
          transition: opacity 0.2s ease;
        }
        #mouth-line, #mouth-yawn, #mouth-smile, #mouth-annoyed { 
          transition: opacity 0.2s ease; 
        }

        #pupil-left, #pupil-right { will-change: transform; }
        #panda-head, #panda-body { will-change: transform; }
        #bamboo-branch { will-change: transform; }
        
        .spiral-path { transform-origin: center; }

        /* ── LIGHT MODE OVERRIDES ───────────────────────────────────────── */
        :global(.light) #contact {
          background-color: #f1f6f3 !important;
          border-top: 1px solid rgba(16, 185, 129, 0.1) !important;
        }

        :global(.light) .ambient-spotlight {
          background: radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.06) 0%, rgba(16, 185, 129, 0.01) 40%, transparent 70%) !important;
          mix-blend-mode: multiply !important;
        }

        :global(.light) .contact-card {
          background: rgba(255, 255, 255, 0.75) !important;
          border: 1px solid rgba(16, 185, 129, 0.15) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          box-shadow: 
            0 40px 80px rgba(16, 185, 129, 0.05), 
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            inset 0 0 40px rgba(16, 185, 129, 0.01) !important;
        }

        :global(.light) .contact-header h2 {
          background: linear-gradient(135deg, #111827, #065f46) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }

        :global(.light) .contact-header p {
          color: #4b5563 !important;
        }

        :global(.light) .form-group label {
          color: #374151 !important;
        }

        :global(.light) .form-control {
          background: rgba(255, 255, 255, 0.9) !important;
          border: 1px solid rgba(16, 185, 129, 0.22) !important;
          color: #111827 !important;
        }

        :global(.light) .form-control::placeholder {
          color: #9ca3af !important;
        }

        :global(.light) .form-control:focus {
          border-color: #10b981 !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
        }

        :global(.light) .ai-btn {
          background: rgba(16, 185, 129, 0.08) !important;
          border: 1px solid rgba(16, 185, 129, 0.15) !important;
          color: #065f46 !important;
        }

        :global(.light) .ai-btn:hover:not(:disabled) {
          background: rgba(16, 185, 129, 0.15) !important;
          color: #042f1a !important;
        }

        :global(.light) .ai-status {
          color: #4b5563 !important;
        }

        :global(.light) .submit-btn {
          color: #ffffff !important;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.22) !important;
        }
        
        :global(.light) .submit-btn:hover {
          box-shadow: 0 15px 30px rgba(16, 185, 129, 0.3) !important;
        }
      `}</style>

      <main className="contact-container">
        
        {/* Premium Ambient Spotlight Layer */}
        <div className="ambient-spotlight"></div>

        {/* UI Card */}
        <div className="contact-card">
          <div className="contact-header">
            <h2>Get in touch with us</h2>
            <p>Have a question about Nexora OS or BITHM? <br />We&apos;d love to hear from you.</p>
          </div>
          
          <form id="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="input-name">Name</label>
              <input type="text" className="form-control" placeholder="Your full name" id="input-name" />
            </div>
            <div className="form-group">
              <label htmlFor="input-email">Email</label>
              <input type="email" className="form-control" placeholder="your@email.com" id="input-email" />
            </div>
            <div className="form-group">
              <label htmlFor="message-input">Message</label>
              <textarea id="message-input" className="form-control" placeholder="How can we help you? Ask about the platform, enrollment, features..."></textarea>
            </div>
            <button 
              type="button" 
              className="submit-btn" 
              id="submit-btn"
              onClick={handleFormSubmit}
              disabled={submitBtnDisabled}
              style={submitBtnBg ? { background: submitBtnBg } : undefined}
            >
              {submitBtnText}
            </button>
          </form>
        </div>

        {/* Mascot SVG Structure */}
        <div className="mascot-container" id="mascot-container">
          <svg className="mascot-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bamboo-grad" x1="0%" y1="0%" x2="20%" y2="100%">
                <stop offset="0%" stopColor="#345e3c" />
                <stop offset="40%" stopColor="#4c8257" />
                <stop offset="60%" stopColor="#5a9667" />
                <stop offset="100%" stopColor="#24452a" />
              </linearGradient>
              <linearGradient id="leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <radialGradient id="fur-white-head" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="65%" stopColor="#f4f6fa" />
                <stop offset="90%" stopColor="#dce1ee" />
                <stop offset="100%" stopColor="#c4cbe0" />
              </radialGradient>
              <radialGradient id="fur-white-body" cx="40%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="75%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </radialGradient>
              <radialGradient id="fur-black" cx="30%" cy="30%" r="80%">
                <stop offset="0%" stopColor="#474a56" />
                <stop offset="35%" stopColor="#262831" />
                <stop offset="85%" stopColor="#13141a" />
                <stop offset="100%" stopColor="#090a0d" />
              </radialGradient>
              <radialGradient id="fur-black-limb" cx="45%" cy="25%" r="80%">
                <stop offset="0%" stopColor="#3b3e4a" />
                <stop offset="50%" stopColor="#1d1e26" />
                <stop offset="100%" stopColor="#0b0c10" />
              </radialGradient>
              <radialGradient id="eye-white" cx="40%" cy="40%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#f1f3f8" />
                <stop offset="100%" stopColor="#b0b5c4" />
              </radialGradient>
              <radialGradient id="iris-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c27a3e" />
                <stop offset="60%" stopColor="#7a4216" />
                <stop offset="100%" stopColor="#361a05" />
              </radialGradient>
              <radialGradient id="snout-grad" cx="45%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="80%" stopColor="#eaedf4" />
                <stop offset="100%" stopColor="#d0d5e3" />
              </radialGradient>
              <radialGradient id="paw-pad" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#696c7a" />
                <stop offset="100%" stopColor="#2a2c36" />
              </radialGradient>
              <filter id="shadow-soft" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.3"/>
              </filter>
              <filter id="shadow-hard" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="-2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
              </filter>
              <filter id="inner-glow">
                <feComponentTransfer in="SourceAlpha"><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feOffset dx="-3" dy="-3"/>
                <feComposite operator="out" in2="SourceAlpha"/>
                <feComposite operator="in" in2="SourceGraphic"/>
                <feBlend mode="screen" in2="SourceGraphic" result="blend"/>
              </filter>
            </defs>

            <g id="bamboo-leaves-bg" fill="url(#leaf-grad)" opacity="0.75" filter="url(#shadow-soft)">
              <path d="M 470 40 Q 430 10 405 55 Q 450 75 470 40" />
              <path d="M 320 100 Q 270 60 260 120 Q 310 140 320 100" />
            </g>

            <g id="bamboo-branch" filter="url(#shadow-soft)">
              <g id="bamboo-branch-idle">
                <path d="M 100 290 C 230 230, 390 120, 520 10" fill="none" stroke="url(#bamboo-grad)" strokeWidth="28" strokeLinecap="round" />
                <g fill="#4ade80" opacity="0.45">
                  <path d="M 412 82 Q 420 75 430 88 Q 420 95 412 82" transform="rotate(-32 421 85)"/>
                  <path d="M 288 152 Q 296 145 306 158 Q 296 165 288 152" transform="rotate(-26 297 155)"/>
                  <path d="M 166 226 Q 174 219 184 232 Q 174 239 166 226" transform="rotate(-21 175 229)"/>
                </g>
              </g>
            </g>

            <g id="panda-character">
              <g id="panda-fall-wrapper">
                <g id="arm-hanging">
                  <g id="arm-hanging-idle">
                    <path d="M 330 250 C 375 180, 400 130, 365 100 C 345 85, 320 115, 310 140 C 300 170, 305 210, 295 250 Z" fill="url(#fur-black-limb)" />
                    <g filter="url(#shadow-hard)">
                      <path d="M 368 102 C 360 85, 335 100, 345 120 Z" fill="url(#fur-black)"/>
                      <path d="M 356 98 C 348 81, 323 96, 333 116 Z" fill="url(#fur-black)"/>
                      <path d="M 344 95 C 336 78, 311 93, 321 113 Z" fill="url(#fur-black)"/>
                    </g>
                  </g>
                </g>

                <g id="leg-right">
                  <path id="leg-right-path" d="M 365 350 C 400 375, 410 420, 380 445 C 350 470, 325 425, 335 375 Z" fill="url(#fur-black-limb)"/>
                </g>

                <g id="panda-body" filter="url(#inner-glow)">
                  <g id="panda-body-idle">
                    <ellipse cx="325" cy="305" rx="85" ry="105" fill="url(#fur-white-body)" transform="rotate(-12 325 305)" filter="url(#shadow-soft)" />
                  </g>
                </g>

                <g id="leg-left" filter="url(#shadow-soft)">
                  <path d="M 275 365 C 245 410, 250 455, 280 475 C 310 495, 335 440, 320 380 Z" fill="url(#fur-black-limb)"/>
                  <g id="paw-pads-left" transform="rotate(-20 285 455)">
                    <ellipse cx="290" cy="455" rx="16" ry="11" fill="url(#paw-pad)" />
                    <circle cx="272" cy="440" r="4.5" fill="url(#paw-pad)" />
                    <circle cx="288" cy="435" r="4.5" fill="url(#paw-pad)" />
                    <circle cx="304" cy="438" r="4.5" fill="url(#paw-pad)" />
                  </g>
                </g>

                <g id="arm-free" filter="url(#shadow-soft)">
                  <g id="arm-free-idle">
                    <path d="M 260 270 C 215 305, 220 365, 235 390 C 255 415, 280 375, 285 315 Z" fill="url(#fur-black-limb)"/>
                  </g>
                </g>

                <g id="panda-head" filter="url(#shadow-soft)">
                  <g id="panda-head-idle">
                    <circle id="ear-left" cx="220" cy="160" r="35" fill="url(#fur-black)" filter="url(#shadow-soft)"/>
                    <circle id="ear-right" cx="380" cy="135" r="34" fill="url(#fur-black)" filter="url(#shadow-soft)"/>
                    <ellipse id="head-base" cx="300" cy="220" rx="105" ry="90" fill="url(#fur-white-head)" transform="rotate(-6 300 220)" filter="url(#inner-glow)"/>

                    <g id="eye-left-group">
                      <ellipse cx="250" cy="215" rx="24" ry="36" fill="url(#fur-black)" transform="rotate(28 250 215)"/>
                      <g id="eye-left-inner">
                        <ellipse cx="254" cy="212" rx="13" ry="18" fill="url(#eye-white)" transform="rotate(12 254 212)"/>
                        <g className="pupils" id="pupil-left">
                          <g id="pupil-left-idle">
                            <circle cx="257" cy="212" r="8.5" fill="url(#iris-grad)" />
                            <circle cx="257" cy="212" r="5" fill="#050608" />
                            <circle cx="253" cy="208" r="3" fill="#ffffff" opacity="0.95" />
                            <circle cx="261" cy="215" r="1.5" fill="#ffffff" opacity="0.6" />
                          </g>
                        </g>
                      </g>
                    </g>

                    <g id="eye-right-group">
                      <ellipse cx="338" cy="202" rx="24" ry="36" fill="url(#fur-black)" transform="rotate(-28 338 202)"/>
                      <g id="eye-right-inner">
                        <ellipse cx="334" cy="199" rx="13" ry="18" fill="url(#eye-white)" transform="rotate(-12 334 199)"/>
                        <g className="pupils" id="pupil-right">
                          <g id="pupil-right-idle">
                            <circle cx="331" cy="199" r="8.5" fill="url(#iris-grad)" />
                            <circle cx="331" cy="199" r="5" fill="#050608" />
                            <circle cx="327" cy="195" r="3" fill="#ffffff" opacity="0.95" />
                            <circle cx="335" cy="202" r="1.5" fill="#ffffff" opacity="0.6" />
                          </g>
                        </g>
                      </g>
                    </g>
                    
                    <g id="spiral-eyes" opacity="0">
                      <path className="spiral-path" id="spiral-l" d="M 257 212 m 0,0.5 a 0.5,0.5 0 0,0 1,0 a 1.5,1.5 0 0,0 -3,0 a 2.5,2.5 0 0,0 5,0 a 3.5,3.5 0 0,0 -7,0 a 4.5,4.5 0 0,0 9,0 a 5.5,5.5 0 0,0 -11,0 a 6.5,6.5 0 0,0 13,0" fill="none" stroke="#7a4216" strokeWidth="1.8" strokeLinecap="round" />
                      <path className="spiral-path" id="spiral-r" d="M 331 199 m 0,0.5 a 0.5,0.5 0 0,0 1,0 a 1.5,1.5 0 0,0 -3,0 a 2.5,2.5 0 0,0 5,0 a 3.5,3.5 0 0,0 -7,0 a 4.5,4.5 0 0,0 9,0 a 5.5,5.5 0 0,0 -11,0 a 6.5,6.5 0 0,0 13,0" fill="none" stroke="#7a4216" strokeWidth="1.8" strokeLinecap="round" />
                    </g>

                    <g id="snout-group">
                      <ellipse cx="292" cy="252" rx="32" ry="24" fill="url(#snout-grad)" filter="url(#shadow-hard)" opacity="0.98"/>
                      <path d="M 283 243 Q 292 237 301 243 Q 304 249 292 254 Q 280 249 283 243 Z" fill="#13141a" />
                      <ellipse cx="289" cy="242" rx="4" ry="2" fill="#ffffff" opacity="0.4" transform="rotate(-12 289 242)"/>
                      
                      <path id="mouth-line" d="M 278 260 Q 292 272 306 256" fill="none" stroke="#262831" strokeWidth="2.5" strokeLinecap="round"/>
                      <path id="mouth-yawn" d="M 285 258 Q 292 278 299 258 Q 292 270 285 258 Z" fill="#13141a" opacity="0" />
                      <path id="mouth-smile" d="M 276 256 Q 292 272 308 252" fill="none" stroke="#262831" strokeWidth="2.5" strokeLinecap="round" opacity="0" />
                      <path id="mouth-annoyed" d="M 283 262 L 301 259" fill="none" stroke="#262831" strokeWidth="2.5" strokeLinecap="round" opacity="0" />
                    </g>
                  </g>
                </g>
                
                <g id="hitboxes">
                  <circle id="hit-belly" cx="325" cy="305" r="70" fill="transparent" className="interactive-zone"/>
                  <circle id="hit-nose" cx="292" cy="252" r="25" fill="transparent" className="interactive-zone"/>
                </g>
              </g>
            </g>

            <g id="bamboo-leaves-fg" fill="url(#leaf-grad)" filter="url(#shadow-soft)">
              <path d="M 375 110 Q 395 145 425 135 Q 400 95 375 110" />
              <path d="M 140 230 Q 95 240 75 285 Q 120 265 140 230" />
            </g>

            <g id="zzz-layer"></g>
            <g id="stars-layer"></g>
            <g id="leaves-layer"></g>
            <g id="dust-layer"></g>
          </svg>
        </div>
      </main>
    </section>
  );
}
