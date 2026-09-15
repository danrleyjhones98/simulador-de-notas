import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/sidebar/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { NovaNotaPage } from './pages/NovaNotaPage';
import { DanfePreviewPage } from './pages/DanfePreviewPage';
import { ProdutosPage } from './pages/ProdutosPage';
import { ParceirosPage } from './pages/ParceirosPage';
import { HistoricoPage } from './pages/HistoricoPage';
import { Produto, Parceiro, NotaFiscal } from './types';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedNotaId, setSelectedNotaId] = useState<number | undefined>(undefined);
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, parcRes, notRes] = await Promise.all([
        fetch('/api/produtos').then((r) => r.json()),
        fetch('/api/parceiros').then((r) => r.json()),
        fetch('/api/notas').then((r) => r.json()),
      ]);

      setProdutos(Array.isArray(prodRes) ? prodRes : []);
      setParceiros(Array.isArray(parcRes) ? parcRes : []);
      setNotas(Array.isArray(notRes) ? notRes : []);
    } catch (err) {
      console.error('Erro ao carregar dados do PostgreSQL:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNavigate = (tab: string, notaId?: number) => {
    if (notaId) {
      setSelectedNotaId(notaId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNotaCreated = async (newNotaId: number) => {
    await fetchData();
    setSelectedNotaId(newNotaId);
    setActiveTab('danfe');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        notasCount={notas.length}
        produtosCount={produtos.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto w-full">
        {loading && notas.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs font-semibold">Conectando ao banco PostgreSQL 16...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardPage
                notas={notas}
                produtos={produtos}
                parceiros={parceiros}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'nova-nota' && (
              <NovaNotaPage
                produtos={produtos}
                parceiros={parceiros}
                onNotaCreated={handleNotaCreated}
              />
            )}

            {activeTab === 'danfe' && (
              <DanfePreviewPage
                notas={notas}
                selectedNotaId={selectedNotaId}
                onBack={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'produtos' && (
              <ProdutosPage
                produtos={produtos}
                onRefresh={fetchData}
              />
            )}

            {activeTab === 'parceiros' && (
              <ParceirosPage
                parceiros={parceiros}
                onRefresh={fetchData}
              />
            )}

            {activeTab === 'historico' && (
              <HistoricoPage
                notas={notas}
                onViewDanfe={(id) => handleNavigate('danfe', id)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
export default App;
