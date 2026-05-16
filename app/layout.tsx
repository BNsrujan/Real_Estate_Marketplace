export const dynamic = "force-static";

import { Manrope, Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import ToastContainer from "@/shared/components/common/toast_container";
import GlobalLoginModal from "@/shared/components/common/global_login_modal";
import { Metadata } from "next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" ,  display: "swap",
  preload: false,});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
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
    <html
      lang="en"
      className={cn(
        manrope.variable,
        jakarta.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="antialiased">
        <SidebarProvider>
          <main>{children}</main>
        </SidebarProvider>
        <ToastContainer />
        <GlobalLoginModal />
      </body>
    </html>
  );
}
