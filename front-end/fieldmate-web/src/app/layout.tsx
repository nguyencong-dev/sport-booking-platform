import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import { AppFooter } from "@/components/Footer/AppFooter";
import { Header } from "@/components/Header/Header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { GeolocationProvider } from "@/contexts/GeolocationContext";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FieldMate - Đặt sân thể thao",
  description: "Tìm kiếm và đặt sân thể thao thuận tiện cùng FieldMate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>
          <GeolocationProvider>
            <AuthProvider>
              <Header />
              {children}
              <AppFooter />
            </AuthProvider>
          </GeolocationProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
