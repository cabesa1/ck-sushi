'use client';

import { useMemo, useState } from 'react';
import styles from './admin.module.css';

type Status = 'Nova' | 'Confirmada' | 'Concluída' | 'Cancelada';
type Reservation = { id: number; day: number; time: string; name: string; phone: string; people: number; status: Status; lastVisit: number | null; visits: number };

const seed: Reservation[] = [
  { id: 1, day: 0, time: '19:00', name: 'Marina Oliveira', phone: '(15) 99742-1830', people: 4, status: 'Confirmada', lastVisit: 18, visits: 5 },
  { id: 2, day: 0, time: '19:30', name: 'Bruno Almeida', phone: '(15) 98810-2274', people: 2, status: 'Nova', lastVisit: null, visits: 0 },
  { id: 3, day: 0, time: '20:00', name: 'Carolina Mendes', phone: '(15) 99661-4082', people: 6, status: 'Confirmada', lastVisit: 74, visits: 2 },
  { id: 4, day: 0, time: '21:00', name: 'Rafael Martins', phone: '(15) 99105-7731', people: 3, status: 'Nova', lastVisit: 211, visits: 3 },
  { id: 5, day: 1, time: '19:30', name: 'Fernanda Souza', phone: '(15) 99624-1168', people: 5, status: 'Confirmada', lastVisit: 32, visits: 4 },
  { id: 6, day: 2, time: '20:30', name: 'Lucas Ribeiro', phone: '(15) 98140-5520', people: 2, status: 'Nova', lastVisit: 126, visits: 1 },
  { id: 7, day: 3, time: '20:00', name: 'Beatriz Nunes', phone: '(15) 99791-6432', people: 8, status: 'Confirmada', lastVisit: 9, visits: 7 },
];

const week = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function offsetDate(offset: number) { const date = new Date(); date.setDate(date.getDate() + offset); return date; }
function returnLabel(days: number | null) {
  if (days === null) return 'Primeira visita';
  if (days === 0) return 'Visitou hoje';
  if (days === 1) return 'Há 1 dia';
  if (days < 30) return `Há ${days} dias`;
  if (days < 365) return `Há ${Math.floor(days / 30)} meses`;
  return `Há ${Math.floor(days / 365)} ano${days >= 730 ? 's' : ''}`;
}

function ReservationRow({ item, onStatus }: { item: Reservation; onStatus: (id: number, status: Status) => void }) {
  return <article className={styles.row}>
    <time>{item.time}</time>
    <div className={styles.client}><i>{item.name.split(' ').map((part) => part[0]).slice(0,2).join('')}</i><div><b>{item.name}</b><small>{item.phone} · {item.visits} visita{item.visits === 1 ? '' : 's'}</small></div></div>
    <div className={`${styles.lastVisit} ${(item.lastVisit ?? 0) >= 90 ? styles.inactive : ''}`}><b>{returnLabel(item.lastVisit)}</b><small>{(item.lastVisit ?? 0) >= 90 ? 'Reativar cliente' : 'Cliente recente'}</small></div>
    <strong>{item.people}<small> pessoas</small></strong>
    <select value={item.status} onChange={(event) => onStatus(item.id, event.target.value as Status)} data-status={item.status}><option>Nova</option><option>Confirmada</option><option>Concluída</option><option>Cancelada</option></select>
    <a href={`https://wa.me/55${item.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">WhatsApp</a>
  </article>;
}

function Empty() {
  return <div className={styles.empty}><b>Nenhuma reserva encontrada</b><span>Este dia está livre ou a busca não encontrou clientes.</span></div>;
}

function AvailabilityCard({ people, capacity, setCapacity, isBlocked, weeklyClosed, onToggle }: { people: number; capacity: number; setCapacity: (value: number) => void; isBlocked: boolean; weeklyClosed: boolean; onToggle: () => void }) {
  return <aside className={styles.availability}>
    <small>CONTROLE DO DIA</small><h2>Disponibilidade</h2>
    <div className={styles.ring} style={{'--fill': `${Math.min(100, people / capacity * 100)}%`} as React.CSSProperties}><span><b>{people}</b>de {capacity}</span></div>
    <label>Capacidade máxima<div><button onClick={() => setCapacity(Math.max(1, capacity - 1))}>−</button><input type="number" value={capacity} min="1" onChange={(event) => setCapacity(Math.max(1, Number(event.target.value)))}/><button onClick={() => setCapacity(capacity + 1)}>＋</button></div></label>
    <button className={isBlocked ? styles.release : styles.block} onClick={onToggle} disabled={weeklyClosed}>{weeklyClosed ? 'Fechado toda segunda-feira' : isBlocked ? 'Liberar esta data' : 'Bloquear esta data'}</button>
    <p>O bloqueio será refletido no calendário público quando conectarmos o banco de dados.</p>
  </aside>;
}

export default function AdminPage() {
  const [section, setSection] = useState('Visão geral');
  const [day, setDay] = useState(0);
  const [reservations, setReservations] = useState(seed);
  const [capacity, setCapacity] = useState(42);
  const [blocked, setBlocked] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [closedSlots, setClosedSlots] = useState<string[]>(['18:30']);
  const dates = useMemo(() => Array.from({ length: 7 }, (_, index) => offsetDate(index)), []);
  const date = dates[day];
  const current = reservations.filter((item) => item.day === day && item.status !== 'Cancelada');
  const visible = current.filter((item) => `${item.name} ${item.phone}`.toLowerCase().includes(search.toLowerCase()));
  const people = current.reduce((sum, item) => sum + item.people, 0);
  const inactive = reservations.filter((item) => (item.lastVisit ?? 0) >= 90).length;
  const weeklyClosed = date.getDay() === 1;
  const isBlocked = weeklyClosed || blocked.includes(day);
  function notify(text: string) { setToast(text); window.setTimeout(() => setToast(''), 2200); }
  function setStatus(id: number, status: Status) { setReservations((items) => items.map((item) => item.id === id ? { ...item, status } : item)); notify(`Reserva marcada como ${status.toLowerCase()}.`); }

  return <main className={styles.shell}>
    <aside className={styles.sidebar}>
      <a className={styles.brand} href="/"><span>CK</span><div><b>CK SUSHI</b><small>GESTÃO</small></div></a>
      <nav>{[['Visão geral','⌂'],['Agenda','▦'],['Reservas','◎'],['Clientes','♙'],['Disponibilidade','◷']].map(([name, icon]) => <button key={name} className={section === name ? styles.active : ''} onClick={() => setSection(name)}><i>{icon}</i><span>{name}</span></button>)}</nav>
      <div className={styles.profile}><span>CS</span><div><b>Equipe CK Sushi</b><small>Administrador</small></div></div>
    </aside>

    <section className={styles.content}>
      <header className={styles.topbar}><div><p>CK SUSHI · VOTORANTIM</p><h1>{section}</h1></div><div><span>Modo demonstração</span><button onClick={() => notify('O cadastro será conectado ao banco de dados.')}>＋ Nova reserva</button></div></header>

      {(section === 'Visão geral' || section === 'Agenda' || section === 'Disponibilidade') && <section className={styles.weekbar}><div><small>AGENDA DA SEMANA</small><b>{months[date.getMonth()]} de {date.getFullYear()}</b></div><nav>{dates.map((item, index) => { const count = reservations.filter((r) => r.day === index && r.status !== 'Cancelada').length; const closed = item.getDay() === 1 || blocked.includes(index); return <button key={item.toISOString()} onClick={() => setDay(index)} className={`${day === index ? styles.dayActive : ''} ${closed ? styles.dayBlocked : ''}`}><small>{index === 0 ? 'HOJE' : week[item.getDay()]}</small><b>{item.getDate()}</b><span>{item.getDay() === 1 ? 'Fechado' : `${count} reserva${count === 1 ? '' : 's'}`}</span></button>; })}</nav></section>}

      {section === 'Visão geral' && <>
        <section className={styles.stats}>
          <article><i>◎</i><div><small>RESERVAS DO DIA</small><b>{current.length}</b><span>{current.filter((r) => r.status === 'Confirmada').length} confirmadas</span></div></article>
          <article><i>♙</i><div><small>PESSOAS ESPERADAS</small><b>{people}</b><span>de {capacity} lugares</span></div></article>
          <article><i>◷</i><div><small>CLIENTES INATIVOS</small><b>{inactive}</b><span>há mais de 90 dias</span></div></article>
          <article><i>{isBlocked ? '×' : '✓'}</i><div><small>DISPONIBILIDADE</small><b>{isBlocked ? 'Fechado' : `${Math.max(capacity - people, 0)} vagas`}</b><span>{isBlocked ? 'data bloqueada' : 'restantes'}</span></div></article>
        </section>
        <div className={styles.grid}>
          <section className={styles.panel}>
            <header><div><small>{week[date.getDay()]}, {date.getDate()} DE {months[date.getMonth()].toUpperCase()}</small><h2>Reservas do dia</h2></div><label>⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente"/></label></header>
            <div className={styles.head}><span>Horário</span><span>Cliente</span><span>Última visita</span><span>Pessoas</span><span>Status</span><span>Contato</span></div>
            <div>{visible.length ? visible.map((item) => <ReservationRow key={item.id} item={item} onStatus={setStatus}/>) : <Empty/>}</div>
          </section>
          <AvailabilityCard people={people} capacity={capacity} setCapacity={setCapacity} isBlocked={isBlocked} weeklyClosed={weeklyClosed} onToggle={() => { if (weeklyClosed) return; setBlocked((days) => isBlocked ? days.filter((item) => item !== day) : [...days, day]); notify(isBlocked ? 'Data liberada.' : 'Data bloqueada.'); }}/>
        </div>
      </>}

      {section === 'Agenda' && <section className={styles.fullPanel}>
        <header className={styles.sectionHead}><div><small>VISÃO POR HORÁRIO</small><h2>Agenda de {date.getDate()} de {months[date.getMonth()]}</h2></div><span>{weeklyClosed ? 'Fechado toda segunda' : isBlocked ? 'Data bloqueada' : 'Recebendo reservas'}</span></header>
        <div className={styles.timeline}>{['18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00'].map((time) => { const bookings = current.filter((item) => item.time === time); const closed = closedSlots.includes(time); return <article key={time} className={closed ? styles.slotClosed : ''}><time>{time}</time><div>{bookings.length ? bookings.map((item) => <span key={item.id}><b>{item.name}</b><small>{item.people} pessoas · {item.status}</small></span>) : <span><b>{closed ? 'Horário indisponível' : 'Horário livre'}</b><small>{closed ? 'Bloqueado pela equipe' : `${Math.max(capacity - people, 0)} vagas no dia`}</small></span>}</div><button onClick={() => { setClosedSlots((slots) => closed ? slots.filter((slot) => slot !== time) : [...slots, time]); notify(closed ? 'Horário liberado.' : 'Horário bloqueado.'); }}>{closed ? 'Liberar' : 'Bloquear'}</button></article>; })}</div>
      </section>}

      {section === 'Reservas' && <section className={styles.fullPanel}>
        <header className={styles.sectionHead}><div><small>TODAS AS SOLICITAÇÕES</small><h2>Gestão de reservas</h2></div><label className={styles.globalSearch}>⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou telefone"/></label></header>
        <div className={styles.head}><span>Horário</span><span>Cliente</span><span>Última visita</span><span>Pessoas</span><span>Status</span><span>Contato</span></div>
        <div>{reservations.filter((item) => `${item.name} ${item.phone}`.toLowerCase().includes(search.toLowerCase())).map((item) => <div key={item.id} className={styles.reservationWithDate}><span>{item.day === 0 ? 'Hoje' : `${week[dates[item.day].getDay()]} ${dates[item.day].getDate()}`}</span><ReservationRow item={item} onStatus={setStatus}/></div>)}</div>
      </section>}

      {section === 'Clientes' && <section className={styles.fullPanel}>
        <header className={styles.sectionHead}><div><small>RELACIONAMENTO</small><h2>Histórico de clientes</h2></div><label className={styles.globalSearch}>⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente"/></label></header>
        <div className={styles.clientGrid}>{reservations.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).sort((a,b) => (b.lastVisit ?? -1) - (a.lastVisit ?? -1)).map((item) => <article key={item.id} className={(item.lastVisit ?? 0) >= 90 ? styles.inactiveCard : ''}><div className={styles.clientAvatar}>{item.name.split(' ').map((part) => part[0]).slice(0,2).join('')}</div><div><h3>{item.name}</h3><p>{item.phone}</p></div><dl><div><dt>Visitas</dt><dd>{item.visits}</dd></div><div><dt>Última visita</dt><dd>{returnLabel(item.lastVisit)}</dd></div></dl><a href={`https://wa.me/55${item.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">{(item.lastVisit ?? 0) >= 90 ? 'Reativar pelo WhatsApp' : 'Conversar no WhatsApp'}</a></article>)}</div>
      </section>}

      {section === 'Disponibilidade' && <section className={styles.fullPanel}>
        <header className={styles.sectionHead}><div><small>REGRAS DA SEMANA</small><h2>Capacidade e bloqueios</h2></div><span>{capacity} lugares por dia</span></header>
        <div className={styles.availabilityGrid}>{dates.map((item, index) => { const booked = reservations.filter((r) => r.day === index && r.status !== 'Cancelada').reduce((sum, r) => sum + r.people, 0); const monday = item.getDay() === 1; const closed = monday || blocked.includes(index); return <article key={item.toISOString()} className={closed ? styles.closedDate : ''}><small>{week[item.getDay()]}</small><h3>{item.getDate()} de {months[item.getMonth()]}</h3><strong>{closed ? 'Fechado' : `${Math.max(capacity - booked, 0)} vagas`}</strong><p>{monday ? 'Fechamento semanal' : `${booked} pessoas reservadas`}</p><button disabled={monday} onClick={() => { setBlocked((days) => closed ? days.filter((value) => value !== index) : [...days, index]); notify(closed ? 'Data liberada.' : 'Data bloqueada.'); }}>{monday ? 'Fechado toda segunda' : closed ? 'Liberar data' : 'Bloquear data'}</button></article>; })}</div>
        <div className={styles.capacityWide}><div><small>CAPACIDADE PADRÃO</small><h3>Lugares disponíveis por dia</h3></div><div><button onClick={() => setCapacity(Math.max(1, capacity - 1))}>−</button><b>{capacity}</b><button onClick={() => setCapacity(capacity + 1)}>＋</button></div></div>
      </section>}
    </section>
    {toast && <div className={styles.toast}>✓ {toast}</div>}
  </main>;
}
