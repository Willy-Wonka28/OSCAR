export type Mode = "noob" | "nerd";
export type ViewMode = "blink" | "redcyan" | "swipe";

export interface Epoch {
  id: number;
  label: string;
  iso: string;
  n_images: number;
  partial: boolean;
  status: "ready" | "pending" | "error";
  frame_url: string;
  expected: { x: number; y: number };
  centroid?: { x: number; y: number };
  obs_id?: string;
  collection?: string;
  band?: string;
  mjd?: number;
  exptime_s?: number;
}

export interface Manifest {
  job_id: string;
  target: {
    name: string;
    ra: number;
    dec: number;
    fov_arcmin: number;
    pixel_scale_arcsec: number;
    native_pixel_scale_arcsec?: number;
    size_px: number;
    distance_ly?: number;
    type?: string;
  };
  stretch: { vmin: number; vmax: number; softening: number };
  epochs: Epoch[];
  notes: {
    subsampled: boolean;
    detector: string;
    jitter_px: number | null;
    oversample?: number;
    source?: string;
    band?: string;
    grid?: string;
    measured_motion_px?: number;
    measured_motion_arcsec?: number;
    nasa_tap_query?: string;
  };
}

export const FALLBACK_MANIFEST: Manifest = {
  job_id: "barnard",
  target: {
    name: "Barnard's Star",
    ra: 269.452075,
    dec: 4.693391,
    fov_arcmin: 3,
    pixel_scale_arcsec: 3.075,
    native_pixel_scale_arcsec: 6.15,
    size_px: 62,
  },
  stretch: { vmin: -12, vmax: 140, softening: 8 },
  epochs: [
    {
      id: 0,
      label: "Sep 2025",
      iso: "2025-09-08",
      n_images: 1,
      partial: false,
      status: "ready",
      frame_url: "",
      expected: { x: 0.482, y: 0.512 },
      centroid: { x: 0.482, y: 0.512 },
    },
    {
      id: 1,
      label: "Mar 2026",
      iso: "2026-03-19",
      n_images: 1,
      partial: false,
      status: "ready",
      frame_url: "",
      expected: { x: 0.5, y: 0.5 },
      centroid: { x: 0.5, y: 0.5 },
    },
    {
      id: 2,
      label: "Sep 2026",
      iso: "2026-09-12",
      n_images: 1,
      partial: false,
      status: "ready",
      frame_url: "",
      expected: { x: 0.518, y: 0.488 },
      centroid: { x: 0.518, y: 0.488 },
    },
  ],
  notes: {
    subsampled: true,
    detector: "mixed",
    jitter_px: 0.3,
    oversample: 2,
    source: "preview",
  },
};
