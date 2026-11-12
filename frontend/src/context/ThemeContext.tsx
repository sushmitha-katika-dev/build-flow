import React, { useEffect, useState, useCallback } from 'react';
import { ThemeContext, type ThemeMode } from './themeStore';

const readStoredTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const applyThemeToDom = (mode: ThemeMode) => {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(readStoredTheme);

  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const next: ThemeMode = e.newValue === 'dark' ? 'dark' : 'light';
        setThemeState(next);
      }
    };

    const observer = new MutationObserver(() => {
      const domIsDark = document.documentElement.classList.contains('dark');
      setThemeState((prev) => {
        const next: ThemeMode = domIsDark ? 'dark' : 'light';
        return prev === next ? prev : next;
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    window.addEventListener('storage', handleStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    try {
      localStorage.setItem('theme', mode);
    } catch {
      // Ignore storage access restrictions
    }
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
