import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });
  const [actualTheme, setActualTheme] = useState("light");

  useEffect(() => {
    const handleThemeChange = () => {
      let resolvedTheme = theme;
      if (theme === "system") {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      setActualTheme(resolvedTheme);
      document.documentElement.setAttribute("data-theme", resolvedTheme);
      document.documentElement.setAttribute("data-bs-theme", resolvedTheme === "light" ? "light" : "dark");
      if (document.body) {
        document.body.setAttribute("data-theme", resolvedTheme);
        document.body.className = `${resolvedTheme}-theme`;
      }
      localStorage.setItem("theme", theme);
    };

    handleThemeChange();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", handleThemeChange);
      return () => mediaQuery.removeEventListener("change", handleThemeChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    const order = ["light", "dark", "purple"];
    const currentIndex = order.indexOf(actualTheme);
    const nextIndex = (currentIndex + 1) % order.length;
    setTheme(order[nextIndex >= 0 ? nextIndex : 0]);
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
