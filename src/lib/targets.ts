export interface TargetPreset {
  id: string;
  name: string;
  category: string;
  ra: number;
  dec: number;
  description: string;
  available: boolean;
}

export const HERO_TARGETS: TargetPreset[] = [
  {
    id: "barnard",
    name: "Barnard's Star",
    category: "High Proper Motion",
    ra: 269.452,
    dec: 4.693,
    description: "3 epochs (2025–2026) · 10.3″/yr rapid mover",
    available: true,
  },
  {
    id: "wise0855",
    name: "WISE 0855-0714",
    category: "Sub-stellar Brown Dwarf",
    ra: 133.795,
    dec: -7.245,
    description: "08h55m10.83s, -7d14m42.5s · 8.1″/yr drift",
    available: true,
  },
  {
    id: "eps_indi_b",
    name: "Epsilon Indi B",
    category: "Brown Dwarf Binary",
    ra: 330.840,
    dec: -56.786,
    description: "Close binary pair · 4.7″/yr motion",
    available: true,
  },
  {
    id: "rw_aur",
    name: "RW Aurigae",
    category: "Young Stellar Object",
    ra: 77.108,
    dec: 30.401,
    description: "T Tauri occultation & variability",
    available: true,
  },
  {
    id: "r_dra",
    name: "R Draconis",
    category: "Mira Variable",
    ra: 247.554,
    dec: 66.702,
    description: "Pulsating long-period infrared giant",
    available: true,
  },
];

/**
 * Parses Right Ascension input into decimal degrees [0, 360].
 * Supports:
 * - Direct degrees: "133.795" or "133.795°"
 * - Sexagesimal HMS: "08h55m10.831s", "08h 55m 10.83s", "08:55:10.831", "08 55 10.831"
 * - Compact format: "085510.831" (HHMMSS.ss)
 */
export function parseSingleRa(input: string): number | null {
  const s = input.trim().replace(/°/g, "");
  if (!s) return null;

  // 1. Explicit HMS: e.g. 08h55m10.831s or 8h 55m 10.83s
  const hmsMatch = s.match(/^(\d{1,2})h\s*(\d{1,2})m\s*(\d{1,2}(?:\.\d+)?)s?$/i);
  if (hmsMatch) {
    const h = parseFloat(hmsMatch[1]);
    const m = parseFloat(hmsMatch[2]);
    const sec = parseFloat(hmsMatch[3]);
    if (h < 24 && m < 60 && sec < 60) {
      return (h + m / 60 + sec / 3600) * 15;
    }
  }

  // 2. Colons or spaces: e.g. 08:55:10.831 or 08 55 10.831
  const colonsMatch = s.match(/^(\d{1,2})[:\s]+(\d{1,2})[:\s]+(\d{1,2}(?:\.\d+)?)$/);
  if (colonsMatch) {
    const h = parseFloat(colonsMatch[1]);
    const m = parseFloat(colonsMatch[2]);
    const sec = parseFloat(colonsMatch[3]);
    if (h < 24 && m < 60 && sec < 60) {
      return (h + m / 60 + sec / 3600) * 15;
    }
  }

  // 3. Compact astronomical format: 085510.831 (HH=08, MM=55, SS=10.831)
  const compactMatch = s.match(/^(\d{2})(\d{2})(\d{2}(?:\.\d+)?)$/);
  if (compactMatch) {
    const h = parseFloat(compactMatch[1]);
    const m = parseFloat(compactMatch[2]);
    const sec = parseFloat(compactMatch[3]);
    if (h < 24 && m < 60 && sec < 60) {
      return (h + m / 60 + sec / 3600) * 15;
    }
  }

  // 4. Decimal degrees: e.g. 133.795
  const num = parseFloat(s);
  if (!isNaN(num) && num >= 0 && num <= 360) {
    return num;
  }

  return null;
}

/**
 * Parses Declination input into decimal degrees [-90, +90].
 * Supports:
 * - Direct degrees: "-7.245", "+4.693", "-7.245°"
 * - Sexagesimal DMS: "-7d14m42.53s", "-07d 14m 42.53s", "-07:14:42.53", "-7 14 42.53"
 * - Compact format: "-71442.53" or "-071442.53" (±DDMMSS.ss)
 */
export function parseSingleDec(input: string): number | null {
  const s = input.trim().replace(/°/g, "");
  if (!s) return null;

  const isNeg = s.startsWith("-");
  const cleaned = s.replace(/^[+-]/, "").trim();

  // 1. Explicit DMS: e.g. 7d14m42.53s or 07d 14m 42.53s
  const dmsMatch = cleaned.match(/^(\d{1,2})d\s*(\d{1,2})m\s*(\d{1,2}(?:\.\d+)?)s?$/i);
  if (dmsMatch) {
    const d = parseFloat(dmsMatch[1]);
    const m = parseFloat(dmsMatch[2]);
    const sec = parseFloat(dmsMatch[3]);
    if (d <= 90 && m < 60 && sec < 60) {
      const val = d + m / 60 + sec / 3600;
      return isNeg ? -val : val;
    }
  }

  // 2. Colons or spaces: e.g. 07:14:42.53 or 7 14 42.53
  const colonsMatch = cleaned.match(/^(\d{1,2})[:\s]+(\d{1,2})[:\s]+(\d{1,2}(?:\.\d+)?)$/);
  if (colonsMatch) {
    const d = parseFloat(colonsMatch[1]);
    const m = parseFloat(colonsMatch[2]);
    const sec = parseFloat(colonsMatch[3]);
    if (d <= 90 && m < 60 && sec < 60) {
      const val = d + m / 60 + sec / 3600;
      return isNeg ? -val : val;
    }
  }

  // 3. Compact astronomical format: -71442.53 or -071442.53 (DD=07, MM=14, SS=42.53)
  const compactMatch = cleaned.match(/^(\d{1,2})(\d{2})(\d{2}(?:\.\d+)?)$/);
  if (compactMatch) {
    const d = parseFloat(compactMatch[1]);
    const m = parseFloat(compactMatch[2]);
    const sec = parseFloat(compactMatch[3]);
    if (d <= 90 && m < 60 && sec < 60) {
      const val = d + m / 60 + sec / 3600;
      return isNeg ? -val : val;
    }
  }

  // 4. Decimal degrees: e.g. -7.245 or +4.693
  const num = parseFloat(s);
  if (!isNaN(num) && num >= -90 && num <= 90) {
    return num;
  }

  return null;
}

/**
 * Parses user input for both celestial coordinates from a single search string.
 */
export function parseCoordinates(input: string): { ra: number; dec: number } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Split by comma or semicolon or slash
  if (trimmed.includes(",") || trimmed.includes(";") || trimmed.includes("/")) {
    const parts = trimmed.split(/[,;/]/);
    if (parts.length === 2) {
      const ra = parseSingleRa(parts[0]);
      const dec = parseSingleDec(parts[1]);
      if (ra !== null && dec !== null) {
        return { ra, dec };
      }
    }
  }

  // Split by space if two chunks
  const spaceParts = trimmed.split(/\s+/);
  if (spaceParts.length === 2) {
    const ra = parseSingleRa(spaceParts[0]);
    const dec = parseSingleDec(spaceParts[1]);
    if (ra !== null && dec !== null) {
      return { ra, dec };
    }
  }

  return null;
}
