import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(isNaN(num) ? 0 : num);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('pt-BR');
}

export function formatChaveAcesso(chave: string | undefined): string {
  if (!chave) return '';
  const clean = chave.replace(/\D/g, '');
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
}
