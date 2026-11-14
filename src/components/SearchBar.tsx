import { useState, useRef, useEffect } from "react";
import { IconSearch, IconClose } from "./Icons";
import {
  HERO_TARGETS,
  parseCoordinates,
  parseSingleRa,
  parseSingleDec,
  type TargetPreset,
} from "../lib/targets";

interface Props {
  currentTargetId?: string | null;
  currentTargetName: string;
  onSelectTarget: (target: TargetPreset) => void;
}

export default function SearchBar({ currentTargetId, currentTargetName, onSelectTarget }: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [coordMode, setCoordMode] = useState(false);
  const [inputRa, setInputRa] = useState("");
  const [inputDec, setInputDec] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const parsedCoord = parseCoordinates(query);
  const parsedRa = parseSingleRa(inputRa);
  const parsedDec = parseSingleDec(inputDec);
  const isFormValid = parsedRa !== null && parsedDec !== null;

  const filtered = query.trim()
    ? HERO_TARGETS.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.category.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase())
      )
    : HERO_TARGETS;

  const handleSelectPreset = (t: TargetPreset) => {
    setQuery("");
    setIsOpen(false);
    onSelectTarget(t);
  };

  const handleApplyCoordinates = (raNum: number, decNum: number) => {
    // Check if coordinates match an existing hero benchmark (e.g. WISE 0855 or Barnard's Star)
    const match = HERO_TARGETS.find(
      (h) => Math.abs(h.ra - raNum) < 0.2 && Math.abs(h.dec - decNum) < 0.2
    );

    if (match) {
      handleSelectPreset(match);
      return;
    }

    const customTarget: TargetPreset = {
      id: `coord_${raNum.toFixed(3)}_${decNum.toFixed(3)}`,
      name: `Field (${raNum.toFixed(2)}°, ${decNum > 0 ? `+${decNum.toFixed(2)}` : decNum.toFixed(2)}°)`,
      category: "User Coordinates",
      ra: raNum,
      dec: decNum,
      description: "Custom SPHEREx infrared sky field",
      available: true,
    };
    setQuery("");
    setInputRa("");
    setInputDec("");
    setIsOpen(false);
    setCoordMode(false);
    onSelectTarget(customTarget);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (parsedCoord) {
        handleApplyCoordinates(parsedCoord.ra, parsedCoord.dec);
      } else if (filtered.length > 0) {
        handleSelectPreset(filtered[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleManualCoordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedRa !== null && parsedDec !== null) {
      handleApplyCoordinates(parsedRa, parsedDec);
    }
  };

  return (
    <div className="search-container" ref={containerRef}>
      <div className="search-bar">
        <span className="search-bar__icon">
          <IconSearch size={21} />
        </span>
        <input
          type="text"
          className="search-bar__input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setCoordMode(false);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            currentTargetName
              ? `Active: ${currentTargetName} · Search or enter RA, Dec…`
              : "Search celestial target or enter RA, Dec (e.g. 08h55m10s, -7d14m42s)…"
          }
          aria-label="Search sky targets or enter Right Ascension and Declination"
        />
        <button
          type="button"
          className="search-bar__coord-toggle"
          title="Direct RA / Dec coordinate form"
          onClick={() => {
            setCoordMode((m) => !m);
            setIsOpen(true);
          }}
        >
          RA/DEC
        </button>
        {query && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            aria-label="Clear search"
          >
            <IconClose size={13} />
          </button>
        )}
      </div>

      {/* Preset pills for quick 1-click loading */}
      <div className="search-chips">
        {HERO_TARGETS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="search-chip"
            data-active={Boolean(currentTargetId ? currentTargetId === t.id : currentTargetName.toLowerCase() === t.name.toLowerCase())}
            onClick={() => handleSelectPreset(t)}
          >
            {t.name}
          </button>
        ))}
      </div>

      {isOpen && (
        <div className="search-dropdown">
          {/* Direct Coordinate Form Panel */}
          {coordMode ? (
            <form className="coord-form" onSubmit={handleManualCoordSubmit}>
              <div className="coord-form__header">
                <span>Enter Celestial Coordinates</span>
                <button
                  type="button"
                  className="coord-form__close"
                  onClick={() => setCoordMode(false)}
                >
                  Back to List
                </button>
              </div>
              <div className="coord-form__fields">
                <div className="coord-form__group">
                  <label htmlFor="ra-input">Right Ascension (RA)</label>
                  <input
                    id="ra-input"
                    type="text"
                    placeholder="e.g. 08h55m10.831s or 133.795"
                    value={inputRa}
                    onChange={(e) => setInputRa(e.target.value)}
                    autoComplete="off"
                  />
                  <span className="coord-form__preview">
                    {inputRa.trim() ? (
                      parsedRa !== null ? (
                        <span className="coord-form__ok">→ {parsedRa.toFixed(4)}°</span>
                      ) : (
                        <span className="coord-form__err">Invalid format (use 08h55m10s or 133.79)</span>
                      )
                    ) : (
                      "HMS or decimal degrees"
                    )}
                  </span>
                </div>
                <div className="coord-form__group">
                  <label htmlFor="dec-input">Declination (Dec)</label>
                  <input
                    id="dec-input"
                    type="text"
                    placeholder="e.g. -7d14m42.53s or -7.245"
                    value={inputDec}
                    onChange={(e) => setInputDec(e.target.value)}
                    autoComplete="off"
                  />
                  <span className="coord-form__preview">
                    {inputDec.trim() ? (
                      parsedDec !== null ? (
                        <span className="coord-form__ok">
                          → {parsedDec > 0 ? `+${parsedDec.toFixed(4)}` : parsedDec.toFixed(4)}°
                        </span>
                      ) : (
                        <span className="coord-form__err">Invalid format (use -7d14m42s or -7.24)</span>
                      )
                    ) : (
                      "DMS or decimal degrees"
                    )}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                className="coord-form__submit"
                disabled={!isFormValid}
                style={{ opacity: isFormValid ? 1 : 0.45, cursor: isFormValid ? "pointer" : "not-allowed" }}
              >
                Inspect Coordinates
              </button>
            </form>
          ) : (
            <>
              {/* If user typed coordinates in the search input */}
              {parsedCoord && (
                <button
                  type="button"
                  className="search-dropdown__coord-match"
                  onClick={() => handleApplyCoordinates(parsedCoord.ra, parsedCoord.dec)}
                >
                  <div className="search-dropdown__coord-match-title">
                    <strong>Navigate to Coordinates</strong>
                    <span className="search-dropdown__tag">Valid RA / DEC</span>
                  </div>
                  <div className="search-dropdown__item-sub">
                    <span>
                      RA {parsedCoord.ra.toFixed(4)}° &nbsp;·&nbsp; DEC{" "}
                      {parsedCoord.dec > 0 ? `+${parsedCoord.dec.toFixed(4)}` : parsedCoord.dec.toFixed(4)}°
                    </span>
                    <span className="search-dropdown__coords">Press Enter ↵</span>
                  </div>
                </button>
              )}

              <div className="search-dropdown__header">
                <span>SPHEREx Benchmark Targets</span>
                <button
                  type="button"
                  className="search-dropdown__manual-link"
                  onClick={() => setCoordMode(true)}
                >
                  Enter RA/DEC manually →
                </button>
              </div>

              {filtered.length === 0 && !parsedCoord ? (
                <div className="search-dropdown__empty">
                  No preset matched &ldquo;{query}&rdquo;. Enter coordinates (e.g. <code>08h55m10s, -7d14m42s</code> or <code>133.79, -7.24</code>).
                </div>
              ) : (
                filtered.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="search-dropdown__item"
                    data-active={currentTargetName === t.name}
                    onClick={() => handleSelectPreset(t)}
                  >
                    <div className="search-dropdown__item-title">
                      <strong>{t.name}</strong>
                      <span className="search-dropdown__tag">{t.category}</span>
                    </div>
                    <div className="search-dropdown__item-sub">
                      <span>{t.description}</span>
                      <span className="search-dropdown__coords">
                        RA {t.ra.toFixed(2)}° · DEC {t.dec > 0 ? `+${t.dec.toFixed(2)}` : t.dec.toFixed(2)}°
                      </span>
                    </div>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
