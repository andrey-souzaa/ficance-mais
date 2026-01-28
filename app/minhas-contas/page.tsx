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

// Gradients for cards - kept distinct for visual variety
const CARD_GRADIENTS = [
  "from-[#2940bb] to-blue-800", // Main Blue
  "from-purple-600 to-indigo-700",
  "from-emerald-600 to-teal-800",
  "from-slate-700 to-slate-900", 
  "from-rose-600 to-red-700",
];

export default function MyAccountsPage() {
  const { accounts, cards, addAccount, addCard, removeAccount, removeCard, isVisible } = useFinance();
  
  // Modal States
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);

  // Form States
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
    <div className="space-y-10 w-full text-zinc-100 max-w-[1200px] mx-auto p-6 pb-20">
      
      {/* --- SECTION 1: BANK ACCOUNTS --- */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    {/* Updated: Blue Icon */}
                    <Landmark className="h-5 w-5 text-[#2940bb]" />
                    Contas Bancárias
                </h2>
                <p className="text-zinc-500 text-sm">Gerencie seus saldos</p>
            </div>
            
            <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
                <DialogTrigger asChild>
                    {/* Updated: Blue Button */}
                    <Button className="bg-[#2940bb] hover:bg-[#2940bb]/90 text-white gap-2 font-medium">
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
                                className="bg-zinc-900 border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]"
                                value={newAccount.name}
                                onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Saldo Inicial</Label>
                            <Input 
                                type="number" 
                                placeholder="R$ 0,00" 
                                className="bg-zinc-900 border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]"
                                value={newAccount.balance}
                                onChange={e => setNewAccount({...newAccount, balance: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        {/* Updated: Blue Button */}
                        <Button onClick={handleAddAccount} className="bg-[#2940bb] text-white hover:bg-[#2940bb]/90 w-full">Criar Conta</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
                <div key={acc.id} className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between group hover:border-[#2940bb]/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                             {/* Dynamic Icon Logic */}
                             {acc.name.toLowerCase().includes('nu') ? <span className="font-bold text-purple-500">Nu</span> : 
                              acc.name.toLowerCase().includes('inter') ? <span className="font-bold text-orange-500">In</span> : 
                              <Building2 className="h-6 w-6 text-zinc-400" />}
                        </div>
                        <div>
                            <p className="font-semibold text-white">{acc.name}</p>
                            <p className="text-sm text-zinc-500">Saldo atual</p>
                            {/* Updated: Positive Green / Negative Red - Standard finance colors */}
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
            
            {/* Empty State Accounts */}
            {accounts.length === 0 && (
                <div 
                    onClick={() => setIsAccountOpen(true)}
                    className="border border-dashed border-zinc-800 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-900/50 hover:border-[#2940bb]/50 transition-all min-h-[120px] text-zinc-500 hover:text-[#2940bb]"
                >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm font-medium">Adicionar primeira conta</span>
                </div>
            )}
        </div>
      </section>

      <div className="h-px bg-zinc-800 w-full"></div>

      {/* --- SECTION 2: CREDIT CARDS --- */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    {/* Updated: Blue Icon to match theme */}
                    <CreditCard className="h-5 w-5 text-[#2940bb]" />
                    Meus Cartões
                </h2>
                <p className="text-zinc-500 text-sm">Controle seus limites</p>
            </div>
            
            <Dialog open={isCardOpen} onOpenChange={setIsCardOpen}>
                <DialogTrigger asChild>
                    {/* Updated: Blue Button */}
                    <Button className="bg-[#2940bb] hover:bg-[#2940bb]/90 text-white gap-2 font-medium">
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
                            <Input placeholder="Ex: Nubank Violeta" className="bg-zinc-900 border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]" value={newCard.name} onChange={e => setNewCard({...newCard, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dia Fechamento</Label>
                                <Input type="number" placeholder="Dia" className="bg-zinc-900 border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]" value={newCard.closingDate} onChange={e => setNewCard({...newCard, closingDate: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Dia Vencimento</Label>
                                <Input type="number" placeholder="Dia" className="bg-zinc-900 border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]" value={newCard.dueDate} onChange={e => setNewCard({...newCard, dueDate: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Limite Total</Label>
                            <Input type="number" placeholder="R$ 0,00" className="bg-zinc-900 border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]" value={newCard.limit} onChange={e => setNewCard({...newCard, limit: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter>
                        {/* Updated: Blue Button */}
                        <Button onClick={handleAddCard} className="bg-[#2940bb] text-white hover:bg-[#2940bb]/90 w-full">Salvar Cartão</Button>
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
                                {/* Updated: Chip style neutral white/glass instead of yellow */}
                                <div className="h-8 w-10 bg-white/20 rounded border border-white/30 flex items-center justify-center">
                                    <div className="h-4 w-6 border-2 border-white/40 rounded-sm"></div>
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
             {/* Empty State Cards */}
             {cards.length === 0 && (
                <div 
                    onClick={() => setIsCardOpen(true)}
                    className="border border-dashed border-zinc-800 h-48 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-900/50 hover:border-[#2940bb]/50 transition-all text-zinc-500 hover:text-[#2940bb]"
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