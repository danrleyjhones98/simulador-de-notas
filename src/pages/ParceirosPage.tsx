import React, { useState } from 'react';
import { Parceiro } from '../types';
import { Building2, Search, Plus, Phone, Mail, MapPin } from 'lucide-react';

interface ParceirosProps {
  parceiros: Parceiro[];
  onRefresh: () => void;
}

export const ParceirosPage: React.FC<ParceirosProps> = ({ parceiros, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'TODOS' | 'FORNECEDOR' | 'CLIENTE'>('TODOS');

  const filtered = parceiros.filter((p) => {
    const matchType = filterType === 'TODOS' || p.tipo === filterType;
    const matchSearch =
      p.razao_social.toLowerCase().includes(search.toLowerCase()) ||
      p.nome_fantasia.toLowerCase().includes(search.toLowerCase()) ||
      p.cnpj.includes(search) ||
      p.municipio.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Fornecedores & Clientes (Parceiros Fiscais)
          </h2>
          <p className="text-xs text-zinc-400">
            Cadastro completo com CNPJ, Inscrição Estadual e endereços gravados no PostgreSQL
          </p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por CNPJ, Razão Social ou Cidade..."
            className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['TODOS', 'FORNECEDOR', 'CLIENTE'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Parceiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((parc) => (
          <div key={parc.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  parc.tipo === 'FORNECEDOR'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {parc.tipo}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">ID #{parc.id}</span>
              </div>
              <h4 className="font-bold text-sm text-white">{parc.nome_fantasia}</h4>
              <p className="text-xs text-zinc-400">{parc.razao_social}</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-[11px] text-zinc-300">
              <p className="font-mono"><span className="text-zinc-500">CNPJ:</span> {parc.cnpj}</p>
              <p className="font-mono"><span className="text-zinc-500">IE:</span> {parc.inscricao_estadual || 'ISENTO'}</p>
              <p className="flex items-center gap-1.5 text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {parc.municipio} - {parc.uf}
              </p>
              {parc.telefone && (
                <p className="flex items-center gap-1.5 text-zinc-400">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  {parc.telefone}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
