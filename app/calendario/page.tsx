"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-context";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
  const { transactions } = useFinance();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // --- LÓGICA ---
  const getDayStatus = (day: Date) => {
    const dayTransactions = transactions.filter(t => isSameDay(parseISO(t.date), day));
    const hasIncome = dayTransactions.some(t => t.type === 'income');
    const hasExpense = dayTransactions.some(t => t.type === 'expense');
    const hasPendingBill = dayTransactions.some(t => t.type === 'expense' && t.status === 'pending');
    return { hasIncome, hasExpense, hasPendingBill };
  };

  const selectedTransactions = transactions.filter(t => 
    date && isSameDay(parseISO(t.date), date)
  );

  const dailyIncome = selectedTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const dailyExpense = selectedTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const dailyBalance = dailyIncome - dailyExpense;
  const pendingBills = selectedTransactions.filter(t => t.type === 'expense' && t.status === 'pending');

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const handlePreviousMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  return (
    // AJUSTE: max-w-5xl (aprox 1000px) deixa tudo bem mais estreito e centralizado
    <div className="flex flex-col md:flex-row gap-4 w-full max-w-5xl mx-auto p-4 justify-center items-start">
      
      {/* --- ESQUERDA: CALENDÁRIO PEQUENO --- */}
      {/* h-[520px] trava a altura para não esticar na tela inteira */}
      <Card className="flex-1 bg-zinc-950 border-zinc-800/60 shadow-2xl flex flex-col rounded-2xl overflow-hidden h-[520px]">
        <CardContent className="flex-1 flex flex-col p-4 h-full">
            
            {/* Cabeçalho Pequeno */}
            <div className="flex items-center justify-between mb-2 px-1 shrink-0">
                <Button onClick={handlePreviousMonth} variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all">
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <h2 className="text-base font-bold text-zinc-100 capitalize tracking-tight flex items-center gap-2">
                    {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </h2>

                <Button onClick={handleNextMonth} variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Calendário */}
            <div className="w-full flex-1 flex flex-col min-h-0"> 
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    locale={ptBR}
                    fixedWeeks 
                    showOutsideDays 
                    className="w-full h-full flex flex-col"
                    classNames={{
                        months: "w-full h-full flex flex-col",
                        month: "w-full h-full flex flex-col",
                        caption: "hidden", 
                        nav: "hidden",     
                        
                        table: "w-full h-full flex flex-col border-collapse",
                        head_row: "flex w-full mb-1 shrink-0 px-1",
                        // Fonte do cabeçalho bem pequena (text-[10px])
                        head_cell: "text-zinc-500 flex-1 text-[10px] font-medium uppercase tracking-widest text-center py-1",
                        
                        tbody: "flex-1 w-full flex flex-col gap-1 min-h-0", 
                        row: "flex w-full flex-1 gap-1 min-h-0",
                        
                        cell: "flex-1 relative p-0 text-center focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent",
                        
                        // DIA PEQUENO: text-xs e padding ajustado
                        day: "group h-full w-full rounded-lg border border-transparent hover:bg-zinc-900/50 transition-all flex flex-col items-center justify-start pt-1.5 gap-0.5 text-xs font-medium text-zinc-400 aria-selected:!bg-zinc-900 aria-selected:!text-white aria-selected:!border-zinc-700 aria-selected:shadow-none",
                        
                        day_outside: "opacity-10 text-zinc-800",
                        day_disabled: "opacity-10",
                        day_hidden: "invisible",
                    }}
                    components={{
                         // @ts-ignore
                        DayContent: (props: any) => {
                            const { hasIncome, hasExpense, hasPendingBill } = getDayStatus(props.date);
                            return (
                                <div className="flex flex-col items-center w-full h-full">
                                    <span className="leading-none mb-0.5">{format(props.date, "d")}</span>
                                    
                                    {/* Pontos Minúsculos (w-1 h-1) */}
                                    <div className="flex gap-0.5 h-1 items-center justify-center">
                                        {hasIncome && <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_2px_rgba(16,185,129,0.8)]" title="Receita" />}
                                        {hasExpense && <div className="h-1 w-1 rounded-full bg-red-500 shadow-[0_0_2px_rgba(239,68,68,0.8)]" title="Despesa" />}
                                        {hasPendingBill && <div className="h-1 w-1 rounded-full bg-yellow-500 shadow-[0_0_2px_rgba(234,179,8,0.8)]" title="Conta Pendente" />}
                                    </div>
                                </div>
                            );
                        }
                    }}
                />
            </div>
            
             {/* Legenda Minimalista */}
             <div className="mt-2 pt-2 border-t border-zinc-900 flex justify-center gap-4 text-[9px] font-bold uppercase tracking-wider text-zinc-600 shrink-0">
                <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500"></div> Ent</div>
                <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-red-500"></div> Sai</div>
                <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-yellow-500"></div> Pen</div>
            </div>
        </CardContent>
      </Card>

      {/* --- DIREITA: DETALHES --- */}
      {/* Largura reduzida para 320px e altura travada igual ao calendário (h-[520px]) */}
      <div className="w-full md:w-[320px] h-[520px]">
        <Card className="bg-zinc-950 border-zinc-800/60 shadow-2xl flex flex-col h-full overflow-hidden rounded-2xl">
            <CardHeader className="py-4 px-4 border-b border-zinc-800/40 bg-zinc-900/10 shrink-0">
                {date ? (
                    <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Selecionado</span>
                        <CardTitle className="flex items-center gap-2 text-white text-sm capitalize font-medium">
                            {format(date, "EEEE, d 'de' MMM", { locale: ptBR })}
                        </CardTitle>
                    </div>
                ) : (
                    <CardTitle className="flex items-center gap-2 text-white text-sm">
                        <CalendarIcon className="h-4 w-4 text-yellow-500" />
                        Selecione
                    </CardTitle>
                )}
            </CardHeader>

            <CardContent className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar">
                {!date ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2 text-center">
                        <CalendarIcon className="h-8 w-8 opacity-10" />
                        <p className="text-[10px] text-zinc-500">Selecione uma data.</p>
                    </div>
                ) : (
                    <>
                        {/* Resumo Compacto */}
                        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-lg p-3 space-y-2 shrink-0">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500 font-medium text-[10px]">Saldo</span>
                                <span className={`text-base font-bold ${dailyBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {formatMoney(dailyBalance)}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-zinc-950/50 border border-zinc-800/30 rounded-md p-2 flex flex-col group">
                                    <span className="text-[8px] text-zinc-500 group-hover:text-emerald-500 font-bold uppercase mb-0.5 flex items-center gap-1 transition-colors">
                                        <TrendingUp className="h-2.5 w-2.5" /> Ent
                                    </span>
                                    <div className="text-xs font-semibold text-emerald-500">{formatMoney(dailyIncome)}</div>
                                </div>
                                <div className="bg-zinc-950/50 border border-zinc-800/30 rounded-md p-2 flex flex-col group">
                                    <span className="text-[8px] text-zinc-500 group-hover:text-red-500 font-bold uppercase mb-0.5 flex items-center gap-1 transition-colors">
                                        <TrendingDown className="h-2.5 w-2.5" /> Sai
                                    </span>
                                    <div className="text-xs font-semibold text-red-500">{formatMoney(dailyExpense)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Botões Pequenos */}
                        <div className="grid grid-cols-2 gap-2 shrink-0">
                            <Button variant="outline" className="border-zinc-800 bg-transparent hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50 text-zinc-300 font-medium h-8 rounded-md transition-all text-[10px]">
                                <ArrowUpCircle className="h-3 w-3 mr-1.5" /> Receita
                            </Button>
                            <Button variant="outline" className="border-zinc-800 bg-transparent hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 text-zinc-300 font-medium h-8 rounded-md transition-all text-[10px]">
                                <ArrowDownCircle className="h-3 w-3 mr-1.5" /> Despesa
                            </Button>
                        </div>

                        {/* Lista de Contas */}
                        <div className="flex-1 min-h-[100px]">
                            <h3 className="font-medium text-zinc-400 mb-2 flex items-center gap-1.5 text-[10px] sticky top-0 bg-zinc-950 pb-2 z-10">
                                <AlertCircle className="h-3 w-3 text-yellow-500" />
                                Contas ({pendingBills.length})
                            </h3>
                            
                            {pendingBills.length === 0 ? (
                                <div className="py-4 text-center border border-zinc-800/30 border-dashed rounded-lg bg-zinc-900/10">
                                    <p className="text-zinc-600 text-[10px]">Nada pendente.</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5 pb-2">
                                    {pendingBills.map((bill) => (
                                        <div key={bill.id} className="flex items-center justify-between p-2 bg-zinc-900/30 border border-zinc-800/40 rounded-md hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer group">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-zinc-300 text-[10px] group-hover:text-white transition-colors truncate max-w-[120px]">{bill.description}</span>
                                                <Badge variant="outline" className="w-fit mt-0.5 text-[7px] h-3 px-1 text-yellow-600 border-yellow-600/20 bg-yellow-500/5 font-normal">
                                                    Pendente
                                                </Badge>
                                            </div>
                                            <span className="font-semibold text-[10px] text-zinc-400 group-hover:text-zinc-200 transition-colors">{formatMoney(bill.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}   