'use client';
import { useState } from 'react';

export default function ShareButton({ title }: { title: string }) {
  const [msg, setMsg] = useState('');
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setMsg('Link copiado!');
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setMsg('Não foi possível compartilhar. Copie o endereço do navegador.');
    }
    setTimeout(() => setMsg(''), 3000);
  }
  return (
    <>
      <button type="button" className="btn btn-outline" onClick={share}>Compartilhar</button>
      <span role="status" className="muted" style={{ fontSize: '.85rem' }}>{msg}</span>
    </>
  );
}
