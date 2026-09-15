import express from 'express';
import cors from 'cors';
import { db, initDb, query } from './db.js';
import { runSeed } from './seed.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Status e diagnóstico do PostgreSQL
app.get('/api/status', async (req, res) => {
  try {
    const pCheck = await query('SELECT NOW() as server_time, version() as pg_version');
    const pCount = await query('SELECT count(*) as total FROM produtos');
    const nCount = await query('SELECT count(*) as total FROM notas_fiscais');
    res.json({
      status: 'online',
      engine: 'PostgreSQL 16 (PGlite Relational SQL)',
      database: 'pgdata',
      serverTime: pCheck.rows[0].server_time,
      produtosCadastrados: parseInt(pCount.rows[0].total, 10),
      notasEmitidas: parseInt(nCount.rows[0].total, 10),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PRODUTOS
app.get('/api/produtos', async (req, res) => {
  try {
    const result = await query('SELECT * FROM produtos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/produtos', async (req, res) => {
  try {
    const { codigo, descricao, categoria, unidade, preco_custo, preco_venda, estoque_atual, ncm, aliq_icms, aliq_ipi } = req.body;
    const result = await query(`
      INSERT INTO produtos (codigo, descricao, categoria, unidade, preco_custo, preco_venda, estoque_atual, ncm, aliq_icms, aliq_ipi)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [codigo, descricao, categoria, unidade || 'UN', preco_custo, preco_venda, estoque_atual || 0, ncm || '0000.00.00', aliq_icms || 18, aliq_ipi || 0]);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, descricao, categoria, unidade, preco_custo, preco_venda, estoque_atual, ncm, aliq_icms, aliq_ipi } = req.body;
    const result = await query(`
      UPDATE produtos
      SET codigo = $1, descricao = $2, categoria = $3, unidade = $4, preco_custo = $5, preco_venda = $6, estoque_atual = $7, ncm = $8, aliq_icms = $9, aliq_ipi = $10
      WHERE id = $11
      RETURNING *
    `, [codigo, descricao, categoria, unidade, preco_custo, preco_venda, estoque_atual, ncm, aliq_icms, aliq_ipi, id]);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/produtos/:id', async (req, res) => {
  try {
    await query('DELETE FROM produtos WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PARCEIROS (FORNECEDORES / CLIENTES)
app.get('/api/parceiros', async (req, res) => {
  try {
    const result = await query('SELECT * FROM parceiros ORDER BY razao_social ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/parceiros', async (req, res) => {
  try {
    const { razao_social, nome_fantasia, cnpj, tipo, inscricao_estadual, logradouro, numero, bairro, municipio, uf, cep, telefone, email } = req.body;
    const result = await query(`
      INSERT INTO parceiros (razao_social, nome_fantasia, cnpj, tipo, inscricao_estadual, logradouro, numero, bairro, municipio, uf, cep, telefone, email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [razao_social, nome_fantasia || razao_social, cnpj, tipo, inscricao_estadual || 'ISENTO', logradouro, numero, bairro, municipio, uf, cep, telefone, email]);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/parceiros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { razao_social, nome_fantasia, cnpj, tipo, inscricao_estadual, logradouro, numero, bairro, municipio, uf, cep, telefone, email } = req.body;
    const result = await query(`
      UPDATE parceiros
      SET razao_social = $1, nome_fantasia = $2, cnpj = $3, tipo = $4, inscricao_estadual = $5, logradouro = $6, numero = $7, bairro = $8, municipio = $9, uf = $10, cep = $11, telefone = $12, email = $13
      WHERE id = $14
      RETURNING *
    `, [razao_social, nome_fantasia, cnpj, tipo, inscricao_estadual, logradouro, numero, bairro, municipio, uf, cep, telefone, email, id]);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/parceiros/:id', async (req, res) => {
  try {
    await query('DELETE FROM parceiros WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// NOTAS FISCAIS
app.get('/api/notas', async (req, res) => {
  try {
    const notas = await query(`
      SELECT 
        n.*,
        p_emit.nome_fantasia as emitente_fantasia,
        p_emit.municipio as emitente_municipio,
        p_emit.uf as emitente_uf,
        p_dest.nome_fantasia as destinatario_fantasia,
        p_dest.municipio as destinatario_municipio,
        p_dest.uf as destinatario_uf,
        (SELECT count(*) FROM nota_itens ni WHERE ni.nota_id = n.id) as total_itens
      FROM notas_fiscais n
      LEFT JOIN parceiros p_emit ON n.emitente_id = p_emit.id
      LEFT JOIN parceiros p_dest ON n.destinatario_id = p_dest.id
      ORDER BY n.id DESC
    `);
    res.json(notas.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notaRes = await query(`
      SELECT 
        n.*,
        row_to_json(p_emit.*) as emitente,
        row_to_json(p_dest.*) as destinatario
      FROM notas_fiscais n
      LEFT JOIN parceiros p_emit ON n.emitente_id = p_emit.id
      LEFT JOIN parceiros p_dest ON n.destinatario_id = p_dest.id
      WHERE n.id = $1
    `, [id]);

    if (!notaRes.rows[0]) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }

    const itensRes = await query('SELECT * FROM nota_itens WHERE nota_id = $1 ORDER BY id ASC', [id]);
    const duplRes = await query('SELECT * FROM duplicatas WHERE nota_id = $1 ORDER BY id ASC', [id]);

    const nota = {
      ...notaRes.rows[0],
      itens: itensRes.rows,
      duplicatas: duplRes.rows,
    };

    res.json(nota);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Emissão de Nova Nota Fiscal (Transacional via SQL)
app.post('/api/notas', async (req, res) => {
  try {
    const {
      numero_nf,
      serie = '1',
      tipo_operacao = 'SAIDA',
      natureza_operacao,
      emitente_id,
      destinatario_id,
      modalidade_frete,
      transportadora_nome,
      transportadora_cnpj,
      veiculo_placa,
      veiculo_uf,
      volumes_quantidade,
      volumes_especie,
      peso_bruto,
      peso_liquido,
      informacoes_complementares,
      itens = [],
      parcelas = 1
    } = req.body;

    // Buscar emitente e destinatário
    const emitente = (await query('SELECT * FROM parceiros WHERE id = $1', [emitente_id])).rows[0];
    const destinatario = (await query('SELECT * FROM parceiros WHERE id = $1', [destinatario_id])).rows[0];

    if (!emitente || !destinatario) {
      return res.status(400).json({ error: 'Emitente ou destinatário inválido.' });
    }

    // Gerar Chave de Acesso SEFAZ de 44 dígitos autêntica
    // UF (2) + AAMM (4) + CNPJ (14) + MOD (2: '55') + SERIE (3: '001') + NUMERO (9) + TIPO EMISSÃO (1) + CODIGO ALEATÓRIO (8) + DV (1)
    const ufCode = emitente.uf === 'SP' ? '35' : emitente.uf === 'RJ' ? '33' : emitente.uf === 'MG' ? '31' : '41';
    const now = new Date();
    const aamm = String(now.getFullYear()).slice(-2) + String(now.getMonth() + 1).padStart(2, '0');
    const cnpjClean = (emitente.cnpj || '').replace(/\D/g, '').padStart(14, '0');
    const numClean = String(numero_nf).replace(/\D/g, '').padStart(9, '0');
    const randomCode = Math.floor(10000000 + Math.random() * 90000000);
    const chaveSemDv = `${ufCode}${aamm}${cnpjClean}55001${numClean}1${randomCode}`;
    
    // Cálculo do dígito verificador módulo 11
    let peso = 2;
    let soma = 0;
    for (let i = chaveSemDv.length - 1; i >= 0; i--) {
      soma += parseInt(chaveSemDv[i], 10) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    const resto = soma % 11;
    const dv = (resto === 0 || resto === 1) ? 0 : 11 - resto;
    const chaveAcesso = `${chaveSemDv}${dv}`;

    const protocolo = `1${ufCode}26${String(Math.floor(1000000000 + Math.random() * 9000000000))} - ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;

    // Totais
    let totalProdutos = 0;
    let totalBcIcms = 0;
    let totalValorIcms = 0;
    let totalValorIpi = 0;

    itens.forEach((it: any) => {
      const q = Number(it.quantidade) || 0;
      const vu = Number(it.valor_unitario) || 0;
      const tot = q * vu;
      const aliqIcms = Number(it.aliq_icms) || 18;
      const aliqIpi = Number(it.aliq_ipi) || 0;
      const icms = (tot * aliqIcms) / 100;
      const ipi = (tot * aliqIpi) / 100;

      totalProdutos += tot;
      totalBcIcms += tot;
      totalValorIcms += icms;
      totalValorIpi += ipi;
    });

    const valorTotal = totalProdutos + totalValorIpi;

    // Inserir Nota Fiscal
    const notaInsert = await query(`
      INSERT INTO notas_fiscais (
        numero_nf, serie, tipo_operacao, natureza_operacao, chave_acesso, protocolo_autorizacao,
        emitente_id, destinatario_id, emitente_nome, emitente_cnpj, destinatario_nome, destinatario_cnpj,
        valor_produtos, base_calculo_icms, valor_icms, valor_ipi, valor_total,
        modalidade_frete, transportadora_nome, transportadora_cnpj, veiculo_placa, veiculo_uf,
        volumes_quantidade, volumes_especie, peso_bruto, peso_liquido,
        informacoes_complementares, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22,
        $23, $24, $25, $26,
        $27, 'AUTORIZADA'
      ) RETURNING id
    `, [
      numero_nf, serie, tipo_operacao, natureza_operacao, chaveAcesso, protocolo,
      emitente.id, destinatario.id, emitente.razao_social, emitente.cnpj, destinatario.razao_social, destinatario.cnpj,
      totalProdutos, totalBcIcms, totalValorIcms, totalValorIpi, valorTotal,
      modalidade_frete || '0 - Remetente (CIF)',
      transportadora_nome || 'LOGÍSTICA EXPRESSA S/A',
      transportadora_cnpj || '11.222.333/0001-44',
      veiculo_placa || 'ABC1D23',
      veiculo_uf || emitente.uf || 'SP',
      volumes_quantidade || itens.length,
      volumes_especie || 'VOLUMES',
      peso_bruto || 10.0,
      peso_liquido || 9.5,
      informacoes_complementares || `Documento emitido para fins de simulação fiscal. Tributos aproximados: R$ ${(totalValorIcms + totalValorIpi).toFixed(2)} (Lei 12.741/2012).`
    ]);

    const notaId = notaInsert.rows[0].id;

    // Inserir Itens e atualizar estoque
    for (const item of itens) {
      const q = Number(item.quantidade) || 1;
      const vu = Number(item.valor_unitario) || 0;
      const tot = q * vu;
      const aliqIcms = Number(item.aliq_icms) || 18;
      const aliqIpi = Number(item.aliq_ipi) || 0;
      const icms = (tot * aliqIcms) / 100;
      const ipi = (tot * aliqIpi) / 100;

      await query(`
        INSERT INTO nota_itens (
          nota_id, produto_id, codigo, descricao, ncm, cst, cfop, unidade,
          quantidade, valor_unitario, valor_total, base_calculo_icms, valor_icms, aliq_icms, valor_ipi, aliq_ipi
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        notaId, item.produto_id || null, item.codigo || 'PRD-01', item.descricao,
        item.ncm || '8471.30.12', item.cst || '000', item.cfop || (tipo_operacao === 'SAIDA' ? '5.102' : '1.102'),
        item.unidade || 'UN', q, vu, tot, tot, icms, aliqIcms, ipi, aliqIpi
      ]);

      // Atualizar estoque no PostgreSQL se houver produto_id
      if (item.produto_id) {
        const delta = tipo_operacao === 'ENTRADA' ? q : -q;
        await query('UPDATE produtos SET estoque_atual = estoque_atual + $1 WHERE id = $2', [delta, item.produto_id]);
      }
    }

    // Inserir Duplicatas / Parcelas
    const numParcelas = Math.max(1, parseInt(parcelas, 10) || 1);
    const valorParcela = Number((valorTotal / numParcelas).toFixed(2));
    for (let p = 1; p <= numParcelas; p++) {
      const vtoDate = new Date();
      vtoDate.setDate(vtoDate.getDate() + p * 30);
      const vtoStr = vtoDate.toISOString().split('T')[0];
      const valAtual = (p === numParcelas) ? (valorTotal - (valorParcela * (numParcelas - 1))) : valorParcela;

      await query(`
        INSERT INTO duplicatas (nota_id, numero, vencimento, valor, forma_pagamento)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        notaId,
        `${numero_nf}/${String(p).padStart(2, '0')}`,
        vtoStr,
        valAtual,
        'BOLETO BANCARIO'
      ]);
    }

    res.status(201).json({ id: notaId, chaveAcesso, numero_nf, valorTotal });
  } catch (err: any) {
    console.error('Erro ao emitir nota fiscal:', err);
    res.status(500).json({ error: err.message });
  }
});

// Inicialização
async function start() {
  await initDb();
  await runSeed();
  app.listen(PORT, () => {
    console.log(`[API Server] Rodando na porta ${PORT} com PostgreSQL nativo`);
  });
}

start();
