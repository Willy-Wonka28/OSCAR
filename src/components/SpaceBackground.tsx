const stars = [
  { id: 's1', x: '4%', y: '12%', size: 2, opacity: 0.7, delay: '0s' },
  { id: 's2', x: '9%', y: '31%', size: 1, opacity: 0.55, delay: '1.4s' },
  { id: 's3', x: '14%', y: '6%', size: 2, opacity: 0.8, delay: '0.7s' },
  { id: 's4', x: '18%', y: '67%', size: 1, opacity: 0.48, delay: '2s' },
  { id: 's5', x: '24%', y: '19%', size: 3, opacity: 0.72, delay: '1s' },
  { id: 's6', x: '28%', y: '43%', size: 1, opacity: 0.8, delay: '2.8s' },
  { id: 's7', x: '33%', y: '11%', size: 1, opacity: 0.55, delay: '1.8s' },
  { id: 's8', x: '38%', y: '76%', size: 2, opacity: 0.5, delay: '0.4s' },
  { id: 's9', x: '43%', y: '29%', size: 1, opacity: 0.7, delay: '2.2s' },
  { id: 's10', x: '48%', y: '8%', size: 2, opacity: 0.65, delay: '1.2s' },
  { id: 's11', x: '53%', y: '36%', size: 1, opacity: 0.5, delay: '0.1s' },
  { id: 's12', x: '59%', y: '15%', size: 2, opacity: 0.7, delay: '2.5s' },
  { id: 's13', x: '64%', y: '57%', size: 1, opacity: 0.62, delay: '1.6s' },
  { id: 's14', x: '69%', y: '22%', size: 2, opacity: 0.8, delay: '0.9s' },
  { id: 's15', x: '75%', y: '9%', size: 1, opacity: 0.6, delay: '2.1s' },
  { id: 's16', x: '80%', y: '42%', size: 3, opacity: 0.7, delay: '0.6s' },
  { id: 's17', x: '86%', y: '18%', size: 1, opacity: 0.8, delay: '1.9s' },
  { id: 's18', x: '91%', y: '72%', size: 2, opacity: 0.58, delay: '2.7s' },
  { id: 's19', x: '96%', y: '29%', size: 1, opacity: 0.64, delay: '1.1s' },
  { id: 's20', x: '7%', y: '84%', size: 2, opacity: 0.48, delay: '2.4s' },
  { id: 's21', x: '31%', y: '92%', size: 1, opacity: 0.65, delay: '0.8s' },
  { id: 's22', x: '71%', y: '88%', size: 1, opacity: 0.58, delay: '1.5s' },
  { id: 's23', x: '88%', y: '90%', size: 2, opacity: 0.5, delay: '0.3s' },
];

const sparkles = [
  { id: 'p1', x: '16%', y: '24%', size: 12 },
  { id: 'p2', x: '83%', y: '35%', size: 16 },
  { id: 'p3', x: '6%', y: '75%', size: 9 },
  { id: 'p4', x: '93%', y: '78%', size: 11 },
];

const suspensions = [
  { id: 'sp1', x: '12%', y: '22%', size: 3, color: 'rgba(192, 132, 252, 0.7)', delay: '0s', dur: '8s' },
  { id: 'sp2', x: '26%', y: '78%', size: 4, color: 'rgba(168, 85, 247, 0.6)', delay: '2.2s', dur: '10s' },
  { id: 'sp3', x: '42%', y: '16%', size: 3, color: 'rgba(216, 180, 254, 0.65)', delay: '1.1s', dur: '7.5s' },
  { id: 'sp4', x: '65%', y: '80%', size: 4, color: 'rgba(192, 132, 252, 0.55)', delay: '3.7s', dur: '11s' },
  { id: 'sp5', x: '79%', y: '24%', size: 3, color: 'rgba(168, 85, 247, 0.6)', delay: '1.8s', dur: '9s' },
  { id: 'sp6', x: '35%', y: '62%', size: 4, color: 'rgba(232, 121, 249, 0.5)', delay: '4s', dur: '12s' },
  { id: 'sp7', x: '52%', y: '45%', size: 3, color: 'rgba(192, 132, 252, 0.5)', delay: '0.6s', dur: '8s' },
  { id: 'sp8', x: '88%', y: '60%', size: 4, color: 'rgba(216, 180, 254, 0.6)', delay: '2.8s', dur: '9.5s' },
];

function ProceduralBlackHole() {
  return (
    <div className="procedural-blackhole" aria-hidden="true">
      <svg
        viewBox="0 0 600 600"
        className="bh-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gravitational Lensing Glow - Strictly Monochromatic */}
          <radialGradient id="bh-lens-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="1" />
            <stop offset="38%" stopColor="#000000" stopOpacity="0.95" />
            <stop offset="42%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="48%" stopColor="#e4e4e7" stopOpacity="0.3" />
            <stop offset="56%" stopColor="#a1a1aa" stopOpacity="0.15" />
            <stop offset="72%" stopColor="#52525b" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Lensing Ring Gradient (Vertical Warped Disk - Pure White/Silver) */}
          <linearGradient id="bh-lens-ring" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="15%" stopColor="rgba(255, 255, 255, 0.2)" />
            <stop offset="30%" stopColor="rgba(255, 255, 255, 0.75)" />
            <stop offset="50%" stopColor="rgba(212, 212, 216, 0.35)" />
            <stop offset="70%" stopColor="rgba(255, 255, 255, 0.75)" />
            <stop offset="85%" stopColor="rgba(255, 255, 255, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Equatorial Accretion Disk Gradient (Pure Monochrome) */}
          <linearGradient id="bh-disk-front" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="18%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="35%" stopColor="rgba(255, 255, 255, 0.55)" />
            <stop offset="48%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="52%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="68%" stopColor="rgba(228, 228, 231, 0.5)" />
            <stop offset="85%" stopColor="rgba(255, 255, 255, 0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          <filter id="bh-bloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Relativistic Halo */}
        <circle cx="300" cy="300" r="280" fill="url(#bh-lens-glow)" />

        {/* Gravitationally Lensed Upper & Lower Arcs (Warped Back-Disk) */}
        <ellipse
          cx="300"
          cy="300"
          rx="175"
          ry="175"
          fill="none"
          stroke="url(#bh-lens-ring)"
          strokeWidth="34"
          filter="url(#bh-bloom)"
          opacity="0.75"
        />
        <ellipse
          cx="300"
          cy="300"
          rx="155"
          ry="155"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          opacity="0.8"
        />

        {/* Equatorial Accretion Disk (Tilted across center) */}
        <g transform="rotate(-18 300 300)">
          {/* Back disk glow behind shadow */}
          <ellipse
            cx="300"
            cy="300"
            rx="270"
            ry="48"
            fill="none"
            stroke="url(#bh-disk-front)"
            strokeWidth="28"
            filter="url(#bh-bloom)"
            opacity="0.6"
          />
          <ellipse
            cx="300"
            cy="300"
            rx="250"
            ry="36"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            opacity="0.7"
          />
        </g>

        {/* The Black Hole Shadow & Event Horizon (Pure Black) */}
        <circle cx="300" cy="300" r="142" fill="#000000" />
        {/* Photon Sphere Rim */}
        <circle
          cx="300"
          cy="300"
          r="143"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.65"
        />

        {/* Front Half of Equatorial Accretion Disk passing in front of Event Horizon */}
        <g transform="rotate(-18 300 300)">
          <path
            d="M 30 300 A 270 48 0 0 0 570 300"
            fill="none"
            stroke="url(#bh-disk-front)"
            strokeWidth="36"
            filter="url(#bh-bloom)"
            opacity="0.85"
          />
          <path
            d="M 50 300 A 250 36 0 0 0 550 300"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            opacity="0.9"
          />
          {/* High-speed inner relativistic flow */}
          <path
            d="M 120 300 A 180 24 0 0 0 480 300"
            fill="none"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="1.5"
            opacity="0.7"
          />
        </g>
      </svg>
    </div>
  );
}

export default function SpaceBackground() {
  return (
    <div className="space-bg-layer" aria-hidden="true">
      {/* Procedurally Rendered Gargantua Black Hole */}
      <ProceduralBlackHole />

      {/* Realistic Purple Nebular Suspensions */}
      <div className="nebula-cloud nebula-cloud--purple-1" />
      <div className="nebula-cloud nebula-cloud--purple-2" />

      {/* Cosmic Comets */}
      <div className="comet comet--one" />
      <div className="comet comet--two" />

      {/* Floating Purple & Starlight Suspensions */}
      {suspensions.map((sp) => (
        <span
          key={sp.id}
          className="suspension"
          style={{
            left: sp.x,
            top: sp.y,
            width: sp.size,
            height: sp.size,
            backgroundColor: sp.color,
            color: sp.color,
            animationDelay: sp.delay,
            animationDuration: sp.dur,
          }}
        />
      ))}

      {/* Stars */}
      {stars.map((star) => (
        <span
          key={star.id}
          className="star"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: star.delay,
          }}
        />
      ))}

      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="sparkle"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
          }}
        />
      ))}

      {/* Subtle Orbital Arcs */}
      <span className="orbit" />
      <span className="orbit orbit-two" />
      <span className="orbit orbit-three" />
    </div>
  );
}
