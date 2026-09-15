import React, { useState } from 'react';
import { NotaFiscal } from '../types';
import { DanfeDocument } from '../components/danfe/DanfeDocument';
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
      {/* Seletor de Nota (no-print) */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 uppercase">Selecionar Nota Fiscal:</span>
          <select
            value={currentId}
            onChange={(e) => setCurrentId(Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {notas.map((n) => (
              <option key={n.id} value={n.id}>
                NF-e Nº {n.numero_nf} - {n.emitente_fantasia || n.emitente_nome} ({n.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Renderização do DANFE SEFAZ Oficial */}
      <DanfeDocument nota={activeNota} onBack={onBack} />
    </div>
  );
};
