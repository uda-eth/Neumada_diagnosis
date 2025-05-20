import { MalyLogo } from './maly-logo';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <MalyLogo className={className} />
  );
}