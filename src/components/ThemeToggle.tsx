'use client';

import { MoonStar, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { isDark, toggleTheme, ready } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      aria-label="Toggle color theme"
    >
      {ready ? (
        <>
          {isDark ? (
            <>
              <Sun className="h-4 w-4" />
              Light
            </>
          ) : (
            <>
              <MoonStar className="h-4 w-4" />
              Dark
            </>
          )}
        </>
      ) : (
        <>
          <MoonStar className="h-4 w-4 animate-pulse" />
          Theme
        </>
      )}
    </button>
  );
}
