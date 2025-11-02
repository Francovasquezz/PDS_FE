import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext"; 
import { Toaster } from "@/components/ui/sonner"; // <-- 1. Importar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "eScrims TPO",
  description: "Plataforma de Scrims PDS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors /> {/* <-- 2. Añadir Toaster */}
          </AuthProvider>
          
        </ThemeProvider>
      </body>
    </html>
  );
}