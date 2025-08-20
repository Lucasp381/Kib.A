"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Switch } from "@/components/ui/switch";
import { Home, Bell, Settings, Send, Cctv } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { MenuButton } from "@/components/menu/menuButton";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const menuItems = [
  { href: "/", label: "Dashboard", icon: <Home className="w-5 h-5 fill-main-500" /> },
  //{ href: "/alerts", label: "Alerts", icon: <Bell className="w-5 h-5 fill-main-500" /> },
  //{ href: "/rules", label: "Rules", icon: <Cctv className="w-5 h-5 fill-main-500" /> },
  { href: "/alerters", label: "Alerters", icon: <Send className="w-5 h-5 fill-main-500" /> },
  { href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5 fill-main-500" /> },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    setScreenWidth(window.innerWidth);
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function toggleDarkMode() {
    setDark((d) => {
      if (typeof window !== "undefined") {
        document.documentElement.classList.toggle("dark", !d);
      }
      return !d;
    });
  }

  const showLabel = screenWidth >= 768; // md breakpoint
  const menuWidth = showLabel ? "250px" : "100px";

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="bg-card text-foreground antialiased  overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="grid grid-rows-[auto,1fr]  ">
            {/* Header en haut, sur toute la largeur */}
            <header className="sticky top-0 z-50 col-span-2 flex items-center justify-between bg-card border-b border-gray-200 dark:border-gray-700 p-4 shadow-md">
              {showLabel && (
                <div className="inline items-center gap-2">
                  <h1 className="font-extrabold text-4xl text-main-600 ml-20">
                    Kib.<span className="text-red-600">A</span>
                  </h1>
                  <small className="flex ml-20 text-sm text-muted-foreground">
                    Kibana Alert Management  
                  </small>
                </div>
              )}
            </header>

            {/* Ligne principale : menu + contenu */}
            <div className="grid col-span-2 grid-cols-[auto_1fr] h-[calc(100vh-93px)]">
              {/* Sidebar */}
              <Card
                className="border-none bg-card shadow-none flex flex-col col-1 justify-between "
                style={{ width: menuWidth }}
              >
                <div className={"menu flex flex-col gap-1 " + (showLabel ? "items-start" : "items-center")}>
                  {menuItems.map((item) => (
                    <MenuButton
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      active={pathname === item.href}
                    >
                      {showLabel && <span className="font-medium">{item.label}</span>}
                    </MenuButton>
                  ))}
                </div>
                <div className="mb-5 px-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Switch id="switchTheme" onClick={toggleDarkMode} />
                    <Label htmlFor="switchTheme">{dark ? "🌞" : "🌙"}</Label>
                  </div>
                </div>
              </Card>

              {/* Contenu principal */}
              <main className="h-[calc(100vh-93px)] overflow-y-auto">
                {children}
                <Toaster richColors position="top-center" />
              </main>
            </div>
          </div>

        </ThemeProvider>
      </body>
    </html>
  );
}
