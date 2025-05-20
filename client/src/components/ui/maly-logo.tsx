import React from 'react';

interface MalyLogoProps {
  className?: string;
  color?: string;
}

export const MalyLogo: React.FC<MalyLogoProps> = ({ className = "", color = "currentColor" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/attached_assets/53d65bf9-c361-49a1-86ea-7341b9288320-removebg-preview.png" 
        alt="Maly Logo" 
        className="h-full" 
        style={{ 
          filter: `brightness(0) invert(${color === 'currentColor' ? 1 : 0})`,
          height: '32px',
          width: 'auto'
        }}
      />
    </div>
  );
};