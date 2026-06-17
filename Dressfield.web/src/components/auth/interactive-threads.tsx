"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
}

interface Blob {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  phase: number;
  radius: number;
  baseRadius: number;
  color: string;
}

export function InteractiveThreads() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let blobs: Blob[] = [];
    let hoopAngle = 0;
    const particleCount = 60;
    const connectionDistance = 110;
    const mouseConnectionDistance = 160;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      initBlobs();
    };

    const initParticles = () => {
      particles = [];
      const width = canvas.width;
      const height = canvas.height;

      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 1.5 + 1;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius,
          baseRadius: radius,
        });
      }
    };

    const initBlobs = () => {
      const width = canvas.width;
      const height = canvas.height;
      blobs = [
        {
          baseX: width * 0.3,
          baseY: height * 0.3,
          x: width * 0.3,
          y: height * 0.3,
          speedX: 0.3,
          speedY: 0.22,
          phase: 0,
          radius: Math.min(width, height) * 0.65,
          baseRadius: Math.min(width, height) * 0.65,
          color: "rgba(251, 243, 219, 0.42)", // Champagne glow
        },
        {
          baseX: width * 0.7,
          baseY: height * 0.4,
          x: width * 0.7,
          y: height * 0.4,
          speedX: 0.25,
          speedY: 0.35,
          phase: Math.PI / 3,
          radius: Math.min(width, height) * 0.75,
          baseRadius: Math.min(width, height) * 0.75,
          color: "rgba(238, 244, 255, 0.38)", // Watery blue glow
        },
        {
          baseX: width * 0.5,
          baseY: height * 0.7,
          x: width * 0.5,
          y: height * 0.7,
          speedX: 0.35,
          speedY: 0.25,
          phase: (Math.PI * 2) / 3,
          radius: Math.min(width, height) * 0.6,
          baseRadius: Math.min(width, height) * 0.6,
          color: "rgba(255, 238, 238, 0.35)", // Soft rose/cotton glow
        },
      ];
    };

    // Create offscreen canvas for repeating linen fabric texture pattern
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 120;
    patternCanvas.height = 120;
    const pCtx = patternCanvas.getContext("2d");
    let linenPattern: CanvasPattern | null = null;

    if (pCtx) {
      pCtx.fillStyle = "rgba(255, 255, 255, 0.05)";
      pCtx.fillRect(0, 0, 120, 120);
      
      pCtx.strokeStyle = "rgba(0, 0, 0, 0.012)";
      pCtx.lineWidth = 0.45;

      for (let y = 0; y < 120; y += 4) {
        const jitter = (Math.random() - 0.5) * 0.5;
        pCtx.beginPath();
        pCtx.moveTo(0, y + jitter);
        pCtx.lineTo(120, y + jitter);
        pCtx.stroke();
      }

      for (let x = 0; x < 120; x += 4) {
        const jitter = (Math.random() - 0.5) * 0.5;
        pCtx.beginPath();
        pCtx.moveTo(x + jitter, 0);
        pCtx.lineTo(x + jitter, 120);
        pCtx.stroke();
      }

      pCtx.strokeStyle = "rgba(0, 0, 0, 0.025)";
      pCtx.lineWidth = 0.8;
      for (let i = 0; i < 2; i++) {
        const y = Math.random() * 120;
        pCtx.beginPath();
        pCtx.moveTo(0, y);
        pCtx.lineTo(120, y);
        pCtx.stroke();

        const x = Math.random() * 120;
        pCtx.beginPath();
        pCtx.moveTo(x, 0);
        pCtx.lineTo(x, 120);
        pCtx.stroke();
      }

      linenPattern = ctx.createPattern(patternCanvas, "repeat");
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const mouse = mouseRef.current;

      // 1. Base solid background fill (linen paper)
      ctx.fillStyle = "#faf9f6";
      ctx.fillRect(0, 0, width, height);

      // 2. Render drifting glowing ambient gradients (liquid mesh/watery effect)
      const gradientTime = Date.now() * 0.00055;
      blobs.forEach((b) => {
        // Orbit coordinates in a fluid, circular wave
        b.x = b.baseX + Math.sin(gradientTime * b.speedX + b.phase) * (width * 0.08);
        b.y = b.baseY + Math.cos(gradientTime * b.speedY + b.phase) * (height * 0.08);

        // Pulse the radius slowly like liquid expanding/contracting
        const radiusPulse = b.baseRadius * (1 + Math.sin(gradientTime * 0.65 + b.phase) * 0.08);

        const radial = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radiusPulse);
        radial.addColorStop(0, b.color);
        radial.addColorStop(1, "rgba(250, 249, 246, 0)");
        
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(b.x, b.y, radiusPulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Apply the linen fabric texture overlay
      if (linenPattern) {
        ctx.fillStyle = linenPattern;
        ctx.fillRect(0, 0, width, height);
      }

      // 4. Draw giant background decorative embroidery hoop
      hoopAngle += 0.00015;
      const hoopX = width * 0.26;
      const hoopY = height * 0.45;
      const hoopRadius = Math.min(width, height) * 0.38;

      if (hoopRadius > 100) {
        ctx.save();
        ctx.translate(hoopX, hoopY);
        ctx.rotate(hoopAngle);

        ctx.strokeStyle = "rgba(182, 141, 102, 0.09)";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(0, 0, hoopRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(152, 111, 79, 0.07)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, 0, hoopRadius - 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(0, 0, 0, 0.015)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, hoopRadius + 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(212, 175, 55, 0.16)";
        ctx.fillRect(hoopRadius - 6, -16, 12, 32);

        ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hoopRadius - 10, -6);
        ctx.lineTo(hoopRadius + 10, -6);
        ctx.moveTo(hoopRadius - 10, 0);
        ctx.lineTo(hoopRadius + 10, 0);
        ctx.moveTo(hoopRadius - 10, 6);
        ctx.lineTo(hoopRadius + 10, 6);
        ctx.stroke();

        ctx.restore();
      }

      // 5. Update and draw particles (with water currents wave drift)
      const flowTime = Date.now() * 0.0007;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Dynamic sinusoidal water current drift
        p.x += Math.sin(flowTime + p.y * 0.009) * 0.16;
        p.y += Math.cos(flowTime + p.x * 0.009) * 0.16;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 180) {
            const force = (180 - dist) / 180;
            p.x += (dx / dist) * force * 0.45;
            p.y += (dy / dist) * force * 0.45;
            p.radius = p.baseRadius + force * 1.5;
          } else {
            p.radius = p.radius > p.baseRadius ? p.radius - 0.05 : p.baseRadius;
          }
        } else {
          p.radius = p.radius > p.baseRadius ? p.radius - 0.05 : p.baseRadius;
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6. Draw weaving threads between nodes
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.11;
            ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        if (mouse.active) {
          const dx = mouse.x - p1.x;
          const dy = mouse.y - p1.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouseConnectionDistance) {
            const opacity = (1 - dist / mouseConnectionDistance) * 0.2;
            ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full block pointer-events-none"
    />
  );
}
