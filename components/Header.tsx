'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Settings } from '@/lib/types';

export default function Header({ s }: { s: Settings }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="hdr">
      <div className="wrap">
        <Link href="/" className="brand" onClick={close}>
          {s.logo_url ? <img src={s.logo_url} alt={s.company_name} /> : <span>{s.company_name}</span>}
        </Link>
        <button className="burger" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
          {open ? 'Fechar' : 'Menu'}
        </button>
        <nav id="menu" className={`nav${open ? ' open' : ''}`} aria-label="Principal">
          <Link href="/" onClick={close}>Início</Link>
          <Link href="/imoveis" onClick={close}>Imóveis</Link>
          <Link href="/imoveis?finalidade=venda" onClick={close}>Comprar</Link>
          <Link href="/imoveis?finalidade=aluguel" onClick={close}>Alugar</Link>
          <Link href="/anuncie" onClick={close}>Anuncie seu imóvel</Link>
          <Link href="/sobre" onClick={close}>Sobre</Link>
          <Link href="/contato" className="btn btn-gold btn-sm" onClick={close}>Contato</Link>
        </nav>
      </div>
    </header>
  );
}
