export const dynamic = "force-static";

import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { Toaster } from "@/shared/components/ui/sonner";
import GlobalLoginModal from "@/shared/components/common/global_login_modal";
import AuthInitializer from "@/shared/components/common/auth_initializer";
import { Metadata } from "next";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e0d0b",
};

export const metadata: Metadata = {
  title: "Namma Dharani — Land & Property Register",
  description:
    "Survey, compare and enquire on land and property across Karnataka on an interactive map.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(newsreader.variable, plexSans.variable, plexMono.variable)}
    >
      <body className="antialiased relative w-full h-screen">
        <TooltipProvider>
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="lazyOnload"
          />
          <SidebarProvider>
            <main>{children}</main>
          </SidebarProvider>
          <AuthInitializer />
          <Toaster />
          <GlobalLoginModal />
        </TooltipProvider>
      </body>
    </html>
  );
}
