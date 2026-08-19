import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../lib/store";

/* ---------------------------- Scramble ---------------------------- */

const CHARS = "01<>/{}[]#$%&*+=?";

export function Scramble({
  text,
  className,
  duration = 850,
  delay = 0,
}: {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const [out, setOut] = useState(reduced ? text : "");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let timeout = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        timeout = window.setTimeout(() => {
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / duration);
            const solved = Math.floor(p * text.length);
            let s = text.slice(0, solved);
            for (let i = solved; i < text.length; i++) {
              s += text[i] === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)];
            }
            setOut(s);
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }, delay);
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [text, duration, delay, reduced]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {out || "\u00A0"}
    </span>
  );
}

/* ----------------------------- Reveal ----------------------------- */

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const style: CSSProperties = delay ? { transitionDelay: `${delay}ms` } : {};
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`reveal ${className ?? ""}`} style={style}>
      {children}
    </Tag>
  );
}

/* ----------------------------- CountUp ----------------------------- */

export function CountUp({ value, className, duration = 900 }: { value: number; className?: string; duration?: number }) {
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(reduced ? value : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (reduced) {
      setN(value);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(Math.round(value * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {n}
    </span>
  );
}

/* ------------------------------- Ring ------------------------------ */

export function Ring({
  value,
  size = 92,
  stroke = 7,
  color = "#3ECF8E",
  track = "rgba(40,64,107,0.45)",
  children,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const id = setTimeout(() => setShown(Math.min(1, Math.max(0, value))), reduced ? 0 : 120);
    return () => clearTimeout(id);
  }, [value, reduced]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="ring-progress -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
