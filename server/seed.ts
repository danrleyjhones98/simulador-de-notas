import { db, initDb, query } from './db.js';

export async function runSeed() {
  await initDb();

  const countParceiros = await query('SELECT count(*) as count FROM parceiros');
  if (parseInt(countParceiros.rows[0].count, 10) > 0) {
    console.log('[PostgreSQL] Banco já contém dados, ignorando seed.');
    return;
  }

  console.log('[PostgreSQL] Executando carga inicial (seed) de parceiros e produtos...');

  // Parceiros
  await query(`
    INSERT INTO parceiros (razao_social, nome_fantasia, cnpj, tipo, inscricao_estadual, logradouro, numero, bairro, municipio, uf, cep, telefone, email) VALUES
    ('Dell Computadores do Brasil Ltda', 'Dell Technologies', '72.381.189/0001-10', 'FORNECEDOR', '356.128.490.115', 'Av. da Emancipação', '5000', 'Parque dos Servidores', 'Hortolândia', 'SP', '13184-654', '(19) 3887-2000', 'vendas.corporativo@dell.com'),
    ('Furukawa Electric LatAm S.A.', 'Furukawa Cabos & Redes', '51.797.741/0001-92', 'FORNECEDOR', '101.458.789.200', 'R. Hasdrubal Bellegard', '820', 'Cidade Industrial', 'Curitiba', 'PR', '81460-120', '(41) 3341-4000', 'comercial@furukawalatam.com'),
    ('Schneider Electric Brasil Ltda', 'Schneider Electric', '43.342.275/0001-05', 'FORNECEDOR', '114.890.320.119', 'Av. das Nações Unidas', '18605', 'Santo Amaro', 'São Paulo', 'SP', '04795-902', '(11) 2165-5000', 'atendimento.fiscal@se.com'),
    ('LG Electronics do Brasil Ltda', 'LG Business Solutions', '01.166.372/0001-55', 'FORNECEDOR', '688.234.120.110', 'Av. Dom Pedro I', 'W-7777', 'Piracangaguá', 'Taubaté', 'SP', '12091-000', '(12) 2125-9000', 'corporativo@lge.com.br'),
    ('Distribuidora Nacional de Suprimentos S.A.', 'MegaSuprimentos Papéis & Toner', '19.458.231/0001-78', 'FORNECEDOR', '062.339.810.001', 'R. dos Inconfidentes', '1188', 'Savassi', 'Belo Horizonte', 'MG', '30140-120', '(31) 3240-8800', 'pedidos@megasuprimentos.com.br'),
    ('OmniSensors Automação Industrial Ltda', 'OmniSensors Automação', '34.120.984/0001-63', 'FORNECEDOR', '256.402.110.334', 'R. Dona Francisca', '8300', 'Zona Industrial Norte', 'Joinville', 'SC', '89219-600', '(47) 3451-9900', 'vendas@omnisensors.com.br'),
    ('TechCorp Soluções Tecnológicas S.A.', 'TechCorp Soluções', '28.904.551/0001-14', 'CLIENTE', '86.412.390', 'Av. Rio Branco', '156', 'Centro', 'Rio de Janeiro', 'RJ', '20040-006', '(21) 3090-4400', 'compras@techcorp.com.br'),
    ('Hospital e Maternidade Santa Clara Ltda', 'Hospital Santa Clara', '14.882.109/0001-30', 'CLIENTE', 'ISENTO', 'Av. Barão de Itapura', '1200', 'Botafogo', 'Campinas', 'SP', '13020-432', '(19) 3780-1500', 'suprimentos@hospitalsantaclara.com.br')
  `);

  // Produtos
  await query(`
    INSERT INTO produtos (codigo, descricao, categoria, unidade, preco_custo, preco_venda, estoque_atual, ncm, aliq_icms, aliq_ipi) VALUES
    ('PRD-NOTE-01', 'Notebook Corporativo Dell Latitude Core i7 16GB 512GB SSD', 'Informática & TI', 'UN', 3800.00, 4950.00, 15, '8471.30.12', 12.00, 0.00),
    ('PRD-MON-02', 'Monitor Profissional LG 24" IPS Full HD 75Hz', 'Informática & TI', 'UN', 620.00, 890.00, 28, '8528.52.00', 18.00, 5.00),
    ('PRD-TEC-03', 'Teclado Mecânico Ergonômico ABNT2 Switch Blue', 'Periféricos', 'UN', 160.00, 285.00, 45, '8471.60.52', 18.00, 10.00),
    ('PRD-NOB-04', 'Nobreak Senoidal APC Smart-UPS 1500VA Bivolt', 'Energia', 'UN', 1250.00, 1890.00, 13, '8504.40.40', 18.00, 5.00),
    ('PRD-CAB-05', 'Cabo de Rede UTP Cat6 Furukawa (Caixa 305m)', 'Redes & Cabos', 'CX', 410.00, 630.00, 20, '8544.49.00', 12.00, 0.00),
    ('PRD-RJ4-06', 'Conector RJ45 Blindado Cat6 Pacote c/ 50 unidades', 'Redes & Cabos', 'PC', 65.00, 110.00, 60, '8536.69.90', 18.00, 5.00),
    ('PRD-SNS-07', 'Sensor Óptico Industrial Reflexivo 24VCC NPN', 'Automação', 'UN', 95.00, 175.00, 35, '8536.50.90', 18.00, 8.00),
    ('PRD-DIS-08', 'Disjuntor Din Bipolar Curva C 32A 4.5kA Schneider', 'Elétrica', 'PC', 34.00, 58.00, 80, '8536.20.00', 18.00, 5.00),
    ('PRD-PAP-09', 'Papel Sulfite A4 Report/Chamex 75g (Caixa com 10 resmas)', 'Suprimentos', 'CX', 180.00, 260.00, 25, '4802.56.10', 0.00, 0.00),
    ('PRD-TON-10', 'Cartucho de Toner HP LaserJet CF283A 83A Preto', 'Suprimentos', 'UN', 75.00, 140.00, 18, '8443.99.23', 18.00, 0.00),
    ('PRD-FIT-11', 'Fita Isolante de Alta Performance 3M Scotch 19mm x 20m', 'Elétrica', 'RL', 9.50, 18.00, 150, '3919.10.00', 18.00, 5.00),
    ('PRD-FON-12', 'Fonte Chaveada Industrial 24VDC 10A 240W Trilho DIN', 'Automação', 'UN', 185.00, 295.00, 22, '8504.40.21', 18.00, 5.00)
  `);

  // Inserir 1 NF-e padrão com cálculo tributário autêntico
  const pDell = await query("SELECT * FROM parceiros WHERE cnpj = '72.381.189/0001-10'");
  const pTech = await query("SELECT * FROM parceiros WHERE cnpj = '28.904.551/0001-14'");
  const prodNotebook = await query("SELECT * FROM produtos WHERE codigo = 'PRD-NOTE-01'");
  const prodMonitor = await query("SELECT * FROM produtos WHERE codigo = 'PRD-MON-02'");

  if (pDell.rows[0] && pTech.rows[0]) {
    const chaveAcesso = '35260972381189000110550010000894581234567890';
    const protocolo = '135260089458123 - 15/09/2026 14:32:10';

    const nfResult = await query(`
      INSERT INTO notas_fiscais (
        numero_nf, serie, tipo_operacao, natureza_operacao, chave_acesso, protocolo_autorizacao,
        emitente_id, destinatario_id, emitente_nome, emitente_cnpj, destinatario_nome, destinatario_cnpj,
        valor_produtos, base_calculo_icms, valor_icms, valor_ipi, valor_total,
        informacoes_complementares, status
      ) VALUES (
        '000.089.458', '1', 'ENTRADA', 'COMPRA PARA COMERCIALIZACAO E REVENDA', $1, $2,
        $3, $4, $5, $6, $7, $8,
        11090.00, 11090.00, 1420.80, 89.00, 11179.00,
        'DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. TRIBUTOS TOTAIS INCIDENTES (LEI 12.741/2012): R$ 1.509,80 (13.50%). BANCO BRADESCO AG: 0458 C/C: 18945-2.', 'AUTORIZADA'
      ) RETURNING id
    `, [
      chaveAcesso, protocolo,
      pDell.rows[0].id, pTech.rows[0].id,
      pDell.rows[0].razao_social, pDell.rows[0].cnpj,
      pTech.rows[0].razao_social, pTech.rows[0].cnpj
    ]);

    const notaId = nfResult.rows[0].id;

    // Itens
    await query(`
      INSERT INTO nota_itens (nota_id, produto_id, codigo, descricao, ncm, cst, cfop, unidade, quantidade, valor_unitario, valor_total, base_calculo_icms, valor_icms, aliq_icms, valor_ipi, aliq_ipi) VALUES
      ($1, $2, 'PRD-NOTE-01', 'Notebook Corporativo Dell Latitude Core i7 16GB 512GB SSD', '8471.30.12', '000', '1.102', 'UN', 2.000, 4950.00, 9900.00, 9900.00, 1188.00, 12.00, 0.00, 0.00),
      ($1, $3, 'PRD-MON-02', 'Monitor Profissional LG 24" IPS Full HD 75Hz', '8528.52.00', '000', '1.102', 'UN', 2.000, 595.00, 1190.00, 1190.00, 232.80, 18.00, 89.00, 5.00)
    `, [notaId, prodNotebook.rows[0].id, prodMonitor.rows[0].id]);

    // Duplicatas
    await query(`
      INSERT INTO duplicatas (nota_id, numero, vencimento, valor, forma_pagamento) VALUES
      ($1, '089458/01', '2026-10-15', 5589.50, 'BOLETO BANCARIO'),
      ($1, '089458/02', '2026-11-15', 5589.50, 'BOLETO BANCARIO')
    `, [notaId]);
  }

  console.log('[PostgreSQL] Seed concluído com sucesso!');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed().then(() => {
    console.log('[PostgreSQL] Concluído.');
    process.exit(0);
  }).catch((err) => {
    console.error('[PostgreSQL] Erro no seed:', err);
    process.exit(1);
  });
}
