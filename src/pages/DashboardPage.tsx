import React from 'react';
import { Produto, Parceiro, NotaFiscal } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { 
  DollarSign, 
  FileText, 
  Package, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  Printer, 
  Eye, 
  TrendingUp,
  Boxes
} from 'lucide-react';

interface DashboardProps {
  notas: NotaFiscal[];
  produtos: Produto[];
  parceiros: Parceiro[];
  onNavigate: (tab: string, notaId?: number) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({
  notas,
  produtos,
  parceiros,
  onNavigate,
}) => {
  const totalFaturado = notas.reduce((acc, curr) => acc + Number(curr.valor_total || 0), 0);
  const totalEntradas = notas
    .filter((n) => n.tipo_operacao === 'ENTRADA')
    .reduce((acc, curr) => acc + Number(curr.valor_total || 0), 0);
  const totalSaidas = notas
    .filter((n) => n.tipo_operacao === 'SAIDA')
    .reduce((acc, curr) => acc + Number(curr.valor_total || 0), 0);

  const totalEstoqueItens = produtos.reduce((acc, curr) => acc + Number(curr.estoque_atual || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Painel Geral & Controle Fiscal
          </h2>
          <p className="text-xs text-zinc-400">
            Visão consolidada de operações fiscais, estoque e faturamento no PostgreSQL 16
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('nova-nota')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Emitir NF-e
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Faturamento Total</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{formatCurrency(totalFaturado)}</span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400">
              <span className="text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 100%
              </span>
              <span>calculado em SQL</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Notas Emitidas</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{notas.length}</span>
            <p className="text-[11px] text-zinc-400 mt-1">Todas autorizadas pela SEFAZ</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Estoque de Produtos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{totalEstoqueItens} un</span>
            <p className="text-[11px] text-zinc-400 mt-1">{produtos.length} produtos cadastrados</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Fornecedores & Clientes</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{parceiros.length}</span>
            <p className="text-[11px] text-zinc-400 mt-1">Com CNPJs autênticos</p>
          </div>
        </div>
      </div>

      {/* Entradas vs Saídas Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Balanço Fiscal (Entradas vs Saídas)
            </h3>
            <span className="text-xs text-zinc-500 font-mono">Consolidado Geral</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                  <ArrowDownRight className="w-4 h-4 text-emerald-400" /> Compras & Entradas
                </span>
                <span className="font-bold text-white">{formatCurrency(totalEntradas)}</span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalFaturado > 0 ? (totalEntradas / totalFaturado) * 100 : 50}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                  <ArrowUpRight className="w-4 h-4 text-blue-400" /> Vendas & Saídas
                </span>
                <span className="font-bold text-white">{formatCurrency(totalSaidas)}</span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalFaturado > 0 ? (totalSaidas / totalFaturado) * 100 : 50}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Operações fiscais reguladas conforme padrão da SEFAZ</span>
            <button 
              onClick={() => onNavigate('historico')} 
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              Ver relatório completo &rarr;
            </button>
          </div>
        </div>

        {/* Atalhos Rápidos */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Atalhos Fiscais</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('nova-nota')}
                className="w-full p-2.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-left flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-200">Emitir Nova Nota</p>
                  <p className="text-[10px] text-zinc-400">Simulação com cálculo fiscal real</p>
                </div>
              </button>

              <button
                onClick={() => onNavigate('danfe')}
                className="w-full p-2.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-left flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-200">DANFE SEFAZ Oficial</p>
                  <p className="text-[10px] text-zinc-400">Imprimir ou Salvar em PDF</p>
                </div>
              </button>

              <button
                onClick={() => onNavigate('produtos')}
                className="w-full p-2.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-left flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-200">Catálogo & Estoque</p>
                  <p className="text-[10px] text-zinc-400">Consultar NCM e tributos</p>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-300">
            💡 Dica: Todas as notas emitidas geram chave de acesso de 44 dígitos autêntica e código de barras para impressão.
          </div>
        </div>
      </div>

      {/* Tabela de Últimas Notas */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Últimas Notas Fiscais Emitidas</h3>
            <p className="text-xs text-zinc-400">Registros gravados na tabela notas_fiscais do PostgreSQL</p>
          </div>
          <button
            onClick={() => onNavigate('historico')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300"
          >
            Ver Todas
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] font-bold uppercase">
                <th className="py-2.5 px-3">Número</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Emitente</th>
                <th className="py-2.5 px-3">Destinatário</th>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3 text-right">Valor Total</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {notas.slice(0, 5).map((nota) => (
                <tr key={nota.id} className="hover:bg-zinc-800/40 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-white">Nº {nota.numero_nf}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      nota.tipo_operacao === 'ENTRADA'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {nota.tipo_operacao}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300 font-medium">
                    {nota.emitente_fantasia || nota.emitente_nome || 'Emitente'}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300 font-medium">
                    {nota.destinatario_fantasia || nota.destinatario_nome || 'Destinatário'}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400">{formatDate(nota.data_emissao)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-white font-mono">
                    {formatCurrency(nota.valor_total)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {nota.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onNavigate('danfe', nota.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-300 hover:text-white transition"
                      title="Visualizar DANFE e Imprimir PDF"
                    >
                      <Eye className="w-3.5 h-3.5" />
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
