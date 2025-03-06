import React from 'react';

interface MalyLogoProps {
  className?: string;
  color?: string;
}

export const MalyLogo: React.FC<MalyLogoProps> = ({ className = "", color = "currentColor" }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Decorative flowing curves */}
      <path
        d="M30 40 C 45 20, 55 60, 70 40 C 85 20, 95 60, 110 40 C 125 20, 135 60, 150 40"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{
          fill: "none",
          strokeDasharray: "none",
          strokeLinejoin: "round",
          strokeMiterlimit: "4",
          strokeOpacity: "0.6"
        }}
      />

      {/* Custom M */}
      <path
        d="M55 25 L60 25 L65 40 L70 25 L75 25 L80 40 L85 25 L90 25 L82 45 L77 45 L72 30 L67 45 L62 45 L55 25Z"
        fill={color}
      />

      {/* Custom A without middle line */}
      <path
        d="M95 45 L100 25 L110 25 L115 45 L110 45 L109 40 L101 40 L100 45 L95 45Z M102 36 L108 36 L105 28 L102 36Z"
        fill={color}
      />

      {/* Custom L */}
      <path
        d="M120 25 L125 25 L125 40 L135 40 L135 45 L120 45 L120 25Z"
        fill={color}
      />

      {/* Custom Y */}
      <path
        d="M140 25 L145 25 L150 35 L155 25 L160 25 L152 40 L152 45 L147 45 L147 40 L140 25Z"
        fill={color}
      />

      {/* Subtle decorative dots */}
      <circle cx="40" cy="55" r="1" fill={color} opacity="0.6" />
      <circle cx="160" cy="55" r="1" fill={color} opacity="0.6" />
    </svg>
  );
};