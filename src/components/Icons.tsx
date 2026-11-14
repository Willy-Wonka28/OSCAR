type P = { size?: number; strokeWidth?: number };

const base = (size = 18, strokeWidth = 1.6) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconPlay = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8.2 5.4c0-.9 1-1.5 1.8-1l9 6.1c.7.5.7 1.5 0 2l-9 6.1c-.8.5-1.8-.1-1.8-1z" />
  </svg>
);

export const IconPause = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="7" y="5" width="3.6" height="14" rx="1.4" />
    <rect x="13.4" y="5" width="3.6" height="14" rx="1.4" />
  </svg>
);

export const IconArrow = ({ size = 16 }: P) => (
  <svg {...base(size, 1.8)} aria-hidden="true">
    <path d="M5 12h13" />
    <path d="m12.5 6 6 6-6 6" />
  </svg>
);

export const IconArrowLeft = ({ size = 16 }: P) => (
  <svg {...base(size, 1.8)} aria-hidden="true">
    <path d="M19 12H6" />
    <path d="m11.5 6-6 6 6 6" />
  </svg>
);

export const IconEye = ({ size = 18 }: P) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M2.4 12S5.8 5.6 12 5.6 21.6 12 21.6 12 18.2 18.4 12 18.4 2.4 12 2.4 12Z" />
    <circle cx="12" cy="12" r="3.1" />
  </svg>
);

export const IconSliders = ({ size = 18 }: P) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2.2" />
    <circle cx="9" cy="17" r="2.2" />
  </svg>
);

export const IconClose = ({ size = 16 }: P) => (
  <svg {...base(size, 1.8)} aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconLink = ({ size = 16 }: P) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l2.2-2.2a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-2.2 2.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
  </svg>
);

export const IconReset = ({ size = 16 }: P) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
    <path d="M3.2 4.5v5h5" />
  </svg>
);

export const IconMinus = ({ size = 14 }: P) => (
  <svg {...base(size, 2)} aria-hidden="true">
    <path d="M5 12h14" />
  </svg>
);

export const IconPlus = ({ size = 14 }: P) => (
  <svg {...base(size, 2)} aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconSearch = ({ size = 16 }: P) => (
  <svg {...base(size, 1.8)} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

