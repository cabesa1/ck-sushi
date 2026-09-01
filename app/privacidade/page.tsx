import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Saiba como o CK Sushi trata dados pessoais e protege sua privacidade.',
  alternates: { canonical: '/privacidade' },
};

export default function PrivacyPage() {
  return (
    <main className="legalPage">
      <header><a className="legalLogo" href="/"><span>CK</span><b>CK SUSHI</b></a><a href="/">Voltar ao site</a></header>
      <article>
        <p className="legalEyebrow">Privacidade e LGPD</p>
        <h1>Política de<br/>Privacidade.</h1>
        <p className="legalUpdated">Última atualização: 1 de setembro de 2026</p>
        <section>
          <h2>1. Quem é o responsável?</h2>
          <p>O CK Sushi é responsável pelas decisões relacionadas aos dados pessoais tratados por este site. Nosso endereço é Avenida Júlio Cassola, 1405, Connect Two, Votorantim — SP. Para falar sobre privacidade, use o telefone ou WhatsApp <a href="tel:+5515991843232">(15) 99184-3232</a>.</p>
          <h2>2. Quais dados são tratados?</h2>
          <p>O formulário de reserva organiza nome, data desejada, número de pessoas e, opcionalmente, data de nascimento apenas no seu navegador. Esses dados não são enviados a um banco de dados do site. A data de nascimento só é incluída na mensagem quando a pessoa marca a autorização específica e envia voluntariamente a mensagem pelo WhatsApp.</p>
          <h2>3. Para quais finalidades?</h2>
          <p>Usamos as informações enviadas pelo WhatsApp para responder ao contato, verificar disponibilidade, organizar reservas e prestar atendimento. Com autorização específica, a data de nascimento pode ser usada para personalizar o atendimento e enviar comunicações de aniversário pelo WhatsApp. A autorização pode ser revogada a qualquer momento pelo canal de contato do restaurante.</p>
          <h2>4. Compartilhamento e serviços externos</h2>
          <p>Ao abrir o WhatsApp, o tratamento passa também pelas políticas da Meta/WhatsApp. Caso o Google Analytics seja configurado, ele somente será ativado com consentimento para análise. Não vendemos dados pessoais.</p>
          <h2>5. Retenção e segurança</h2>
          <p>A escolha de cookies fica armazenada no dispositivo por até 12 meses. Conversas e dados de reserva recebidos pelo WhatsApp são mantidos pelo período necessário ao atendimento e às obrigações aplicáveis. Adotamos medidas razoáveis para limitar acessos indevidos.</p>
          <h2>6. Seus direitos</h2>
          <p>Nos termos da LGPD, você pode solicitar informações sobre o tratamento, acesso, correção, eliminação quando aplicável, portabilidade, informação sobre compartilhamentos e revogação do consentimento. Entre em contato pelo número indicado nesta página.</p>
          <h2>7. Atualizações</h2>
          <p>Esta política pode ser atualizada para refletir mudanças no site ou nas práticas do restaurante. A data da versão vigente estará sempre indicada no início da página.</p>
        </section>
      </article>
      <footer><span>© 2026 CK Sushi</span><a href="/termos">Termos de uso</a></footer>
    </main>
  );
}
