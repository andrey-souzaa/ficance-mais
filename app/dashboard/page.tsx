"use client";

import { useState, useEffect } from "react";
import { useFinance, DateFilterType } from "@/lib/finance-context";
import { addDays, isAfter, isBefore } from "date-fns";
import { 
  ArrowDownCircle, TrendingUp, TrendingDown, Scale, 
  Plus, Minus, Eye, EyeOff, Calendar, Landmark,
  Sun, Moon, Wallet, ArrowUpCircle, Clock, CreditCard // Adicionados ícones novos
} from "lucide-react";

// DND Kit Imports
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
import Link from "next/link";

// Componente para tornar o Widget arrastável
function SortableItem({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
    opacity: isDragging ? 0.8 : 1,
    height: "100%",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={className}>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { 
    filteredTransactions, transactions, accounts, 
    isVisible, toggleVisibility, 
    dateFilter, setDateFilter,
    theme, toggleTheme 
  } = useFinance();

  const [balanceFilter, setBalanceFilter] = useState<ChartFilterType>("month");
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ordem Padrão
  const defaultOrder = [
    "minhas-contas", 
    "meus-cartoes", 
    "gastos-mes", 
    "balanco-periodo", 
    "limite-gastos"
  ];

  const [items, setItems] = useState(defaultOrder);
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);

  // Carregar do LocalStorage
  useEffect(() => {
    setIsMounted(true);
    const savedOrder = localStorage.getItem("finance_v2_order");
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

  // Salvar no LocalStorage
  useEffect(() => {
    if (isMounted) {
        localStorage.setItem("finance_v2_order", JSON.stringify(items));
        localStorage.setItem("finance_v2_hidden", JSON.stringify(hiddenWidgets));
    }
  }, [items, hiddenWidgets, isMounted]);

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

  const handleLayoutUpdate = (newOrder: string[], newHidden: string[]) => { 
      setItems(newOrder); 
      setHiddenWidgets(newHidden); 
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleFilterChange = (val: DateFilterType) => val === "custom" ? setIsCustomDateOpen(true) : setDateFilter(val);
  const formatMoney = (val: number) => !isVisible ? "••••" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // --- CÁLCULOS FINANCEIROS (COM PREVISÃO) ---
  
  // 1. Saldo Real (Contas)
  const totalAccountBalance = accounts.reduce((acc, account) => acc + Number(account.balance), 0);
  
  // 2. Receitas e Despesas do Filtro (Para os gráficos)
  const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const expense = filteredTransactions.filter(t => t.type === 'expense' && !t.cardId).reduce((acc, t) => acc + Number(t.amount), 0);

  // 3. Cálculos de Pendências (Geral) para Previsão
  // Pega tudo que é 'expense' e está 'pending' (contas a pagar)
  const pendingExpenses = transactions
    .filter(t => t.status === 'pending' && t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  // Pega tudo que é 'income' e está 'pending' (a receber)
  const pendingIncomes = transactions
    .filter(t => t.status === 'pending' && t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  // 4. Previsão: Saldo Atual + A Receber - A Pagar
  const forecastBalance = totalAccountBalance + pendingIncomes - pendingExpenses;

  // 5. Transações Recentes
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
  if (!isMounted) return null;

  return (
    <div className="space-y-8 w-full text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-black min-h-screen px-4 pb-20 pt-6 md:px-8 md:pt-8 transition-colors duration-300">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-2 gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Visão geral das suas finanças.</p>
        </div>
        
        {/* CONTROLES */}
        <div className="flex flex-wrap items-center gap-2">
             <Select value={dateFilter} onValueChange={(val) => handleFilterChange(val as DateFilterType)}>
                <SelectTrigger className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 min-w-[120px] text-xs gap-2 focus:ring-0 rounded-md">
                    <Calendar className="h-3 w-3 text-zinc-500" />
                    <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                    <SelectItem value="hoje">Hoje</SelectItem><SelectItem value="semana">Semana</SelectItem><SelectItem value="mes">Mês</SelectItem><SelectItem value="tudo">Tudo</SelectItem>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1"></div>
                    <SelectItem value="custom" className="text-[#2940bb] font-medium">Personalizado...</SelectItem>
                </SelectContent>
            </Select>
            <CustomDateDialog open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen} />

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
            
            <Button variant="outline" size="icon" onClick={toggleVisibility} className="h-9 w-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleTheme} className="h-9 w-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <CustomizeDashboardDialog items={items} hiddenItems={hiddenWidgets} onUpdate={handleLayoutUpdate} />
        </div>
      </div>

      {/* KPIS PRINCIPAIS - COM A LÓGICA NOVA DE PENDÊNCIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: SALDO TOTAL (Com aviso de saída) */}
        <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Saldo Total</CardTitle>
                <Wallet className="h-4 w-4 text-[#2940bb]" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {formatMoney(totalAccountBalance)}
                </div>
                {/* AQUI ESTÁ A LÓGICA DO VALOR A LIBERAR/SAIR */}
                {pendingExpenses > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 rounded-md w-fit border border-zinc-100 dark:border-zinc-800">
                        <Clock className="h-3 w-3 text-zinc-400" />
                        <span>A sair: <span className="text-red-500 font-medium">- {formatMoney(pendingExpenses)}</span></span>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* CARD 2: FATURAMENTO/RECEITAS */}
        <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Receitas (Mês)</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{formatMoney(income)}</div>
                <p className="text-xs text-zinc-500 mt-1">
                    {pendingIncomes > 0 ? `+ ${formatMoney(pendingIncomes)} a receber` : "Total recebido no período"}
                </p>
            </CardContent>
        </Card>

        {/* CARD 3: DESPESAS */}
        <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Despesas (Mês)</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-500">{formatMoney(expense)}</div>
                <p className="text-xs text-zinc-500 mt-1">
                    Total pago no período
                </p>
            </CardContent>
        </Card>

        {/* CARD 4: PREVISÃO (Lógica atualizada) */}
        <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Previsão de Saldo</CardTitle>
                <TrendingUp className="h-4 w-4 text-[#2940bb]" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${forecastBalance >= 0 ? 'text-[#2940bb]' : 'text-red-600'}`}>
                    {formatMoney(forecastBalance)}
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                    Após quitar pendências
                </p>
            </CardContent>
        </Card>
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

      {/* GRID DE WIDGETS COM DRAG AND DROP */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleItems} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(240px,auto)] pb-10">
            {visibleItems.map((id) => (
                <SortableItem key={id} id={id} className={`min-h-[240px] ${id === "balanco-periodo" ? "md:col-span-2" : "col-span-1"}`}>
                    {renderWidget(id)}
                </SortableItem>
            ))}
            
            {/* ÚLTIMAS TRANSAÇÕES (Fixo) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white">Últimas Transações</CardTitle>
                            <CardDescription className="text-zinc-500 dark:text-zinc-400">Histórico recente de movimentações (Contas).</CardDescription>
                        </div>
                        <Link href="/transacoes">
                            <Button variant="ghost" size="sm" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800">Ver todas</Button>
                        </Link>
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
    </div>
  );
}