# AL FOUTIYOU MARKET

Marketplace (terrains, immobilier, automobiles, motos, autres biens) — React + TypeScript + Vite + Supabase (PostgreSQL, Auth, Storage, RLS).

- **Public** (`/`) : catégories, recherche, annonces, formulaire « Je suis intéressé », WhatsApp.
- **Admin** (`/admin`) : annonces, photos, demandes, rendez-vous, propriétaires, administrateurs, paramètres. Rôles : `super_admin`, `admin`, `agent`.

## Installation

```bash
npm install
cp .env.example .env   # puis renseigner les 2 variables
npm run dev
```

Variables (publiques uniquement) :

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Ne jamais mettre `SUPABASE_SERVICE_ROLE_KEY` dans le frontend ni dans GitHub. `.env` est dans `.gitignore`.

## Configuration Supabase

1. Créer un projet Supabase.
2. Appliquer les migrations dans l'ordre (SQL Editor, ou `supabase db push` avec la CLI) :
   - `supabase/migrations/20261025000001_schema.sql` : tables, triggers, journal, stats
   - `supabase/migrations/20261025000002_rls.sql` : RLS, grants, bucket `listing-images`
   - `supabase/migrations/20261025000003_seed_demo.sql` : **données de démonstration** (à supprimer avant production)
3. Créer le premier utilisateur : Authentication → Users → Add user (email + mot de passe).
4. Le profil est créé **inactif** (rôle `agent`). Le promouvoir en SQL :

```sql
update profiles set role = 'super_admin', active = true, full_name = 'Votre nom'
where user_id = (select id from auth.users where email = 'votre@email.com');
```

5. Se connecter sur `/admin/login`, puis renseigner téléphone, WhatsApp, etc. dans « Contacts & paramètres ».

Les autres utilisateurs : les créer dans Supabase Auth, puis activer le compte et choisir son rôle depuis `/admin/admins`.

## Modèle de sécurité

- Le public n'a **aucun accès** à la table `listings` : il lit la vue `public_listings`, qui n'expose ni `owner_id` ni les brouillons.
- `owners`, `activity_logs`, `appointments`, `profiles` : aucun accès `anon`.
- `customer_leads` : `anon` peut seulement insérer (colonnes publiques, statut `new`). Les notes internes ne sont lisibles que par l'équipe.
- Agents : ne voient que les demandes et rendez-vous qui leur sont assignés. Admin / super_admin voient tout. Seul le super_admin supprime annonces et demandes, et gère les rôles.
- Photos : bucket public en lecture, écriture réservée aux admins.

## Structure

```
src/components  composants réutilisables
src/pages       pages publiques + pages/admin
src/layouts     PublicLayout, AdminLayout (garde de session + rôles)
src/services    accès Supabase (listings, leads, owners, appointments, categories, company, admins)
src/lib         client Supabase, utilitaires
src/context     Auth, Toast
supabase/migrations  schéma, RLS, démo
```

## Déploiement

```bash
npm run build   # génère dist/
```

Déployer `dist/` (Netlify, Vercel, Cloudflare Pages, GitHub Pages) avec une règle de fallback SPA vers `index.html` et les 2 variables d'environnement. Sur Netlify, `public/_redirects` est déjà fourni.

## Tests de sécurité à rejouer après chaque migration

```sql
set role anon;
select * from owners;            -- doit échouer (permission denied)
select owner_id from public_listings;  -- doit échouer (colonne absente)
update listings set title = 'x'; -- doit échouer
select * from customer_leads;    -- doit échouer
reset role;
```
