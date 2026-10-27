import PropertyForm, { emptyProperty } from '@/components/admin/PropertyForm';

export default function Novo() {
  return (
    <>
      <h1 style={{ fontSize: '1.8rem' }}>Novo imóvel</h1>
      <PropertyForm initial={emptyProperty} />
    </>
  );
}
