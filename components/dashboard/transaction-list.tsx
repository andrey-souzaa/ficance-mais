"use client";

import { useFinance } from "@/lib/finance-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function TransactionList() {
  const { transactions, transactions: allTransactions, deleteTransaction } = useFinance();
  
  // Se não tiver deleteTransaction no contexto ainda, vamos ajustar o contexto no próximo passo.
  // Por enquanto, vamos assumir que só listamos.
  
  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Histórico Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma transação registrada.
            </p>
          )}
          
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{t.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="bg-secondary px-2 py-0.5 rounded text-xs">
                    {t.category}
                  </span>
                  <span>{format(new Date(t.date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`font-bold ${
                    t.type === "income" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {t.type === "expense" ? "-" : "+"} {formatMoney(t.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}