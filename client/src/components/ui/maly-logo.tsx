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

      {/* Main text */}
      <text
        x="50"
        y="45"
        fontFamily="'Playfair Display', serif"
        fontSize="48"
        fontStyle="italic"
        fill={color}
        style={{
          letterSpacing: "0.05em"
        }}
      >
        Maly
      </text>

      {/* Subtle decorative dots */}
      <circle cx="40" cy="55" r="1" fill={color} opacity="0.6" />
      <circle cx="160" cy="55" r="1" fill={color} opacity="0.6" />
    </svg>
  );
};