import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
   const [theme, setTheme] = useState(() => {
      const stored = localStorage.getItem("uv-theme");
      if (stored === "dark" || stored === "light") return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
   });

   useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("uv-theme", theme);
   }, [theme]);

   const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

   return (
      <ThemeContext.Provider value={{ theme, toggle }}>
         {children}
      </ThemeContext.Provider>
   );
}

export const useTheme = () => useContext(ThemeContext);
