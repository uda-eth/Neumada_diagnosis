import { useTheme } from "@/lib/theme-provider";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  const { theme } = useTheme();

  return (
    <svg
      viewBox="0 0 400 120"
      className={`${className} transition-colors duration-200`}
      style={{
        fill: theme === 'light' ? '#000000' : '#ffffff'
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