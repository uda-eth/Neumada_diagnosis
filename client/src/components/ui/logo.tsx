interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 400 120"
      className={`${className}`}
      style={{
        fill: '#ffffff' // Fixed white color for dark theme
      }}
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{
          fontFamily: "'Arial', sans-serif",
          fontSize: "72px",
          fontWeight: "lighter",
          letterSpacing: "0.2em",
        }}
      >
        M Ā L Y
      </text>
    </svg>
  );
}