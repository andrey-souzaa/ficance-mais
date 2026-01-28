"use client";

import { useFinance } from "@/lib/finance-context";
import { Landmark, TrendingUp, Building2 } from "lucide-react";

export function AccountsCards() {
  const { accounts, isVisible } = useFinance();

  // Formatador que respeita a privacidade
  const formatMoney = (val: number) => {
    if (!isVisible) return "••••";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  // Estado vazio
  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-zinc-400 space-y-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Landmark className="h-5 w-5 opacity-50" />
        </div>
        <p className="text-xs">Nenhuma conta adicionada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {accounts.map((acc) => (
        <div 
          key={acc.id} 
          // CORREÇÃO: Cores dinâmicas (Light: bg-zinc-50 / Dark: bg-zinc-900)
          className="group flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
        >
          {/* Lado Esquerdo: Ícone e Nome */}
          <div className="flex items-center gap-3">
            {/* Ícone Minimalista */}
            <div className="h-10 w-10 rounded-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-white transition-colors">
              {acc.name.toLowerCase().includes('nu') ? (
                <span className="font-bold text-purple-600 dark:text-purple-500">Nu</span>
              ) : acc.name.toLowerCase().includes('inter') ? (
                <span className="font-bold text-orange-600 dark:text-orange-500">In</span>
              ) : (
                <Building2 className="h-4 w-4" />
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                {acc.name}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                Conta Corrente
              </span>
            </div>
          </div>

          {/* Lado Direito: Saldo */}
          <div className="text-right">
             <span className="text-[10px] text-zinc-500 block mb-0.5">Saldo atual</span>
             <span className={`text-sm font-bold tracking-tight ${
                 isVisible 
                 ? (acc.balance >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500") 
                 : "text-zinc-400 tracking-widest"
             }`}>
                {formatMoney(acc.balance)}
             </span>
          </div>
        </div>
      ))}

      {/* Resumo Total Minimalista no Rodapé */}
      {accounts.length > 1 && (
          <div className="pt-3 mt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center px-2">
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Total em contas
              </span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-300">
                  {formatMoney(accounts.reduce((acc, curr) => acc + curr.balance, 0))}
              </span>
          </div>
      )}
    </div>
  );
}