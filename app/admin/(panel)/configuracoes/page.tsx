import SettingsForm from '@/components/admin/SettingsForm';
import { getSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function Config() {
  const s = await getSettings();
  return (
    <>
      <h1 style={{ fontSize: '1.8rem' }}>Configurações da empresa</h1>
      <SettingsForm initial={s} />
    </>
  );
}
