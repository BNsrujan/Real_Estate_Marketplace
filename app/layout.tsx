export const dynamic = "force-static";

import { Roboto } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { Toaster } from "@/shared/components/ui/sonner";
import GlobalLoginModal from "@/shared/components/common/global_login_modal";
import AuthInitializer from "@/shared/components/common/auth_initializer";
import { Metadata } from "next";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
  preload: false,
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Namma Dharani — Real Estate Marketplace",
  description: "Explore properties across Karnataka on an interactive globe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(roboto.variable)}>
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
