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
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{
          fontFamily: "'Arial', sans-serif",
          fontSize: "48px",
          fontWeight: "300",
          letterSpacing: "0.2em",
          textTransform: "uppercase"
        }}
        fill={color}
      >
        MALY
      </text>
    </svg>
  );
};