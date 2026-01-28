"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-context";
import { 
  Plus, 
  CreditCard, 
  Calendar, 
  MoreHorizontal, 
  Trash2,
  Wallet,
  FileText,
  Banknote,
  Lock,
  Settings,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

// Gradientes exclusivos para os cartões
const CARD_GRADIENTS = [
  "from-[#2940bb] to-blue-800",
  "from-purple-600 to-indigo-700",
  "from-emerald-600 to-teal-800",
  "from-slate-700 to-slate-900", 
  "from-rose-600 to-red-700",
];

export default function CardsPage() {
  const { cards, addCard, removeCard, isVisible, transactions } = useFinance();
  
  // Estados
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [newCard, setNewCard] = useState({ name: "", limit: "", closingDate: "", dueDate: "" });
  
  // Estado para o Extrato (Qual cartão está selecionado)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  const handleAddCard = () => {
    if (!newCard.name) return;
    addCard({
        name: newCard.name,
        limit: Number(newCard.limit) || 0,
        closingDate: Number(newCard.closingDate) || 1,
        dueDate: Number(newCard.dueDate) || 10,
    });
    setNewCard({ name: "", limit: "", closingDate: "", dueDate: "" });
    setIsCardOpen(false);
  };

  // Função para abrir o extrato
  const openStatement = (cardId: string) => {
      setSelectedCardId(cardId);
      setIsStatementOpen(true);
  };

  // Filtrar transações do cartão selecionado (Simulação)
  // Nota: No sistema real, você salvaria o cardId na transação. 
  // Aqui vamos simular pegando algumas transações aleatórias se não houver filtro real.
  const cardTransactions = transactions.filter(t => t.cardId === selectedCardId);
  const selectedCardData = cards.find(c => c.id === selectedCardId);

  const formatMoney = (val: number) => {
    if (!isVisible) return "••••";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto p-6 space-y-6 pb-20 text-zinc-900 dark:text-zinc-100">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                    <CreditCard className="h-6 w-6 text-[#2940bb]" />
                    Meus Cartões
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Gerencie faturas e limites.</p>
            </div>

            <Dialog open={isCardOpen} onOpenChange={setIsCardOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-[#2940bb] hover:bg-[#2940bb]/90 text-white gap-2 font-medium">
                        <Plus className="h-4 w-4" /> Novo Cartão
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Adicionar Cartão</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Apelido do Cartão</Label>
                            <Input placeholder="Ex: Nubank Violeta" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]" value={newCard.name} onChange={e => setNewCard({...newCard, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dia Fechamento</Label>
                                <Input type="number" placeholder="Dia" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]" value={newCard.closingDate} onChange={e => setNewCard({...newCard, closingDate: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Dia Vencimento</Label>
                                <Input type="number" placeholder="Dia" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]" value={newCard.dueDate} onChange={e => setNewCard({...newCard, dueDate: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Limite Total</Label>
                            <Input type="number" placeholder="R$ 0,00" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]" value={newCard.limit} onChange={e => setNewCard({...newCard, limit: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddCard} className="bg-[#2940bb] text-white hover:bg-[#2940bb]/90 w-full">Salvar Cartão</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        {/* Grid de Cartões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => {
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
                return (
                    <div key={card.id} className={`relative h-56 rounded-2xl p-6 flex flex-col justify-between shadow-lg overflow-hidden group bg-gradient-to-br ${gradient}`}>
                        
                        {/* Efeitos de fundo */}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>

                        {/* Topo do Cartão */}
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-white tracking-wide text-lg leading-none">{card.name}</p>
                                    <p className="text-white/60 text-xs mt-1 font-mono">**** **** **** {Math.floor(1000 + Math.random() * 9000)}</p>
                                </div>
                            </div>
                            
                            {/* MENU DE AÇÕES DO CARTÃO */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/20 h-8 w-8 rounded-full">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                                    <DropdownMenuLabel>Ações do Cartão</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => openStatement(card.id)} className="gap-2 cursor-pointer">
                                        <FileText className="h-4 w-4 text-[#2940bb]" /> Ver Extrato
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2 cursor-pointer">
                                        <Banknote className="h-4 w-4 text-emerald-500" /> Pagar Fatura
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2 cursor-pointer">
                                        <Settings className="h-4 w-4 text-zinc-500" /> Ajustar Limite
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2 cursor-pointer">
                                        <Lock className="h-4 w-4 text-zinc-500" /> Bloquear
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => removeCard(card.id)} className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer">
                                        <Trash2 className="h-4 w-4" /> Excluir Cartão
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Informações de Limite e Fatura */}
                        <div className="relative z-10 grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Fatura Atual</p>
                                <p className="text-white font-bold text-xl drop-shadow-sm">R$ 0,00</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Limite Total</p>
                                <p className="text-white/90 font-medium text-lg">{formatMoney(card.limit)}</p>
                            </div>
                        </div>

                        {/* Rodapé do Cartão */}
                        <div className="relative z-10 flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                            <div className="flex items-center gap-2 text-xs text-white/80">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Vence dia <strong>{card.dueDate}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/80">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Fecha dia <strong>{card.closingDate}</strong></span>
                            </div>
                        </div>
                    </div>
                )
            })}
             
             {/* Estado Vazio */}
             {cards.length === 0 && (
                <div 
                    onClick={() => setIsCardOpen(true)}
                    className="border border-dashed border-zinc-300 dark:border-zinc-800 h-56 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-[#2940bb]/50 transition-all text-zinc-500 hover:text-[#2940bb]"
                >
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="font-medium">Cadastrar novo cartão</span>
                </div>
            )}
        </div>

        {/* MODAL DE EXTRATO DO CARTÃO */}
        <Dialog open={isStatementOpen} onOpenChange={setIsStatementOpen}>
            <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#2940bb]" /> 
                        Extrato: {selectedCardData?.name}
                    </DialogTitle>
                    <DialogDescription>
                        Fatura atual e histórico de lançamentos.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500 uppercase">Fatura Atual</p>
                        <p className="text-2xl font-bold text-[#2940bb] mt-1">R$ 0,00</p>
                        <Button size="sm" className="w-full mt-3 bg-[#2940bb] hover:bg-[#2940bb]/90 text-white">
                            Pagar Fatura
                        </Button>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500 uppercase">Limite Disponível</p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-500 mt-1">{formatMoney(selectedCardData?.limit || 0)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500 uppercase">Status</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="font-medium">Ativo</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-2">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Lançamentos Recentes</h3>
                    <ScrollArea className="h-[200px] pr-4">
                        {cardTransactions.length === 0 ? (
                            <div className="text-center py-8 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                                Nenhuma compra registrada nesta fatura.
                            </div>
                        ) : (
                            cardTransactions.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500">
                                            <Wallet className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{t.description}</p>
                                            <p className="text-xs text-zinc-500">{new Date(t.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                                        {formatMoney(t.amount)}
                                    </span>
                                </div>
                            ))
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>

    </div>
  );
}