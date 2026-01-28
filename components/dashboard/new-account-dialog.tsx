"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function NewAccountDialog() {
  const { addAccount } = useFinance();
  const [open, setOpen] = useState(false);
  
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addAccount({ 
        name, 
        balance: Number(balance) || 0,
        type: "checking" // Campo obrigatório padrão
    });
    
    setOpen(false);
    setName(""); 
    setBalance("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10">
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
            <DialogTitle>Nova Conta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome da Conta</Label>
            <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: Nubank, Carteira, Cofre..." 
                className="bg-zinc-900 border-zinc-800 focus:ring-yellow-500/20" 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Saldo Inicial</Label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
                <Input 
                    type="number" 
                    value={balance} 
                    onChange={(e) => setBalance(e.target.value)} 
                    placeholder="0.00" 
                    className="bg-zinc-900 border-zinc-800 pl-9 focus:ring-yellow-500/20" 
                />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" className="bg-yellow-500 text-black hover:bg-yellow-600 w-full font-medium">
                Salvar Conta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}