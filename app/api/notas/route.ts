import { NextResponse } from "next/server";
import { getNotas, salvarNota } from "@/lib/db";

export async function GET() {
  try {
    const notas = getNotas();
    return NextResponse.json(notas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao buscar notas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.numeroNf || !body.parceiro) {
      return NextResponse.json({ error: "Número da NF e Parceiro são obrigatórios." }, { status: 400 });
    }

    const notaSalva = salvarNota({
      tipoOperacao: body.tipoOperacao || "ENTRADA",
      naturezaOperacao: body.naturezaOperacao || "Operação Padrão",
      numeroNf: body.numeroNf,
      serieNf: body.serieNf || "1",
      dataEmissao: body.dataEmissao || new Date().toISOString().split("T")[0],
      parceiro: body.parceiro,
      documentoParceiro: body.documentoParceiro || "",
      possuiProdutos: !!body.possuiProdutos,
      valorTotalNota: Number(body.valorTotalNota) || 0,
      totalParcelas: Number(body.totalParcelas) || 0,
      statusConciliacao: body.statusConciliacao || "CONCILIADO",
      itens: Array.isArray(body.itens) ? body.itens : [],
      parcelas: Array.isArray(body.parcelas) ? body.parcelas : [],
    });

    return NextResponse.json(notaSalva, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao salvar nota fiscal" }, { status: 500 });
  }
}
