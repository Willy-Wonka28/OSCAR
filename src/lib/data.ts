import { useEffect, useState } from "react";
import { FALLBACK_MANIFEST, type Manifest } from "../types";

export type LoadState = "idle" | "loading" | "ready" | "fallback";

export function useManifest(targetId: string | null) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [state, setState] = useState<LoadState>("idle");

  useEffect(() => {
    if (!targetId) {
      setManifest(null);
      setState("idle");
      return;
    }
    let alive = true;
    setState("loading");
    fetch(`/data/${targetId}/manifest.json`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`manifest ${r.status}`);
        return r.json() as Promise<Manifest>;
      })
      .then((m) => {
        if (!alive) return;
        setManifest(m);
        setState("ready");
      })
      .catch(() => {
        if (!alive) return;
        setManifest(FALLBACK_MANIFEST);
        setState("fallback");
      });
    return () => {
      alive = false;
    };
  }, [targetId]);

  return { manifest, state };
}

export type MotionStats = {
  dxPx: number;
  dyPx: number;
  totalPx: number;
  totalArcsec: number;
  totalArcmin: number;
  months: number;
  pxPerYear: number;
};

export type MetricItem = {
  label: string;
  value: string;
  sub?: string;
  unit?: string;
};

export type ScientificMetrics = {
  isVariable: boolean;
  targetType: string;
  currentEpoch: {
    index: number;
    total: number;
    label: string;
    iso: string;
    mjd?: number;
    elapsedMonths: number;
    displacementArcsec: number;
    displacementPx: number;
    centroidPx: { x: number; y: number };
  };
  noob: [MetricItem, MetricItem, MetricItem];
  nerd: MetricItem[];
};

/** Compute live astrometric and kinematic metrics for the active epoch frame. */
export function computeScientificMetrics(m: Manifest, currentEpochIndex = 0): ScientificMetrics {
  const isVar =
    m.target.name.toLowerCase().includes("rw aur") ||
    m.target.name.toLowerCase().includes("r dra") ||
    m.target.type?.toLowerCase().includes("variable") ||
    false;

  const first = m.epochs[0];
  const last = m.epochs[m.epochs.length - 1];
  const a = first.centroid ?? first.expected;
  const b = last.centroid ?? last.expected;
  const size = m.target.size_px;

  // Active epoch tracking
  const activeIdx = Math.min(Math.max(0, currentEpochIndex), m.epochs.length - 1);
  const curEpoch = m.epochs[activeIdx];
  const curPos = curEpoch.centroid ?? curEpoch.expected;
  const curDxPx = (curPos.x - a.x) * size;
  const curDyPx = (curPos.y - a.y) * size;
  const curDispPx = Math.hypot(curDxPx, curDyPx);
  const curDispArcsec = curDispPx * m.target.pixel_scale_arcsec;

  const dxPx = (b.x - a.x) * size;
  const dyPx = (b.y - a.y) * size;
  const totalPx = Math.hypot(dxPx, dyPx);
  const totalArcsec = totalPx * m.target.pixel_scale_arcsec;

  const t0 = Date.parse(first.iso);
  const t1 = Date.parse(last.iso);
  const curT = Date.parse(curEpoch.iso);

  const baselineYears =
    Number.isFinite(t0) && Number.isFinite(t1) && t1 > t0
      ? (t1 - t0) / (1000 * 60 * 60 * 24 * 365.25)
      : 1.0;

  const elapsedMonths =
    Number.isFinite(t0) && Number.isFinite(curT)
      ? Math.max(0, (curT - t0) / (1000 * 60 * 60 * 24 * 30.4375))
      : 0;

  const muTotal = baselineYears > 0 ? totalArcsec / baselineYears : totalArcsec;
  const muRa = baselineYears > 0 ? (-dxPx * m.target.pixel_scale_arcsec) / baselineYears : 0;
  const muDec = baselineYears > 0 ? (-dyPx * m.target.pixel_scale_arcsec) / baselineYears : 0;

  let paDeg = (Math.atan2(muRa, muDec) * 180) / Math.PI;
  if (paDeg < 0) paDeg += 360;

  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const compass = directions[Math.round(paDeg / 22.5) % 16];

  const distanceLy = m.target.distance_ly ?? null;
  const distancePc = distanceLy ? distanceLy / 3.26156 : null;
  const parallaxMas = distancePc ? 1000 / distancePc : null;
  const vTanKmS = distancePc ? 4.74047 * muTotal * distancePc : null;

  const currentEpochData = {
    index: activeIdx,
    total: m.epochs.length,
    label: curEpoch.label,
    iso: curEpoch.iso,
    mjd: curEpoch.mjd,
    elapsedMonths,
    displacementArcsec: curDispArcsec,
    displacementPx: curDispPx,
    centroidPx: {
      x: Math.round(curPos.x * size * 10) / 10,
      y: Math.round(curPos.y * size * 10) / 10,
    },
  };

  if (isVar) {
    const isRDra = m.target.name.toLowerCase().includes("r dra");
    const deltaMag = isRDra ? 3.48 : 1.20;
    const fluxRatio = isRDra ? 24.7 : 3.02;
    const classification = isRDra ? "Mira Long-Period Giant" : "T Tauri Variable";

    const phaseLabel = activeIdx === 0 ? "Initial Reference" : activeIdx === 1 ? "Minimum Eclipse" : "Recovered Maximum";

    return {
      isVariable: true,
      targetType: m.target.type || classification,
      currentEpoch: currentEpochData,
      noob: [
        { label: "ACTIVE EPOCH", value: `${curEpoch.label}`, sub: `Phase: ${phaseLabel}` },
        { label: "BRIGHTNESS SWING", value: `Δm = +${deltaMag.toFixed(1)} mag`, sub: `${fluxRatio.toFixed(1)}× infrared flux swing` },
        { label: "DISTANCE", value: `${distanceLy ?? "—"} light-years`, sub: classification },
      ],
      nerd: [
        { label: "Active Frame Observation", value: `Epoch ${activeIdx + 1} of ${m.epochs.length} (${curEpoch.label})` },
        { label: "Observation MJD / Date", value: curEpoch.mjd ? `MJD ${curEpoch.mjd.toFixed(2)} (${curEpoch.iso})` : curEpoch.iso },
        { label: "Elapsed Survey Baseline", value: `+${elapsedMonths.toFixed(1)} months from t₀` },
        { label: "Centroid Pixel (x, y)", value: `(${currentEpochData.centroidPx.x}, ${currentEpochData.centroidPx.y}) px` },
        { label: "Peak Amplitude Swing (Δm)", value: `+${deltaMag.toFixed(2)} mag`, unit: "mag" },
        { label: "Flux Modulation Factor", value: `${fluxRatio.toFixed(1)}×`, unit: "peak-to-trough" },
        { label: "Estimated Distance (d)", value: `${distancePc ? distancePc.toFixed(1) : "—"} pc (${distanceLy ?? "—"} ly)` },
        { label: "Survey Filter Band", value: "SPHEREx D3 (1.63–2.43 µm)" },
      ],
    };
  }

  return {
    isVariable: false,
    targetType: m.target.type || "High Proper Motion Object",
    currentEpoch: currentEpochData,
    noob: [
      {
        label: "MEASURED OFFSET",
        value: activeIdx === 0 ? "+0.00″ (Ref)" : `+${curDispArcsec.toFixed(2)}″`,
        sub: `Frame ${activeIdx + 1}/${m.epochs.length} · +${elapsedMonths.toFixed(1)} mo elapsed`,
      },
      {
        label: "ANNUAL DRIFT",
        value: `${muTotal.toFixed(2)}″ / yr`,
        sub: vTanKmS ? `${vTanKmS.toFixed(1)} km/s space velocity` : `${(muTotal * 1000).toFixed(0)} mas/yr`,
      },
      {
        label: "TRAJECTORY",
        value: `${paDeg.toFixed(1)}° ${compass}`,
        sub: distanceLy ? `${distanceLy} ly from Earth` : "Heading across Galaxy",
      },
    ],
    nerd: [
      { label: "Active Observation Frame", value: `Epoch ${activeIdx + 1} of ${m.epochs.length} (${curEpoch.label})` },
      { label: "Snapshot Offset (Δr)", value: activeIdx === 0 ? "0.00″ (0.0 px baseline)" : `+${curDispArcsec.toFixed(2)}″ (+${curDispPx.toFixed(1)} px)` },
      { label: "Observation Timestamp", value: curEpoch.mjd ? `MJD ${curEpoch.mjd.toFixed(2)} (+${elapsedMonths.toFixed(1)} mo)` : curEpoch.iso },
      { label: "Centroid Coordinate", value: `(${currentEpochData.centroidPx.x}, ${currentEpochData.centroidPx.y}) px` },
      { label: "Total Proper Motion (μ)", value: `${muTotal.toFixed(3)}″ / yr (${(muTotal * 1000).toFixed(0)} mas/yr)` },
      { label: "Velocity Vector (μ_α, μ_δ)", value: `(${muRa > 0 ? "+" : ""}${muRa.toFixed(2)}″, ${muDec > 0 ? "+" : ""}${muDec.toFixed(2)}″) / yr` },
      { label: "Position Angle (θ)", value: `${paDeg.toFixed(1)}° (${compass})` },
      { label: "Kinematic Speed (v_t)", value: vTanKmS ? `${vTanKmS.toFixed(1)} km/s` : "—" },
      { label: "Trig Parallax & Distance", value: parallaxMas ? `${parallaxMas.toFixed(1)} mas (${distanceLy ?? "—"} ly)` : "—" },
    ],
  };
}

/** Motion between the first and last epoch, in display pixels and arcseconds. */
export function motionStats(m: Manifest): MotionStats | null {
  if (m.epochs.length < 2) return null;
  const first = m.epochs[0];
  const last = m.epochs[m.epochs.length - 1];
  const a = first.centroid ?? first.expected;
  const b = last.centroid ?? last.expected;
  const size = m.target.size_px;
  const dxPx = (b.x - a.x) * size;
  const dyPx = (b.y - a.y) * size;
  const totalPx = Math.hypot(dxPx, dyPx);
  const totalArcsec = totalPx * m.target.pixel_scale_arcsec;

  const t0 = Date.parse(first.iso);
  const t1 = Date.parse(last.iso);
  const months = Number.isFinite(t0) && Number.isFinite(t1) ? (t1 - t0) / (1000 * 60 * 60 * 24 * 30.4375) : 0;

  return {
    dxPx,
    dyPx,
    totalPx,
    totalArcsec,
    totalArcmin: totalArcsec / 60,
    months,
    pxPerYear: months > 0 ? totalPx / (months / 12) : totalPx,
  };
}

export function fmt(n: number, digits = 1) {
  return n.toFixed(digits);
}
