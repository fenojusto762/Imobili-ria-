import { TYPES, type Purpose } from '@/lib/types';
import type { Filters } from '@/lib/data';

/** Formulário GET: funciona sem JavaScript e gera URLs compartilháveis. */
export default function SearchForm({ v = {}, compact = false, action = '/imoveis' }: { v?: Filters; compact?: boolean; action?: string }) {
  return (
    <form action={action} method="get" className={compact ? 'filters' : 'search'} role="search" aria-label="Buscar imóveis">
      <div>
        <label htmlFor="f-fin">Finalidade</label>
        <select id="f-fin" name="finalidade" defaultValue={v.finalidade ?? ''}>
          <option value="">Venda ou aluguel</option>
          <option value="venda">Comprar</option>
          <option value="aluguel">Alugar</option>
        </select>
      </div>
      <div>
        <label htmlFor="f-tipo">Tipo</label>
        <select id="f-tipo" name="tipo" defaultValue={v.tipo ?? ''}>
          <option value="">Todos os tipos</option>
          {Object.entries(TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-q">Localização ou palavra-chave</label>
        <input id="f-q" name="q" type="search" placeholder="Bairro, cidade ou código" defaultValue={v.q ?? ''} />
      </div>
      <div>
        <label htmlFor="f-min">Preço mínimo (R$)</label>
        <input id="f-min" name="min" type="number" min={0} inputMode="numeric" defaultValue={v.min ?? ''} />
      </div>
      <div>
        <label htmlFor="f-max">Preço máximo (R$)</label>
        <input id="f-max" name="max" type="number" min={0} inputMode="numeric" defaultValue={v.max ?? ''} />
      </div>
      {compact && (
        <>
          <div>
            <label htmlFor="f-qt">Quartos (mín.)</label>
            <select id="f-qt" name="quartos" defaultValue={v.quartos ?? ''}>
              <option value="">Qualquer</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-bn">Banheiros (mín.)</label>
            <select id="f-bn" name="banheiros" defaultValue={v.banheiros ?? ''}>
              <option value="">Qualquer</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-vg">Vagas (mín.)</label>
            <select id="f-vg" name="vagas" defaultValue={v.vagas ?? ''}>
              <option value="">Qualquer</option>{[1, 2, 3].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-or">Ordenar por</label>
            <select id="f-or" name="ordem" defaultValue={v.ordem ?? ''}>
              <option value="">Mais recentes</option>
              <option value="antigos">Mais antigos</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </div>
        </>
      )}
      <button type="submit" className="btn btn-primary">Buscar</button>
    </form>
  );
}
