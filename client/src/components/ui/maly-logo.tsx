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
        className="object-contain h-full" 
        style={{ 
          filter: `brightness(0) invert(${color === 'currentColor' ? 1 : 0})`,
          maxHeight: '100%',
          width: 'auto'
        }}
      />
    </div>
  );
};