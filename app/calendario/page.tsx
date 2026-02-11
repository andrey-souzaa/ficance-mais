"use client";

import { useState } from "react";
import { useFinance, Transaction } from "@/lib/finance-context";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarPage() {
  const { transactions, isVisible } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 1. Geração dos dias do calendário
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  // 2. Filtra transações do dia selecionado
  const selectedDayTransactions = transactions.filter(t => 
    isSameDay(new Date(t.date), selectedDate)
  );

  // 3. Cálculos do dia selecionado
  const dayIncome = selectedDayTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const dayExpense = selectedDayTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const formatMoney = (val: number) => {
    if (!isVisible) return "••••";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  // Navegação
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
      const now = new Date();
      setCurrentDate(now);
      setSelectedDate(now);
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto p-6 space-y-6 pb-20 text-zinc-900 dark:text-zinc-100">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                <CalendarIcon className="h-6 w-6 text-[#2940bb]" />
                Calendário Financeiro
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Visualize seus vencimentos e recebimentos.</p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-medium capitalize text-sm">
                {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CALENDÁRIO (GRID) */}
          <Card className="lg:col-span-2 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="p-4 md:p-6">
                {/* Dias da Semana */}
                <div className="grid grid-cols-7 mb-4">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid de Dias */}
                <div className="grid grid-cols-7 gap-2">
                    {days.map((day, dayIdx) => {
                        // Verifica se tem transações neste dia específico
                        const dayTrans = transactions.filter(t => isSameDay(new Date(t.date), day));
                        const hasIncome = dayTrans.some(t => t.type === 'income');
                        const hasExpense = dayTrans.some(t => t.type === 'expense');
                        const hasTransfer = dayTrans.some(t => t.type === 'transfer');

                        return (
                            <div 
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    min-h-[80px] md:min-h-[100px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between
                                    ${!isSameMonth(day, currentDate) ? 'opacity-30 bg-zinc-50/50 dark:bg-zinc-900/20 border-transparent' : ''}
                                    ${isSameDay(day, selectedDate) 
                                        ? 'border-[#2940bb] bg-blue-50 dark:bg-[#2940bb]/10 ring-1 ring-[#2940bb]' 
                                        : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`
                                        text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full
                                        ${isToday(day) ? 'bg-[#2940bb] text-white' : 'text-zinc-700 dark:text-zinc-300'}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                {/* Indicadores (Bolinhas) */}
                                <div className="flex gap-1 mt-2 flex-wrap">
                                    {hasIncome && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>}
                                    {hasExpense && <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>}
                                    {hasTransfer && <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
                        Voltar para Hoje
                    </Button>
                </div>
            </CardContent>
          </Card>

          {/* DETALHES DO DIA (SIDEBAR) */}
          <div className="space-y-4">
              <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm h-full">
                  <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 pb-4">
                      <CardTitle className="text-lg flex items-center justify-between">
                          <span>{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
                          <span className="text-xs font-normal text-zinc-500 capitalize">{format(selectedDate, "eeee", { locale: ptBR })}</span>
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                      
                      {/* Resumo do Dia */}
                      <div className="grid grid-cols-2 gap-px bg-zinc-100 dark:bg-zinc-800">
                          <div className="bg-white dark:bg-zinc-950 p-4 text-center">
                              <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Entradas</p>
                              <p className="text-emerald-600 dark:text-emerald-500 font-bold">{formatMoney(dayIncome)}</p>
                          </div>
                          <div className="bg-white dark:bg-zinc-950 p-4 text-center">
                              <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Saídas</p>
                              <p className="text-red-600 dark:text-red-500 font-bold">{formatMoney(dayExpense)}</p>
                          </div>
                      </div>

                      {/* Lista de Itens */}
                      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                          {selectedDayTransactions.length === 0 ? (
                              <div className="text-center py-10 text-zinc-400">
                                  <p className="text-sm">Nenhuma movimentação</p>
                                  <p className="text-xs">Neste dia.</p>
                              </div>
                          ) : (
                              selectedDayTransactions.map(t => (
                                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                      <div className="flex items-center gap-3">
                                          <div className={`
                                              h-8 w-8 rounded-full flex items-center justify-center shrink-0
                                              ${t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 
                                                t.type === 'expense' ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500' :
                                                'bg-blue-100 dark:bg-[#2940bb]/10 text-[#2940bb]'}
                                          `}>
                                              {t.type === 'income' ? <ArrowUpCircle className="h-4 w-4" /> : 
                                               t.type === 'expense' ? <ArrowDownCircle className="h-4 w-4" /> :
                                               <ArrowRightLeft className="h-4 w-4" />}
                                          </div>
                                          <div className="overflow-hidden">
                                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate w-[120px]">{t.description}</p>
                                              <p className="text-[10px] text-zinc-500 truncate">{t.category}</p>
                                          </div>
                                      </div>
                                      <span className={`text-sm font-bold ${
                                          t.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 
                                          t.type === 'expense' ? 'text-red-600 dark:text-red-500' :
                                          'text-[#2940bb]'
                                      }`}>
                                          {formatMoney(t.amount)}
                                      </span>
                                  </div>
                              ))
                          )}
                      </div>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
}