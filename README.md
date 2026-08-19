# SISR://LAB — plateforme de révision BTS SIO · option SISR

Cours structurés (18 chapitres / 5 modules), tuteur IA embarqué, labo quiz,
flashcards 3D et progression gamifiée (XP, grades, série de jours).
Contenu adapté à l'année d'étude choisie à la connexion (**1re** ou **2e année**).

Authentification et données utilisateurs via **Supabase** (PostgreSQL + RLS),
avec repli local automatique quand les clés ne sont pas fournies.

## Stack

React 18 · Vite 6 · Tailwind CSS v4 · TypeScript · Supabase (Auth + Database)

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production → dist/
```

Sans `.env`, l'app démarre en **mode local** : les comptes, l'année et la
progression sont persistés dans le navigateur (pratique pour tester le flow complet).

## Activer le backend Supabase

1. **Crée un projet** sur [supabase.com](https://supabase.com) (région `eu-west-3` Paris conseillée).
2. **Exécute le schéma** : Supabase → *SQL Editor* → *New query* → colle tout le contenu
   **brut** de [`supabase/schema.sql`](supabase/schema.sql) → *Run*.
   Tu dois voir « Success. No rows returned ».
   ⚠️ Ne copie pas depuis une vue *diff* (les lignes `+++` cassent le SQL).
   Le script est idempotent : relançable sans erreur. Il crée :
   - `public.profiles` (année, nom) et `public.progress` (données jsonb),
   - un **trigger** qui crée le profil automatiquement à chaque inscription,
   - les **politiques RLS** (chaque utilisateur ne lit/écrit que ses lignes).
3. *(Pour tester)* Authentication → Providers → Email → décoche
   *« Enable email confirmations »* → Save. Sinon l'utilisateur confirme son
   e-mail avant de se connecter (l'app affiche le message).
4. **Variables d'environnement** (voir [`.env.example`](.env.example)) :

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

La clé `anon` peut être exposée côté client : la sécurité vient de la RLS
(toutes les requêtes sont filtrées par `auth.uid()`).

## Déployer sur Vercel

1. Pousse le repo sur GitHub.
2. [vercel.com](https://vercel.com) → *Add New → Project* → importe le repo
   (framework **Vite** détecté automatiquement).
3. *Settings → Environment Variables* → ajoute `VITE_SUPABASE_URL` et
   `VITE_SUPABASE_ANON_KEY` (tous les environnements, ou Production + Preview).
4. *Deploy*. Chaque `git push` redéploie automatiquement.

Vérification : le pied de page de l'app affiche
**« backend : supabase (cloud) »** au lieu de « mode local ».

Ou en CLI :

```bash
npm i -g vercel
vercel link && vercel env add VITE_SUPABASE_URL && vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod
```

## Adapter le contenu / l'année

- Chapitres : `src/data/courses.ts` (mapping `CHAPTER_YEAR`)
- Questions : `src/data/quizzes.ts` (champ `year` sur chaque question)
- Flashcards : `src/data/knowledge.ts` (mapping `CARD_YEAR`)
- Réponses du tuteur : `src/data/knowledge.ts` (fonction `askTutor`)

2e année voit tout le programme ; 1re année voit le socle (badges 1A/2A dans l'UI).

## Alternative Neon

Le backend est derrière une interface unique (`src/lib/backend.ts`).
Pour Neon : implémente la même interface `Backend` (auth à gérer soi-même,
par ex. avec une table `users` + tokens JWT via `jose`) et renvoie-la dans
`getBackend()`. Rien d'autre à modifier.
