import React, { useState } from 'react';
import { NotaFiscal } from '../types';
import { DanfeDocument } from '../components/danfe/DanfeDocument';
import { SearchableSelect, SelectOption } from '../components/ui/SearchableSelect';
import { FileText, ArrowLeft } from 'lucide-react';

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
  const defaultNota = notas.find((n) => n.id === selectedNotaId) || notas[0];
  const [currentId, setCurrentId] = useState<number>(defaultNota?.id || 1);

  const activeNota = notas.find((n) => n.id === currentId) || defaultNota;

  const notaOptions: SelectOption[] = notas.map((n) => ({
    value: n.id,
    label: `NF-e Nº ${n.numero_nf} - ${n.emitente_fantasia || n.emitente_nome}`,
    sublabel: `Destinatário: ${n.destinatario_fantasia || n.destinatario_nome} • R$ ${Number(n.valor_total).toFixed(2)}`,
    badge: n.status,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
  }));

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

  return (
    <div className="space-y-4">
      {/* Seletor com SearchableSelect (no-print) */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
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
        <p className="text-xs text-zinc-400">
          Visualizando registro oficial do PostgreSQL 16
        </p>
      </div>

      {/* Renderização do DANFE SEFAZ Oficial */}
      <DanfeDocument nota={activeNota} onBack={onBack} />
    </div>
  );
};
