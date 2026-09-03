'use client';

import { FormEvent, useEffect, useState } from 'react';

const WA = 'https://wa.me/5515991843232?text=Ol%C3%A1%2C%20gostaria%20de%20reservar%20uma%20mesa%20no%20CK%20Sushi.';
const experiences = [
  { kicker: 'Frescor sem pausa', title: ['SUSHI', 'SEM LIMITES'], image: '/ck-sushi-selection-900.jpg', imageSet: '/ck-sushi-selection-480.jpg 480w, /ck-sushi-selection-900.jpg 900w', label: 'Seleção real do CK Sushi' },
  { kicker: 'Do balcão à mesa', title: ['FEITO', 'NA HORA'], image: '/ck-editorial-sushi-900.jpg', imageSet: '/ck-editorial-sushi-480.jpg 480w, /ck-editorial-sushi-900.jpg 900w', label: 'Criações do nosso sushibar' },
  { kicker: 'Uma noite completa', title: ['VIVA O', 'CK SUSHI'], image: '/ck-tuna-selection-1065.jpg', imageSet: '/ck-tuna-selection-640.jpg 640w, /ck-tuna-selection-1065.jpg 1065w', label: 'Combinado servido no CK Sushi' },
];
const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function localDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function displayDate(value: string) {
  if (!value) return 'Escolha uma data';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function Arrow() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
}

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(false);
  const [slide, setSlide] = useState(0);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [reservationLink, setReservationLink] = useState(WA);
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [ambienteOpen, setAmbienteOpen] = useState(false);
  const [omakaseOpen, setOmakaseOpen] = useState(false);
  const [japaOpen, setJapaOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [cookieNotice, setCookieNotice] = useState(false);
  const [cookieSettings, setCookieSettings] = useState(false);
  const [cookiePolicy, setCookiePolicy] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const analyticsConfigured = Boolean(process.env.NEXT_PUBLIC_GA_ID);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = window.setTimeout(() => setLoaded(true), 1400);
    try {
      const saved = JSON.parse(localStorage.getItem('ck-cookie-consent-v2') || 'null');
      const valid = saved?.savedAt && Date.now() - saved.savedAt < 31536000000;
      if (valid) {
        queueMicrotask(() => {
          setAnalytics(Boolean(saved.analytics));
          setMarketing(Boolean(saved.marketing));
        });
      } else {
        window.setTimeout(() => setCookieNotice(true), 1500);
      }
    } catch {
      window.setTimeout(() => setCookieNotice(true), 1500);
    }
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('locked', menu || modal || cookieSettings || cookiePolicy);
    return () => document.documentElement.classList.remove('locked');
  }, [menu, modal, cookieSettings, cookiePolicy]);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % experiences.length), 4200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const measurementId = process.env.NEXT_PUBLIC_GA_ID;
    if (!measurementId) return;

    const analyticsWindow = window as Window & {
      dataLayer?: unknown[][];
      gtag?: (...args: unknown[]) => void;
    };

    if (!analytics) {
      analyticsWindow.gtag?.('consent', 'update', { analytics_storage: 'denied' });
      return;
    }

    analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
    analyticsWindow.gtag = analyticsWindow.gtag || ((...args: unknown[]) => analyticsWindow.dataLayer?.push(args));
    analyticsWindow.gtag('consent', 'update', { analytics_storage: 'granted' });
    analyticsWindow.gtag('js', new Date());
    analyticsWindow.gtag('config', measurementId, { anonymize_ip: true });

    if (!document.querySelector(`script[data-ck-analytics="${measurementId}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      script.dataset.ckAnalytics = measurementId;
      document.head.appendChild(script);
    }
  }, [analytics]);

  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    }), { threshold: .14 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenu(false); setModal(false); }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const date = String(data.get('date') || '');
    const time = String(data.get('time') || '');
    const people = Number(data.get('people') || 0);
    const errors: Record<string, string> = {};
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (name.length < 2) errors.name = 'Digite seu nome para continuarmos.';
    if (phone.replace(/\D/g, '').length < 10) errors.phone = 'Informe um telefone com DDD.';
    if (!date) errors.date = 'Escolha a data desejada.';
    else if (date < todayString) errors.date = 'Escolha uma data a partir de hoje.';
    else if (new Date(`${date}T12:00:00`).getDay() === 1) errors.date = 'O CK Sushi não abre às segundas-feiras. Escolha outro dia.';
    if (!time) errors.time = 'Escolha um horário.';
    if (!Number.isInteger(people) || people < 1) errors.people = 'Informe pelo menos uma pessoa.';
    else if (people > 30) errors.people = 'Para grupos acima de 30 pessoas, fale diretamente com a equipe.';
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    const [year, month, day] = date.split('-');
    const message = [
      'Olá, gostaria de verificar uma reserva no CK Sushi.',
      '',
      `Nome: ${name}`,
      `Telefone: ${phone}`,
      `Data desejada: ${day}/${month}/${year}`,
      `Horário desejado: ${time}`,
      `Quantidade de pessoas: ${people}`,
      '',
      'Podem confirmar a disponibilidade, por favor?',
    ].join('\n');

    setSubmitting(true);
    setReservationLink(`https://wa.me/5515991843232?text=${encodeURIComponent(message)}`);
    setSubmitting(false);
    setSent(true);
  }

  function openReservation() {
    setMenu(false);
    setModal(true);
    setSent(false);
    setSubmitting(false);
    setCalendarOpen(false);
    setFormErrors({});
  }

  const todayValue = localDateValue(new Date());
  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const firstWeekDay = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);
  const previousMonthUnavailable = calendarMonth.getTime() <= currentMonth.getTime();

  function saveCookies(nextAnalytics: boolean, nextMarketing: boolean) {
    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
    localStorage.setItem('ck-cookie-consent-v2', JSON.stringify({
      essential: true,
      analytics: nextAnalytics,
      marketing: nextMarketing,
      savedAt: Date.now(),
    }));
    setCookieNotice(false);
    setCookieSettings(false);
  }

  return (
    <>
      <div className={`loader ${loaded ? 'loaderExit' : ''}`} aria-hidden={loaded}>
        <div className="loaderBrand"><img src="/ck-logo.png" alt="CK Sushi"/></div>
        <div className="loaderTrack"><span /></div>
      </div>

      <main className={loaded ? 'ready' : ''}>
        <section className="hero" id="inicio">
          <img className="heroImage" src="/ck-hero-table-1065.jpg" srcSet="/ck-hero-table-720.jpg 720w, /ck-hero-table-1065.jpg 1065w" sizes="100vw" alt="Mesa completa com sushis e pratos do CK Sushi" loading="eager" fetchPriority="high" decoding="async" />
          <div className="heroShade" />
          <header>
            <nav className="desktopNav" aria-label="Navegação principal">
              <a href="#rodizio">O rodízio</a><a href="#experiencia">A experiência</a>
            </nav>
            <a className="logo" href="#inicio" aria-label="CK Sushi"><img src="/ck-logo.png" alt="CK Sushi"/></a>
            <div className="headerActions">
              <button className="bookText" onClick={openReservation}>Reservar mesa</button>
              <button className="burger" onClick={() => setMenu(true)} aria-label="Abrir menu"><i/><i/></button>
            </div>
          </header>

          <div className="heroTitle" aria-label="Uma experiência única">
            {['UMA', 'EXPERIÊNCIA', 'ÚNICA'].map((word, i) => <span className="wordClip" key={word}><b style={{ transitionDelay: `${200 + i * 140}ms` }}>{word}</b></span>)}
          </div>

          <div className="heroBottom">
            <p className="heroTag"><span>FRESCOR EM CADA PEÇA.</span><span>CUIDADO EM CADA DETALHE.</span></p>
            <div className="heroCards">
              <article className="glassCard featured">
                <img src="/ck-salmon-selection-900.jpg" srcSet="/ck-salmon-selection-480.jpg 480w, /ck-salmon-selection-900.jpg 900w" sizes="(max-width: 700px) 45vw, 260px" alt="Seleção de salmão preparada pelo CK Sushi" loading="lazy" decoding="async" />
                <div><small>CK SIGNATURE</small><b>Seleção da casa</b><a href="#rodizio">Descobrir <Arrow/></a></div>
              </article>
              <article className="glassCard locationCard">
                <strong>VOTO<br/>RANTIM</strong>
                <div><span className="avatarDot"/><span className="avatarDot"/><span className="avatarDot"/></div>
                <small>Connect Two<br/>Nova Esplanada</small>
              </article>
            </div>
          </div>
        </section>

        <section className="experience" id="experiencia">
          <div className="trustTop">
            <div className="roundBadge" data-reveal><strong>100%</strong><span>feito para uma noite especial</span></div>
            <article className="introCard" data-reveal>
              <span>#01</span><div><h2>Rodízio em outro nível</h2><p>Uma experiência completa de culinária japonesa, com variedade, cuidado e peças preparadas durante toda a noite.</p></div>
            </article>
          </div>
          <div className="ghostWords" key={slide}>
            <div><span>{experiences[slide].title[0]}</span><span>À</span></div>
            <div><span>VONTADE</span><span>{experiences[slide].title[1]}</span></div>
          </div>
          <figure className="centerCard" data-reveal>
            <img src={experiences[slide].image} srcSet={experiences[slide].imageSet} sizes="(max-width: 700px) 82vw, 560px" alt={experiences[slide].label} loading="lazy" decoding="async" />
            <figcaption><b>{experiences[slide].kicker}</b><span>{experiences[slide].label}</span></figcaption>
          </figure>
          <div className="carouselControls">
            <button onClick={() => setSlide((slide + 2) % 3)} aria-label="Experiência anterior"><Arrow/></button>
            <div>{experiences.map((_, i) => <button key={i} className={i === slide ? 'active' : ''} onClick={() => setSlide(i)} aria-label={`Ver experiência ${i + 1}`}/>)}</div>
            <button className="next" onClick={() => setSlide((slide + 1) % 3)} aria-label="Próxima experiência"><Arrow/></button>
          </div>
        </section>

        <section className="rodizio" id="rodizio">
          <p className="eyebrow"><i/> A experiência CK</p>
          <h2 data-reveal>Uma experiência<br/>única.</h2>
          <div className="rows">
            {[
              ['01','Sushis & sashimis','Clássicos e criações preparados com cuidado durante toda a noite.'],
              ['02','Pratos quentes','Sabores reconfortantes para completar sua experiência japonesa.'],
              ['03','À la carte','Escolha seus pratos favoritos individualmente e viva o CK do seu jeito.'],
              ['04','Omakase','Uma experiência exclusiva para transformar uma data especial.'],
              ['05','Um lugar para celebrar','Um ambiente acolhedor para encontros, jantares e celebrações.'],
              ['06','Japa in the house','A experiência do CK Sushi onde você estiver.'],
            ].map(([n,title,text],i) => {
              const isAmbiente = n === '05';
              const isOmakase = n === '04';
              const isJapa = n === '06';
              const isExpandable = isAmbiente || isOmakase || isJapa;
              const isOpen = isAmbiente ? ambienteOpen : isOmakase ? omakaseOpen : isJapa ? japaOpen : false;
              const toggle = isAmbiente ? () => setAmbienteOpen((open) => !open) : isOmakase ? () => setOmakaseOpen((open) => !open) : () => setJapaOpen((open) => !open);
              const detailId = isAmbiente ? 'ambiente-details' : isOmakase ? 'omakase-details' : 'japa-details';
              return <article className={isExpandable ? `japaRow revealed${isOpen ? ' open' : ''}` : ''} data-reveal key={n} style={{transitionDelay:`${i*90}ms`}}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div>{isExpandable ? <button className="rowArrow japaToggle" type="button" onClick={toggle} aria-expanded={isOpen} aria-controls={detailId} aria-label={isOpen ? `Fechar detalhes de ${title}` : `Abrir detalhes de ${title}`}><Arrow/></button> : <i className="rowArrow"><Arrow/></i>}{isAmbiente && <div className="japaDetails" id={detailId} aria-hidden={!isOpen}><div><strong>Conforto para diferentes momentos.</strong><p>O restaurante conta com balcão e mesas em um espaço acolhedor e bem distribuído. Ao todo, comportamos até 43 pessoas para refeições, encontros e celebrações.</p></div></div>}{isOmakase && <div className="japaDetails" id={detailId} aria-hidden={!isOpen}><div><strong>Uma data especial merece uma experiência única.</strong><p>No Omakase, a seleção fica por conta do chef, que conduz uma sequência exclusiva de sabores e preparos para tornar sua celebração ainda mais marcante. Consulte disponibilidade e condições com nossa equipe.</p></div><a className="pill darkPill" href="https://wa.me/5515991843232?text=Ol%C3%A1%2C%20gostaria%20de%20reservar%20a%20experi%C3%AAncia%20Omakase%20para%20uma%20data%20especial." target="_blank" rel="noreferrer">Reservar Omakase pelo WhatsApp <Arrow/></a></div>}{isJapa && <div className="japaDetails" id={detailId} aria-hidden={!isOpen}><div><strong>O CK vai até você.</strong><p>Levamos a experiência japonesa do CK Sushi para sua casa, empresa ou evento, com uma proposta personalizada para a ocasião. Consulte formatos, disponibilidade e valores diretamente com nossa equipe.</p></div><a className="pill darkPill" href="https://wa.me/5515991843232?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20uma%20cota%C3%A7%C3%A3o%20do%20Japa%20in%20the%20house." target="_blank" rel="noreferrer">Cotação: (15) 99184-3232 <Arrow/></a></div>}</article>;
            })}
          </div>
        </section>

        <section className="place" id="local">
          <div className="placeIntro">
            <div className="miniMark">鮨</div>
            <h2 data-reveal>Perto de tudo.<br/>Longe do comum.</h2>
            <p>Na Avenida Júlio Cassola, no Connect Two, próximo ao Alphaville Nova Esplanada. Um endereço para viver Votorantim de um jeito especial.</p>
          </div>
          <div className="photoPair">
            <figure data-reveal><img src="/ck-interior-logo-900.jpg" srcSet="/ck-interior-logo-480.jpg 480w, /ck-interior-logo-900.jpg 900w" sizes="(max-width: 700px) 92vw, 45vw" alt="Logotipo do CK Sushi no interior do restaurante" loading="lazy" decoding="async"/><figcaption><b>Nosso espaço</b><span>A identidade do CK em cada detalhe</span></figcaption></figure>
            <figure data-reveal><img src="/ck-editorial-sushi-900.jpg" srcSet="/ck-editorial-sushi-480.jpg 480w, /ck-editorial-sushi-900.jpg 900w" sizes="(max-width: 700px) 92vw, 45vw" alt="Sushi sob iluminação elegante" loading="lazy" decoding="async"/><figcaption><b>Atmosfera</b><span>Elegante, acolhedora e contemporânea</span></figcaption></figure>
          </div>
        </section>

        <section className="stats">
          <p className="eyebrow light"><i/> CK em poucas palavras</p>
          <h2 data-reveal>Uma noite que<br/>pede bis.</h2>
          <div className="statsGrid">
            <div data-reveal><strong>À vontade</strong><span>Rodízio completo</span></div>
            <div data-reveal><strong>Na hora</strong><span>Peças preparadas durante o serviço</span></div>
            <div data-reveal><strong>Premium</strong><span>Experiência e ambiente</span></div>
            <div data-reveal><strong>Votorantim</strong><span>Ao lado do Nova Esplanada</span></div>
          </div>
        </section>

        <section className="reviews" id="avaliacoes">
          <div className="reviewsHeading">
            <div><p className="eyebrow"><i/> Avaliações no Google</p><h2 data-reveal>Quem prova,<br/>quer voltar.</h2></div>
            <p>Experiências compartilhadas por clientes do CK Sushi.</p>
          </div>
          <div className="reviewGrid">
            {[
              ['Adriano Bastos','“Sem dúvida, um dos melhores restaurantes japoneses de Sorocaba. A qualidade dos pratos é excepcional, tudo muito fresco e bem apresentado.”','Jantar · R$ 140–160'],
              ['Júlia Arcuri Vecina','“Sem dúvidas um dos melhores — se não o melhor — restaurantes de culinária japonesa que já fui. Atendimento excepcional e qualidade ímpar. Voltarei.”','Refeição no local · R$ 160–180'],
              ['Henrique Rupp Pereira','“Inacreditável a experiência proposta, a qualidade dos produtos e o peixe fresco.”','Jantar · R$ 140–160'],
              ['LEONARDO NOGUEIRA','“A comida é muito saborosa e chega rápido. O lugar é muito limpo e bonito.”','Refeição no local'],
              ['Fábio Rodrigues','“Excelente local, comida saborosa e diferenciada!”','Avaliação recente'],
              ['luma b','“Comida maravilhosa e fresca, atendimento e espaço também excelentes. Com certeza voltarei mais vezes!”','Avaliação recente'],
            ].map(([name, quote, detail], i) => (
              <article data-reveal key={name} style={{transitionDelay:`${i * 80}ms`}}>
                <div className="googleRow"><span className="googleG">G</span><span className="stars" aria-label="Cinco estrelas">★★★★★</span></div>
                <blockquote>{quote}</blockquote>
                <footer><strong>{name}</strong><span>{detail}</span></footer>
              </article>
            ))}
          </div>
          <p className="reviewSource">Depoimentos enviados pelo estabelecimento a partir das avaliações publicadas no Google.</p>
        </section>

        <footer id="contato">
          <div className="footerCta">
            <div><p className="eyebrow light"><i/> Sua mesa espera</p><h2>PRONTO PARA<br/>VIVER O CK?</h2></div>
            <button className="pill lightPill" onClick={openReservation}>Reservar agora <Arrow/></button>
          </div>
          <div className="footerGrid">
            <div><a className="logo" href="#inicio" aria-label="CK Sushi"><img src="/ck-logo.png" alt="CK Sushi"/></a><p>Sabores japoneses, ingredientes frescos e uma experiência feita para repetir.</p></div>
            <div><small>VISITE</small><p>Av. Júlio Cassola, 1405<br/>Connect Two · Votorantim, SP</p></div>
            <div><small>FALE COM A GENTE</small><p><a href="tel:+5515991843232">(15) 99184-3232</a><br/><a href={WA}>WhatsApp</a></p></div>
            <div><small>NAVEGUE</small><p><a href="#rodizio">O rodízio</a><br/><a href="#experiencia">Experiência</a><br/><a href="#local">Localização</a></p></div>
          </div>
          <div className="footerBottom"><span>© 2026 CK Sushi. Todos os direitos reservados.</span><nav><a href="/privacidade">Privacidade</a><a href="/termos">Termos</a><button onClick={() => setCookiePolicy(true)}>Cookies</button><button onClick={() => setCookieSettings(true)}>Preferências</button><span>Votorantim · São Paulo</span></nav></div>
        </footer>
      </main>

      <div className={`menuOverlay ${menu ? 'open' : ''}`} aria-hidden={!menu}>
        <div className="overlayTop"><a className="logo" href="#inicio" aria-label="CK Sushi"><img src="/ck-logo.png" alt="CK Sushi"/></a><button className="close" onClick={() => setMenu(false)} aria-label="Fechar menu">×</button></div>
        <nav>{[['O rodízio','#rodizio'],['Experiência','#experiencia'],['Avaliações','#avaliacoes'],['Contato','#contato']].map(([label,href]) => <a key={href} href={href} onClick={() => setMenu(false)}>{label}</a>)}</nav>
        <div className="overlayBottom"><button className="pill lightPill" onClick={openReservation}>Reservar mesa <Arrow/></button><span>Votorantim · SP</span></div>
      </div>

      <div className={`modal ${modal ? 'open' : ''}`} aria-hidden={!modal}>
        <button className="modalBackdrop" onClick={() => setModal(false)} aria-label="Fechar reserva"/>
        <section role="dialog" aria-modal="true" aria-labelledby="reserve-title">
          <button className="modalClose" onClick={() => setModal(false)} aria-label="Fechar">×</button>
          {!sent ? <>
            <p className="eyebrow"><i/> Reservar mesa</p><h2 id="reserve-title">Sua noite<br/>começa aqui.</h2>
            <form onSubmit={submit} noValidate>
              <label>Seu nome<input name="name" placeholder="Como podemos te chamar?" aria-invalid={Boolean(formErrors.name)} aria-describedby="name-error" autoFocus/><span className="fieldError" id="name-error" role="alert">{formErrors.name}</span></label>
              <label>Seu telefone<input name="phone" type="tel" inputMode="tel" placeholder="(15) 99999-9999" aria-invalid={Boolean(formErrors.phone)} aria-describedby="phone-error"/><span className="fieldError" id="phone-error" role="alert">{formErrors.phone}</span></label>
              <div className="formField">
                <label id="date-label">Quando você gostaria de vir?</label>
                <input type="hidden" name="date" value={selectedDate}/>
                <button className={`dateTrigger ${calendarOpen ? 'open' : ''}`} type="button" onClick={() => setCalendarOpen((open) => !open)} aria-expanded={calendarOpen} aria-controls="reservation-calendar" aria-labelledby="date-label date-value" aria-describedby={formErrors.date ? 'date-error' : undefined}>
                  <span id="date-value" className={selectedDate ? '' : 'placeholder'}>{displayDate(selectedDate)}</span><span className="calendarIcon" aria-hidden="true">▦</span>
                </button>
                {calendarOpen && <div className="datePicker" id="reservation-calendar" role="dialog" aria-label="Escolher data da reserva">
                  <div className="datePickerHead">
                    <button type="button" onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex - 1, 1))} disabled={previousMonthUnavailable} aria-label="Mês anterior">‹</button>
                    <strong>{monthNames[calendarMonthIndex]} <span>{calendarYear}</span></strong>
                    <button type="button" onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex + 1, 1))} aria-label="Próximo mês">›</button>
                  </div>
                  <div className="weekDays" aria-hidden="true">{weekDays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
                  <div className="monthDays" role="grid">
                    {calendarDays.map((day, index) => {
                      if (!day) return <span className="emptyDay" key={`empty-${index}`}/>;
                      const value = localDateValue(new Date(calendarYear, calendarMonthIndex, day));
                      const unavailable = value < todayValue || new Date(calendarYear, calendarMonthIndex, day).getDay() === 1;
                      const selected = value === selectedDate;
                      const isToday = value === todayValue;
                      return <button type="button" role="gridcell" key={value} disabled={unavailable} className={`${selected ? 'selected' : ''} ${isToday ? 'today' : ''}`} aria-selected={selected} aria-label={`${day} de ${monthNames[calendarMonthIndex]} de ${calendarYear}${isToday ? ', hoje' : ''}${new Date(calendarYear, calendarMonthIndex, day).getDay() === 1 ? ', restaurante fechado' : ''}`} onClick={() => { setSelectedDate(value); setCalendarOpen(false); setFormErrors((errors) => ({ ...errors, date: '' })); }}>{day}</button>;
                    })}
                  </div>
                  <button className="calendarToday" type="button" disabled={new Date().getDay() === 1} onClick={() => { const today = new Date(); setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(localDateValue(today)); setCalendarOpen(false); setFormErrors((errors) => ({ ...errors, date: '' })); }}>{new Date().getDay() === 1 ? 'Fechado hoje' : 'Selecionar hoje'}</button>
                </div>}
                <span className="fieldError" id="date-error" role="alert">{formErrors.date}</span>
              </div>
              <label>Qual horário?<select className="formSelect" name="time" defaultValue="" aria-invalid={Boolean(formErrors.time)} aria-describedby="time-error"><option value="">Escolha um horário</option>{['18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00'].map((time) => <option key={time} value={time}>{time}</option>)}</select><span className="fieldError" id="time-error" role="alert">{formErrors.time}</span></label>
              <label>Quantas pessoas?<input name="people" type="number" min="1" max="30" placeholder="2" aria-invalid={Boolean(formErrors.people)} aria-describedby="people-error"/><span className="fieldError" id="people-error" role="alert">{formErrors.people}</span></label>
              <span className="submitError" role="alert">{formErrors.submit}</span>
              <button className="pill darkPill" type="submit" disabled={submitting}>{submitting ? 'Preparando reserva…' : 'Continuar reserva'} {!submitting && <Arrow/>}</button>
            </form>
            <p className="formNote">Ao continuar, você será direcionado ao WhatsApp do CK Sushi para confirmar a disponibilidade.</p>
          </> : <div className="success"><span>✓</span><h2>Quase lá!</h2><p>Seus dados foram organizados. Agora envie a mensagem no WhatsApp para confirmar a disponibilidade.</p><a className="pill darkPill" href={reservationLink} target="_blank" rel="noreferrer">Abrir WhatsApp <Arrow/></a><button className="editReservation" onClick={() => setSent(false)}>Alterar os dados</button></div>}
        </section>
      </div>

      <button className={`mobileReserve ${modal || menu || cookieNotice || cookieSettings || cookiePolicy ? 'hidden' : ''}`} onClick={openReservation} aria-label="Reservar uma mesa pelo WhatsApp">
        <span>Reservar mesa</span><small>via WhatsApp</small><Arrow/>
      </button>

      <aside className={`cookieBanner ${cookieNotice ? 'show' : ''}`} aria-label="Consentimento de cookies" aria-hidden={!cookieNotice}>
        <div>
          <strong>Sua privacidade importa.</strong>
          <p>Usamos armazenamento essencial para lembrar sua escolha. Cookies de análise e marketing só serão ativados com sua autorização.</p>
          <button className="policyLink" onClick={() => setCookiePolicy(true)}>Ler política de cookies</button>
        </div>
        <div className="cookieActions">
          <button className="cookieReject" onClick={() => saveCookies(false, false)}>Recusar opcionais</button>
          <button className="cookieCustomize" onClick={() => setCookieSettings(true)}>Personalizar</button>
          <button className="cookieAccept" onClick={() => saveCookies(true, true)}>Aceitar todos</button>
        </div>
      </aside>

      <div className={`cookieModal ${cookieSettings ? 'open' : ''}`} aria-hidden={!cookieSettings}>
        <button className="cookieBackdrop" onClick={() => setCookieSettings(false)} aria-label="Fechar preferências" />
        <section role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title">
          <button className="modalClose" onClick={() => setCookieSettings(false)} aria-label="Fechar">×</button>
          <p className="eyebrow"><i/> Privacidade</p>
          <h2 id="cookie-settings-title">Preferências<br/>de cookies.</h2>
          <div className="cookieOption"><div><strong>Essenciais</strong><p>Guardam sua escolha de privacidade e permitem o funcionamento básico do site.</p></div><span className="alwaysOn">Sempre ativos</span></div>
          <label className="cookieOption"><div><strong>Análise</strong><p>{analyticsConfigured ? 'Permitem medir visitas e desempenho por meio do Google Analytics, somente com sua autorização.' : 'Ajudam a entender visitas e desempenho. A integração está preparada, mas permanece inativa até a configuração do identificador oficial.'}</p></div><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} disabled={!analyticsConfigured} /></label>
          <label className="cookieOption"><div><strong>Marketing</strong><p>Permitem medir campanhas e personalizar anúncios. Nenhuma ferramenta de marketing está instalada neste momento.</p></div><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /></label>
          <button className="pill darkPill cookieSave" onClick={() => saveCookies(analytics, marketing)}>Salvar preferências</button>
        </section>
      </div>

      <div className={`cookieModal policyModal ${cookiePolicy ? 'open' : ''}`} aria-hidden={!cookiePolicy}>
        <button className="cookieBackdrop" onClick={() => setCookiePolicy(false)} aria-label="Fechar política" />
        <section role="dialog" aria-modal="true" aria-labelledby="cookie-policy-title">
          <button className="modalClose" onClick={() => setCookiePolicy(false)} aria-label="Fechar">×</button>
          <p className="eyebrow"><i/> Transparência</p>
          <h2 id="cookie-policy-title">Política<br/>de cookies.</h2>
          <p className="policyUpdated">Última atualização: 31 de agosto de 2026</p>
          <div className="policyCopy">
            <h3>1. O que são cookies?</h3><p>Cookies e tecnologias semelhantes são pequenos registros armazenados no dispositivo para permitir funções do site, lembrar preferências e, quando autorizados, medir audiência ou campanhas.</p>
            <h3>2. O que o CK Sushi utiliza hoje?</h3><p>Este site usa armazenamento local essencial para registrar sua escolha de privacidade por até 12 meses. O Google Analytics somente poderá ser carregado depois da configuração oficial e do seu consentimento. Não usamos publicidade ou perfilamento neste momento.</p>
            <h3>3. Categorias opcionais</h3><p>As categorias “Análise” e “Marketing” permanecem inativas sem a respectiva ferramenta e sem consentimento. Você pode recusar sem perder acesso ao site.</p>
            <h3>4. Reservas e WhatsApp</h3><p>Os dados da reserva não são armazenados por este site. Ao continuar, você escolhe abrir o WhatsApp com nome, telefone, data, horário e quantidade de pessoas; a partir daí, o tratamento também estará sujeito aos termos e políticas do WhatsApp/Meta.</p>
            <h3>5. Como mudar sua escolha</h3><p>Use “Preferências de cookies” no rodapé a qualquer momento. Uma nova escolha substitui a anterior. Você também pode apagar os dados do site nas configurações do navegador.</p>
            <h3>6. Controlador e direitos</h3><p>O CK Sushi é responsável pelas decisões sobre os dados tratados neste site. Para dúvidas, acesso, correção, eliminação ou revogação de consentimento, fale pelo WhatsApp <a href="tel:+5515991843232">(15) 99184-3232</a>.</p>
          </div>
          <button className="pill darkPill cookieSave" onClick={() => setCookiePolicy(false)}>Entendi</button>
        </section>
      </div>
    </>
  );
}
