import React from 'react';
import { NotaFiscal } from '../../types';
import { formatCurrency, formatDate, formatChaveAcesso } from '../../lib/utils';
import { Printer, Download, Copy, Check, ArrowLeft } from 'lucide-react';

interface DanfeDocumentProps {
  nota: NotaFiscal;
  onBack?: () => void;
}

export const DanfeDocument: React.FC<DanfeDocumentProps> = ({ nota, onBack }) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyChave = () => {
    navigator.clipboard.writeText(nota.chave_acesso || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadXml = () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${nota.chave_acesso}" versao="4.00">
      <ide>
        <nNF>${nota.numero_nf.replace(/\D/g, '')}</nNF>
        <serie>${nota.serie}</serie>
        <dhEmi>${nota.data_emissao}</dhEmi>
        <tpNF>${nota.tipo_operacao === 'ENTRADA' ? '0' : '1'}</tpNF>
        <natOp>${nota.natureza_operacao}</natOp>
      </ide>
      <emit>
        <CNPJ>${(nota.emitente?.cnpj || nota.emitente_cnpj || '').replace(/\D/g, '')}</CNPJ>
        <xNome>${nota.emitente?.razao_social || nota.emitente_nome}</xNome>
        <IE>${nota.emitente?.inscricao_estadual || 'ISENTO'}</IE>
      </emit>
      <dest>
        <CNPJ>${(nota.destinatario?.cnpj || nota.destinatario_cnpj || '').replace(/\D/g, '')}</CNPJ>
        <xNome>${nota.destinatario?.razao_social || nota.destinatario_nome}</xNome>
      </dest>
      ${(nota.itens || []).map((it, idx) => `
      <det nItem="${idx + 1}">
        <prod>
          <cProd>${it.codigo}</cProd>
          <xProd>${it.descricao}</xProd>
          <NCM>${(it.ncm || '').replace(/\D/g, '')}</NCM>
          <CFOP>${(it.cfop || '').replace(/\D/g, '')}</CFOP>
          <uCom>${it.unidade}</uCom>
          <qCom>${Number(it.quantidade).toFixed(4)}</qCom>
          <vUnCom>${Number(it.valor_unitario).toFixed(4)}</vUnCom>
          <vProd>${Number(it.valor_total).toFixed(2)}</vProd>
          <uTrib>${it.unidade}</uTrib>
          <qTrib>${Number(it.quantidade).toFixed(4)}</qTrib>
          <vUnTrib>${Number(it.valor_unitario).toFixed(4)}</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>${it.cst || '000'}</CST>
              <modBC>3</modBC>
              <vBC>${Number(it.base_calculo_icms).toFixed(2)}</vBC>
              <pICMS>${Number(it.aliq_icms).toFixed(2)}</pICMS>
              <vICMS>${Number(it.valor_icms).toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>`).join('')}
      <total>
        <ICMSTot>
          <vBC>${Number(nota.base_calculo_icms).toFixed(2)}</vBC>
          <vICMS>${Number(nota.valor_icms).toFixed(2)}</vICMS>
          <vProd>${Number(nota.valor_produtos).toFixed(2)}</vProd>
          <vNF>${Number(nota.valor_total).toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <nProt>${nota.protocolo_autorizacao.split('-')[0].trim()}</nProt>
      <dhRecbto>${nota.data_emissao}</dhRecbto>
      <chNFe>${nota.chave_acesso}</chNFe>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;

    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NFe-${nota.chave_acesso}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Gerador de SVG de Código de Barras Code-128 realista
  const renderBarcode = () => {
    const bars: { width: number; isBlack: boolean }[] = [];
    const seed = nota.chave_acesso || '35260972381189000110550010000894581234567890';
    
    // Padrão de início
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 1, isBlack: false });
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 2, isBlack: false });

    // Barras correspondentes aos dígitos
    for (let i = 0; i < seed.length; i++) {
      const digit = parseInt(seed[i], 10) || 0;
      const w1 = (digit % 3) + 1;
      const w2 = ((digit + 1) % 2) + 1;
      bars.push({ width: w1, isBlack: true });
      bars.push({ width: w2, isBlack: false });
      bars.push({ width: 1.5, isBlack: true });
      bars.push({ width: 1, isBlack: false });
    }

    // Padrão de parada
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 3, isBlack: false });
    bars.push({ width: 2, isBlack: true });

    let currentX = 0;
    return (
      <svg className="w-full h-11" viewBox="0 0 320 44" preserveAspectRatio="none">
        {bars.map((bar, index) => {
          const x = currentX;
          currentX += bar.width * 1.5;
          if (!bar.isBlack) return null;
          return (
            <rect
              key={index}
              x={x}
              y={0}
              width={bar.width * 1.4}
              height={44}
              fill="#000000"
            />
          );
        })}
      </svg>
    );
  };

  const emit = nota.emitente || {
    razao_social: nota.emitente_nome || 'EMITENTE DEMO LTDA',
    nome_fantasia: 'EMITENTE DEMO',
    cnpj: nota.emitente_cnpj || '00.000.000/0001-00',
    inscricao_estadual: '111.222.333.444',
    logradouro: 'Av. das Indústrias',
    numero: '1000',
    bairro: 'Polo Tecnológico',
    municipio: 'São Paulo',
    uf: 'SP',
    cep: '01000-000',
    telefone: '(11) 3000-0000',
  };

  const dest = nota.destinatario || {
    razao_social: nota.destinatario_nome || 'DESTINATARIO DEMO S.A.',
    nome_fantasia: 'DESTINATARIO DEMO',
    cnpj: nota.destinatario_cnpj || '99.888.777/0001-66',
    inscricao_estadual: 'ISENTO',
    logradouro: 'Rua do Comércio',
    numero: '500',
    bairro: 'Centro',
    municipio: 'Curitiba',
    uf: 'PR',
    cep: '80000-000',
    telefone: '(41) 3200-1111',
  };

  return (
    <div className="w-full flex flex-col items-center py-6 px-4">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print w-full max-w-[210mm] flex items-center justify-between mb-4 bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">DANFE NF-e Nº {nota.numero_nf}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {nota.status}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Padrão SEFAZ Oficial (A4 Retrato para Impressão e PDF)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyChave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition"
            title="Copiar Chave de Acesso"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiada!' : 'Chave'}
          </button>
          <button
            onClick={handleDownloadXml}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition"
            title="Baixar XML da NF-e"
          >
            <Download className="w-3.5 h-3.5" /> XML
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/30 transition active:scale-95"
          >
            <Printer className="w-4 h-4" /> Imprimir DANFE / Salvar PDF
          </button>
        </div>
      </div>

      {/* DANFE SEFAZ OFICIAL A4 CONTAINER */}
      <div 
        id="danfe-print-area"
        className="danfe-container w-full max-w-[210mm] bg-white text-black p-[6mm] font-sans text-[9px] shadow-2xl border border-zinc-700 leading-tight select-text"
        style={{ minHeight: '297mm' }}
      >
        {/* 1. CANHOTO DE RECEBIMENTO (COM LINHA PONTILHADA DE PICOTE) */}
        <div className="border border-black mb-1 p-1">
          <div className="flex">
            <div className="w-[80%] border-r border-black pr-2">
              <p className="text-[8px] uppercase font-semibold leading-3">
                RECEBEMOS DE <span className="font-black">{emit.razao_social}</span> OS PRODUTOS/SERVIÇOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t border-black">
                <div>
                  <span className="text-[7px] text-gray-700 uppercase block">DATA DE RECEBIMENTO</span>
                  <div className="h-4 border-b border-black"></div>
                </div>
                <div>
                  <span className="text-[7px] text-gray-700 uppercase block">IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</span>
                  <div className="h-4 border-b border-black"></div>
                </div>
              </div>
            </div>
            <div className="w-[20%] pl-2 flex flex-col justify-center items-center text-center">
              <span className="text-[9px] font-black uppercase">NF-e</span>
              <span className="text-[12px] font-black tracking-tighter">Nº {nota.numero_nf}</span>
              <span className="text-[8px] font-semibold">SÉRIE {nota.serie}</span>
            </div>
          </div>
        </div>

        {/* LINHA DE PICOTE */}
        <div className="w-full border-b border-dashed border-black mb-1.5 my-0.5"></div>

        {/* 2. CABEÇALHO DO EMITENTE E DADOS DA NF-E */}
        <div className="grid grid-cols-12 border border-black mb-1">
          {/* Identificação do Emitente */}
          <div className="col-span-5 p-2 border-r border-black flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-black text-white font-black text-xs flex items-center justify-center rounded">
                  NF
                </div>
                <div>
                  <h2 className="font-black text-[11px] uppercase leading-none">{emit.razao_social}</h2>
                  <p className="text-[8px] text-gray-700 font-semibold">{emit.nome_fantasia}</p>
                </div>
              </div>
              <p className="text-[8px] leading-tight">
                {emit.logradouro}, {emit.numero} - {emit.bairro}<br />
                {emit.municipio} - {emit.uf} | CEP: {emit.cep}<br />
                Fone: {emit.telefone || '(00) 0000-0000'}
              </p>
            </div>
          </div>

          {/* DANFE Box Central */}
          <div className="col-span-3 p-1.5 border-r border-black flex flex-col items-center justify-center text-center">
            <h3 className="font-black text-[13px] leading-none">DANFE</h3>
            <p className="text-[7.5px] leading-tight uppercase font-semibold">Documento Auxiliar da Nota Fiscal Eletrônica</p>
            <div className="flex items-center gap-2 my-1 border border-black px-2 py-0.5 font-black text-[9px]">
              <span>0 - ENTRADA</span>
              <span className="border border-black px-1.5 bg-black text-white">
                {nota.tipo_operacao === 'ENTRADA' ? '0' : '1'}
              </span>
              <span>1 - SAÍDA</span>
            </div>
            <p className="font-black text-[10px]">Nº {nota.numero_nf}</p>
            <p className="font-bold text-[8.5px]">SÉRIE: {nota.serie}</p>
            <p className="text-[7.5px]">FOLHA: 1/1</p>
          </div>

          {/* Código de Barras e Chave de Acesso */}
          <div className="col-span-4 p-1.5 flex flex-col justify-between">
            <div className="w-full flex justify-center">
              {renderBarcode()}
            </div>
            <div className="border-t border-black pt-1 mt-1">
              <span className="text-[7px] font-bold text-gray-700 uppercase block">CHAVE DE ACESSO</span>
              <p className="font-mono text-[8px] font-black text-center tracking-wider">
                {formatChaveAcesso(nota.chave_acesso)}
              </p>
            </div>
            <div className="border-t border-black pt-0.5 mt-0.5 text-center">
              <p className="text-[7px] leading-tight text-gray-800">
                Consulta de autenticidade no portal nacional da NF-e<br />
                <span className="font-bold">www.nfe.fazenda.gov.br/portal</span> ou no site da Sefaz Autorizadora
              </p>
            </div>
          </div>
        </div>

        {/* 3. NATUREZA DA OPERAÇÃO E PROTOCOLO */}
        <div className="grid grid-cols-12 border border-black mb-1">
          <div className="col-span-7 p-1 border-r border-black">
            <span className="text-[7px] text-gray-700 uppercase block">NATUREZA DA OPERAÇÃO</span>
            <p className="font-bold uppercase text-[8.5px]">{nota.natureza_operacao}</p>
          </div>
          <div className="col-span-5 p-1">
            <span className="text-[7px] text-gray-700 uppercase block">PROTOCOLO DE AUTORIZAÇÃO DE USO</span>
            <p className="font-bold text-[8.5px]">{nota.protocolo_autorizacao}</p>
          </div>
        </div>

        <div className="grid grid-cols-12 border border-black mb-1">
          <div className="col-span-4 p-1 border-r border-black">
            <span className="text-[7px] text-gray-700 uppercase block">INSCRIÇÃO ESTADUAL</span>
            <p className="font-bold text-[8.5px]">{emit.inscricao_estadual || 'ISENTO'}</p>
          </div>
          <div className="col-span-4 p-1 border-r border-black">
            <span className="text-[7px] text-gray-700 uppercase block">INSC. ESTADUAL DO SUBST. TRIBUT.</span>
            <p className="font-bold text-[8.5px]">-</p>
          </div>
          <div className="col-span-4 p-1">
            <span className="text-[7px] text-gray-700 uppercase block">CNPJ / CPF</span>
            <p className="font-bold text-[8.5px]">{emit.cnpj}</p>
          </div>
        </div>

        {/* 4. DESTINATÁRIO / REMETENTE */}
        <div className="bg-gray-200 border-x border-t border-black px-1 py-0.5 font-bold text-[8px] uppercase">
          DESTINATÁRIO / REMETENTE
        </div>
        <div className="border border-black mb-1">
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-8 p-1 border-r border-black">
              <span className="text-[7px] text-gray-700 uppercase block">NOME / RAZÃO SOCIAL</span>
              <p className="font-bold text-[8.5px] uppercase">{dest.razao_social}</p>
            </div>
            <div className="col-span-4 p-1">
              <span className="text-[7px] text-gray-700 uppercase block">CNPJ / CPF</span>
              <p className="font-bold text-[8.5px]">{dest.cnpj}</p>
            </div>
          </div>
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-6 p-1 border-r border-black">
              <span className="text-[7px] text-gray-700 uppercase block">ENDEREÇO</span>
              <p className="font-bold text-[8.5px]">{dest.logradouro}, {dest.numero}</p>
            </div>
            <div className="col-span-3 p-1 border-r border-black">
              <span className="text-[7px] text-gray-700 uppercase block">BAIRRO / DISTRITO</span>
              <p className="font-bold text-[8.5px]">{dest.bairro}</p>
            </div>
            <div className="col-span-3 p-1">
              <span className="text-[7px] text-gray-700 uppercase block">CEP</span>
              <p className="font-bold text-[8.5px]">{dest.cep}</p>
            </div>
          </div>
          <div className="grid grid-cols-12">
            <div className="col-span-4 p-1 border-r border-black">
              <span className="text-[7px] text-gray-700 uppercase block">MUNICÍPIO</span>
              <p className="font-bold text-[8.5px]">{dest.municipio}</p>
            </div>
            <div className="col-span-1 p-1 border-r border-black text-center">
              <span className="text-[7px] text-gray-700 uppercase block">UF</span>
              <p className="font-bold text-[8.5px]">{dest.uf}</p>
            </div>
            <div className="col-span-3 p-1 border-r border-black">
              <span className="text-[7px] text-gray-700 uppercase block">FONE / FAX</span>
              <p className="font-bold text-[8.5px]">{dest.telefone || '-'}</p>
            </div>
            <div className="col-span-2 p-1 border-r border-black">
              <span className="text-[7px] text-gray-700 uppercase block">INSCRIÇÃO ESTADUAL</span>
              <p className="font-bold text-[8.5px]">{dest.inscricao_estadual || 'ISENTO'}</p>
            </div>
            <div className="col-span-2 p-1">
              <span className="text-[7px] text-gray-700 uppercase block">DATA DA EMISSÃO</span>
              <p className="font-bold text-[8.5px]">{formatDate(nota.data_emissao)}</p>
            </div>
          </div>
        </div>

        {/* 5. FATURA / DUPLICATAS */}
        <div className="bg-gray-200 border-x border-t border-black px-1 py-0.5 font-bold text-[8px] uppercase">
          FATURA / DUPLICATAS
        </div>
        <div className="border border-black mb-1 p-1">
          {nota.duplicatas && nota.duplicatas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {nota.duplicatas.map((dup, i) => (
                <div key={i} className="border border-black p-1 text-[7.5px] min-w-[110px]">
                  <p><span className="text-gray-600">NÚM:</span> <span className="font-bold">{dup.numero}</span></p>
                  <p><span className="text-gray-600">VENC:</span> <span className="font-bold">{formatDate(dup.vencimento)}</span></p>
                  <p><span className="text-gray-600">VALOR:</span> <span className="font-black">{formatCurrency(dup.valor)}</span></p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[8px] text-gray-600">PAGAMENTO À VISTA OU SEM COBRANÇA DIRETA</p>
          )}
        </div>

        {/* 6. CÁLCULO DO IMPOSTO */}
        <div className="bg-gray-200 border-x border-t border-black px-1 py-0.5 font-bold text-[8px] uppercase">
          CÁLCULO DO IMPOSTO
        </div>
        <div className="border border-black mb-1">
          <div className="grid grid-cols-5 border-b border-black">
            <div className="p-1 border-r border-black">
              <span className="text-[6.5px] text-gray-700 uppercase block">BASE DE CÁLCULO DO ICMS</span>
              <p className="font-bold text-[8.5px] text-right">{formatCurrency(nota.base_calculo_icms)}</p>
            </div>
            <div className="p-1 border-r border-black">
              <span className="text-[6.5px] text-gray-700 uppercase block">VALOR DO ICMS</span>
              <p className="font-bold text-[8.5px] text-right">{formatCurrency(nota.valor_icms)}</p>
            </div>
            <div className="p-1 border-r border-black">
              <span className="text-[6.5px] text-gray-700 uppercase block">BASE DE CÁLC. ICMS S.T.</span>
              <p className="font-bold text-[8.5px] text-right">R$ 0,00</p>
            </div>
            <div className="p-1 border-r border-black">
              <span className="text-[6.5px] text-gray-700 uppercase block">VALOR DO ICMS S.T.</span>
              <p className="font-bold text-[8.5px] text-right">R$ 0,00</p>
            </div>
            <div className="p-1">
              <span className="text-[6.5px] text-gray-700 uppercase block">VALOR TOTAL DOS PRODUTOS</span>
              <p className="font-bold text-[8.5px] text-right">{formatCurrency(nota.valor_produtos)}</p>
            </div>
          </div>
          <div className="grid grid-cols-6">
            <div className="p-1 border-r border-black">
              <span className="text-[6.5px] text-gray-700 uppercase block">VALOR DO FRETE</span>
              <p className="font-bold text-[8.5px] text-right">{formatCurrency(nota.valor_frete || 0)}</p>
            </div>
            <div className="p-1 border-r border-black">
              <span className="text-[6.5px] text-gray-700 uppercase block">VALOR DO SEGURO</span>
              <p className="font-bold text-[8.5px] text-right">R$ 0,00</p>
            </div>
            <div className="p-1 border-r border-black">
              <span className="text-[6.5px] text-gray-700 uppercase block">DESCONTO</span>
              <p className="font-bold text-[8.5px] text-right">R$ 0,00</p>
            </div>
            <div className="p-1 border-r border-black">
              <span className="text-[6.5px] text-gray-700 uppercase block">OUTRAS DESPESAS</span>
              <p className="font-bold text-[8.5px] text-right">R$ 0,00</p>
            </div>
            <div className="p-1 border-r border-black">
              <span className="text-[6.5px] text-gray-700 uppercase block">VALOR DO IPI</span>
              <p className="font-bold text-[8.5px] text-right">{formatCurrency(nota.valor_ipi)}</p>
            </div>
            <div className="p-1 bg-gray-100">
              <span className="text-[6.5px] text-gray-900 uppercase font-black block">VALOR TOTAL DA NOTA</span>
              <p className="font-black text-[10px] text-right">{formatCurrency(nota.valor_total)}</p>
            </div>
          </div>
        </div>

        {/* 7. TRANSPORTADOR / VOLUMES TRANSPORTADOS */}
        <div className="bg-gray-200 border-x border-t border-black px-1 py-0.5 font-bold text-[8px] uppercase">
          TRANSPORTADOR / VOLUMES TRANSPORTADOS
        </div>
        <div className="border border-black mb-1">
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-5 p-1 border-r border-black">
              <span className="text-[7px] text-gray-700 uppercase block">RAZÃO SOCIAL</span>
              <p className="font-bold text-[8.5px]">{nota.transportadora_nome || 'O PROPRIO'}</p>
            </div>
            <div className="col-span-3 p-1 border-r border-black">
              <span className="text-[7px] text-gray-700 uppercase block">FRETE POR CONTA</span>
              <p className="font-bold text-[8.5px]">{nota.modalidade_frete || '0 - Emitente (CIF)'}</p>
            </div>
            <div className="col-span-2 p-1 border-r border-black">
              <span className="text-[7px] text-gray-700 uppercase block">PLACA DO VEÍCULO</span>
              <p className="font-bold text-[8.5px]">{nota.veiculo_placa || '-'}</p>
            </div>
            <div className="col-span-2 p-1">
              <span className="text-[7px] text-gray-700 uppercase block">CNPJ / CPF</span>
              <p className="font-bold text-[8.5px]">{nota.transportadora_cnpj || '-'}</p>
            </div>
          </div>
          <div className="grid grid-cols-12">
            <div className="col-span-2 p-1 border-r border-black">
              <span className="text-[7px] text-gray-700 uppercase block">QUANTIDADE</span>
              <p className="font-bold text-[8.5px]">{nota.volumes_quantidade || 1}</p>
            </div>
            <div className="col-span-3 p-1 border-r border-black">
              <span className="text-[7px] text-gray-700 uppercase block">ESPÉCIE</span>
              <p className="font-bold text-[8.5px]">{nota.volumes_especie || 'VOLUMES'}</p>
            </div>
            <div className="col-span-3 p-1 border-r border-black">
              <span className="text-[7px] text-gray-700 uppercase block">PESO BRUTO</span>
              <p className="font-bold text-[8.5px]">{Number(nota.peso_bruto || 0).toFixed(3)} kg</p>
            </div>
            <div className="col-span-4 p-1">
              <span className="text-[7px] text-gray-700 uppercase block">PESO LÍQUIDO</span>
              <p className="font-bold text-[8.5px]">{Number(nota.peso_liquido || 0).toFixed(3)} kg</p>
            </div>
          </div>
        </div>

        {/* 8. DADOS DOS PRODUTOS / SERVIÇOS */}
        <div className="bg-gray-200 border-x border-t border-black px-1 py-0.5 font-bold text-[8px] uppercase">
          DADOS DOS PRODUTOS / SERVIÇOS
        </div>
        <div className="border border-black mb-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-[6.5px] font-black uppercase border-b border-black">
                <th className="p-0.5 border-r border-black w-14">CÓDIGO</th>
                <th className="p-0.5 border-r border-black">DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
                <th className="p-0.5 border-r border-black w-14">NCM/SH</th>
                <th className="p-0.5 border-r border-black w-8">CST</th>
                <th className="p-0.5 border-r border-black w-8">CFOP</th>
                <th className="p-0.5 border-r border-black w-6 text-center">UN</th>
                <th className="p-0.5 border-r border-black w-10 text-right">QTD</th>
                <th className="p-0.5 border-r border-black w-14 text-right">VLR UNIT</th>
                <th className="p-0.5 border-r border-black w-14 text-right">VLR TOTAL</th>
                <th className="p-0.5 border-r border-black w-14 text-right">BC ICMS</th>
                <th className="p-0.5 border-r border-black w-12 text-right">VLR ICMS</th>
                <th className="p-0.5 border-r border-black w-10 text-right">VLR IPI</th>
                <th className="p-0.5 border-r border-black w-8 text-right">ALÍQ ICMS</th>
                <th className="p-0.5 w-8 text-right">ALÍQ IPI</th>
              </tr>
            </thead>
            <tbody>
              {nota.itens && nota.itens.length > 0 ? (
                nota.itens.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-300 text-[7.5px] leading-tight">
                    <td className="p-0.5 border-r border-black font-mono">{item.codigo}</td>
                    <td className="p-0.5 border-r border-black font-semibold">{item.descricao}</td>
                    <td className="p-0.5 border-r border-black font-mono">{item.ncm}</td>
                    <td className="p-0.5 border-r border-black text-center">{item.cst}</td>
                    <td className="p-0.5 border-r border-black text-center">{item.cfop}</td>
                    <td className="p-0.5 border-r border-black text-center">{item.unidade}</td>
                    <td className="p-0.5 border-r border-black text-right font-mono">{Number(item.quantidade).toFixed(2)}</td>
                    <td className="p-0.5 border-r border-black text-right">{formatCurrency(item.valor_unitario)}</td>
                    <td className="p-0.5 border-r border-black text-right font-bold">{formatCurrency(item.valor_total)}</td>
                    <td className="p-0.5 border-r border-black text-right">{formatCurrency(item.base_calculo_icms)}</td>
                    <td className="p-0.5 border-r border-black text-right">{formatCurrency(item.valor_icms)}</td>
                    <td className="p-0.5 border-r border-black text-right">{formatCurrency(item.valor_ipi)}</td>
                    <td className="p-0.5 border-r border-black text-right">{Number(item.aliq_icms).toFixed(0)}%</td>
                    <td className="p-0.5 text-right">{Number(item.aliq_ipi).toFixed(0)}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14} className="p-2 text-center text-gray-500">Nenhum item registrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 9. DADOS ADICIONAIS / INFORMAÇÕES COMPLEMENTARES */}
        <div className="bg-gray-200 border-x border-t border-black px-1 py-0.5 font-bold text-[8px] uppercase">
          DADOS ADICIONAIS
        </div>
        <div className="grid grid-cols-12 border border-black min-h-[50px]">
          <div className="col-span-8 p-1 border-r border-black">
            <span className="text-[7px] text-gray-700 uppercase block font-bold">INFORMAÇÕES COMPLEMENTARES</span>
            <p className="text-[7.5px] leading-relaxed text-gray-900 mt-0.5 whitespace-pre-line">
              {nota.informacoes_complementares || 'Documento emitido para fins de simulação cadastral e fiscal de acordo com as especificações da SEFAZ.'}
            </p>
          </div>
          <div className="col-span-4 p-1">
            <span className="text-[7px] text-gray-700 uppercase block font-bold">RESERVADO AO FISCO</span>
          </div>
        </div>
      </div>
    </div>
  );
};
