"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Calendar,
  CreditCard,
  Target,
  BarChart3,
  Wallet,
  Settings,
  Bell,
  WalletCards
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    // ATUALIZADO: Cores dinâmicas (bg-white no claro / bg-black no escuro)
    <aside className="w-64 shrink-0 h-screen bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-900/50 flex flex-col p-4 hidden xl:flex sticky top-0 transition-colors duration-300">
      
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6 pl-2 mt-2">
         <div className="h-9 w-9 bg-[#2940bb] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <WalletCards className="h-5 w-5" />
         </div>
         {/* Texto Preto no Claro / Branco no Escuro */}
         <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Finance+</span>
      </div>

      {/* Ações Rápidas */}
      <div className="flex items-center gap-2 mb-6 pl-2">
          <Button variant="outline" size="icon" className="border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg h-9 w-9 transition-colors" title="Notificações">
              <Bell className="h-4 w-4" />
          </Button>
      </div>

      {/* Menu Principal */}
      <nav className="space-y-1.5 flex-1">
        <NavItem href="/" icon={LayoutDashboard} label="Dashboard" isActive={pathname === "/"} />
        <NavItem href="/transacoes" icon={ArrowRightLeft} label="Transações" isActive={pathname === "/transacoes"} />
        <NavItem href="/calendario" icon={Calendar} label="Calendário" isActive={pathname === "/calendario"} />
        <NavItem href="/contas" icon={CreditCard} label="Contas a Pagar" isActive={pathname === "/contas"} />
        <NavItem href="/metas" icon={Target} label="Metas" isActive={pathname === "/metas"} />
        <NavItem href="/relatorios" icon={BarChart3} label="Relatórios" isActive={pathname === "/relatorios"} />
        <NavItem href="/minhas-contas" icon={Wallet} label="Minhas Contas" isActive={pathname === "/minhas-contas"} />
        
        <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-900/50">
            <NavItem href="/configuracoes" icon={Settings} label="Configurações" isActive={pathname === "/configuracoes"} />
        </div>
      </nav>
    </aside>
  );
}

function NavItem({ href, icon: Icon, label, isActive }: { href: string; icon: any; label: string; isActive?: boolean }) {
    return (
        <Link href={href}>
            <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                isActive
                  // ATIVO: Azul Forte + Texto Branco
                  ? "bg-[#2940bb] text-white shadow-md font-bold"
                  // INATIVO: Hover cinza claro no modo light / cinza escuro no dark
                  : "text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
            )}>
                <Icon className={cn("h-4.5 w-4.5", isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white")} />
                <span>{label}</span>
            </div>
        </Link>
    )
}