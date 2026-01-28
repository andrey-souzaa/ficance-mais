"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-context";
import { CreditCard } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  children?: React.ReactNode;
}

export function NewCardDialog({ children }: Props) {
  const { addCard, accounts } = useFinance();
  const [open, setOpen] = useState(false);

  // Estados do Formulário
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");

  // Gera dias de 1 a 31 para o select
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples
    if (!name || !limit) return;

    addCard({
      name,
      limit: Number(limit),
      closingDate: Number(closingDay) || 1, // Padrão dia 1 se vazio
      dueDate: Number(dueDay) || 10,        // Padrão dia 10 se vazio
    });

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setLimit("");
    setClosingDay("");
    setDueDay("");
    setSelectedAccount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Se passar um botão personalizado usa ele, senão usa o padrão */}
        {children || <Button>Novo Cartão</Button>}
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[400px] p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-left text-lg font-semibold text-zinc-100">
            Novo cartão manual
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. Ícone Redondo Centralizado */}
          <div className="flex flex-col items-center justify-center gap-2 pb-2">
            <div className="h-20 w-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
                <CreditCard className="h-8 w-8 text-zinc-600" />
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">escolha um ícone</span>
          </div>

          {/* 2. Nome do Cartão */}
          <div className="space-y-1">
            <Label htmlFor="name" className="text-zinc-400 text-xs font-normal">Nome do cartão</Label>
            <Input
              id="name"
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 h-9 text-sm placeholder:text-zinc-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-[10px] text-zinc-600">Dê um nome para identificar este cartão</p>
          </div>

          {/* 3. Limite (Com R$ dentro) */}
          <div className="space-y-1">
            <Label htmlFor="limit" className="text-zinc-400 text-xs font-normal">Limite</Label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
                <Input
                  id="limit"
                  type="number"
                  placeholder="0,00"
                  className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 h-9 text-sm placeholder:text-zinc-700"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
            </div>
          </div>

          {/* 4. Datas (Lado a Lado) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label className="text-zinc-400 text-xs font-normal">Fecha dia</Label>
                <Select value={closingDay} onValueChange={setClosingDay}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-300 h-9 text-xs">
                        <SelectValue placeholder="1" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[200px]">
                        {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label className="text-zinc-400 text-xs font-normal">Vence dia</Label>
                <Select value={dueDay} onValueChange={setDueDay}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-300 h-9 text-xs">
                        <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[200px]">
                        {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>

          {/* 5. Conta Padrão */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
                <Label className="text-zinc-400 text-xs font-normal">Conta de pagamento padrão</Label>
                <span className="text-[10px] text-emerald-500 cursor-pointer hover:underline">saiba mais</span>
            </div>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-300 h-9 text-xs">
                    <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {accounts.length === 0 ? (
                        <div className="p-2 text-xs text-zinc-500 text-center">Nenhuma conta encontrada</div>
                    ) : (
                        accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
          </div>

          {/* Botão Cinza */}
          <div className="pt-4">
            <Button 
                type="submit" 
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium h-12 rounded-md transition-all"
            >
                Adicionar cartão
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}