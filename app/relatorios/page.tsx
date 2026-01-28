"use client";

import { useState, useMemo } from "react";
import { useFinance } from "@/lib/finance-context";
import { 
  BarChart3, 
  PieChart, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  TrendingUp,
  Calendar as CalendarIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  Pie, 
  Legend 
} from "recharts";

// Cores para o gráfico de pizza
const COLORS = ['#2940bb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
  const { transactions, isVisible } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString());

  // 1. FILTRAR TRANSAÇÕES PELO MÊS SELECIONADO
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => isSameMonth(new Date(t.date), new Date(selectedMonth)));
  }, [transactions, selectedMonth]);

  // 2. CÁLCULOS DOS KPIS
  const income = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  // 3. DADOS PARA O GRÁFICO DE CATEGORIAS (PIZZA)
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categorias
  }, [currentMonthTransactions]);

  // 4. DADOS PARA O GRÁFICO DE BARRAS (Últimos 6 meses)
  const monthlyData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthTrans = transactions.filter(t => isSameMonth(new Date(t.date), date));
      
      const inc = monthTrans.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const exp = monthTrans.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      
      data.push({
        name: format(date, 'MMM', { locale: ptBR }).toUpperCase(),
        Receitas: inc,
        Despesas: exp
      });
    }
    return data;
  }, [transactions]);

  // 5. TOP DESPESAS (Lista)
  const topExpenses = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [currentMonthTransactions]);

  const formatMoney = (val: number) => {
    if (!isVisible) return "••••";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto p-6 space-y-8 pb-20 text-zinc-900 dark:text-zinc-100">
      
      {/* HEADER E FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                <BarChart3 className="h-6 w-6 text-[#2940bb]" />
                Relatórios Financeiros
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Análise detalhada do seu desempenho.</p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
             <CalendarIcon className="h-4 w-4 text-zinc-500 ml-2" />
             <Select 
                value={selectedMonth} 
                onValueChange={setSelectedMonth}
             >
                <SelectTrigger className="w-[160px] border-0 bg-transparent focus:ring-0 text-zinc-700 dark:text-zinc-200 font-medium">
                    <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                    {Array.from({ length: 12 }).map((_, i) => {
                        const date = subMonths(new Date(), i);
                        return (
                            <SelectItem key={i} value={date.toISOString()}>
                                {format(date, "MMMM yyyy", { locale: ptBR })}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
             </Select>
        </div>
      </div>

      {/* KPIS (CARDS DE RESUMO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Receitas" 
            value={income} 
            icon={ArrowUpCircle} 
            color="text-emerald-600 dark:text-emerald-500" 
            bg="bg-emerald-50 dark:bg-emerald-500/10"
            formatter={formatMoney}
          />
          <KpiCard 
            title="Despesas" 
            value={expense} 
            icon={ArrowDownCircle} 
            color="text-red-600 dark:text-red-500" 
            bg="bg-red-50 dark:bg-red-500/10"
            formatter={formatMoney}
          />
          <KpiCard 
            title="Saldo do Mês" 
            value={balance} 
            icon={Wallet} 
            color={balance >= 0 ? "text-[#2940bb]" : "text-red-500"} 
            bg={balance >= 0 ? "bg-blue-50 dark:bg-blue-500/10" : "bg-red-50 dark:bg-red-500/10"}
            formatter={formatMoney}
          />
          {/* CORREÇÃO DO ERRO 1: Adicionado o tipo (val: number) */}
          <KpiCard 
            title="Taxa de Economia" 
            value={savingsRate} 
            icon={TrendingUp} 
            color="text-zinc-900 dark:text-white" 
            bg="bg-zinc-100 dark:bg-zinc-800"
            formatter={(val: number) => `${val.toFixed(1)}%`}
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GRÁFICO DE BARRAS (EVOLUÇÃO) */}
          <Card className="lg:col-span-2 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Fluxo de Caixa (6 Meses)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#71717a', fontSize: 12 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#71717a', fontSize: 12 }} 
                            tickFormatter={(value) => `R$${value/1000}k`}
                        />
                        {/* CORREÇÃO ERRO 2: Tipagem (value: any) para aceitar undefined do Recharts */}
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
                        />
                        <Legend iconType="circle" />
                        <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* GRÁFICO DE PIZZA (CATEGORIAS) */}
          <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
             <CardHeader>
                <CardTitle className="text-lg">Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                {categoryData.length === 0 ? (
                    <div className="text-center text-zinc-400">
                        <PieChart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Sem dados de despesa este mês.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            {/* CORREÇÃO ERRO 3: Tipagem (value: any) */}
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
                            />
                            <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom" 
                                align="center"
                                formatter={(value, entry: any) => <span className="text-xs text-zinc-500 ml-1">{value}</span>} 
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
          </Card>

      </div>

      {/* TOP DESPESAS */}
      <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-red-500" />
                    Maiores Gastos do Mês
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {topExpenses.length === 0 ? (
                         <p className="text-zinc-500 text-sm text-center py-4">Nenhuma despesa registrada.</p>
                    ) : (
                        topExpenses.map((t, i) => (
                            <div key={t.id} className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors rounded-lg">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-zinc-400 w-4">{i + 1}</span>
                                    <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-500">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{t.description}</p>
                                        <p className="text-xs text-zinc-500 capitalize">{t.category}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-red-600 dark:text-red-500">
                                    - {formatMoney(t.amount)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
      </Card>

    </div>
  );
}

// Componente auxiliar com tipagem corrigida
interface KpiCardProps {
    title: string;
    value: number;
    icon: any;
    color: string;
    bg: string;
    formatter: (val: number) => string;
}

function KpiCard({ title, value, icon: Icon, color, bg, formatter }: KpiCardProps) {
    return (
        <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{title}</p>
                    <p className={`text-2xl font-bold ${color}`}>
                        {formatter(value)}
                    </p>
                </div>
                <div className={`h-12 w-12 rounded-full ${bg} flex items-center justify-center ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>
    )
}