import React from 'react';

interface MalyLargeLogoProps {
  className?: string;
  color?: string;
}

export const MalyLargeLogo: React.FC<MalyLargeLogoProps> = ({ className = "", color = "currentColor" }) => {
  return (
    <div className={`${className} w-64 h-64`}>
      <img 
        src="/attached_assets/53d65bf9-c361-49a1-86ea-7341b9288320-removebg-preview.png" 
        alt="Maly Logo" 
        className="w-full h-full object-contain" 
        style={{ filter: `brightness(0) invert(${color === 'currentColor' ? 1 : 0})` }}
      />
    </div>
  );
};