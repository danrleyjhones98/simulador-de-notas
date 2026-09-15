import fs from "fs";
import path from "path";

export interface ProdutoDB {
  id: string;
  codigo: string;
  descricao: string;
  categoria: string;
  unidade: string;
  precoCusto: number;
  precoVenda: number;
  estoqueAtual: number;
  ncm: string;
}

export interface NotaItemDB {
  id: string;
  produtoId?: string;
  codigo: string;
  produto: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

export interface ParcelaDB {
  id: string;
  numero: number;
  vencimento: string;
  valor: number;
  formaPagamento: string;
}

export interface NotaFiscalDB {
  id: string;
  tipoOperacao: "ENTRADA" | "SAIDA";
  naturezaOperacao: string;
  numeroNf: string;
  serieNf: string;
  dataEmissao: string;
  parceiro: string;
  documentoParceiro: string;
  possuiProdutos: boolean;
  valorTotalNota: number;
  totalParcelas: number;
  statusConciliacao: "CONCILIADO" | "DIVERGENTE";
  itens: NotaItemDB[];
  parcelas: ParcelaDB[];
  criadoEm: string;
}

export interface ParceiroDB {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  tipo: "FORNECEDOR" | "CLIENTE" | "AMBOS";
  inscricaoEstadual: string;
  cidade: string;
  uf: string;
  telefone: string;
  email: string;
}

export interface DatabaseSchema {
  produtos: ProdutoDB[];
  notas: NotaFiscalDB[];
  parceiros: ParceiroDB[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "banco-de-dados.json");

export const PRODUTOS_PADRAO: ProdutoDB[] = [
  {
    id: "prod-1",
    codigo: "PRD-NOTE-01",
    descricao: "Notebook Corporativo Dell Latitude Core i7 16GB 512GB SSD",
    categoria: "Informática & TI",
    unidade: "UN",
    precoCusto: 3800.0,
    precoVenda: 4950.0,
    estoqueAtual: 15,
    ncm: "8471.30.12",
  },
  {
    id: "prod-2",
    codigo: "PRD-MON-02",
    descricao: "Monitor Profissional LG 24\" IPS Full HD 75Hz",
    categoria: "Informática & TI",
    unidade: "UN",
    precoCusto: 620.0,
    precoVenda: 890.0,
    estoqueAtual: 28,
    ncm: "8528.52.00",
  },
  {
    id: "prod-3",
    codigo: "PRD-TEC-03",
    descricao: "Teclado Mecânico Ergonômico ABNT2 Switch Blue",
    categoria: "Periféricos",
    unidade: "UN",
    precoCusto: 160.0,
    precoVenda: 285.0,
    estoqueAtual: 45,
    ncm: "8471.60.52",
  },
  {
    id: "prod-4",
    codigo: "PRD-NOB-04",
    descricao: "Nobreak Senoidal APC Smart-UPS 1500VA Bivolt",
    categoria: "Energia",
    unidade: "UN",
    precoCusto: 1250.0,
    precoVenda: 1890.0,
    estoqueAtual: 12,
    ncm: "8504.40.40",
  },
  {
    id: "prod-5",
    codigo: "PRD-CAB-05",
    descricao: "Cabo de Rede UTP Cat6 Furukawa (Caixa 305m)",
    categoria: "Redes & Cabos",
    unidade: "CX",
    precoCusto: 410.0,
    precoVenda: 630.0,
    estoqueAtual: 20,
    ncm: "8544.49.00",
  },
  {
    id: "prod-6",
    codigo: "PRD-RJ4-06",
    descricao: "Conector RJ45 Blindado Cat6 Pacote c/ 50 unidades",
    categoria: "Redes & Cabos",
    unidade: "PC",
    precoCusto: 65.0,
    precoVenda: 110.0,
    estoqueAtual: 60,
    ncm: "8536.69.90",
  },
  {
    id: "prod-7",
    codigo: "PRD-SNS-07",
    descricao: "Sensor Óptico Industrial Reflexivo 24VCC NPN",
    categoria: "Automação",
    unidade: "UN",
    precoCusto: 95.0,
    precoVenda: 175.0,
    estoqueAtual: 35,
    ncm: "8536.50.90",
  },
  {
    id: "prod-8",
    codigo: "PRD-DIS-08",
    descricao: "Disjuntor Din Bipolar Curva C 32A 4.5kA Schneider",
    categoria: "Elétrica",
    unidade: "PC",
    precoCusto: 34.0,
    precoVenda: 58.0,
    estoqueAtual: 80,
    ncm: "8536.20.00",
  },
  {
    id: "prod-9",
    codigo: "PRD-PAP-09",
    descricao: "Papel Sulfite A4 Report/Chamex 75g (Caixa com 10 resmas)",
    categoria: "Suprimentos",
    unidade: "CX",
    precoCusto: 180.0,
    precoVenda: 260.0,
    estoqueAtual: 25,
    ncm: "4802.56.10",
  },
  {
    id: "prod-10",
    codigo: "PRD-TON-10",
    descricao: "Cartucho de Toner HP LaserJet CF283A 83A Preto",
    categoria: "Suprimentos",
    unidade: "UN",
    precoCusto: 75.0,
    precoVenda: 140.0,
    estoqueAtual: 18,
    ncm: "8443.99.23",
  },
  {
    id: "prod-11",
    codigo: "PRD-FIT-11",
    descricao: "Fita Isolante de Alta Performance 3M Scotch 19mm x 20m",
    categoria: "Elétrica",
    unidade: "RL",
    precoCusto: 9.5,
    precoVenda: 18.0,
    estoqueAtual: 150,
    ncm: "3919.10.00",
  },
  {
    id: "prod-12",
    codigo: "PRD-FON-12",
    descricao: "Fonte Chaveada Industrial 24VDC 10A 240W Trilho DIN",
    categoria: "Automação",
    unidade: "UN",
    precoCusto: 185.0,
    precoVenda: 295.0,
    estoqueAtual: 22,
    ncm: "8504.40.21",
  },
];

export const PARCEIROS_PADRAO: ParceiroDB[] = [
  {
    id: "parc-1",
    razaoSocial: "Dell Computadores do Brasil Ltda",
    nomeFantasia: "Dell Technologies",
    cnpj: "72.381.189/0001-10",
    tipo: "FORNECEDOR",
    inscricaoEstadual: "356.128.490.115",
    cidade: "Hortolândia",
    uf: "SP",
    telefone: "(19) 3887-2000",
    email: "vendas.corporativo@dell.com",
  },
  {
    id: "parc-2",
    razaoSocial: "Furukawa Electric LatAm S.A.",
    nomeFantasia: "Furukawa Cabos & Redes",
    cnpj: "51.797.741/0001-92",
    tipo: "FORNECEDOR",
    inscricaoEstadual: "101.458.789.200",
    cidade: "Curitiba",
    uf: "PR",
    telefone: "(41) 3341-4000",
    email: "comercial@furukawalatam.com",
  },
  {
    id: "parc-3",
    razaoSocial: "Schneider Electric Brasil Ltda",
    nomeFantasia: "Schneider Electric",
    cnpj: "43.342.275/0001-05",
    tipo: "FORNECEDOR",
    inscricaoEstadual: "114.890.320.119",
    cidade: "São Paulo",
    uf: "SP",
    telefone: "(11) 2165-5000",
    email: "atendimento.fiscal@se.com",
  },
  {
    id: "parc-4",
    razaoSocial: "LG Electronics do Brasil Ltda",
    nomeFantasia: "LG Business Solutions",
    cnpj: "01.166.372/0001-55",
    tipo: "FORNECEDOR",
    inscricaoEstadual: "688.234.120.110",
    cidade: "Taubaté",
    uf: "SP",
    telefone: "(12) 2125-9000",
    email: "corporativo@lge.com.br",
  },
  {
    id: "parc-5",
    razaoSocial: "Distribuidora Nacional de Suprimentos S.A.",
    nomeFantasia: "MegaSuprimentos Papéis & Toner",
    cnpj: "19.458.231/0001-78",
    tipo: "FORNECEDOR",
    inscricaoEstadual: "062.339.810.001",
    cidade: "Belo Horizonte",
    uf: "MG",
    telefone: "(31) 3240-8800",
    email: "pedidos@megasuprimentos.com.br",
  },
  {
    id: "parc-6",
    razaoSocial: "OmniSensors Automação Industrial Ltda",
    nomeFantasia: "OmniSensors Automação",
    cnpj: "34.120.984/0001-63",
    tipo: "FORNECEDOR",
    inscricaoEstadual: "256.402.110.334",
    cidade: "Joinville",
    uf: "SC",
    telefone: "(47) 3451-9900",
    email: "vendas@omnisensors.com.br",
  },
  {
    id: "parc-7",
    razaoSocial: "TechCorp Soluções Tecnológicas S.A.",
    nomeFantasia: "TechCorp Soluções",
    cnpj: "28.904.551/0001-14",
    tipo: "CLIENTE",
    inscricaoEstadual: "86.412.390",
    cidade: "Rio de Janeiro",
    uf: "RJ",
    telefone: "(21) 3090-4400",
    email: "compras@techcorp.com.br",
  },
  {
    id: "parc-8",
    razaoSocial: "Hospital e Maternidade Santa Clara Ltda",
    nomeFantasia: "Hospital Santa Clara",
    cnpj: "14.882.109/0001-30",
    tipo: "CLIENTE",
    inscricaoEstadual: "ISENTO",
    cidade: "Campinas",
    uf: "SP",
    telefone: "(19) 3780-1500",
    email: "suprimentos@hospitalsantaclara.com.br",
  },
];

function ensureDbExists(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      produtos: PRODUTOS_PADRAO,
      notas: [],
      parceiros: PARCEIROS_PADRAO,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data: DatabaseSchema = JSON.parse(raw);
    let changed = false;

    if (!Array.isArray(data.produtos) || data.produtos.length === 0) {
      data.produtos = PRODUTOS_PADRAO;
      changed = true;
    }
    if (!Array.isArray(data.notas)) {
      data.notas = [];
      changed = true;
    }
    if (!Array.isArray(data.parceiros) || data.parceiros.length === 0) {
      data.parceiros = PARCEIROS_PADRAO;
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    }
    return data;
  } catch {
    const fallback: DatabaseSchema = {
      produtos: PRODUTOS_PADRAO,
      notas: [],
      parceiros: PARCEIROS_PADRAO,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

function writeDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Métodos de Produtos
export function getProdutos(): ProdutoDB[] {
  const db = ensureDbExists();
  return db.produtos;
}

export function resetProdutos(): ProdutoDB[] {
  const db = ensureDbExists();
  db.produtos = [...PRODUTOS_PADRAO];
  writeDb(db);
  return db.produtos;
}

export function addProduto(novo: Omit<ProdutoDB, "id">): ProdutoDB {
  const db = ensureDbExists();
  const produto: ProdutoDB = {
    ...novo,
    id: "prod-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
  };
  db.produtos.push(produto);
  writeDb(db);
  return produto;
}

export function updateProdutoEstoque(codigoOuId: string, deltaQuantidade: number): boolean {
  const db = ensureDbExists();
  const prod = db.produtos.find((p) => p.id === codigoOuId || p.codigo === codigoOuId);
  if (prod) {
    prod.estoqueAtual = Math.max(0, prod.estoqueAtual + deltaQuantidade);
    writeDb(db);
    return true;
  }
  return false;
}

// Métodos de Parceiros (Fornecedores e Clientes)
export function getParceiros(): ParceiroDB[] {
  const db = ensureDbExists();
  return db.parceiros;
}

export function resetParceiros(): ParceiroDB[] {
  const db = ensureDbExists();
  db.parceiros = [...PARCEIROS_PADRAO];
  writeDb(db);
  return db.parceiros;
}

export function addParceiro(novo: Omit<ParceiroDB, "id">): ParceiroDB {
  const db = ensureDbExists();
  const parceiro: ParceiroDB = {
    ...novo,
    id: "parc-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
  };
  db.parceiros.push(parceiro);
  writeDb(db);
  return parceiro;
}

// Métodos de Notas Fiscais
export function getNotas(): NotaFiscalDB[] {
  const db = ensureDbExists();
  return db.notas.sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  );
}

export function salvarNota(novaNota: Omit<NotaFiscalDB, "id" | "criadoEm">): NotaFiscalDB {
  const db = ensureDbExists();
  const notaCompleta: NotaFiscalDB = {
    ...novaNota,
    id: "nf-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    criadoEm: new Date().toISOString(),
  };

  // Movimentação de estoque
  if (notaCompleta.possuiProdutos && Array.isArray(notaCompleta.itens)) {
    notaCompleta.itens.forEach((item) => {
      const delta = notaCompleta.tipoOperacao === "ENTRADA" ? item.quantidade : -item.quantidade;
      const produtoAlvo = db.produtos.find(
        (p) => (item.produtoId && p.id === item.produtoId) || p.codigo === item.codigo
      );
      if (produtoAlvo) {
        produtoAlvo.estoqueAtual = Math.max(0, produtoAlvo.estoqueAtual + delta);
      }
    });
  }

  db.notas.push(notaCompleta);
  writeDb(db);
  return notaCompleta;
}
