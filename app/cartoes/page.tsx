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
  Unlock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CARD_GRADIENTS = [
  "from-[#2940bb] to-blue-800",
  "from-purple-600 to-indigo-700",
  "from-emerald-600 to-teal-800",
  "from-slate-700 to-slate-900", 
  "from-rose-600 to-red-700",
];

export default function CardsPage() {
  const { 
    cards, 
    accounts, 
    addCard, 
    removeCard, 
    editCard, // Certifique-se de que editCard existe no context, ou adicione
    transactions, 
    editTransaction, // Necessário para marcar como pago
    addTransaction, // Necessário para debitar da conta
    isVisible 
  } = useFinance();
  
  // --- ESTADOS ---
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [newCard, setNewCard] = useState({ name: "", limit: "", closingDate: "", dueDate: "" });
  
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  
  // Estados para as novas funções
  const [isPayInvoiceOpen, setIsPayInvoiceOpen] = useState(false);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const [paymentAccount, setPaymentAccount] = useState("");
  const [newLimitValue, setNewLimitValue] = useState("");

  const selectedCardData = cards.find(c => c.id === selectedCardId);

  // --- CÁLCULOS ---
  const statementTransactions = transactions.filter(t => t.cardId === selectedCardId);
  
  // Fatura Atual: Apenas despesas pendentes
  const invoiceTotal = statementTransactions
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const formatMoney = (val: number) => {
    if (!isVisible) return "••••";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  // --- AÇÕES ---

  // 1. Criar Cartão
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

  // 2. Pagar Fatura
  const handlePayInvoice = () => {
    if (!selectedCardId || !paymentAccount || invoiceTotal <= 0) return;

    // A. Cria a despesa na conta bancária (o dinheiro saindo)
    addTransaction({
        description: `Fatura ${selectedCardData?.name}`,
        amount: invoiceTotal,
        type: 'expense',
        category: 'Dívidas e empréstimos',
        accountId: paymentAccount,
        date: new Date().toISOString(),
        status: 'paid',
        recurrence: 'variable'
    });

    // B. Marca todas as compras pendentes desse cartão como "Pagas"
    const pendingItems = transactions.filter(t => t.cardId === selectedCardId && t.type === 'expense' && t.status === 'pending');
    
    pendingItems.forEach(t => {
        editTransaction(t.id, { ...t, status: 'paid' });
    });

    setIsPayInvoiceOpen(false);
    setIsStatementOpen(false); // Fecha o extrato também se estiver aberto
    setPaymentAccount("");
    alert("Fatura paga com sucesso!");
  };

  // 3. Ajustar Limite
  const handleUpdateLimit = () => {
      if(selectedCardId && newLimitValue) {
          // Verifica se a função editCard existe, senão avisa
          if(editCard) {
            editCard(selectedCardId, { limit: Number(newLimitValue) });
            setIsLimitOpen(false);
            setNewLimitValue("");
          } else {
            alert("Erro: Função de editar cartão não encontrada no contexto.");
          }
      }
  }

  // 4. Bloquear Cartão (Visual)
  const handleToggleBlock = (cardId: string, currentStatus?: boolean) => {
      // Simulação visual ou salvar no banco se tiver campo 'isBlocked'
      alert(currentStatus ? "Cartão Desbloqueado!" : "Cartão Bloqueado Temporariamente.");
  }

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
                            <Input placeholder="Ex: Nubank Violeta" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" value={newCard.name} onChange={e => setNewCard({...newCard, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dia Fechamento</Label>
                                <Input type="number" placeholder="Dia" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" value={newCard.closingDate} onChange={e => setNewCard({...newCard, closingDate: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Dia Vencimento</Label>
                                <Input type="number" placeholder="Dia" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" value={newCard.dueDate} onChange={e => setNewCard({...newCard, dueDate: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Limite Total</Label>
                            <Input type="number" placeholder="R$ 0,00" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" value={newCard.limit} onChange={e => setNewCard({...newCard, limit: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddCard} className="bg-[#2940bb] text-white w-full">Salvar Cartão</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        {/* Grid de Cartões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => {
                // Cálculo individual para o card
                const currentInvoice = transactions
                    .filter(t => t.cardId === card.id && t.type === 'expense' && t.status === 'pending')
                    .reduce((acc, t) => acc + Number(t.amount), 0);

                const limitPercentage = card.limit > 0 ? (currentInvoice / card.limit) * 100 : 0;
                const availableLimit = card.limit - currentInvoice;
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

                return (
                    <div key={card.id} className={`relative h-56 rounded-2xl p-6 flex flex-col justify-between shadow-lg overflow-hidden group bg-gradient-to-br ${gradient}`}>
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
                                    
                                    <DropdownMenuItem onClick={() => { setSelectedCardId(card.id); setIsStatementOpen(true); }} className="gap-2 cursor-pointer">
                                        <FileText className="h-4 w-4 text-[#2940bb]" /> Ver Extrato
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem onClick={() => { setSelectedCardId(card.id); setIsPayInvoiceOpen(true); }} className="gap-2 cursor-pointer">
                                        <Banknote className="h-4 w-4 text-emerald-500" /> Pagar Fatura
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem onClick={() => { setSelectedCardId(card.id); setNewLimitValue(String(card.limit)); setIsLimitOpen(true); }} className="gap-2 cursor-pointer">
                                        <Settings className="h-4 w-4 text-zinc-500" /> Ajustar Limite
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem onClick={() => handleToggleBlock(card.id)} className="gap-2 cursor-pointer">
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
                                <p className="text-white font-bold text-xl drop-shadow-sm">{formatMoney(currentInvoice)}</p>
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
                <div onClick={() => setIsCardOpen(true)} className="border border-dashed border-zinc-300 dark:border-zinc-800 h-56 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-[#2940bb]/50 transition-all text-zinc-500 hover:text-[#2940bb]">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center"><Plus className="h-6 w-6" /></div>
                    <span className="font-medium">Cadastrar novo cartão</span>
                </div>
            )}
        </div>

        {/* --- MODAL DE PAGAR FATURA --- */}
        <Dialog open={isPayInvoiceOpen} onOpenChange={setIsPayInvoiceOpen}>
            <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Banknote className="h-5 w-5 text-emerald-500" /> Pagar Fatura</DialogTitle>
                    <DialogDescription>O valor será debitado da conta selecionada e o limite liberado.</DialogDescription>
                </DialogHeader>
                
                {selectedCardData && (
                    <div className="py-4 space-y-4">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                            <span className="text-sm text-zinc-500">Valor Total da Fatura</span>
                            <span className="text-xl font-bold text-zinc-900 dark:text-white">{formatMoney(invoiceTotal)}</span>
                        </div>

                        {invoiceTotal === 0 ? (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-sm">
                                <CheckCircle2 className="h-4 w-4" /> Fatura zerada! Nada a pagar.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Pagar com qual conta?</Label>
                                <Select value={paymentAccount} onValueChange={setPaymentAccount}>
                                    <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                        <SelectValue placeholder="Selecione uma conta" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id}>{acc.name} (Saldo: {formatMoney(acc.balance)})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPayInvoiceOpen(false)}>Cancelar</Button>
                    <Button 
                        onClick={handlePayInvoice} 
                        disabled={invoiceTotal === 0 || !paymentAccount}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        Confirmar Pagamento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* --- MODAL DE AJUSTAR LIMITE --- */}
        <Dialog open={isLimitOpen} onOpenChange={setIsLimitOpen}>
            <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                <DialogHeader>
                    <DialogTitle>Ajustar Limite</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label>Novo Limite Total</Label>
                    <Input 
                        type="number" 
                        value={newLimitValue} 
                        onChange={(e) => setNewLimitValue(e.target.value)}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleUpdateLimit} className="bg-[#2940bb] text-white">Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* --- MODAL DE EXTRATO DO CARTÃO --- */}
        <Dialog open={isStatementOpen} onOpenChange={setIsStatementOpen}>
            <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#2940bb]" /> 
                        Extrato: {selectedCardData?.name}
                    </DialogTitle>
                    <DialogDescription>Fatura atual e histórico de lançamentos.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500 uppercase">Fatura Atual</p>
                        <p className="text-2xl font-bold text-[#2940bb] mt-1">{formatMoney(invoiceTotal)}</p>
                        <Button 
                            size="sm" 
                            className="w-full mt-3 bg-[#2940bb] hover:bg-[#2940bb]/90 text-white"
                            onClick={() => { setIsStatementOpen(false); setIsPayInvoiceOpen(true); }}
                        >
                            Pagar Fatura
                        </Button>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500 uppercase">Limite Disponível</p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-500 mt-1">{formatMoney((selectedCardData?.limit || 0) - invoiceTotal)}</p>
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
                        {statementTransactions.length === 0 ? (
                            <div className="text-center py-8 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                                Nenhuma compra registrada nesta fatura.
                            </div>
                        ) : (
                            statementTransactions.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500">
                                            {t.type === 'expense' ? <Wallet className="h-4 w-4" /> : <Banknote className="h-4 w-4 text-emerald-500" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{t.description}</p>
                                            <p className="text-xs text-zinc-500">{new Date(t.date).toLocaleDateString()} • {t.status === 'paid' ? 'Pago' : 'Pendente'}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-sm ${t.status === 'paid' ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-white'}`}>
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