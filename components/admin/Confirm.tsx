'use client';
export default function Confirm({ title, text, confirmLabel = 'Excluir', onConfirm, onCancel, busy }: {
  title: string; text: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void; busy?: boolean;
}) {
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="cf-t">
      <div>
        <h3 id="cf-t">{title}</h3>
        <p>{text}</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy} autoFocus>Cancelar</button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm} disabled={busy}>{busy ? 'Aguarde…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
