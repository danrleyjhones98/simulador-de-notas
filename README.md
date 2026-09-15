# 📊 Simulador de Lançamento de Notas Fiscais

Aplicação interativa desenvolvida com **Next.js**, **React** e **Tailwind CSS** para simular operações fiscais, cálculo de estoque e planejamento financeiro de notas de entrada e saída.

---

## 🚀 Como Executar o Projeto

### Opção 1: Inicialização Rápida (Recomendado no Windows)
Basta dar um **duplo clique** no arquivo:
```
iniciar.bat
```
> O script verifica se o Node.js está instalado (e auxilia na instalação se necessário), instala as dependências caso ainda não existam e abre o navegador automaticamente em `http://localhost:3000`.

---

### Opção 2: Pelo Terminal (VS Code / PowerShell)

1. Abra a pasta do projeto no seu terminal ou editor:
   ```bash
   cd "C:\Users\Lucas\Documents\dev\simulador-de-notas"
   ```

2. Instale as dependências (caso seja necessário):
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse no navegador:
   ```
   http://localhost:3000
   ```

---

## 📁 Estrutura de Arquivos

```
simulador-de-notas/
├── app/
│   ├── globals.css         # Estilos globais e diretivas do Tailwind CSS
│   ├── layout.tsx          # Layout base da aplicação
│   └── page.tsx            # Interface e lógica do simulador de notas
├── .gitignore              # Lista de arquivos/pastas ignorados no versionamento
├── iniciar.bat             # Inicializador automático para Windows
├── next.config.mjs         # Configurações do framework Next.js
├── package.json            # Dependências e scripts do projeto
├── postcss.config.js       # Configuração do compilador PostCSS
├── README.md               # Esta documentação
├── tailwind.config.ts      # Tokens e utilitários de estilo Tailwind
└── tsconfig.json           # Configurações do TypeScript
```

---

## 🛠️ Tecnologias Utilizadas

- **[Next.js 14](https://nextjs.org/)** (App Router)
- **[React 18](https://react.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS](https://tailwindcss.com/)**

---

## 💡 Recursos do Simulador

- **Operações Fiscais**: Alternância rápida entre notas de Entrada (Compra) e Saída (Venda).
- **Controle de Produtos**: Inclusão dinâmica de itens com cálculo automático de subtotal e total da nota.
- **Módulo Financeiro**: Lançamento direto ou divisão em parcelas com datas de vencimento e formas de pagamento (Boleto, Pix, Cartão, etc.).
- **Integração Pronta**: Geração de payload pronto para envio a APIs ou sistemas ERP.
