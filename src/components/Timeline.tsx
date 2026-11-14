import type { Manifest } from "../types";
import { IconPause, IconPlay, IconMinus, IconPlus } from "./Icons";

type Props = {
  manifest: Manifest;
  index: number;
  playing: boolean;
  fps: number;
  onSelect: (i: number) => void;
  onToggle: () => void;
  onFps: (n: number) => void;
};

export default function Timeline({ manifest, index, playing, fps, onSelect, onToggle, onFps }: Props) {
  const n = manifest.epochs.length;
  const progress = n > 1 ? (index / (n - 1)) * 100 : 0;

  return (
    <div className="timeline glass">
      <button
        className="play-btn"
        onClick={onToggle}
        aria-label={playing ? "Pause the time-lapse" : "Play the time-lapse"}
      >
        {playing ? <IconPause size={17} /> : <IconPlay size={17} />}
      </button>

      <div className="ticks" role="tablist" aria-label="Observing epochs">
        <div className="ticks__line" />
        <div className="ticks__progress" style={{ width: `calc(${progress}% - ${progress > 0 ? 12 : 0}px)` }} />
        {manifest.epochs.map((e, i) => (
          <button
            key={e.id}
            role="tab"
            aria-selected={i === index}
            className="tick"
            data-active={i === index}
            onClick={() => onSelect(i)}
          >
            <span className="tick__dot" />
            <span className="tick__label">{e.label}</span>
            <span className="tick__date">{e.iso}</span>
          </button>
        ))}
      </div>

      <div className="timeline__right">
        <div className="speed" aria-label="Playback speed">
          <button onClick={() => onFps(Math.max(1, fps - 1))} aria-label="Slower">
            <IconMinus size={12} />
          </button>
          <span>{fps} FPS</span>
          <button onClick={() => onFps(Math.min(8, fps + 1))} aria-label="Faster">
            <IconPlus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
