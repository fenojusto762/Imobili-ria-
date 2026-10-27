import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h1>Página não encontrada</h1>
      <p className="muted">O endereço pode estar incorreto ou o imóvel não está mais disponível.</p>
      <p><Link className="btn btn-primary" href="/imoveis">Ver imóveis</Link></p>
    </div>
  );
}
