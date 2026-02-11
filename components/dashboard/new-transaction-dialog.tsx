"use client";

import { useState } from "react";
import { useFinance, TransactionType, RecurrenceType } from "@/lib/finance-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Repeat, MessageSquare, Paperclip, Tag, CreditCard, Landmark } from "lucide-react";

// --- CATEGORIES ---
const INCOME_CATEGORIES = [
    "Salário",
    "Investimentos",
    "Empréstimos",
    "Outras receitas"
];

const EXPENSE_CATEGORIES = [
    "Alimentação",
    "Assinaturas e serviços",
    "Bares e restaurantes",
    "Casa",
    "Compras",
    "Cuidados pessoais",
    "Dívidas e empréstimos",
    "Educação",
    "Família e filhos",
    "Impostos e Taxas",
    "Investimentos",
    "Lazer e hobbies",
    "Mercado",
    "Outros",
    "Pets",
    "Presentes e doações",
    "Roupas",
    "Saúde",
    "Trabalho",
    "Transporte",
    "Viagem"
];

interface NewTransactionDialogProps {
  children?: React.ReactNode;
  defaultType?: TransactionType;
}

export function NewTransactionDialog({ children, defaultType = "expense" }: NewTransactionDialogProps) {
  const { addTransaction, accounts, cards } = useFinance();
  const [open, setOpen] = useState(false);

  const [type, setType] = useState<TransactionType>(defaultType);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSource, setSelectedSource] = useState("");
  const [category, setCategory] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("variable");
  
  const isIncome = type === 'income';
  const ringColor = isIncome ? "focus-visible:ring-emerald-500" : "focus-visible:ring-red-500";
  const btnColor = isIncome ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500";
  const currentCategories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !selectedSource) return; // Added check for selectedSource

    // LOGIC: Check if selected ID belongs to a Card
    const isCard = cards.some(c => c.id === selectedSource);
    
    addTransaction({
      description,
      amount: Number(amount),
      type,
      category: category || "Outros",
      date: new Date(date).toISOString(),
      // If card -> pending. If account -> paid.
      status: isCard ? 'pending' : 'paid', 
      recurrence,
      // Save ID to correct field
      cardId: isCard ? selectedSource : undefined,
      accountId: !isCard ? selectedSource : undefined, 
    });

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
    setSelectedSource("");
    setRecurrence("variable");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      
      <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white sm:max-w-[420px] p-6 gap-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            Nova {isIncome ? 'Receita' : 'Despesa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-zinc-500 dark:text-zinc-400 text-xs">Descrição</Label>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className={`bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-10 ${ringColor}`}
              placeholder={isIncome ? "Ex: Salário" : "Ex: Supermercado"}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <Label className="text-zinc-500 dark:text-zinc-400 text-xs">Valor</Label>
               <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className={`pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-10 ${ringColor}`}
                    placeholder="0,00"
                  />
               </div>
            </div>
            <div className="space-y-1.5">
               <Label className="text-zinc-500 dark:text-zinc-400 text-xs">Data</Label>
               <Input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className={`bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-10 text-sm ${ringColor}`}
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <Label className="text-zinc-500 dark:text-zinc-400 text-xs">Conta/Cartão</Label>
               <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className={`bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-10 text-zinc-700 dark:text-zinc-200 text-xs ${ringColor}`}>
                      <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                      {accounts.length > 0 && (
                          <SelectGroup>
                              <SelectLabel className="text-xs text-zinc-500 px-2 py-1.5 font-bold uppercase tracking-wider">Contas</SelectLabel>
                              {accounts.map(acc => (
                                  <SelectItem key={acc.id} value={acc.id} className="cursor-pointer">
                                      <div className="flex items-center gap-2">
                                          <Landmark className="h-3 w-3 text-emerald-500" />
                                          <span>{acc.name}</span>
                                      </div>
                                  </SelectItem>
                              ))}
                          </SelectGroup>
                      )}
                      {cards.length > 0 && (
                          <SelectGroup>
                              {accounts.length > 0 && <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 mx-2" />}
                              <SelectLabel className="text-xs text-zinc-500 px-2 py-1.5 font-bold uppercase tracking-wider">Cartões</SelectLabel>
                              {cards.map(card => (
                                  <SelectItem key={card.id} value={card.id} className="cursor-pointer">
                                      <div className="flex items-center gap-2">
                                          <CreditCard className="h-3 w-3 text-purple-500" />
                                          <span>{card.name}</span>
                                      </div>
                                  </SelectItem>
                              ))}
                          </SelectGroup>
                      )}
                  </SelectContent>
               </Select>
            </div>

            <div className="space-y-1.5">
               <Label className="text-zinc-500 dark:text-zinc-400 text-xs">Categoria</Label>
               <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={`bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-10 text-zinc-700 dark:text-zinc-200 text-xs ${ringColor}`}>
                      <SelectValue placeholder="Buscar..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 max-h-[250px]">
                      {currentCategories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="cursor-pointer">
                              {cat}
                          </SelectItem>
                      ))}
                  </SelectContent>
               </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 px-2">
              <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => setRecurrence(recurrence === 'fixed' ? 'variable' : 'fixed')}>
                  <div className={`h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-all ${recurrence === 'fixed' ? 'border-blue-500 text-blue-500' : 'group-hover:border-zinc-400 dark:group-hover:border-zinc-600 text-zinc-400'}`}>
                      <Repeat className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] ${recurrence === 'fixed' ? 'text-blue-500' : 'text-zinc-500'}`}>Repetir</span>
              </div>
              
              <div className="flex flex-col items-center gap-1 group cursor-not-allowed opacity-50"><div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400"><MessageSquare className="h-4 w-4" /></div><span className="text-[10px] text-zinc-500">Obs</span></div>
              <div className="flex flex-col items-center gap-1 group cursor-not-allowed opacity-50"><div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400"><Paperclip className="h-4 w-4" /></div><span className="text-[10px] text-zinc-500">Anexo</span></div>
              <div className="flex flex-col items-center gap-1 group cursor-not-allowed opacity-50"><div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400"><Tag className="h-4 w-4" /></div><span className="text-[10px] text-zinc-500">Tags</span></div>
          </div>

          <div className="flex justify-center pt-2">
             <Button type="submit" className={`h-16 w-16 rounded-full shadow-lg shadow-black/20 dark:shadow-black/50 transition-transform active:scale-95 ${btnColor} flex items-center justify-center`}>
                 <Check className="h-8 w-8 text-white" />
             </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}