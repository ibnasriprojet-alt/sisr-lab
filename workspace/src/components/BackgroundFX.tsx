import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../lib/store";

/* Fond vivant : nœuds réseau dérivants, liens et paquets lumineux. */

type Node = { x: number; y: number; vx: number; vy: number; hue: string };
type Packet = { a: number; b: number; t: number; speed: number; hue: string };

const HUES = ["86,200,232", "62,207,142", "242,184,75"];

export default function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let raf = 0;
    let lastPacket = 0;
    let running = true;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 22000));
      nodes = Array.from({ length: target }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
      }));
    };

    const LINK = 135;

    const draw = (time: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // liens
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const alpha = (1 - Math.sqrt(d2) / LINK) * 0.13;
            ctx.strokeStyle = `rgba(${a.hue},${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nœuds
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${n.hue},0.5)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // paquets
      if (time - lastPacket > 900 && packets.length < 5) {
        lastPacket = time;
        const a = Math.floor(Math.random() * nodes.length);
        let b = Math.floor(Math.random() * nodes.length);
        if (b !== a)
          packets.push({ a, b, t: 0, speed: 0.008 + Math.random() * 0.01, hue: HUES[Math.floor(Math.random() * 3)] });
      }
      packets = packets.filter((p) => p.t <= 1);
      for (const p of packets) {
        const na = nodes[p.a];
        const nb = nodes[p.b];
        if (!na || !nb) {
          p.t = 2;
          continue;
        }
        p.t += p.speed;
        const x = na.x + (nb.x - na.x) * p.t;
        const y = na.y + (nb.y - na.y) * p.t;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 9);
        grad.addColorStop(0, `rgba(${p.hue},0.85)`);
        grad.addColorStop(1, `rgba(${p.hue},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (time: number) => {
      if (!running) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -10) n.x = w + 10;
        if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10;
        if (n.y > h + 10) n.y = -10;
      }
      draw(time);
      raf = requestAnimationFrame(step);
    };

    resize();
    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(step);
    }

    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(step);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0" aria-hidden="true" />
      <div className="grid-overlay fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />
    </>
  );
}
