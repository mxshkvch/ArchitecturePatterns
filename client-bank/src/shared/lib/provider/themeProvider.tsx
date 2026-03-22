import { createContext, useContext, useEffect, useState } from "react";
import { fetchSettings, updateSettings } from "../api/settings";

type Theme = "LIGHT" | "DARK";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  loading: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("LIGHT");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await fetchSettings();
        setTheme(settings.theme);
      } catch (e) {
        console.error("Ошибка загрузки темы", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === "LIGHT" ? "DARK" : "LIGHT";
    setTheme(newTheme);

    try {
      await updateSettings(newTheme, []);
    } catch (e) {
      console.error("Ошибка обновления темы", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};