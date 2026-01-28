"use client";

import { useMemo } from "react";
import { useFinance } from "@/lib/finance-context";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart
} from "recharts";
import { 
  subDays, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  format, 
  eachDayOfInterval, 
  eachMonthOfInterval,
  isSameDay,
  isSameMonth
} from "date-fns";
import { ptBR } from "date-fns/locale";

// Exportamos o tipo para usar na página principal
export type ChartFilterType = "7d" | "4w" | "month" | "12m";

interface BalanceChartProps {
  period: ChartFilterType;
}

export function BalanceChartWidget({ period }: BalanceChartProps) {
  const { transactions, isVisible } = useFinance();

  // Processamento dos Dados
  const data = useMemo(() => {
    const now = new Date();
    let startDate = now;
    let endDate = now;
    let dateRange: Date[] = [];
    let dateFormat = "dd";

    // 1. Definir o intervalo baseado na prop 'period'
    switch (period) {
      case "7d":
        startDate = subDays(now, 6);
        dateRange = eachDayOfInterval({ start: startDate, end: endDate });
        dateFormat = "dd/MM";
        break;
      case "4w":
        startDate = subDays(now, 28);
        dateRange = eachDayOfInterval({ start: startDate, end: endDate });
        dateFormat = "dd/MM";
        break;
      case "month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now); 
        dateRange = eachDayOfInterval({ start: startDate, end: endDate });
        dateFormat = "dd";
        break;
      case "12m":
        startDate = subMonths(now, 11);
        dateRange = eachMonthOfInterval({ start: startDate, end: endDate });
        dateFormat = "MMM";
        break;
    }

    // 2. Agrupar dados
    return dateRange.map((date) => {
      const dayTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        if (period === "12m") {
          return isSameMonth(tDate, date);
        }
        return isSameDay(tDate, date);
      });

      const income = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + Number(t.amount), 0);

      const expense = dayTransactions
        .filter((t) => t.type === "expense" || t.type === "transfer")
        .reduce((acc, t) => acc + Number(t.amount), 0);

      return {
        dateStr: format(date, dateFormat, { locale: ptBR }),
        income,
        expense,
      };
    });
  }, [transactions, period]);

  // Formatador
  const formatMoney = (val: number) => {
    if (!isVisible) return "••••";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl z-50">
          <p className="text-zinc-400 text-xs mb-2 capitalize">{label}</p>
          <div className="space-y-1">
            <p className="text-xs text-green-500 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Receitas: {formatMoney(payload[0].value)}
            </p>
            <p className="text-xs text-red-500 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Despesas: {formatMoney(payload[1].value)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          
          <XAxis 
            dataKey="dateStr" 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
            minTickGap={30} 
          />
          
          <YAxis 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(val) => isVisible ? `R$${val}` : "•••"} 
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />

          <Area type="monotone" dataKey="income" stroke="none" fill="url(#colorIncome)" />
          <Area type="monotone" dataKey="expense" stroke="none" fill="url(#colorExpense)" />

          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#22c55e" 
            strokeWidth={2} 
            dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }} 
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            stroke="#ef4444" 
            strokeWidth={2} 
            dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }} 
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}