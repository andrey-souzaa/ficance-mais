"use client";

import { use, useEffect, useState } from "react";
import { useFinance } from "@/lib/finance-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
// ADICIONEI O "Check" AQUI NA IMPORTAÇÃO
import { ArrowLeft, Calendar, CreditCard, ShoppingBag, Wallet, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PayInvoiceDialog } from "@/components/dashboard/pay-invoice-dialog";

export default function CardDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { cards, transactions } = useFinance();
  const router = useRouter();

  const [card, setCard] = useState<any>(null);

  useEffect(() => {
    const foundCard = cards.find((c) => c.id === resolvedParams.id);
    if (foundCard) setCard(foundCard);
  }, [cards, resolvedParams.id]);

  if (!card) return <div className="p-10 text-white">Carregando cartão...</div>;

  // Filtra transações DESTE cartão
  const cardTransactions = transactions.filter(t => t.cardId === card.id);
  
  // Fatura Atual: Apenas despesas PENDENTES
  const currentInvoice = cardTransactions
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  const availableLimit = card.limit - currentInvoice;
  const usagePercent = (currentInvoice / card.limit) * 100;

  const formatMoney = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="space-y-8 w-full max-w-[1000px] mx-auto p-6 text-zinc-100 min-h-screen">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white">
            <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-emerald-500" />
                {card.name}
            </h1>
            <p className="text-zinc-500 text-sm">Gerenciamento e Fatura</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Resumo */}
        <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Limite e Fatura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-3xl font-bold text-white">{formatMoney(currentInvoice)}</span>
                        {currentInvoice > 0 && (
                             <span className="text-xs font-medium bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/20 self-start">Fatura Aberta</span>
                        )}
                        {currentInvoice === 0 && (
                             <span className="text-xs font-medium bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20 self-start">Em dia</span>
                        )}
                    </div>
                    <Progress value={usagePercent} className="h-2 bg-zinc-900 [&>*]:bg-gradient-to-r [&>*]:from-emerald-600 [&>*]:to-emerald-400" />
                    <div className="flex justify-between mt-2 text-xs text-zinc-500">
                        <span>Usado: {Math.round(usagePercent)}%</span>
                        <span>Limite Total: {formatMoney(card.limit)}</span>
                    </div>
                </div>

                <div className="flex gap-4 border-t border-zinc-800 pt-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                            <Calendar className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase">Vencimento</p>
                            <p className="font-bold text-zinc-200">Dia {card.dueDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                            <Wallet className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase">Disponível</p>
                            <p className="font-bold text-emerald-500">{formatMoney(availableLimit)}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card className="bg-zinc-900/20 border-zinc-800 flex flex-col justify-center items-center gap-4 p-6 border-dashed">
            <p className="text-zinc-500 text-sm text-center">Ações da Fatura</p>
            
            {/* BOTÃO DE PAGAR FATURA */}
            <PayInvoiceDialog card={card} currentInvoiceAmount={currentInvoice} />

            <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                Ajustar Limite
            </Button>
        </Card>
      </div>

      {/* Histórico */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Extrato de Lançamentos</h2>
        
        {cardTransactions.length === 0 ? (
            <div className="p-8 text-center border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-500">
                Nenhuma compra feita neste cartão ainda.
            </div>
        ) : (
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
                {/* Ordenar por data (mais recente primeiro) */}
                {cardTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-900 text-zinc-400'}`}>
                                {t.status === 'paid' ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className={`font-medium ${t.status === 'paid' ? 'text-emerald-500 line-through opacity-70' : 'text-zinc-200'}`}>
                                    {t.description}
                                </p>
                                <p className="text-xs text-zinc-500 flex items-center gap-1">
                                    {format(new Date(t.date), "dd/MM/yyyy")} • {t.category} 
                                    {t.status === 'paid' && " • Pago"}
                                </p>
                            </div>
                        </div>
                        <span className={`font-bold ${t.status === 'paid' ? 'text-zinc-600 line-through' : 'text-white'}`}>
                            {formatMoney(t.amount)}
                        </span>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
}