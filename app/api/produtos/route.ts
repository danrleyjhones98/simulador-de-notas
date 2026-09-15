import { NextResponse } from "next/server";
import { getProdutos, addProduto } from "@/lib/db";

export async function GET() {
  try {
    const produtos = getProdutos();
    return NextResponse.json(produtos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.codigo || !body.descricao) {
      return NextResponse.json({ error: "Código e Descrição são obrigatórios." }, { status: 400 });
    }

    const novoProduto = addProduto({
      codigo: body.codigo,
      descricao: body.descricao,
      categoria: body.categoria || "Geral",
      unidade: body.unidade || "UN",
      precoCusto: Number(body.precoCusto) || 0,
      precoVenda: Number(body.precoVenda) || 0,
      estoqueAtual: Number(body.estoqueAtual) || 0,
      ncm: body.ncm || "0000.00.00",
    });

    return NextResponse.json(novoProduto, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao salvar produto" }, { status: 500 });
  }
}
