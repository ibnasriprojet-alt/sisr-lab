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

## Étape 2 — mettre le code sur GitHub (100 % dans le navigateur)

Aucune installation nécessaire : tout se fait sur github.com.

### 2.1 Créer le dépôt

1. Crée un compte gratuit sur [github.com](https://github.com) et connecte-toi.
2. En haut à droite : bouton **+** → **New repository**.
3. *Repository name* : `sisr-lab` (ou ce que tu veux).
4. Laisse **Public**, coche ✅ **Add a README file**, puis **Create repository**.

### 2.2 Envoyer les fichiers du projet (glisser-déposer)

1. Ouvre ton nouveau dépôt, clique **Add file** → **Upload files**.
2. Ouvre l'explorateur de ton PC sur le dossier du projet (celui qui contient
   `package.json`).
3. Sélectionne tout (`Ctrl + A`) puis **dé-sélectionne** `node_modules` et `dist`
   (un `Ctrl + clic` sur chacun) — ces dossiers ne doivent PAS être envoyés.
   ⚠️ N'envoie JAMAIS un fichier `.env` avec de vraies clés (les clés vont dans
   les variables d'environnement Vercel, étape 3).
4. **Glisse-dépose** la sélection dans la zone du navigateur (tu peux aussi
   glisser les dossiers `src` et `supabase` entiers, ils seront recréés).
5. En bas : message « premier envoi » → **Commit changes**.

✅ Ton code est sur GitHub. S'il reste des fichiers oubliés, répète
**Add file → Upload files** (on peut faire plusieurs envois).

### 2.3 Modifier un fichier plus tard

Sur GitHub : clique sur le fichier → 🖊️ (crayon) → modifie → **Commit changes**.
Idéal pour de petits ajustements sans ré-envoyer tout le projet.

### Méthode alternative : en lignes de commande

```bash
# dans le dossier du projet
git init
git add .
git commit -m "premier envoi"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/sisr-lab.git   # repo créé vide sur github.com
git push -u origin main
```

Le `.gitignore` du projet exclut déjà `node_modules` et `dist`.

## Étape 3 — déployer sur Vercel (3 minutes)

1. Va sur [vercel.com](https://vercel.com) → **Sign Up** → choisis
   **Continue with GitHub** (Vercel te demande l'autorisation de lire tes repos → accepte).
2. Sur ton tableau de bord : bouton **Add New…** → **Project**.
3. La liste de tes repos GitHub s'affiche → clique **Import** à côté de `sisr-lab`.
4. Page de configuration : Vercel a déjà détecté **Vite** (ne touche à rien).
   Déplie la section **Environment Variables** et ajoute :

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | ton Project URL (Supabase → ⚙️ Settings → API) |
   | `VITE_SUPABASE_ANON_KEY` | ta clé `anon public` (même page) |

5. Clique **Deploy**. Attends ~1 minute… 🎉 tu obtiens une URL du type
   `sisr-lab.vercel.app`.

### Vérifications

- Le pied de page de l'app affiche **« backend : supabase (cloud) »**.
- Crée un compte → choisis ton année → valide un chapitre → déconnecte-toi →
  reconnecte-toi : la progression est revenue (elle vient de PostgreSQL).

### Ensuite, pour chaque modification du code

Mets à jour le dépôt GitHub (re-upload des fichiers modifiés via
**Add file → Upload files**, ou édition directe au crayon 🖊️ sur github.com) →
Vercel redéploie **tout seul** en ~30 secondes.
Si tu as ajouté les variables d'env. après le premier deploy : onglet
**Deployments** → ⋯ → **Redeploy** une fois pour les activer.

### Plan B : déployer SANS GitHub (glisser-déposer du dossier)

Si l'import GitHub pose problème (404, NOT_FOUND, structure de repo…) :

1. [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. Choisis l'onglet **Deploy without Git** (ou *Browse all templates* →
   *Deploy without Git Repository* selon la version de l'interface).
3. **Glisse-dépose le dossier du projet** (celui qui contient `package.json`)
   dans la fenêtre du navigateur.
4. Ajoute les 2 variables d'environnement (`VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`) → **Deploy**.

Le site est en ligne en ~1 minute. Tu pourras connecter GitHub plus tard
depuis *Settings → Git* pour les redéploiements automatiques.

### Dépannage 404 / NOT_FOUND / Invalid path

- Onglet **Deployments** : le dernier build est-il ✅ **Ready** ? Si ❌ **Error**,
  ouvre les **Build Logs** et cherche la ligne rouge.
- Le repo GitHub doit contenir `package.json` **à la racine** (pas dans un
  sous-dossier). Sinon : *Settings → General → Root Directory* = nom du
  sous-dossier, puis **Redeploy** — ou re-uploader les fichiers à la racine.
- Variables d'env. ajoutées APRÈS le premier build ? **Deployments → ⋯ → Redeploy**.
- Vérifie l'URL exacte du projet : **Settings → Domains**.

### Variante CLI (si tu préfères le terminal)

```bash
npm i -g vercel
vercel --prod     # réponds aux questions, puis ajoute les env vars dans le dashboard
```

## IA réelle (génération de cours sur mesure & tuteur)

L'app intègre une **IA réelle** via les API compatibles OpenAI — **Groq** (gratuit,
recommandé) ou OpenAI. Sans clé, l'app bascule automatiquement sur NEXO, le
moteur de connaissances embarqué (~35 sujets du référentiel, fonctionne hors ligne).

1. Crée une clé gratuite sur [console.groq.com/keys](https://console.groq.com/keys)
   (compte gratuit, sans carte bancaire).
2. Dans l'app : puce **IA** en haut à droite (ou bouton « Configurer l'IA ») →
   colle la clé → **Tester** → **Enregistrer**.
3. Deux fonctionnalités se débloquent :
   - **Studio « Cours IA »** : décris un sujet pas compris → cours rédigé en
     streaming (3 profondeurs), quiz généré, sauvegarde en bibliothèque.
   - **Tuteur NEXO en IA réelle** : réponses illimitées et contextualisées.

La clé est stockée **uniquement dans le navigateur** (localStorage) et envoyée
seulement au fournisseur choisi. Pour la production multi-utilisateurs,
l'idéal est de proxifier les appels via une **Supabase Edge Function** (la clé
reste alors côté serveur) : le point d'entrée unique est `src/lib/ai.ts`.

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
