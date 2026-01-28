"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { startOfWeek, endOfWeek, isSameDay, isSameMonth, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export type TransactionType = "income" | "expense" | "transfer";
export type TransactionStatus = "paid" | "pending";
export type RecurrenceType = "variable" | "fixed" | "subscription";
export type DateFilterType = "hoje" | "semana" | "mes" | "tudo" | "custom";
export type ThemeType = "dark" | "light";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  status: TransactionStatus;
  recurrence?: RecurrenceType;
  cardId?: string;
  accountId?: string;
  // NOVOS CAMPOS PARA O FLUXO VISUAL (Inspirado no seu modelo)
  fromAccount?: string;
  toAccount?: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
}

export interface Card {
  id: string;
  name: string;
  limit: number;
  closingDate: number;
  dueDate: number;
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    icon: string;
    color: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[]; 
  accounts: Account[];
  cards: Card[];
  goals: Goal[];
  
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  payTransaction: (id: string) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (id: string, updatedTransaction: Partial<Transaction>) => void;
  
  addAccount: (account: Omit<Account, "id">) => void;
  removeAccount: (id: string) => void;
  
  addCard: (card: Omit<Card, "id">) => void;
  editCard: (id: string, updatedCard: Partial<Card>) => void;
  removeCard: (id: string) => void;
  
  addTransfer: (fromId: string, toId: string, amount: number, date: string) => void;
  payCardInvoice: (cardId: string, accountId: string, amount: number, date: string) => void;

  addGoal: (goal: Omit<Goal, "id">) => void;
  removeGoal: (id: string) => void;
  addValueToGoal: (goalId: string, amount: number, accountId?: string) => void;

  isLoading: boolean;
  isVisible: boolean;
  toggleVisibility: () => void;
  
  theme: ThemeType;
  toggleTheme: () => void;

  dateFilter: DateFilterType;
  setDateFilter: (filter: DateFilterType) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [isMounted, setIsMounted] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterType>("mes");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });

  useEffect(() => {
    setIsMounted(true);
    const loadData = () => {
      if (typeof window !== 'undefined') {
        const savedTrans = localStorage.getItem("finance_transactions");
        const savedAccounts = localStorage.getItem("finance_accounts");
        const savedCards = localStorage.getItem("finance_cards");
        const savedGoals = localStorage.getItem("finance_goals");
        const savedVisibility = localStorage.getItem("finance_visibility");
        const savedTheme = localStorage.getItem("finance_theme") as ThemeType;

        if (savedTrans) setTransactions(JSON.parse(savedTrans));
        if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
        if (savedCards) setCards(JSON.parse(savedCards));
        if (savedGoals) setGoals(JSON.parse(savedGoals));
        if (savedVisibility) setIsVisible(JSON.parse(savedVisibility));
        
        if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        } else {
            setTheme("dark");
            document.documentElement.classList.add('dark');
        }
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading) {
      localStorage.setItem("finance_transactions", JSON.stringify(transactions));
      localStorage.setItem("finance_accounts", JSON.stringify(accounts));
      localStorage.setItem("finance_cards", JSON.stringify(cards));
      localStorage.setItem("finance_goals", JSON.stringify(goals));
      localStorage.setItem("finance_visibility", JSON.stringify(isVisible));
      localStorage.setItem("finance_theme", theme);
    }
  }, [transactions, accounts, cards, goals, isVisible, theme, isLoading, isMounted]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const updateAccountBalance = (accountId: string, amount: number, operation: 'add' | 'subtract') => {
    setAccounts(prev => prev.map(acc => {
        if (acc.id === accountId) {
            const newBalance = operation === 'add' ? Number(acc.balance) + Number(amount) : Number(acc.balance) - Number(amount);
            return { ...acc, balance: newBalance };
        }
        return acc;
    }));
  };

  const addTransaction = (t: Omit<Transaction, "id">) => {
    const newTrans = { ...t, id: generateId() };
    setTransactions((prev) => [newTrans, ...prev]);
    if (t.status === 'paid' && t.accountId) {
        updateAccountBalance(t.accountId, t.amount, t.type === 'income' ? 'add' : 'subtract');
    }
  };

  const deleteTransaction = (id: string) => {
    const t = transactions.find(t => t.id === id);
    if (t && t.status === 'paid' && t.accountId) {
        // Se for transferência, a exclusão manual é mais complexa, mas para transações simples:
        updateAccountBalance(t.accountId, t.amount, t.type === 'income' ? 'subtract' : 'add');
    }
    setTransactions((prev) => prev.filter(t => t.id !== id));
  };

  const payTransaction = (id: string) => {
    const t = transactions.find(t => t.id === id);
    if (t && t.status === 'pending') {
        setTransactions((prev) => prev.map(tr => tr.id === id ? { ...tr, status: 'paid' } : tr));
        if (t.accountId) {
            updateAccountBalance(t.accountId, t.amount, t.type === 'income' ? 'add' : 'subtract');
        }
    }
  };

  const payCardInvoice = (cardId: string, accountId: string, amount: number, date: string) => {
    const paymentId = generateId();
    const paymentTrans: Transaction = { 
        id: paymentId, 
        description: `Pagamento de Fatura`, 
        amount: amount, 
        type: 'expense', 
        category: 'Pagamento de Fatura', 
        date: date, 
        status: 'paid', 
        accountId: accountId, 
        recurrence: 'variable', 
        cardId: undefined 
    };
    updateAccountBalance(accountId, amount, 'subtract');
    setTransactions(prev => {
        const updatedTransactions = prev.map(t => {
            if (t.cardId === cardId && t.status === 'pending') {
                return { ...t, status: 'paid' as TransactionStatus };
            }
            return t;
        });
        return [paymentTrans, ...updatedTransactions];
    });
  };

  const addGoal = (goal: Omit<Goal, "id">) => setGoals(prev => [...prev, { ...goal, id: generateId() }]);
  const removeGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  
  const addValueToGoal = (goalId: string, amount: number, accountId?: string) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g));
    if (accountId) {
        const goalName = goals.find(g => g.id === goalId)?.name || "Meta";
        addTransaction({ 
            description: `Aporte: ${goalName}`, 
            amount: amount, 
            type: 'expense', 
            category: 'Investimento', 
            date: new Date().toISOString(), 
            status: 'paid', 
            accountId: accountId, 
            recurrence: 'variable' 
        });
    }
  };

  const filteredTransactions = transactions
    .filter((t) => {
      const tDate = parseISO(t.date); 
      const now = new Date();
      if (dateFilter === "tudo") return true;
      if (dateFilter === "hoje") return isSameDay(tDate, now);
      if (dateFilter === "semana") return isWithinInterval(tDate, { start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfWeek(now, { weekStartsOn: 0 }) });
      if (dateFilter === "mes") return isSameMonth(tDate, now);
      if (dateFilter === "custom") {
          if (!dateRange.from || !dateRange.to) return true;
          return isWithinInterval(tDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const editTransaction = (id: string, updated: Partial<Transaction>) => setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  const addAccount = (acc: Omit<Account, "id">) => setAccounts((prev) => [...prev, { ...acc, id: generateId() }]);
  const removeAccount = (id: string) => setAccounts((prev) => prev.filter(acc => acc.id !== id));
  const addCard = (card: Omit<Card, "id">) => setCards((prev) => [...prev, { ...card, id: generateId() }]);
  const editCard = (id: string, updated: Partial<Card>) => setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  const removeCard = (id: string) => setCards((prev) => prev.filter(c => c.id !== id));
  
  // --- MUDANÇA PRINCIPAL: LOGICA DE TRANSFERÊNCIA ATUALIZADA ---
  const addTransfer = (fromId: string, toId: string, amount: number, date: string) => {
    const fromAcc = accounts.find(a => a.id === fromId);
    const toAcc = accounts.find(a => a.id === toId);

    if (!fromAcc || !toAcc) return;

    // Atualiza os saldos reais
    updateAccountBalance(fromId, amount, 'subtract');
    updateAccountBalance(toId, amount, 'add');

    // Cria UMA transação do tipo 'transfer' que vincula as duas contas
    // Isso evita que apareça como Receita ou Despesa nos filtros globais
    const transferId = generateId();
    
    setTransactions((prev) => [
      { 
        id: transferId, 
        description: `Transferência bancária`, 
        amount: amount, 
        type: 'transfer', // TIPO UNIFICADO
        category: 'Transferência', 
        date: date, 
        status: 'paid', 
        accountId: fromId, // Referência principal (quem enviou)
        fromAccount: fromAcc.name, // Nome para o visual A -> B
        toAccount: toAcc.name      // Nome para o visual A -> B
      },
      ...prev
    ]);
  };

  const toggleTheme = () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      if (newTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
  };

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  if (!isMounted) return null;

  return (
    <FinanceContext.Provider value={{ transactions, filteredTransactions, accounts, cards, goals, addTransaction, payTransaction, deleteTransaction, editTransaction, addAccount, removeAccount, addCard, editCard, removeCard, addTransfer, payCardInvoice, addGoal, removeGoal, addValueToGoal, isLoading, isVisible, toggleVisibility, theme, toggleTheme, dateFilter, setDateFilter, dateRange, setDateRange }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance error");
  return context;
};