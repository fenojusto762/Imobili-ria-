export default function CategoryIcon({ type }: { type: string }) {
  let d: JSX.Element;
  switch (type) {
    case 'casa':
      d = <path d="M6 24 24 8l18 16M11 21v19h26V21M20 40V29h8v11" />;
      break;
    case 'apartamento':
      d = <path d="M12 42V8h24v34M8 42h32M19 15h4M25 15h4M19 22h4M25 22h4M19 29h4M25 29h4M21 42v-6h6v6" />;
      break;
    case 'terreno':
      d = <path d="M24 7 43 18 24 29 5 18zM5 26 24 37 43 26M5 33 24 44 43 33" />;
      break;
    case 'sala_comercial':
      d = <path d="M8 42V14h20v28M28 22h12v20M4 42h40M14 21h8M14 28h8M14 35h8M33 29h2M33 36h2" />;
      break;
    default:
      d = <path d="M24 6 42 24 24 42 6 24zM24 16v16M16 24h16" />;
  }
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  );
}
