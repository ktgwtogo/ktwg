# KTGW Togo — site officiel

Site officiel de **KommTogoGehWeiter Togo (KTGW Togo)**, branche togolaise de l'association
*kommTOGOgehweiter e.V.* (Cologne, Allemagne).

> « Chaque centime investi dans l'éducation en Afrique protège des chemins dangereux vers l'Europe. »

Le site présente la mission, les projets et l'impact de l'ONG. Il gère aussi les formulaires
(contact, partenariat, événements, bénévolat, dons) et contient un tableau de bord
d'administration avec statistiques.

---

## Sommaire

1. [Stack technique](#stack-technique)
2. [Installation locale](#installation-locale)
3. [Structure du projet](#structure-du-projet)
4. [Multilingue](#multilingue)
5. [Identité visuelle](#identité-visuelle)
6. [Branches Git](#branches-git)
7. [Guide de mise en ligne (pas à pas)](#guide-de-mise-en-ligne-pas-à-pas)
8. [Administration du site](#administration-du-site)
9. [Avancement](#avancement)

---

## Stack technique

| Besoin | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript strict |
| Style | Tailwind CSS v4 + shadcn/ui + lucide-react |
| Animations | Framer Motion |
| Base de données, auth, fichiers | Supabase (PostgreSQL + RLS + Storage + Google OAuth) |
| E-mails | Resend + React Email |
| Formulaires | react-hook-form + zod |
| Multilingue | next-intl (FR par défaut, DE, EN) |
| Anti-spam | Cloudflare Turnstile + honeypot + limitation de débit |
| Hébergement | Vercel · domaine chez LWS |

---

## Installation locale

Prérequis : **Node.js 20 ou plus récent** et **Git**.

```bash
git clone https://github.com/<votre-compte>/ktgw-togo.git
cd ktgw-togo
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev                   # http://localhost:3000
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Lancer le build de production |
| `npm run lint` | Vérification ESLint |
| `npm run typecheck` | Vérification TypeScript |

Les variables d'environnement sont décrites dans [`.env.example`](.env.example).
Les variables qui commencent par `NEXT_PUBLIC_` sont visibles dans le navigateur. N'y mettez
jamais de secret. La clé `SUPABASE_SERVICE_ROLE_KEY` reste uniquement côté serveur.

---

## Structure du projet

```
ktgw-togo/
├─ src/
│  ├─ app/[locale]/(public)/...   pages publiques
│  ├─ app/[locale]/(auth)/...     connexion, mon-espace
│  ├─ app/[locale]/admin/...      tableau de bord
│  ├─ app/api/...                 webhooks, cron, exports
│  ├─ components/ui/              composants shadcn/ui
│  ├─ components/sections/        sections de la page d'accueil
│  ├─ components/forms/           formulaires
│  ├─ components/admin/           composants du dashboard
│  ├─ i18n/                       configuration next-intl (routing, request, navigation)
│  ├─ lib/                        utilitaires, Supabase, validations zod, e-mails
│  ├─ messages/                   traductions fr.json, de.json, en.json
│  └─ types/                      types TypeScript (dont types générés Supabase)
├─ supabase/migrations/ + seed.sql
├─ public/images/                 photos et logo
├─ .env.example
└─ README.md
```

---

## Multilingue

- Le français est la langue par défaut, servie **sans préfixe** : `/a-propos`.
- L'allemand et l'anglais sont préfixés : `/de/a-propos`, `/en/a-propos`.
- Les textes de l'interface se trouvent dans `src/messages/*.json`. Les contenus éditoriaux
  (projets, actualités, etc.) seront stockés en base et modifiables depuis le dashboard.
- Pour les liens internes, importez toujours `Link` depuis `@/i18n/navigation` et non depuis
  `next/link` : la langue courante est alors conservée.

---

## Identité visuelle

Les couleurs sont définies une seule fois, en variables CSS dans `src/app/globals.css`, avec une
variante pour le mode sombre. Elles sont utilisables en classes Tailwind :

| Jeton | Valeur | Classe Tailwind | Usage |
|---|---|---|---|
| `--ktgw-red` | `#E2412B` | `bg-ktgw-red`, `text-ktgw-red` | Titres, CTA principaux |
| `--ktgw-sun` | `#F9C23C` | `bg-ktgw-sun` | Accents, surlignages |
| `--ktgw-orange` | `#F5A623` | `bg-ktgw-orange` | Dégradés du soleil |
| `--ktgw-green` | `#1E8E3E` | `bg-ktgw-green` | Boutons secondaires, réussite |
| `--ktgw-green-dark` | `#0F5C2A` | `bg-ktgw-green-dark` | Survols, textes verts |
| `--ink` | `#1A1A1A` | `text-ink` | Texte principal |
| `--paper` | `#FFFDF8` | `bg-paper` | Fond crème |

Typographie : **Montserrat** pour les titres (`font-heading`), **Inter** pour le texte
(`font-sans`). Les polices sont chargées via `next/font` et auto-hébergées.

**Logo** : le fichier officiel se trouve dans `../img/logo-ktgw-officiel.jpg`. Pour régénérer
toutes ses déclinaisons, lancez `node scripts/prepare-logo.mjs ../img/logo-ktgw-officiel.jpg`. Le
script produit la version transparente, le symbole seul, le favicon, l'icône iOS et l'image de
partage pour les réseaux sociaux. Si vous obtenez un fichier source de meilleure qualité (PNG ou
SVG), relancez simplement la même commande sur ce fichier.

**Photos** : `node scripts/optimize-images.mjs ../img` convertit les photos sources en WebP dans
`public/images/`.

---

## Branches Git

| Branche | Rôle | Déploiement Vercel |
|---|---|---|
| `main` | Production | Domaine principal |
| `develop` | Préproduction | URL de prévisualisation |

On travaille sur `develop`. On fusionne dans `main` une fois la version validée.

---

## Guide de mise en ligne (pas à pas)

Ce guide s'adresse à une personne qui n'est pas développeuse. Suivez les étapes dans l'ordre.
Gardez un document (privé) sous la main pour noter chaque clé récupérée.

### 1. GitHub — héberger le code

1. Créez un compte sur <https://github.com> si nécessaire.
2. Cliquez sur **New repository**, nommez-le `ktgw-togo`, choisissez **Private**, et ne cochez
   aucune case d'initialisation.
3. Dans le dossier du projet, sur votre ordinateur :
   ```bash
   git remote add origin https://github.com/<votre-compte>/ktgw-togo.git
   git push -u origin main
   git push -u origin develop
   ```

### 2. Supabase — base de données et connexion

1. Créez un compte sur <https://supabase.com>, puis **New project**.
2. Nom : `ktgw-togo`. Choisissez un mot de passe de base de données solide et conservez-le.
   Région : **Europe — Frankfurt (eu-central-1)**.
3. Exécutez les migrations : ouvrez **SQL Editor**, puis copiez et exécutez dans l'ordre chaque
   fichier de `supabase/migrations/`, puis `supabase/seed.sql`. Vous pouvez aussi utiliser la
   commande `npx supabase db push`.
4. Dans **Project Settings → API**, copiez :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**secret, ne jamais le partager**)
5. Désignez le premier super administrateur : dans **SQL Editor**, exécutez
   ```sql
   insert into public.role_invitations (email, role) values ('votre.adresse@gmail.com', 'super_admin');
   ```
   Ce rôle lui est attribué à sa première connexion Google. Si le compte existe déjà :
   `update public.profiles set role = 'super_admin' where email = 'votre.adresse@gmail.com';`

> **Ce qui est en place** — rôles `member` < `editor` < `admin` < `super_admin` ; contenus
> (projets, actualités, événements, galerie, partenaires, témoignages) lisibles par tous une fois
> publiés et modifiables par l'équipe ; demandes des formulaires visibles par l'équipe seulement,
> enregistrées côté serveur avec la clé `service_role` ; bucket public `media` (10 Mo max).
> Après une modification du schéma, régénérez `src/types/database.ts` avec
> `npx supabase gen types typescript --project-id <ref> > src/types/database.ts`.

### 3. Google Cloud Console — bouton « Continuer avec Google »

1. Allez sur <https://console.cloud.google.com> et créez un projet `KTGW Togo`.
2. Ouvrez **API et services → Écran de consentement OAuth** :
   - Type : **Externe**
   - Nom de l'application : **KTGW Togo**
   - E-mail d'assistance : votre adresse
   - Ajoutez le logo et le domaine du site.
3. Ouvrez **Identifiants → Créer des identifiants → ID client OAuth** :
   - Type : **Application Web**
   - URI de redirection autorisés : `https://<votre-projet>.supabase.co/auth/v1/callback`
     (l'adresse exacte est indiquée dans Supabase → Authentication → Providers → Google).
4. Copiez le **Client ID** et le **Client Secret**.
5. Dans Supabase, ouvrez **Authentication → Providers → Google**, activez le fournisseur et
   collez les deux valeurs.
6. Dans Supabase, ouvrez **Authentication → URL Configuration** :
   - Site URL : `https://www.ktgw.tg`
   - Redirect URLs : ajoutez `http://localhost:3000/**`, `https://www.ktgw.tg/**` et `https://ktgw.tg/**`

### 4. Resend — envoi des e-mails

1. Créez un compte sur <https://resend.com>.
2. Ouvrez **Domains → Add domain** et saisissez votre domaine (`ktgw.tg`).
3. Resend affiche plusieurs enregistrements DNS (SPF, DKIM, DMARC). Gardez cette page ouverte :
   vous les ajouterez chez LWS à l'étape 6.
4. Ouvrez **API Keys → Create API key** et copiez la clé dans `RESEND_API_KEY`.

### 5. Vercel — mettre le site en ligne

1. Créez un compte sur <https://vercel.com> avec **Continue with GitHub**.
2. Cliquez sur **Add New → Project**, puis importez le dépôt `ktgw-togo`.
3. Dans **Environment Variables**, ajoutez toutes les variables de `.env.example` avec leurs
   valeurs. Pour générer `CRON_SECRET`, tapez une longue chaîne aléatoire, par exemple avec
   `openssl rand -hex 32`.
4. Cliquez sur **Deploy**. Le site est accessible sur une adresse `*.vercel.app`.
5. Dans **Settings → Git**, vérifiez que la branche de production est bien `main`.

### 6. LWS — relier le nom de domaine

1. Connectez-vous à votre espace client LWS (<https://panel.lws.fr>), choisissez `ktgw.tg`, puis ouvrez **Zone DNS**.
2. Dans Vercel, ouvrez **Settings → Domains** et ajoutez `ktgw.tg` et
   `www.ktgw.tg`. **Vercel affiche alors les valeurs exactes à saisir.** Utilisez
   celles-là en priorité. Ce sont habituellement :

   | Type | Nom | Valeur |
   |---|---|---|
   | A | `@` | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |

3. Supprimez chez LWS les anciens enregistrements **A** et **CNAME** de `@` et `www` s'ils
   existent, car ils entreraient en conflit.
4. Ajoutez les enregistrements TXT / CNAME / MX fournis par Resend (étape 4).
5. Patientez de quelques minutes à 24 h. Le certificat SSL (https) est ensuite généré
   automatiquement par Vercel.

### 7. Passer sur le domaine définitif

- Dans Vercel, remplacez `NEXT_PUBLIC_SITE_URL` par `https://www.ktgw.tg`, puis
  redéployez.
- Vérifiez la Site URL et les Redirect URLs dans Supabase (étape 3.6).
- Dans Google Cloud, ajoutez le domaine aux **domaines autorisés** de l'écran de consentement.

### 8. Premier administrateur

1. Définissez `SUPER_ADMIN_EMAIL` avec l'adresse Gmail du responsable.
2. Allez sur `/connexion` et connectez-vous avec ce compte Google.
3. Ouvrez `/admin`, puis **Utilisateurs & rôles** pour attribuer les rôles `staff` ou `admin` à
   l'équipe. Les membres de l'équipe doivent s'être connectés une fois auparavant.

### 9. Référencement Google

1. Allez sur <https://search.google.com/search-console> et ajoutez la propriété
   `https://www.ktgw.tg`. Validez-la par un enregistrement TXT chez LWS.
2. Ouvrez **Sitemaps** et soumettez `https://www.ktgw.tg/sitemap.xml`.

---

## Administration du site

*(Complété en Phase 8.)* Le dashboard `/admin` permet de modifier tous les contenus sans toucher
au code : projets, actualités, événements, galerie, partenaires, témoignages, chiffres clés. Il
permet aussi de traiter les messages et demandes de partenariat, de suivre les actions terrain et
d'exporter des rapports.

---

## Avancement

- [x] Phase 1 — Initialisation (Next.js, TypeScript, Tailwind v4, shadcn/ui, next-intl, design tokens, polices)
- [x] Phase 2 — Design system & layout (header, top bar, footer + carte, composants, mode sombre, logo officiel)
- [x] Phase 3 — Page d'accueil (hero diaporama, 13 sections, contenus en `src/content/`)
- [x] Phase 4 — Pages publiques (19 pages + sous-menus ; formulaires en envoi provisoire WhatsApp / e-mail)
- [x] Phase 5 — Supabase (schéma, RLS, stockage, données initiales, types, clients)
- [ ] Phase 6 — Formulaires & e-mails
- [ ] Phase 7 — Authentification
- [ ] Phase 8 — Dashboard admin
- [ ] Phase 9 — Qualité
- [ ] Phase 10 — Déploiement
