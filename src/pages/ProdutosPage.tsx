import React, { useState } from 'react';
import { Produto } from '../types';
import { formatCurrency } from '../lib/utils';
import { SearchableSelect, SelectOption } from '../components/ui/SearchableSelect';
import { 
  Package, 
  Search, 
  Plus, 
  Boxes, 
  Pencil, 
  Trash2, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  TrendingUp
} from 'lucide-react';

interface ProdutosProps {
  produtos: Produto[];
  onRefresh: () => void;
}

export const ProdutosPage: React.FC<ProdutosProps> = ({ produtos, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const initialFormState = {
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
  };

  const [formData, setFormData] = useState(initialFormState);

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

  // Métricas rápidas de estoque
  const totalItensEstoque = produtos.reduce((acc, p) => acc + Number(p.estoque_atual || 0), 0);
  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (Number(p.preco_custo || 0) * Number(p.estoque_atual || 0)), 0);
  const itensEstoqueBaixo = produtos.filter((p) => Number(p.estoque_atual || 0) < 15).length;

  const handleOpenNewModal = () => {
    setEditingId(null);
    setFormData({
      ...initialFormState,
      codigo: `PRD-${Math.floor(100 + Math.random() * 900)}`,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (prod: Produto) => {
    setEditingId(prod.id);
    setFormData({
      codigo: prod.codigo,
      descricao: prod.descricao,
      categoria: prod.categoria || 'Informática & TI',
      unidade: prod.unidade || 'UN',
      preco_custo: String(prod.preco_custo),
      preco_venda: String(prod.preco_venda),
      estoque_atual: String(prod.estoque_atual),
      ncm: prod.ncm || '8471.30.12',
      aliq_icms: String(prod.aliq_icms ?? 18),
      aliq_ipi: String(prod.aliq_ipi ?? 0),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        codigo: formData.codigo.trim(),
        descricao: formData.descricao.trim(),
        categoria: formData.categoria,
        unidade: formData.unidade,
        preco_custo: parseFloat(formData.preco_custo) || 0,
        preco_venda: parseFloat(formData.preco_venda) || 0,
        estoque_atual: parseInt(formData.estoque_atual || '0', 10),
        ncm: formData.ncm.trim(),
        aliq_icms: parseFloat(formData.aliq_icms) || 0,
        aliq_ipi: parseFloat(formData.aliq_ipi) || 0,
      };

      if (editingId) {
        // Atualização (PUT)
        const res = await fetch(`/api/produtos/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erro ao atualizar produto');
        }

        setSuccessMessage(`Produto "${payload.descricao}" atualizado com sucesso!`);
      } else {
        // Criação (POST)
        const res = await fetch('/api/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erro ao cadastrar produto');
        }

        setSuccessMessage(`Produto "${payload.descricao}" cadastrado com sucesso!`);
      }

      setShowModal(false);
      onRefresh();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, descricao: string) => {
    if (!window.confirm(`Deseja realmente remover o produto "${descricao}" do banco de dados?`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao excluir produto');
      }

      setSuccessMessage(`Produto removido com sucesso.`);
      onRefresh();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = produtos.filter((p) => {
    const matchSearch =
      p.descricao.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.toLowerCase().includes(search.toLowerCase()) ||
      p.ncm.toLowerCase().includes(search.toLowerCase());

    const matchCategory = selectedCategory === 'TODAS' || p.categoria === selectedCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Produtos & Estoque Fiscal
          </h2>
          <p className="text-xs text-zinc-400">
            Gerenciamento no PostgreSQL com edição em tempo real de nomes, valores unitários e estoque
          </p>
        </div>
        <button
          onClick={handleOpenNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {/* Alerta de Sucesso Flutuante/Fixado */}
      {successMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cards de Métricas do Catálogo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Produtos Ativos</span>
            <p className="text-xl font-black text-white mt-1">{produtos.length} itens</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Estoque Total</span>
            <p className="text-xl font-black text-emerald-400 mt-1">{totalItensEstoque} un</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Boxes className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Patrimônio em Estoque</span>
            <p className="text-xl font-black text-white mt-1">{formatCurrency(valorTotalEstoque)}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Estoque Baixo (&lt; 15)</span>
            <p className={`text-xl font-black mt-1 ${itensEstoqueBaixo > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
              {itensEstoqueBaixo} itens
            </p>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${itensEstoqueBaixo > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-500'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros Rápidos */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto por nome, código, NCM ou categoria..."
            className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtro por Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setSelectedCategory('TODAS')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
              selectedCategory === 'TODAS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Todas ({produtos.length})
          </button>
          {['Informática & TI', 'Periféricos', 'Redes & Cabos', 'Energia', 'Automação'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA COM ROLAGEM INTERNA E AÇÕES (EDITAR / EXCLUIR) */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="max-h-[calc(100vh-320px)] overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#16161a] z-10 border-b border-zinc-800 shadow-sm">
              <tr className="text-zinc-400 text-[11px] font-bold uppercase">
                <th className="py-3 px-3 w-28">Código</th>
                <th className="py-3 px-3 min-w-[280px]">Nome do Produto (Descrição)</th>
                <th className="py-3 px-3 w-36">Categoria</th>
                <th className="py-3 px-3 w-28">NCM</th>
                <th className="py-3 px-3 w-16 text-center">Unid</th>
                <th className="py-3 px-3 w-28 text-right">Preço Custo</th>
                <th className="py-3 px-3 w-32 text-right">Valor Unitário (Venda)</th>
                <th className="py-3 px-3 w-24 text-right">Estoque</th>
                <th className="py-3 px-3 w-28 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-500 text-xs">
                    Nenhum produto encontrado correspondente aos critérios de busca.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-800/40 transition group">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      {prod.codigo}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-zinc-100 group-hover:text-blue-300 transition">
                        {prod.descricao}
                      </p>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        ICMS: {prod.aliq_icms ?? 18}% | IPI: {prod.aliq_ipi ?? 0}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-zinc-700/60">
                        {prod.categoria}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-400">{prod.ncm}</td>
                    <td className="py-2.5 px-3 text-center text-zinc-300 font-bold">{prod.unidade}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-400">
                      {formatCurrency(prod.preco_custo)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(prod.preco_venda)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        Number(prod.estoque_atual) < 15
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                      }`}>
                        {prod.estoque_atual} {prod.unidade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-semibold transition"
                          title="Editar Nome, Valor Unitário e Estoque"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.descricao)}
                          disabled={deletingId === prod.id}
                          className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition"
                          title="Excluir Produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO DE PRODUTO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {editingId ? (
                    <>
                      <Pencil className="w-4 h-4 text-blue-400" />
                      Editar Produto no Estoque
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-emerald-400" />
                      Cadastrar Novo Produto Fiscal
                    </>
                  )}
                </h3>
                <p className="text-xs text-zinc-400">
                  {editingId 
                    ? `Alterando dados do produto ID #${editingId} diretamente no PostgreSQL 16`
                    : 'Cadastre um novo item com NCM e alíquotas fiscais automáticas'
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome / Descrição do Produto (Campo Principal com Destaque) */}
              <div>
                <label className="text-[11px] font-bold text-blue-400 uppercase block mb-1">
                  Nome do Produto (Descrição Oficial) *
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-[#16161a] border border-[#27272a] rounded-lg px-3 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition"
                  placeholder="Ex: Notebook Dell Latitude Core i7 16GB"
                  required
                  autoFocus
                />
              </div>

              {/* Preço de Venda / Valor Unitário e Preço de Custo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#141418] border border-zinc-800">
                <div>
                  <label className="text-[11px] font-bold text-emerald-400 uppercase block mb-1">
                    Valor Unitário de Venda (R$) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.preco_venda}
                      onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
                      className="w-full bg-[#1a1a20] border border-emerald-500/30 rounded-lg px-3 py-2 text-sm font-mono font-bold text-emerald-300 focus:ring-2 focus:ring-emerald-500/40 outline-none"
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500">Utilizado como padrão na emissão de NF-e</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">
                    Preço de Custo (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_custo}
                    onChange={(e) => setFormData({ ...formData, preco_custo: e.target.value })}
                    className="w-full bg-[#1a1a20] border border-[#27272a] rounded-lg px-3 py-2 text-sm font-mono font-semibold text-zinc-200 focus:ring-2 focus:ring-blue-500/40 outline-none"
                    placeholder="0,00"
                    required
                  />
                  <span className="text-[10px] text-zinc-500">Custo de reposição do fornecedor</span>
                </div>
              </div>

              {/* Código, NCM e Estoque */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                    Código do Produto *
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full bg-[#16161a] border border-[#27272a] rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="PRD-01"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                    NCM Fiscal *
                  </label>
                  <input
                    type="text"
                    value={formData.ncm}
                    onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                    className="w-full bg-[#16161a] border border-[#27272a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="8471.30.12"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                    Estoque Atual *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estoque_atual}
                    onChange={(e) => setFormData({ ...formData, estoque_atual: e.target.value })}
                    className="w-full bg-[#16161a] border border-[#27272a] rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              {/* Categoria e Unidade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                    Categoria
                  </label>
                  <SearchableSelect
                    options={categoriaOptions}
                    value={formData.categoria}
                    onChange={(val) => setFormData({ ...formData, categoria: val })}
                    searchPlaceholder="Buscar categoria..."
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                    Unidade de Medida
                  </label>
                  <SearchableSelect
                    options={unidadeOptions}
                    value={formData.unidade}
                    onChange={(val) => setFormData({ ...formData, unidade: val })}
                    searchPlaceholder="Buscar unidade..."
                  />
                </div>
              </div>

              {/* Alíquotas Tributárias */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                    Alíquota ICMS (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.aliq_icms}
                    onChange={(e) => setFormData({ ...formData, aliq_icms: e.target.value })}
                    className="w-full bg-[#16161a] border border-[#27272a] rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                    Alíquota IPI (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.aliq_ipi}
                    onChange={(e) => setFormData({ ...formData, aliq_ipi: e.target.value })}
                    className="w-full bg-[#16161a] border border-[#27272a] rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200"
                    required
                  />
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-blue-600/20 transition active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Gravando no SQL...' : (editingId ? 'Salvar Alterações' : 'Cadastrar Produto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
