import type { Mode } from "../types";
import { IconEye, IconSliders, IconArrow } from "./Icons";

interface Props {
  currentMode: Mode;
  onChoose: (mode: Mode) => void;
  onClose?: () => void;
}

export default function ModeModal({ currentMode, onChoose, onClose }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-badge">SPHEREx TIME-LAPSE</div>
          <h2 id="modal-title" className="modal-title">OSCAR</h2>
          <p className="modal-subtitle">
            Choose your observation profile. You can toggle between modes anytime using the switch or pressing <kbd>N</kbd>.
          </p>
        </div>

        <div className="modal-choices">
          <button
            type="button"
            className="modal-choice-btn"
            data-active={currentMode === "noob"}
            onClick={() => onChoose("noob")}
          >
            <div className="modal-choice-btn__icon">
              <img src="/assets/noob-icon.png" alt="" className="modal-choice-btn__img" />
            </div>
            <div className="modal-choice-btn__content">
              <div className="modal-choice-btn__title-row">
                <h3>Noob Mode</h3>
                <span className="modal-choice-btn__tag">Recommended</span>
              </div>
              <p>
                Zero jargon. Automatic epoch alignment, continuous blink, and dynamic motion magnifier for discovering movers in seconds.
              </p>
            </div>
            <div className="modal-choice-btn__arrow">
              <IconArrow size={18} />
            </div>
          </button>

          <button
            type="button"
            className="modal-choice-btn"
            data-active={currentMode === "nerd"}
            onClick={() => onChoose("nerd")}
          >
            <div className="modal-choice-btn__icon">
              <img src="/assets/nerd-icon.png" alt="" className="modal-choice-btn__img" />
            </div>
            <div className="modal-choice-btn__content">
              <div className="modal-choice-btn__title-row">
                <h3>Nerd Mode</h3>
                <span className="modal-choice-btn__tag">Deep Space</span>
              </div>
              <p>
                Full telemetry sidebar. Red/Cyan two-epoch composite, adjustable FPS, reticle toggles, and sub-pixel proper motion readouts.
              </p>
            </div>
            <div className="modal-choice-btn__arrow">
              <IconArrow size={18} />
            </div>
          </button>
        </div>

        <div className="modal-footer">
          <span>NASA IRSA SPHEREx DR1 & QR3 Archive Data</span>
          {onClose && (
            <button type="button" className="modal-close-btn" onClick={onClose}>
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
