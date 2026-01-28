import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FinanceProvider } from "@/lib/finance-context";
import { AppSidebar } from "@/components/layout/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance+",
  description: "Gestão Financeira Inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        // CORREÇÃO: Força o background dinâmico no corpo da página
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <FinanceProvider>
          <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
          </div>
        </FinanceProvider>
      </body>
    </html>
  );
}