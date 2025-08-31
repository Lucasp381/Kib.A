"use client";
import localFont from "next/font/local";
import "./globals.css";
import { Switch } from "@/components/ui/switch";
import { Home, Settings, Send, History} from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { MenuButton } from "@/components/menu/menuButton";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton"; // ajoute ça en haut
import  Custom503  from "@/components/errorsPages/503"

import WorkerControl from "@/components/worker/WorkerControl";
import Link from "next/link";

const geistSans = localFont({
  src: [
    {
      path: "../fonts/Geist/static/Geist-Medium.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Geist/static/Geist-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: [
    {
      path: "../fonts/Geist_Mono/static/GeistMono-Medium.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Geist_Mono/static/GeistMono-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
});

const menuItems = [
  { href: "/", label: "Dashboard", icon: <Home className="w-5 h-5 fill-main-500" /> },
  //{ href: "/alerts", label: "Alerts", icon: <Bell className="w-5 h-5 fill-main-500" /> },
  //{ href: "/rules", label: "Rules", icon: <Cctv className="w-5 h-5 fill-main-500" /> },
  { href: "/alerters", label: "Alerters", icon: <Send className="w-5 h-5 fill-main-500" /> },
  { href: "/history", label: "History", icon: <History className="w-5 h-5 fill-main-500" /> },
  { href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5 fill-main-500" /> },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const [esStatus, setEsStatus] = useState<{ status: string } | null>(null);
  const [kibanaStatus, setKibanaStatus] = useState<{ status: { overall: { level: string } } } | null>(null);
  const [esError, setEsError] = useState<string >("");
  const [kibanaError, setKibanaError] = useState<string >("");
  useEffect(() => {
    const fetchEsStatus = async () => {
      try {
        const response = await fetch("/api/elastic/status");
        const data = await response.json();
        setEsStatus(data);
        if (!data.status) {
          setEsError(data.error || "");
        }
      } catch (error) {
        setEsError((error as Error).message);
        console.log("Es error:", (error as Error).message);
      }

    };
    const fetchKibanaStatus = async () => {
      try {
        const response = await fetch("/api/kibana/status");
        const data = await response.json();
        setKibanaStatus(data);
        if (!data.status) {
          setKibanaError(data.error == "This operation was aborted" ? "Kibana doesn't answer in time" : data.error);
        }

      } catch (error) {
        console.error("Error fetching Kibana status:", error);
        
        setKibanaError((error as Error).message);
        console.log("Kibana error:", error);
      }
    };
    fetchKibanaStatus();
    fetchEsStatus();

  }, []);

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
      <body className="bg-card text-foreground antialiased  overflow-hidden ">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="grid grid-rows-[auto,1fr]  ">
            {/* Header en haut, sur toute la largeur */}
            <header className="sticky top-0 z-50 col-span-2 flex items-center justify-between bg-card border-b border-main-200 dark:border-main-700 p-4 shadow-md">
              {showLabel && (

                <Card className="grid grid-cols-3 w-full items-center border-main-200 dark:border-main-700 shadow-none border-none py-0">
                  <Link className="inline items-center gap-2" href="/">
                    <h1 className="font-extrabold text-4xl text-main-600 pl-10 ">
                      Kib.<span className="text-red-600">A</span>
                    </h1>
                    <small className="flex text-sm text-muted-foreground  pl-10">
                      Kibana Alerters Management
                    </small>
                  </Link>
                  <div className="flex items-center justify-center gap-2">
                    <WorkerControl />
                  </div>
                  <div className="gap-2 justify-items-end">
                    <div className="grid grid-cols-2 items-center">
                      <small className="text-sm text-main-600 font-bold first-letter:text-red-600">Elastic</small>
                      {esStatus ? (
                          <span className=" flex items-center justify-center">
                            {esStatus?.status === "green" ? (
                              <span className=" bg-green-500 size-3 rounded-full border-1 m-0 p-0" />
                            ) : esStatus?.status === "yellow" ? (
                              <span className=" bg-yellow-500 size-3 rounded-full border-1 m-0 p-0" />
                            ) : (
                              <span className=" bg-red-500 size-3 rounded-full border-1 m-0 p-0" />
                            )}
                          </span>
                        ) : (
                          <span className=" flex items-center justify-center">
                            <span className=" bg-main-500 size-3 rounded-full border-1 m-0 p-0" />
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 items-center ">
                        <div className="text-sm font-bold text-main-600 first-letter:text-red-600">Kibana</div>
                        {kibanaStatus ? (
                          <span className="flex items-center justify-center">
                            {kibanaStatus?.status?.overall?.level === "available" ? (
                              <span className="bg-green-500  size-3 rounded-full border inline-block" />
                            ) : kibanaStatus?.status?.overall?.level === "degraded" ? (
                              <span className="bg-yellow-500 size-3 rounded-full border inline-block" />
                            ) : (
                              <span className="bg-red-500 size-3 rounded-full border inline-block" />
                            )}
                          </span>
                        ) : (
                          <span className=" flex items-center justify-center">
                            <div className=" bg-main-500 size-3 rounded-full border-1 m-0 p-0" />
                          </span>
                        )}
                      </div>
                    </div>
                </Card>
              )}
            </header>

            {/* Si status kibana ou elastic red, on affiche rien */}
            {esStatus === null || kibanaStatus === null ? (
              <div className="w-screen h-screen flex flex-col items-center justify-center gap-4">
                <Skeleton className="w-[80%] h-[50%] rounded-xl" />
                <Skeleton className="w-[80%] h-80 rounded-xl" />
              </div>
            ) :  esStatus?.status !== "green" && esStatus?.status !== "yellow" || kibanaStatus?.status?.overall?.level !== "available"  ? (
              <Custom503 error={[esError, kibanaError]} />
            ) : (
              <div className="grid col-span-2 grid-cols-[auto_1fr] h-[calc(100vh-93px)]">
                {/* Sidebar + children */}
                <Card
                  className="border-none bg-card shadow-none flex flex-col col-1 justify-between "
                  style={{ width: menuWidth }}
                >
                  <div className={"menu flex flex-col gap-1 " + (showLabel ? "items-start" : "items-center")}>
                    {menuItems.map((item) => (
                      <MenuButton key={item.href} href={item.href} icon={item.icon} active={pathname === item.href}>
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

                <main className="h-[calc(100vh-93px)] overflow-y-auto pb-5">
                  {children}
                  <Toaster richColors position="top-center" />
                </main>
              </div>
            )}



          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
