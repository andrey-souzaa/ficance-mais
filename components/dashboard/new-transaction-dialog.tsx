"use client";

import { useState } from "react";
import { useFinance, TransactionType, TransactionStatus, RecurrenceType } from "@/lib/finance-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Repeat, MessageSquare, Paperclip, Tag, CreditCard, Landmark } from "lucide-react";

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
  const accentColor = isIncome ? "text-emerald-500" : "text-red-500";
  const ringColor = isIncome ? "focus-visible:ring-emerald-500" : "focus-visible:ring-red-500";
  const btnColor = isIncome ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    // Lógica Importante: Descobrir se é Cartão ou Conta
    const isCard = cards.some(c => c.id === selectedSource);
    
    addTransaction({
      description,
      amount: Number(amount),
      type,
      category: category || "Outros",
      date: new Date(date).toISOString(),
      // Se for Cartão -> Pendente. Se for Conta -> Pago (já debita)
      status: isCard ? 'pending' : 'paid', 
      recurrence,
      // Salva ID correto
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
      
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[420px] p-6 gap-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            Nova {isIncome ? 'Receita' : 'Despesa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Descrição</Label>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className={`bg-zinc-900 border-zinc-800 h-10 ${ringColor}`}
              placeholder={isIncome ? "Ex: Salário" : "Ex: Supermercado"}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <Label className="text-zinc-400 text-xs">Valor</Label>
               <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className={`pl-9 bg-zinc-900 border-zinc-800 h-10 ${ringColor}`}
                    placeholder="0,00"
                  />
               </div>
            </div>
            <div className="space-y-1.5">
               <Label className="text-zinc-400 text-xs">Data</Label>
               <div className="relative">
                   <Input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className={`bg-zinc-900 border-zinc-800 h-10 text-sm ${ringColor} [color-scheme:dark]`}
                   />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <Label className="text-zinc-400 text-xs">Conta/Cartão</Label>
               <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className={`bg-zinc-900 border-zinc-800 h-10 text-zinc-200 text-xs ${ringColor}`}>
                      <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectGroup>
                          <SelectLabel className="text-xs text-zinc-500 px-2 py-1.5 font-bold uppercase tracking-wider">Contas</SelectLabel>
                          {accounts.map(acc => (
                              <SelectItem key={acc.id} value={acc.id} className="focus:bg-zinc-800 cursor-pointer">
                                  <div className="flex items-center gap-2">
                                      <Landmark className="h-3 w-3 text-emerald-500" />
                                      <span>{acc.name}</span>
                                  </div>
                              </SelectItem>
                          ))}
                      </SelectGroup>
                      {cards.length > 0 && (
                          <SelectGroup>
                              <div className="h-px bg-zinc-800 my-1 mx-2" />
                              <SelectLabel className="text-xs text-zinc-500 px-2 py-1.5 font-bold uppercase tracking-wider">Cartões</SelectLabel>
                              {cards.map(card => (
                                  <SelectItem key={card.id} value={card.id} className="focus:bg-zinc-800 cursor-pointer">
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
               <Label className="text-zinc-400 text-xs">Categoria</Label>
               <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={`bg-zinc-900 border-zinc-800 h-10 text-zinc-200 text-xs ${ringColor}`}>
                      <SelectValue placeholder="Buscar..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white h-[200px]">
                      <SelectItem value="Alimentação">Alimentação</SelectItem>
                      <SelectItem value="Moradia">Moradia</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Lazer">Lazer</SelectItem>
                      <SelectItem value="Saúde">Saúde</SelectItem>
                      <SelectItem value="Salário">Salário</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
               </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 px-2">
              <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => setRecurrence(recurrence === 'fixed' ? 'variable' : 'fixed')}>
                  <div className={`h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-all ${recurrence === 'fixed' ? 'border-blue-500 text-blue-500' : 'group-hover:border-zinc-600 text-zinc-400'}`}>
                      <Repeat className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] ${recurrence === 'fixed' ? 'text-blue-500' : 'text-zinc-500'}`}>Repetir</span>
              </div>
              {/* Botões decorativos (sem função por enquanto) */}
              <div className="flex flex-col items-center gap-1 group cursor-not-allowed opacity-50"><div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400"><MessageSquare className="h-4 w-4" /></div><span className="text-[10px] text-zinc-500">Obs</span></div>
              <div className="flex flex-col items-center gap-1 group cursor-not-allowed opacity-50"><div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400"><Paperclip className="h-4 w-4" /></div><span className="text-[10px] text-zinc-500">Anexo</span></div>
              <div className="flex flex-col items-center gap-1 group cursor-not-allowed opacity-50"><div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400"><Tag className="h-4 w-4" /></div><span className="text-[10px] text-zinc-500">Tags</span></div>
          </div>

          <div className="flex justify-center pt-2">
             <Button type="submit" className={`h-16 w-16 rounded-full shadow-lg shadow-black/50 transition-transform active:scale-95 ${btnColor} flex items-center justify-center`}><Check className="h-8 w-8 text-white" /></Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}