# SISR://LAB — passer en backend cloud (Supabase) + déployer sur Vercel

L'app détecte automatiquement le backend :
- **Clés présentes** → mode **cloud** : authentification Supabase Auth, profils (année 1re/2e) et
  progression stockés en base PostgreSQL avec Row Level Security (`supabase/schema.sql`).
- **Clés absentes** → mode **local** : mêmes comptes / même année / même progression, persistés sur l'appareil.

## 1. Créer le projet Supabase (2 min)

1. Va sur [supabase.com](https://supabase.com) → **New project** (région `eu-west-3` Paris conseillée).
2. Dans **SQL Editor**, colle tout le contenu de `supabase/schema.sql` → **Run**.
3. **Authentication → Providers → Email** : pour tester vite, décoche
   *« Enable email confirmations »* (sinon l'utilisateur doit confirmer son e-mail avant de se connecter — l'app affiche le message).

## 2. Récupérer les clés

**Project Settings → API** :
- `Project URL` → ex. `https://xxxx.supabase.co`
- `anon public` key → la clé publique (elle peut être exposée côté client, la sécurité vient de la RLS).

## 3. Déployer sur Vercel avec le backend

1. Pousse le projet sur GitHub puis [vercel.com](https://vercel.com) → **Add New → Project** → importe le repo.
   Framework détecté : **Vite**. Build : `npm run build`, sortie : `dist`.
2. Dans le projet Vercel → **Settings → Environment Variables**, ajoute :
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
3. **Deploy** (ou `vercel --prod` en CLI). Le bandeau du footer passera de
   *« mode local »* à *« cloud · supabase »* : le backend est actif.

> Ensuite, chaque changement de code : `git push` → Vercel redéploie tout seul.
> Les variables d'env. sont injectées au build (préfixe `VITE_` obligatoire).

## 4. Tester le flow complet

1. Écran de connexion → **Créer un compte** (nom, e-mail, mot de passe ≥ 6 caractères).
2. Choix de l'année : **1re année** (programme fondamental) ou **2e année** (tout le programme, 1re année en révision).
3. La progression (XP, chapitres, quiz, flashcards, série) est sauvegardée **par compte**, dans le cloud.
4. L'année peut être changée à tout moment depuis le profil (sidebar).

## Alternative Neon

Si tu préfères Neon (Postgres serverless) : l'interface backend (`src/lib/backend.ts`) est isolée —
écris une `NeonBackend` qui implémente la même interface (auth à gérer toi-même, ex. avec `jose` + une
table `users`), et renvoie-la dans `getBackend()`. Aucune autre modification nécessaire.
