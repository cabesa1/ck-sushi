import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Saiba como o CK Sushi trata dados pessoais e protege sua privacidade.',
  alternates: { canonical: '/privacidade' },
};

export default function PrivacyPage() {
  return (
    <main className="legalPage">
      <header><Link className="legalLogo" href="/"><img src="/ck-logo.png" alt="CK Sushi"/></Link><Link href="/">Voltar ao site</Link></header>
      <article>
        <p className="legalEyebrow">Privacidade e LGPD</p>
        <h1>Política de<br/>Privacidade.</h1>
        <p className="legalUpdated">Última atualização: 1 de setembro de 2026</p>
        <section>
          <h2>1. Quem é o responsável?</h2>
          <p>O CK Sushi é responsável pelas decisões relacionadas aos dados pessoais tratados por este site. Nosso endereço é Avenida Júlio Cassola, 1405, Connect Two, Votorantim — SP. Para falar sobre privacidade, use o telefone ou WhatsApp <a href="tel:+5515991843232">(15) 99184-3232</a>.</p>
          <h2>2. Quais dados são tratados?</h2>
          <p>O formulário de reserva envia ao banco de dados do CK Sushi o nome, telefone, data, horário e número de pessoas. A data de nascimento é opcional e somente é armazenada quando a pessoa marca a autorização específica para comunicações de aniversário.</p>
          <h2>3. Para quais finalidades?</h2>
          <p>Usamos essas informações para verificar disponibilidade, organizar reservas, prestar atendimento e manter o histórico necessário do relacionamento. Com autorização específica, a data de nascimento pode ser usada para personalizar o atendimento e enviar comunicações de aniversário pelo WhatsApp. A autorização pode ser revogada a qualquer momento.</p>
          <h2>4. Compartilhamento e serviços externos</h2>
          <p>Ao abrir o WhatsApp, o tratamento passa também pelas políticas da Meta/WhatsApp. Caso o Google Analytics seja configurado, ele somente será ativado com consentimento para análise. Não vendemos dados pessoais.</p>
          <h2>5. Retenção e segurança</h2>
          <p>A escolha de cookies fica armazenada no dispositivo por até 12 meses. Dados de reserva e conversas são mantidos pelo período necessário ao atendimento, à gestão do relacionamento e às obrigações aplicáveis. O acesso ao painel é autenticado e os registros privados são protegidos por regras de acesso no banco de dados.</p>
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
