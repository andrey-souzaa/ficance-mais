"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode; // Botão extra (ex: "+ Add")
  className?: string;
}

export function DraggableWidget({ id, title, children, icon, action, className }: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto", // Traz para frente ao arrastar
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("h-full", className)}>
      <Card className="h-full bg-zinc-950 border-zinc-800 flex flex-col shadow-sm hover:border-zinc-700 transition-colors">
        
        {/* HEADER = ÁREA DE ARRASTAR */}
        <CardHeader 
          className="p-4 py-3 flex flex-row items-center justify-between border-b border-zinc-900 bg-zinc-900/50 cursor-grab active:cursor-grabbing rounded-t-xl"
          {...attributes} 
          {...listeners}
        >
          <div className="flex items-center gap-2">
            {icon && <div className="text-zinc-400">{icon}</div>}
            <CardTitle className="text-sm font-medium text-zinc-200 select-none">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
             {/* Ação extra (botão) não deve disparar o drag, então isolamos se necessário, 
                 mas aqui está dentro do header */}
             {action}
             <GripHorizontal className="h-4 w-4 text-zinc-600" />
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