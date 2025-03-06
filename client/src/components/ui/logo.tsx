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
        d="M120 30 L130 30 L140 60 L150 30 L160 30 L170 60 L180 30 L190 30 L175 70 L165 70 L155 40 L145 70 L135 70 L120 30Z"
        fill="currentColor"
      />

      {/* A without middle line */}
      <path
        d="M200 70 L210 30 L230 30 L240 70 L230 70 L227 60 L213 60 L210 70 L200 70Z M215 50 L225 50 L220 35 L215 50Z"
        fill="currentColor"
      />

      {/* L */}
      <path
        d="M250 30 L260 30 L260 60 L280 60 L280 70 L250 70 L250 30Z"
        fill="currentColor"
      />

      {/* Y */}
      <path
        d="M290 30 L300 30 L310 50 L320 30 L330 30 L315 55 L315 70 L305 70 L305 55 L290 30Z"
        fill="currentColor"
      />
    </svg>
  );
}