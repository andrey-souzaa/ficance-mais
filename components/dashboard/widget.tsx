"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function Widget({ title, children, icon, action, className }: WidgetProps) {
  return (
    <div className={cn("h-full", className)}>
      {/* CORREÇÃO: Fundo Branco (Light) / Preto (Dark) + Bordas Dinâmicas */}
      <Card className="h-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 flex flex-col shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
        
        {/* HEADER LIMPO */}
        {/* CORREÇÃO: Fundo Cinza Claro (Light) / Cinza Escuro (Dark) + Texto Dinâmico */}
        <CardHeader className="p-4 py-3 flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            {icon && <div className="text-zinc-500 dark:text-zinc-400">{icon}</div>}
            <CardTitle className="text-sm font-medium text-zinc-900 dark:text-zinc-200 select-none">{title}</CardTitle>
          </div>
          
          {/* Ação extra */}
          <div className="flex items-center gap-2">
             {action}
          </div>
        </CardHeader>
        
        {/* CONTEÚDO */}
        <CardContent className="p-4 flex-1">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}