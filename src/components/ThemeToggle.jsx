// src/components/ThemeToggle.jsx
import React, { useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js'; 

export default function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold
                 border-slate-200 bg-white text-slate-700 hover:bg-slate-100
                 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
