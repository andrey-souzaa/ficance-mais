"use client";

import { useState, useEffect } from "react";
import { useFinance } from "@/lib/finance-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { Check, Repeat, MessageSquareText, Paperclip, Tag, CreditCard, Landmark } from "lucide-react";

// Adicionamos a interface para aceitar o gatilho personalizado
interface TransferDialogProps {
  customTrigger?: React.ReactNode;
}

export function TransferDialog({ customTrigger }: TransferDialogProps) {
  const { accounts, cards, addTransfer } = useFinance();
  const [open, setOpen] = useState(false);

  // Estados
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [description, setDescription] = useState("Transferência");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!fromId || !toId || !amount || !date) return;
    if (fromId === toId) {
      alert("Selecione origens e destinos diferentes.");
      return;
    }

    addTransfer(
      fromId, 
      toId, 
      Number(amount), 
      new Date(date).toISOString()
    );

    setFromId("");
    setToId("");
    setAmount("");
    setOpen(false);
  };

  const renderSelectItems = (excludeId?: string) => (
    <>
      {/* Contas */}
      {accounts.length > 0 && (
        <SelectGroup>
          <SelectLabel className="text-xs text-zinc-500 uppercase tracking-wider px-2 py-1.5">Contas</SelectLabel>
          {accounts
            .filter(acc => acc.id !== excludeId)
            .map(acc => (
            <SelectItem key={acc.id} value={acc.id}>
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-zinc-400" />
                <span>{acc.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      )}

      {/* Divisor */}
      {accounts.length > 0 && cards.length > 0 && <div className="h-px bg-zinc-800 my-1" />}

      {/* Cartões */}
      {cards.length > 0 && (
        <SelectGroup>
          <SelectLabel className="text-xs text-zinc-500 uppercase tracking-wider px-2 py-1.5">Cartões</SelectLabel>
          {cards
            .filter(card => card.id !== excludeId)
            .map(card => (
            <SelectItem key={card.id} value={card.id}>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-zinc-400" />
                <span>{card.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      )}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* LÓGICA DO GATILHO: Se passar um botão customizado, usa ele. Se não, usa o padrão amarelo. */}
        {customTrigger ? customTrigger : (
            <Button variant="ghost" className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-full px-6 border border-zinc-800">
                → Transferir
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white p-6 gap-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Transferência entre contas</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-5">
          
          {/* Saiu de */}
          <div className="grid gap-2">
            <Label className="text-zinc-400 font-normal">Saiu da conta</Label>
            <Select value={fromId} onValueChange={setFromId}>
              <SelectTrigger className="bg-transparent border-zinc-700 h-11 focus:ring-0 focus:border-yellow-500">
                <SelectValue placeholder="Buscar conta..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {renderSelectItems(toId)}
              </SelectContent>
            </Select>
          </div>

          {/* Entrou em */}
          <div className="grid gap-2">
            <Label className="text-zinc-400 font-normal">Entrou na conta</Label>
            <Select value={toId} onValueChange={setToId}>
              <SelectTrigger className="bg-transparent border-zinc-700 h-11 focus:ring-0 focus:border-yellow-500">
                <SelectValue placeholder="Buscar conta..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {renderSelectItems(fromId)}
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="grid gap-2">
            <Label className="text-zinc-400 font-normal">Descrição</Label>
            <Input 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent border-zinc-700 h-11 focus:border-yellow-500 focus:ring-0"
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-zinc-400 font-normal">Valor</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">R$</span>
                <Input 
                  type="number"
                  step="0.01" 
                  placeholder="0,00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-zinc-700 pl-10 h-11 focus:border-yellow-500 focus:ring-0"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label className="text-zinc-400 font-normal">Data</Label>
              <Input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-zinc-700 h-11 focus:border-yellow-500 focus:ring-0 block w-full [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Ações Extras */}
          <div className="flex justify-between items-center pt-2 px-2">
            <ActionButton icon={Repeat} label="Repetir" />
            <ActionButton icon={Tag} label="Tags" />
            <ActionButton icon={MessageSquareText} label="Observação" />
            <ActionButton icon={Paperclip} label="Anexo" />
          </div>

          {/* Botão Confirmar */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleSubmit}
              className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            >
              <Check className="h-8 w-8 stroke-[3]" />
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionButton({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-600 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs text-zinc-500 group-hover:text-zinc-300">{label}</span>
    </div>
  );
}