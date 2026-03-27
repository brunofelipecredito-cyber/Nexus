import React, { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";

type ThemeConfig = {
  primaryColor: string;
  isDark: boolean;
  radius: string;
};

const defaultConfig: ThemeConfig = {
  primaryColor: "221 83% 53%", // Default blue
  isDark: true,
  radius: "0.75rem",
};

type ThemeContextType = {
  config: ThemeConfig;
  setConfig: (config: ThemeConfig) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  config: defaultConfig,
  setConfig: () => null,
});

export const useThemeConfig = () => useContext(ThemeContext);

export function ThemeConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useLocalStorage<ThemeConfig>("nexus-theme-config", defaultConfig);

  useEffect(() => {
    const root = document.documentElement;
    if (config.isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply primary color (requires conversion to HSL variables expected by our CSS)
    // We expect primaryColor to be in format "H S% L%"
    root.style.setProperty("--primary", config.primaryColor);
    root.style.setProperty("--ring", config.primaryColor);
    root.style.setProperty("--sidebar-primary", config.primaryColor);
    root.style.setProperty("--sidebar-ring", config.primaryColor);
    
    root.style.setProperty("--radius", config.radius);

  }, [config]);

  return (
    <ThemeContext.Provider value={{ config, setConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}
