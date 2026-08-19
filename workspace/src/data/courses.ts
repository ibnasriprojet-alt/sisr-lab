/* Contenu pédagogique BTS SIO — option SISR. */

export type Block =
  | { t: "p"; text: string }
  | { t: "list"; items: string[] }
  | { t: "code"; lang: string; code: string }
  | { t: "tip"; text: string };

export type Chapter = {
  id: string;
  title: string;
  minutes: number;
  blocks: Block[];
};

export type CourseModule = {
  id: string;
  code: string;
  title: string;
  tagline: string;
  icon: "net" | "server" | "terminal" | "cube" | "shield";
  color: string;
  chapters: Chapter[];
};

export const MODULES: CourseModule[] = [
  /* ============================== RÉSEAU ============================== */
  {
    id: "net",
    code: "NET-01",
    title: "Réseaux & TCP/IP",
    tagline: "Le socle : modèles, adressage, VLAN et routage.",
    icon: "net",
    color: "#56C8E8",
    chapters: [
      {
        id: "net-osi",
        title: "Modèles OSI et TCP/IP",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Le modèle OSI décompose la communication réseau en 7 couches, de la plus matérielle à la plus applicative. En SISR, on le cite en permanence pour diagnostiquer une panne « couche par couche ». Le modèle TCP/IP, utilisé sur Internet, regroupe ces couches en 4 niveaux.",
          },
          {
            t: "list",
            items: [
              "Couche 1 — Physique : câbles, fibres, signaux électriques (panne typique : câble débranché).",
              "Couche 2 — Liaison : adresses MAC, commutateurs, trames Ethernet.",
              "Couche 3 — Réseau : adresses IP, routeurs, paquets.",
              "Couche 4 — Transport : TCP (fiable, orienté connexion) et UDP (rapide, sans accusé).",
              "Couches 5 à 7 — Session, présentation, application : HTTP, DNS, SSH…",
            ],
          },
          {
            t: "p",
            text: "L'encapsulation est le mécanisme clé : chaque couche ajoute son en-tête aux données reçues de la couche supérieure. À la réception, le processus inverse (décapsulation) retire les en-têtes un à un.",
          },
          {
            t: "tip",
            text: "Moyen mnémotechnique pour les 7 couches : « Alors Partout Tout Le Monde Sait Préparer l'Apéro » (Physique → Application). À l'examen, savoir replacer un équipement (switch = L2, routeur = L3) rapporte vite des points.",
          },
        ],
      },
      {
        id: "net-ip",
        title: "Adressage IPv4 et sous-réseaux",
        minutes: 15,
        blocks: [
          {
            t: "p",
            text: "Une adresse IPv4 est codée sur 32 bits, écrite en 4 octets décimaux (ex. 192.168.10.15). Le masque de sous-réseau sépare la partie « réseau » de la partie « hôte ». Plus le masque est long (notation CIDR /n), plus le réseau est petit.",
          },
          {
            t: "list",
            items: [
              "/24 (255.255.255.0) → 254 hôtes utilisables.",
              "/26 (255.255.255.192) → 64 adresses, 62 hôtes — découpe un /24 en 4 sous-réseaux.",
              "1ère adresse = adresse réseau, dernière = broadcast : jamais attribuées.",
              "Plages privées : 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.",
            ],
          },
          {
            t: "code",
            lang: "calcul",
            code: "Réseau 192.168.10.0/26\n─────────────────────────\nSous-réseaux : 192.168.10.0 | .64 | .128 | .192\nMasque       : 255.255.255.192\nPour .64/26  : hôtes de 192.168.10.65 à .126\nBroadcast    : 192.168.10.127",
          },
          {
            t: "tip",
            text: "En E4/E6, on vous demandera presque toujours de justifier un découpage : indiquez le nombre de sous-réseaux, la plage d'hôtes et le broadcast. Entraînez-vous à découper un /24 en /27 « de tête ».",
          },
        ],
      },
      {
        id: "net-vlan",
        title: "VLAN et commutation gérée",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Un VLAN (réseau local virtuel, norme 802.1Q) segmente logiquement un commutateur physique en plusieurs domaines de diffusion. Les machines d'un VLAN ne voient pas le trafic des autres : sécurité et performance sans recâbler.",
          },
          {
            t: "list",
            items: [
              "Port access : appartient à un seul VLAN (poste utilisateur).",
              "Port trunk : transporte plusieurs VLAN entre switches (trames étiquetées/tagged).",
              "VLAN natif : trafic non étiqueté sur un trunk (VLAN 1 par défaut, à changer).",
              "VLAN de management : pour administrer l'équipement lui-même.",
            ],
          },
          {
            t: "code",
            lang: "cisco ios",
            code: "Switch(config)# vlan 10\nSwitch(config-vlan)# name ADMIN\nSwitch(config)# interface gigabitEthernet 0/1\nSwitch(config-if)# switchport mode access\nSwitch(config-if)# switchport access vlan 10\n! Trunk vers le switch voisin\nSwitch(config-if)# interface gigabitEthernet 0/24\nSwitch(config-if)# switchport mode trunk",
          },
          {
            t: "tip",
            text: "Deux postes dans le même VLAN mais sur deux switches différents communiquent uniquement si le lien entre les switches est en trunk avec ce VLAN autorisé. C'est la panne classique des TP Cisco.",
          },
        ],
      },
      {
        id: "net-route",
        title: "Routage, NAT et services IP",
        minutes: 14,
        blocks: [
          {
            t: "p",
            text: "Le routeur interconnecte des réseaux IP différents : il consulte sa table de routage pour choisir le meilleur chemin vers le réseau de destination. Le routage peut être statique (routes saisies à la main) ou dynamique (protocoles comme OSPF qui échangent leurs routes).",
          },
          {
            t: "list",
            items: [
              "Route statique : simple mais ne survit pas à une panne de lien.",
              "OSPF : protocole à état de liens, converge vite, adapté aux réseaux d'entreprise.",
              "NAT : traduit des adresses privées en adresse publique pour sortir sur Internet.",
              "PAT (surcharge NAT) : plusieurs machines privées partagent une seule IP publique via les ports.",
            ],
          },
          {
            t: "p",
            text: "DHCP attribue automatiquement IP, masque, passerelle et DNS aux clients (bail renouvelable). DNS traduit les noms en adresses IP : sans lui, il faudrait taper des adresses partout. Ces deux services sont indissociables d'une infrastructure qui fonctionne.",
          },
          {
            t: "tip",
            text: "Réflexe de diagnostic : ping loopback → ping IP locale → ping passerelle → ping 8.8.8.8 → résolution de nom (nslookup). Chaque étape valide une couche et localise la panne.",
          },
        ],
      },
    ],
  },

  /* ========================== WINDOWS SERVER ========================== */
  {
    id: "win",
    code: "SYS-02",
    title: "Windows Server",
    tagline: "AD DS, DNS, DHCP et stratégies de groupe.",
    icon: "server",
    color: "#F2B84B",
    chapters: [
      {
        id: "win-ad",
        title: "Active Directory Domain Services",
        minutes: 14,
        blocks: [
          {
            t: "p",
            text: "AD DS est l'annuaire central de Microsoft : il authentifie les utilisateurs et les ordinateurs du domaine et centralise la gestion. Sa structure logique va du plus large au plus fin : forêt → domaine → unités d'organisation (OU).",
          },
          {
            t: "list",
            items: [
              "Forêt : périmètre de sécurité et de schéma commun.",
              "Domaine : unité d'administration, ex. corp.local.",
              "OU : conteneur pour organiser les objets (users, computers, groups) et cibler les GPO.",
              "Objets : utilisateurs, groupes (globaux/universels), ordinateurs, imprimantes.",
              "Prérequis : un serveur DNS fonctionnel — AD ne s'installe pas sans.",
            ],
          },
          {
            t: "code",
            lang: "powershell",
            code: "# Créer une OU et un utilisateur en PowerShell\nNew-ADOrganizationalUnit -Name \"Compta\" -Path \"DC=corp,DC=local\"\nNew-ADUser -Name \"j.dupont\" -GivenName \"Julie\" -Surname \"Dupont\" `\n  -UserPrincipalName \"j.dupont@corp.local\" -Path \"OU=Compta,DC=corp,DC=local\" `\n  -AccountPassword (ConvertTo-SecureString \"P@ssw0rd!\" -AsPlainText -Force) `\n  -Enabled $true",
          },
          {
            t: "tip",
            text: "Kerberos est le protocole d'authentification du domaine : il repose sur des tickets et des horloges synchronisées (écart max 5 min). Une heure décalée = authentifications refusées.",
          },
        ],
      },
      {
        id: "win-dnsdhcp",
        title: "Rôles DNS et DHCP",
        minutes: 13,
        blocks: [
          {
            t: "p",
            text: "Le serveur DNS du domaine héberge la zone du domaine (corp.local) et enregistre automatiquement les machines jointes. Les enregistrements principaux : A (nom → IPv4), AAAA (nom → IPv6), CNAME (alias), MX (serveur mail), PTR (IP → nom, zone inversée).",
          },
          {
            t: "p",
            text: "Le rôle DHCP distribue la configuration IP : on définit une étendue (plage d'adresses + masque), des options (routeur 003, DNS 006) et des exclusions (adresses réservées aux serveurs et imprimantes).",
          },
          {
            t: "list",
            items: [
              "Réservation : associer une IP fixe à une adresse MAC précise.",
              "Durée de bail : courte pour le Wi-Fi invités, longue pour les postes fixes.",
              "DORA : Discover, Offer, Request, Acknowledge — le cycle d'attribution d'un bail.",
              "Serveur non autorisé dans AD = il ne distribuera rien (protection rogue DHCP).",
            ],
          },
          {
            t: "tip",
            text: "Pour un poste qui ne reçoit rien : ipconfig /release puis /renew côté client, et vérifier dans la console DHCP que l'étendue est active et autorisée. Deux classiques de l'épreuve E4.",
          },
        ],
      },
      {
        id: "win-gpo",
        title: "Stratégies de groupe (GPO)",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Les GPO déploient des paramètres aux utilisateurs et ordinateurs du domaine sans toucher chaque poste : mappings de lecteurs, fonds d'écran, restrictions, déploiement de logiciels, scripts d'ouverture de session…",
          },
          {
            t: "list",
            items: [
              "Ordre d'application LSDOU : Local → Site → Domaine → OU (la dernière appliquée gagne).",
              "Lien sur une OU = la GPO s'applique à ses objets (et sous-OU, sauf blocage).",
              "Filtrage de sécurité : limiter la GPO à un groupe précis.",
              "gpupdate /force côté client pour forcer le rafraîchissement.",
            ],
          },
          {
            t: "code",
            lang: "cmd",
            code: "REM Côté poste client\nipconfig /all            REM vérifier IP et DNS\ngpresult /r              REM voir les GPO appliquées\ngpupdate /force          REM forcer la mise à jour\nrsop.msc                 REM résultat des stratégies",
          },
          {
            t: "tip",
            text: "Scénario d'examen fréquent : « les utilisateurs de la Compta doivent avoir un lecteur Z: vers \\\\SRV\\Compta$ ». Réponse attendue : GPO liée à l'OU Compta → Préférences → Mappage de lecteur, avec item-level targeting si besoin.",
          },
        ],
      },
      {
        id: "win-maint",
        title: "WSUS, sauvegardes et supervision",
        minutes: 11,
        blocks: [
          {
            t: "p",
            text: "WSUS (Windows Server Update Services) centralise les mises à jour Microsoft : le serveur les télécharge, vous les approuvez, puis les postes clients les installent selon une GPO. On évite ainsi qu'un patch casse tout le parc le même jour.",
          },
          {
            t: "list",
            items: [
              "Anneaux de déploiement : test → production après validation.",
              "Windows Server Backup : sauvegarde complète du serveur, état du système inclus.",
              "Règle 3-2-1 : 3 copies, 2 supports différents, 1 copie hors site.",
              "Supervision : Zabbix / PRTG surveillent CPU, disques, services et alertent.",
            ],
          },
          {
            t: "p",
            text: "Un administrateur doit pouvoir prouver que son infrastructure est sauvegardée ET restaurable : un test de restauration trimestriel est une bonne pratique à citer dans vos dossiers E6.",
          },
          {
            t: "tip",
            text: "En E6, chiffrez : taille sauvegardée, fenêtre de sauvegarde nocturne, durée de restauration constatée. Un tableau « avant/après » vos améliorations fait toujours son effet devant le jury.",
          },
        ],
      },
    ],
  },

  /* ============================== LINUX ============================== */
  {
    id: "lnx",
    code: "SYS-03",
    title: "Systèmes Linux",
    tagline: "Shell, permissions, services et automatisation.",
    icon: "terminal",
    color: "#3ECF8E",
    chapters: [
      {
        id: "lnx-base",
        title: "Commandes essentielles",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Le shell est l'interface de l'administrateur Linux. Quelques commandes couvrent 90 % des besoins quotidiens : navigation, lecture de fichiers, recherche et enchaînements.",
          },
          {
            t: "code",
            lang: "bash",
            code: "pwd                    # où suis-je ?\nls -la /etc            # liste détaillée + fichiers cachés\ncd /var/log            # se déplacer\ncat syslog | grep error | wc -l   # pipeline : compter les erreurs\ntail -f /var/log/syslog           # suivre un log en direct\ncp -r src/ dst/        # copier un dossier\nfind / -name \"*.conf\"  # chercher des fichiers",
          },
          {
            t: "list",
            items: [
              "Le pipe | envoie la sortie d'une commande à l'entrée de la suivante.",
              "grep filtre des lignes, wc les compte, sort/uniq trient et dédoublent.",
              "> redirige vers un fichier (écrase), >> ajoute à la fin.",
              "man commande : le réflexe documentation, toujours disponible.",
            ],
          },
          {
            t: "tip",
            text: "Apprenez par cœur une vingtaine de commandes avec leurs options usuelles : le jour de l'épreuve, un terminal sans aide en ligne ne pardonne pas l'improvisation.",
          },
        ],
      },
      {
        id: "lnx-users",
        title: "Utilisateurs et permissions",
        minutes: 13,
        blocks: [
          {
            t: "p",
            text: "Chaque fichier appartient à un utilisateur et un groupe, avec trois jeux de droits : propriétaire (u), groupe (g), autres (o). Chaque jeu combine lecture (r=4), écriture (w=2) et exécution (x=1).",
          },
          {
            t: "code",
            lang: "bash",
            code: "useradd -m -s /bin/bash jdoe     # créer un utilisateur\npasswd jdoe                       # définir le mot de passe\nusermod -aG sudo jdoe             # ajouter au groupe sudo\nchmod 750 script.sh               # rwxr-x---\nchmod u+x deploy.sh               # ajouter l'exécution au propriétaire\nchown www-data:www-data /var/www  # changer propriétaire et groupe",
          },
          {
            t: "list",
            items: [
              "755 = rwxr-xr-x : classique pour un exécutable ou un dossier web.",
              "600 = rw------- : clé SSH privée, rien pour les autres.",
              "/etc/passwd liste les comptes, /etc/shadow stocke les hachages.",
              "sudo journalise chaque commande privilégiée — traçabilité.",
            ],
          },
          {
            t: "tip",
            text: "Question type : « chmod 644 fichier.txt, qui peut faire quoi ? » → propriétaire lit/écrit, groupe et autres lisent seulement. Savoir convertir binaire ↔ octal en 10 secondes est un vrai avantage.",
          },
        ],
      },
      {
        id: "lnx-services",
        title: "Services et réseau avec systemd",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "systemd gère le démarrage et les services : chaque démon (SSH, Apache, DNS…) est une « unit » qu'on démarre, arrête, redémarre et active au boot.",
          },
          {
            t: "code",
            lang: "bash",
            code: "systemctl status ssh        # état du service\nsystemctl enable --now nginx # activer au boot + démarrer\njournalctl -u ssh -f         # logs du service en direct\nip -br addr                  # adresses IP en bref\nss -tlnp                     # ports en écoute et processus\nufw allow 22/tcp             # ouvrir le pare-feu pour SSH",
          },
          {
            t: "list",
            items: [
              "enable ≠ start : enable = au prochain boot, start = maintenant.",
              "journalctl remplace les vieux fichiers de log dispersés.",
              "Un service qui boucle en échec : vérifier journalctl -xe et la syntaxe de sa config.",
              "Port 22 SSH, 80 HTTP, 443 HTTPS, 53 DNS — à connaître par cœur.",
            ],
          },
          {
            t: "tip",
            text: "Sur un serveur exposé, changez le port SSH par défaut et interdisez la connexion root directe (PermitRootLogin no). Deux lignes de /etc/ssh/sshd_config qui éliminent la majorité des attaques automatiques.",
          },
        ],
      },
      {
        id: "lnx-script",
        title: "Automatiser en Bash",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Un script Bash enchaîne des commandes avec de la logique : variables, conditions, boucles. C'est l'outil n°1 pour automatiser sauvegardes, vérifications et déploiements — un attendu explicite du référentiel SISR.",
          },
          {
            t: "code",
            lang: "bash",
            code: "#!/bin/bash\n# Sauvegarde nocturne du dossier web\nDATE=$(date +%F)\nDEST=\"/mnt/sauvegardes\"\n\ntar -czf \"$DEST/www-$DATE.tar.gz\" /var/www/html\n\nif [ $? -eq 0 ]; then\n  echo \"Sauvegarde OK : www-$DATE.tar.gz\"\nelse\n  echo \"ERREUR de sauvegarde\" >&2\nfi\n\n# Purge des sauvegardes > 14 jours\nfind $DEST -name \"www-*.tar.gz\" -mtime +14 -delete",
          },
          {
            t: "list",
            items: [
              "chmod +x script.sh puis ./script.sh pour l'exécuter.",
              "cron programme l'exécution : 0 2 * * * = tous les jours à 2 h.",
              "$? contient le code retour de la dernière commande (0 = succès).",
              "Toujours tester un script de suppression à blanc avant (echo avant rm).",
            ],
          },
          {
            t: "tip",
            text: "En E4/E6, un script commenté qui sauvegarde + purge + notifie par mail coche trois compétences d'un coup : automatisation, sauvegarde, supervision. C'est le combo gagnant.",
          },
        ],
      },
    ],
  },

  /* ========================== VIRTUALISATION ========================== */
  {
    id: "vir",
    code: "INF-04",
    title: "Virtualisation & conteneurs",
    tagline: "Hyperviseurs, VM et Docker pour vos maquettes.",
    icon: "cube",
    color: "#B78CFF",
    chapters: [
      {
        id: "vir-hyper",
        title: "Hyperviseurs type 1 et type 2",
        minutes: 11,
        blocks: [
          {
            t: "p",
            text: "Un hyperviseur est le logiciel qui crée et exécute des machines virtuelles. Le type 1 (bare metal) s'installe directement sur le matériel : ESXi, Proxmox VE, Hyper-V. Le type 2 tourne dans un système hôte : VirtualBox, VMware Workstation.",
          },
          {
            t: "list",
            items: [
              "Type 1 : performances proches du réel, pour la production. Proxmox VE est gratuit et très utilisé en PME.",
              "Type 2 : parfait pour les maquettes de TP sur votre PC portable.",
              "La VM « voit » un matériel virtuel : carte réseau, disque, BIOS virtuels.",
              "Overhead : chaque VM consomme des ressources même au repos — dimensionnez.",
            ],
          },
          {
            t: "p",
            text: "En SISR, on virtualise presque tout : le contrôleur de domaine, le DNS/DHCP, le serveur web… Une maquette d'infrastructure complète tient sur une seule machine physique avec 32 Go de RAM.",
          },
          {
            t: "tip",
            text: "Activez la virtualisation matérielle dans le BIOS (Intel VT-x / AMD-V) avant toute chose : sans elle, VirtualBox refuse de créer des VM 64 bits. Panne n°1 des installations de TP.",
          },
        ],
      },
      {
        id: "vir-vm",
        title: "Concevoir une VM proprement",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Une VM bien conçue suit un gabarit : nom normalisé (SRV-AD-01), ressources dimensionnées, réseau raccordé au bon segment et instantanés maîtrisés.",
          },
          {
            t: "list",
            items: [
              "Contrôleur de domaine : 2 vCPU / 4 Go / 60 Go suffisent largement.",
              "Snapshot avant chaque opération risquée (mise à jour, GPO, script).",
              "Un snapshot n'est PAS une sauvegarde : il grossit et casse la chaîne s'il vit trop longtemps.",
              "Template (modèle) : VM propre clonable pour déployer des serveurs identiques en minutes.",
              "Réseau : bridge pour exposer la VM sur le LAN, NAT pour l'isoler, VLAN pour segmenter.",
            ],
          },
          {
            t: "code",
            lang: "bonnes pratiques",
            code: "Nommage    : SRV-<RÔLE>-<N°>  →  SRV-WSUS-01\nDisques    : système + données séparés\nRéseau     : 1 vNIC par plan (LAN / admin / DMZ)\nSauvegarde : Veeam/Proxmox Backup Server, testée\nSnapshots  : < 72 h de vie, sinon consolidation",
          },
          {
            t: "tip",
            text: "Documentez vos maquettes avec captures IP + schéma Visio/draw.io : c'est exactement ce qu'on vous demandera dans les dossiers E4 et E6. Prenez l'habitude dès le premier TP.",
          },
        ],
      },
      {
        id: "vir-docker",
        title: "Conteneurs et Docker",
        minutes: 13,
        blocks: [
          {
            t: "p",
            text: "Un conteneur isole une application et ses dépendances en partageant le noyau de l'hôte : pas de système invité complet, donc démarrage en secondes et empreinte minimale. Docker est l'outil qui a popularisé ce modèle.",
          },
          {
            t: "code",
            lang: "bash",
            code: "docker pull nginx                 # télécharger l'image\ndocker run -d -p 8080:80 nginx    # lancer en arrière-plan\ndocker ps                         # conteneurs actifs\ndocker logs -f <id>               # suivre les logs\ndocker compose up -d              # pile multi-conteneurs\ndocker system prune               # nettoyer l'espace",
          },
          {
            t: "list",
            items: [
              "Image = modèle en lecture seule ; conteneur = instance exécutée.",
              "VM = isolation matérielle complète ; conteneur = isolation de processus.",
              "docker-compose décrit toute une pile (web + BDD) dans un fichier YAML.",
              "Un conteneur est éphémère : les données vivent dans des volumes, jamais dans le conteneur.",
            ],
          },
          {
            t: "tip",
            text: "L'argument qui fait mouche au jury : « j'ai remplacé 3 VM par des conteneurs, le déploiement est passé de 25 minutes à 40 secondes, et l'environnement de test est identique à la production ».",
          },
        ],
      },
    ],
  },

  /* ========================== CYBERSÉCURITÉ ========================== */
  {
    id: "sec",
    code: "SEC-05",
    title: "Cybersécurité",
    tagline: "DIC, pare-feu, sauvegardes et durcissement.",
    icon: "shield",
    color: "#F2706B",
    chapters: [
      {
        id: "sec-base",
        title: "Fondamentaux : modèle DIC et menaces",
        minutes: 11,
        blocks: [
          {
            t: "p",
            text: "Toute politique de sécurité s'appuie sur le triptyque DIC : Disponibilité (le service répond quand on en a besoin), Intégrité (les données ne sont pas altérées), Confidentialité (seules les personnes autorisées y accèdent). On y ajoute souvent la Traçabilité.",
          },
          {
            t: "list",
            items: [
              "Hameçonnage (phishing) : 1er vecteur d'intrusion en entreprise — le facteur humain.",
              "Rançongiciel : chiffre les données puis exige une rançon ; la sauvegarde hors ligne est la seule vraie protection.",
              "Ingénierie sociale : manipuler un humain plutôt qu'une machine.",
              "Attaque par force brute : contrée par verrouillage de compte + mots de passe robustes + MFA.",
            ],
          },
          {
            t: "p",
            text: "Le référentiel SISR attend aussi une veille active : CERT-FR, ANSSI, bulletins de vulnérabilités (CVE/CVSS). Citer une CVE récente et son correctif en E6 montre une vraie posture professionnelle.",
          },
          {
            t: "tip",
            text: "Pour chaque mesure que vous proposez, rattachez-la à un pilier DIC : « cette sauvegarde hors site garantit la Disponibilité, ce hachage vérifie l'Intégrité… ». Le jury adore cette rigueur.",
          },
        ],
      },
      {
        id: "sec-fw",
        title: "Pare-feu et segmentation",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Le pare-feu filtre les flux selon des règles (source, destination, port, protocole). Un pare-feu à état (stateful) suit les connexions : une réponse légitime à une requête sortante est acceptée sans règle explicite.",
          },
          {
            t: "list",
            items: [
              "Politique par défaut : tout interdire, autoriser explicitement (default deny).",
              "pfSense / OPNsense : pare-feu open source, parfait en maquette SISR.",
              "DMZ : zone tampon pour les serveurs exposés (web, mail), isolée du LAN.",
              "Segmentation : VLAN + règles inter-VLAN pour contenir une compromission.",
            ],
          },
          {
            t: "code",
            lang: "règles pfSense",
            code: "WAN  : deny any → any (implicite)\n       allow LAN net → any (sortie Internet)\nDMZ  : allow WAN → 172.16.99.10:443  (HTTPS du web)\n       deny  WAN → 172.16.99.0/24    (tout le reste)\nLAN  : allow → DMZ:443\n       deny  LAN → WAN:23 (Telnet interdit)",
          },
          {
            t: "tip",
            text: "Sachez lire un jeu de règles dans les deux sens : « ce flux passe-t-il ? ». Exercice classique : on vous donne 5 règles et un flux, vous justifiez l'acceptation ou le rejet ET la règle qui a matché.",
          },
        ],
      },
      {
        id: "sec-backup",
        title: "Sauvegardes, PRA et durcissement",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "La sauvegarde est la dernière ligne de défense. La règle 3-2-1 : 3 copies des données, sur 2 supports différents, dont 1 hors site (ou hors ligne contre les rançongiciels).",
          },
          {
            t: "list",
            items: [
              "Complète : tout, chaque fois — simple mais lente et gourmande.",
              "Incrémentale : uniquement ce qui a changé depuis la dernière sauvegarde (restauration plus longue).",
              "Différentielle : changements depuis la dernière complète (compromis courant).",
              "RPO : perte de données maximale acceptable. RTO : temps de reprise maximal.",
            ],
          },
          {
            t: "p",
            text: "Le durcissement (hardening) réduit la surface d'attaque : désactiver les services inutiles, comptes par défaut supprimés, mots de passe robustes, correctifs appliqués, accès distants en VPN + MFA, journalisation centralisée.",
          },
          {
            t: "tip",
            text: "Le PRA (plan de reprise d'activité) n'existe que s'il est testé : un exercice de restauration documenté avec chrono est un excellent livrable E6, bien plus parlant qu'une simple politique sur papier.",
          },
        ],
      },
    ],
  },
];

export const ALL_CHAPTERS = MODULES.flatMap((m) =>
  m.chapters.map((c) => ({ ...c, module: m }))
);

export function findChapter(id: string) {
  return ALL_CHAPTERS.find((c) => c.id === id) ?? null;
}

/* ----------------------- années (1re / 2e) -----------------------
   1re année : socle fondamental. 2e année : tout le programme,
   la 1re année reste accessible en révision.                        */

export const CHAPTER_YEAR: Record<string, 1 | 2> = {
  "net-osi": 1,
  "net-ip": 1,
  "net-switch": 1,
  "net-vlan": 2,
  "net-route": 2,
  "win-ad": 1,
  "win-dnsdhcp": 1,
  "win-gpo": 2,
  "win-maint": 2,
  "lnx-base": 1,
  "lnx-users": 1,
  "lnx-services": 2,
  "lnx-script": 2,
  "vir-hyper": 1,
  "vir-vm": 1,
  "vir-docker": 2,
  "sec-base": 1,
  "sec-fw": 2,
  "sec-backup": 2,
};

export const yearOf = (chapterId: string): 1 | 2 => CHAPTER_YEAR[chapterId] ?? 1;

/** Chapitres visibles pour une année donnée. */
export function chaptersForYear(year: 1 | 2) {
  return ALL_CHAPTERS.filter((c) => (year === 2 ? true : yearOf(c.id) === 1));
}

/** Modules contenant au moins un chapitre visible pour l'année. */
export function modulesForYear(year: 1 | 2) {
  const visible = new Set(chaptersForYear(year).map((c) => c.id));
  return MODULES.map((m) => ({
    ...m,
    chapters: m.chapters.filter((c) => visible.has(c.id)),
  })).filter((m) => m.chapters.length > 0);
}

export const TOTAL_CHAPTERS = ALL_CHAPTERS.length;
