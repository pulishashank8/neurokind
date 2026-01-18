"use client";

import { useTheme } from "@/app/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors bg-transparent hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        // Moon SVG
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        // Sun SVG
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 10a1 1 0 100-2 1 1 0 000 2zm0 2a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM4.293 4.293a1 1 0 011.414 0L6.414 5.414a1 1 0 00-1.414-1.414L4.293 4.293zm11.414 0a1 1 0 011.414 1.414L16.414 6.414a1 1 0 11-1.414-1.414l1.414-1.414zM4 10a1 1 0 100-2 1 1 0 000 2zm12 0a1 1 0 100-2 1 1 0 000 2zM4.293 15.707a1 1 0 00-1.414 1.414L4.586 17a1 1 0 001.414-1.414l-1.707-1.293zm11.414 0a1 1 0 001.414 1.414l1.414-1.414a1 1 0 10-1.414-1.414l-1.414 1.414z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}
