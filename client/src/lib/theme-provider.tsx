import { createContext, useContext, useEffect, useState } from "react";
import { generateColorPalette, generateThemeCSS } from "./color-utils";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_PRIMARY_COLOR = "#1f2937"; // A neutral gray as default

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "light"
  );
  const [primaryColor, setPrimaryColor] = useState(
    () => localStorage.getItem("primaryColor") || DEFAULT_PRIMARY_COLOR
  );

  useEffect(() => {
    const root = window.document.documentElement;
    const palette = generateColorPalette(primaryColor, theme);
    const css = generateThemeCSS(palette);

    // Apply the generated CSS variables
    root.style.cssText = css;

    // Apply theme class
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Save preferences
    localStorage.setItem("theme", theme);
    localStorage.setItem("primaryColor", primaryColor);
  }, [theme, primaryColor]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  };

  const updatePrimaryColor = (color: string) => {
    setPrimaryColor(color);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme,
      setPrimaryColor: updatePrimaryColor
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}