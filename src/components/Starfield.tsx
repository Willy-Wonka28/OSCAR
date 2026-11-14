import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;
  r: number;
  phase: number;
  hue: number;
  speed: number;
};

/**
 * Slow drift + twinkle starfield. Depth (z) drives size, brightness and
 * parallax so the background reads as space rather than wallpaper.
 */
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars: Star[] = [];
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const seed = () => {
      const count = Math.round((w * h) / 5200);
      stars = Array.from({ length: Math.min(620, Math.max(140, count)) }, () => {
        const z = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: 0.35 + z * 1.35,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random(),
          speed: 0.008 + z * 0.022,
        };
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / w - 0.5) * 18;
      pointer.ty = (e.clientY / h - 0.5) * 18;
    };

    let t = 0;
    const draw = () => {
      t += 0.016;
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        if (!reduced) {
          s.y += s.speed * 0.35;
          if (s.y > h + 4) s.y = -4;
        }
        const twinkle = 0.55 + 0.45 * Math.sin(t * (0.5 + s.z) + s.phase);
        const alpha = (0.12 + s.z * 0.62) * twinkle;
        const px = s.x + pointer.x * s.z;
        const py = s.y + pointer.y * s.z;

        const tint =
          s.hue > 0.82
            ? "184, 214, 255"
            : s.hue > 0.55
              ? "236, 244, 255"
              : "255, 248, 236";

        if (s.z > 0.8) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${tint}, ${alpha * 0.12})`;
          ctx.arc(px, py, s.r * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${tint}, ${alpha})`;
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
