"use client";

import { useState, useMemo, useEffect } from "react";

// Interfaces
interface ProdutoCatalogo {
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

interface ParceiroCatalogo {
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

interface ItemEstoque {
  id: string;
  produtoId?: string;
  codigo: string;
  produto: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
}

interface ParcelaFinanceira {
  id: string;
  numero: number;
  vencimento: string;
  valor: number;
  formaPagamento: string;
}

interface NotaSalva {
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
  itens: {
    codigo: string;
    produto: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    total: number;
  }[];
  parcelas: ParcelaFinanceira[];
  criadoEm: string;
}

// Helpers
const formatBRL = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(isNaN(value) ? 0 : value);
};

const getTodayString = (): string => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

export default function SimuladorNotaPage() {
  // Navegação Principal de Módulos
  const [visaoAtual, setVisaoAtual] = useState<"lancamento" | "parceiros" | "catalogo" | "historico">("lancamento");

  // Dados do Banco de Dados
  const [produtosCatalogo, setProdutosCatalogo] = useState<ProdutoCatalogo[]>([]);
  const [parceirosCatalogo, setParceirosCatalogo] = useState<ParceiroCatalogo[]>([]);
  const [notasSalvas, setNotasSalvas] = useState<NotaSalva[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(false);

  // Estado Geral da Nota
  const [tipoOperacao, setTipoOperacao] = useState<"ENTRADA" | "SAIDA">("ENTRADA");
  const [naturezaOperacao, setNaturezaOperacao] = useState("Compra para Comercialização");
  const [parceiroSelecionadoId, setParceiroSelecionadoId] = useState("");
  const [parceiro, setParceiro] = useState("");
  const [documentoParceiro, setDocumentoParceiro] = useState("");
  const [numeroNf, setNumeroNf] = useState("");
  const [serieNf, setSerieNf] = useState("1");
  const [dataEmissao, setDataEmissao] = useState(getTodayString());
  const [possuiProdutos, setPossuiProdutos] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<"itens" | "financeiro">("itens");

  // Itens da Nota
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [produtoCatalogoSelecionado, setProdutoCatalogoSelecionado] = useState("");
  const [novoCodigo, setNovoCodigo] = useState("");
  const [novoProduto, setNovoProduto] = useState("");
  const [novaUnidade, setNovaUnidade] = useState("UN");
  const [novaQtd, setNovaQtd] = useState<number>(1);
  const [novoValorUnit, setNovoValorUnit] = useState<number>(0);

  // Módulo Financeiro
  const [valorDiretoFinanceiro, setValorDiretoFinanceiro] = useState<number>(0);
  const [parcelas, setParcelas] = useState<ParcelaFinanceira[]>([]);
  const [qtdParcelasAuto, setQtdParcelasAuto] = useState<number>(3);
  const [intervaloDias, setIntervaloDias] = useState<number>(30);
  const [formaPagamentoPadrao, setFormaPagamentoPadrao] = useState("Boleto Bancário");

  // Modais
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [modalNovoProdutoAberto, setModalNovoProdutoAberto] = useState(false);
  const [modalNovoParceiroAberto, setModalNovoParceiroAberto] = useState(false);
  const [notaVisualizada, setNotaVisualizada] = useState<NotaSalva | null>(null);
  const [salvandoNota, setSalvandoNota] = useState(false);
  const [jsonCopiado, setJsonCopiado] = useState(false);

  // Filtros de Parceiros
  const [filtroParceiro, setFiltroParceiro] = useState("");
  const [tipoFiltroParceiro, setTipoFiltroParceiro] = useState<"TODOS" | "FORNECEDOR" | "CLIENTE">("TODOS");

  // Filtros de Catálogo de Produtos
  const [filtroCatalogo, setFiltroCatalogo] = useState("");
  const [categoriaCatalogo, setCategoriaCatalogo] = useState("TODAS");

  // Formulário de Novo Parceiro
  const [formParcRazao, setFormParcRazao] = useState("");
  const [formParcFantasia, setFormParcFantasia] = useState("");
  const [formParcCnpj, setFormParcCnpj] = useState("");
  const [formParcTipo, setFormParcTipo] = useState<"FORNECEDOR" | "CLIENTE" | "AMBOS">("FORNECEDOR");
  const [formParcIE, setFormParcIE] = useState("");
  const [formParcCidade, setFormParcCidade] = useState("");
  const [formParcUF, setFormParcUF] = useState("SP");
  const [formParcTel, setFormParcTel] = useState("");
  const [formParcEmail, setFormParcEmail] = useState("");

  // Formulário de Novo Produto no Catálogo
  const [formProdCodigo, setFormProdCodigo] = useState("");
  const [formProdDescricao, setFormProdDescricao] = useState("");
  const [formProdCategoria, setFormProdCategoria] = useState("Informática & TI");
  const [formProdUnidade, setFormProdUnidade] = useState("UN");
  const [formProdCusto, setFormProdCusto] = useState<number>(0);
  const [formProdVenda, setFormProdVenda] = useState<number>(0);
  const [formProdEstoque, setFormProdEstoque] = useState<number>(10);
  const [formProdNcm, setFormProdNcm] = useState("8471.30.12");

  // Requisições Iniciais
  const carregarProdutos = async () => {
    try {
      const res = await fetch("/api/produtos");
      if (res.ok) {
        const data = await res.json();
        setProdutosCatalogo(data);
      }
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  };

  const carregarParceiros = async () => {
    try {
      const res = await fetch("/api/parceiros");
      if (res.ok) {
        const data = await res.json();
        setParceirosCatalogo(data);
      }
    } catch (err) {
      console.error("Erro ao carregar parceiros:", err);
    }
  };

  const carregarHistoricoNotas = async () => {
    try {
      const res = await fetch("/api/notas");
      if (res.ok) {
        const data = await res.json();
        setNotasSalvas(data);
      }
    } catch (err) {
      console.error("Erro ao carregar histórico de notas:", err);
    }
  };

  useEffect(() => {
    carregarProdutos();
    carregarParceiros();
    carregarHistoricoNotas();
  }, []);

  // Selecionar Parceiro e Autopreencher Fornecedor / Cliente e CNPJ
  const handleSelecionarParceiro = (id: string) => {
    setParceiroSelecionadoId(id);
    if (!id) return;

    const p = parceirosCatalogo.find((item) => item.id === id);
    if (p) {
      const nomeExibicao = p.nomeFantasia
        ? `${p.razaoSocial} (${p.nomeFantasia})`
        : p.razaoSocial;
      setParceiro(nomeExibicao);
      setDocumentoParceiro(p.cnpj);

      // Sugere tipo de operação
      if (p.tipo === "FORNECEDOR") {
        setTipoOperacao("ENTRADA");
        setNaturezaOperacao("Compra para Comercialização e Estoque");
      } else if (p.tipo === "CLIENTE") {
        setTipoOperacao("SAIDA");
        setNaturezaOperacao("Venda de Produção / Mercadoria");
      }
    }
  };

  const usarParceiroNaNota = (p: ParceiroCatalogo) => {
    const nomeExibicao = p.nomeFantasia
      ? `${p.razaoSocial} (${p.nomeFantasia})`
      : p.razaoSocial;
    setParceiro(nomeExibicao);
    setDocumentoParceiro(p.cnpj);
    setParceiroSelecionadoId(p.id);

    if (p.tipo === "FORNECEDOR") {
      setTipoOperacao("ENTRADA");
      setNaturezaOperacao("Compra para Comercialização e Estoque");
    } else if (p.tipo === "CLIENTE") {
      setTipoOperacao("SAIDA");
      setNaturezaOperacao("Venda de Produção / Mercadoria");
    }

    setVisaoAtual("lancamento");
  };

  // Selecionar produto do catálogo
  const handleSelecionarProdutoCatalogo = (idOuCodigo: string) => {
    setProdutoCatalogoSelecionado(idOuCodigo);
    if (!idOuCodigo) return;

    const prod = produtosCatalogo.find((p) => p.id === idOuCodigo || p.codigo === idOuCodigo);
    if (prod) {
      setNovoCodigo(prod.codigo);
      setNovoProduto(prod.descricao);
      setNovaUnidade(prod.unidade);
      const precoSugerido = tipoOperacao === "ENTRADA" ? prod.precoCusto : prod.precoVenda;
      setNovoValorUnit(precoSugerido);
    }
  };

  // Cálculos Automáticos
  const valorTotalItens = useMemo(() => {
    return itens.reduce((acc, item) => acc + item.quantidade * item.valorUnitario, 0);
  }, [itens]);

  const valorTotalNota = possuiProdutos ? valorTotalItens : valorDiretoFinanceiro;

  const totalParcelas = useMemo(() => {
    return parcelas.reduce((acc, p) => acc + p.valor, 0);
  }, [parcelas]);

  const diferencaFinanceira = useMemo(() => {
    return Math.round((valorTotalNota - totalParcelas) * 100) / 100;
  }, [valorTotalNota, totalParcelas]);

  const estaConciliado = parcelas.length > 0 && Math.abs(diferencaFinanceira) < 0.01;

  // Ações de Itens
  const adicionarItem = () => {
    if (!novoProduto.trim()) {
      alert("Informe a descrição do produto.");
      return;
    }
    if (novaQtd <= 0) {
      alert("A quantidade deve ser maior que zero.");
      return;
    }
    if (novoValorUnit <= 0) {
      alert("O valor unitário deve ser maior que zero.");
      return;
    }

    const prodCatalogo = produtosCatalogo.find((p) => p.codigo === novoCodigo || p.descricao === novoProduto);

    const item: ItemEstoque = {
      id: "item-" + Math.random().toString(36).substring(2, 9),
      produtoId: prodCatalogo?.id,
      codigo: novoCodigo.trim() || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      produto: novoProduto.trim(),
      unidade: novaUnidade,
      quantidade: Number(novaQtd),
      valorUnitario: Number(novoValorUnit),
    };

    setItens((prev) => [...prev, item]);
    setProdutoCatalogoSelecionado("");
    setNovoCodigo("");
    setNovoProduto("");
    setNovaQtd(1);
    setNovoValorUnit(0);
  };

  const adicionarDiretoDoCatalogo = (prod: ProdutoCatalogo) => {
    const preco = tipoOperacao === "ENTRADA" ? prod.precoCusto : prod.precoVenda;
    const item: ItemEstoque = {
      id: "item-" + Math.random().toString(36).substring(2, 9),
      produtoId: prod.id,
      codigo: prod.codigo,
      produto: prod.descricao,
      unidade: prod.unidade,
      quantidade: 1,
      valorUnitario: preco,
    };
    setItens((prev) => [...prev, item]);
    setVisaoAtual("lancamento");
    setAbaAtiva("itens");
  };

  const removerItem = (id: string) => {
    setItens((prev) => prev.filter((it) => it.id !== id));
  };

  const limparItens = () => {
    if (confirm("Deseja remover todos os produtos desta nota?")) {
      setItens([]);
    }
  };

  // Gerador de Parcelas
  const gerarParcelasAutomaticas = (numParcelas: number, diasIntervalo: number = 30) => {
    if (valorTotalNota <= 0) {
      alert("O valor total da nota fiscal deve ser maior que R$ 0,00.");
      return;
    }

    const novasParcelas: ParcelaFinanceira[] = [];
    const valorBase = Math.floor((valorTotalNota / numParcelas) * 100) / 100;
    const diferencaCentavos = Math.round((valorTotalNota - valorBase * numParcelas) * 100) / 100;

    for (let i = 1; i <= numParcelas; i++) {
      const valor = i === 1 ? valorBase + diferencaCentavos : valorBase;
      const dataVenc = diasIntervalo === 0 ? dataEmissao : addDays(dataEmissao, i * diasIntervalo);

      novasParcelas.push({
        id: "parc-" + Math.random().toString(36).substring(2, 9),
        numero: i,
        vencimento: dataVenc,
        valor: Math.round(valor * 100) / 100,
        formaPagamento: formaPagamentoPadrao,
      });
    }

    setParcelas(novasParcelas);
  };

  const adicionarParcelaManual = () => {
    const proximoNum = parcelas.length + 1;
    const valorSugerido = Math.max(0, diferencaFinanceira > 0 ? diferencaFinanceira : 0);
    const dataVenc = parcelas.length > 0
      ? addDays(parcelas[parcelas.length - 1].vencimento, 30)
      : addDays(dataEmissao, 30);

    const nova: ParcelaFinanceira = {
      id: "parc-" + Math.random().toString(36).substring(2, 9),
      numero: proximoNum,
      vencimento: dataVenc,
      valor: valorSugerido,
      formaPagamento: formaPagamentoPadrao,
    };

    setParcelas((prev) => [...prev, nova]);
  };

  const atualizarParcela = (id: string, campo: keyof ParcelaFinanceira, valor: any) => {
    setParcelas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );
  };

  const removerParcela = (id: string) => {
    setParcelas((prev) => {
      const filtradas = prev.filter((p) => p.id !== id);
      return filtradas.map((p, idx) => ({ ...p, numero: idx + 1 }));
    });
  };

  const ajustarDiferencaNaUltimaParcela = () => {
    if (parcelas.length === 0) return;
    setParcelas((prev) => {
      const copy = [...prev];
      const ultima = copy[copy.length - 1];
      copy[copy.length - 1] = {
        ...ultima,
        valor: Math.max(0, Math.round((ultima.valor + diferencaFinanceira) * 100) / 100),
      };
      return copy;
    });
  };

  // Carregar Exemplos com Fornecedores / Clientes Reais
  const carregarExemplo = (tipo: "ENTRADA" | "SAIDA") => {
    setTipoOperacao(tipo);
    setDataEmissao(getTodayString());
    setSerieNf("1");
    setPossuiProdutos(true);
    setAbaAtiva("itens");
    setVisaoAtual("lancamento");

    if (tipo === "ENTRADA") {
      setParceiro("Dell Computadores do Brasil Ltda (Dell Technologies)");
      setDocumentoParceiro("72.381.189/0001-10");
      setNumeroNf("048920");
      setNaturezaOperacao("Compra para Comercialização e Estoque");

      const itensEx: ItemEstoque[] = [
        {
          id: "ex-1",
          produtoId: "prod-1",
          codigo: "PRD-NOTE-01",
          produto: "Notebook Corporativo Dell Latitude Core i7 16GB 512GB SSD",
          unidade: "UN",
          quantidade: 5,
          valorUnitario: 3800.0,
        },
        {
          id: "ex-2",
          produtoId: "prod-2",
          codigo: "PRD-MON-02",
          produto: "Monitor Profissional LG 24\" IPS Full HD 75Hz",
          unidade: "UN",
          quantidade: 10,
          valorUnitario: 620.0,
        },
      ];
      setItens(itensEx);

      const total = 5 * 3800.0 + 10 * 620.0;
      const parcValor = Math.round((total / 3) * 100) / 100;
      setParcelas([
        { id: "p1", numero: 1, vencimento: addDays(getTodayString(), 30), valor: parcValor, formaPagamento: "Boleto Bancário" },
        { id: "p2", numero: 2, vencimento: addDays(getTodayString(), 60), valor: parcValor, formaPagamento: "Boleto Bancário" },
        { id: "p3", numero: 3, vencimento: addDays(getTodayString(), 90), valor: Math.round((total - parcValor * 2) * 100) / 100, formaPagamento: "Boleto Bancário" },
      ]);
    } else {
      setParceiro("Hospital e Maternidade Santa Clara Ltda (Hospital Santa Clara)");
      setDocumentoParceiro("14.882.109/0001-30");
      setNumeroNf("001452");
      setNaturezaOperacao("Venda de Mercadoria para Uso / Consumo");

      const itensEx: ItemEstoque[] = [
        {
          id: "ex-3",
          produtoId: "prod-1",
          codigo: "PRD-NOTE-01",
          produto: "Notebook Corporativo Dell Latitude Core i7 16GB 512GB SSD",
          unidade: "UN",
          quantidade: 2,
          valorUnitario: 4950.0,
        },
        {
          id: "ex-4",
          produtoId: "prod-4",
          codigo: "PRD-NOB-04",
          produto: "Nobreak Senoidal APC Smart-UPS 1500VA Bivolt",
          unidade: "UN",
          quantidade: 2,
          valorUnitario: 1890.0,
        },
      ];
      setItens(itensEx);

      const total = 2 * 4950.0 + 2 * 1890.0;
      setParcelas([
        { id: "p4", numero: 1, vencimento: addDays(getTodayString(), 15), valor: 6840.0, formaPagamento: "Transferência / PIX" },
        { id: "p5", numero: 2, vencimento: addDays(getTodayString(), 45), valor: 6840.0, formaPagamento: "Boleto Bancário" },
      ]);
    }
  };

  const limparFormulario = () => {
    if (confirm("Deseja limpar todos os campos do formulário atual?")) {
      setParceiro("");
      setDocumentoParceiro("");
      setParceiroSelecionadoId("");
      setNumeroNf("");
      setItens([]);
      setParcelas([]);
      setValorDiretoFinanceiro(0);
      setProdutoCatalogoSelecionado("");
    }
  };

  // Salvar Novo Parceiro (POST /api/parceiros)
  const handleCadastrarNovoParceiro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formParcRazao.trim() || !formParcCnpj.trim()) {
      alert("Preencha a Razão Social e o CNPJ.");
      return;
    }

    try {
      const res = await fetch("/api/parceiros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razaoSocial: formParcRazao.trim(),
          nomeFantasia: formParcFantasia.trim() || formParcRazao.trim(),
          cnpj: formParcCnpj.trim(),
          tipo: formParcTipo,
          inscricaoEstadual: formParcIE.trim() || "ISENTO",
          cidade: formParcCidade.trim() || "São Paulo",
          uf: formParcUF,
          telefone: formParcTel.trim(),
          email: formParcEmail.trim(),
        }),
      });

      if (res.ok) {
        alert("Fornecedor / Cliente cadastrado com sucesso no banco de dados!");
        setModalNovoParceiroAberto(false);
        setFormParcRazao("");
        setFormParcFantasia("");
        setFormParcCnpj("");
        setFormParcIE("");
        setFormParcCidade("");
        setFormParcTel("");
        setFormParcEmail("");
        await carregarParceiros();
      } else {
        const erro = await res.json();
        alert("Erro ao cadastrar parceiro: " + erro.error);
      }
    } catch (err: any) {
      alert("Erro na requisição: " + err.message);
    }
  };

  const handleResetarParceiros = async () => {
    if (confirm("Deseja restaurar a lista padrão de fornecedores e clientes?")) {
      try {
        const res = await fetch("/api/parceiros/seed", { method: "POST" });
        if (res.ok) {
          alert("Fornecedores padrão restaurados com sucesso!");
          await carregarParceiros();
        }
      } catch (err: any) {
        alert("Falha ao restaurar parceiros: " + err.message);
      }
    }
  };

  // Salvar Novo Produto no Catálogo (POST /api/produtos)
  const handleCadastrarNovoProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProdCodigo.trim() || !formProdDescricao.trim()) {
      alert("Preencha o Código e a Descrição do produto.");
      return;
    }

    try {
      const res = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: formProdCodigo.toUpperCase().trim(),
          descricao: formProdDescricao.trim(),
          categoria: formProdCategoria,
          unidade: formProdUnidade,
          precoCusto: formProdCusto,
          precoVenda: formProdVenda,
          estoqueAtual: formProdEstoque,
          ncm: formProdNcm.trim(),
        }),
      });

      if (res.ok) {
        alert("Produto cadastrado com sucesso no banco de dados!");
        setModalNovoProdutoAberto(false);
        setFormProdCodigo("");
        setFormProdDescricao("");
        setFormProdCusto(0);
        setFormProdVenda(0);
        setFormProdEstoque(10);
        await carregarProdutos();
      } else {
        const erro = await res.json();
        alert("Erro ao cadastrar produto: " + erro.error);
      }
    } catch (err: any) {
      alert("Erro na requisição: " + err.message);
    }
  };

  const handleResetarCatalogo = async () => {
    if (confirm("Deseja restaurar o catálogo de produtos para a lista padrão inicial?")) {
      try {
        const res = await fetch("/api/produtos/seed", { method: "POST" });
        if (res.ok) {
          alert("Catálogo restaurado com sucesso!");
          await carregarProdutos();
        }
      } catch (err: any) {
        alert("Falha ao restaurar catálogo: " + err.message);
      }
    }
  };

  // Gravação da Nota no Banco (POST /api/notas)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parceiro.trim()) {
      alert("Por favor, preencha o Fornecedor ou Cliente.");
      return;
    }
    if (!numeroNf.trim()) {
      alert("Por favor, informe o Número da Nota Fiscal.");
      return;
    }
    if (possuiProdutos && itens.length === 0) {
      alert("A nota está configurada com produtos, mas nenhum item foi adicionado à lista.");
      setAbaAtiva("itens");
      return;
    }
    if (valorTotalNota <= 0) {
      alert("O valor total da nota fiscal deve ser superior a zero.");
      return;
    }

    if (parcelas.length === 0) {
      const confirma = confirm("Nenhuma duplicata financeira foi informada. Deseja prosseguir mesmo assim?");
      if (!confirma) {
        setAbaAtiva("financeiro");
        return;
      }
    } else if (!estaConciliado) {
      const msg =
        diferencaFinanceira > 0
          ? `Existe uma diferença de ${formatBRL(diferencaFinanceira)} ainda não alocada nas parcelas.`
          : `As parcelas excedem o total da nota em ${formatBRL(Math.abs(diferencaFinanceira))}.`;
      const continuar = confirm(`${msg}\n\nDeseja salvar o lançamento mesmo com divergência financeira?`);
      if (!continuar) {
        setAbaAtiva("financeiro");
        return;
      }
    }

    try {
      setSalvandoNota(true);
      const payloadEnvio = {
        tipoOperacao,
        naturezaOperacao,
        numeroNf,
        serieNf,
        dataEmissao,
        parceiro,
        documentoParceiro,
        possuiProdutos,
        valorTotalNota,
        totalParcelas,
        statusConciliacao: estaConciliado ? "CONCILIADO" : "DIVERGENTE",
        itens: itens.map((it) => ({
          produtoId: it.produtoId,
          codigo: it.codigo,
          produto: it.produto,
          unidade: it.unidade,
          quantidade: it.quantidade,
          valorUnitario: it.valorUnitario,
          total: it.quantidade * it.valorUnitario,
        })),
        parcelas,
      };

      const res = await fetch("/api/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadEnvio),
      });

      if (res.ok) {
        await carregarProdutos();
        await carregarHistoricoNotas();
        setModalSucessoAberto(true);
      } else {
        const erro = await res.json();
        alert("Erro ao gravar nota fiscal no banco: " + erro.error);
      }
    } catch (err: any) {
      alert("Falha de conexão com a API: " + err.message);
    } finally {
      setSalvandoNota(false);
    }
  };

  const payloadExibicao = useMemo(() => {
    return {
      cabecalho: {
        tipoOperacao,
        naturezaOperacao,
        numeroNota: numeroNf,
        serie: serieNf,
        dataEmissao,
        parceiro: { nome: parceiro, documento: documentoParceiro },
        possuiProdutos,
      },
      valores: {
        totalItens: possuiProdutos ? valorTotalItens : 0,
        totalNota: valorTotalNota,
        totalParcelas,
        diferenca: diferencaFinanceira,
        status: estaConciliado ? "CONCILIADO" : "DIVERGENTE",
      },
      itens,
      parcelas,
    };
  }, [
    tipoOperacao,
    naturezaOperacao,
    numeroNf,
    serieNf,
    dataEmissao,
    parceiro,
    documentoParceiro,
    possuiProdutos,
    valorTotalItens,
    valorTotalNota,
    totalParcelas,
    diferencaFinanceira,
    estaConciliado,
    itens,
    parcelas,
  ]);

  const copiarJson = () => {
    navigator.clipboard.writeText(JSON.stringify(payloadExibicao, null, 2));
    setJsonCopiado(true);
    setTimeout(() => setJsonCopiado(false), 3000);
  };

  // Filtragem de Parceiros
  const parceirosFiltrados = useMemo(() => {
    return parceirosCatalogo.filter((p) => {
      const matchTexto =
        p.razaoSocial.toLowerCase().includes(filtroParceiro.toLowerCase()) ||
        p.nomeFantasia.toLowerCase().includes(filtroParceiro.toLowerCase()) ||
        p.cnpj.includes(filtroParceiro) ||
        p.cidade.toLowerCase().includes(filtroParceiro.toLowerCase());
      const matchTipo =
        tipoFiltroParceiro === "TODOS" || p.tipo === tipoFiltroParceiro || p.tipo === "AMBOS";
      return matchTexto && matchTipo;
    });
  }, [parceirosCatalogo, filtroParceiro, tipoFiltroParceiro]);

  // Filtragem de Catálogo
  const produtosFiltrados = useMemo(() => {
    return produtosCatalogo.filter((p) => {
      const matchTexto =
        p.descricao.toLowerCase().includes(filtroCatalogo.toLowerCase()) ||
        p.codigo.toLowerCase().includes(filtroCatalogo.toLowerCase()) ||
        p.ncm.includes(filtroCatalogo);
      const matchCategoria =
        categoriaCatalogo === "TODAS" || p.categoria === categoriaCatalogo;
      return matchTexto && matchCategoria;
    });
  }, [produtosCatalogo, filtroCatalogo, categoriaCatalogo]);

  const categoriasDisponiveis = useMemo(() => {
    const set = new Set(produtosCatalogo.map((p) => p.categoria));
    return ["TODAS", ...Array.from(set)];
  }, [produtosCatalogo]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-md shadow-indigo-500/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                  Simulador Fiscal & Financeiro
                </h1>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                  DB Conectado
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Fornecedores & Emitentes • Catálogo de Produtos • Controle de Estoque
              </p>
            </div>
          </div>

          {/* 4 Módulos de Navegação */}
          <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setVisaoAtual("lancamento")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                visaoAtual === "lancamento"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Lançamento de NF
            </button>

            <button
              type="button"
              onClick={() => setVisaoAtual("parceiros")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                visaoAtual === "parceiros"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Fornecedores & Clientes
              <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300">
                {parceirosCatalogo.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVisaoAtual("catalogo")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                visaoAtual === "catalogo"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Catálogo & Estoque
              <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300">
                {produtosCatalogo.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVisaoAtual("historico")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                visaoAtual === "historico"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Histórico ({notasSalvas.length})
            </button>
          </div>

          {/* Atalhos Rápidos */}
          {visaoAtual === "lancamento" && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => carregarExemplo("ENTRADA")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 active:scale-95"
              >
                Exemplo Entrada
              </button>
              <button
                type="button"
                onClick={() => carregarExemplo("SAIDA")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20 active:scale-95"
              >
                Exemplo Saída
              </button>
              <button
                type="button"
                onClick={limparFormulario}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Limpar
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CONTEÚDO 1: LANÇAMENTO DE NOTA FISCAL */}
      {visaoAtual === "lancamento" && (
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* KPIs no Topo */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total da Nota</span>
                <div className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                  {formatBRL(valorTotalNota)}
                </div>
                <span className="mt-1 block text-xs text-slate-400">
                  {possuiProdutos ? `${itens.length} produto(s) no lançamento` : "Sem produtos de estoque"}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total em Duplicatas</span>
                <div className="mt-1 text-xl font-extrabold text-indigo-400 sm:text-2xl">
                  {formatBRL(totalParcelas)}
                </div>
                <span className="mt-1 block text-xs text-slate-400">
                  {parcelas.length} duplicata(s) registrada(s)
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Status Conciliação</span>
                <div className="mt-1.5">
                  {parcelas.length === 0 ? (
                    <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400">
                      Sem parcelas
                    </span>
                  ) : estaConciliado ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Conciliado 100%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-300 border border-rose-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                      Dif: {formatBRL(diferencaFinanceira)}
                    </span>
                  )}
                </div>
                <span className="mt-1 block text-xs text-slate-400">
                  {estaConciliado ? "Valores coincidem com a NF" : "Ajuste as duplicatas abaixo"}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Parceiro & Tipo</span>
                <div className="mt-1 text-sm font-bold">
                  {tipoOperacao === "ENTRADA" ? (
                    <span className="text-emerald-400">📥 ENTRADA (Compra)</span>
                  ) : (
                    <span className="text-indigo-400">📤 SAÍDA (Venda)</span>
                  )}
                </div>
                <span className="mt-1 block truncate text-xs text-slate-400" title={parceiro || "Nenhum parceiro selecionado"}>
                  {parceiro || "Nenhum parceiro selecionado"}
                </span>
              </div>
            </div>

            {/* CARD 1: Dados Gerais da Nota com Seletor de Fornecedor / Emitente */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-semibold text-white sm:text-lg">1. Dados Gerais & Fornecedor / Emitente</h2>
                  <p className="text-xs text-slate-400">
                    Selecione um fornecedor ou cliente cadastrado com CNPJ e Nome Fantasia, ou informe manualmente.
                  </p>
                </div>

                <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTipoOperacao("ENTRADA")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      tipoOperacao === "ENTRADA"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Entrada (Compra)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoOperacao("SAIDA")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      tipoOperacao === "SAIDA"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Saída (Venda)
                  </button>
                </div>
              </div>

              {/* SELETOR RÁPIDO DE FORNECEDORES & CLIENTES CADASTRADOS */}
              <div className="mb-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
                      🏢
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                      Vincular Fornecedor / Emitente Cadastrado
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setVisaoAtual("parceiros")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    Ver / Cadastrar Fornecedores no Banco ({parceirosCatalogo.length}) →
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-12 items-center">
                  <div className="sm:col-span-8">
                    <select
                      value={parceiroSelecionadoId}
                      onChange={(e) => handleSelecionarParceiro(e.target.value)}
                      className="w-full rounded-lg border border-indigo-500/40 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                    >
                      <option value="">-- Escolha um fornecedor/emitente para preencher Razão Social, Fantasia e CNPJ --</option>
                      {parceirosCatalogo.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.tipo}] {p.nomeFantasia || p.razaoSocial} ({p.razaoSocial}) • CNPJ: {p.cnpj} • {p.cidade}/{p.uf}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4 text-xs text-slate-400">
                    Preenche automaticamente a <strong>Razão Social</strong>, <strong>Nome Fantasia</strong> e <strong>CNPJ</strong> oficial.
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    {tipoOperacao === "ENTRADA" ? "Razão Social / Nome Fantasia do Fornecedor" : "Razão Social / Nome do Cliente"} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dell Computadores do Brasil Ltda (Dell Technologies)"
                    value={parceiro}
                    onChange={(e) => setParceiro(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">CNPJ do Parceiro *</label>
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0000-00"
                    value={documentoParceiro}
                    onChange={(e) => setDocumentoParceiro(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">Natureza da Operação</label>
                  <input
                    type="text"
                    value={naturezaOperacao}
                    onChange={(e) => setNaturezaOperacao(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">Número da NF *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 048920"
                    value={numeroNf}
                    onChange={(e) => setNumeroNf(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">Série</label>
                  <input
                    type="text"
                    placeholder="1"
                    value={serieNf}
                    onChange={(e) => setSerieNf(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">Data de Emissão</label>
                  <input
                    type="date"
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={possuiProdutos}
                      onChange={(e) => {
                        setPossuiProdutos(e.target.checked);
                        if (!e.target.checked) setAbaAtiva("financeiro");
                      }}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-800 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                    <span className="ml-3 text-xs font-medium text-slate-200">
                      Movimentar Estoque (Produtos)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Abas: Itens vs Duplicatas */}
            <div className="flex border-b border-slate-800">
              {possuiProdutos && (
                <button
                  type="button"
                  onClick={() => setAbaAtiva("itens")}
                  className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
                    abaAtiva === "itens"
                      ? "border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Itens & Estoque ({itens.length})
                </button>
              )}

              <button
                type="button"
                onClick={() => setAbaAtiva("financeiro")}
                className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
                  abaAtiva === "financeiro"
                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Duplicatas & Financeiro ({parcelas.length})
              </button>
            </div>

            {/* ABA ITENS E ESTOQUE */}
            {possuiProdutos && abaAtiva === "itens" && (
              <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm sm:p-6">
                
                {/* Seletor de Produtos */}
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
                        ⚡
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                        Selecionar do Catálogo Integrado
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setVisaoAtual("catalogo")}
                      className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      Ver todos os {produtosCatalogo.length} produtos do estoque →
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-12 items-center">
                    <div className="sm:col-span-8">
                      <select
                        value={produtoCatalogoSelecionado}
                        onChange={(e) => handleSelecionarProdutoCatalogo(e.target.value)}
                        className="w-full rounded-lg border border-indigo-500/40 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                      >
                        <option value="">-- Escolha um produto para autopreencher --</option>
                        {produtosCatalogo.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            [{prod.codigo}] {prod.descricao} • Saldo: {prod.estoqueAtual} {prod.unidade} • {tipoOperacao === "ENTRADA" ? `Custo: ${formatBRL(prod.precoCusto)}` : `Venda: ${formatBRL(prod.precoVenda)}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4 text-xs text-slate-400">
                      {tipoOperacao === "ENTRADA" ? (
                        <span className="text-emerald-300">Preço sugerido: <strong>Preço de Custo</strong> do fornecedor.</span>
                      ) : (
                        <span className="text-indigo-300">Preço sugerido: <strong>Preço de Venda</strong> ao cliente.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Formulário de Inclusão */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-12 items-end">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-slate-400">Código / SKU</label>
                      <input
                        type="text"
                        placeholder="Ex: PRD-01"
                        value={novoCodigo}
                        onChange={(e) => setNovoCodigo(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="mb-1 block text-xs font-medium text-slate-400">Descrição do Produto *</label>
                      <input
                        type="text"
                        placeholder="Nome do produto"
                        value={novoProduto}
                        onChange={(e) => setNovoProduto(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-slate-400">Unidade</label>
                      <select
                        value={novaUnidade}
                        onChange={(e) => setNovaUnidade(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="UN">UN - Unidade</option>
                        <option value="KG">KG - Quilograma</option>
                        <option value="CX">CX - Caixa</option>
                        <option value="PC">PC - Peça</option>
                        <option value="LT">LT - Litro</option>
                        <option value="RL">RL - Rolo</option>
                        <option value="M">M - Metro</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-slate-400">Quantidade</label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={novaQtd || ""}
                        onChange={(e) => setNovaQtd(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-slate-400">Vlr. Unitário (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={novoValorUnit || ""}
                        onChange={(e) => setNovoValorUnit(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <div className="text-xs text-slate-400">
                      Subtotal: <span className="font-semibold text-white">{formatBRL(novaQtd * novoValorUnit)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={adicionarItem}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-500 active:scale-95"
                    >
                      + Adicionar à Nota
                    </button>
                  </div>
                </div>

                {/* Tabela de Itens */}
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Código</th>
                          <th className="px-4 py-3">Descrição do Produto</th>
                          <th className="px-4 py-3 text-center">Un.</th>
                          <th className="px-4 py-3 text-right">Qtd</th>
                          <th className="px-4 py-3 text-right">Vlr. Unitário</th>
                          <th className="px-4 py-3 text-right">Total</th>
                          <th className="px-4 py-3 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {itens.map((item) => (
                          <tr key={item.id} className="transition hover:bg-slate-900/40">
                            <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.codigo}</td>
                            <td className="px-4 py-3 font-medium text-white">{item.produto}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-300">
                                {item.unidade}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono">{item.quantidade}</td>
                            <td className="px-4 py-3 text-right font-mono">{formatBRL(item.valorUnitario)}</td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                              {formatBRL(item.quantidade * item.valorUnitario)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => removerItem(item.id)}
                                className="rounded p-1 text-slate-400 hover:text-rose-400"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}

                        {itens.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                              Nenhum produto inserido nesta nota. Selecione acima pelo catálogo ou digite manualmente.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {itens.length > 0 && (
                        <tfoot className="border-t border-slate-800 bg-slate-900/90 text-sm font-semibold text-white">
                          <tr>
                            <td colSpan={5} className="px-4 py-3 text-right text-slate-400">
                              Total Geral dos Produtos:
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-base text-emerald-400">
                              {formatBRL(valorTotalItens)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={limparItens}
                                className="text-xs text-rose-400 hover:underline"
                              >
                                Limpar Todos
                              </button>
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ABA DUPLICATAS & FINANCEIRO */}
            {abaAtiva === "financeiro" && (
              <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm sm:p-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Duplicatas & Condições Comerciais</h3>
                  <p className="text-xs text-slate-400">
                    Defina datas de vencimento, parcelas e formas de pagamento vinculadas a este documento.
                  </p>
                </div>

                {!possuiProdutos && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                    <label className="mb-1 block text-xs font-medium text-amber-300">
                      Valor Total da Despesa / Serviço (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorDiretoFinanceiro || ""}
                      onChange={(e) => setValorDiretoFinanceiro(parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      className="w-full max-w-xs rounded-lg border border-amber-500/50 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )}

                {/* Gerador de Parcelas */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <span className="text-sm font-semibold text-white">Gerador Inteligente de Parcelas</span>
                    <span className="text-xs text-slate-400">
                      Total da nota: <strong className="text-white">{formatBRL(valorTotalNota)}</strong>
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">Parcelas</label>
                      <select
                        value={qtdParcelasAuto}
                        onChange={(e) => setQtdParcelasAuto(parseInt(e.target.value, 10))}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value={1}>1x (Pagamento Único)</option>
                        <option value={2}>2x Parcelas</option>
                        <option value={3}>3x Parcelas</option>
                        <option value={4}>4x Parcelas</option>
                        <option value={6}>6x Parcelas</option>
                        <option value={12}>12x Parcelas</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">Intervalo de Dias</label>
                      <select
                        value={intervaloDias}
                        onChange={(e) => setIntervaloDias(parseInt(e.target.value, 10))}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value={0}>À Vista (Hoje)</option>
                        <option value={15}>A cada 15 dias (Quinzenal)</option>
                        <option value={30}>A cada 30 dias (Mensal)</option>
                        <option value={60}>A cada 60 dias (Bimestral)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">Forma de Pagamento</label>
                      <select
                        value={formaPagamentoPadrao}
                        onChange={(e) => setFormaPagamentoPadrao(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="Boleto Bancário">Boleto Bancário</option>
                        <option value="Transferência / PIX">PIX / Chave Direta</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="TED / Transferência Bancária">TED / DOC</option>
                        <option value="Dinheiro">Dinheiro em Espécie</option>
                      </select>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => gerarParcelasAutomaticas(qtdParcelasAuto, intervaloDias)}
                        className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-500 active:scale-95"
                      >
                        Gerar Duplicatas
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabela de Parcelas */}
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Títulos Financeiros
                    </h4>
                    <button
                      type="button"
                      onClick={adicionarParcelaManual}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      + Adicionar Parcela Avulsa
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="border-b border-slate-800 bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="px-4 py-2.5 text-center">Nº</th>
                          <th className="px-4 py-2.5">Data Vencimento</th>
                          <th className="px-4 py-2.5">Forma Pagamento</th>
                          <th className="px-4 py-2.5 text-right">Valor</th>
                          <th className="px-4 py-2.5 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {parcelas.map((parc) => (
                          <tr key={parc.id} className="transition hover:bg-slate-900/40">
                            <td className="px-4 py-2.5 text-center font-mono text-xs text-slate-400">{parc.numero}ª</td>
                            <td className="px-4 py-2.5">
                              <input
                                type="date"
                                value={parc.vencimento}
                                onChange={(e) => atualizarParcela(parc.id, "vencimento", e.target.value)}
                                className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <select
                                value={parc.formaPagamento}
                                onChange={(e) => atualizarParcela(parc.id, "formaPagamento", e.target.value)}
                                className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                              >
                                <option value="Boleto Bancário">Boleto Bancário</option>
                                <option value="Transferência / PIX">PIX / Chave Direta</option>
                                <option value="Cartão de Crédito">Cartão de Crédito</option>
                                <option value="TED / Transferência Bancária">TED / Transferência</option>
                                <option value="Dinheiro">Dinheiro em Espécie</option>
                              </select>
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono">
                              <div className="inline-flex items-center gap-1">
                                <span className="text-xs text-slate-400">R$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={parc.valor || ""}
                                  onChange={(e) =>
                                    atualizarParcela(parc.id, "valor", parseFloat(e.target.value) || 0)
                                  }
                                  className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right text-xs text-white focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => removerParcela(parc.id)}
                                className="rounded p-1 text-slate-400 hover:text-rose-400"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}

                        {parcelas.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                              Nenhuma duplicata configurada. Clique em "Gerar Duplicatas" acima.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {parcelas.length > 0 && (
                        <tfoot className="border-t border-slate-800 bg-slate-900/90 text-sm font-semibold">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right text-slate-400">
                              Total Acumulado das Parcelas:
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-base text-indigo-400">
                              {formatBRL(totalParcelas)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* Conciliação */}
                {parcelas.length > 0 && (
                  <div
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
                      estaConciliado
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium">
                        {estaConciliado
                          ? "Conciliação perfeita! O somatório das duplicatas corresponde exatamente ao valor da nota fiscal."
                          : `Diferença apurada: ${formatBRL(diferencaFinanceira)} entre o total da nota e as parcelas.`}
                      </span>
                    </div>

                    {!estaConciliado && (
                      <button
                        type="button"
                        onClick={ajustarDiferencaNaUltimaParcela}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-amber-500"
                      >
                        Ajustar Diferença na Última Parcela
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Barra de Submissão Fixa */}
            <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-md sm:px-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400">Total da Nota Fiscal</span>
                <div className="text-xl font-black text-white sm:text-2xl">
                  {formatBRL(valorTotalNota)}
                </div>
              </div>

              <button
                type="submit"
                disabled={salvandoNota}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50"
              >
                {salvandoNota ? "Gravando no Banco de Dados..." : "Salvar Lançamento no Banco de Dados"}
              </button>
            </div>
          </form>
        </main>
      )}

      {/* CONTEÚDO 2: GESTÃO DE FORNECEDORES & CLIENTES */}
      {visaoAtual === "parceiros" && (
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
            <div>
              <h2 className="text-lg font-bold text-white">Cadastro de Fornecedores, Emitentes & Clientes</h2>
              <p className="text-xs text-slate-400">
                Empresas parceiras com Razão Social, Nome Fantasia, CNPJ e contatos salvas no banco de dados.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setModalNovoParceiroAberto(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500"
              >
                + Cadastrar Novo Fornecedor / Cliente
              </button>

              <button
                type="button"
                onClick={handleResetarParceiros}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Restaurar Parceiros Padrão
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <input
                type="text"
                placeholder="Buscar por Razão Social, Nome Fantasia, CNPJ ou Cidade..."
                value={filtroParceiro}
                onChange={(e) => setFiltroParceiro(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={tipoFiltroParceiro}
                onChange={(e) => setTipoFiltroParceiro(e.target.value as any)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="TODOS">Tipo: Todos os Parceiros</option>
                <option value="FORNECEDOR">Apenas Fornecedores (Compras)</option>
                <option value="CLIENTE">Apenas Clientes (Vendas)</option>
              </select>
            </div>
          </div>

          {/* Tabela de Parceiros */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5">Tipo</th>
                    <th className="px-4 py-3.5">Nome Fantasia & Razão Social</th>
                    <th className="px-4 py-3.5">CNPJ</th>
                    <th className="px-4 py-3.5">Inscrição Estadual</th>
                    <th className="px-4 py-3.5">Localidade</th>
                    <th className="px-4 py-3.5">Contato</th>
                    <th className="px-4 py-3.5 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {parceirosFiltrados.map((p) => (
                    <tr key={p.id} className="transition hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                            p.tipo === "FORNECEDOR"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : p.tipo === "CLIENTE"
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          }`}
                        >
                          {p.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white text-sm">{p.nomeFantasia}</div>
                        <div className="text-xs text-slate-400">{p.razaoSocial}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">{p.cnpj}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.inscricaoEstadual}</td>
                      <td className="px-4 py-3 text-xs text-slate-300">{p.cidade} - {p.uf}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        <div>{p.telefone}</div>
                        <div className="text-slate-500 text-[11px]">{p.email}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => usarParceiroNaNota(p)}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 active:scale-95"
                        >
                          + Usar na Nota
                        </button>
                      </td>
                    </tr>
                  ))}

                  {parceirosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        Nenhum parceiro encontrado com os filtros informados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* CONTEÚDO 3: CATÁLOGO DE PRODUTOS & ESTOQUE */}
      {visaoAtual === "catalogo" && (
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
            <div>
              <h2 className="text-lg font-bold text-white">Catálogo de Produtos & Controle de Estoque</h2>
              <p className="text-xs text-slate-400">
                Produtos cadastrados com saldo em estoque, NCM fiscal e preços de custo e venda.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setModalNovoProdutoAberto(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500"
              >
                + Cadastrar Novo Produto
              </button>

              <button
                type="button"
                onClick={handleResetarCatalogo}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Restaurar Catálogo Padrão
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <input
                type="text"
                placeholder="Buscar produto por nome, código SKU ou NCM..."
                value={filtroCatalogo}
                onChange={(e) => setFiltroCatalogo(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={categoriaCatalogo}
                onChange={(e) => setCategoriaCatalogo(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {categoriasDisponiveis.map((cat) => (
                  <option key={cat} value={cat}>
                    Categoria: {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela do Catálogo */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5">Código / SKU</th>
                    <th className="px-4 py-3.5">Descrição do Produto</th>
                    <th className="px-4 py-3.5">Categoria</th>
                    <th className="px-4 py-3.5 text-center">Un.</th>
                    <th className="px-4 py-3.5 text-right">Preço Custo</th>
                    <th className="px-4 py-3.5 text-right">Preço Venda</th>
                    <th className="px-4 py-3.5 text-right">Estoque Atual</th>
                    <th className="px-4 py-3.5 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {produtosFiltrados.map((prod) => (
                    <tr key={prod.id} className="transition hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-300">{prod.codigo}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{prod.descricao}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NCM: {prod.ncm}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                          {prod.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs font-mono text-slate-300">
                          {prod.unidade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">{formatBRL(prod.precoCusto)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400">
                        {formatBRL(prod.precoVenda)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            prod.estoqueAtual > 20
                              ? "bg-emerald-500/20 text-emerald-300"
                              : prod.estoqueAtual > 0
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {prod.estoqueAtual} {prod.unidade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => adicionarDiretoDoCatalogo(prod)}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 active:scale-95"
                        >
                          + Usar na Nota
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* CONTEÚDO 4: HISTÓRICO DE NOTAS SALVAS */}
      {visaoAtual === "historico" && (
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
            <div>
              <h2 className="text-lg font-bold text-white">Histórico de Lançamentos Gravados no Banco</h2>
              <p className="text-xs text-slate-400">
                Notas fiscais gravadas com persistência local e conferência de duplicatas.
              </p>
            </div>

            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Total de notas no banco: {notasSalvas.length}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5">Data</th>
                    <th className="px-4 py-3.5">Tipo</th>
                    <th className="px-4 py-3.5">Documento</th>
                    <th className="px-4 py-3.5">Parceiro Comercial (CNPJ)</th>
                    <th className="px-4 py-3.5 text-center">Itens</th>
                    <th className="px-4 py-3.5 text-center">Duplicatas</th>
                    <th className="px-4 py-3.5 text-right">Valor Total</th>
                    <th className="px-4 py-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {notasSalvas.map((nf) => (
                    <tr key={nf.id} className="transition hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-xs text-slate-400">{nf.dataEmissao}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                            nf.tipoOperacao === "ENTRADA"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          }`}
                        >
                          {nf.tipoOperacao}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-white">
                        NF nº {nf.numeroNf} / S-{nf.serieNf}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{nf.parceiro}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{nf.documentoParceiro || "Doc não inf."}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                          {nf.itens?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                          {nf.parcelas?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                        {formatBRL(nf.valorTotalNota)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setNotaVisualizada(nf)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          Inspecionar
                        </button>
                      </td>
                    </tr>
                  ))}

                  {notasSalvas.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                        Nenhuma nota fiscal gravada até o momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* MODAL: SUCESSO AO SALVAR NO BANCO */}
      {modalSucessoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Nota Fiscal Gravada com Sucesso no Banco!</h3>
                  <p className="text-xs text-slate-400">
                    O documento foi persistido no banco de dados e o estoque foi recalculado.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalSucessoAberto(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-xs text-slate-400">Parceiro</span>
                <div className="mt-0.5 font-semibold text-white truncate">{parceiro}</div>
                <span className="text-xs text-slate-500 font-mono">{documentoParceiro}</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-xs text-slate-400">Documento</span>
                <div className="mt-0.5 font-semibold text-white">NF {numeroNf} / S-{serieNf}</div>
                <span className="text-xs text-slate-500">{dataEmissao}</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-xs text-slate-400">Total Faturado</span>
                <div className="mt-0.5 text-lg font-bold text-emerald-400">{formatBRL(valorTotalNota)}</div>
                <span className="text-xs text-slate-500">{parcelas.length} duplicatas</span>
              </div>
            </div>

            {/* Visualizador de JSON */}
            <div className="mt-5">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Payload Persistido no DB (JSON)
                </span>

                <button
                  type="button"
                  onClick={copiarJson}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
                >
                  {jsonCopiado ? "Copiado!" : "Copiar JSON"}
                </button>
              </div>

              <pre className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-indigo-300">
                {JSON.stringify(payloadExibicao, null, 2)}
              </pre>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => {
                  setModalSucessoAberto(false);
                  setVisaoAtual("historico");
                }}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Ver Histórico de Notas
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalSucessoAberto(false);
                  limparFormulario();
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Fazer Novo Lançamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO PARCEIRO (FORNECEDOR OU CLIENTE) */}
      {modalNovoParceiroAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">Cadastrar Fornecedor / Cliente no Banco</h3>
              <button
                onClick={() => setModalNovoParceiroAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCadastrarNovoParceiro} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Tipo de Parceiro</label>
                  <select
                    value={formParcTipo}
                    onChange={(e) => setFormParcTipo(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="FORNECEDOR">Fornecedor (Compras)</option>
                    <option value="CLIENTE">Cliente (Vendas)</option>
                    <option value="AMBOS">Ambos (Compra e Venda)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">CNPJ *</label>
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0000-00"
                    value={formParcCnpj}
                    onChange={(e) => setFormParcCnpj(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">Razão Social Oficial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dell Computadores do Brasil Ltda"
                  value={formParcRazao}
                  onChange={(e) => setFormParcRazao(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">Nome Fantasia (Marca Comercial) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dell Technologies"
                  value={formParcFantasia}
                  onChange={(e) => setFormParcFantasia(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-300">Cidade</label>
                  <input
                    type="text"
                    placeholder="São Paulo"
                    value={formParcCidade}
                    onChange={(e) => setFormParcCidade(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">UF</label>
                  <select
                    value={formParcUF}
                    onChange={(e) => setFormParcUF(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="SP">SP</option>
                    <option value="PR">PR</option>
                    <option value="MG">MG</option>
                    <option value="RJ">RJ</option>
                    <option value="SC">SC</option>
                    <option value="RS">RS</option>
                    <option value="GO">GO</option>
                    <option value="BA">BA</option>
                    <option value="PE">PE</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Inscrição Estadual (IE)</label>
                  <input
                    type="text"
                    placeholder="Ex: 356.128.490.115 ou ISENTO"
                    value={formParcIE}
                    onChange={(e) => setFormParcIE(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 3000-0000"
                    value={formParcTel}
                    onChange={(e) => setFormParcTel(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">Email de Contato / Fiscal</label>
                <input
                  type="email"
                  placeholder="comercial@empresa.com.br"
                  value={formParcEmail}
                  onChange={(e) => setFormParcEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setModalNovoParceiroAberto(false)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow"
                >
                  Salvar Fornecedor no Banco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO PRODUTO */}
      {modalNovoProdutoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">Cadastrar Novo Produto no Banco</h3>
              <button
                onClick={() => setModalNovoProdutoAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCadastrarNovoProduto} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Código SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: PRD-CABO-01"
                    value={formProdCodigo}
                    onChange={(e) => setFormProdCodigo(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Categoria</label>
                  <select
                    value={formProdCategoria}
                    onChange={(e) => setFormProdCategoria(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Informática & TI">Informática & TI</option>
                    <option value="Periféricos">Periféricos</option>
                    <option value="Redes & Cabos">Redes & Cabos</option>
                    <option value="Automação">Automação</option>
                    <option value="Elétrica">Elétrica</option>
                    <option value="Energia">Energia</option>
                    <option value="Suprimentos">Suprimentos</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">Descrição Completa *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do produto ou peça"
                  value={formProdDescricao}
                  onChange={(e) => setFormProdDescricao(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Unidade</label>
                  <select
                    value={formProdUnidade}
                    onChange={(e) => setFormProdUnidade(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="UN">UN - Unidade</option>
                    <option value="CX">CX - Caixa</option>
                    <option value="PC">PC - Peça</option>
                    <option value="RL">RL - Rolo</option>
                    <option value="KG">KG - Quilo</option>
                    <option value="LT">LT - Litro</option>
                    <option value="M">M - Metro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Preço Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formProdCusto || ""}
                    onChange={(e) => setFormProdCusto(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Preço Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formProdVenda || ""}
                    onChange={(e) => setFormProdVenda(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Estoque Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={formProdEstoque}
                    onChange={(e) => setFormProdEstoque(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Código NCM Fiscal</label>
                  <input
                    type="text"
                    value={formProdNcm}
                    onChange={(e) => setFormProdNcm(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setModalNovoProdutoAberto(false)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow"
                >
                  Salvar Produto no Banco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSPECIONAR NOTA DO HISTÓRICO */}
      {notaVisualizada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase font-semibold tracking-wider text-indigo-400">
                  Documento Fiscal Gravado
                </span>
                <h3 className="text-lg font-bold text-white">
                  NF nº {notaVisualizada.numeroNf} / Série {notaVisualizada.serieNf} ({notaVisualizada.tipoOperacao})
                </h3>
                <p className="text-xs text-slate-400">Parceiro: {notaVisualizada.parceiro} • Emissão: {notaVisualizada.dataEmissao}</p>
              </div>

              <button
                onClick={() => setNotaVisualizada(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Itens Faturados</h4>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="p-2">Código</th>
                      <th className="p-2">Produto</th>
                      <th className="p-2 text-right">Qtd</th>
                      <th className="p-2 text-right">Vlr. Unit</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {notaVisualizada.itens?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-mono text-slate-400">{it.codigo}</td>
                        <td className="p-2 text-white font-medium">{it.produto}</td>
                        <td className="p-2 text-right font-mono">{it.quantidade} {it.unidade}</td>
                        <td className="p-2 text-right font-mono">{formatBRL(it.valorUnitario)}</td>
                        <td className="p-2 text-right font-mono font-semibold text-emerald-400">{formatBRL(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Duplicatas Financeiras</h4>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="p-2 text-center">Nº</th>
                      <th className="p-2">Vencimento</th>
                      <th className="p-2">Método</th>
                      <th className="p-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {notaVisualizada.parcelas?.map((pc) => (
                      <tr key={pc.id}>
                        <td className="p-2 text-center font-mono text-slate-400">{pc.numero}ª</td>
                        <td className="p-2 text-white">{pc.vencimento}</td>
                        <td className="p-2 text-slate-300">{pc.formaPagamento}</td>
                        <td className="p-2 text-right font-mono font-semibold text-indigo-400">{formatBRL(pc.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
              <div>
                <span className="text-xs text-slate-400">Total da Nota Fiscal: </span>
                <span className="text-base font-bold text-emerald-400">{formatBRL(notaVisualizada.valorTotalNota)}</span>
              </div>

              <button
                type="button"
                onClick={() => setNotaVisualizada(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
