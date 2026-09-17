import React, { useState, useEffect } from 'react';
import { NotaFiscal } from '../types';
import { DanfeDocument } from '../components/danfe/DanfeDocument';
import { SearchableSelect, SelectOption } from '../components/ui/SearchableSelect';
import { FileText, ArrowLeft, PackageCheck, Layers, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface DanfePreviewProps {
  notas: NotaFiscal[];
  selectedNotaId?: number;
  onBack: () => void;
}

export const DanfePreviewPage: React.FC<DanfePreviewProps> = ({
  notas,
  selectedNotaId,
  onBack,
}) => {
  const [currentId, setCurrentId] = useState<number>(() => selectedNotaId || notas[0]?.id || 1);
  const [detailedNota, setDetailedNota] = useState<NotaFiscal | null>(null);
  const [loadingNota, setLoadingNota] = useState<boolean>(false);

  // Sincroniza currentId se selectedNotaId mudar externamente (ex: emissão ou histórico)
  useEffect(() => {
    if (selectedNotaId && selectedNotaId !== currentId) {
      setCurrentId(selectedNotaId);
    }
  }, [selectedNotaId]);

  // Busca sempre a versão mais detalhada com itens e duplicatas do banco
  useEffect(() => {
    if (!currentId) return;
    let isCancelled = false;

    const fetchDetailed = async () => {
      try {
        setLoadingNota(true);
        const res = await fetch(`/api/notas/${currentId}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setDetailedNota(data);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados detalhados da nota:', err);
      } finally {
        if (!isCancelled) {
          setLoadingNota(false);
        }
      }
    };

    fetchDetailed();

    return () => {
      isCancelled = true;
    };
  }, [currentId]);

  const fallbackNota = notas.find((n) => n.id === currentId) || notas[0];
  const activeNota = (detailedNota && detailedNota.id === currentId) ? detailedNota : fallbackNota;

  const notaOptions: SelectOption[] = notas.map((n) => {
    const itemCount = n.itens?.length || n.total_itens || 0;
    return {
      value: n.id,
      label: `NF-e Nº ${n.numero_nf} - ${n.emitente_fantasia || n.emitente_nome}`,
      sublabel: `${itemCount} item(ns) • Dest: ${n.destinatario_fantasia || n.destinatario_nome} • ${formatCurrency(n.valor_total)}`,
      badge: n.status,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    };
  });

  if (!activeNota) {
    return (
      <div className="p-12 text-center text-zinc-400 space-y-4">
        <FileText className="w-12 h-12 mx-auto text-zinc-600" />
        <p className="text-base font-semibold">Nenhuma nota fiscal disponível para visualização.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  const itensCount = activeNota.itens?.length || activeNota.total_itens || 0;

  return (
    <div className="space-y-4">
      {/* Barra Superior Interativa com Seletor e Badges de Confirmação (no-print) */}
      <div className="no-print flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 shadow-md">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar
          </button>

          <div className="w-full sm:w-96">
            <SearchableSelect
              options={notaOptions}
              value={currentId}
              onChange={(val) => setCurrentId(Number(val))}
              placeholder="Selecionar nota fiscal..."
              searchPlaceholder="Buscar por número, fornecedor ou cliente..."
            />
          </div>
        </div>

        {/* Resumo rápido dos itens e valor da nota selecionada */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{itensCount} {itensCount === 1 ? 'produto incluído' : 'produtos incluídos'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold font-mono">
            <DollarSign className="w-3.5 h-3.5 text-blue-400" />
            <span>Total: {formatCurrency(activeNota.valor_total)}</span>
          </div>

          {loadingNota && (
            <div className="flex items-center gap-1 text-zinc-400 text-[11px] animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
              <span>Sincronizando SQL...</span>
            </div>
          )}
        </div>
      </div>

      {/* Renderização do DANFE SEFAZ Oficial com todos os itens na tabela */}
      <DanfeDocument nota={activeNota} onBack={onBack} />
    </div>
  );
};
