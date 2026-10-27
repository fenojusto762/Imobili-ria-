'use client';
import { useState } from 'react';

export default function Gallery({ urls, title }: { urls: string[]; title: string }) {
  const [i, setI] = useState(0);
  if (!urls.length) return <div className="gal"><div className="main"><div className="noimg" style={{ color: '#9fb0d0' }}>Sem fotografias</div></div></div>;
  const go = (d: number) => setI((i + d + urls.length) % urls.length);
  return (
    <div onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); }}>
      <div className="gal" role="group" aria-roledescription="carrossel" aria-label={`Fotografias de ${title}`}>
        <div className="main"><img src={urls[i]} alt={`${title} — foto ${i + 1} de ${urls.length}`} /></div>
        {urls.length > 1 && (
          <>
            <button className="nv prev" onClick={() => go(-1)} aria-label="Foto anterior">‹</button>
            <button className="nv next" onClick={() => go(1)} aria-label="Próxima foto">›</button>
          </>
        )}
      </div>
      {urls.length > 1 && (
        <div className="thumbs">
          {urls.map((u, n) => (
            <button key={u} onClick={() => setI(n)} aria-current={n === i} aria-label={`Ver foto ${n + 1}`}>
              <img src={u} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
