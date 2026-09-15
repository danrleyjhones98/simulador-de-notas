import { NextResponse } from "next/server";
import { resetProdutos } from "@/lib/db";

export async function POST() {
  try {
    const produtos = resetProdutos();
    return NextResponse.json({ message: "Catálogo restaurado com sucesso", produtos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao resetar produtos" }, { status: 500 });
  }
}
