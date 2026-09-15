import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulador de Notas Fiscais | Gestão & Finanças",
  description: "Simulador moderno para lançamento de notas fiscais de entrada e saída, controle de itens de estoque e conciliação financeira de duplicatas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full bg-slate-900">
      <body className="min-h-full bg-slate-900 text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
