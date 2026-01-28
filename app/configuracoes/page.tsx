"use client";

import { useState, useEffect } from "react";
import { useFinance, DateFilterType } from "@/lib/finance-context";
import { addDays, isAfter, isBefore } from "date-fns";
import { 
  ArrowDownCircle, TrendingUp, TrendingDown, Scale, 
  Plus, Minus, Eye, EyeOff, Calendar, Landmark,
  Sun, Moon
} from "lucide-react";

// DND Kit Imports (Essenciais para arrastar)
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Widget } from "@/components/dashboard/widget"; 
import { NewTransactionDialog } from "@/components/dashboard/new-transaction-dialog";
import { TransferDialog } from "@/components/dashboard/transfer-dialog";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { AccountsCards } from "@/components/dashboard/accounts-cards";
import { CardsWidget } from "@/components/dashboard/cards-widget";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import { NewAccountDialog } from "@/components/dashboard/new-account-dialog";
import { MiddleWidgets } from "@/components/dashboard/middle-widgets";
import { CustomizeDashboardDialog } from "@/components/dashboard/customize-dialog";
import { BalanceChartWidget, ChartFilterType } from "@/components/dashboard/balance-chart"; 
import { CustomDateDialog } from "@/components/dashboard/custom-date-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Componente para tornar o Widget arrastável
function SortableItem({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
    opacity: isDragging ? 0.8 : 1,
    height: "100%", // Garante altura correta ao arrastar
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={className}>
      {children}
    </div>
  );
}

export default function Home() {
  const { 
    filteredTransactions, transactions, accounts, 
    isVisible, toggleVisibility, 
    dateFilter, setDateFilter,
    theme, toggleTheme 
  } = useFinance();

  const [balanceFilter, setBalanceFilter] = useState<ChartFilterType>("month");
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ordem Padrão (Caso não tenha nada salvo)
  const defaultOrder = [
    "minhas-contas", 
    "meus-cartoes", 
    "gastos-mes", 
    "balanco-periodo", 
    "limite-gastos"
  ];

  const [items, setItems] = useState(defaultOrder);
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);

  // 1. CARREGAR DO LOCALSTORAGE (Apenas uma vez ao iniciar)
  useEffect(() => {
    setIsMounted(true);
    const savedOrder = localStorage.getItem("finance_v2_order"); // Nova chave
    const savedHidden = localStorage.getItem("finance_v2_hidden");

    if (savedOrder) {
        try { 
            const parsed = JSON.parse(savedOrder);
            if (Array.isArray(parsed) && parsed.length > 0) setItems(parsed);
        } catch (e) { console.error("Erro ao carregar ordem:", e); }
    }
    
    if (savedHidden) {
        try { setHiddenWidgets(JSON.parse(savedHidden)); } catch (e) { console.error("Erro ao carregar ocultos:", e); }
    }
  }, []);

  // 2. SALVAMENTO AUTOMÁTICO (Sempre que 'items' ou 'hiddenWidgets' mudar)
  useEffect(() => {
    if (isMounted) {
        localStorage.setItem("finance_v2_order", JSON.stringify(items));
        localStorage.setItem("finance_v2_hidden", JSON.stringify(hiddenWidgets));
    }
  }, [items, hiddenWidgets, isMounted]);

  // Função de Drag and Drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.indexOf(active.id as string);
        const newIndex = currentItems.indexOf(over.id as string);
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }
  }

  // Função chamada pelo Dialog de Personalizar
  const handleLayoutUpdate = (newOrder: string[], newHidden: string[]) => { 
      // Atualiza o estado, o useEffect acima cuidará de salvar
      setItems(newOrder); 
      setHiddenWidgets(newHidden); 
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Evita arrastar ao clicar
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleFilterChange = (val: DateFilterType) => val === "custom" ? setIsCustomDateOpen(true) : setDateFilter(val);
  const formatMoney = (val: number) => !isVisible ? "••••" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // --- CÁLCULOS ---
  const totalAccountBalance = accounts.reduce((acc, account) => acc + Number(account.balance), 0);
  const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const expense = filteredTransactions.filter(t => t.type === 'expense' && !t.cardId).reduce((acc, t) => acc + Number(t.amount), 0);
  
  const today = new Date();
  const next30Days = addDays(today, 30);
  const pendingIncome30d = transactions.filter(t => t.type === 'income' && t.status === 'pending' && isAfter(new Date(t.date), today) && isBefore(new Date(t.date), next30Days)).reduce((acc, t) => acc + Number(t.amount), 0);
  const pendingExpense30d = transactions.filter(t => t.type === 'expense' && t.status === 'pending' && !t.cardId && isAfter(new Date(t.date), today) && isBefore(new Date(t.date), next30Days)).reduce((acc, t) => acc + Number(t.amount), 0);
  const forecastBalance = totalAccountBalance + pendingIncome30d - pendingExpense30d;

  const recentTransactions = filteredTransactions.filter(t => !t.cardId).slice(0, 5);

  const renderWidget = (id: string) => {
    switch (id) {
      case "minhas-contas": return <Widget title="Minhas Contas" action={<NewAccountDialog />}><AccountsCards /></Widget>;
      case "meus-cartoes": return <Widget title="Meus Cartões"><CardsWidget /></Widget>;
      case "balanco-periodo": return (
             <Widget title="Balanço do Período" action={
                 <Select value={balanceFilter} onValueChange={(val) => setBalanceFilter(val as ChartFilterType)}>
                    <SelectTrigger className="h-7 w-[130px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 focus:ring-0"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200">
                        <SelectItem value="7d">Últimos 7 dias</SelectItem><SelectItem value="4w">Últimas 4 semanas</SelectItem><SelectItem value="month">Mês atual</SelectItem><SelectItem value="12m">Últimos 12 meses</SelectItem>
                    </SelectContent>
                 </Select>}>
                <BalanceChartWidget period={balanceFilter} />
             </Widget>);
      case "gastos-mes": return <Widget title="Análise de Gastos" icon={<ArrowDownCircle className="h-4 w-4 text-red-500"/>}><div className="h-40 -ml-4"><DashboardCharts /></div></Widget>;
      case "limite-gastos": return <Widget title="Teto de Gastos" icon={<Scale className="h-4 w-4 text-[#2940bb]"/>}><div className="mt-2"><BudgetProgress /></div></Widget>;
      default: return null;
    }
  };

  const visibleItems = items.filter(id => !hiddenWidgets.includes(id));
  if (!isMounted) return null; // Evita erro de hidratação

  return (
    <main className="space-y-8 w-full text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-black min-h-screen px-4 pb-20 pt-10 md:px-8 md:pt-12 transition-colors duration-300">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end py-2 border-b border-zinc-200 dark:border-zinc-800 gap-4 w-full">
        <div className="flex flex-wrap justify-start items-start gap-8 w-full md:w-auto">
            {/* SALDO */}
            <div className="flex flex-col items-start gap-1 text-left min-w-[140px]">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Landmark className="h-3.5 w-3.5 text-zinc-500" /> Saldo em Contas
                </span>
                <span className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight text-left">
                    {formatMoney(totalAccountBalance)}
                </span>
            </div>
            <div className="hidden md:block w-px h-10 bg-zinc-200 dark:bg-zinc-800 mt-1"></div>
            
            {/* FATURAMENTO */}
            <div className="flex flex-col items-start gap-1 text-left min-w-[140px]">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" /> Faturamento
                </span>
                <span className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-500 tracking-tight text-left">
                    {formatMoney(income)}
                </span>
            </div>

            {/* DESPESAS */}
            <div className="flex flex-col items-start gap-1 text-left min-w-[140px]">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-500" /> Despesas
                </span>
                <span className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-500 tracking-tight text-left">
                    {formatMoney(expense)}
                </span>
            </div>
             <div className="hidden md:block w-px h-10 bg-zinc-200 dark:bg-zinc-800 mt-1"></div>
             
             {/* PREVISÃO */}
             <div className="flex flex-col items-start gap-1 text-left min-w-[140px]">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#2940bb]" /> Previsão (30d)
                </span>
                <span className={`text-2xl md:text-3xl font-bold tracking-tight text-left ${forecastBalance >= 0 ? "text-[#2940bb]" : "text-orange-500"}`}>
                    {formatMoney(forecastBalance)}
                </span>
            </div>
        </div>

        {/* CONTROLES */}
        <div className="w-full md:w-auto flex justify-start md:justify-end pb-2 md:pb-0">
            <div className="flex items-center gap-2">
                <Select value={dateFilter} onValueChange={(val) => handleFilterChange(val as DateFilterType)}>
                    <SelectTrigger className="h-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 min-w-[120px] text-xs gap-2 focus:ring-0 rounded-md">
                        <Calendar className="h-3 w-3 text-zinc-500" />
                        <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                        <SelectItem value="hoje">Hoje</SelectItem><SelectItem value="semana">Semana</SelectItem><SelectItem value="mes">Mês</SelectItem><SelectItem value="tudo">Tudo</SelectItem>
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1"></div>
                        <SelectItem value="custom" className="text-[#2940bb] font-medium">Personalizado...</SelectItem>
                    </SelectContent>
                </Select>
                <CustomDateDialog open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen} />
                
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
                
                <Button variant="ghost" size="icon" onClick={toggleVisibility} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md h-8 w-8">
                    {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>

                <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md h-8 w-8">
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                <CustomizeDashboardDialog items={items} hiddenItems={hiddenWidgets} onUpdate={handleLayoutUpdate} />
            </div>
        </div>
      </div>

      {/* ATALHOS RÁPIDOS */}
      <div className="flex justify-start items-center gap-3 overflow-x-auto pb-1 scrollbar-hide w-full">
        <NewTransactionDialog defaultType="income">
            <Button className="h-9 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg px-5 gap-2 transition-all group shrink-0 text-sm shadow-sm">
                <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500 group-hover:text-black transition-colors"><Plus className="h-2.5 w-2.5 text-green-600 dark:text-green-500 group-hover:text-white dark:group-hover:text-black" /></div>
                <span className="font-medium">Receita</span>
            </Button>
        </NewTransactionDialog>
        <NewTransactionDialog defaultType="expense">
            <Button className="h-9 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg px-5 gap-2 transition-all group shrink-0 text-sm shadow-sm">
                <div className="h-4 w-4 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors"><Minus className="h-2.5 w-2.5 text-red-600 dark:text-red-500 group-hover:text-white" /></div>
                <span className="font-medium">Despesa / Conta</span>
            </Button>
        </NewTransactionDialog>
        <div className="shrink-0"><TransferDialog /></div>
      </div>

      <MiddleWidgets />

      {/* GRID DE WIDGETS COM SORTABLE */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleItems} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(240px,auto)] pb-10">
            {visibleItems.map((id) => (
                <SortableItem key={id} id={id} className={`min-h-[240px] ${id === "balanco-periodo" ? "md:col-span-2" : "col-span-1"}`}>
                    {renderWidget(id)}
                </SortableItem>
            ))}
            
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                 <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white">Últimas Transações</CardTitle>
                            <CardDescription className="text-zinc-500 dark:text-zinc-400">Histórico recente de movimentações (Contas).</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800">Ver todas</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {recentTransactions.length === 0 ? (
                                <p className="text-zinc-500 text-sm py-4 text-center">Nenhuma transação no período.</p>
                            ) : (
                                recentTransactions.map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 rounded-lg transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center 
                                                ${t.type === 'income' 
                                                    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' 
                                                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'}
                                            `}>
                                                {t.type === 'income' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-200">{t.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                    <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                                                    <span>•</span>
                                                    <span>{t.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-900 dark:text-white'}`}>
                                            {t.type === 'expense' && "- "}{formatMoney(t.amount)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                 </Card>
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </main>
  );
}