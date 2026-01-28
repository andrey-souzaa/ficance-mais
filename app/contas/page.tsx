"use client";

import { useFinance, Transaction } from "@/lib/finance-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewTransactionDialog } from "@/components/dashboard/new-transaction-dialog"; 
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Repeat, 
  Star, 
  Plus,
  CreditCard,
  Wallet
} from "lucide-react";
import { format, isBefore, isToday, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ContasPage() {
  const { transactions, payTransaction } = useFinance();

  // 1. Filtrar apenas DESPESAS que estão PENDENTES (A Pagar)
  const pendingBills = transactions.filter(t => t.type === 'expense' && t.status === 'pending');

  // 2. Ordenar por data (mais antigas/urgentes primeiro)
  pendingBills.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const today = startOfDay(new Date());

  // 3. Agrupar por status de urgência
  const overdue = pendingBills.filter(t => isBefore(new Date(t.date), today));
  const dueToday = pendingBills.filter(t => isToday(new Date(t.date)));
  const upcoming = pendingBills.filter(t => isAfter(new Date(t.date), today));

  const formatMoney = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // --- COMPONENTE DO ITEM DA LISTA ---
  const BillItem = ({ transaction, statusColor, showDate = true }: { transaction: Transaction, statusColor: string, showDate?: boolean }) => {
    
    // Ícone de Recorrência (Estrela ou Repetição)
    let RecurrenceIcon = null;
    if (transaction.recurrence === 'fixed') RecurrenceIcon = <Repeat className="h-3 w-3 text-blue-400" />;
    if (transaction.recurrence === 'subscription') RecurrenceIcon = <Star className="h-3 w-3 text-purple-400" />;

    return (
      <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all group">
        <div className="flex items-center gap-4">
            {/* Box da Data */}
            {showDate && (
                <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg border bg-zinc-950 ${statusColor}`}>
                    <span className="text-[10px] uppercase font-bold opacity-70">
                        {format(new Date(transaction.date), "MMM", { locale: ptBR })}
                    </span>
                    <span className="text-lg font-bold leading-none">
                        {format(new Date(transaction.date), "dd")}
                    </span>
                </div>
            )}

            <div>
                <div className="font-semibold text-zinc-200 flex items-center gap-2">
                    {transaction.description}
                    {/* Badge de Recorrência */}
                    {transaction.recurrence !== 'variable' && transaction.recurrence && (
                        <Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-[10px] h-5 px-1.5 gap-1 text-zinc-400 font-normal">
                            {RecurrenceIcon}
                            {transaction.recurrence === 'fixed' ? 'Fixa' : 'Assinatura'}
                        </Badge>
                    )}
                </div>
                <div className="text-xs text-zinc-500 capitalize flex items-center gap-2 mt-0.5">
                    {transaction.category}
                    {/* Se tiver CardID, mostra que é do cartão */}
                    {transaction.cardId && (
                        <span className="flex items-center gap-1 text-zinc-600 bg-zinc-900/50 px-1.5 py-0.5 rounded border border-zinc-800">
                            <CreditCard className="h-3 w-3" /> Fatura Cartão
                        </span>
                    )}
                </div>
            </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
            <span className="text-base md:text-lg font-bold text-white whitespace-nowrap">
                {formatMoney(transaction.amount)}
            </span>
            
            <Button 
                size="sm" 
                variant="outline"
                className="border-zinc-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-zinc-400 gap-2 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                onClick={() => payTransaction(transaction.id)}
            >
                <CheckCircle2 className="h-4 w-4" /> <span className="hidden md:inline">Pagar</span>
            </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 w-full max-w-[1200px] mx-auto p-6 min-h-screen text-zinc-100">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <Calendar className="h-8 w-8 text-yellow-500" /> Contas a Pagar
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Gerencie seus boletos e compromissos pendentes.</p>
        </div>
        
        <div className="flex gap-3">
            {/* Total Pendente (Resumo) */}
            <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-center hidden md:block">
                <span className="text-xs text-zinc-500 uppercase font-bold">Total Pendente</span>
                <p className="text-xl font-bold text-white">
                    {formatMoney(pendingBills.reduce((acc, t) => acc + t.amount, 0))}
                </p>
            </div>
            
            {/* Botão de Nova Conta (Usando o Dialog Completo) */}
            <NewTransactionDialog defaultType="expense">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 md:h-auto font-medium">
                    <Plus className="h-4 w-4 mr-2" /> Nova Conta
                </Button>
            </NewTransactionDialog>
        </div>
      </div>

      {pendingBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-white">Tudo em dia! 🎉</h2>
              <p className="text-zinc-500">Você não tem contas pendentes no momento.</p>
              <div className="mt-6">
                 <NewTransactionDialog defaultType="expense">
                    <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                        Adicionar conta manualmente
                    </Button>
                 </NewTransactionDialog>
              </div>
          </div>
      ) : (
          <div className="space-y-8 pb-20">
              
              {/* 1. SEÇÃO: ATRASADAS (Vermelho - Só aparece se tiver) */}
              {overdue.length > 0 && (
                  <section className="space-y-3">
                      <div className="flex items-center gap-2 text-red-500 pl-1">
                          <AlertCircle className="h-5 w-5" />
                          <h2 className="font-bold text-lg">Atrasadas</h2>
                          <Badge variant="destructive" className="ml-2 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">{overdue.length}</Badge>
                      </div>
                      <div className="grid gap-3">
                          {overdue.map(t => (
                              <BillItem key={t.id} transaction={t} statusColor="border-red-500/50 text-red-500 bg-red-500/10" />
                          ))}
                      </div>
                  </section>
              )}

              {/* 2. SEÇÃO: VENCE HOJE (Amarelo) */}
              {dueToday.length > 0 && (
                  <section className="space-y-3">
                      <div className="flex items-center gap-2 text-yellow-500 pl-1">
                          <Clock className="h-5 w-5" />
                          <h2 className="font-bold text-lg">Vence Hoje</h2>
                      </div>
                      <div className="grid gap-3">
                          {dueToday.map(t => (
                              <BillItem key={t.id} transaction={t} statusColor="border-yellow-500/50 text-yellow-500 bg-yellow-500/10" />
                          ))}
                      </div>
                  </section>
              )}

              {/* 3. SEÇÃO: PRÓXIMAS (Cinza) */}
              {upcoming.length > 0 && (
                  <section className="space-y-3">
                      <div className="flex items-center gap-2 text-zinc-400 pl-1">
                          <Calendar className="h-5 w-5" />
                          <h2 className="font-bold text-lg">Próximos Lançamentos</h2>
                      </div>
                      <div className="grid gap-3">
                          {upcoming.map(t => (
                              <BillItem key={t.id} transaction={t} statusColor="border-zinc-700 text-zinc-400 bg-zinc-800" />
                          ))}
                      </div>
                  </section>
              )}
          </div>
      )}
    </div>
  );
}