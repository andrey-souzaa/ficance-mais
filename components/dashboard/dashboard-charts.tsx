"use client";

import { useMemo } from "react";
import { useFinance } from "@/lib/finance-context";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Home, ShoppingCart, Car, Utensils, Zap, GraduationCap, HeartPulse, MoreHorizontal } from "lucide-react";

// Cores para o gráfico (Tema Escuro/Neon)
const COLORS = [
  "#3b82f6", // Blue (Casa)
  "#8b5cf6", // Violet (Assinaturas)
  "#ec4899", // Pink (Alimentação)
  "#f59e0b", // Amber (Transporte)
  "#10b981", // Emerald (Saúde)
  "#6366f1", // Indigo
  "#ef4444", // Red
  "#71717a", // Zinc (Outros)
];

// Mapeamento de Ícones por Categoria
const CategoryIcon = ({ name, color }: { name: string, color: string }) => {
  const n = name.toLowerCase();
  const props = { className: "h-4 w-4", style: { color } };

  if (n.includes("casa") || n.includes("moradia")) return <Home {...props} />;
  if (n.includes("mercado") || n.includes("compra")) return <ShoppingCart {...props} />;
  if (n.includes("carro") || n.includes("transporte") || n.includes("uber")) return <Car {...props} />;
  if (n.includes("alimentação") || n.includes("restaurante") || n.includes("ifood")) return <Utensils {...props} />;
  if (n.includes("luz") || n.includes("internet") || n.includes("conta")) return <Zap {...props} />;
  if (n.includes("educação") || n.includes("curso")) return <GraduationCap {...props} />;
  if (n.includes("saúde") || n.includes("farmácia")) return <HeartPulse {...props} />;
  
  return <MoreHorizontal {...props} />;
};

export function DashboardCharts() {
  const { transactions, isVisible } = useFinance();

  // Processamento dos Dados
  const data = useMemo(() => {
    // 1. Filtrar só despesas
    const expenses = transactions.filter((t) => t.type === "expense");
    const total = expenses.reduce((acc, t) => acc + Number(t.amount), 0);

    if (total === 0) return [];

    // 2. Agrupar por categoria
    const grouped: Record<string, number> = {};
    expenses.forEach((t) => {
      const cat = t.category || "Outros";
      grouped[cat] = (grouped[cat] || 0) + Number(t.amount);
    });

    // 3. Transformar em array e calcular %
    let chartData = Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
        percent: (value / total) * 100,
      }))
      .sort((a, b) => b.value - a.value); // Ordenar do maior para o menor

    // 4. Pegar Top 4 e agrupar o resto em "Outros"
    if (chartData.length > 5) {
      const top4 = chartData.slice(0, 4);
      const others = chartData.slice(4);
      const othersValue = others.reduce((acc, curr) => acc + curr.value, 0);
      
      chartData = [
        ...top4,
        {
          name: "Outros",
          value: othersValue,
          percent: (othersValue / total) * 100,
        }
      ];
    }

    return chartData;
  }, [transactions]);

  // Se não tiver dados
  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
        <PieChart className="h-8 w-8 opacity-20" />
        <p className="text-xs">Sem despesas este mês</p>
      </div>
    );
  }

  return (
    <div className="flex items-center h-full w-full gap-2">
      
      {/* LADO ESQUERDO: LISTA DE CATEGORIAS */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar h-full max-h-[160px] flex flex-col justify-center">
        {data.map((item, index) => {
            const color = COLORS[index % COLORS.length];
            return (
                <div key={item.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2.5">
                        {/* Ícone com fundo colorido suave */}
                        <div 
                            className="h-7 w-7 rounded-full flex items-center justify-center bg-opacity-10"
                            style={{ backgroundColor: `${color}20` }} 
                        >
                            <CategoryIcon name={item.name} color={color} />
                        </div>
                        <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors truncate max-w-[80px]">
                            {item.name}
                        </span>
                    </div>
                    <span className="text-xs font-bold text-zinc-500">
                        {item.percent.toFixed(1)}%
                    </span>
                </div>
            );
        })}
      </div>

      {/* LADO DIREITO: GRÁFICO DONUT */}
      <div className="w-[120px] h-[120px] relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35} // Cria o buraco do donut
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="stroke-zinc-950 stroke-2 outline-none"
                />
              ))}
            </Pie>
            
            {/* --- CORREÇÃO DO TOOLTIP AQUI --- */}
            <Tooltip 
                formatter={(value: any) => [
                    isVisible 
                      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))
                      : "••••",
                    "Valor"
                ]}
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
                cursor={false}
            />

          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}