import { NextResponse } from "next/server";
import { getParceiros, addParceiro } from "@/lib/db";

export async function GET() {
  try {
    const parceiros = getParceiros();
    return NextResponse.json(parceiros);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao buscar parceiros" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.razaoSocial || !body.cnpj) {
      return NextResponse.json({ error: "Razão Social e CNPJ são obrigatórios." }, { status: 400 });
    }

    const novoParceiro = addParceiro({
      razaoSocial: body.razaoSocial,
      nomeFantasia: body.nomeFantasia || body.razaoSocial,
      cnpj: body.cnpj,
      tipo: body.tipo || "FORNECEDOR",
      inscricaoEstadual: body.inscricaoEstadual || "ISENTO",
      cidade: body.cidade || "Não informada",
      uf: body.uf || "SP",
      telefone: body.telefone || "",
      email: body.email || "",
    });

    return NextResponse.json(novoParceiro, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao salvar parceiro" }, { status: 500 });
  }
}
