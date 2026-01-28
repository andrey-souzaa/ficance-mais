"use client";

import { useState, useEffect } from "react";
import { useFinance, Card } from "@/lib/finance-context";
import { CreditCard } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  card: Card;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCardDialog({ card, isOpen, onClose }: Props) {
  const { editCard } = useFinance();

  const [name, setName] = useState(card.name);
  const [limit, setLimit] = useState(card.limit.toString());
  const [closingDay, setClosingDay] = useState(card.closingDate.toString());
  const [dueDay, setDueDay] = useState(card.dueDate.toString());

  // Atualiza o formulário se o cartão mudar
  useEffect(() => {
    if (isOpen) {
        setName(card.name);
        setLimit(card.limit.toString());
        setClosingDay(card.closingDate.toString());
        setDueDay(card.dueDate.toString());
    }
  }, [card, isOpen]);

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !limit) return;

    editCard(card.id, {
      name,
      limit: Number(limit),
      closingDate: Number(closingDay) || 1,
      dueDate: Number(dueDay) || 10,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[400px] p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-left text-lg font-semibold text-zinc-100">
            Editar cartão
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center justify-center gap-2 pb-2">
            <div className="h-20 w-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
                <CreditCard className="h-8 w-8 text-zinc-600" />
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">ícone do cartão</span>
          </div>

          <div className="space-y-1">
            <Label className="text-zinc-400 text-xs font-normal">Nome do cartão</Label>
            <Input className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 h-9 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label className="text-zinc-400 text-xs font-normal">Limite</Label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
                <Input type="number" className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 h-9 text-sm" value={limit} onChange={(e) => setLimit(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label className="text-zinc-400 text-xs font-normal">Fecha dia</Label>
                <Select value={closingDay} onValueChange={setClosingDay}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-300 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[200px]">{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label className="text-zinc-400 text-xs font-normal">Vence dia</Label>
                <Select value={dueDay} onValueChange={setDueDay}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-300 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[200px]">{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <Button type="button" variant="ghost" onClick={onClose} className="flex-1 hover:bg-zinc-900 text-zinc-400 h-12">Cancelar</Button>
             <Button type="submit" className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-12 rounded-md transition-all">Salvar Alterações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}