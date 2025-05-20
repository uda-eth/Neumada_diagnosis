import React from 'react';

interface MalyLogoProps {
  className?: string;
  color?: string;
}

export const MalyLogo: React.FC<MalyLogoProps> = ({ className = "", color = "currentColor" }) => {
  return (
    <div className={className}>
      <img 
        src="/attached_assets/53d65bf9-c361-49a1-86ea-7341b9288320-removebg-preview.png" 
        alt="Maly Logo" 
        className="object-contain w-full h-full" 
        style={{ 
          maxWidth: '300px', 
          minWidth: '240px',
          filter: `brightness(0) invert(${color === 'currentColor' ? 1 : 0})` 
        }}
      />
    </div>
  );
};