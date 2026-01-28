"use client";

import { useState } from "react";
import { useFinance, Card } from "@/lib/finance-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Wallet } from "lucide-react";

interface Props {
  card: Card;
  currentInvoiceAmount: number;
}

export function PayInvoiceDialog({ card, currentInvoiceAmount }: Props) {
  const { accounts, addTransaction, transactions, editTransaction } = useFinance();
  const [open, setOpen] = useState(false);
  
  const [amount, setAmount] = useState(currentInvoiceAmount.toString());
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handlePay = () => {
    if (!amount || !selectedAccountId) return;

    const value = Number(amount);

    // 1. Cria a transação de SAÍDA do dinheiro da conta
    addTransaction({
        description: `Pagamento Fatura ${card.name}`,
        amount: value,
        type: 'expense',
        category: 'Pagamento de Fatura',
        date: new Date(date).toISOString(),
        status: 'paid', // Saiu o dinheiro
        accountId: selectedAccountId,
        recurrence: 'variable'
    });

    // 2. "Baixa" as transações do cartão (Marca como pagas para liberar limite)
    // Pegamos todas as pendentes desse cartão
    const cardExpenses = transactions.filter(t => t.cardId === card.id && t.status === 'pending');
    
    // Vamos marcando como paga até atingir o valor pago (Lógica simplificada: marca tudo se pagar total)
    // Se quiser algo mais complexo (pagamento parcial), precisaria de lógica extra. 
    // Por enquanto, assumimos que pagar a fatura zera as pendências do período.
    cardExpenses.forEach(t => {
        editTransaction(t.id, { status: 'paid' });
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 font-medium">
            Pagar Fatura
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Pagar Fatura: {card.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Valor do Pagamento</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
                    <Input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        className="pl-9 bg-zinc-900 border-zinc-800"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Pagar com qual conta?</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-3 w-3 text-zinc-400" />
                                    <span>{acc.name}</span>
                                    <span className="text-zinc-500 text-xs">(R$ {acc.balance})</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
               <Label>Data do Pagamento</Label>
               <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-zinc-900 border-zinc-800" />
            </div>

            <Button onClick={handlePay} className="w-full bg-emerald-600 hover:bg-emerald-500 mt-2 h-12 text-base">
                <Check className="w-5 h-5 mr-2" /> Confirmar Pagamento
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}