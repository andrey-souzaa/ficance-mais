"use client";

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, WalletCards } from "lucide-react";
import { AppSidebar } from "./app-sidebar"; // Vamos reutilizar o conteúdo da sidebar
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Calendar,
  CreditCard,
  Target,
  BarChart3,
  Wallet,
  Settings
} from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between p-4 border-b border-zinc-900 bg-black xl:hidden sticky top-0 z-50">
      
      {/* 1. Logo Mobile */}
      <div className="flex items-center gap-2">
         <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center text-black">
            <WalletCards className="h-5 w-5" />
         </div>
         <span className="font-bold text-white tracking-tight">Finance+</span>
      </div>

      {/* 2. Botão Menu (Abre a Sheet) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        
        {/* Conteúdo do Menu (Gaveta) */}
        <SheetContent side="left" className="bg-black border-zinc-900 p-0 w-72 text-zinc-100">
            <SheetHeader className="p-6 text-left border-b border-zinc-900/50">
                <SheetTitle className="text-white flex items-center gap-2">
                    <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center text-black">
                        <WalletCards className="h-5 w-5" />
                    </div>
                    Finance+
                </SheetTitle>
            </SheetHeader>
            
            {/* Lista de Links (Replicada para Mobile) */}
            <nav className="flex flex-col gap-1 p-4">
                <MobileNavItem href="/" icon={LayoutDashboard} label="Dashboard" isActive={pathname === "/"} onClick={() => setOpen(false)} />
                <MobileNavItem href="/transacoes" icon={ArrowRightLeft} label="Transações" onClick={() => setOpen(false)} />
                <MobileNavItem href="/calendario" icon={Calendar} label="Calendário" onClick={() => setOpen(false)} />
                <MobileNavItem href="/contas" icon={CreditCard} label="Gestão de Contas" onClick={() => setOpen(false)} />
                <MobileNavItem href="/metas" icon={Target} label="Metas" onClick={() => setOpen(false)} />
                <MobileNavItem href="/relatorios" icon={BarChart3} label="Relatórios" onClick={() => setOpen(false)} />
                <MobileNavItem href="/minhas-contas" icon={Wallet} label="Minhas Contas" onClick={() => setOpen(false)} />
                <div className="h-px bg-zinc-900 my-2 mx-2"></div>
                <MobileNavItem href="/configuracoes" icon={Settings} label="Configurações" onClick={() => setOpen(false)} />
            </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MobileNavItem({ href, icon: Icon, label, isActive, onClick }: any) {
    return (
        <Link href={href} onClick={onClick}>
            <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-yellow-500 text-black font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            )}>
                <Icon className={cn("h-5 w-5", isActive ? "text-black" : "text-zinc-500")} />
                <span>{label}</span>
            </div>
        </Link>
    )
}