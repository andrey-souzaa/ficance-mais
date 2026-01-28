"use client";

import { useFinance } from "@/lib/finance-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RecentTransactions() {
  const { transactions } = useFinance();

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-4">
            <CardTitle className="text-white text-lg">Lançamentos</CardTitle>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                {transactions.length} itens
            </span>
        </div>
        <Button variant="link" className="text-yellow-500 hover:text-yellow-400 text-sm">
            Ver todas
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Filtros estilo Tabs */}
        <div className="flex items-center gap-2 p-4 overflow-x-auto">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <Filter className="h-4 w-4 mr-2" />
            </Button>
            <Button size="sm" className="bg-yellow-500 text-black hover:bg-yellow-600 font-medium rounded-full">
                Todos
            </Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full">
                Receitas
            </Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full">
                Despesas
            </Button>
        </div>

        {/* Lista */}
        <div className="px-4 pb-4 space-y-2">
            {transactions.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm">
                    Nenhum lançamento encontrado.
                </div>
            ) : (
                transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900/50 transition-colors group">
                        <div className="flex items-center gap-4">
                            {/* Ícone da Categoria */}
                            <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center text-lg border border-zinc-800 group-hover:border-zinc-700">
                                {t.type === 'income' ? '💰' : '💸'}
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">{t.description}</p>
                                <p className="text-zinc-500 text-xs">
                                    {t.category} • {format(new Date(t.date), "dd/MM", { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                        <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                            {t.type === 'expense' ? '- ' : '+ '}
                            {formatMoney(t.amount)}
                        </span>
                    </div>
                ))
            )}
        </div>
      </CardContent>
    </Card>
  );
}