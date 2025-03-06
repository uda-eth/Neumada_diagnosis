interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 400 120"
      className={`${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* M */}
      <path
        d="M80 30 L100 30 L120 90 L140 30 L160 30 L180 90 L200 30 L220 30 L190 100 L170 100 L140 40 L110 100 L90 100 L80 30Z"
        fill="currentColor"
      />

      {/* A without middle line - no horizontal bar */}
      <path
        d="M230 100 L240 30 L280 30 L290 100 L270 100 L265 80 L255 80 L250 100 L230 100Z M257 65 L263 65 L260 45 L257 65Z"
        fill="currentColor"
      />

      {/* L */}
      <path
        d="M300 30 L320 30 L320 80 L350 80 L350 100 L300 100 L300 30Z"
        fill="currentColor"
      />

      {/* Y */}
      <path
        d="M360 30 L380 30 L400 60 L420 30 L440 30 L410 70 L410 100 L390 100 L390 70 L360 30Z"
        fill="currentColor"
      />
    </svg>
  );
}