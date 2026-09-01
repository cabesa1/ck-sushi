import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página não encontrada',
  description: 'A página que você procurou não foi encontrada no site do CK Sushi.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="notFound">
      <div className="notFoundMark" aria-hidden="true">CK</div>
      <p>Erro 404</p>
      <h1>Essa peça<br/>não está no combinado.</h1>
      <span>A página que você procura não existe ou mudou de endereço.</span>
      <a href="/">Voltar ao início</a>
    </main>
  );
}
