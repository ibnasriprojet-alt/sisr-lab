/* ------------------------------------------------------------------ */
/*  Tuteur IA embarqué : moteur de connaissances SISR + flashcards.     */
/*  Les réponses sont générées localement à partir d'une base experte.  */
/*  Le point d'entrée askTutor() est isolé pour brancher plus tard un   */
/*  modèle hébergé (Supabase Edge Function / API) sans toucher à l'UI.  */
/* ------------------------------------------------------------------ */

export type TutorReply = {
  answer: string;
  related?: { moduleId: string; chapterId: string; label: string }[];
};

type Entry = {
  patterns: RegExp[];
  answer: string;
  related?: TutorReply["related"];
};

const KB: Entry[] = [
  {
    patterns: [/osi/i, /7 couches?/i, /sept couches?/i],
    answer:
      "Le modèle OSI compte 7 couches : Physique, Liaison, Réseau, Transport, Session, Présentation, Application.\n\n• L2 = adresses MAC, switchs, trames.\n• L3 = adresses IP, routeurs, paquets.\n• L4 = TCP (fiable) / UDP (rapide).\n• L7 = HTTP, DNS, SSH…\n\nPour diagnostiquer une panne, on remonte couche par couche : câble → link → IP → routage → service.",
    related: [{ moduleId: "net", chapterId: "net-osi", label: "Cours : modèles OSI et TCP/IP" }],
  },
  {
    patterns: [/sous[- ]?r[eé]seau/i, /subnet/i, /masque/i, /cidr/i, /\/2[0-9]\b/],
    answer:
      "Le masque sépare la partie réseau de la partie hôte. Notation CIDR : /24 = 255.255.255.0 → 254 hôtes.\n\nPour un /26 : 64 adresses, 62 hôtes utilisables (la 1re = réseau, la dernière = broadcast).\n\nAstuce de calcul : hôtes = 2^(32−n) − 2. Exemple /27 → 2⁵ − 2 = 30 hôtes.\n\nPlages privées à connaître : 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.",
    related: [{ moduleId: "net", chapterId: "net-ip", label: "Cours : adressage IPv4 et sous-réseaux" }],
  },
  {
    patterns: [/vlan/i, /trunk/i, /802\.1q/i, /tagg?[eé]/i],
    answer:
      "Un VLAN (802.1Q) segmente logiquement un switch en plusieurs domaines de diffusion.\n\n• Port access = un seul VLAN (postes).\n• Port trunk = plusieurs VLAN étiquetés entre équipements.\n• VLAN natif = trafic non taggé sur le trunk (changez le VLAN 1 par défaut).\n\nPanne classique de TP : deux switches reliés en access au lieu de trunk → un seul VLAN passe.",
    related: [{ moduleId: "net", chapterId: "net-vlan", label: "Cours : VLAN et commutation" }],
  },
  {
    patterns: [/dns/i, /enregistrement/i, /r[ée]solution de nom/i, /nslookup/i],
    answer:
      "Le DNS traduit les noms en adresses IP. Enregistrements clés :\n\n• A : nom → IPv4\n• AAAA : nom → IPv6\n• CNAME : alias\n• MX : serveur de messagerie\n• PTR : IP → nom (zone inversée)\n• SRV : localisation de services (indispensable à Active Directory)\n\nSans serveur DNS fonctionnel, impossible d'installer un domaine AD.",
    related: [{ moduleId: "win", chapterId: "win-dnsdhcp", label: "Cours : rôles DNS et DHCP" }],
  },
  {
    patterns: [/dhcp/i, /bail/i, /dora/i, /ip automatique/i],
    answer:
      "DHCP distribue IP, masque, passerelle et DNS. Cycle DORA : Discover → Offer → Request → Acknowledge.\n\nPoints clés :\n• Étendue = plage + masque ; options 003 (routeur) et 006 (DNS).\n• Réservation = IP fixe liée à une adresse MAC.\n• Serveur « non autorisé » dans AD = il ne distribue rien (anti-rogue DHCP).\n\nDiagnostic client : ipconfig /release puis /renew.",
    related: [{ moduleId: "win", chapterId: "win-dnsdhcp", label: "Cours : rôles DNS et DHCP" }],
  },
  {
    patterns: [/active directory/i, /\bad\b.*ds/i, /contr[oô]leur de domaine/i, /annuaire/i, /kerberos/i, /foret|forêt/i],
    answer:
      "Active Directory DS est l'annuaire central : authentification (Kerberos) + gestion centralisée.\n\nHiérarchie : forêt → domaine → OU → objets (users, groupes, ordinateurs).\n\n• Prérequis : DNS opérationnel.\n• Kerberos = tickets ; horloges synchronisées à moins de 5 min d'écart.\n• Organisez par OU (Compta, RH…) pour cibler les GPO.",
    related: [{ moduleId: "win", chapterId: "win-ad", label: "Cours : Active Directory DS" }],
  },
  {
    patterns: [/gpo/i, /strat[eé]gie de groupe/i, /gpupdate/i, /gpresult/i, /lsdou/i],
    answer:
      "Les GPO déploient des paramètres sans toucher chaque poste.\n\nOrdre d'application LSDOU : Local → Site → Domaine → OU (la dernière gagne).\n\n• Lien sur une OU = application à ses objets.\n• Filtrage de sécurité pour limiter à un groupe.\n• Côté client : gpupdate /force, vérification avec gpresult /r.\n\nCas type d'examen : mapper un lecteur Z: via GPO liée à l'OU Compta.",
    related: [{ moduleId: "win", chapterId: "win-gpo", label: "Cours : stratégies de groupe" }],
  },
  {
    patterns: [/linux/i, /bash/i, /shell/i, /commandes? (de base|essentielles?)/i, /terminal/i],
    answer:
      "Le kit de survie de l'admin Linux :\n\n• ls -la, cd, pwd — naviguer\n• cat, less, tail -f — lire les fichiers et logs\n• grep, wc, sort, uniq — filtrer et compter\n• cp -r, mv, rm — manipuler\n• find / -name \"*.conf\" — chercher\n\nLe pipe | enchaîne les commandes : cat access.log | grep 404 | wc -l compte les erreurs.",
    related: [{ moduleId: "lnx", chapterId: "lnx-base", label: "Cours : commandes essentielles" }],
  },
  {
    patterns: [/chmod/i, /permission/i, /chown/i, /droits?/i, /rwx/i],
    answer:
      "Droits Linux : r=4, w=2, x=1, pour propriétaire / groupe / autres.\n\n• 755 = rwxr-xr-x (exécutables, dossiers web)\n• 750 = rwxr-x--- \n• 600 = rw------- (clés SSH privées)\n• 644 = rw-r--r-- (fichiers classiques)\n\nchown user:groupe fichier change la propriété. chmod -R applique récursivement (prudence !).",
    related: [{ moduleId: "lnx", chapterId: "lnx-users", label: "Cours : utilisateurs et permissions" }],
  },
  {
    patterns: [/systemctl/i, /systemd/i, /service linux/i, /journalctl/i, /d[ée]marrer un service/i],
    answer:
      "systemd gère les services Linux :\n\n• systemctl status ssh — état du service\n• systemctl enable --now nginx — au boot + démarrage immédiat\n• journalctl -u ssh -f — logs en direct\n• ss -tlnp — ports en écoute\n\nAttention : enable ≠ start. Un service en échec → vérifier sa config puis journalctl -xe.",
    related: [{ moduleId: "lnx", chapterId: "lnx-services", label: "Cours : services et systemd" }],
  },
  {
    patterns: [/cron/i, /script bash/i, /automatis/i, /sauvegarde.*script/i],
    answer:
      "Automatiser en Bash = script + cron.\n\nStructure type : shebang #!/bin/bash, variables, test du code retour $?, log des actions. Exemple : tar -czf + find -mtime +14 -delete pour sauvegarder puis purger.\n\nCron : « minute heure jour mois semaine » → 0 2 * * * = chaque jour à 2 h.\n\nRègle d'or : tester un script de suppression à blanc (echo avant rm).",
    related: [{ moduleId: "lnx", chapterId: "lnx-script", label: "Cours : automatiser en Bash" }],
  },
  {
    patterns: [/hyperviseur/i, /proxmox/i, /esxi/i, /virtualbox/i, /type 1/i, /type 2/i, /bare ?metal/i],
    answer:
      "Hyperviseur type 1 (bare metal) = installé sur le matériel : Proxmox VE, ESXi, Hyper-V → production.\nType 2 = dans un OS hôte : VirtualBox, VMware Workstation → maquettes de TP.\n\nPensez à activer VT-x / AMD-V dans le BIOS, sinon pas de VM 64 bits.\n\nProxmox VE est gratuit, basé Debian, avec sauvegarde intégrée : excellent choix pour vos maquettes E4/E6.",
    related: [{ moduleId: "vir", chapterId: "vir-hyper", label: "Cours : hyperviseurs type 1 et 2" }],
  },
  {
    patterns: [/docker/i, /conteneur/i, /container/i, /image docker/i],
    answer:
      "Un conteneur isole une application en partageant le noyau de l'hôte : démarrage en secondes, empreinte minimale.\n\n• Image = modèle en lecture seule ; conteneur = instance exécutée.\n• docker run -d -p 8080:80 nginx → lance en arrière-plan avec redirection de port.\n• docker compose up -d → pile multi-conteneurs décrite en YAML.\n• Les données vivent dans des VOLUMES, jamais dans le conteneur (éphémère).\n\nDifférence avec une VM : le conteneur n'embarque pas d'OS complet.",
    related: [{ moduleId: "vir", chapterId: "vir-docker", label: "Cours : conteneurs et Docker" }],
  },
  {
    patterns: [/snapshot/i, /instantan[ée]/i],
    answer:
      "Un snapshot fige l'état d'une VM pour y revenir après une opération risquée (patch, GPO, test).\n\nRègles d'or :\n• Ce n'est PAS une sauvegarde : il dépend du disque d'origine et grossit avec le temps.\n• Durée de vie < 72 h, puis consolidation.\n• Avant une sauvegarde complète, consolidez les snapshots.\n\nLa vraie sauvegarde est une copie indépendante (Veeam, Proxmox Backup Server…).",
    related: [{ moduleId: "vir", chapterId: "vir-vm", label: "Cours : concevoir une VM proprement" }],
  },
  {
    patterns: [/\bdic\b/i, /disponibilit[eé].*int[eé]grit[eé]/i, /confidentialit[eé]/i, /s[ée]curit[eé] (de base|fondament)/i, /triptyque/i],
    answer:
      "Le modèle DIC structure toute politique de sécurité :\n\n• Disponibilité — le service répond quand nécessaire (sauvegardes, redondance).\n• Intégrité — données non altérées (hachages, signatures).\n• Confidentialité — accès réservés aux autorisés (chiffrement, droits).\n\nOn y ajoute souvent la Traçabilité (journaux).\n\nAu jury : rattachez chaque mesure proposée à un pilier DIC.",
    related: [{ moduleId: "sec", chapterId: "sec-base", label: "Cours : modèle DIC et menaces" }],
  },
  {
    patterns: [/pare-?feu/i, /firewall/i, /pfsense/i, /opnsense/i, /filtrage/i, /dmz/i],
    answer:
      "Le pare-feu filtre les flux (source, destination, port, protocole). Politique recommandée : default deny — tout interdire, autoriser explicitement.\n\n• Stateful : les réponses légitimes à vos requêtes sortantes passent sans règle.\n• DMZ : zone tampon pour les serveurs exposés (web, mail), isolée du LAN.\n• pfSense / OPNsense : parfaits en maquette SISR.\n\nExercice type : on vous donne un jeu de règles + un flux → justifier accept/rejet ET la règle qui matche.",
    related: [{ moduleId: "sec", chapterId: "sec-fw", label: "Cours : pare-feu et segmentation" }],
  },
  {
    patterns: [/sauvegarde/i, /backup/i, /3-2-1/i, /pra/i, /rpo/i, /rto/i, /ran[çc]ongiciel/i, /ransomware/i],
    answer:
      "Règle 3-2-1 : 3 copies, 2 supports différents, 1 copie hors site (ou hors ligne anti-rançongiciel).\n\n• Complète : tout, simple mais lourd.\n• Incrémentale : changements depuis la dernière sauvegarde (restauration plus longue).\n• Différentielle : changements depuis la dernière complète.\n\nRPO = perte de données max acceptable ; RTO = temps de reprise max.\n\nUn PRA n'existe que testé : faites un exercice de restauration chronométré et documentez-le pour l'E6.",
    related: [{ moduleId: "sec", chapterId: "sec-backup", label: "Cours : sauvegardes, PRA et durcissement" }],
  },
  {
    patterns: [/\bnat\b/i, /\bpat\b/i, /traduction d'adresse/i],
    answer:
      "NAT traduit les adresses privées en adresse publique pour sortir sur Internet.\n\n• NAT classique : 1 IP privée ↔ 1 IP publique.\n• PAT (surcharge) : plusieurs machines privées partagent UNE IP publique, distinguées par leurs ports source.\n\nC'est ce que fait votre box : tout votre LAN sort derrière une seule IP publique.",
    related: [{ moduleId: "net", chapterId: "net-route", label: "Cours : routage, NAT et services IP" }],
  },
  {
    patterns: [/routage/i, /route statique/i, /\bospf\b/i, /table de routage/i, /passerelle/i],
    answer:
      "Le routeur choisit le chemin vers le réseau de destination via sa table de routage.\n\n• Route statique : saisie à la main, simple, ne survit pas à une panne de lien.\n• OSPF : dynamique, à état de liens, convergence rapide — standard en entreprise.\n• Passerelle par défaut = la route « 0.0.0.0/0 » d'un poste client.\n\nRéflexe diagnostic : ping passerelle → ping 8.8.8.8 → nslookup.",
    related: [{ moduleId: "net", chapterId: "net-route", label: "Cours : routage, NAT et services IP" }],
  },
  {
    patterns: [/\bssh\b/i, /port 22/i, /connexion [àa] distance/i],
    answer:
      "SSH (port 22/TCP) est le standard d'administration à distance chiffrée.\n\nDurcissement express :\n• Interdire la connexion root (PermitRootLogin no)\n• Clés SSH plutôt que mots de passe\n• Changer le port par défaut + fail2ban\n\nVérifier les tentatives : journalctl -u ssh | grep Failed.",
    related: [{ moduleId: "lnx", chapterId: "lnx-services", label: "Cours : services et systemd" }],
  },
  {
    patterns: [/tcp|udp/i],
    answer:
      "TCP et UDP sont les deux protocoles de la couche Transport.\n\n• TCP : orienté connexion (poignée de main en 3 voies), acquittements, réémission → fiable (HTTP, SSH, SMTP).\n• UDP : sans connexion, sans contrôle → rapide (DNS, streaming, VoIP).\n\nÀ retenir : TCP = fiabilité, UDP = vitesse. Un flux sensible choisit TCP, un flux temps réel choisit UDP.",
    related: [{ moduleId: "net", chapterId: "net-osi", label: "Cours : modèles OSI et TCP/IP" }],
  },
  {
    patterns: [/ports? (courants?|à connaître|standards?)/i, /port 80/i, /port 443/i, /port 53/i],
    answer:
      "Les ports à connaître par cœur pour l'examen :\n\n• 20/21 FTP • 22 SSH • 23 Telnet (à bannir)\n• 25 SMTP • 53 DNS • 80 HTTP • 110 POP3 • 143 IMAP\n• 389 LDAP • 443 HTTPS • 3389 RDP • 3306 MySQL",
    related: [{ moduleId: "lnx", chapterId: "lnx-services", label: "Cours : services et systemd" }],
  },
  {
    patterns: [/ping/i, /traceroute|tracert/i, /diagnostic r[ée]seau/i, /d[ée]pannage/i, /panne r[ée]seau/i],
    answer:
      "Méthode de diagnostic réseau en 5 étapes :\n\n1. ping 127.0.0.1 → la pile TCP/IP locale fonctionne\n2. ping sa propre IP → la carte réseau répond\n3. ping la passerelle → le lien local est bon\n4. ping 8.8.8.8 → la sortie Internet fonctionne\n5. nslookup google.fr → la résolution DNS fonctionne\n\ntraceroute/tracert montre le chemin paquet par paquet et localise le saut qui casse.",
    related: [{ moduleId: "net", chapterId: "net-route", label: "Cours : routage, NAT et services IP" }],
  },
  {
    patterns: [/raid/i],
    answer:
      "Le RAID agrège des disques pour la performance ou la tolérance de panne :\n\n• RAID 0 : répartition, aucune redondance (rapide, risqué).\n• RAID 1 : miroir — un disque peut lâcher.\n• RAID 5 : répartition + parité, tolère 1 panne (min. 3 disques).\n• RAID 10 : miroirs répartis — le choix des serveurs critiques.\n\nRappel : RAID ≠ sauvegarde. Une corruption ou un rançongiciel se propage au miroir.",
    related: [{ moduleId: "sec", chapterId: "sec-backup", label: "Cours : sauvegardes et PRA" }],
  },
  {
    patterns: [/\be4\b/i, /\be6\b/i, /[ée]preuve/i, /dossier/i, /oral/i, /jury/i, /examen/i],
    answer:
      "Pour les épreuves SISR :\n\n• E4 : présentation d'une infrastructure réalisée (maquette, TP encadré). Documentez TOUT : schémas, adresses IP, captures, difficultés rencontrées.\n• E6 : situation professionnelle en entreprise. Structurez : contexte → besoin → solution → tests → bilan chiffré.\n\n• Citez des outils concrets (Proxmox, pfSense, Zabbix, Veeam).\n• Reliez vos choix au triptyque DIC.\n• Un tableau « avant/après » chiffré marque toujours le jury.\n\nRévisez les 5 modules ici : visez 80 %+ au labo quiz avant l'oral.",
  },
  {
    patterns: [/wsus/i, /mise[s]? à jour/i, /patch/i],
    answer:
      "WSUS centralise les mises à jour Microsoft : le serveur les télécharge, vous les approuvez, les clients installent selon une GPO.\n\nBonnes pratiques : anneaux test → production, approbation après validation, reporting des échecs. Un patch critique (CVE exploitée) se déploie sous 48 h, le reste suit le cycle mensuel.",
    related: [{ moduleId: "win", chapterId: "win-maint", label: "Cours : WSUS et supervision" }],
  },
  {
    patterns: [/binaire/i, /hexad[eé]cimal/i, /conversion/i, /base 2/i, /base 16/i, /octet/i],
    answer:
      "Les conversions de bases sont le calcul quotidien de l'admin réseau.\n\n• Décimal → binaire : divisions successives par 2, restes lus de bas en haut (13 = 1101).\n• Binaire → décimal : somme des puissances de 2 des bits à 1.\n• Hexadécimal : 1 chiffre = 4 bits (0x2C = 0010 1100 = 44).\n• Puissances de 2 d'un octet : 128, 64, 32, 16, 8, 4, 2, 1.\n\nRéflexe : les masques de sous-réseau (255, 240, 224…) sont des sommes de puissances de 2.",
    related: [{ moduleId: "mth", chapterId: "mth-bases", label: "Cours : binaire et hexadécimal" }],
  },
  {
    patterns: [/logique/i, /table de v[eé]rit[eé]/i, /connecteur/i, /\bet\b.*\bou\b/i, /xor/i],
    answer:
      "Les connecteurs logiques combinent des propositions vraies (1) ou fausses (0).\n\n• ET (∧) : 1 seulement si tout est à 1 → c'est « IP ET masque ».\n• OU (∨) : 1 si au moins une entrée est à 1.\n• NON (¬) : inverse. XOR : 1 si les entrées diffèrent.\n• Implication A⇒B fausse uniquement quand A=1 et B=0.\n\nAu processeur comme au pare-feu, tout n'est que ET/OU appliqués bit à bit.",
    related: [{ moduleId: "mth", chapterId: "mth-logique", label: "Cours : logique et tables de vérité" }],
  },
  {
    patterns: [/rgpd/i, /donn[eé]es personnelles/i, /cnil/i, /droit [àa] l'oubli/i],
    answer:
      "Le RGPD encadre tout traitement de données personnelles (nom, IP, cookie…).\n\n• Principes : licéité, finalité, minimisation, sécurité, conservation limitée.\n• Droits : accès, rectification, effacement, portabilité.\n• Violation de données : notification CNIL sous 72 h.\n• Sanctions : jusqu'à 20 M€ ou 4 % du CA mondial.\n\nCôté SISR : chiffrement, MFA et journalisation sont vos mesures de conformité.",
    related: [{ moduleId: "cej", chapterId: "cej-rgpd", label: "Cours : RGPD et données personnelles" }],
  },
  {
    patterns: [/godfrain/i, /cybercriminalit[eé]/i, /acc[eè]s frauduleux/i, /stad/i],
    answer:
      "La loi Godfrain (1988) punit les atteintes aux systèmes de traitement automatisé de données (STAD) :\n\n• Accès ou maintien frauduleux (même « pour voir »).\n• Entrave au fonctionnement (attaque en déni de service).\n• Altération ou suppression de données (ransomware).\n\nLes peines vont jusqu'à 5-7 ans. Un pentest sans convention écrite tombe sous le coup de la loi : toujours un cadre écrit.",
    related: [{ moduleId: "cej", chapterId: "cej-cyber", label: "Cours : droit du numérique" }],
  },
  {
    patterns: [/entretien/i, /embauche/i, /recrutement/i, /lettre de motivation/i, /\bcv\b/i],
    answer:
      "Pour candidater en IT :\n\n• CV : une page, compétences techniques réelles (TP, maquettes), projets avec chiffres.\n• Lettre : structure Vous (l'entreprise) — Moi (mes compétences) — Nous (ensemble).\n• Entretien : méthode STAR pour les questions comportementales (Situation, Task, Action, Result).\n• Prépare 3 histoires issues de tes TP : panne résolue, projet déployé, utilisateur formé.",
    related: [
      { moduleId: "fra", chapterId: "fra-cv", label: "Cours : CV et lettre de motivation" },
      { moduleId: "eng", chapterId: "eng-job", label: "Cours : entretien en anglais" },
    ],
  },
  {
    patterns: [/synth[eè]se/i, /documents?/i, /culture g[eé]n[eé]rale/i, /\be1\b/i],
    answer:
      "La synthèse de documents (épreuve E1) en 4 étapes :\n\n1. Lecture active : surligner idées clés et thèses de chaque texte.\n2. Tableau de confrontation : une ligne par idée, une colonne par document.\n3. Plan thématique en 2-3 parties qui CROISE les documents (pas de résumé texte par texte !).\n4. Rédaction objective, sans « je », citations courtes entre guillemets, longueur respectée (± 10 %).",
    related: [{ moduleId: "fra", chapterId: "fra-synthese", label: "Cours : la synthèse de documents" }],
  },
  {
    patterns: [/suites?/i, /arithm[eé]tique/i, /g[eé]om[eé]trique/i, /raison/i],
    answer:
      "Deux familles de suites au programme :\n\n• Arithmétique : on ADDITIONNE la raison r → u(n) = u0 + n×r.\n• Géométrique : on MULTIPLIE par la raison q → u(n) = u0 × qⁿ.\n\nPour reconnaître : calcule u(n+1) − u(n) (constant → arithmétique) ou u(n+1)/u(n) (constant → géométrique).\n\nApplication IT : croissance de stockage (arithmétique), trafic qui double (géométrique).",
    related: [{ moduleId: "mth", chapterId: "mth-suites", label: "Cours : suites arithmétiques et géométriques" }],
  },
];

const GREETING: TutorReply = {
  answer:
    "Salut 👋 Je suis NEXO, ton tuteur SISR. Pose-moi une question technique — par exemple :\n\n• « Comment découper un réseau en sous-réseaux ? »\n• « C'est quoi un VLAN trunk ? »\n• « Comment sécuriser SSH ? »\n• « Explique la règle 3-2-1 »\n\nJe réponds avec le programme du BTS en tête et je te renvoie vers le cours correspondant.",
};

const FALLBACK: TutorReply = {
  answer:
    "Hmm, cette question dépasse ma base de connaissances embarquée. Je couvre le référentiel SISR : réseaux (OSI, IP, VLAN, routage), Windows Server (AD, DNS, DHCP, GPO), Linux (shell, permissions, systemd, Bash), virtualisation (hyperviseurs, Docker) et cybersécurité (DIC, pare-feu, sauvegardes).\n\nReformule avec un de ces thèmes, ou utilise une des suggestions ci-dessous.",
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function askTutor(question: string, year: 1 | 2 = 2): TutorReply {
  const q = normalize(question.trim());
  const yearNote =
    year === 1
      ? "\n\n(Niveau 1re année : je me concentre sur le socle — OSI, adressage, AD, DNS/DHCP, Linux de base, hyperviseurs, DIC.)"
      : "";
  if (!q) return GREETING;
  if (/^(salut|bonjour|hello|hey|coucou|yo)\b/.test(q)) return GREETING;
  if (/^(merci|top|parfait|super|cool)/.test(q))
    return { answer: "Avec plaisir ! Une autre question ? Je reste branché sur le programme SISR. ⚡" };

  let best: { entry: Entry; score: number } | null = null;
  for (const entry of KB) {
    let score = 0;
    for (const p of entry.patterns) if (p.test(q)) score++;
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }
  if (best) return { answer: best.entry.answer + yearNote, related: best.entry.related };
  return {
    answer:
      FALLBACK.answer +
      (year === 1
        ? "\n\nAstuce 1re année : concentre-toi d'abord sur OSI, l'adressage IP, AD DS et les commandes Linux de base."
        : ""),
    related: FALLBACK.related,
  };
}

export const SUGGESTIONS = [
  "Comment découper un /24 en sous-réseaux ?",
  "VLAN access ou trunk, quelle différence ?",
  "L'ordre d'application des GPO ?",
  "chmod 750, ça veut dire quoi ?",
  "Snapshot ou sauvegarde ?",
  "La règle 3-2-1 expliquée",
  "Type 1 ou type 2, quel hyperviseur ?",
  "Comment diagnostiquer une panne réseau ?",
];

/* ----------------------------- flashcards ----------------------------- */

export type Flashcard = {
  id: string;
  moduleId: string;
  term: string;
  def: string;
};

/* Cartes 1re année (socle) — les autres arrivent en 2e année. */
export const CARD_YEAR: Record<string, 1 | 2> = {
  f1: 1, f2: 1, f3: 1, f4: 2, f5: 1, f6: 2, f7: 2, f8: 2,
  f9: 1, f10: 1, f11: 2, f12: 2, f13: 1, f14: 1, f15: 2, f16: 1, f17: 2, f18: 2,
  f19: 1, f20: 1, f21: 2, f22: 1, f23: 2, f24: 2,
};

export const cardsForYear = (year: 1 | 2) =>
  FLASHCARDS.filter((c) => (year === 2 ? true : (CARD_YEAR[c.id] ?? 1) === 1));

export const FLASHCARDS: Flashcard[] = [
  { id: "f1", moduleId: "net", term: "Encapsulation", def: "Chaque couche OSI ajoute son en-tête aux données de la couche supérieure ; le processus inverse au réception est la décapsulation." },
  { id: "f2", moduleId: "net", term: "Broadcast", def: "Adresse de diffusion vers toutes les machines d'un sous-réseau (dernière adresse de la plage). Jamais attribuée à un hôte." },
  { id: "f3", moduleId: "net", term: "ARP", def: "Protocole qui résout une adresse IP en adresse MAC sur le réseau local (requête ARP, table ARP)." },
  { id: "f4", moduleId: "net", term: "Trunk 802.1Q", def: "Lien entre équipements transportant plusieurs VLAN grâce à des trames étiquetées (tagged)." },
  { id: "f5", moduleId: "win", term: "Forêt / Domaine / OU", def: "Hiérarchie logique d'Active Directory : la forêt partage schéma et sécurité, le domaine est l'unité d'administration, l'OU organise les objets et cible les GPO." },
  { id: "f6", moduleId: "win", term: "Enregistrement SRV", def: "Enregistrement DNS de localisation de service. Indispensable à AD : les clients trouvent les contrôleurs de domaine grâce à lui." },
  { id: "f7", moduleId: "win", term: "LSDOU", def: "Ordre d'application des GPO : Local → Site → Domaine → OU. La dernière appliquée l'emporte en cas de conflit." },
  { id: "f8", moduleId: "win", term: "Kerberos", def: "Protocole d'authentification du domaine basé sur des tickets. Exige des horloges synchronisées (écart max ~5 min)." },
  { id: "f9", moduleId: "lnx", term: "chmod 644", def: "rw-r--r-- : le propriétaire lit et écrit, le groupe et les autres lisent seulement. Valeur classique pour un fichier." },
  { id: "f10", moduleId: "lnx", term: "Pipe ( | )", def: "Redirige la sortie standard d'une commande vers l'entrée standard de la suivante : cat log | grep error | wc -l." },
  { id: "f11", moduleId: "lnx", term: "systemctl enable", def: "Active le démarrage automatique d'un service au boot. Ne le démarre pas immédiatement : ajouter --now pour les deux." },
  { id: "f12", moduleId: "lnx", term: "Entrée cron 0 2 * * *", def: "Exécution chaque jour à 02:00. Format : minute, heure, jour du mois, mois, jour de la semaine." },
  { id: "f13", moduleId: "vir", term: "Hyperviseur type 1", def: "Installé directement sur le matériel (bare metal) : Proxmox VE, ESXi, Hyper-V. Destiné à la production." },
  { id: "f14", moduleId: "vir", term: "Snapshot ≠ sauvegarde", def: "Le snapshot dépend du disque d'origine et grossit dans le temps. Une sauvegarde est une copie indépendante, testée en restauration." },
  { id: "f15", moduleId: "vir", term: "Volume Docker", def: "Stockage persistant externalisé du conteneur (éphémère). Seules les données en volume survivent à la suppression du conteneur." },
  { id: "f16", moduleId: "sec", term: "DIC", def: "Disponibilité, Intégrité, Confidentialité — le triptyque de base de toute politique de sécurité (+ Traçabilité)." },
  { id: "f17", moduleId: "sec", term: "Default deny", def: "Politique pare-feu : tout est interdit par défaut, seuls les flux explicitement autorisés passent (moindre privilège)." },
  { id: "f18", moduleId: "sec", term: "RPO / RTO", def: "RPO : perte de données maximale acceptable. RTO : durée maximale d'interruption avant reprise. Dimensionnent sauvegardes et PRA." },
];
