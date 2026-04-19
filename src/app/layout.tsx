import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { AccessibilityWidget } from "@/components/AccessibilityWidget";
import { LunaFloatingButton } from "@/components/LunaFloatingButton";
import { OfflineSyncManager } from "@/components/OfflineSyncManager";
import CustomCursor from "@/components/CustomCursor";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap", // Added display: "swap" for better font loading
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Added display: "swap" for better font loading
});

export const metadata: Metadata = {
  title: "Lumiu | Calm AI Learning",
  description: "Sensory-safe, AI-powered learning for neurodivergent minds.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable}`}>
        <AccessibilityProvider>
          <OfflineSyncManager />
          <div className="stars"></div>
          <main className="main-content">
            {children}
          </main>
          <AccessibilityWidget />
          <LunaFloatingButton />
          <CustomCursor />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
