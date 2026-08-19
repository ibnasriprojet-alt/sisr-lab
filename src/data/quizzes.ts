import { MODULES } from "./courses";

export type Question = {
  id: string;
  q: string;
  options: string[];
  answer: number; // index
  explain: string;
  year: 1 | 2; // 1 = socle 1re année, 2 = expertise 2e année
};

export type Quiz = { moduleId: string; questions: Question[] };

const QUIZZES: Record<string, Question[]> = {
  net: [
    {
      id: "osi-devices",
      year: 1,
      q: "Un commutateur (switch) travaille principalement à quelle couche du modèle OSI ?",
      options: ["Couche 1 — Physique", "Couche 2 — Liaison", "Couche 3 — Réseau", "Couche 4 — Transport"],
      answer: 1,
      explain: "Le switch commute les trames Ethernet à partir des adresses MAC (L2). Le routeur, lui, travaille en couche 3 avec les adresses IP.",
    },
    {
      id: "ip-subnet",
      year: 1,
      q: "Combien d'hôtes utilisables contient un sous-réseau /26 ?",
      options: ["30", "62", "64", "126"],
      answer: 1,
      explain: "/26 = 64 adresses (2⁶), moins l'adresse réseau et le broadcast → 62 hôtes utilisables.",
    },
    {
      id: "net-dns",
      year: 1,
      q: "Quel protocole traduit les noms de domaine en adresses IP ?",
      options: ["DHCP", "NAT", "DNS", "ARP"],
      answer: 2,
      explain: "Le DNS (Domain Name System) résout les noms en adresses IP. ARP fait le lien IP → MAC sur le réseau local.",
    },
    {
      id: "vlan-trunk",
      year: 2,
      q: "Sur un lien entre deux switches transportant plusieurs VLAN, le port doit être configuré en…",
      options: ["Access", "Trunk", "NAT", "Loopback"],
      answer: 1,
      explain: "Le mode trunk (802.1Q) étiquette les trames de chaque VLAN pour les transporter sur un même lien physique.",
    },
    {
      id: "osi-tcpudp",
      year: 1,
      q: "Quelle est la différence clé entre TCP et UDP ?",
      options: [
        "TCP est plus rapide qu'UDP",
        "UDP chiffre les données, pas TCP",
        "TCP garantit la livraison (orienté connexion), UDP non",
        "UDP fonctionne uniquement sur Internet",
      ],
      answer: 2,
      explain: "TCP établit une connexion et acquitte chaque segment (fiabilité). UDP envoie sans contrôle : plus rapide, adapté au streaming ou au DNS.",
    },
  ],
  win: [
    {
      id: "ad-dns",
      year: 1,
      q: "Quel service est indispensable avant d'installer Active Directory ?",
      options: ["WSUS", "DNS", "DHCP", "IIS"],
      answer: 1,
      explain: "AD DS s'appuie sur DNS pour localiser les contrôleurs de domaine (enregistrements SRV). Sans DNS, pas de domaine.",
    },
    {
      id: "dns-a",
      year: 1,
      q: "Quel enregistrement DNS associe un nom à une adresse IPv4 ?",
      options: ["MX", "CNAME", "PTR", "A"],
      answer: 3,
      explain: "L'enregistrement A (Address) mappe un nom vers une IPv4. PTR fait l'inverse, MX cible les serveurs de mail.",
    },
    {
      id: "gpo-order",
      year: 2,
      q: "Dans quel ordre les GPO s'appliquent-elles ?",
      options: ["OU → Domaine → Site → Local", "Local → Site → Domaine → OU", "Site → Local → OU → Domaine", "Domaine → Local → OU → Site"],
      answer: 1,
      explain: "Ordre LSDOU : Local, Site, Domaine, OU. La dernière appliquée l'emporte en cas de conflit.",
    },
    {
      id: "dhcp-dora",
      year: 1,
      q: "Que signifie l'acronyme DORA dans le fonctionnement DHCP ?",
      options: [
        "Discover, Offer, Request, Acknowledge",
        "Deploy, Order, Register, Apply",
        "Detect, Open, Route, Assign",
        "Domain, Option, Relay, Address",
      ],
      answer: 0,
      explain: "Le client diffuse un Discover, le serveur propose un Offer, le client confirme par un Request et le serveur valide par un Acknowledge.",
    },
    {
      id: "gpo-gpupdate",
      year: 2,
      q: "Quelle commande force le rafraîchissement des stratégies de groupe sur un poste client ?",
      options: ["gpresult /all", "gpupdate /force", "netdom refresh", "dcdiag /sync"],
      answer: 1,
      explain: "gpupdate /force réapplique immédiatement les GPO. gpresult /r permet de vérifier celles qui sont réellement appliquées.",
    },
  ],
  lnx: [
    {
      id: "lnx-chmod",
      year: 1,
      q: "Que fait la commande « chmod 750 script.sh » ?",
      options: [
        "Lecture pour tous, écriture pour le propriétaire",
        "rwx pour le propriétaire, r-x pour le groupe, rien pour les autres",
        "rwx pour tous les utilisateurs",
        "rwx pour le propriétaire et le groupe, rien pour les autres",
      ],
      answer: 1,
      explain: "7 = rwx (propriétaire), 5 = r-x (groupe), 0 = aucun droit pour les autres.",
    },
    {
      id: "lnx-journal",
      year: 2,
      q: "Comment suivre en temps réel les messages d'un service géré par systemd ?",
      options: ["systemctl log ssh", "journalctl -u ssh -f", "service ssh tail", "dmesg -w ssh"],
      answer: 1,
      explain: "journalctl interroge le journal de systemd ; -u filtre le service et -f suit le flux en direct, comme tail -f.",
    },
    {
      id: "lnx-cron",
      year: 2,
      q: "Quelle entrée cron exécute un script tous les jours à 2 h du matin ?",
      options: ["2 * * * *", "0 2 * * *", "* 2 * * 0", "0 0 2 * *"],
      answer: 1,
      explain: "Format : minute heure jour mois semaine → 0 2 * * * = chaque jour à 02:00.",
    },
    {
      id: "lnx-usermod",
      year: 1,
      q: "Quelle commande ajoute l'utilisateur « jdoe » au groupe « sudo » sans le retirer de ses autres groupes ?",
      options: ["usermod -G sudo jdoe", "useradd -g sudo jdoe", "usermod -aG sudo jdoe", "groupadd sudo jdoe"],
      answer: 2,
      explain: "L'option -a (append) avec -G ajoute le groupe secondaire en conservant les groupes existants. Sans -a, ils seraient remplacés !",
    },
    {
      id: "lnx-pipe",
      year: 1,
      q: "Après « cat access.log | grep 404 | wc -l », qu'obtient-on ?",
      options: [
        "La liste des erreurs 404",
        "Le nombre de lignes contenant « 404 »",
        "Le poids du fichier log",
        "Les 404 dernières lignes du fichier",
      ],
      answer: 1,
      explain: "grep filtre les lignes contenant 404 et wc -l les compte. Les pipes chaînent les commandes.",
    },
  ],
  vir: [
    {
      id: "vir-type1",
      year: 1,
      q: "Lequel de ces hyperviseurs est de type 1 (bare metal) ?",
      options: ["VirtualBox", "VMware Workstation", "Proxmox VE", "Parallels Desktop"],
      answer: 2,
      explain: "Proxmox VE s'installe directement sur le matériel, comme ESXi ou Hyper-V. VirtualBox et Workstation tournent dans un OS hôte (type 2).",
    },
    {
      id: "vir-snapshot",
      year: 1,
      q: "Quelle affirmation sur les snapshots est correcte ?",
      options: [
        "Un snapshot remplace une sauvegarde",
        "Un snapshot doit rester en place plusieurs mois",
        "Un snapshot n'est pas une sauvegarde et doit vivre peu de temps",
        "Un snapshot ne consomme aucun espace disque",
      ],
      answer: 2,
      explain: "Le snapshot fige un état pour revenir en arrière : il grossit avec le temps et dépend du disque d'origine. La vraie sauvegarde est une copie indépendante.",
    },
    {
      id: "vir-vmcontainer",
      year: 2,
      q: "Quelle est la différence fondamentale entre une VM et un conteneur ?",
      options: [
        "Le conteneur virtualise le matériel, la VM non",
        "Les conteneurs partagent le noyau de l'hôte, la VM embarque son propre OS",
        "Une VM démarre plus vite qu'un conteneur",
        "Il n'y a aucune différence",
      ],
      answer: 1,
      explain: "Le conteneur isole des processus sur le noyau commun (léger, démarrage en secondes). La VM virtualise un matériel complet avec un OS invité.",
    },
    {
      id: "vir-volume",
      year: 2,
      q: "Dans Docker, où doivent vivre les données qui doivent survivre au conteneur ?",
      options: ["Dans /tmp du conteneur", "Dans l'image", "Dans un volume", "Dans les variables d'environnement"],
      answer: 2,
      explain: "Les conteneurs sont éphémères : seuls les volumes (ou bind mounts) persistent au-delà de leur cycle de vie.",
    },
    {
      id: "vir-compose",
      year: 2,
      q: "Quel outil décrit et lance une pile de plusieurs conteneurs ?",
      options: ["docker system prune", "docker compose", "docker pull", "kubectl apply"],
      answer: 1,
      explain: "Docker Compose lit un fichier YAML décrivant les services (web, base de données…) et les démarre ensemble.",
    },
  ],
  sec: [
    {
      id: "sec-dic",
      year: 1,
      q: "Dans le triptyque DIC, que garantit une sauvegarde hors site ?",
      options: ["La confidentialité", "L'intégrité", "La disponibilité", "La traçabilité"],
      answer: 2,
      explain: "Après un sinistre (incendie, rançongiciel), la copie hors site permet de restaurer le service : c'est la disponibilité qui est protégée.",
    },
    {
      id: "sec-deny",
      year: 2,
      q: "Quelle est la politique par défaut recommandée sur un pare-feu ?",
      options: ["Tout autoriser, puis bloquer les menaces connues", "Default deny : tout interdire, autoriser explicitement", "Autoriser le LAN, bloquer le WAN", "Laisser le choix aux utilisateurs"],
      answer: 1,
      explain: "On n'ouvre que les flux strictement nécessaires : tout le reste est refusé par défaut. C'est le principe de moindre privilège appliqué au réseau.",
    },
    {
      id: "sec-321",
      year: 1,
      q: "Que signifie la règle de sauvegarde 3-2-1 ?",
      options: [
        "3 serveurs, 2 sites, 1 pare-feu",
        "3 copies, 2 supports différents, 1 copie hors site",
        "3 sauvegardes par jour, 2 par semaine, 1 par mois",
        "3 jours de rétention, 2 semaines, 1 mois",
      ],
      answer: 1,
      explain: "3 copies des données, sur 2 types de supports différents, dont 1 hors site (ou hors ligne) pour résister aux rançongiciels.",
    },
    {
      id: "sec-dmz",
      year: 2,
      q: "Qu'est-ce qu'une DMZ dans une architecture réseau ?",
      options: [
        "Un VLAN de management pour les switches",
        "Une zone tampon isolée pour les serveurs exposés à Internet",
        "Un pare-feu logiciel",
        "Une sauvegarde externalisée",
      ],
      answer: 1,
      explain: "La DMZ héberge les services accessibles depuis l'extérieur (web, mail) tout en les isolant du LAN : une compromission ne donne pas accès au réseau interne.",
    },
    {
      id: "sec-ssh",
      year: 2,
      q: "Quelle mesure réduit le plus efficacement les attaques par force brute sur SSH ?",
      options: [
        "Changer le fond d'écran du serveur",
        "Verrouillage de compte + MFA + désactivation de root",
        "Ouvrir plus de ports",
        "Redémarrer le service chaque nuit",
      ],
      answer: 1,
      explain: "Combiner verrouillage après échecs, authentification multifacteur et interdiction de la connexion root directe casse l'essentiel des attaques automatisées.",
    },
  ],
};

export function quizFor(moduleId: string): Quiz {
  return { moduleId, questions: QUIZZES[moduleId] ?? [] };
}

export const QUIZ_LIST = MODULES.map((m) => ({
  module: m,
  count: (QUIZZES[m.id] ?? []).length,
}));

export const TOTAL_QUESTIONS = Object.values(QUIZZES).reduce((n, q) => n + q.length, 0);

/* ----------------------- années (1re / 2e) ----------------------- */

/** Quiz d'un module filtré selon l'année (2e année = toutes les questions). */
export function quizForYear(moduleId: string, year: 1 | 2) {
  const full = quizFor(moduleId);
  const questions = full.questions.filter((q) => (year === 2 ? true : q.year === 1));
  return { moduleId, questions };
}

/** Modules ayant au moins une question disponible pour l'année. */
export function quizListForYear(year: 1 | 2) {
  return MODULES.map((m) => ({ module: m, quiz: quizForYear(m.id, year) })).filter(
    ({ quiz }) => quiz.questions.length > 0
  );
}

export const totalQuestionsForYear = (year: 1 | 2) =>
  quizListForYear(year).reduce((n, { quiz }) => n + quiz.questions.length, 0);
