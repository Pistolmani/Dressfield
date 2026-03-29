"use client";

import { useEffect, useRef } from "react";

// 0 = needle, 1 = thread segment
type ParticleType = 0 | 1;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  scale: number;
  type: ParticleType;
}

const PARTICLE_LIFE = 60;
const SPAWN_DISTANCE = 10;
const MAX_PARTICLES = 100;

// Violet accent matching the brand
const NEEDLE_COLOR  = "#7C3AED";
const THREAD_COLORS = ["#7C3AED", "#a855f7", "#c4b5fd", "#6d28d9"];

function drawNeedle(ctx: CanvasRenderingContext2D, scale: number) {
  const len  = 22 * scale;
  const eye  = 3  * scale;

  ctx.beginPath();
  // shaft
  ctx.moveTo(-len / 2, 0);
  ctx.lineTo(len / 2 - eye * 1.5, 0);
  // taper to point
  ctx.lineTo(len / 2, 0);
  ctx.strokeStyle = NEEDLE_COLOR;
  ctx.lineWidth   = 1.5 * scale;
  ctx.lineCap     = "round";
  ctx.stroke();

  // eye of the needle (small oval hole near the blunt end)
  ctx.beginPath();
  ctx.ellipse(-len / 2 + eye * 1.2, 0, eye * 0.7, eye * 0.4, 0, 0, Math.PI * 2);
  ctx.strokeStyle = NEEDLE_COLOR;
  ctx.lineWidth   = 1 * scale;
  ctx.stroke();

  // tiny thread through the eye
  ctx.beginPath();
  ctx.moveTo(-len / 2 + eye * 1.2, -eye * 1.5);
  ctx.lineTo(-len / 2 + eye * 0.8, eye * 1.5);
  ctx.strokeStyle = "#a855f7";
  ctx.lineWidth   = 0.8 * scale;
  ctx.stroke();
}

function drawThread(ctx: CanvasRenderingContext2D, scale: number, colorIdx: number) {
  const len  = 14 * scale;
  const amp  = 2.5 * scale;

  ctx.beginPath();
  ctx.moveTo(-len / 2, 0);
  // wavy line
  ctx.bezierCurveTo(
    -len / 4, -amp,
     len / 4,  amp,
     len / 2,  0
  );
  ctx.strokeStyle = THREAD_COLORS[colorIdx % THREAD_COLORS.length];
  ctx.lineWidth   = 1.2 * scale;
  ctx.lineCap     = "round";
  ctx.stroke();
}

export function CursorTrail() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const particles  = useRef<Particle[]>([]);
  const lastPos    = useRef<{ x: number; y: number } | null>(null);
  const rafRef     = useRef<number | null>(null);
  const colorIdx   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function spawnParticle(x: number, y: number, type: ParticleType) {
      if (particles.current.length >= MAX_PARTICLES) particles.current.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2.8;
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.8,
        rotation:      Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        scale: 0.6 + Math.random() * 0.7,
        type,
      });
    }

    function onMouseMove(e: MouseEvent) {
      const { clientX: x, clientY: y } = e;
      if (lastPos.current) {
        const dx = x - lastPos.current.x;
        const dy = y - lastPos.current.y;
        if (Math.hypot(dx, dy) < SPAWN_DISTANCE) return;
      }
      lastPos.current = { x, y };
      colorIdx.current++;

      // Alternate: mostly threads, occasional needle
      const type: ParticleType = Math.random() < 0.3 ? 0 : 1;
      spawnParticle(x, y, type);
      if (Math.random() < 0.5) {
        spawnParticle(
          x + (Math.random() - 0.5) * 10,
          y + (Math.random() - 0.5) * 10,
          1
        );
      }
    }

    function draw() {
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fade = 1 / PARTICLE_LIFE;

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.07; // gravity
        p.rotation += p.rotationSpeed;
        p.alpha -= fade;

        if (p.alpha <= 0) { particles.current.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 0) {
          drawNeedle(ctx, p.scale);
        } else {
          drawThread(ctx, p.scale, i);
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    window.addEventListener("mousemove", onMouseMove);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden="true"
    />
  );
}
