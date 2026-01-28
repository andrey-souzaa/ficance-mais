"use client";

import { useFinance } from "@/lib/finance-context";
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff, 
  Trash2,
  Database,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { isVisible, toggleVisibility, theme, toggleTheme, transactions, accounts, cards } = useFinance();
  
  const handleReset = () => {
    if (confirm("Tem certeza? Isso apagará todos os dados locais.")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const handleExport = () => {
    const data = { transactions, accounts, cards, date: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_finance_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto p-6 md:p-10 pb-20 text-zinc-900 dark:text-zinc-100 min-h-screen">
      
      {/* Header da Página */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-[#2940bb]/10 rounded-xl flex items-center justify-center text-[#2940bb]">
            <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Gerencie sua conta e preferências.</p>
        </div>
      </div>

      <div className="grid gap-6">
        
        {/* Cartão de Perfil */}
        <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-20 w-20 border-4 border-zinc-100 dark:border-zinc-900">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>US</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left flex-1">
                    <h2 className="text-lg font-bold">Usuário Principal</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">usuario@finance.com</p>
                    <div className="flex gap-2 mt-3 justify-center md:justify-start">
                        <Button variant="outline" size="sm">Editar Perfil</Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Preferências do Sistema */}
        <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><SettingsIcon className="h-4 w-4" /> Preferências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                
                {/* Tema */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-900">
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Moon className="h-5 w-5 text-[#2940bb]" /> : <Sun className="h-5 w-5 text-orange-500" />}
                        <div>
                            <p className="font-medium">Modo Escuro</p>
                            <p className="text-xs text-zinc-500">Alternar tema da interface.</p>
                        </div>
                    </div>
                    <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} className="data-[state=checked]:bg-[#2940bb]" />
                </div>

                {/* Privacidade */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-900">
                    <div className="flex items-center gap-3">
                        {isVisible ? <Eye className="h-5 w-5 text-zinc-500" /> : <EyeOff className="h-5 w-5 text-zinc-500" />}
                        <div>
                            <p className="font-medium">Ocultar Valores</p>
                            <p className="text-xs text-zinc-500">Esconder saldos por padrão.</p>
                        </div>
                    </div>
                    <Switch checked={!isVisible} onCheckedChange={toggleVisibility} className="data-[state=checked]:bg-[#2940bb]" />
                </div>

            </CardContent>
        </Card>

        {/* Zona de Dados */}
        <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Database className="h-4 w-4" /> Dados e Backup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 {/* Backup */}
                 <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#2940bb] dark:text-blue-400">
                            <Download className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="font-medium">Backup</p>
                            <p className="text-xs text-zinc-500">Baixar seus dados.</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExport}>Baixar</Button>
                 </div>

                 {/* Reset */}
                 <div className="flex items-center justify-between p-3 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-500">
                            <Trash2 className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Zerar Dados</p>
                            <p className="text-xs text-red-500/70">Ação irreversível.</p>
                        </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleReset}>Resetar</Button>
                 </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}