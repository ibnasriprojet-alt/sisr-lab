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
  icon: "net" | "server" | "terminal" | "cube" | "shield" | "calc" | "scale" | "globe" | "pen";
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
  /* ============================== MATHS ============================== */
  {
    id: "mth",
    code: "MTH-01",
    title: "Mathématiques",
    tagline: "Binaire, logique, suites, fonctions et probabilités appliquées à l'informatique.",
    icon: "calc",
    color: "#F4849B",
    chapters: [
      {
        id: "mth-bases",
        title: "Bases de numération : binaire et hexadécimal",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Un ordinateur ne connaît que deux états : 0 et 1 (le bit). 8 bits forment un octet, capable de représenter 256 valeurs (0 à 255). Pour communiquer avec les machines, un admin doit savoir convertir entre décimal, binaire et hexadécimal — c'est la base du calcul d'adresses IP.",
          },
          {
            t: "list",
            items: [
              "Décimal → binaire : divisions successives par 2, on lit les restes de bas en haut (ex. 13 = 1101).",
              "Binaire → décimal : somme des puissances de 2 des bits à 1 (1101 = 8+4+0+1 = 13).",
              "Hexadécimal : base 16 (chiffres 0-9 puis A-F). Chaque chiffre hexa = 4 bits (ex. 2C = 0010 1100 = 44).",
              "Puissances de 2 à connaître : 1, 2, 4, 8, 16, 32, 64, 128 (un octet).",
            ],
          },
          {
            t: "code",
            lang: "conversions",
            code: "44      = 32 + 8 + 4      = 101100 en binaire\n101100  = 1011 | 0100      = B | 4      = 0x2C\n255     = 11111111         = 0xFF   (masque /32… non : octet plein)\n192     = 128 + 64         = 11000000 = 0xC0  (début des masques classiques)",
          },
          {
            t: "tip",
            text: "L'hexadécimal n'est pas un luxe : adresses MAC (AA:3F:…), codes couleur, affichage mémoire… tout est en hexa. Savoir convertir 0x2C en binaire « de tête » (2 → 0010, C → 1100) est un réflexe qui fait gagner un temps fou en TP.",
          },
        ],
      },
      {
        id: "mth-logique",
        title: "Logique, connecteurs et tables de vérité",
        minutes: 10,
        blocks: [
          {
            t: "p",
            text: "Une proposition est vraie (1) ou fausse (0). Les connecteurs logiques combinent les propositions — exactement ce que font les processeurs, les masques de sous-réseau et les règles de pare-feu.",
          },
          {
            t: "list",
            items: [
              "ET (∧) : vrai seulement si les deux sont vraies (un masque appliqué à une IP).",
              "OU (∨) : vrai si au moins une est vraie (règle « accepter si LAN ou VPN »).",
              "NON (¬) : inverse la valeur.",
              "OU exclusif (XOR) : vrai si exactement une des deux est vraie.",
              "Implication (A ⇒ B) : fausse uniquement quand A est vraie et B fausse.",
            ],
          },
          {
            t: "code",
            lang: "table de vérité",
            code: "A  B │ A ET B │ A OU B │ A XOR B │ NON A\n0  0 │   0    │   0    │    0    │  1\n0  1 │   0    │   1    │    1    │  1\n1  0 │   0    │   1    │    1    │  0\n1  1 │   1    │   1    │    0    │  0",
          },
          {
            t: "tip",
            text: "Lien direct avec le réseau : « IP ET masque » donne l'adresse réseau — c'est littéralement un ET logique bit à bit. Le jour où ça fait tilt, le subnetting devient mécanique.",
          },
        ],
      },
      {
        id: "mth-suites",
        title: "Suites arithmétiques et géométriques",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Une suite modélise une évolution : capacité disque qui augmente chaque mois, trafic qui double chaque année, coût amorti d'un serveur. Deux familles dominent au BTS : arithmétique (on ajoute) et géométrique (on multiplie).",
          },
          {
            t: "list",
            items: [
              "Arithmétique de raison r : u(n) = u0 + n×r. Somme des n premiers termes : n×(premier + dernier)/2.",
              "Géométrique de raison q : u(n) = u0 × qⁿ. Somme : u0 × (1 − qⁿ)/(1 − q).",
              "Reconnaître le type : différences constantes → arithmétique ; rapports constants → géométrique.",
              "Limite : géométrique avec |q| < 1 converge vers 0 (décroissance, taux de panne…).",
            ],
          },
          {
            t: "code",
            lang: "exemple",
            code: "Un NAS contient 4 To et on ajoute 2 To par an (arithmétique, r = 2) :\n  capacité année n : C(n) = 4 + 2n   → 14 To en année 5.\n\nLe trafic web double chaque année (géométrique, q = 2) :\n  T(n) = 500 × 2ⁿ Go   → 16 000 Go en année 5.",
          },
          {
            t: "tip",
            text: "Dans les exercices BTS, la question 1 demande presque toujours « montrer que la suite est arithmétique ou géométrique » : calculez u(n+1) − u(n) ou u(n+1)/u(n) et concluez avant d'appliquer les formules.",
          },
        ],
      },
      {
        id: "mth-fonctions",
        title: "Étude de fonctions et dérivées",
        minutes: 14,
        blocks: [
          {
            t: "p",
            text: "Une fonction associe à chaque valeur d'entrée une sortie : coût en fonction du nombre de serveurs, temps de réponse en fonction de la charge. L'étude de fonction (domaine, dérivée, tableau de variations, limites) permet de trouver optimums et asymptotes — les « limites physiques » d'un système.",
          },
          {
            t: "list",
            items: [
              "Domaine de définition : valeurs de x pour lesquelles f(x) existe (attention aux divisions par 0).",
              "Dérivée f′(x) : mesure la vitesse de variation. f′ > 0 → f croît ; f′ < 0 → f décroît.",
              "Extremum local : f′ s'annule en changeant de signe.",
              "Asymptote horizontale : limite finie de f en ±∞ (ex. saturation d'un lien).",
            ],
          },
          {
            t: "code",
            lang: "méthode",
            code: "f(x) = x³ − 3x + 1\n1. Domaine : ℝ\n2. f′(x) = 3x² − 3 = 3(x−1)(x+1)\n3. f′ s'annule en −1 et 1 :\n     x :  −∞   −1    1   +∞\n     f′ :     +  0  −  0  +\n     f  :  ↗ max ↘ min ↗\n4. Maximum local f(−1) = 3, minimum local f(1) = −1",
          },
          {
            t: "tip",
            text: "Le tableau de variations est la colonne vertébrale de l'étude : présentez-le proprement, il rapporte des points même si les calculs de limites sont approximatifs.",
          },
        ],
      },
      {
        id: "mth-probas",
        title: "Probabilités et statistiques",
        minutes: 13,
        blocks: [
          {
            t: "p",
            text: "Fiabilité d'un disque, taux d'erreurs sur un lien, détection d'intrusions : derrière tout indicateur de supervision se cachent des probabilités. Au BTS : probabilités conditionnelles, théorème des probabilités totales, et statistiques descriptives (moyenne, écart-type).",
          },
          {
            t: "list",
            items: [
              "P(A∩B) = P(A) × P(B|A) : probabilité de l'intersection.",
              "Probabilités totales : P(B) = Σ P(Aᵢ) × P(B|Aᵢ) sur une partition (arbre pondéré).",
              "Moyenne x̄ = Σ nᵢxᵢ / N ; médiane : valeur qui partage la série en deux.",
              "Écart-type σ : mesure la dispersion. Un petit σ = système stable et prévisible.",
            ],
          },
          {
            t: "code",
            lang: "arbre classique",
            code: "Un parc : 60 % de disques SSD (panne annuelle 2 %), 40 % de HDD (panne 8 %).\nProbabilité qu'un disque choisi au hasard tombe en panne :\n  P(Panne) = 0,60 × 0,02 + 0,40 × 0,08\n           = 0,012 + 0,032 = 0,044 → 4,4 %\nUn disque est en panne : proba que ce soit un HDD ?\n  P(HDD|Panne) = 0,032 / 0,044 ≈ 0,727 → 72,7 %",
          },
          {
            t: "tip",
            text: "Faites toujours l'arbre pondéré avant de calculer : il structure le raisonnement, et la formule de Bayes (dernière question) n'est plus qu'une division.",
          },
        ],
      },
    ],
  },
  /* ============================== CEJ ============================== */
  {
    id: "cej",
    code: "CEJ-01",
    title: "Économie, droit & management",
    tagline: "CEJM : entreprises, contrats, RGPD et droit du numérique — le cadre légal du métier.",
    icon: "scale",
    color: "#7EB3F7",
    chapters: [
      {
        id: "cej-entreprise",
        title: "L'entreprise et ses formes juridiques",
        minutes: 11,
        blocks: [
          {
            t: "p",
            text: "L'entreprise combine travail, capital et organisation pour produire des biens ou services. Son statut juridique conditionne la responsabilité des dirigeants, le capital minimum et la fiscalité — des notions qui tombent à l'écrit CEJM et reviennent en E6 quand on justifie un choix de prestataire.",
          },
          {
            t: "list",
            items: [
              "Entreprise individuelle / micro-entreprise : simplicité, mais patrimoine personnel exposé (sauf choix EIRL/EURL).",
              "SARL : 2 à 100 associés, responsabilité limitée aux apports, gérant.",
              "SAS / SASU : grande liberté statutaire, président, prisée des startups IT.",
              "SA : capital minimum 37 000 €, conseil d'administration, pour les grandes structures.",
              "Critères de choix : responsabilité, nombre d'associés, besoin de financement, image.",
            ],
          },
          {
            t: "p",
            text: "Côté organisation, distingue PME (moins de 250 salariés), ETI et grandes entreprises. Une ESN (Entreprise de Services du Numérique) comme celle de ton stage est souvent une SAS ou SARL du secteur tertiaire.",
          },
          {
            t: "tip",
            text: "En CEJM, cite toujours l'exemple concret de ton entreprise d'accueil (statut, effectif, marché) : les correcteurs valorisent l'ancrage réel plutôt que la récitation du cours.",
          },
        ],
      },
      {
        id: "cej-contrats",
        title: "Le contrat : formation et responsabilité",
        minutes: 11,
        blocks: [
          {
            t: "p",
            text: "Un contrat est un accord de volontés créant des obligations. En informatique, tout est contrat : licence logicielle, contrat de maintenance, SLA d'hébergement, CGV. Sa validité exige des conditions précises, et son inexécution engage la responsabilité.",
          },
          {
            t: "list",
            items: [
              "Conditions de validité : consentement libre et éclairé, capacité juridique, contenu licite et certain.",
              "Vices du consentement : erreur, dol (tromperie), violence → nullité possible.",
              "Responsabilité contractuelle : inexécution ou mauvaise exécution (mise en demeure, dommages-intérêts).",
              "Responsabilité civile délictuelle : dommage causé hors contrat (faute, lien de causalité, préjudice).",
              "Obligation de moyens (faire de son mieux) vs obligation de résultat (le résultat est dû).",
            ],
          },
          {
            t: "p",
            text: "Exemple typique : un hébergeur avec SLA « disponibilité 99,9 % » a une obligation de résultat sur ce chiffre ; une panne de 8 h sans clause de force majeure ouvre droit à indemnisation.",
          },
          {
            t: "tip",
            text: "Réflexe d'examen : qualifier (contrat ou délit ?), vérifier la validité, puis identifier le type d'obligation et les sanctions. Ce plan en trois temps couvre la majorité des cas pratiques.",
          },
        ],
      },
      {
        id: "cej-rgpd",
        title: "RGPD et données personnelles",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Le RGPD (règlement européen 2016/679, applicable depuis 2018) encadre tout traitement de données personnelles — toute information identifiant directement ou indirectement une personne (nom, IP, cookie, géolocalisation). En SISR, tu es en première ligne : un serveur mal sécurisé peut constituer une violation du règlement.",
          },
          {
            t: "list",
            items: [
              "Principes : licéité, finalité déterminée, minimisation, exactitude, conservation limitée, sécurité.",
              "Droits des personnes : accès, rectification, effacement (« droit à l'oubli »), portabilité, opposition.",
              "Acteurs : responsable de traitement, sous-traitant, DPO (délégué à la protection des données), CNIL.",
              "Violation de données : notification à la CNIL sous 72 h, et aux personnes si risque élevé.",
              "Sanctions : jusqu'à 20 M€ ou 4 % du chiffre d'affaires mondial.",
            ],
          },
          {
            t: "code",
            lang: "procédure violation",
            code: "1. Contenir : isoler la machine compromise, couper l'accès.\n2. Évaluer : quelles données ? combien de personnes ? risque ?\n3. Notifier la CNIL (72 h max) via le DPO.\n4. Informer les personnes concernées si risque élevé.\n5. Documenter : registre des violations, mesures correctives.",
          },
          {
            t: "tip",
            text: "Lien direct SISR : chiffrement des sauvegardes, journalisation des accès, MFA et cloisonnement réseau sont vos meilleurs arguments RGPD. Au jury E6, reliez chaque mesure technique à un principe du règlement.",
          },
        ],
      },
      {
        id: "cej-cyber",
        title: "Droit du numérique et cybercriminalité",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Le droit français sanctionne spécifiquement les atteintes aux systèmes informatiques. Un admin qui « dépanne » sans autorisation peut tomber sous le coup de la loi — connaître ces textes protège autant l'entreprise que toi.",
          },
          {
            t: "list",
            items: [
              "Loi Godfrain (1988) : accès et maintien frauduleux dans un STAD, entrave au fonctionnement, altération de données — jusqu'à 5-7 ans d'emprisonnement.",
              "Fraude informatique (art. 313-1) : manipulation de données pour un gain (faux virements, détournements).",
              "LCEN (2004) : responsabilité des hébergeurs, obligation de conservation des données de connexion.",
              "Code de la propriété intellectuelle : contrefaçon de logiciels, usage de licences non conformes.",
              "Obligation de sécurisation : les opérateurs doivent protéger leurs systèmes (NIS 2 pour les secteurs essentiels).",
            ],
          },
          {
            t: "p",
            text: "Côté preuve : la journalisation (logs horodatés, intègres) est indispensable pour déposer plainte et identifier l'auteur. Un test d'intrusion sans convention écrite = accès frauduleux, même avec de bonnes intentions.",
          },
          {
            t: "tip",
            text: "À retenir pour l'écrit : le triptyque « accès frauduleux / entrave / altération » de la loi Godfrain tombe régulièrement. Associez chaque infraction à un exemple technique (scan non autorisé, ransomware, défiguration de site).",
          },
        ],
      },
    ],
  },
  /* ============================== ANGLAIS ============================== */
  {
    id: "eng",
    code: "ENG-01",
    title: "Anglais professionnel",
    tagline: "Vocabulaire IT, e-mails, entretiens et présentations — l'anglais du métier.",
    icon: "globe",
    color: "#F0A868",
    chapters: [
      {
        id: "eng-it",
        title: "IT English : le vocabulaire qui sauve",
        minutes: 10,
        blocks: [
          {
            t: "p",
            text: "La documentation technique est en anglais : manuels Cisco, erreurs Windows Event Viewer, forums Stack Overflow. Maîtriser le vocabulaire de base permet de dépanner plus vite — et l'épreuve orale d'anglais s'appuie souvent sur un document IT.",
          },
          {
            t: "list",
            items: [
              "Réseau : throughput (débit), bandwidth (bande passante), downtime (indisponibilité), outage (panne), latency, bandwidth cap.",
              "Incidents : to troubleshoot (dépanner), to escalate (escalader), workaround (solution de contournement), rollback (retour arrière).",
              "Matériel : storage, blade server, rack, power supply, spare part (pièce de rechange).",
              "Verbes clés : to deploy, to configure, to back up / to restore, to monitor, to patch.",
            ],
          },
          {
            t: "code",
            lang: "phrases de ticket",
            code: "User report  : \"The shared drive is unreachable since this morning.\"\nDiagnostic   : \"I'm checking the link status and the DNS resolution.\"\nAction       : \"I'll reboot the service and monitor it for an hour.\"\nFollow-up    : \"Could you confirm whether the issue still occurs?\"\nClosure      : \"The incident is resolved. A fix will be deployed on Friday.\"",
          },
          {
            t: "tip",
            text: "Apprends 5 mots par jour dans un contexte réel (une erreur rencontrée en TP), pas dans une liste. En trois mois, tu lis la doc sans dictionnaire.",
          },
        ],
      },
      {
        id: "eng-email",
        title: "Écrire un e-mail professionnel en anglais",
        minutes: 10,
        blocks: [
          {
            t: "p",
            text: "L'e-mail professionnel anglais suit des codes précis : objet court et explicite, formule d'appel adaptée, une idée par paragraphe, demande claire et formule de politesse. Les fautes classiques : traduire « Cordialement » mot à mot ou tutoyer tout le monde.",
          },
          {
            t: "list",
            items: [
              "Objet : « Request: server access for the accounting team » — action + sujet.",
              "Appel : Dear Mr. Smith (formel), Hi John (collègue), To whom it may concern (inconnu).",
              "Demander : « Could you please… », « I would like to request… », « May I ask for… ».",
              "Annoncer un délai : « The maintenance is scheduled for Friday 10 pm. »",
              "Clôture : Best regards / Kind regards (standard), Sincerely (très formel).",
            ],
          },
          {
            t: "code",
            lang: "modèle",
            code: "Subject: Scheduled maintenance — Friday, October 18th\n\nDear Ms. Carter,\n\nPlease be informed that a maintenance window is scheduled\non Friday, October 18th from 10:00 pm to midnight. During\nthis period, access to the file server may be interrupted.\n\nCould you please inform your team and confirm that this\ntime slot is suitable?\n\nBest regards,\nKarim Benali — IT Support",
          },
          {
            t: "tip",
            text: "Garde 3 modèles types (annonce de maintenance, demande d'information, compte rendu d'incident) et adapte-les : le jour de l'épreuve, tu écriras vite et sans stress.",
          },
        ],
      },
      {
        id: "eng-job",
        title: "Entretien d'embauche en anglais",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Les recruteurs tech posent souvent quelques questions en anglais pour tester ta capacité à évoluer dans un environnement international. La clé : des réponses structurées et concrètes, pas des phrases parfaites.",
          },
          {
            t: "list",
            items: [
              "« Tell me about yourself » : parcours + compétences + objectif, en 1 minute.",
              "« Why this job? » : relie tes projets (TP, stage) au poste visé.",
              "Méthode STAR pour les questions comportementales : Situation, Task, Action, Result.",
              "Vocabulaire : internship (stage), apprenticeship (alternance), skills, background, challenge, achievement.",
              "Questions à poser : « What does a typical day look like? », « How is the team organized? »",
            ],
          },
          {
            t: "code",
            lang: "réponse STAR",
            code: "Situation : \"During my internship, users could not print from the new VLAN.\"\nTask      : \"I had to identify why DHCP leases were not delivered.\"\nAction    : \"I checked the trunk configuration and found the missing VLAN tag.\"\nResult    : \"Printing was restored in 30 minutes and I documented the fix.\"",
          },
          {
            t: "tip",
            text: "Prépare 3 histoires STAR issues de tes TP (panne résolue, projet déployé, utilisateur formé) et réutilise-les : elles couvrent 90 % des questions comportementales.",
          },
        ],
      },
      {
        id: "eng-meet",
        title: "Réunions et présentations techniques",
        minutes: 11,
        blocks: [
          {
            t: "p",
            text: "Présenter un projet technique en anglais (ou animer une réunion) demande des phrases de structuration simples. L'auditoire suit un plan annoncé, des transitions marquées et une conclusion qui résume.",
          },
          {
            t: "list",
            items: [
              "Ouvrir : « The purpose of this meeting is to… », « Today I'll present… »",
              "Structurer : « First… Then… Finally… », « Let's move on to… », « This leads me to my next point. »",
              "Expliquer un schéma : « As you can see on this diagram… », « The firewall sits between… »",
              "Gérer les questions : « That's a good question », « I'll come back to that later », « To sum up… »",
            ],
          },
          {
            t: "code",
            lang: "squelette de démo",
            code: "1. \"I'm going to show you our virtualized infrastructure.\"\n2. \"First, the network topology: we have three VLANs…\"\n3. \"Then, the Active Directory design with two OUs…\"\n4. \"Finally, the backup policy following the 3-2-1 rule.\"\n5. \"To sum up, this setup improved availability by 20%.\"",
          },
          {
            t: "tip",
            text: "Répète ta présentation à voix haute avec un chrono : une démo technique tient en 5 minutes, questions comprises. Mieux vaut court et clair que long et approximatif.",
          },
        ],
      },
    ],
  },
  /* ============================== FRANÇAIS ============================== */
  {
    id: "fra",
    code: "FRA-01",
    title: "Communication & français",
    tagline: "Écrits professionnels, CV, synthèse de documents et oraux E4/E6.",
    icon: "pen",
    color: "#A3D9A5",
    chapters: [
      {
        id: "fra-ecrits",
        title: "Écrits professionnels : mail, note, compte rendu",
        minutes: 10,
        blocks: [
          {
            t: "p",
            text: "En entreprise, chaque écrit engage son auteur et son service. Un bon écrit professionnel est utile (il fait avancer), bref (il va à l'essentiel) et irréprochable (orthographe, ton). Trois formats reviennent sans cesse : le mail, la note interne et le compte rendu.",
          },
          {
            t: "list",
            items: [
              "Mail : objet explicite, une demande par mail, formule de politesse adaptée au destinataire.",
              "Note interne : émetteur, destinataire, objet, date ; un problème + une solution, pas de récit.",
              "Compte rendu : neutre et factuel — décisions prises, actions, responsables, échéances.",
              "Règle des 5 W : qui, quoi, quand, où, pourquoi (et comment).",
              "À éviter : jargon non expliqué, abréviations internes, ironie, majuscules (= crier).",
            ],
          },
          {
            t: "code",
            lang: "note interne",
            code: "NOTE INTERNE\nDe : Service informatique        Date : 12/03\nÀ  : Ensemble du personnel\nObjet : Coupure réseau du 15/03\n\nUne maintenance du cœur de réseau aura lieu le samedi\n15/03 de 8h à 10h. L'accès aux serveurs sera interrompu.\nPensez à enregistrer vos travaux la veille.\n\nContact : poste 4521 en cas d'urgence.",
          },
          {
            t: "tip",
            text: "Relis à voix haute avant d'envoyer : les phrases bancales s'entendent. Un écrit relit deux fois paraît toujours plus professionnel qu'un premier jet brillant.",
          },
        ],
      },
      {
        id: "fra-cv",
        title: "CV et lettre de motivation",
        minutes: 11,
        blocks: [
          {
            t: "p",
            text: "Pour un stage ou une alternance en SISR, le CV tient sur une page et met en avant les compétences techniques réelles : tes TP et maquettes sont tes preuves. La lettre, elle, suit la structure « Vous — Moi — Nous ».",
          },
          {
            t: "list",
            items: [
              "CV : état civil + contact, formation, compétences techniques (OS, réseaux, outils), projets/TP, expériences, centres d'intérêt.",
              "Chiffre tes compétences : « Active Directory : gestion de 120 comptes en TP encadré ».",
              "Lettre : VOUS (l'entreprise, pourquoi elle), MOI (ce que je sais faire), NOUS (ce qu'on fera ensemble).",
              "Une page, PDF, nom de fichier propre : prenom-nom-cv.pdf.",
              "Aucune faute : fais relire, puis relis encore.",
            ],
          },
          {
            t: "code",
            lang: "extrait de lettre",
            code: "« Votre ESN accompagne les PME de la région dans la\nsécurisation de leurs infrastructures, un enjeu que j'ai\napproché en construisant une maquette pfSense au lycée.\n\nJe souhaite mettre à profit ma rigueur de documentation\net mon goût pour le dépannage au sein de votre équipe\nsupport, et apprendre à vos côtés les méthodes d'un\ninfogérant professionnel. »",
          },
          {
            t: "tip",
            text: "Ton profil GitHub ou un dossier de maquettes (captures, schémas) vaut tous les adjectifs du monde : mets le lien sur le CV. Les recruteurs tech cliquent toujours.",
          },
        ],
      },
      {
        id: "fra-synthese",
        title: "La synthèse de documents (E1)",
        minutes: 13,
        blocks: [
          {
            t: "p",
            text: "L'épreuve de culture générale (E1) demande une synthèse objective et structurée de plusieurs documents autour d'un thème, suivie d'une écriture personnelle. L'erreur classique : résumer les textes un par un au lieu de croiser leurs idées.",
          },
          {
            t: "list",
            items: [
              "Étape 1 — lecture active : surligner idées clés, repérer thèses, exemples, registres.",
              "Étape 2 — tableau de confrontation : une ligne par idée, une colonne par document.",
              "Étape 3 — plan thématique (2-3 parties) organisé autour des idées communes et opposées.",
              "Étape 4 — rédaction objective : pas de « je », citations courtes entre guillemets, connecteurs logiques.",
              "Respecter la longueur demandée (généralement ± 10 %).",
            ],
          },
          {
            t: "p",
            text: "Exemple de plan sur « le télétravail » : I. Les promesses (flexibilité, écologie) — II. Les limites (isolement, surconnexion) — III. Les conditions de réussite (management, droit à la déconnexion). Chaque partie croise les documents.",
          },
          {
            t: "tip",
            text: "Chronomètre-toi : 2 h pour la synthèse. Donne 45 min au tableau de confrontation — c'est lui qui fait la qualité du plan, donc de la note.",
          },
        ],
      },
      {
        id: "fra-oral",
        title: "Réussir sa présentation orale (E4/E6)",
        minutes: 12,
        blocks: [
          {
            t: "p",
            text: "Aux oraux E4 et E6, le jury n'évalue pas seulement la technique : il évalue un futur professionnel qui sait rendre compte. Une présentation structurée, un débit posé et un support lisible font la différence entre 12 et 16.",
          },
          {
            t: "list",
            items: [
              "Structure gagnante : contexte → besoin → solution mise en œuvre → tests et validation → bilan chiffré.",
              "Support : un schéma réseau propre vaut trois slides de texte ; légende et couleurs signifiantes.",
              "Posture : debout, regarde le jury, mains ouvertes, pas de lecture de notes.",
              "Gestion du temps : répète avec chrono ; garde 2 minutes de marge pour les questions.",
              "Questions : reformule avant de répondre (« Si je comprends bien… »), avoue honnêtement ce que tu ne sais pas.",
            ],
          },
          {
            t: "p",
            text: "Anticipe les questions types : « Pourquoi ce choix plutôt qu'un autre ? », « Qu'auriez-vous fait différemment ? », « Quel coût / quel gain ? ». Prépare une réponse chiffrée pour chacune.",
          },
          {
            t: "tip",
            text: "Filme-toi une fois avec ton téléphone : dix minutes gênantes qui corrigent les tics de langage (« du coup », « en fait ») mieux que n'importe quel conseil.",
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
  "mth-bases": 1,
  "mth-logique": 1,
  "mth-suites": 1,
  "mth-fonctions": 2,
  "mth-probas": 2,
  "cej-entreprise": 1,
  "cej-contrats": 1,
  "cej-rgpd": 2,
  "cej-cyber": 2,
  "eng-it": 1,
  "eng-email": 1,
  "eng-job": 2,
  "eng-meet": 2,
  "fra-ecrits": 1,
  "fra-cv": 1,
  "fra-synthese": 2,
  "fra-oral": 2,
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
