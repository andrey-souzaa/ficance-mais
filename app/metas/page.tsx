"use client";

import { useState } from "react";
import { useFinance, Goal } from "@/lib/finance-context";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Plus, 
  Trash2, 
  MoreHorizontal, 
  Calendar,
  Check,
  Plane,
  Car,
  Home as HomeIcon,
  Laptop,
  Smartphone
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function GoalsPage() {
  const { goals, addGoal, removeGoal, addValueToGoal, accounts, isVisible } = useFinance();
  
  // CORREÇÃO DO ERRO REDUCE (Blindagem)
  const safeGoals = goals || []; 
  
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [isAddValueOpen, setIsAddValueOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [date, setDate] = useState("");
  const [icon, setIcon] = useState("target");

  const [amountToAdd, setAmountToAdd] = useState("");
  const [sourceAccount, setSourceAccount] = useState("manual");

  const formatMoney = (val: number) => {
      if (!isVisible) return "••••";
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const handleCreateGoal = () => {
      if (!name || !target || !date) return;
      addGoal({
          name,
          targetAmount: Number(target),
          currentAmount: Number(current) || 0,
          deadline: date,
          icon,
          color: "blue"
      });
      setIsNewGoalOpen(false);
      setName(""); setTarget(""); setCurrent(""); setDate("");
  };

  const handleAddValue = () => {
      if (!selectedGoal || !amountToAdd) return;
      const accountId = sourceAccount === 'manual' ? undefined : sourceAccount;
      
      addValueToGoal(selectedGoal.id, Number(amountToAdd), accountId);
      
      setIsAddValueOpen(false);
      setAmountToAdd("");
      setSelectedGoal(null);
  };

  const totalSaved = safeGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = safeGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const globalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const getIcon = (iconName: string) => {
      switch(iconName) {
          case 'plane': return <Plane className="h-5 w-5" />;
          case 'car': return <Car className="h-5 w-5" />;
          case 'home': return <HomeIcon className="h-5 w-5" />;
          case 'laptop': return <Laptop className="h-5 w-5" />;
          case 'phone': return <Smartphone className="h-5 w-5" />;
          default: return <Target className="h-5 w-5" />;
      }
  };

  return (
    <div className="space-y-8 w-full max-w-[1200px] mx-auto p-6 min-h-screen text-zinc-900 dark:text-zinc-100">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-zinc-900 dark:text-white">
                {/* ÍCONE AZUL */}
                <Target className="h-8 w-8 text-[#2940bb]" /> Minhas Metas
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Acompanhe o progresso dos seus sonhos.</p>
        </div>
        
        <Dialog open={isNewGoalOpen} onOpenChange={setIsNewGoalOpen}>
            <DialogTrigger asChild>
                {/* BOTÃO AZUL */}
                <Button className="bg-[#2940bb] hover:bg-[#2940bb]/90 text-white font-bold">
                    <Plus className="h-4 w-4 mr-2" /> Nova Meta
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                <DialogHeader><DialogTitle>Criar Nova Meta</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nome do Objetivo</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Viagem Europa" className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Valor Alvo (R$)</Label>
                            <Input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="10000" className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <Label>Já guardado (R$)</Label>
                            <Input type="number" value={current} onChange={e => setCurrent(e.target.value)} placeholder="0" className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Data Alvo</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                    </div>
                    <div className="space-y-2">
                        <Label>Ícone</Label>
                        <Select value={icon} onValueChange={setIcon}>
                            <SelectTrigger className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                                <SelectItem value="target">🎯 Objetivo Geral</SelectItem>
                                <SelectItem value="plane">✈️ Viagem</SelectItem>
                                <SelectItem value="car">🚗 Veículo</SelectItem>
                                <SelectItem value="home">🏠 Casa</SelectItem>
                                <SelectItem value="laptop">💻 Eletrônico</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    {/* BOTÃO AZUL */}
                    <Button onClick={handleCreateGoal} className="bg-[#2940bb] hover:bg-[#2940bb]/90 text-white w-full">Criar Meta</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      {/* PAINEL GLOBAL */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
          {/* GRADIENTE AZUL */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2940bb] to-blue-500"></div>
          
          <div className="flex flex-col md:flex-row gap-8 justify-between items-end">
             <div>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Total Acumulado</p>
                 <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-bold text-zinc-900 dark:text-white">{formatMoney(totalSaved)}</span>
                     <span className="text-zinc-500 text-sm">de {formatMoney(totalTarget)}</span>
                 </div>
             </div>
             
             <div className="w-full md:w-1/2">
                 <div className="flex justify-between text-xs mb-2">
                     <span className="text-zinc-900 dark:text-white font-medium">Progresso Global</span>
                     {/* TEXTO AZUL */}
                     <span className="text-[#2940bb] font-bold">{Math.round(globalProgress)}% Concluído</span>
                 </div>
                 <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                     {/* BARRA DE PROGRESSO AZUL */}
                     <div className="h-full bg-gradient-to-r from-[#2940bb] to-blue-500 transition-all duration-1000" style={{ width: `${globalProgress}%` }}></div>
                 </div>
                 <p className="text-right text-[10px] text-zinc-500 mt-1">
                     Faltam <span className="text-zinc-700 dark:text-zinc-300 font-medium">{formatMoney(totalTarget - totalSaved)}</span> para atingir todas as metas.
                 </p>
             </div>
          </div>
      </div>

      {/* GRID DE METAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeGoals.map(goal => {
              const progress = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
              const isCompleted = progress >= 100;

              return (
                  <div key={goal.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group shadow-sm">
                      <div>
                          <div className="flex justify-between items-start mb-4">
                              {/* ÍCONE DE FUNDO (AZUL ou VERDE se completo) */}
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500' : 'bg-blue-100 text-[#2940bb] dark:bg-[#2940bb]/10 dark:text-[#2940bb] border dark:border-zinc-800'}`}>
                                  {getIcon(goal.icon)}
                              </div>
                              
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                                          <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                                      <DropdownMenuItem onClick={() => removeGoal(goal.id)} className="text-red-500 focus:bg-red-500/10 cursor-pointer">
                                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                      </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </div>

                          <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-1">{goal.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
                              <Calendar className="h-3 w-3" />
                              <span>Alvo: {goal.deadline ? format(new Date(goal.deadline), "dd/MM/yyyy") : "--/--/----"}</span>
                          </div>

                          <div className="space-y-2 mb-6">
                              <div className="flex justify-between items-end">
                                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">{formatMoney(goal.currentAmount)}</span>
                                  {isCompleted && <span className="text-xs bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-500 px-2 py-0.5 rounded font-bold">100%</span>}
                              </div>
                              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                  {/* BARRA INDIVIDUAL AZUL */}
                                  <div className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-emerald-500' : 'bg-[#2940bb]'}`} style={{ width: `${progress}%` }}></div>
                              </div>
                              <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                                  <span>Atual</span>
                                  <span>Meta: {formatMoney(goal.targetAmount)}</span>
                              </div>
                          </div>
                      </div>

                      {isCompleted ? (
                          <div className="w-full py-2.5 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-sm font-bold flex items-center justify-center gap-2">
                              <Check className="h-4 w-4" /> Meta Concluída! 🎉
                          </div>
                      ) : (
                          <Button 
                            variant="outline" 
                            className="w-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white transition-all"
                            onClick={() => { setSelectedGoal(goal); setIsAddValueOpen(true); }}
                          >
                              Adicionar Valor
                          </Button>
                      )}
                  </div>
              );
          })}
      </div>

      {/* MODAL ADICIONAR VALOR */}
      <Dialog open={isAddValueOpen} onOpenChange={setIsAddValueOpen}>
          <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
              <DialogHeader>
                  <DialogTitle>Adicionar Valor: {selectedGoal?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label>Quanto você guardou?</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
                        <Input 
                            type="number" 
                            value={amountToAdd} 
                            onChange={e => setAmountToAdd(e.target.value)} 
                            className="pl-9 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-lg" 
                            autoFocus
                        />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <Label>Origem do dinheiro</Label>
                      <Select value={sourceAccount} onValueChange={setSourceAccount}>
                          <SelectTrigger className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                              <SelectItem value="manual">🔹 Apenas atualizar valor (Manual)</SelectItem>
                              {accounts && accounts.map(acc => (
                                  <SelectItem key={acc.id} value={acc.id}>
                                      🏦 Debitar de {acc.name} ({formatMoney(acc.balance)})
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      <p className="text-[10px] text-zinc-500">
                          {sourceAccount !== 'manual' 
                              ? "Será criada uma despesa de 'Investimento' na conta selecionada." 
                              : "O saldo das suas contas bancárias não será alterado."}
                      </p>
                  </div>
              </div>
              <DialogFooter>
                  {/* BOTÃO AZUL */}
                  <Button onClick={handleAddValue} className="bg-[#2940bb] hover:bg-[#2940bb]/90 text-white w-full">Confirmar Aporte</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}