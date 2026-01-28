// components/dashboard/budget-progress.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, AlertCircle } from "lucide-react";
import { useFinance } from "@/lib/finance-context";
import { cn } from "@/lib/utils";

export function BudgetProgress() {
  const { transactions } = useFinance();
  const [budgetLimit, setBudgetLimit] = useState<number>(2000); // Começa com R$ 2000 padrão
  const [tempLimit, setTempLimit] = useState("");
  const [open, setOpen] = useState(false);

  // 1. Carregar o limite salvo no navegador
  useEffect(() => {
    const savedLimit = localStorage.getItem("finance_budget_limit");
    if (savedLimit) {
      setBudgetLimit(parseFloat(savedLimit));
    }
  }, []);

  // 2. Salvar novo limite
  const handleSave = () => {
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val > 0) {
      setBudgetLimit(val);
      localStorage.setItem("finance_budget_limit", val.toString());
      setOpen(false);
    }
  };

  // 3. Somar gastos APENAS do mês atual
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === "expense" &&
          tDate.getMonth() === now.getMonth() &&
          tDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [transactions]);

  // Cálculos visuais
  const percentage = (currentMonthExpenses / budgetLimit) * 100;
  const isOverBudget = percentage > 100;

  // Formatador de dinheiro (R$)
  const formatMoney = (val: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Orçamento Mensal</CardTitle>
        
        {/* Modal para editar o teto */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Definir Teto de Gastos</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="limit">Valor Máximo (R$)</Label>
                <Input
                  id="limit"
                  type="number"
                  placeholder={budgetLimit.toString()}
                  onChange={(e) => setTempLimit(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold flex items-center gap-2 mb-2">
          {formatMoney(currentMonthExpenses)}
          {isOverBudget && <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />}
        </div>
        
        <div className="space-y-2">
          {/* Barra de progresso com cor condicional */}
          <Progress 
            value={Math.min(percentage, 100)} 
            className={cn("h-2", isOverBudget && "[&>div]:bg-red-600")} 
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className={isOverBudget ? "text-red-500 font-bold" : ""}>
              {percentage.toFixed(0)}% usado
            </span>
            <span>Meta: {formatMoney(budgetLimit)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}