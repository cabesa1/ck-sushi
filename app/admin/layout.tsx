import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Painel administrativo',
  description: 'Gestão de reservas e relacionamento do CK Sushi.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
