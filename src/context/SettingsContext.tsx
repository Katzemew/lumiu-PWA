"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

export interface GlobalSettings {
  // Appearance
  theme: Theme;
  accentColor: string;
  fontScale: number;
  fontFamily: string;
  borderRadius: string;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  backgroundPattern: string;

  // Profile
  displayName: string;
  bio: string;
  learnerType: string;
  avatarId: string;
  email: string;
}

const defaultSettings: GlobalSettings = {
  theme: "light",
  accentColor: "#9D79FF",
  fontScale: 1.0,
  fontFamily: "chillax",
  borderRadius: "rounded",
  sidebarCollapsed: false,
  compactMode: false,
  backgroundPattern: "stars",
  
  displayName: "Sania",
  bio: "Learning one constellation at a time. Astrophysics · Maths · curious about everything else.",
  learnerType: "Visual Thinker",
  avatarId: "pixel-astronaut",
  email: "sania@lumiu.app"
};

interface SettingsContextType extends GlobalSettings {
  updateSettings: (partial: Partial<GlobalSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  
  useEffect(() => {
    const saved = localStorage.getItem("lumiu-global-settings");
    if (saved) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  const updateSettings = (partial: Partial<GlobalSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem("lumiu-global-settings", JSON.stringify(next));
      
      // Inject global CSS variables for architecture-wide styling
      if (typeof window !== "undefined") {
        document.documentElement.style.setProperty("--accent-color", next.accentColor);
        document.documentElement.style.setProperty("--app-theme", next.theme);
      }
      
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
