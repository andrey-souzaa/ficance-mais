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
  const { transactions, deleteTransaction, editTransaction } = useFinance();
  
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
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR }); } catch (e) { return dateStr; }
  };

  const getTypeStyles = (type: "income" | "expense" | "transfer") => {
    switch (type) {
      case "income": return { icon: ArrowUpCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" };
      case "expense": return { icon: ArrowDownCircle, color: "text-red-500", bg: "bg-red-500/10" };
      // MUDANÇA: Transferência agora é AZUL (#2940bb)
      case "transfer": return { icon: ArrowRightCircle, color: "text-[#2940bb]", bg: "bg-[#2940bb]/10" };
    }
  };

  const handleDelete = (id: string) => { if (confirm("Tem certeza que deseja excluir esta transação?")) deleteTransaction(id); };
  const handleEditClick = (transaction: Transaction) => { setEditingItem(transaction); setIsEditOpen(true); };
  const handleSaveEdit = (e: React.FormEvent) => { e.preventDefault(); if (editingItem) { editTransaction(editingItem.id, editingItem); setIsEditOpen(false); setEditingItem(null); } };

  return (
    <div className="space-y-6 w-full text-zinc-100 max-w-[1600px] p-6 min-h-screen">
      
      {/* TOPO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transações</h1>
          <p className="text-zinc-500 text-sm mt-1">Gerencie suas receitas e despesas (Contas Bancárias)</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <Link href="/configuracoes">
                <Button variant="outline" size="icon" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white">
                    <Settings className="h-4 w-4" />
                </Button>
            </Link>

            <NewTransactionDialog defaultType="income">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
                    <Plus className="h-4 w-4" /> Receita
                </Button>
            </NewTransactionDialog>

            <NewTransactionDialog defaultType="expense">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-medium gap-2 border border-red-500/20 shadow-lg shadow-red-900/20">
                    <Minus className="h-4 w-4" /> Despesa
                </Button>
            </NewTransactionDialog>

             <div className="relative">
                 <TransferDialog customTrigger={
                    // MUDANÇA: Botão Transferir Azul
                    <Button variant="outline" className="border-[#2940bb]/50 bg-[#2940bb]/10 text-[#2940bb] hover:bg-[#2940bb]/20 hover:text-[#2940bb] gap-2 font-medium">
                        <ArrowRightLeft className="h-4 w-4" /> Transferir
                    </Button>
                 }/>
             </div>
        </div>
      </div>

      {/* ABAS */}
      <div className="flex items-center gap-2">
         {/* MUDANÇA: Botões de filtro agora ficam AZUIS quando ativos */}
         <Button 
            onClick={() => setViewMode("todas")}
            className={`h-8 rounded-lg text-xs font-medium px-4 transition-all ${viewMode === 'todas' ? 'bg-[#2940bb] text-white hover:bg-[#2940bb]/90 shadow-md' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'}`}
         >
            Todas
         </Button>
         <Button 
            onClick={() => setViewMode("mes")}
            className={`h-8 rounded-lg text-xs font-medium px-4 transition-all ${viewMode === 'mes' ? 'bg-[#2940bb] text-white hover:bg-[#2940bb]/90 shadow-md' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'}`}
         >
            Por Mês
         </Button>
      </div>

      {/* FILTROS */}
      <div className="bg-zinc-900/40 border border-zinc-800 p-1.5 rounded-xl flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
                placeholder="Buscar transações..." 
                className="pl-9 h-10 bg-black border-zinc-800 focus:ring-0 focus:border-zinc-700 text-zinc-200 rounded-lg placeholder:text-zinc-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <Select value={typeFilter} onValueChange={(val: any) => setTypeFilter(val)}>
                <SelectTrigger className="w-[110px] h-10 bg-black border-zinc-800 text-zinc-300 rounded-lg text-xs focus:ring-0">
                    <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5 text-zinc-500" />
                        <SelectValue placeholder="Todos" />
                    </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                    <SelectItem value="transfer">Transf.</SelectItem>
                </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px] h-10 bg-black border-zinc-800 text-zinc-300 rounded-lg text-xs focus:ring-0">
                    <div className="flex items-center gap-2">
                         <ListFilter className="h-3.5 w-3.5 text-zinc-500" />
                         <SelectValue placeholder="Categorias" />
                    </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="all">Todas categorias</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button variant="outline" className="h-10 bg-black border-zinc-800 text-zinc-300 rounded-lg text-xs font-normal gap-2 hover:bg-zinc-900 hover:text-white shrink-0">
                <CalendarIcon className="h-3.5 w-3.5 text-zinc-500" />
                Período
            </Button>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl min-h-[400px]">
          
          {/* MOBILE */}
          <div className="flex flex-col md:hidden">
            {sortedTransactions.length === 0 ? (
                 <EmptyState />
            ) : (
                sortedTransactions.map((t) => {
                const style = getTypeStyles(t.type);
                const Icon = style.icon;
                return (
                    <div key={t.id} className="border-b border-zinc-800/50 p-4 flex items-center justify-between active:bg-zinc-900/50 transition-colors last:border-0">
                        <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                            <Icon className={`h-5 w-5 ${style.color}`} />
                        </div>
                        <div className="flex flex-col">
                            <p className="font-medium text-white text-sm line-clamp-1">{t.description}</p>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                                <span>{formatDate(t.date)}</span>
                                <span>•</span>
                                <span className="capitalize">{t.category}</span>
                            </div>
                        </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className={`font-bold text-sm whitespace-nowrap ${style.color}`}>
                                {t.type === 'expense' ? '-' : ''}{formatMoney(t.amount)}
                            </span>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-zinc-500">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                                    <DropdownMenuItem onClick={() => handleEditClick(t)} className="gap-2 cursor-pointer text-xs hover:bg-zinc-800">
                                        <Pencil className="h-3.5 w-3.5" /> Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(t.id)} className="gap-2 text-red-500 cursor-pointer text-xs hover:bg-zinc-800">
                                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                );
                })
            )}
          </div>

          {/* DESKTOP */}
          <div className="hidden md:block">
            <Table>
                <TableHeader className="bg-zinc-900/50">
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-500 font-medium h-12 w-[140px]">Data</TableHead>
                        <TableHead className="text-zinc-500 font-medium h-12">Descrição</TableHead>
                        <TableHead className="text-zinc-500 font-medium h-12">Categoria</TableHead>
                        <TableHead className="text-zinc-500 font-medium h-12">Tipo</TableHead>
                        <TableHead className="text-zinc-500 font-medium h-12 text-right">Valor</TableHead>
                        <TableHead className="h-12 w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedTransactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <EmptyState />
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedTransactions.map((t) => {
                            const style = getTypeStyles(t.type);
                            return (
                                <TableRow key={t.id} className="border-zinc-800/50 hover:bg-zinc-900/30 group transition-colors">
                                    <TableCell className="text-zinc-400 font-medium text-xs">
                                        {formatDate(t.date)}
                                    </TableCell>
                                    <TableCell className="text-white font-medium text-sm">
                                        {t.description}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-zinc-900/50 text-zinc-400 border-zinc-800 font-normal hover:bg-zinc-900">
                                            {t.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-1.5 w-1.5 rounded-full ${style.color.replace('text', 'bg')}`}></div>
                                            <span className={`text-xs capitalize ${style.color}`}>
                                                {t.type === 'income' ? 'Receita' : t.type === 'expense' ? 'Despesa' : 'Transf.'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={`text-right font-bold text-sm ${style.color}`}>
                                        {t.type === 'expense' ? '-' : ''}{formatMoney(t.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-zinc-500 hover:text-white">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white shadow-xl">
                                                <DropdownMenuItem onClick={() => handleEditClick(t)} className="gap-2 cursor-pointer hover:bg-zinc-800 text-xs">
                                                    <Pencil className="h-3.5 w-3.5" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(t.id)} className="gap-2 text-red-500 cursor-pointer hover:bg-zinc-800 text-xs">
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
      </div>

      {/* --- MODAL DE EDIÇÃO --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
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
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-[#2940bb]" 
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
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-[#2940bb]" 
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="date">Data</Label>
                    <Input 
                    id="date" 
                    type="date"
                    value={editingItem.date.split('T')[0]} 
                    onChange={(e) => setEditingItem({...editingItem, date: e.target.value})}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-[#2940bb]" 
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label>Categoria</Label>
                      <Input 
                        value={editingItem.category} 
                        onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                        className="bg-zinc-900 border-zinc-800 focus-visible:ring-[#2940bb]" 
                    />
                 </div>
                 <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select 
                        value={editingItem.status} 
                        onValueChange={(val: "paid" | "pending") => setEditingItem({...editingItem, status: val})}
                    >
                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="paid">Pago / Recebido</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
              </div>

              <DialogFooter className="mt-4">
                 <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="hover:bg-zinc-900 hover:text-white text-zinc-400">
                    Cancelar
                 </Button>
                 {/* MUDANÇA: Botão de salvar agora é AZUL */}
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
            <div className="bg-zinc-900/50 p-4 rounded-full mb-3">
                <Search className="h-6 w-6 text-zinc-600" />
            </div>
            <p className="text-zinc-300 font-medium">Nenhuma transação encontrada</p>
            <p className="text-zinc-500 text-sm mt-1 max-w-[250px]">
                Tente ajustar os filtros ou adicione uma nova transação para começar.
            </p>
        </div>
    )
}