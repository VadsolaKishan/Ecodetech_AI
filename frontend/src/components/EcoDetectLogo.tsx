import React from "react";

interface EcoDetectLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showGlow?: boolean;
}

const SIZES = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export const EcoDetectLogo: React.FC<EcoDetectLogoProps> = ({
  size = "md",
  className = "",
  showGlow = true,
}) => {
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-carbon-emerald via-carbon-green to-carbon-cyber p-[2px] transition-all duration-300 group-hover:scale-105 ${
        showGlow ? "shadow-glow-green" : ""
      } ${sizeClass} ${className}`}
    >
      {/* Dark sleek glass container */}
      <div className="w-full h-full bg-industrial-950 rounded-[10px] flex items-center justify-center p-1 relative overflow-hidden">
        {/* Subtle radial ambient emerald backlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-carbon-green/25 via-carbon-green/5 to-transparent pointer-events-none" />

        {/* High-definition Vector SVG Logo */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          <defs>
            {/* Primary Neon Emerald to Cyan Gradient */}
            <linearGradient id="ecoBrandGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Glowing Core Filter */}
            <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Leaf Subtle Fill */}
            <linearGradient id="leafBody" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Outer Sensor Radar Aperture Circle */}
          <circle
            cx="24"
            cy="24"
            r="20.5"
            stroke="url(#ecoBrandGrad)"
            strokeWidth="1.75"
            strokeDasharray="2.5 3.5"
            className="opacity-80"
          />

          {/* Concentric Scanner Arc Ring */}
          <circle
            cx="24"
            cy="24"
            r="16.5"
            stroke="#10B981"
            strokeWidth="0.8"
            strokeOpacity="0.45"
          />

          {/* Reticle Radar Crosshair Ticks */}
          <line x1="24" y1="2" x2="24" y2="7.5" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="24" y1="40.5" x2="24" y2="46" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="2" y1="24" x2="7.5" y2="24" stroke="#06B6D4" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="40.5" y1="24" x2="46" y2="24" stroke="#06B6D4" strokeWidth="2.2" strokeLinecap="round" />

          {/* Prominent High-Contrast Eco-Leaf Silhouette */}
          <path
            d="M24 7C24 7 36.5 13 36.5 25C36.5 33 31 39 24 39C17 39 11.5 33 11.5 25C11.5 13 24 7 24 7Z"
            fill="url(#leafBody)"
            stroke="url(#ecoBrandGrad)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Neural Sensor Circuit Spine */}
          <path
            d="M24 12V35"
            stroke="#A7F3D0"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M24 18L30.5 15"
            stroke="#A7F3D0"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M24 24L17.5 21"
            stroke="#A7F3D0"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M24 30L29.5 27.5"
            stroke="#06B6D4"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Central AI Detection Radar Core Spark */}
          <circle
            cx="24"
            cy="24"
            r="3.5"
            fill="#34D399"
            filter="url(#coreGlow)"
          />
          <circle
            cx="24"
            cy="24"
            r="1.6"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    </div>
  );
};

export default EcoDetectLogo;
