"use client";

import { useState } from "react";
import { useFinance, Account } from "@/lib/finance-context";
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
  MoreHorizontal,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const CARD_GRADIENTS = [
  "from-[#2940bb] to-blue-800",
  "from-purple-600 to-indigo-700",
  "from-emerald-600 to-teal-800",
  "from-slate-700 to-slate-900", 
  "from-rose-600 to-red-700",
];

export default function MyAccountsPage() {
  // ADICIONADO: transactions para poder calcular a fatura
  const { accounts, cards, transactions, addAccount, editAccount, addCard, removeAccount, removeCard, isVisible } = useFinance();
  
  // Estados dos Modais de Criação
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);

  // Estados dos Modais de Edição
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Estados dos Formulários
  const [newAccount, setNewAccount] = useState({ name: "", balance: "" });
  const [newCard, setNewCard] = useState({ name: "", limit: "", closingDate: "", dueDate: "" });

  // --- FUNÇÕES DE CONTA ---
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

  const openEditAccount = (acc: Account) => {
      setEditingAccount(acc);
      setIsEditAccountOpen(true);
  };

  const handleSaveAccountEdit = () => {
      if (editingAccount && editingAccount.name) {
          editAccount(editingAccount.id, {
              name: editingAccount.name,
              balance: Number(editingAccount.balance)
          });
          setIsEditAccountOpen(false);
          setEditingAccount(null);
      }
  };

  // --- FUNÇÕES DE CARTÃO ---
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
    <div className="space-y-10 w-full text-zinc-900 dark:text-zinc-100 max-w-[1200px] mx-auto p-6 pb-20">
      
      {/* --- SEÇÃO 1: CONTAS BANCÁRIAS --- */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                    <Landmark className="h-5 w-5 text-[#2940bb]" />
                    Contas Bancárias
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Gerencie seus saldos</p>
            </div>
            
            <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-[#2940bb] hover:bg-[#2940bb]/90 text-white gap-2 font-medium">
                        <Plus className="h-4 w-4" /> Nova Conta
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Adicionar Conta Bancária</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome da Conta</Label>
                            <Input 
                                placeholder="Ex: Nubank, Inter..." 
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]"
                                value={newAccount.name}
                                onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Saldo Inicial</Label>
                            <Input 
                                type="number" 
                                placeholder="R$ 0,00" 
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]"
                                value={newAccount.balance}
                                onChange={e => setNewAccount({...newAccount, balance: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddAccount} className="bg-[#2940bb] text-white hover:bg-[#2940bb]/90 w-full">Criar Conta</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
                <div key={acc.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between group hover:border-[#2940bb]/30 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                             {acc.name.toLowerCase().includes('nu') ? <span className="font-bold text-purple-600 dark:text-purple-500">Nu</span> : 
                              acc.name.toLowerCase().includes('inter') ? <span className="font-bold text-orange-600 dark:text-orange-500">In</span> : 
                              <Building2 className="h-6 w-6 text-zinc-400" />}
                        </div>
                        <div>
                            <p className="font-semibold text-zinc-900 dark:text-white">{acc.name}</p>
                            <p className="text-sm text-zinc-500">Saldo atual</p>
                            <p className={`text-lg font-bold mt-0.5 ${acc.balance >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                                {formatMoney(acc.balance)}
                            </p>
                        </div>
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <DropdownMenuItem onClick={() => openEditAccount(acc)} className="gap-2 cursor-pointer text-xs">
                                <Pencil className="h-3.5 w-3.5" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => removeAccount(acc.id)} className="gap-2 text-red-500 cursor-pointer text-xs">
                                <Trash2 className="h-3.5 w-3.5" /> Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ))}
            
            {accounts.length === 0 && (
                <div 
                    onClick={() => setIsAccountOpen(true)}
                    className="border border-dashed border-zinc-300 dark:border-zinc-800 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-[#2940bb]/50 transition-all min-h-[120px] text-zinc-500 hover:text-[#2940bb]"
                >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm font-medium">Adicionar primeira conta</span>
                </div>
            )}
        </div>
      </section>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full"></div>

      {/* --- SEÇÃO 2: CARTÕES DE CRÉDITO --- */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                    <CreditCard className="h-5 w-5 text-[#2940bb]" />
                    Meus Cartões
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Controle seus limites</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => {
                
                // --- CÁLCULO DA FATURA (ADICIONADO AQUI) ---
                const currentInvoice = transactions
                    .filter(t => t.cardId === card.id && t.type === 'expense' && t.status === 'pending')
                    .reduce((acc, t) => acc + Number(t.amount), 0);

                const limitPercentage = card.limit > 0 ? (currentInvoice / card.limit) * 100 : 0;
                const availableLimit = card.limit - currentInvoice;

                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
                
                return (
                    <div key={card.id} className={`relative h-56 rounded-2xl p-6 flex flex-col justify-between shadow-lg overflow-hidden group bg-gradient-to-br ${gradient}`}>
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
                                <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                    <DropdownMenuItem onClick={() => removeCard(card.id)} className="text-red-500 cursor-pointer gap-2 text-xs">
                                        <Trash2 className="h-3.5 w-3.5" /> Remover Cartão
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* EXIBIÇÃO DE FATURA E LIMITE */}
                        <div className="relative z-10 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Fatura Atual</p>
                                <p className="text-white font-bold text-lg drop-shadow-md">{formatMoney(currentInvoice)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Limite Livre</p>
                                <p className="text-white font-medium text-base">{formatMoney(availableLimit)}</p>
                            </div>
                        </div>

                        {/* BARRA DE PROGRESSO */}
                        <div className="relative z-10">
                             <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-white/80" style={{ width: `${Math.min(limitPercentage, 100)}%` }}></div>
                             </div>
                             <div className="flex justify-between text-[9px] text-white/50">
                                <span>Uso: {limitPercentage.toFixed(0)}%</span>
                                <span>Total: {formatMoney(card.limit)}</span>
                             </div>
                        </div>

                        <div className="relative z-10 flex justify-between items-end mt-1">
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
             {cards.length === 0 && (
                <div 
                    onClick={() => setIsCardOpen(true)}
                    className="border border-dashed border-zinc-300 dark:border-zinc-800 h-56 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-[#2940bb]/50 transition-all text-zinc-500 hover:text-[#2940bb]"
                >
                    <CreditCard className="h-8 w-8 opacity-50" />
                    <span className="text-sm font-medium">Adicionar novo cartão</span>
                </div>
            )}
        </div>
      </section>

      {/* --- MODAL DE EDIÇÃO DE CONTA --- */}
      <Dialog open={isEditAccountOpen} onOpenChange={setIsEditAccountOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
            <DialogHeader>
                <DialogTitle>Editar Conta Bancária</DialogTitle>
            </DialogHeader>
            {editingAccount && (
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nome da Conta</Label>
                        <Input 
                            value={editingAccount.name}
                            onChange={e => setEditingAccount({...editingAccount, name: e.target.value})}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Saldo Atual</Label>
                        <Input 
                            type="number" 
                            value={editingAccount.balance}
                            onChange={e => setEditingAccount({...editingAccount, balance: Number(e.target.value)})}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-[#2940bb]/20 focus:border-[#2940bb]"
                        />
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button onClick={handleSaveAccountEdit} className="bg-[#2940bb] text-white hover:bg-[#2940bb]/90 w-full">
                    <Check className="h-4 w-4 mr-2" /> Salvar Alterações
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}