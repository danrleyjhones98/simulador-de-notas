# Simulador de Notas Fiscais & Emissor DANFE SEFAZ

Sistema completo para emissão, cálculo fiscal e impressão em PDF de Documentos Auxiliares da Nota Fiscal Eletrônica (**DANFE** padrão SEFAZ), operando com **PostgreSQL verdadeiro**, arquitetura moderna baseada em **React + Vite**, design tokens **Coss UI** e componentes **Shadcn**.

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Design System & Estilização**: [Coss UI](https://coss.com/ui) + [Tailwind CSS](https://tailwindcss.com/) + Padrões [Shadcn UI](https://ui.shadcn.com/)
- **Organização por Sidebar**: Menu lateral com navegação fluida por abas (Dashboard, Emissão, DANFE, Produtos, Parceiros e Histórico).
- **Banco de Dados Real (SQL)**: [PostgreSQL 16 (PGlite)](https://pglite.dev/) com DDL nativo (`CREATE TABLE`, `INSERT`, `UPDATE`, chaves estrangeiras, índices e transações) persistido em disco local (`./data/pgdata`).
- **Servidor Backend**: [Express](https://expressjs.com/) integrado rodando consultas SQL parametrizadas na porta 3001 com proxy no Vite.
- **Simulação DANFE SEFAZ Oficial**:
  - Layout fidedigno ao Manual de Integração do Contribuinte (MOC Anexo II da SEFAZ).
  - Canhoto de recebimento com picote tracejado.
  - Código de barras CODE-128 e Chave de Acesso de 44 dígitos autêntica (com cálculo de DV módulo 11).
  - Impressão otimizada em folha A4 (`@media print`) para geração direta de PDF oficial pelo navegador.
  - Exportação em XML oficial da NF-e.

---

## 🏛️ Estrutura do Banco de Dados Relacional (PostgreSQL)

O banco de dados utiliza tabelas relacionais verdadeiras com chaves primárias e estrangeiras:

1. `parceiros`: Cadastro de Fornecedores e Clientes (Razão Social, Nome Fantasia, CNPJ, Inscrição Estadual, Endereço completo e Contato).
2. `produtos`: Catálogo fiscal com NCM, Unidade (UN, CX, PC, RL), Preço de Custo, Preço de Venda, Estoque Atual e Alíquotas de ICMS/IPI.
3. `notas_fiscais`: Cabeçalho da NF-e com Chave de Acesso, Protocolo SEFAZ, Totais, Frete, Tributos e Status.
4. `nota_itens`: Itens vinculados à nota fiscal com CST, CFOP, NCM, quantidades, valores e alíquotas.
5. `duplicatas`: Parcelamento de faturas (1x à vista até parcelamentos em boletos com datas de vencimento).

---

## 📦 Como Executar

### 1. Inicialização Automática (Windows)
Basta dar um duplo clique no arquivo:
```cmd
iniciar.bat
```
O script irá validar o ambiente, instalar dependências se necessário e abrir o navegador automaticamente em `http://localhost:3000`.

### 2. Linha de Comando
```bash
# 1. Instalar dependências
npm install

# 2. Executar carga inicial do PostgreSQL (opcional, executado automaticamente)
npm run seed

# 3. Iniciar servidor frontend Vite e backend SQL simultaneamente
npm run dev
```

Acesse no seu navegador: **http://localhost:3000**

---

## 📄 Funcionalidades

- **Dashboard Geral**: Indicadores financeiros de faturamento, volume de notas emitidas, controle de entradas vs saídas e itens em estoque.
- **Emissor de NF-e**: Formulário dinâmico com seleção de fornecedores/clientes, inserção dinâmica de produtos, cálculo automático de impostos (ICMS e IPI) e geração de parcelamento.
- **Visualizador DANFE SEFAZ & PDF**: Visualização no formato oficial da SEFAZ com botão para impressão e download de PDF em folha A4 perfeita.
- **Catálogo de Produtos**: Gestão com adição de novos produtos diretamente no banco PostgreSQL.
- **Gestão de Parceiros**: Fornecedores renomados (Dell, Furukawa, Schneider, LG, MegaSuprimentos, OmniSensors) e Clientes.
- **Histórico**: Busca e filtragem de notas fiscais com visualização rápida de DANFE e download de XML.

---

Desenvolvido com foco em alta performance, robustez fiscal e estética moderna.
