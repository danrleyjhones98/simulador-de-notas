export interface Produto {
  id: number;
  codigo: string;
  descricao: string;
  categoria: string;
  unidade: string;
  preco_custo: number | string;
  preco_venda: number | string;
  estoque_atual: number;
  ncm: string;
  aliq_icms?: number | string;
  aliq_ipi?: number | string;
}

export interface Parceiro {
  id: number;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  tipo: 'FORNECEDOR' | 'CLIENTE';
  inscricao_estadual?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  municipio: string;
  uf: string;
  cep?: string;
  telefone?: string;
  email?: string;
}

export interface NotaItem {
  id?: number;
  nota_id?: number;
  produto_id?: number | null;
  codigo: string;
  descricao: string;
  ncm: string;
  cst: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  base_calculo_icms: number;
  valor_icms: number;
  aliq_icms: number;
  valor_ipi: number;
  aliq_ipi: number;
}

export interface Duplicata {
  id?: number;
  nota_id?: number;
  numero: string;
  vencimento: string;
  valor: number;
  forma_pagamento?: string;
}

export interface NotaFiscal {
  id: number;
  numero_nf: string;
  serie: string;
  tipo_operacao: 'ENTRADA' | 'SAIDA';
  natureza_operacao: string;
  chave_acesso: string;
  protocolo_autorizacao: string;
  data_emissao: string;
  data_saida_entrada?: string;
  emitente_id?: number;
  destinatario_id?: number;
  emitente_nome?: string;
  emitente_cnpj?: string;
  destinatario_nome?: string;
  destinatario_cnpj?: string;
  emitente?: Parceiro;
  destinatario?: Parceiro;
  valor_produtos: number | string;
  base_calculo_icms: number | string;
  valor_icms: number | string;
  base_calculo_icms_st?: number | string;
  valor_icms_st?: number | string;
  valor_frete?: number | string;
  valor_seguro?: number | string;
  valor_desconto?: number | string;
  outras_despesas?: number | string;
  valor_ipi: number | string;
  valor_total: number | string;
  modalidade_frete?: string;
  transportadora_nome?: string;
  transportadora_cnpj?: string;
  veiculo_placa?: string;
  veiculo_uf?: string;
  volumes_quantidade?: number;
  volumes_especie?: string;
  peso_bruto?: number | string;
  peso_liquido?: number | string;
  informacoes_complementares?: string;
  status: 'AUTORIZADA' | 'CANCELADA' | 'DIVERGENTE';
  itens?: NotaItem[];
  duplicatas?: Duplicata[];
  emitente_fantasia?: string;
  destinatario_fantasia?: string;
  total_itens?: number;
}
