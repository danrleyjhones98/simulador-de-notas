import React, { useState } from 'react';
import { Produto, Parceiro, NotaItem } from '../types';
import { formatCurrency } from '../lib/utils';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Calculator, 
  Send, 
  Package, 
  Building, 
  Calendar, 
  CreditCard,
  CheckCircle
} from 'lucide-react';

interface NovaNotaProps {
  produtos: Produto[];
  parceiros: Parceiro[];
  onNotaCreated: (newNotaId: number) => void;
}

export const NovaNotaPage: React.FC<NovaNotaProps> = ({
  produtos,
  parceiros,
  onNotaCreated,
}) => {
  const [tipoOperacao, setTipoOperacao] = useState<'ENTRADA' | 'SAIDA'>('SAIDA');
  const [numeroNf, setNumeroNf] = useState(`000.0${Math.floor(10000 + Math.random() * 90000)}`);
  const [serie, setSerie] = useState('1');
  const [naturezaOperacao, setNaturezaOperacao] = useState('VENDA DE MERCADORIAS E PRODUTOS');
  const [emitenteId, setEmitenteId] = useState<number>(parceiros[0]?.id || 1);
  const [destinatarioId, setDestinatarioId] = useState<number>(parceiros[parceiros.length - 1]?.id || 2);
  const [parcelas, setParcelas] = useState(2);
  const [loading, setLoading] = useState(false);

  // Itens da nota
  const [itens, setItens] = useState<NotaItem[]>([
    {
      produto_id: produtos[0]?.id || null,
      codigo: produtos[0]?.codigo || 'PRD-01',
      descricao: produtos[0]?.descricao || 'Item Selecionado',
      ncm: produtos[0]?.ncm || '8471.30.12',
      cst: '000',
      cfop: '5.102',
      unidade: produtos[0]?.unidade || 'UN',
      quantidade: 2,
      valor_unitario: Number(produtos[0]?.preco_venda || 100),
      valor_total: 2 * Number(produtos[0]?.preco_venda || 100),
      base_calculo_icms: 2 * Number(produtos[0]?.preco_venda || 100),
      valor_icms: (2 * Number(produtos[0]?.preco_venda || 100) * 18) / 100,
      aliq_icms: 18,
      valor_ipi: 0,
      aliq_ipi: 0,
    },
  ]);

  const handleAddItem = () => {
    const prod = produtos[0];
    const newItem: NotaItem = {
      produto_id: prod?.id || null,
      codigo: prod?.codigo || `PRD-${itens.length + 1}`,
      descricao: prod?.descricao || 'Novo Produto Selecionado',
      ncm: prod?.ncm || '8471.30.12',
      cst: '000',
      cfop: tipoOperacao === 'SAIDA' ? '5.102' : '1.102',
      unidade: prod?.unidade || 'UN',
      quantidade: 1,
      valor_unitario: Number(prod?.preco_venda || 50),
      valor_total: Number(prod?.preco_venda || 50),
      base_calculo_icms: Number(prod?.preco_venda || 50),
      valor_icms: (Number(prod?.preco_venda || 50) * 18) / 100,
      aliq_icms: 18,
      valor_ipi: 0,
      aliq_ipi: 0,
    };
    setItens([...itens, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, prodId: number) => {
    const prod = produtos.find((p) => p.id === prodId);
    if (!prod) return;

    const unitPrice = tipoOperacao === 'ENTRADA' ? Number(prod.preco_custo) : Number(prod.preco_venda);
    const updated = [...itens];
    const qtd = updated[index].quantidade || 1;
    const tot = qtd * unitPrice;
    const icms = (tot * Number(prod.aliq_icms || 18)) / 100;
    const ipi = (tot * Number(prod.aliq_ipi || 0)) / 100;

    updated[index] = {
      ...updated[index],
      produto_id: prod.id,
      codigo: prod.codigo,
      descricao: prod.descricao,
      ncm: prod.ncm,
      unidade: prod.unidade,
      valor_unitario: unitPrice,
      valor_total: tot,
      base_calculo_icms: tot,
      valor_icms: icms,
      aliq_icms: Number(prod.aliq_icms || 18),
      valor_ipi: ipi,
      aliq_ipi: Number(prod.aliq_ipi || 0),
    };
    setItens(updated);
  };

  const handleQuantityChange = (index: number, q: number) => {
    const updated = [...itens];
    const vu = updated[index].valor_unitario || 0;
    const tot = q * vu;
    const icms = (tot * updated[index].aliq_icms) / 100;
    const ipi = (tot * updated[index].aliq_ipi) / 100;

    updated[index] = {
      ...updated[index],
      quantidade: q,
      valor_total: tot,
      base_calculo_icms: tot,
      valor_icms: icms,
      valor_ipi: ipi,
    };
    setItens(updated);
  };

  // Cálculos consolidados
  const totalProdutos = itens.reduce((acc, curr) => acc + (curr.valor_total || 0), 0);
  const totalIcms = itens.reduce((acc, curr) => acc + (curr.valor_icms || 0), 0);
  const totalIpi = itens.reduce((acc, curr) => acc + (curr.valor_ipi || 0), 0);
  const totalNota = totalProdutos + totalIpi;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itens.length === 0) {
      alert('Adicione ao menos um produto à nota!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        numero_nf: numeroNf,
        serie,
        tipo_operacao: tipoOperacao,
        natureza_operacao: naturezaOperacao,
        emitente_id: emitenteId,
        destinatario_id: destinatarioId,
        itens,
        parcelas,
      };

      const res = await fetch('/api/notas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao emitir nota fiscal');
      }

      const created = await res.json();

      // Disparar confetes festivos
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      onNotaCreated(created.id);
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Emissão de Nota Fiscal Eletrônica (NF-e)
          </h2>
          <p className="text-xs text-zinc-400">
            Simulação completa com gravação transacional no PostgreSQL e cálculo SEFAZ
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/30 transition active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <span>Processando SQL...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Emitir & Visualizar DANFE (PDF)
            </>
          )}
        </button>
      </div>

      {/* Dados Principais da Operação */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400" />
          Dados da Operação Fiscal
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
              Tipo de Operação
            </label>
            <select
              value={tipoOperacao}
              onChange={(e) => {
                const val = e.target.value as 'ENTRADA' | 'SAIDA';
                setTipoOperacao(val);
                setNaturezaOperacao(
                  val === 'SAIDA' ? 'VENDA DE MERCADORIAS E PRODUTOS' : 'COMPRA PARA COMERCIALIZACAO E REVENDA'
                );
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="SAIDA">1 - Saída (Venda / Faturamento)</option>
              <option value="ENTRADA">0 - Entrada (Compra / Devolução)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
              Número da NF-e
            </label>
            <input
              type="text"
              value={numeroNf}
              onChange={(e) => setNumeroNf(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
              Série
            </label>
            <input
              type="text"
              value={serie}
              onChange={(e) => setSerie(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
              Parcelamento / Fatura
            </label>
            <select
              value={parcelas}
              onChange={(e) => setParcelas(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="1">1x (À Vista)</option>
              <option value="2">2x (30 / 60 dias)</option>
              <option value="3">3x (30 / 60 / 90 dias)</option>
              <option value="4">4x (30 / 60 / 90 / 120 dias)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
              Emitente (Empresa Vendedora / Origem)
            </label>
            <select
              value={emitenteId}
              onChange={(e) => setEmitenteId(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {parceiros.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome_fantasia} ({p.cnpj}) - {p.municipio}/{p.uf}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
              Destinatário (Cliente / Comprador)
            </label>
            <select
              value={destinatarioId}
              onChange={(e) => setDestinatarioId(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {parceiros.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome_fantasia} ({p.cnpj}) - {p.municipio}/{p.uf}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
            Natureza da Operação
          </label>
          <input
            type="text"
            value={naturezaOperacao}
            onChange={(e) => setNaturezaOperacao(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
      </div>

      {/* Tabela de Produtos & Serviços */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" />
            Itens e Produtos da Nota Fiscal
          </h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] font-bold uppercase">
                <th className="py-2 px-2">Produto do Catálogo</th>
                <th className="py-2 px-2 w-24">NCM</th>
                <th className="py-2 px-2 w-16 text-center">Unid</th>
                <th className="py-2 px-2 w-20 text-right">Qtd</th>
                <th className="py-2 px-2 w-28 text-right">Vlr Unit</th>
                <th className="py-2 px-2 w-28 text-right">Total</th>
                <th className="py-2 px-2 w-24 text-right">ICMS</th>
                <th className="py-2 px-2 w-10 text-center">Remover</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {itens.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/30">
                  <td className="py-2 px-2">
                    <select
                      value={item.produto_id || ''}
                      onChange={(e) => handleProductSelect(idx, Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200"
                    >
                      {produtos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.codigo} - {p.descricao} (Estoque: {p.estoque_atual})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-2 font-mono text-zinc-400">{item.ncm}</td>
                  <td className="py-2 px-2 text-center text-zinc-300">{item.unidade}</td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                      className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-right text-xs font-mono font-bold text-white"
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-zinc-300">
                    {formatCurrency(item.valor_unitario)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-white">
                    {formatCurrency(item.valor_total)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-emerald-400">
                    {formatCurrency(item.valor_icms)} ({item.aliq_icms}%)
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={itens.length === 1}
                      className="p-1 rounded text-zinc-500 hover:text-red-400 disabled:opacity-30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo Tributário e Botão de Emissão */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="p-3 bg-zinc-800/60 rounded-lg border border-zinc-700">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Produtos</span>
          <span className="text-base font-black text-white font-mono">{formatCurrency(totalProdutos)}</span>
        </div>

        <div className="p-3 bg-zinc-800/60 rounded-lg border border-zinc-700">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">ICMS Total (18%)</span>
          <span className="text-base font-black text-emerald-400 font-mono">{formatCurrency(totalIcms)}</span>
        </div>

        <div className="p-3 bg-zinc-800/60 rounded-lg border border-zinc-700">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">IPI Total</span>
          <span className="text-base font-black text-indigo-400 font-mono">{formatCurrency(totalIpi)}</span>
        </div>

        <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-lg">
          <span className="text-[10px] uppercase font-black text-blue-400 block">Total Geral da Nota</span>
          <span className="text-xl font-black text-white font-mono">{formatCurrency(totalNota)}</span>
        </div>
      </div>
    </form>
  );
};
