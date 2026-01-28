"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter, // CORRIGIDO: Era closestVerticalCenter
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch"; 

interface CustomizeDialogProps {
  items: string[];
  hiddenItems: string[];
  onUpdate: (newOrder: string[], newHidden: string[]) => void;
}

function SortableItem({ id, label, enabled, onToggle }: { id: string, label: string, enabled: boolean, onToggle: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg mb-2">
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-white">
          <GripVertical className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-zinc-200">{label}</span>
      </div>
      <Switch 
        checked={enabled} 
        onCheckedChange={() => onToggle(id)}
        className="data-[state=checked]:bg-green-600"
      />
    </div>
  );
}

export function CustomizeDashboardDialog({ items, hiddenItems, onUpdate }: CustomizeDialogProps) {
  const [open, setOpen] = useState(false);
  const [localItems, setLocalItems] = useState<string[]>(items);
  const [localHidden, setLocalHidden] = useState<string[]>(hiddenItems);

  const labels: Record<string, string> = {
    "minhas-contas": "Minhas Contas",
    "meus-cartoes": "Meus Cartões",
    "gastos-mes": "Gráfico de Gastos",
    "limite-gastos": "Teto de Gastos",
    "faturas": "Faturas",
  };

  useEffect(() => {
    if (open) {
      setLocalItems(items);
      setLocalHidden(hiddenItems);
    }
  }, [open, items, hiddenItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleItem = (id: string) => {
    setLocalHidden((prev) => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onUpdate(localItems, localHidden);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full" title="Personalizar Dashboard">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Personalizar Dashboard</DialogTitle>
          <p className="text-xs text-zinc-500">Arraste para reordenar ou use as chaves para esconder widgets.</p>
        </DialogHeader>

        <div className="py-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localItems} strategy={verticalListSortingStrategy}>
              {localItems.map((id) => (
                <SortableItem 
                  key={id} 
                  id={id} 
                  label={labels[id] || id} 
                  enabled={!localHidden.includes(id)} 
                  onToggle={toggleItem} 
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white w-full">
                Salvar Alterações
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}