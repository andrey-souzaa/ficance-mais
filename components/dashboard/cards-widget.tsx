"use client";

import { useState } from "react";
import { useFinance, Card as CardType } from "@/lib/finance-context";
import { CreditCard, Calendar, Wallet, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
// Se você ainda não criou o EditCardDialog, pode comentar a linha abaixo ou criar o arquivo depois.
// import { EditCardDialog } from "./edit-card-dialog"; 

export function CardsWidget() {
  const { cards, isVisible, removeCard, transactions } = useFinance();
  // const [editingCard, setEditingCard] = useState<CardType | null>(null); // Descomente quando tiver o dialog

  const formatMoney = (val: number) => {
    if (!isVisible) return "••••";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cartão?")) {
        removeCard(id);
    }
  };

  // ESTADO VAZIO
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-zinc-400 space-y-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <CreditCard className="h-5 w-5 opacity-50" />
        </div>
        <p className="text-xs">Nenhum cartão cadastrado</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between space-y-3 pr-1">
      <div className="space-y-3 overflow-y-auto max-h-[400px]">
        {cards.map((card) => {
          // 1. CÁLCULO DA FATURA ATUAL (Baseado nas transações)
          const currentBill = transactions
            .filter(t => t.cardId === card.id && t.type === 'expense' && t.status === 'pending')
            .reduce((acc, t) => acc + Number(t.amount), 0);

          const usagePercent = card.limit > 0 ? (currentBill / card.limit) * 100 : 0;
          const availableLimit = card.limit - currentBill;

          return (
            // CORREÇÃO: Fundo Branco (Light) / Preto (Dark) + Bordas
            <div 
              key={card.id} 
              className="group flex flex-col p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 gap-3 relative shadow-sm"
            >
              
              {/* --- MENU DE AÇÕES (3 PONTINHOS) --- */}
              <div className="absolute top-3 right-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                            <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-xl">
                        {/* <DropdownMenuItem onClick={() => setEditingCard(card)} className="gap-2 text-xs cursor-pointer">
                            <Pencil className="h-3 w-3" /> Editar Cartão
                        </DropdownMenuItem> */}
                        <DropdownMenuItem onClick={() => handleDelete(card.id)} className="gap-2 text-xs cursor-pointer text-red-600 dark:text-red-500 focus:text-red-600">
                            <Trash2 className="h-3 w-3" /> Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Cabeçalho do Cartão */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    {/* Ícone Estilizado */}
                    <div className="w-10 h-7 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center relative overflow-hidden text-zinc-400 dark:text-zinc-500">
                        <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{card.name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                             <span className="uppercase tracking-wide">Final ****</span>
                        </div>
                    </div>
                </div>

                {/* Badge de Vencimento */}
                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 mr-6">
                    <Calendar className="h-3 w-3 text-zinc-500" />
                    <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                        Dia {card.dueDate}
                    </span>
                </div>
              </div>

              {/* Valores */}
              <div className="flex justify-between items-end border-t border-zinc-100 dark:border-zinc-800 pt-3">
                 <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-medium mb-0.5">Fatura Atual</p>
                    <p className={`text-lg font-bold ${isVisible ? "text-zinc-900 dark:text-white" : "text-zinc-400 tracking-widest"}`}>
                        {formatMoney(currentBill)}
                    </p>
                 </div>

                 <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase font-medium mb-0.5 flex items-center justify-end gap-1">
                        <Wallet className="h-3 w-3" /> Disponível
                    </p>
                    <p className={`text-sm font-medium ${isVisible ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-400 tracking-widest"}`}>
                        {formatMoney(availableLimit)}
                    </p>
                 </div>
              </div>

              {/* Barra de Progresso */}
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                 <div 
                    className="h-full bg-gradient-to-r from-[#2940bb] to-blue-500" 
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                 ></div>
              </div>
              
              {/* Botão Ver Extrato */}
              <div className="mt-2">
                 <Link 
                    href="/cartoes" 
                    className="flex items-center justify-center w-full py-1.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors"
                 >
                      Ver Fatura e Extrato
                 </Link>
              </div>

            </div>
          );
        })}
      </div>
      
      {/* Link Geral do Rodapé */}
      <div className="pt-2">
         <Link 
            href="/minhas-contas" 
            className="w-full border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500 text-xs h-8 flex items-center justify-center rounded-md hover:text-zinc-900 dark:hover:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
         >
             Gerenciar Contas e Cartões
         </Link>
      </div>

      {/* Se tiver o modal de edição, descomente aqui */}
      {/* {editingCard && (
        <EditCardDialog 
            card={editingCard} 
            isOpen={!!editingCard} 
            onClose={() => setEditingCard(null)} 
        />
      )} */}
    </div>
  );
}