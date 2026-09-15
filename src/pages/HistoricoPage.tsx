import React, { useState } from 'react';
import { NotaFiscal } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { History, Search, Printer } from 'lucide-react';

interface HistoricoProps {
  notas: NotaFiscal[];
  onViewDanfe: (notaId: number) => void;
}

export const HistoricoPage: React.FC<HistoricoProps> = ({ notas, onViewDanfe }) => {
  const [search, setSearch] = useState('');

  const filtered = notas.filter((n) =>
    n.numero_nf.includes(search) ||
    n.chave_acesso.includes(search) ||
    (n.emitente_nome || '').toLowerCase().includes(search.toLowerCase()) ||
    (n.destinatario_nome || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Histórico Fiscal & DANFE
          </h2>
          <p className="text-xs text-zinc-400">
            Notas fiscais registradas no PostgreSQL com suporte a impressão em PDF
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrar por número da NF, chave de acesso ou parceiro..."
          className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full"
        />
      </div>

      {/* TABELA COM ROLAGEM INTERNA E HEADER FIXO */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg">
        <div className="max-h-[calc(100vh-280px)] overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#16161a] z-10 border-b border-zinc-800 shadow-sm">
              <tr className="text-zinc-400 text-[11px] font-bold uppercase">
                <th className="py-3 px-3">Número / Série</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3">Chave de Acesso</th>
                <th className="py-3 px-3">Emitente / Destinatário</th>
                <th className="py-3 px-3">Data</th>
                <th className="py-3 px-3 text-right">Valor Total</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((nota) => (
                <tr key={nota.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-white">
                    Nº {nota.numero_nf} <span className="text-zinc-500">s.{nota.serie}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      nota.tipo_operacao === 'ENTRADA'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {nota.tipo_operacao}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-zinc-400">
                    {nota.chave_acesso.slice(0, 10)}...{nota.chave_acesso.slice(-6)}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300">
                    <p className="font-semibold">{nota.emitente_fantasia || nota.emitente_nome}</p>
                    <p className="text-[10px] text-zinc-500">&rarr; {nota.destinatario_fantasia || nota.destinatario_nome}</p>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400">{formatDate(nota.data_emissao)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                    {formatCurrency(nota.valor_total)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {nota.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onViewDanfe(nota.id)}
                      className="flex items-center gap-1 mx-auto px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded text-[11px] font-bold transition"
                    >
                      <Printer className="w-3 h-3" /> DANFE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
