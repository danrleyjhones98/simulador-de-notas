import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  FileText, 
  Package, 
  Users, 
  History, 
  Database, 
  CheckCircle2,
  Printer,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notasCount?: number;
  produtosCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  notasCount = 0,
  produtosCount = 0
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard, badge: null },
    { id: 'nova-nota', label: 'Emitir Nova NF-e', icon: FilePlus2, badge: 'Novo' },
    { id: 'danfe', label: 'DANFE Oficial (PDF)', icon: Printer, badge: null },
    { id: 'produtos', label: 'Produtos & Estoque', icon: Package, badge: produtosCount ? String(produtosCount) : null },
    { id: 'parceiros', label: 'Fornecedores & Clientes', icon: Users, badge: null },
    { id: 'historico', label: 'Histórico de Notas', icon: History, badge: notasCount ? String(notasCount) : null },
  ];

  return (
    <aside className="no-print w-64 min-h-screen bg-[#0d0d10] border-r border-[#222226] flex flex-col justify-between select-none">
      <div>
        {/* Header / Brand */}
        <div className="p-5 border-b border-[#222226]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-xl">
              SF
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                Simulador Fiscal
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                  v2.0
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400 font-medium">DANFE SEFAZ + PostgreSQL</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Navegação Principal
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Database & System Status Footer */}
      <div className="p-3 m-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL 16</span>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-tight">
          Consultas e transações nativas em SQL via PGlite no disco local.
        </p>
        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3" /> SEFAZ Compatível
          </span>
          <span className="font-mono">Porta 3001</span>
        </div>
      </div>
    </aside>
  );
};
