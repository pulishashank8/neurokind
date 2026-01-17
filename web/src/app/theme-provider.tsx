"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "calm-ocean" | "space-night";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("calm-ocean");
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Check localStorage first
    const savedTheme = localStorage.getItem("neurokind-theme") as Theme | null;
    
    if (savedTheme && (savedTheme === "calm-ocean" || savedTheme === "space-night")) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Default to calm-ocean (sensory-friendly default)
      setTheme("calm-ocean");
      document.documentElement.setAttribute("data-theme", "calm-ocean");
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("neurokind-theme", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "calm-ocean" ? "space-night" : "calm-ocean"));
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
