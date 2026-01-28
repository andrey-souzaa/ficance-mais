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
    // CORREÇÃO AQUI:
    // Removemos 'fixed left-0 top-0'
    // Adicionamos 'sticky top-0' e 'h-screen'
    <aside className="w-64 shrink-0 h-screen bg-black border-r border-zinc-900/50 flex flex-col p-4 hidden xl:flex sticky top-0">
      
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6 pl-2 mt-2">
         <div className="h-9 w-9 bg-yellow-500 rounded-xl flex items-center justify-center text-black shadow-lg shadow-yellow-500/10">
            <WalletCards className="h-5 w-5" />
         </div>
         <span className="text-lg font-bold text-white tracking-tight">Finance+</span>
      </div>

      {/* Ações Rápidas */}
      <div className="flex items-center gap-2 mb-6 pl-2">
          <Button variant="outline" size="icon" className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg h-9 w-9 transition-colors" title="Notificações">
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
        
        <div className="pt-4 mt-4 border-t border-zinc-900/50">
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
                  ? "bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.2)] font-semibold"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"
            )}>
                <Icon className={cn("h-4.5 w-4.5", isActive ? "text-black" : "text-zinc-500 group-hover:text-white")} />
                <span>{label}</span>
            </div>
        </Link>
    )
} 