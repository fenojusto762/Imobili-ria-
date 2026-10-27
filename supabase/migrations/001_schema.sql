-- Conceito Soluções Imobiliárias — schema, RLS, storage e funções
-- Execute no Supabase: SQL Editor > New query > cole tudo > Run.

create extension if not exists unaccent with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- ============ ADMINS ============
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Cada usuário só enxerga a própria linha; ninguém altera admins pela API.
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins for select to authenticated
  using (user_id = auth.uid());
revoke all on public.admins from anon;
revoke insert, update, delete on public.admins from authenticated;

-- ============ IMÓVEIS ============
create sequence if not exists public.property_code_seq start 1;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('CS-' || lpad(nextval('public.property_code_seq')::text, 5, '0')),
  slug text not null unique,
  title text not null check (char_length(title) between 3 and 160),
  description text,
  type text not null check (type in ('casa','apartamento','terreno','sala_comercial','outros')),
  purpose text not null check (purpose in ('venda','aluguel','ambas')),
  sale_price numeric(14,2) check (sale_price is null or sale_price >= 0),
  rent_price numeric(14,2) check (rent_price is null or rent_price >= 0),
  condo_fee numeric(12,2) check (condo_fee is null or condo_fee >= 0),
  iptu numeric(12,2) check (iptu is null or iptu >= 0),
  address text,
  show_address boolean not null default false,
  neighborhood text,
  city text,
  state text check (state is null or char_length(state) = 2),
  total_area numeric(12,2) check (total_area is null or total_area >= 0),
  built_area numeric(12,2) check (built_area is null or built_area >= 0),
  bedrooms int check (bedrooms is null or bedrooms >= 0),
  suites int check (suites is null or suites >= 0),
  bathrooms int check (bathrooms is null or bathrooms >= 0),
  parking int check (parking is null or parking >= 0),
  features text[] not null default '{}',
  status text not null default 'disponivel' check (status in ('disponivel','reservado','vendido','alugado')),
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  -- dados privados (nunca expostos ao público)
  owner_name text,
  owner_phone text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint price_required_when_published check (
    not published
    or (purpose = 'venda' and sale_price > 0)
    or (purpose = 'aluguel' and rent_price > 0)
    or (purpose = 'ambas' and sale_price > 0 and rent_price > 0)
  )
);

create index if not exists properties_pub_idx on public.properties (published, featured, published_at desc);
create index if not exists properties_city_idx on public.properties (lower(city));
create index if not exists properties_neigh_idx on public.properties (lower(neighborhood));
create index if not exists properties_type_idx on public.properties (type);
create index if not exists properties_purpose_idx on public.properties (purpose);
create index if not exists properties_sale_idx on public.properties (sale_price);
create index if not exists properties_rent_idx on public.properties (rent_price);

create or replace function public.properties_before_write()
returns trigger language plpgsql
set search_path = public, extensions as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := trim(both '-' from regexp_replace(lower(unaccent(new.title)), '[^a-z0-9]+', '-', 'g'))
                || '-' || lower(new.code);
  end if;
  new.updated_at := now();
  if new.published and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;

drop trigger if exists properties_before_write on public.properties;
create trigger properties_before_write before insert or update on public.properties
  for each row execute function public.properties_before_write();

alter table public.properties enable row level security;
revoke all on public.properties from anon;
drop policy if exists properties_admin_all on public.properties;
create policy properties_admin_all on public.properties for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============ FOTOS ============
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  path text not null,
  alt text,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists property_images_prop_idx on public.property_images (property_id, position);
alter table public.property_images enable row level security;

create or replace function public.is_published(pid uuid)
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (select 1 from public.properties where id = pid and published);
$$;
revoke all on function public.is_published(uuid) from public;
grant execute on function public.is_published(uuid) to anon, authenticated;

drop policy if exists images_public_read on public.property_images;
create policy images_public_read on public.property_images for select to anon, authenticated
  using (public.is_published(property_id) or public.is_admin());
drop policy if exists images_admin_write on public.property_images;
create policy images_admin_write on public.property_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
revoke insert, update, delete on public.property_images from anon;

-- ============ VIEW PÚBLICA (sem dados privados; endereço só se autorizado) ============
create or replace view public.public_properties as
select
  p.id, p.code, p.slug, p.title, p.description, p.type, p.purpose,
  p.sale_price, p.rent_price, p.condo_fee, p.iptu,
  case when p.show_address then p.address else null end as address,
  p.neighborhood, p.city, p.state,
  p.total_area, p.built_area, p.bedrooms, p.suites, p.bathrooms, p.parking,
  p.features, p.status, p.featured, p.published_at, p.created_at,
  (select i.path from public.property_images i where i.property_id = p.id order by i.position, i.created_at limit 1) as cover_path
from public.properties p
where p.published = true;
grant select on public.public_properties to anon, authenticated;

-- ============ CONFIGURAÇÕES DA EMPRESA (linha única) ============
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null default 'Conceito Soluções Imobiliárias',
  tagline text,
  description text,
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  logo_url text,
  about_title text,
  about_text text,
  about_image_url text,
  owner_cta_title text,
  owner_cta_text text,
  whatsapp text,
  phone text,
  email text,
  address text,
  cities text,
  hours text,
  instagram text,
  facebook text,
  youtube text,
  linkedin text,
  creci text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict do nothing;
alter table public.site_settings enable row level security;
drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings for select to anon, authenticated using (true);
drop policy if exists settings_admin_write on public.site_settings;
create policy settings_admin_write on public.site_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
revoke insert, update, delete on public.site_settings from anon;

-- ============ CONTATOS ============
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('comprar','alugar','anunciar','geral')),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 10 and 15),
  email text check (email is null or char_length(email) <= 160),
  subject text check (subject is null or char_length(subject) <= 160),
  message text check (message is null or char_length(message) <= 3000),
  property_id uuid references public.properties(id) on delete set null,
  property_code text,
  consent boolean not null default false check (consent = true),
  status text not null default 'novo' check (status in ('novo','em_atendimento','concluido','spam')),
  idempotency_key text unique,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists contacts_created_idx on public.contacts (created_at desc);
create index if not exists contacts_ip_idx on public.contacts (ip_hash, created_at desc);
alter table public.contacts enable row level security;
revoke all on public.contacts from anon;
drop policy if exists contacts_admin_all on public.contacts;
create policy contacts_admin_all on public.contacts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Envio público apenas via função (validação + limite por IP + idempotência).
create or replace function public.submit_contact(
  p_kind text, p_name text, p_phone text, p_email text, p_subject text,
  p_message text, p_property_id uuid, p_consent boolean, p_key text, p_ip_hash text
) returns jsonb language plpgsql security definer
set search_path = public as $$
declare
  v_code text;
  v_recent int;
  v_id uuid;
begin
  if p_consent is not true then raise exception 'consent_required'; end if;
  if p_kind not in ('comprar','alugar','anunciar','geral') then raise exception 'invalid_kind'; end if;
  if char_length(coalesce(p_name,'')) < 2 or char_length(p_name) > 120 then raise exception 'invalid_name'; end if;
  if p_phone !~ '^[0-9]{10,15}$' then raise exception 'invalid_phone'; end if;
  if p_email is not null and p_email <> '' and p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_email'; end if;
  if char_length(coalesce(p_message,'')) > 3000 then raise exception 'invalid_message'; end if;

  if p_key is not null and exists (select 1 from contacts where idempotency_key = p_key) then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;

  if p_ip_hash is not null then
    select count(*) into v_recent from contacts
      where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
    if v_recent >= 5 then raise exception 'rate_limited'; end if;
  end if;

  if p_property_id is not null then
    select code into v_code from properties where id = p_property_id and published;
    if v_code is null then p_property_id := null; end if;
  end if;

  insert into contacts (kind, name, phone, email, subject, message, property_id, property_code, consent, idempotency_key, ip_hash)
  values (p_kind, trim(p_name), p_phone, nullif(trim(coalesce(p_email,'')), ''), nullif(trim(coalesce(p_subject,'')), ''),
          nullif(trim(coalesce(p_message,'')), ''), p_property_id, v_code, true, p_key, p_ip_hash)
  on conflict (idempotency_key) do nothing
  returning id into v_id;

  return jsonb_build_object('ok', true, 'duplicate', v_id is null);
end $$;
revoke all on function public.submit_contact(text,text,text,text,text,text,uuid,boolean,text,text) from public;
grant execute on function public.submit_contact(text,text,text,text,text,text,uuid,boolean,text,text) to anon, authenticated;

-- ============ STORAGE (bucket público para leitura; escrita só admin) ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
-- Leitura pública dos arquivos do bucket 'media' é feita pela URL pública do bucket.
