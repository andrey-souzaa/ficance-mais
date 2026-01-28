"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-context";
import { 
  Plus, 
  Wallet, 
  CreditCard, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Landmark,
  Building2,
  Calendar,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Gradientes para os cartões
const CARD_GRADIENTS = [
  "from-purple-600 to-blue-600",
  "from-emerald-500 to-teal-700",
  "from-orange-500 to-red-600",
  "from-zinc-700 to-zinc-900", 
  "from-pink-500 to-rose-600",
];

export default function MyAccountsPage() {
  const { accounts, cards, addAccount, addCard, removeAccount, removeCard, isVisible } = useFinance();
  
  // Estados dos Modais
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);

  // Estados dos Formulários
  const [newAccount, setNewAccount] = useState({ name: "", balance: "" });
  const [newCard, setNewCard] = useState({ name: "", limit: "", closingDate: "", dueDate: "" });

  const handleAddAccount = () => {
    if (!newAccount.name) return;
    addAccount({
        name: newAccount.name,
        balance: Number(newAccount.balance) || 0,
        type: "checking"
    });
    setNewAccount({ name: "", balance: "" });
    setIsAccountOpen(false);
  };

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

  const formatMoney = (val: number) => {
    if (!isVisible) return "••••";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="space-y-10 w-full text-zinc-100 max-w-[1200px] pb-20">
      
      {/* --- SEÇÃO 1: CONTAS BANCÁRIAS --- */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Landmark className="h-5 w-5 text-yellow-500" />
                    Contas Bancárias
                </h2>
                <p className="text-zinc-500 text-sm">Gerencie seus saldos</p>
            </div>
            
            <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-2">
                        <Plus className="h-4 w-4" /> Nova Conta
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Adicionar Conta Bancária</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome da Conta</Label>
                            <Input 
                                placeholder="Ex: Nubank, Inter..." 
                                className="bg-zinc-900 border-zinc-800 focus:ring-yellow-500/20"
                                value={newAccount.name}
                                onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Saldo Inicial</Label>
                            <Input 
                                type="number" 
                                placeholder="R$ 0,00" 
                                className="bg-zinc-900 border-zinc-800 focus:ring-yellow-500/20"
                                value={newAccount.balance}
                                onChange={e => setNewAccount({...newAccount, balance: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddAccount} className="bg-yellow-500 text-black hover:bg-yellow-600 w-full">Criar Conta</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
                <div key={acc.id} className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                             {/* Ícone dinâmico simples */}
                             {acc.name.toLowerCase().includes('nu') ? <span className="font-bold text-purple-500">Nu</span> : 
                              acc.name.toLowerCase().includes('inter') ? <span className="font-bold text-orange-500">In</span> : 
                              <Building2 className="h-6 w-6 text-zinc-400" />}
                        </div>
                        <div>
                            <p className="font-semibold text-white">{acc.name}</p>
                            <p className="text-sm text-zinc-500">Saldo atual</p>
                            <p className={`text-lg font-bold mt-0.5 ${acc.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {formatMoney(acc.balance)}
                            </p>
                        </div>
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                            <DropdownMenuItem className="gap-2 cursor-pointer text-xs"><Pencil className="h-3.5 w-3.5" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => removeAccount(acc.id)} className="gap-2 text-red-500 cursor-pointer text-xs"><Trash2 className="h-3.5 w-3.5" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ))}
            
            {/* Estado Vazio de Contas */}
            {accounts.length === 0 && (
                <div 
                    onClick={() => setIsAccountOpen(true)}
                    className="border border-dashed border-zinc-800 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-900/50 hover:border-zinc-700 transition-all min-h-[120px] text-zinc-500"
                >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm font-medium">Adicionar primeira conta</span>
                </div>
            )}
        </div>
      </section>

      <div className="h-px bg-zinc-900/50 w-full"></div>

      {/* --- SEÇÃO 2: CARTÕES DE CRÉDITO --- */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <CreditCard className="h-5 w-5 text-purple-500" />
                    Meus Cartões
                </h2>
                <p className="text-zinc-500 text-sm">Controle seus limites</p>
            </div>
            
            <Dialog open={isCardOpen} onOpenChange={setIsCardOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-2">
                        <Plus className="h-4 w-4" /> Novo Cartão
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Adicionar Cartão</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Apelido do Cartão</Label>
                            <Input placeholder="Ex: Nubank Violeta" className="bg-zinc-900 border-zinc-800 focus:ring-purple-500/20" value={newCard.name} onChange={e => setNewCard({...newCard, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dia Fechamento</Label>
                                <Input type="number" placeholder="Dia" className="bg-zinc-900 border-zinc-800 focus:ring-purple-500/20" value={newCard.closingDate} onChange={e => setNewCard({...newCard, closingDate: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Dia Vencimento</Label>
                                <Input type="number" placeholder="Dia" className="bg-zinc-900 border-zinc-800 focus:ring-purple-500/20" value={newCard.dueDate} onChange={e => setNewCard({...newCard, dueDate: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Limite Total</Label>
                            <Input type="number" placeholder="R$ 0,00" className="bg-zinc-900 border-zinc-800 focus:ring-purple-500/20" value={newCard.limit} onChange={e => setNewCard({...newCard, limit: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddCard} className="bg-purple-600 text-white hover:bg-purple-700 w-full">Salvar Cartão</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => {
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
                return (
                    <div key={card.id} className={`relative h-48 rounded-2xl p-6 flex flex-col justify-between shadow-lg overflow-hidden group bg-gradient-to-br ${gradient}`}>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>

                        <div className="relative z-10 flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-white/80" />
                                <span className="font-medium text-white tracking-wide">{card.name}</span>
                            </div>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/20 h-8 w-8">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                                    <DropdownMenuItem onClick={() => removeCard(card.id)} className="text-red-500 cursor-pointer gap-2 text-xs">
                                        <Trash2 className="h-3.5 w-3.5" /> Remover Cartão
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="relative z-10">
                            <div className="flex gap-4 mb-1">
                                <div className="h-8 w-10 bg-yellow-500/20 rounded border border-yellow-500/30 flex items-center justify-center">
                                    <div className="h-4 w-6 border-2 border-yellow-500/50 rounded-sm"></div>
                                </div>
                                <div className="mt-1">
                                    <p className="text-white/60 text-[10px] uppercase tracking-wider">Limite Total</p>
                                    <p className="text-white font-bold text-xl drop-shadow-md">{formatMoney(card.limit)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex justify-between items-end">
                            <div className="text-xs text-white/80 font-mono">
                                **** **** **** {Math.floor(1000 + Math.random() * 9000)}
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1 text-[10px] text-white/60 uppercase">
                                    <Calendar className="h-3 w-3" /> Vence dia
                                </div>
                                <p className="text-sm font-bold text-white">{card.dueDate}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
             {/* Estado Vazio de Cartões */}
             {cards.length === 0 && (
                <div 
                    onClick={() => setIsCardOpen(true)}
                    className="border border-dashed border-zinc-800 h-48 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-900/50 hover:border-zinc-700 transition-all text-zinc-500"
                >
                    <CreditCard className="h-8 w-8 opacity-50" />
                    <span className="text-sm font-medium">Adicionar novo cartão</span>
                </div>
            )}
        </div>
      </section>

    </div>
  );
}