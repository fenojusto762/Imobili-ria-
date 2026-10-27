'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Settings } from '@/lib/types';

export default function Header({ s }: { s: Settings }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const parts = s.company_name.trim().split(/\s+/);
  const first = parts[0] || s.company_name;
  const rest = parts.slice(1).join(' ');

  return (
    <header className={`hdr${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap">
        <Link href="/" className="brand" onClick={close} aria-label={s.company_name}>
          {s.logo_url ? (
            <img src={s.logo_url} alt={s.company_name} />
          ) : (
            <span className="wm">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                <polygon points="17,2 31,10 31,24 17,32 3,24 3,10" fill="#0d2149" />
                <polygon points="17,2 31,10 17,18 3,10" fill="#b99a5b" />
                <polygon points="17,18 31,10 31,24 17,32" fill="#1c3a73" />
              </svg>
              <span>
                <b>{first}</b>
                {rest && <small>{rest}</small>}
              </span>
            </span>
          )}
        </Link>
        <button className="burger" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen(!open)}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            {open ? (<><line x1="5" y1="5" x2="17" y2="17" /><line x1="17" y1="5" x2="5" y2="17" /></>) : (<><line x1="3" y1="7" x2="19" y2="7" /><line x1="3" y1="15" x2="19" y2="15" /></>)}
          </svg>
        </button>
        <nav id="menu" className={`nav${open ? ' open' : ''}`} aria-label="Principal">
          <Link href="/" onClick={close}>Início</Link>
          <Link href="/imoveis" onClick={close}>Imóveis</Link>
          <Link href="/imoveis?finalidade=venda" onClick={close}>Comprar</Link>
          <Link href="/imoveis?finalidade=aluguel" onClick={close}>Alugar</Link>
          <Link href="/anuncie" onClick={close}>Anuncie seu imóvel</Link>
          <Link href="/sobre" onClick={close}>Sobre</Link>
          <Link href="/contato" className="btn btn-primary btn-sm" onClick={close}>Contato</Link>
        </nav>
      </div>
    </header>
  );
}
