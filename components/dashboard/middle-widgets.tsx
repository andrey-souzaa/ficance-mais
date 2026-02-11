"use client";

import { useFinance } from "@/lib/finance-context";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, Wallet } from "lucide-react";
import { addDays, isAfter, isBefore, startOfDay, endOfDay, isSameDay } from "date-fns";

export function MiddleWidgets() {
  const { transactions, accounts, isVisible } = useFinance();

  const formatMoney = (val: number) => {
    if (!isVisible) return "••••";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const today = startOfDay(new Date());
  const next7Days = endOfDay(addDays(today, 7));
  const next30Days = endOfDay(addDays(today, 30));

  // --- 1. LÓGICA: CONTAS PRÓXIMAS (7 DIAS) ---
  const upcomingBills = transactions.filter(t => {
    const tDate = new Date(t.date);
    return (
        t.type === 'expense' && 
        t.status === 'pending' &&
        (isSameDay(tDate, today) || (isAfter(tDate, today) && isBefore(tDate, next7Days)))
    );
  });

  const upcomingTotal = upcomingBills.reduce((acc, t) => acc + t.amount, 0);
  const upcomingCount = upcomingBills.length;

  // --- 2. LÓGICA: PREVISÃO 30 DIAS ---
  const currentBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  
  const pendingIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'pending' && isAfter(new Date(t.date), today) && isBefore(new Date(t.date), next30Days))
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'pending' && !t.cardId && isAfter(new Date(t.date), today) && isBefore(new Date(t.date), next30Days))
    .reduce((acc, t) => acc + t.amount, 0);

  const forecast = currentBalance + pendingIncome - pendingExpense;
  const isPositive = forecast >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WIDGET 1: A VENCER (Agora AZUL) */}
        <Card className="h-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 relative overflow-hidden group hover:border-[#2940bb]/30 transition-all shadow-sm">
            {/* Barra lateral azul */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#2940bb]"></div>
            
            <CardContent className="p-6 flex items-center justify-between h-full">
                <div className="flex items-center gap-4">
                    {/* Ícone azul */}
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-[#2940bb] shrink-0">
                        <Calendar className="h-6 w-6" />
                    </div>
                    
                    <div>
                        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">A Vencer (7 dias)</p>
                        <div className="flex items-baseline gap-2">
                             <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {upcomingCount === 0 ? "Em dia" : formatMoney(upcomingTotal)}
                             </span>
                        </div>
                    </div>
                </div>

                <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${upcomingCount > 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-[#2940bb] border-blue-100 dark:border-blue-900/30' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}>
                    {upcomingCount === 0 ? (
                        <span className="flex items-center gap-1">0 <span className="hidden sm:inline">contas</span></span>
                    ) : (
                        <span className="flex items-center gap-1">{upcomingCount} <span className="hidden sm:inline">pendentes</span></span>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* WIDGET 2: PREVISÃO (Agora Preto/Neutro e barra Azul) */}
        <Card className="h-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 relative overflow-hidden hover:border-[#2940bb]/30 transition-all shadow-sm">
            {/* Barra lateral sempre azul ou neutra, sem vermelho */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#2940bb]"></div>
            
            <CardContent className="p-6 flex items-center justify-between h-full">
                <div className="flex items-center gap-4">
                    {/* Ícone sempre azul */}
                    <div className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 bg-blue-100 dark:bg-blue-900/20 text-[#2940bb]">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    
                    <div>
                        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Previsão (30d)</p>
                        <div className="flex items-baseline gap-2">
                             {/* Texto sempre preto/branco */}
                             <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {formatMoney(forecast)}
                             </span>
                        </div>
                    </div>
                </div>

                <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Estimado</span>
                </div>
            </CardContent>
        </Card>

    </div>
  );
}