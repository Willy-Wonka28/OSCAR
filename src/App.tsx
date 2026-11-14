import { useCallback, useEffect, useMemo, useState } from "react";
import SpaceBackground from "./components/SpaceBackground";
import Viewer from "./components/Viewer";
import Timeline from "./components/Timeline";
import Sidebar from "./components/Sidebar";
import ModeModal from "./components/ModeModal";
import SearchBar from "./components/SearchBar";
import { HERO_TARGETS, type TargetPreset } from "./lib/targets";
import { IconClose, IconLink } from "./components/Icons";
import { computeScientificMetrics, useManifest } from "./lib/data";
import type { Mode, ViewMode } from "./types";

const TOUR_KEY = "oscar.tour.v1";
const MODE_KEY = "oscar.mode.v1";
const CHOSE_KEY = "oscar.chose.v1";

function readInitialMode(): Mode {
  const q = new URLSearchParams(window.location.search).get("mode");
  if (q === "nerd" || q === "noob") return q;
  const saved = localStorage.getItem(MODE_KEY);
  return saved === "nerd" ? "nerd" : "noob";
}

export default function App() {
  // Mode & modal states
  const [mode, setMode] = useState<Mode>(readInitialMode);
  const [showModal, setShowModal] = useState<boolean>(() => !localStorage.getItem(CHOSE_KEY));

  // Default target state: null on initial load until a target is searched or chosen
  const [selectedTarget, setSelectedTarget] = useState<TargetPreset | null>(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("target");
    if (t) {
      return HERO_TARGETS.find((h) => h.id === t || h.name.toLowerCase().includes(t.toLowerCase())) ?? null;
    }
    return null;
  });

  const { manifest, state } = useManifest(selectedTarget?.id ?? null);

  // Playback & view controls
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("blink");
  const [fps, setFps] = useState(2);
  const [lensOn, setLensOn] = useState(true);
  const [lensZoom, setLensZoom] = useState(5);
  const [crosshairOn, setCrosshairOn] = useState(false);
  const [trailOn, setTrailOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);

  const epochCount = manifest?.epochs.length ?? 0;
  const sciMetrics = useMemo(() => (manifest ? computeScientificMetrics(manifest, index) : null), [manifest, index]);

  // Handle auto-selection if URL param specifies target
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("target");
    if (t) {
      const match = HERO_TARGETS.find((h) => h.id === t || h.name.toLowerCase().includes(t.toLowerCase()));
      if (match) setSelectedTarget(match);
    }
  }, []);

  // Save mode preference
  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  // Keep epoch index in bounds
  useEffect(() => {
    if (epochCount && index >= epochCount) setIndex(0);
  }, [epochCount, index]);

  // Playback clock
  useEffect(() => {
    if (!playing || !selectedTarget || epochCount < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % epochCount);
    }, Math.round(1000 / fps));
    return () => window.clearInterval(id);
  }, [playing, fps, epochCount, selectedTarget]);

  const chooseMode = useCallback((m: Mode) => {
    setMode(m);
    setShowModal(false);
    localStorage.setItem(CHOSE_KEY, "1");
    if (!localStorage.getItem(TOUR_KEY)) setTourStep(0);
  }, []);

  const selectTarget = useCallback((target: TargetPreset) => {
    setSelectedTarget(target);
    setIndex(0);
    setPlaying(true);
  }, []);

  const copyLink = useCallback(async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    if (selectedTarget) url.searchParams.set("target", selectedTarget.id);
    url.searchParams.set("epoch", String(index));
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url.toString());
    }
  }, [mode, selectedTarget, index]);

  const reset = useCallback(() => {
    setIndex(0);
    setPlaying(true);
    setViewMode("blink");
    setFps(2);
    setLensOn(true);
    setLensZoom(5);
    setCrosshairOn(false);
    setTrailOn(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (showModal) return;

      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "ArrowRight" && epochCount) {
        e.preventDefault();
        setIndex((i) => (i + 1) % epochCount);
      } else if (e.key === "ArrowLeft" && epochCount) {
        e.preventDefault();
        setIndex((i) => (i - 1 + epochCount) % epochCount);
      } else if (e.key.toLowerCase() === "n") {
        setMode((m) => (m === "nerd" ? "noob" : "nerd"));
      } else if (e.key === "Escape") {
        setTourStep(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal, epochCount]);

  const tour = useMemo(
    () => [
      {
        title: "Magnified Motion Lens",
        body: "The inset corner dynamically tracks and magnifies proper motion, making sub-pixel drift instantly identifiable.",
      },
      {
        title: "Continuous Time-Lapse",
        body: "Hit Space bar to toggle the blink comparator. Static reference stars remain stationary; moving celestial bodies stand out.",
      },
    ],
    []
  );

  return (
    <div className="app">
      <SpaceBackground />

      {/* Main Single-Page App Viewer */}
      <div className="viewer">
        <header className="topbar">
          <div className="topbar__brand-wrap">
            <span className="topbar__brand">OSCAR</span>
            <span className="topbar__tagline">SPHEREx OBSERVATORY</span>
          </div>

          <div className="topbar__search">
            <SearchBar
              currentTargetId={selectedTarget?.id ?? null}
              currentTargetName={selectedTarget?.name ?? ""}
              onSelectTarget={selectTarget}
            />
          </div>

          <div className="topbar__actions">
            {selectedTarget && sciMetrics && (
              <div
                className="motion-pill"
                title={sciMetrics.isVariable ? sciMetrics.noob[0].value : `${sciMetrics.noob[0].value} · ${sciMetrics.noob[1].value}`}
              >
                <span className="motion-pill__dot" />
                <span className="motion-pill__text">
                  {sciMetrics.isVariable ? sciMetrics.noob[0].value : `${sciMetrics.noob[0].value} · ${sciMetrics.noob[1].value}`}
                </span>
              </div>
            )}

            <div className="mode-switch" role="group" aria-label="Interface mode">
              <button
                type="button"
                data-active={mode === "noob"}
                onClick={() => setMode("noob")}
              >
                <span>Noob</span>
                <img src="/assets/noob-icon.png" alt="" className="mode-switch__icon" aria-hidden="true" />
              </button>
              <button
                type="button"
                data-active={mode === "nerd"}
                onClick={() => setMode("nerd")}
              >
                <span>Nerd</span>
                <img src="/assets/nerd-icon.png" alt="" className="mode-switch__icon" aria-hidden="true" />
              </button>
            </div>

            {selectedTarget && (
              <button
                type="button"
                className="icon-btn icon-btn--fade-in"
                onClick={copyLink}
                aria-label="Copy direct link"
                title={copied ? "Link copied" : "Copy shareable link"}
              >
                <IconLink size={16} />
              </button>
            )}
          </div>
        </header>

        {/* Main Stage - Only rendered once an observation target is selected */}
        {selectedTarget && manifest && (
          <div className="viewer__body" data-nerd={mode === "nerd"}>
            <section className="stage">
              <div className="stage-fade-in">
                <Viewer
                  manifest={manifest}
                  index={index}
                  viewMode={viewMode}
                  lensOn={lensOn}
                  lensZoom={lensZoom}
                  crosshairOn={crosshairOn}
                  trailOn={trailOn}
                />
                <div className="stage__hint">
                  {viewMode === "redcyan"
                    ? "Red = initial epoch · Cyan = latest epoch"
                    : "Space to play/pause · ← → to step epochs"}
                </div>

                {/* Noob Mode 3 Core Metrics Badge */}
                {sciMetrics && (
                  <aside className="field-card" aria-label="Core target metrics">
                    <div className="field-card__head">
                      <span className="field-card__dot" />
                      <span>{selectedTarget.name}</span>
                    </div>
                    <dl>
                      {sciMetrics.noob.map((item, idx) => (
                        <div key={idx} className="field-card__row">
                          <dt>{item.label}</dt>
                          <dd>{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </aside>
                )}
              </div>
            </section>

            {/* Nerd sidebar */}
            <Sidebar
              manifest={manifest}
              index={index}
              viewMode={viewMode}
              onViewMode={setViewMode}
              fps={fps}
              onFps={setFps}
              lensOn={lensOn}
              onLens={setLensOn}
              lensZoom={lensZoom}
              onLensZoom={setLensZoom}
              crosshairOn={crosshairOn}
              onCrosshair={setCrosshairOn}
              trailOn={trailOn}
              onTrail={setTrailOn}
              onCopy={copyLink}
              copied={copied}
              onReset={reset}
              onClose={() => setMode("noob")}
            />
          </div>
        )}

        {/* Timeline (active when target is selected) */}
        {selectedTarget && manifest && (
          <Timeline
            manifest={manifest}
            index={index}
            playing={playing}
            fps={fps}
            onSelect={(i) => {
              setIndex(i);
              setPlaying(false);
            }}
            onToggle={() => setPlaying((p) => !p)}
            onFps={setFps}
          />
        )}
      </div>

      {/* Mode Choice Modal Overlay (appears on first visit or when triggered) */}
      {showModal && (
        <ModeModal
          currentMode={mode}
          onChoose={chooseMode}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Noob Quick Tour */}
      {tourStep !== null && selectedTarget && (
        <div className="tour" role="dialog" aria-label="Quick tour">
          <div className="tour__step">Step {tourStep + 1} of {tour.length}</div>
          <h4>{tour[tourStep].title}</h4>
          <p>{tour[tourStep].body}</p>
          <div className="tour__foot">
            <div className="tour__dots">
              {tour.map((_, i) => (
                <i key={i} data-on={i === tourStep} />
              ))}
            </div>
            <div className="tour__actions">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(TOUR_KEY, "1");
                  setTourStep(null);
                }}
              >
                Skip
              </button>
              <button
                type="button"
                data-primary="true"
                onClick={() => {
                  if (tourStep < tour.length - 1) setTourStep(tourStep + 1);
                  else {
                    localStorage.setItem(TOUR_KEY, "1");
                    setTourStep(null);
                  }
                }}
              >
                {tourStep < tour.length - 1 ? "Next" : "Got it"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline/Fallback Toast */}
      {selectedTarget && state === "fallback" && (
        <div className="toast">
          <IconClose size={13} /> Offline archive fixture active.
        </div>
      )}

      {/* Mobile & Small Screen Guard Shield */}
      <aside className="mobile-shield" aria-label="Mobile display alert">
        <div className="mobile-shield__card">
          <div className="mobile-shield__icon-wrap">
            <span className="mobile-shield__reticle" />
          </div>
          <span className="mobile-shield__brand">OSCAR</span>
          <h2>Desktop Screen Required</h2>
          <p>
            OSCAR requires a wider display. Please switch to a laptop, desktop, or landscape tablet.
          </p>
          <div className="mobile-shield__badge">
            <span>MIN WIDTH: 960 PX</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
