"use client";

import { useState } from "react";
import { useFinance } from "@/lib/finance-context";
import { 
  Trash2, 
  Download, 
  Upload, 
  Settings, 
  AlertTriangle,
  Eye,
  EyeOff,
  Database,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { transactions, accounts, cards, isVisible, toggleVisibility } = useFinance();
  const [isResetOpen, setIsResetOpen] = useState(false);

  // --- FUNÇÃO 1: EXPORTAR DADOS (BACKUP) ---
  const handleExport = () => {
    const data = {
      transactions,
      accounts,
      cards,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FUNÇÃO 2: ZERAR DADOS (RESET) ---
  const handleReset = () => {
    // Remove tudo do LocalStorage
    localStorage.removeItem("finance_transactions");
    localStorage.removeItem("finance_accounts");
    localStorage.removeItem("finance_cards");
    localStorage.removeItem("finance_visibility");
    
    // Recarrega a página para limpar o Contexto
    window.location.reload();
  };

  return (
    <div className="space-y-8 w-full max-w-[1000px] mx-auto p-6 min-h-screen text-zinc-100">
      
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="h-8 w-8 text-zinc-400" /> Configurações
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Gerencie seus dados e preferências do sistema.</p>
      </div>

      <div className="grid gap-6">
        
        {/* SEÇÃO 1: PREFERÊNCIAS VISUAIS */}
        <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Monitor className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Preferências de Visualização</CardTitle>
                        <CardDescription className="text-zinc-500">Personalize como o app se comporta.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                    <div className="flex items-center gap-3">
                        {isVisible ? <Eye className="h-5 w-5 text-zinc-400" /> : <EyeOff className="h-5 w-5 text-zinc-400" />}
                        <div>
                            <p className="font-medium text-white">Visibilidade dos Valores</p>
                            <p className="text-xs text-zinc-500">Ocultar/Mostrar valores monetários por padrão.</p>
                        </div>
                    </div>
                    <Switch checked={isVisible} onCheckedChange={toggleVisibility} className="data-[state=checked]:bg-emerald-600" />
                </div>
            </CardContent>
        </Card>

        {/* SEÇÃO 2: DADOS (BACKUP E EXPORTAÇÃO) */}
        <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Database className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Dados e Backup</CardTitle>
                        <CardDescription className="text-zinc-500">Seus dados ficam salvos apenas no seu navegador.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                    <div>
                        <p className="font-medium text-white">Exportar Dados (JSON)</p>
                        <p className="text-xs text-zinc-500">Baixe uma cópia de segurança de todas as suas transações.</p>
                    </div>
                    <Button onClick={handleExport} variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                        <Download className="h-4 w-4 mr-2" /> Exportar
                    </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50 opacity-50 cursor-not-allowed" title="Em breve">
                    <div>
                        <p className="font-medium text-white">Importar Dados</p>
                        <p className="text-xs text-zinc-500">Restaurar backup (Funcionalidade futura).</p>
                    </div>
                    <Button disabled variant="outline" className="border-zinc-700 text-zinc-500">
                        <Upload className="h-4 w-4 mr-2" /> Importar
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* SEÇÃO 3: ZONA DE PERIGO */}
        <Card className="bg-red-950/10 border-red-900/20 border">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-red-500">Zona de Perigo</CardTitle>
                        <CardDescription className="text-red-500/50">Ações irreversíveis.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                    <div>
                        <p className="font-medium text-red-400">Apagar todos os dados</p>
                        <p className="text-xs text-red-400/60">Remove contas, cartões e transações. Não pode ser desfeito.</p>
                    </div>
                    <Button onClick={() => setIsResetOpen(true)} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                        <Trash2 className="h-4 w-4 mr-2" /> Zerar Tudo
                    </Button>
                </div>
            </CardContent>
        </Card>

      </div>

      {/* MODAL DE CONFIRMAÇÃO DE RESET */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="h-5 w-5" /> Tem certeza absoluta?
                </DialogTitle>
                <DialogDescription className="text-zinc-400 pt-2">
                    Essa ação irá apagar <strong>todas</strong> as transações, contas e cartões cadastrados no seu navegador. 
                    <br/><br/>
                    O aplicativo voltará ao estado inicial (zero). Essa ação não pode ser desfeita.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsResetOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-900">
                    Cancelar
                </Button>
                <Button onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                    Sim, apagar tudo
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}