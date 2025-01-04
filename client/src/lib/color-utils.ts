import { hslToHex, hexToHSL, adjustHue, adjustLightness, adjustSaturation } from "./color-transformations";

interface ColorPalette {
  primary: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  ring: string;
}

export function generateColorPalette(primaryColor: string, mode: 'light' | 'dark'): ColorPalette {
  // Convert primary color to HSL for easier manipulation
  const { h, s, l } = hexToHSL(primaryColor);
  
  if (mode === 'light') {
    return {
      primary: primaryColor,
      background: hslToHex(h, s * 0.1, 98), // Very light background
      foreground: hslToHex(h, s * 0.8, 4), // Near black text
      card: hslToHex(h, s * 0.1, 100),
      cardForeground: hslToHex(h, s * 0.8, 4),
      popover: hslToHex(h, s * 0.1, 100),
      popoverForeground: hslToHex(h, s * 0.8, 4),
      accent: hslToHex(h, s * 0.4, 96),
      accentForeground: hslToHex(h, s * 0.8, 11),
      muted: hslToHex(h, s * 0.4, 96),
      mutedForeground: hslToHex(h, s * 0.16, 47),
      border: hslToHex(h, s * 0.32, 91),
      ring: hslToHex(h, s * 0.8, 4),
    };
  } else {
    return {
      primary: hslToHex(h, s * 0.4, 98), // Lighter primary for dark mode
      background: hslToHex(h, s * 0.8, 5), // Very dark background
      foreground: hslToHex(h, s * 0.4, 98), // Light text
      card: hslToHex(h, s * 0.8, 5),
      cardForeground: hslToHex(h, s * 0.4, 98),
      popover: hslToHex(h, s * 0.8, 5),
      popoverForeground: hslToHex(h, s * 0.4, 98),
      accent: hslToHex(h, s * 0.32, 17),
      accentForeground: hslToHex(h, s * 0.4, 98),
      muted: hslToHex(h, s * 0.32, 17),
      mutedForeground: hslToHex(h, s * 0.2, 65),
      border: hslToHex(h, s * 0.32, 17),
      ring: hslToHex(h, s * 0.27, 84),
    };
  }
}

export function generateThemeCSS(palette: ColorPalette): string {
  return `
    --background: ${palette.background};
    --foreground: ${palette.foreground};
    --card: ${palette.card};
    --card-foreground: ${palette.cardForeground};
    --popover: ${palette.popover};
    --popover-foreground: ${palette.popoverForeground};
    --primary: ${palette.primary};
    --primary-foreground: ${palette.foreground};
    --secondary: ${palette.accent};
    --secondary-foreground: ${palette.accentForeground};
    --muted: ${palette.muted};
    --muted-foreground: ${palette.mutedForeground};
    --accent: ${palette.accent};
    --accent-foreground: ${palette.accentForeground};
    --border: ${palette.border};
    --ring: ${palette.ring};
  `;
}
