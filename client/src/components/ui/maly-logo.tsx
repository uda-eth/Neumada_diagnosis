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
      {/* M */}
      <path
        d="M40 20 L45 20 L55 50 L65 20 L75 20 L85 50 L95 20 L100 20 L87 60 L77 60 L65 30 L53 60 L43 60 L40 20Z"
        fill={color}
      />

      {/* A without middle line */}
      <path
        d="M105 60 L110 20 L130 20 L135 60 L125 60 L123 50 L117 50 L115 60 L105 60Z M118 42 L122 42 L120 30 L118 42Z"
        fill={color}
      />

      {/* L */}
      <path
        d="M140 20 L150 20 L150 50 L165 50 L165 60 L140 60 L140 20Z"
        fill={color}
      />

      {/* Y */}
      <path
        d="M170 20 L180 20 L190 35 L200 20 L210 20 L195 42 L195 60 L185 60 L185 42 L170 20Z"
        fill={color}
      />
    </svg>
  );
};