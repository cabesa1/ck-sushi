import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos aplicáveis ao uso do site e às solicitações de reserva do CK Sushi.',
  alternates: { canonical: '/termos' },
};

export default function TermsPage() {
  return (
    <main className="legalPage">
      <header><a className="legalLogo" href="/"><span>CK</span><b>CK SUSHI</b></a><a href="/">Voltar ao site</a></header>
      <article>
        <p className="legalEyebrow">Uso do site</p>
        <h1>Termos<br/>de Uso.</h1>
        <p className="legalUpdated">Última atualização: 31 de agosto de 2026</p>
        <section>
          <h2>1. Aceitação</h2>
          <p>Ao navegar neste site, você concorda com estes termos. Se não concordar, interrompa o uso. O site apresenta o CK Sushi, sua experiência de rodízio, localização e canais de contato.</p>
          <h2>2. Solicitações de reserva</h2>
          <p>O preenchimento do formulário e o envio da mensagem pelo WhatsApp representam uma solicitação. A reserva somente estará confirmada depois da resposta expressa da equipe do CK Sushi. Disponibilidade, horários e capacidade podem variar.</p>
          <h2>3. Informações comerciais</h2>
          <p>Cardápio, itens do rodízio, preços, horários e condições podem ser atualizados pelo restaurante. Confirme informações específicas diretamente com a equipe antes da visita.</p>
          <h2>4. Uso adequado</h2>
          <p>Não é permitido usar o site para fins ilícitos, tentar comprometer sua segurança, automatizar solicitações abusivas ou reproduzir conteúdo e identidade visual sem autorização.</p>
          <h2>5. Serviços de terceiros</h2>
          <p>Links para WhatsApp, mapas ou outras plataformas levam a serviços externos, sujeitos aos próprios termos e políticas. O CK Sushi não controla o funcionamento contínuo dessas plataformas.</p>
          <h2>6. Propriedade intelectual</h2>
          <p>Textos, marca, identidade visual, fotografias e demais elementos do site pertencem aos respectivos titulares e são protegidos pela legislação aplicável.</p>
          <h2>7. Contato e alterações</h2>
          <p>Podemos atualizar estes termos quando o site ou os serviços mudarem. Para dúvidas, fale com o CK Sushi pelo telefone ou WhatsApp <a href="tel:+5515991843232">(15) 99184-3232</a>.</p>
        </section>
      </article>
      <footer><span>© 2026 CK Sushi</span><a href="/privacidade">Política de privacidade</a></footer>
    </main>
  );
}
