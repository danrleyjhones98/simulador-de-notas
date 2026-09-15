import { NextResponse } from "next/server";
import { resetParceiros } from "@/lib/db";

export async function POST() {
  try {
    const parceiros = resetParceiros();
    return NextResponse.json({ message: "Parceiros restaurados com sucesso", parceiros });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao resetar parceiros" }, { status: 500 });
  }
}
