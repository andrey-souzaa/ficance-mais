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
    <aside className="w-64 shrink-0 h-screen bg-white dark:bg-black border-r border-zinc-100 dark:border-zinc-900 flex flex-col hidden xl:flex sticky top-0 transition-colors duration-300">
      
      {/* HEADER / LOGO */}
      <div className="h-20 flex items-center px-6 mb-6">
         <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-[#2940bb] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                <WalletCards className="h-6 w-6" />
             </div>
             <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Finance+</span>
         </div>
      </div>

      {/* Ações Rápidas */}
      <div className="px-6 mb-6">
          <Button variant="outline" className="w-full justify-start gap-2 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              <Bell className="h-4 w-4" /> Notificações
          </Button>
      </div>

      {/* MENU PRINCIPAL */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Principal</p>
            <NavItem href="/" icon={LayoutDashboard} label="Dashboard" isActive={pathname === "/"} />
            <NavItem href="/transacoes" icon={ArrowRightLeft} label="Transações" isActive={pathname === "/transacoes"} />
            <NavItem href="/minhas-contas" icon={Wallet} label="Minhas Contas" isActive={pathname === "/minhas-contas"} />
            <NavItem href="/cartoes" icon={CreditCard} label="Meus Cartões" isActive={pathname === "/cartoes"} />
        </div>

        <div className="pt-4 space-y-1">
            <p className="px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Gestão</p>
            <NavItem href="/metas" icon={Target} label="Metas" isActive={pathname === "/metas"} />
            <NavItem href="/calendario" icon={Calendar} label="Calendário" isActive={pathname === "/calendario"} />
            <NavItem href="/relatorios" icon={BarChart3} label="Relatórios" isActive={pathname === "/relatorios"} />
        </div>
      </nav>

      {/* FOOTER - LINK NORMAL PARA PÁGINA */}
      <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-900">
        <NavItem href="/configuracoes" icon={Settings} label="Configurações" isActive={pathname === "/configuracoes"} />
      </div>
    </aside>
  );
}

function NavItem({ href, icon: Icon, label, isActive }: { href: string; icon: any; label: string; isActive?: boolean }) {
    return (
        <Link href={href}>
            <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                isActive
                  ? "bg-blue-50 dark:bg-[#2940bb]/10 text-[#2940bb] font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
            )}>
                <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-[#2940bb]" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300")} />
                <span>{label}</span>
            </div>
        </Link>
    )
}