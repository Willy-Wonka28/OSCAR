import type { Manifest, ViewMode } from "../types";
import { computeScientificMetrics } from "../lib/data";
import { IconClose, IconLink, IconReset } from "./Icons";

type Props = {
  manifest: Manifest;
  index: number;
  viewMode: ViewMode;
  onViewMode: (v: ViewMode) => void;
  fps: number;
  onFps: (n: number) => void;
  lensOn: boolean;
  onLens: (b: boolean) => void;
  lensZoom: number;
  onLensZoom: (n: number) => void;
  crosshairOn: boolean;
  onCrosshair: (b: boolean) => void;
  trailOn: boolean;
  onTrail: (b: boolean) => void;
  onCopy: () => void;
  copied: boolean;
  onReset: () => void;
  onClose: () => void;
};

function Toggle({ on, onChange }: { on: boolean; onChange: (b: boolean) => void }) {
  return (
    <button className="toggle" data-on={on} onClick={() => onChange(!on)} aria-pressed={on}>
      <span className="sr-only">{on ? "On" : "Off"}</span>
    </button>
  );
}

export default function Sidebar({
  manifest,
  index,
  viewMode,
  onViewMode,
  fps,
  onFps,
  lensOn,
  onLens,
  lensZoom,
  onLensZoom,
  crosshairOn,
  onCrosshair,
  trailOn,
  onTrail,
  onCopy,
  copied,
  onReset,
  onClose,
}: Props) {
  const sci = computeScientificMetrics(manifest, index);

  return (
    <aside className="sidebar" aria-label="Nerd mode controls">
      <div className="sidebar__inner">
        <div className="sidebar__head">
          <h3>Controls</h3>
          <div className="sidebar__head-actions">
            <button
              className="sidebar__icon"
              onClick={onCopy}
              aria-label={copied ? "Link copied" : "Copy share link"}
              title={copied ? "Link copied" : "Copy share link"}
              data-copied={copied}
            >
              <IconLink size={15} />
            </button>
            <button
              className="sidebar__icon"
              onClick={onReset}
              aria-label="Reset view"
              title="Reset view"
            >
              <IconReset size={15} />
            </button>
            <button className="sidebar__close" onClick={onClose} aria-label="Close controls">
              <IconClose />
            </button>
          </div>
        </div>

        <div className="field">
          <div className="field__label">
            <span>View</span>
          </div>
          <div className="segmented">
            <button data-active={viewMode === "blink"} onClick={() => onViewMode("blink")}>
              Blink
            </button>
            <button data-active={viewMode === "redcyan"} onClick={() => onViewMode("redcyan")}>
              Red / Cyan
            </button>
          </div>
        </div>

        <div className="field">
          <div className="field__label">
            <span>Playback</span>
            <b>{fps} fps</b>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={fps}
            onChange={(e) => onFps(Number(e.target.value))}
            aria-label="Playback speed"
          />
        </div>

        <div className="field">
          <div className="field__label">
            <span>Motion lens</span>
            <b>{lensZoom}×</b>
          </div>
          <div className="toggle-row">
            <span>Magnify the mover</span>
            <Toggle on={lensOn} onChange={onLens} />
          </div>
          <input
            type="range"
            min={3}
            max={12}
            step={1}
            value={lensZoom}
            onChange={(e) => onLensZoom(Number(e.target.value))}
            aria-label="Lens magnification"
            disabled={!lensOn}
          />
        </div>

        <div className="field">
          <div className="field__label">
            <span>Overlays</span>
          </div>
          <div className="toggle-row">
            <span>Position crosshair</span>
            <Toggle on={crosshairOn} onChange={onCrosshair} />
          </div>
          <div className="toggle-row">
            <span>Motion trail</span>
            <Toggle on={trailOn} onChange={onTrail} />
          </div>
        </div>

        <div className="field">
          <div className="field__label">
            <span>Astrometry & Metrics</span>
            <b style={{ color: "var(--cyan)", fontSize: "11px" }}>8 Scientific Readouts</b>
          </div>
          <div className="readout">
            {sci.nerd.map((item, idx) => (
              <div className="readout__row" key={idx}>
                <span>{item.label}</span>
                <b>{item.value}</b>
              </div>
            ))}
          </div>
        </div>

        <div className="field">
          <div className="field__label">
            <span>Instrument Parameters</span>
          </div>
          <div className="readout">
            <div className="readout__row">
              <span>Survey Band</span>
              <b>D3 (1.63–2.43 µm)</b>
            </div>
            <div className="readout__row">
              <span>Pixel Scale</span>
              <b>{manifest.target.pixel_scale_arcsec.toFixed(2)}″/px ({manifest.target.size_px}² grid)</b>
            </div>
            <div className="readout__row">
              <span>Field of View</span>
              <b>{manifest.target.fov_arcmin.toFixed(1)}′ cutout</b>
            </div>
          </div>
        </div>

        <div className="field">
          <div className="field__label">
            <span>NASA Archive Query</span>
            <b style={{ color: "var(--cyan)", fontSize: "10px" }}>IRSA TAP SQL</b>
          </div>
          <div className="readout">
            <div className="readout__row">
              <span>Mission Obs ID</span>
              <b>{manifest.epochs[Math.min(index, manifest.epochs.length - 1)]?.obs_id ?? "—"}</b>
            </div>
            <div className="readout__row">
              <span>Exposure Time</span>
              <b>
                {manifest.epochs[Math.min(index, manifest.epochs.length - 1)]?.exptime_s
                  ? `${manifest.epochs[Math.min(index, manifest.epochs.length - 1)].exptime_s?.toFixed(1)}s`
                  : "113.6s"}
              </b>
            </div>
          </div>
          {manifest.notes.nasa_tap_query && (
            <div
              style={{
                marginTop: 8,
                padding: "8px 10px",
                background: "rgba(0, 0, 0, 0.45)",
                borderRadius: 6,
                fontSize: "10px",
                lineHeight: "1.45",
                fontFamily: "monospace",
                color: "var(--ink-faint)",
                wordBreak: "break-all",
              }}
            >
              <span style={{ color: "var(--cyan)", fontWeight: 700 }}>SQL &gt; </span>
              {manifest.notes.nasa_tap_query}
            </div>
          )}
        </div>

        <p className="sidebar__note">
          {manifest.notes.source}. Every epoch is resampled onto one fixed sky grid and shares a single
          linear stretch, so brightness and position are directly comparable across time.
        </p>
      </div>
    </aside>
  );
}
