'use client';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function SignOut() {
  const router = useRouter();
  return (
    <button className="btn btn-light btn-sm" onClick={async () => { await supabaseBrowser().auth.signOut(); router.replace('/admin/login'); router.refresh(); }}>
      Sair
    </button>
  );
}
