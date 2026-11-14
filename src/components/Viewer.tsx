import { useEffect, useMemo, useRef, useState } from "react";
import type { Manifest, ViewMode } from "../types";

type Props = {
  manifest: Manifest;
  index: number;
  viewMode: ViewMode;
  lensOn: boolean;
  lensZoom: number;
  crosshairOn: boolean;
  trailOn: boolean;
};

/** Load every epoch image once; return tinted variants for red/cyan. */
function useFrames(manifest: Manifest) {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    setImages([]);

    const load = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`frame failed: ${src}`));
        img.src = src;
      });

    Promise.all(manifest.epochs.map((e) => load(e.frame_url)))
      .then((imgs) => {
        if (!alive) return;
        setImages(imgs);
        setStatus("ready");
      })
      .catch(() => {
        if (alive) setStatus("error");
      });

    return () => {
      alive = false;
    };
  }, [manifest]);

  return { images, status };
}

function createRedCyanComposite(img1: HTMLImageElement, img2: HTMLImageElement): HTMLCanvasElement {
  const w = img1.naturalWidth || img1.width || 124;
  const h = img1.naturalHeight || img1.height || 124;

  const c1 = document.createElement("canvas");
  c1.width = w;
  c1.height = h;
  const cx1 = c1.getContext("2d");
  if (!cx1) return c1;
  cx1.drawImage(img1, 0, 0);
  const data1 = cx1.getImageData(0, 0, w, h).data;

  const c2 = document.createElement("canvas");
  c2.width = w;
  c2.height = h;
  const cx2 = c2.getContext("2d");
  if (!cx2) return c1;
  cx2.drawImage(img2, 0, 0);
  const data2 = cx2.getImageData(0, 0, w, h).data;

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const cxOut = out.getContext("2d");
  if (!cxOut) return out;
  const outImg = cxOut.createImageData(w, h);
  const outData = outImg.data;

  // Background noise floor subtraction
  let sum1 = 0;
  let sum2 = 0;
  const n = data1.length / 4;
  for (let i = 0; i < data1.length; i += 4) {
    sum1 += data1[i];
    sum2 += data2[i];
  }
  const floor1 = (sum1 / n) * 0.92;
  const floor2 = (sum2 / n) * 0.92;

  for (let i = 0; i < data1.length; i += 4) {
    const s1 = Math.max(0, data1[i] - floor1) / (255 - floor1);
    const s2 = Math.max(0, data2[i] - floor2) / (255 - floor2);

    const common = Math.min(s1, s2);
    const diff1 = Math.max(0, s1 - s2);
    const diff2 = Math.max(0, s2 - s1);

    // Static stars: subtle muted silver-white
    let r = common * 125;
    let g = common * 130;
    let b = common * 145;

    // Epoch 0 unique motion/flux: luminous neon CRIMSON RED
    r += Math.min(255, diff1 * 360);
    g += Math.min(255, diff1 * 15);
    b += Math.min(255, diff1 * 25);

    // Epoch 2 unique motion/flux: luminous neon ELECTRIC CYAN
    r += Math.min(255, diff2 * 10);
    g += Math.min(255, diff2 * 270);
    b += Math.min(255, diff2 * 340);

    outData[i] = Math.min(255, Math.max(0, Math.round(r)));
    outData[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    outData[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
    outData[i + 3] = 255;
  }

  cxOut.putImageData(outImg, 0, 0);
  return out;
}

function ring(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  dash: number[] = [],
  width = 1.2,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export default function Viewer({
  manifest,
  index,
  viewMode,
  lensOn,
  lensZoom,
  crosshairOn,
  trailOn,
}: Props) {
  const mainRef = useRef<HTMLCanvasElement | null>(null);
  const lensRef = useRef<HTMLCanvasElement | null>(null);
  const { images, status } = useFrames(manifest);
  const size = manifest.target.size_px;

  const centroids = useMemo(
    () => manifest.epochs.map((e) => e.centroid ?? e.expected),
    [manifest],
  );

  const redCyanCanvas = useMemo(() => {
    if (images.length < 2) return null;
    return createRedCyanComposite(images[0], images[images.length - 1]);
  }, [images]);

  // ---- main canvas ----
  useEffect(() => {
    const canvas = mainRef.current;
    if (!canvas || !images.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const css = canvas.clientWidth;
      if (!css) return;
      if (canvas.width !== Math.round(css * dpr)) {
        canvas.width = Math.round(css * dpr);
        canvas.height = Math.round(css * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, css, css);

      // deep sky base
      ctx.fillStyle = "#010204";
      ctx.fillRect(0, 0, css, css);

      ctx.imageSmoothingEnabled = false;

      if (viewMode === "redcyan" && redCyanCanvas) {
        ctx.drawImage(redCyanCanvas, 0, 0, css, css);
      } else {
        const img = images[Math.min(index, images.length - 1)];
        if (img) ctx.drawImage(img, 0, 0, css, css);
      }

      // vignette to settle the edges
      const vg = ctx.createRadialGradient(css / 2, css / 2, css * 0.3, css / 2, css / 2, css * 0.72);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.42)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, css, css);

      const pts = centroids.map((c) => ({ x: c.x * css, y: c.y * css }));

      if (viewMode !== "redcyan" && trailOn && pts.length > 1) {
        const last = pts[pts.length - 1];
        const first = pts[0];
        ctx.save();
        ctx.strokeStyle = "rgba(159, 224, 255, 0.42)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(159, 224, 255, 0.65)";
        for (const p of pts.slice(0, -1)) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        // arrow head at the newest position
        const prev = pts[pts.length - 2];
        const ang = Math.atan2(last.y - prev.y, last.x - prev.x);
        const head = 7;
        ctx.fillStyle = "rgba(159, 224, 255, 0.8)";
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(last.x - head * Math.cos(ang - 0.4), last.y - head * Math.sin(ang - 0.4));
        ctx.lineTo(last.x - head * Math.cos(ang + 0.4), last.y - head * Math.sin(ang + 0.4));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      if (crosshairOn) {
        const p = pts[Math.min(index, pts.length - 1)];
        const r = Math.max(11, css * 0.042);
        ring(ctx, p.x, p.y, r, "rgba(255, 255, 255, 0.95)", [4, 4], 1.2);
        ring(ctx, p.x, p.y, r + 4, "rgba(255, 255, 255, 0.25)", [], 1);
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 1;
        const t = 4;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          ctx.beginPath();
          ctx.moveTo(p.x + dx * (r + 2), p.y + dy * (r + 2));
          ctx.lineTo(p.x + dx * (r + 2 + t), p.y + dy * (r + 2 + t));
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [images, redCyanCanvas, index, viewMode, crosshairOn, trailOn, centroids]);

  // ---- lens canvas ----
  useEffect(() => {
    const canvas = lensRef.current;
    if (!canvas || !lensOn || images.length < 1) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const css = canvas.clientWidth;
      if (!css) return;
      canvas.width = Math.round(css * dpr);
      canvas.height = Math.round(css * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#010204";
      ctx.fillRect(0, 0, css, css);

      const pts = centroids.map((c) => ({ x: c.x * size, y: c.y * size }));
      const mid = {
        x: (pts[0].x + pts[pts.length - 1].x) / 2,
        y: (pts[0].y + pts[pts.length - 1].y) / 2,
      };
      const span = Math.max(5, Math.min(size, size / lensZoom));
      const sx = Math.max(0, Math.min(size - span, mid.x - span / 2));
      const sy = Math.max(0, Math.min(size - span, mid.y - span / 2));

      ctx.imageSmoothingEnabled = false;

      if (viewMode === "redcyan" && redCyanCanvas) {
        ctx.drawImage(redCyanCanvas, sx, sy, span, span, 0, 0, css, css);
      } else {
        // ghost all epochs faintly, draw the live one on top
        for (let i = 0; i < images.length; i++) {
          if (i === index) continue;
          ctx.globalAlpha = 0.16;
          ctx.drawImage(images[i], sx, sy, span, span, 0, 0, css, css);
        }
        ctx.globalAlpha = 1;
        const cur = images[Math.min(index, images.length - 1)];
        if (cur) ctx.drawImage(cur, sx, sy, span, span, 0, 0, css, css);
      }

      // trail in lens space
      const lx = (x: number) => ((x - sx) / span) * css;
      const ly = (y: number) => ((y - sy) / span) * css;
      if (trailOn) {
        ctx.strokeStyle = "rgba(159, 224, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(lx(p.x), ly(p.y)) : ctx.moveTo(lx(p.x), ly(p.y))));
        ctx.stroke();
        ctx.setLineDash([]);
        pts.forEach((p, i) => {
          ctx.beginPath();
          ctx.fillStyle = i === index ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.4)";
          ctx.arc(lx(p.x), ly(p.y), i === index ? 3 : 1.8, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (crosshairOn) {
        // Fixed ring marks the first epoch; the star drifts away from it.
        const a = pts[0];
        ring(ctx, lx(a.x), ly(a.y), css * 0.17, "rgba(255, 255, 255, 0.4)", [3, 4], 1);
        const p = pts[Math.min(index, pts.length - 1)];
        ring(ctx, lx(p.x), ly(p.y), css * 0.09, "rgba(255, 255, 255, 0.9)", [], 1.2);
      }

      // centre reticle
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(css / 2, 0);
      ctx.lineTo(css / 2, css);
      ctx.moveTo(0, css / 2);
      ctx.lineTo(css, css / 2);
      ctx.stroke();
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [images, redCyanCanvas, index, viewMode, lensOn, lensZoom, crosshairOn, trailOn, centroids, size]);

  const epoch = manifest.epochs[Math.min(index, manifest.epochs.length - 1)];
  const current = centroids[Math.min(index, centroids.length - 1)];
  const deltaPx = current && centroids[0]
    ? Math.hypot((current.x - centroids[0].x) * size, (current.y - centroids[0].y) * size)
    : 0;

  return (
    <div className="canvas-wrap" data-view={viewMode}>
      {/* Precision Instrument Calibration Dial Ring */}
      <div className="instrument-dial" aria-hidden="true">
        <span className="dial-mark dial-mark--n">000° N</span>
        <span className="dial-mark dial-mark--e">090° E</span>
        <span className="dial-mark dial-mark--s">180° S</span>
        <span className="dial-mark dial-mark--w">270° W</span>
        <span className="dial-ring dial-ring--outer" />
        <span className="dial-ring dial-ring--inner" />
      </div>

      {status === "error" && (
        <div className="stage__hint" style={{ bottom: "50%", transform: "translate(-50%, 50%)" }}>
          Frames unavailable — check /public/data
        </div>
      )}
      <canvas ref={mainRef} className="stage-canvas" aria-label="SPHEREx image of the target field" />
      <div className="frame-readout">
        {viewMode === "redcyan" ? (
          <>
            <b style={{ color: "#ff4d5e" }}>🔴 {manifest.epochs[0]?.label ?? "Epoch 1"}</b>
            <span style={{ color: "#2de2e6", marginLeft: 8 }}>🔵 {manifest.epochs[manifest.epochs.length - 1]?.label ?? "Epoch 3"}</span>
          </>
        ) : (
          <>
            <b>{epoch?.label ?? "—"}</b>
            <span>{epoch?.iso ?? ""}</span>
          </>
        )}
      </div>
      {lensOn && (
        <div className="lens">
          <div className="lens__head">
            <span>Motion lens</span>
            <span className="lens__zoom">{lensZoom}×</span>
          </div>
          <canvas ref={lensRef} className="lens__canvas" aria-label="Magnified view of the moving object" />
          <div className="lens__foot">
            <span>Δ since first frame</span>
            <b>{deltaPx.toFixed(1)} px</b>
          </div>
        </div>
      )}
    </div>
  );
}
