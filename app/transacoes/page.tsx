"use client";

import { useState } from "react";
import { useFinance, Transaction } from "@/lib/finance-context"; 
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Search, 
  Filter, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ArrowRightCircle, 
  MoreHorizontal, 
  Trash2, 
  Pencil,
  Plus,
  Minus,
  ArrowRightLeft,
  Settings,
  Calendar as CalendarIcon,
  ListFilter,
  Check
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { NewTransactionDialog } from "@/components/dashboard/new-transaction-dialog";
import { TransferDialog } from "@/components/dashboard/transfer-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; 
import { Label } from "@/components/ui/label"; 
import Link from "next/link";

export default function TransactionsPage() {
  const { transactions, deleteTransaction, editTransaction, isVisible } = useFinance();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense" | "transfer">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"todas" | "mes">("todas");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);

  const categories = Array.from(new Set(transactions.map(t => t.category))).sort();

  const filtered = transactions
    .filter(t => !t.cardId) 
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      const matchesView = viewMode === "todas" ? true : new Date(t.date).getMonth() === new Date().getMonth();
      return matchesSearch && matchesType && matchesCategory && matchesView;
  });

  const sortedTransactions = filtered.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatMoney = (val: number) => {
    if (!isVisible) return "••••";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR }); } catch (e) { return dateStr; }
  };

  const getTypeStyles = (type: "income" | "expense" | "transfer") => {
    switch (type) {
      case "income": return { icon: ArrowUpCircle, color: "text-emerald-600 dark:text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/10" };
      case "expense": return { icon: ArrowDownCircle, color: "text-red-600 dark:text-red-500", bg: "bg-red-100 dark:bg-red-500/10" };
      case "transfer": return { icon: ArrowRightLeft, color: "text-[#2940bb]", bg: "bg-blue-100 dark:bg-[#2940bb]/10" };
    }
  };

  const handleDelete = (id: string) => { if (confirm("Tem certeza que deseja excluir esta transação?")) deleteTransaction(id); };
  const handleEditClick = (transaction: Transaction) => { setEditingItem(transaction); setIsEditOpen(true); };
  const handleSaveEdit = (e: React.FormEvent) => { e.preventDefault(); if (editingItem) { editTransaction(editingItem.id, editingItem); setIsEditOpen(false); setEditingItem(null); } };

  return (
    <div className="space-y-6 w-full text-zinc-900 dark:text-zinc-100 max-w-[1600px] p-6 min-h-screen">
      
      {/* TOPO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Transações</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Gerencie suas receitas e despesas (Contas Bancárias)</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <Link href="/configuracoes">
                <Button variant="outline" size="icon" className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                    <Settings className="h-4 w-4" />
                </Button>
            </Link>

            <NewTransactionDialog defaultType="income">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2 shadow-sm">
                    <Plus className="h-4 w-4" /> Receita
                </Button>
            </NewTransactionDialog>

            <NewTransactionDialog defaultType="expense">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-medium gap-2 shadow-sm">
                    <Minus className="h-4 w-4" /> Despesa
                </Button>
            </NewTransactionDialog>

             <div className="relative">
                 <TransferDialog customTrigger={
                    <Button variant="outline" className="border-[#2940bb]/30 bg-[#2940bb]/10 text-[#2940bb] hover:bg-[#2940bb]/20 hover:text-[#2940bb] gap-2 font-medium">
                        <ArrowRightLeft className="h-4 w-4" /> Transferir
                    </Button>
                 }/>
             </div>
        </div>
      </div>

      {/* ABAS */}
      <div className="flex items-center gap-2">
         <Button 
            onClick={() => setViewMode("todas")}
            className={`h-8 rounded-lg text-xs font-medium px-4 transition-all ${
                viewMode === 'todas' 
                ? 'bg-[#2940bb] text-white hover:bg-[#2940bb]/90 shadow-md' 
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
            }`}
         >
            Todas
         </Button>
         <Button 
            onClick={() => setViewMode("mes")}
            className={`h-8 rounded-lg text-xs font-medium px-4 transition-all ${
                viewMode === 'mes' 
                ? 'bg-[#2940bb] text-white hover:bg-[#2940bb]/90 shadow-md' 
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
            }`}
         >
            Por Mês
         </Button>
      </div>

      {/* FILTROS */}
      <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-xl flex flex-col md:flex-row gap-2 shadow-sm">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
                placeholder="Buscar transações..." 
                className="pl-9 h-10 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-0 focus:border-[#2940bb] text-zinc-900 dark:text-zinc-200 rounded-lg placeholder:text-zinc-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(val: any) => setTypeFilter(val)}>
                <SelectTrigger className="w-[110px] h-10 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs focus:ring-0">
                    <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                    <SelectItem value="transfer">Transf.</SelectItem>
                </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px] h-10 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs focus:ring-0">
                     <SelectValue placeholder="Categorias" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                    <SelectItem value="all">Todas categorias</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-xl min-h-[400px] shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                <TableRow className="border-zinc-200 dark:border-zinc-800">
                    <TableHead className="w-[120px]">Data</TableHead>
                    <TableHead>Descrição / Fluxo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedTransactions.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5}>
                            <EmptyState />
                        </TableCell>
                    </TableRow>
                ) : (
                    sortedTransactions.map((t) => {
                        const style = getTypeStyles(t.type);
                        const Icon = style.icon;
                        
                        return (
                            <TableRow key={t.id} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 group transition-colors">
                                <TableCell className="text-zinc-500 text-xs">
                                    {formatDate(t.date)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        {/* LÓGICA VISUAL DE TRANSFERÊNCIA (A -> B) */}
                                        {t.type === 'transfer' ? (
                                            <div className="flex items-center gap-2 py-1 px-3 bg-blue-50 dark:bg-[#2940bb]/10 border border-[#2940bb]/20 rounded-full shrink-0">
                                                <div className="h-5 w-5 rounded-full bg-[#2940bb] flex items-center justify-center text-[8px] text-white font-bold">
                                                    {t.fromAccount?.substring(0, 2).toUpperCase() || "OR"}
                                                </div>
                                                <ArrowRightLeft className="h-3 w-3 text-[#2940bb]" />
                                                <div className="h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-white font-bold">
                                                    {t.toAccount?.substring(0, 2).toUpperCase() || "DE"}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                                                <Icon className={`h-4 w-4 ${style.color}`} />
                                            </div>
                                        )}
                                        
                                        <div>
                                            <p className="font-medium text-sm text-zinc-900 dark:text-white">
                                                {t.type === 'transfer' ? `${t.fromAccount} → ${t.toAccount}` : t.description}
                                            </p>
                                            {t.type === 'transfer' && <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Transferência Interna</p>}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-normal text-zinc-500 border-zinc-200 dark:border-zinc-800">
                                        {t.type === 'transfer' ? 'Interno' : t.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className={`text-right font-bold text-sm ${style.color}`}>
                                    {t.type === 'expense' ? '-' : ''}{formatMoney(t.amount)}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-xl">
                                            <DropdownMenuItem onClick={() => handleEditClick(t)} className="gap-2 text-xs cursor-pointer">
                                                <Pencil className="h-3.5 w-3.5" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(t.id)} className="gap-2 text-red-600 text-xs cursor-pointer">
                                                <Trash2 className="h-3.5 w-3.5" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
          </Table>
      </div>

      {/* --- MODAL DE EDIÇÃO --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          
          {editingItem && (
            <form onSubmit={handleSaveEdit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="desc">Descrição</Label>
                <Input 
                  id="desc" 
                  value={editingItem.description} 
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-[#2940bb]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input 
                    id="amount" 
                    type="number"
                    value={editingItem.amount} 
                    onChange={(e) => setEditingItem({...editingItem, amount: Number(e.target.value)})}
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-[#2940bb]" 
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="date">Data</Label>
                    <Input 
                    id="date" 
                    type="date"
                    value={editingItem.date.split('T')[0]} 
                    onChange={(e) => setEditingItem({...editingItem, date: e.target.value})}
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-[#2940bb]" 
                    />
                </div>
              </div>

              <DialogFooter className="mt-4">
                 <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500">
                    Cancelar
                 </Button>
                 <Button type="submit" className="bg-[#2940bb] hover:bg-[#2940bb]/90 text-white">
                    <Check className="w-4 h-4 mr-2" /> Salvar Alterações
                 </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-full mb-3">
                <Search className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 font-medium">Nenhuma transação encontrada</p>
            <p className="text-zinc-500 text-sm mt-1 max-w-[250px]">
                Tente ajustar os filtros ou adicione uma nova transação para começar.
            </p>
        </div>
    )
}