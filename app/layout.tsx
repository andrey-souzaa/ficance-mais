import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FinanceProvider } from "@/lib/finance-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance+",
  description: "Dashboard Financeiro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased overflow-hidden`}>
        <FinanceProvider>
          <div className="flex h-screen w-full flex-col xl:flex-row">
            
            <MobileNav />
            
            {/* Sidebar é um item flex, ela empurra o conteúdo naturalmente */}
            <AppSidebar />
            
            {/* CORREÇÃO: Removi 'xl:pl-60'. Agora o conteúdo começa imediatamente após a sidebar. */}
            <main className="flex-1 overflow-y-auto bg-black p-4 md:p-8 w-full">
              {children}
            </main>
          </div>
        </FinanceProvider>
      </body>
    </html>
  );
}