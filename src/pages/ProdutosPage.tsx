import React, { useState } from 'react';
import { Produto } from '../types';
import { formatCurrency } from '../lib/utils';
import { SearchableSelect, SelectOption } from '../components/ui/SearchableSelect';
import { Package, Search, Plus, Boxes } from 'lucide-react';

interface ProdutosProps {
  produtos: Produto[];
  onRefresh: () => void;
}

export const ProdutosPage: React.FC<ProdutosProps> = ({ produtos, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    categoria: 'Informática & TI',
    unidade: 'UN',
    preco_custo: '',
    preco_venda: '',
    estoque_atual: '',
    ncm: '8471.30.12',
    aliq_icms: '18',
    aliq_ipi: '5',
  });

  const categoriaOptions: SelectOption[] = [
    { value: 'Informática & TI', label: 'Informática & TI' },
    { value: 'Periféricos', label: 'Periféricos' },
    { value: 'Energia', label: 'Energia' },
    { value: 'Redes & Cabos', label: 'Redes & Cabos' },
    { value: 'Automação', label: 'Automação' },
    { value: 'Elétrica', label: 'Elétrica' },
    { value: 'Suprimentos', label: 'Suprimentos' },
  ];

  const unidadeOptions: SelectOption[] = [
    { value: 'UN', label: 'UN (Unidade)' },
    { value: 'CX', label: 'CX (Caixa)' },
    { value: 'PC', label: 'PC (Pacote/Peça)' },
    { value: 'RL', label: 'RL (Rolo)' },
    { value: 'KG', label: 'KG (Quilograma)' },
  ];

  const filtered = produtos.filter((p) =>
    p.descricao.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preco_custo: parseFloat(formData.preco_custo),
          preco_venda: parseFloat(formData.preco_venda),
          estoque_atual: parseInt(formData.estoque_atual || '0', 10),
          aliq_icms: parseFloat(formData.aliq_icms),
          aliq_ipi: parseFloat(formData.aliq_ipi),
        }),
      });
      if (!res.ok) throw new Error('Erro ao salvar produto');
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Produtos & Estoque Fiscal
          </h2>
          <p className="text-xs text-zinc-400">
            Itens armazenados na tabela produtos do PostgreSQL com NCM e alíquotas
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto por nome, código ou categoria..."
          className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full"
        />
      </div>

      {/* TABELA COM ROLAGEM INTERNA E HEADER FIXO */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg">
        <div className="max-h-[calc(100vh-280px)] overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#16161a] z-10 border-b border-zinc-800 shadow-sm">
              <tr className="text-zinc-400 text-[11px] font-bold uppercase">
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Descrição do Item</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3">NCM</th>
                <th className="py-3 px-3 text-center">Unid</th>
                <th className="py-3 px-3 text-right">Custo</th>
                <th className="py-3 px-3 text-right">Venda</th>
                <th className="py-3 px-3 text-right">Estoque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-white">{prod.codigo}</td>
                  <td className="py-2.5 px-3 font-semibold text-zinc-200">{prod.descricao}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{prod.categoria}</td>
                  <td className="py-2.5 px-3 font-mono text-zinc-400">{prod.ncm}</td>
                  <td className="py-2.5 px-3 text-center text-zinc-300 font-semibold">{prod.unidade}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-zinc-400">{formatCurrency(prod.preco_custo)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(prod.preco_venda)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      prod.estoque_atual < 15 ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-800 text-zinc-200'
                    }`}>
                      {prod.estoque_atual} un
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Produto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Cadastrar Novo Produto no PostgreSQL</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Código</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full bg-[#16161a] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white"
                    placeholder="PRD-NOVO-01"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">NCM</label>
                  <input
                    type="text"
                    value={formData.ncm}
                    onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                    className="w-full bg-[#16161a] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white"
                    placeholder="8471.30.12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Descrição</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-[#16161a] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white"
                  placeholder="Nome detalhado do produto fiscal"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Categoria</label>
                  <SearchableSelect
                    options={categoriaOptions}
                    value={formData.categoria}
                    onChange={(val) => setFormData({ ...formData, categoria: val })}
                    searchPlaceholder="Buscar categoria..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Unidade</label>
                  <SearchableSelect
                    options={unidadeOptions}
                    value={formData.unidade}
                    onChange={(val) => setFormData({ ...formData, unidade: val })}
                    searchPlaceholder="Buscar unidade..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Preço Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.preco_custo}
                    onChange={(e) => setFormData({ ...formData, preco_custo: e.target.value })}
                    className="w-full bg-[#16161a] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Preço Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.preco_venda}
                    onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
                    className="w-full bg-[#16161a] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Estoque</label>
                  <input
                    type="number"
                    value={formData.estoque_atual}
                    onChange={(e) => setFormData({ ...formData, estoque_atual: e.target.value })}
                    className="w-full bg-[#16161a] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs"
                >
                  Salvar via SQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
