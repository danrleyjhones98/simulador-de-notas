import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve(process.cwd(), 'data', 'pgdata');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new PGlite(dataDir);

export async function query<T = any>(sql: string, params: any[] = []): Promise<{ rows: T[] }> {
  const res = await db.query(sql, params);
  return { rows: (res.rows || []) as T[] };
}

export async function initDb() {
  console.log('[PostgreSQL] Inicializando schema relacional...');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS parceiros (
      id SERIAL PRIMARY KEY,
      razao_social VARCHAR(255) NOT NULL,
      nome_fantasia VARCHAR(255) NOT NULL,
      cnpj VARCHAR(30) NOT NULL UNIQUE,
      tipo VARCHAR(20) NOT NULL, -- 'FORNECEDOR' ou 'CLIENTE'
      inscricao_estadual VARCHAR(50) DEFAULT 'ISENTO',
      logradouro VARCHAR(255) NOT NULL DEFAULT 'Av. Industrial, 1000',
      numero VARCHAR(50) DEFAULT '1000',
      bairro VARCHAR(100) DEFAULT 'Distrito Industrial',
      municipio VARCHAR(100) NOT NULL,
      uf VARCHAR(2) NOT NULL,
      cep VARCHAR(20) DEFAULT '01001-000',
      telefone VARCHAR(50),
      email VARCHAR(100),
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS produtos (
      id SERIAL PRIMARY KEY,
      codigo VARCHAR(50) NOT NULL UNIQUE,
      descricao VARCHAR(255) NOT NULL,
      categoria VARCHAR(100) NOT NULL,
      unidade VARCHAR(10) NOT NULL,
      preco_custo NUMERIC(12,2) NOT NULL,
      preco_venda NUMERIC(12,2) NOT NULL,
      estoque_atual INTEGER NOT NULL DEFAULT 0,
      ncm VARCHAR(20) NOT NULL,
      aliq_icms NUMERIC(5,2) DEFAULT 18.00,
      aliq_ipi NUMERIC(5,2) DEFAULT 5.00,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notas_fiscais (
      id SERIAL PRIMARY KEY,
      numero_nf VARCHAR(20) NOT NULL,
      serie VARCHAR(10) NOT NULL DEFAULT '1',
      tipo_operacao VARCHAR(20) NOT NULL, -- 'ENTRADA' ou 'SAIDA'
      natureza_operacao VARCHAR(255) NOT NULL,
      chave_acesso VARCHAR(50) NOT NULL UNIQUE,
      protocolo_autorizacao VARCHAR(60) NOT NULL,
      data_emissao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      data_saida_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      emitente_id INTEGER REFERENCES parceiros(id),
      destinatario_id INTEGER REFERENCES parceiros(id),
      emitente_nome VARCHAR(255),
      emitente_cnpj VARCHAR(30),
      destinatario_nome VARCHAR(255),
      destinatario_cnpj VARCHAR(30),
      valor_produtos NUMERIC(12,2) NOT NULL DEFAULT 0,
      base_calculo_icms NUMERIC(12,2) NOT NULL DEFAULT 0,
      valor_icms NUMERIC(12,2) NOT NULL DEFAULT 0,
      base_calculo_icms_st NUMERIC(12,2) NOT NULL DEFAULT 0,
      valor_icms_st NUMERIC(12,2) NOT NULL DEFAULT 0,
      valor_frete NUMERIC(12,2) NOT NULL DEFAULT 0,
      valor_seguro NUMERIC(12,2) NOT NULL DEFAULT 0,
      valor_desconto NUMERIC(12,2) NOT NULL DEFAULT 0,
      outras_despesas NUMERIC(12,2) NOT NULL DEFAULT 0,
      valor_ipi NUMERIC(12,2) NOT NULL DEFAULT 0,
      valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
      modalidade_frete VARCHAR(100) DEFAULT '0 - Remetente (CIF)',
      transportadora_nome VARCHAR(255) DEFAULT 'JADLOG LOGISTICA S/A',
      transportadora_cnpj VARCHAR(30) DEFAULT '04.884.082/0001-35',
      veiculo_placa VARCHAR(20) DEFAULT 'BRA2E19',
      veiculo_uf VARCHAR(2) DEFAULT 'SP',
      volumes_quantidade INTEGER DEFAULT 1,
      volumes_especie VARCHAR(50) DEFAULT 'VOLUMES',
      peso_bruto NUMERIC(10,3) DEFAULT 12.500,
      peso_liquido NUMERIC(10,3) DEFAULT 11.200,
      informacoes_complementares TEXT,
      status VARCHAR(30) NOT NULL DEFAULT 'AUTORIZADA',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS nota_itens (
      id SERIAL PRIMARY KEY,
      nota_id INTEGER REFERENCES notas_fiscais(id) ON DELETE CASCADE,
      produto_id INTEGER REFERENCES produtos(id),
      codigo VARCHAR(50) NOT NULL,
      descricao VARCHAR(255) NOT NULL,
      ncm VARCHAR(20) NOT NULL,
      cst VARCHAR(10) NOT NULL DEFAULT '000',
      cfop VARCHAR(10) NOT NULL,
      unidade VARCHAR(10) NOT NULL,
      quantidade NUMERIC(12,3) NOT NULL,
      valor_unitario NUMERIC(12,2) NOT NULL,
      valor_total NUMERIC(12,2) NOT NULL,
      base_calculo_icms NUMERIC(12,2) NOT NULL DEFAULT 0,
      valor_icms NUMERIC(12,2) NOT NULL DEFAULT 0,
      aliq_icms NUMERIC(5,2) NOT NULL DEFAULT 18.00,
      valor_ipi NUMERIC(12,2) NOT NULL DEFAULT 0,
      aliq_ipi NUMERIC(5,2) NOT NULL DEFAULT 0.00
    );

    CREATE TABLE IF NOT EXISTS duplicatas (
      id SERIAL PRIMARY KEY,
      nota_id INTEGER REFERENCES notas_fiscais(id) ON DELETE CASCADE,
      numero VARCHAR(50) NOT NULL,
      vencimento DATE NOT NULL,
      valor NUMERIC(12,2) NOT NULL,
      forma_pagamento VARCHAR(50) DEFAULT 'BOLETO BANCARIO'
    );

    CREATE INDEX IF NOT EXISTS idx_notas_chave ON notas_fiscais(chave_acesso);
    CREATE INDEX IF NOT EXISTS idx_itens_nota ON nota_itens(nota_id);
    CREATE INDEX IF NOT EXISTS idx_duplicatas_nota ON duplicatas(nota_id);
  `);

  console.log('[PostgreSQL] Schema criado com sucesso!');
}
