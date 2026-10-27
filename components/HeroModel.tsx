'use client';
import { useRef } from 'react';

// Projeção isométrica: x e y no piso, z para cima.
const S = 34;
type P = [number, number, number];
const pr = (x: number, y: number, z: number) => `${(x - y) * 0.866 * S},${(x + y) * 0.5 * S - z * S}`;
const poly = (pts: P[]) => pts.map((p) => pr(p[0], p[1], p[2])).join(' ');

function Box({ x, y, w, d, h, rows = 0, delay = 0, k = '', lit = [] as number[] }: {
  x: number; y: number; w: number; d: number; h: number; rows?: number; delay?: number; k?: '' | '2' | 'p'; lit?: number[];
}) {
  const f = k === 'p'
    ? { l: 'rgba(255,255,255,.10)', r: 'rgba(255,255,255,.05)', t: 'rgba(255,255,255,.15)' }
    : { l: `url(#gl${k})`, r: `url(#gr${k})`, t: `url(#gt${k})` };
  const wins: JSX.Element[] = [];
  for (let i = 0; i < rows; i++) {
    const z0 = ((i + 0.3) * h) / rows;
    const z1 = z0 + (0.4 * h) / rows;
    const cls = lit.indexOf(i) >= 0 ? 'win-g' : 'win-l';
    wins.push(<polygon key={`l${i}`} className={cls} points={poly([[x + 0.25, y + d, z0], [x + w - 0.25, y + d, z0], [x + w - 0.25, y + d, z1], [x + 0.25, y + d, z1]])} />);
    wins.push(<polygon key={`r${i}`} className="win-r" points={poly([[x + w, y + 0.25, z0], [x + w, y + d - 0.25, z0], [x + w, y + d - 0.25, z1], [x + w, y + 0.25, z1]])} />);
  }
  return (
    <g className="blk" style={{ animationDelay: `${delay}ms` }}>
      <polygon points={poly([[x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]])} fill={f.l} />
      <polygon points={poly([[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h]])} fill={f.r} />
      <polygon points={poly([[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]])} fill={f.t} />
      {wins}
    </g>
  );
}

export default function HeroModel() {
  const ref = useRef<HTMLDivElement>(null);

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${(px * 12).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-py * 9).toFixed(2)}deg`);
  }
  function leave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--rx', '0deg');
  }

  return (
    <div className="model" ref={ref} onPointerMove={move} onPointerLeave={leave} aria-hidden="true">
      <svg viewBox="-300 -320 600 610" role="presentation" focusable="false">
        <defs>
          <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a78c8" /><stop offset="1" stopColor="#1f3f7c" /></linearGradient>
          <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#274b8c" /><stop offset="1" stopColor="#0b1d42" /></linearGradient>
          <linearGradient id="gt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a9c4f0" /><stop offset="1" stopColor="#6f95d6" /></linearGradient>
          <linearGradient id="gl2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ead9ab" /><stop offset="1" stopColor="#b99a5b" /></linearGradient>
          <linearGradient id="gr2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b99a5b" /><stop offset="1" stopColor="#7d6232" /></linearGradient>
          <linearGradient id="gt2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f7edcf" /><stop offset="1" stopColor="#e0c887" /></linearGradient>
        </defs>
        <Box x={-2} y={-1} w={10} d={8.5} h={0.3} k="p" delay={0} />
        <Box x={1} y={1} w={2.2} d={2.2} h={9} rows={9} delay={180} lit={[2, 5]} />
        <Box x={-1.2} y={3.5} w={3.5} d={2.2} h={3} rows={3} delay={340} lit={[1]} />
        <Box x={4} y={0} w={2.6} d={3} h={5} rows={5} delay={500} lit={[3]} />
        <Box x={4.2} y={4} w={2} d={2} h={1.8} rows={2} delay={700} k="2" lit={[0, 1]} />
      </svg>
    </div>
  );
}
