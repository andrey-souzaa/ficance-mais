"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinance } from "@/lib/finance-context";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomDateDialog({ open, onOpenChange }: Props) {
  const { setDateRange, setDateFilter } = useFinance();
  
  // Estados locais para inputs do tipo "date"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApply = () => {
    if (!startDate || !endDate) return;

    // Converte strings "YYYY-MM-DD" para Date com fuso correto
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T23:59:59");

    setDateRange({ from: start, to: end });
    setDateFilter("custom"); // Garante que o filtro ative
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Período Personalizado</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Data Inicial</Label>
            <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="bg-zinc-900 border-zinc-800 text-white w-full"
            />
          </div>
          <div className="grid gap-2">
            <Label>Data Final</Label>
            <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="bg-zinc-900 border-zinc-800 text-white w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white">
            Cancelar
          </Button>
          <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white">
            Aplicar Filtro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}