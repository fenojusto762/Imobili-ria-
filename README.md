# Conceito Soluções Imobiliárias — site + painel administrativo

Next.js 14 (App Router) + Supabase (PostgreSQL, Auth, Storage). Sem dados de exemplo: tudo vem do banco.

## 1. Supabase

1. Crie um projeto em supabase.com.
2. **SQL Editor** → cole todo o conteúdo de `supabase/migrations/001_schema.sql` → **Run**. Cria tabelas, índices, RLS, função de envio de contatos, view pública e o bucket `media`.
3. **Authentication → Providers → Email**: mantenha e-mail/senha; desative **"Allow new users to sign up"** (Authentication → Sign In / Providers) para que ninguém crie conta.
4. **Authentication → Users → Add user**: crie o administrador (e-mail + senha forte, mín. 10 caracteres).
5. Torne-o administrador (SQL Editor), trocando o e-mail:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'SEU-EMAIL@dominio.com';
   ```
6. **Authentication → URL Configuration**: defina *Site URL* com o domínio final e adicione `https://SEU-DOMINIO/admin/redefinir` em *Redirect URLs* (necessário para "Esqueci minha senha"). Configure um SMTP próprio para e-mails em produção.
7. **Project Settings → API**: copie *Project URL* e a chave **anon/public**. Nunca use a `service_role`.

## 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` (local) ou cadastre no provedor (Vercel etc.):

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave pública (anon) |
| `NEXT_PUBLIC_SITE_URL` | domínio final (canonical, sitemap) |
| `IP_HASH_SALT` | texto aleatório longo (anti-spam, só servidor) |

## 3. Rodar / publicar

```bash
npm install
npm run typecheck
npm run dev      # http://localhost:3000
npm run build && npm start
```
Publicação: Vercel (importe o repositório, configure as variáveis e o domínio).

## 4. Primeiro uso

Acesse `/admin/login` → **Configurações**: preencha nome, WhatsApp (formato `5511999998888`), telefone, e-mail, endereço, redes, CRECI, logotipo e banner. Informações não preenchidas ficam ocultas no site. Depois cadastre imóveis em **Novo imóvel**, envie fotos e marque **Publicar no site**.

## Segurança (resumo)

- RLS em todas as tabelas; visitantes só leem a view `public_properties` (apenas publicados, sem dados do proprietário; endereço só se `show_address`), configurações públicas e fotos de imóveis publicados.
- Escrita em imóveis, fotos, configurações, contatos e storage exige `public.is_admin()` (tabela `admins`, sem escrita pela API).
- `/admin` é protegido no middleware, no layout (checagem no servidor via `is_admin`) e no banco.
- Contatos entram só pela função `submit_contact` (validação, limite de 5/h por hash de IP, idempotência por chave, consentimento LGPD) + honeypot e validação na rota `/api/contact`.

## Estado de verificação

Veja a mensagem de entrega: o código **não foi compilado nem executado** no ambiente de criação (sem acesso ao npm/Supabase). Rode `npm run typecheck` e os testes da checklist (seção 12 do briefing) após configurar o Supabase.
