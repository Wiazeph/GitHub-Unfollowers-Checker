import type { Translation } from './en'

/** Français */
export const fr: Translation = {
  header: {
    title: 'Vérificateur d’abonnements',
    subtitle:
      'Découvrez qui vous suivez sans être suivi en retour — sur les plateformes que vous utilisez.',
  },

  selector: {
    label: 'Plateforme',
  },

  theme: {
    toLight: 'Passer au thème clair',
    toDark: 'Passer au thème sombre',
    light: 'Thème clair',
    dark: 'Thème sombre',
  },

  language: {
    label: 'Langue',
  },

  auth: {
    signIn: 'Se connecter',
    signOut: 'Se déconnecter',
  },

  search: {
    check: 'Vérifier',
    checking: 'Vérification…',
    handleAriaLabel: 'Identifiant {{platform}}',
    placeholderGithub: 'Saisissez un nom d’utilisateur GitHub',
    placeholderGithubAuthed: 'Rechercher un autre utilisateur…',
    placeholderBluesky: 'Saisissez un identifiant Bluesky (nom.bsky.social)',
    placeholderBlueskyAuthed: 'Rechercher un autre identifiant…',
    invalidGithub: 'Veuillez saisir un nom d’utilisateur GitHub valide',
    invalidBluesky: 'Veuillez saisir un identifiant Bluesky valide (ex. nom.bsky.social)',
  },

  results: {
    ownSummary_one: '<0>{{count}} utilisateur</0> ne vous suit pas en retour — sélectionnez pour retirer.',
    ownSummary_other: '<0>{{count}} utilisateurs</0> ne vous suivent pas en retour — sélectionnez pour retirer.',
    otherSummary: '<0>@{{handle}}</0> n’est pas suivi en retour par <1>{{label}}</1>',
    countLabel_one: '{{count}} utilisateur',
    countLabel_other: '{{count}} utilisateurs',
    onlyOwnAccount: 'Vous ne pouvez retirer des personnes que de votre propre compte.',
    backToMyList: 'Retour à ma liste',
    readOnly:
      'Le retrait sur {{platform}} n’est pas encore disponible — c’est une vue en lecture seule pour l’instant.',
    signInCta: 'Connectez-vous pour retirer les personnes qui ne vous suivent pas en retour.',
    signInNote:
      'La consultation fonctionne sans connexion — vous ne vous connectez que pour vous désabonner.',
    privacyNote:
      'Lu via l’API officielle. Rien n’est stocké ; les jetons n’atteignent jamais votre navigateur.',
    signInWith: 'Se connecter avec {{platform}}',
    signingIn: 'Redirection…',
    blueskySignInCta:
      'Connectez-vous avec Bluesky pour retirer les personnes qui ne vous suivent pas en retour.',
    blueskyHandlePlaceholder: 'votre-identifiant.bsky.social',
    blueskyHandleAriaLabel: 'Votre identifiant Bluesky',
    selectAll: 'Tout sélectionner',
    selectedCount: '{{count}} sélectionné(s)',
    unfollowSelected: 'Ne plus suivre la sélection',
    copyUsernames: 'Copier les noms d’utilisateur',
    copied: 'Copié !',
    copiedToast: 'Noms d’utilisateur copiés dans le presse-papiers',
    copyFailed: 'Impossible de copier dans le presse-papiers',
    openOn: 'Ouvrir {{handle}} sur {{platform}}',
    avatarAlt: 'Avatar de {{handle}}',
    onboarding:
      'Vous êtes connecté. Sélectionnez les cartes voulues, puis utilisez « Ne plus suivre la sélection ». Le désabonnement n’affecte que votre propre compte.',
    dismiss: 'Fermer',
    confirmTitle: 'Ne plus suivre ces utilisateurs ?',
    confirmBody_one:
      'Vous allez vous désabonner de {{count}} utilisateur. Cet outil ne peut pas le réabonner — vous devrez le faire manuellement.',
    confirmBody_other:
      'Vous allez vous désabonner de {{count}} utilisateurs. Cet outil ne peut pas les réabonner — vous devrez le faire manuellement.',
    confirmLabel: 'Ne plus suivre',
    idleTitle: 'Prêt quand vous l’êtes',
    idleAuthed: 'Chargement de votre liste… ou recherchez un autre utilisateur ci-dessus.',
    idleGuest:
      'Saisissez un identifiant {{platform}} ci-dessus pour voir qui ne le suit pas en retour.',
    idleGuest_github:
      "Saisissez un nom d'utilisateur {{platform}} ci-dessus pour voir qui ne le suit pas en retour.",
    idleGuest_bluesky:
      'Saisissez un identifiant {{platform}} ci-dessus pour voir qui ne le suit pas en retour.',
    zeroTitle: 'Tout le monde vous suit en retour !',
    zeroBody: 'Personne ici ne manque de vous suivre en retour. Tout est en ordre.',
    errorTitle: 'Une erreur est survenue',
    errorBody: 'Nous n’avons pas pu terminer cette vérification. Veuillez réessayer.',
    largeAccountNote:
      'Les très grands comptes sont comparés jusqu’à une limite, les résultats peuvent donc être partiels.',
    reportIssue: 'Cela persiste ? Signalez un problème',
    prevPage: 'Précédent',
    nextPage: 'Suivant',
    pageOf: 'Page {{page}} sur {{total}}',
    loading: {
      following: 'Récupération de la liste des abonnements…',
      followers: 'Collecte des abonnés…',
      popular: 'Cela peut prendre un moment pour les comptes populaires…',
      comparing: 'Comparaison de qui suit en retour…',
      almost: 'Presque terminé…',
    },
  },

  unfollow: {
    success_one: '{{count}} utilisateur retiré',
    success_other: '{{count}} utilisateurs retirés',
    failed: 'Impossible de retirer {{count}}',
  },

  confirm: {
    cancel: 'Annuler',
    unfollowing: 'Désabonnement…',
  },

  errors: {
    network: 'Erreur réseau. Vérifiez votre connexion et réessayez.',
    timeout:
      'Ce compte est très grand et a expiré. Réessayez, ou choisissez un compte plus petit.',
    generic: 'Une erreur est survenue. Veuillez réessayer.',
    unfollowGeneric: 'Impossible de se désabonner. Veuillez réessayer.',
    rateLimit:
      'Vous avez atteint la limite de requêtes de la plateforme. Patientez quelques minutes et réessayez.',
    notFound: 'Compte introuvable. Vérifiez l’identifiant et réessayez.',
  },

  footer: {
    viewSource: 'Code source',
    sponsor: 'Faire un don',
    privacy: 'Confidentialité',
    disclaimer:
      'Sans affiliation avec GitHub, Bluesky, X ou Instagram. À utiliser sur vos propres comptes, à votre discrétion.',
  },

  privacy: {
    title: 'Confidentialité et avertissement',
    close: 'Fermer',
    whatTitle: 'Ce que fait cet outil',
    whatBody:
      'Le Vérificateur d’abonnements vous aide à trouver les comptes que vous suivez sans être suivi en retour, sur GitHub, Bluesky, X (Twitter) et Instagram. C’est un outil gratuit et personnel, sans affiliation, approbation ni lien avec ces plateformes.',
    storeTitle: 'Ce que nous stockons',
    storeBody:
      'Rien. Nous n’avons pas de base de données et ne conservons pas vos données. Les listes d’abonnés et d’abonnements sont récupérées, comparées et renvoyées pour cette seule requête — jamais enregistrées ni journalisées.',
    howTitle: 'Comment fonctionne chaque plateforme',
    howGithubLabel: 'GitHub et Bluesky :',
    howGithubBody:
      'les données publiques d’abonnés sont lues via leurs API officielles par nos fonctions sans serveur, de sorte que les identifiants de plateforme n’atteignent jamais votre navigateur. Si vous vous connectez pour vous désabonner, cela passe par l’OAuth officiel de la plateforme et la session sert uniquement à effectuer les actions que vous choisissez — les jetons ne sont pas conservés.',
    howXLabel: 'X (Twitter) :',
    howXBody:
      's’exécute entièrement dans votre navigateur. Les fichiers de votre archive de données sont lus et comparés localement, et ne sont jamais téléversés.',
    howInstagramLabel: 'Instagram :',
    howInstagramBody:
      's’exécute entièrement dans votre propre session de navigateur via un script que vous collez vous-même. Rien n’est envoyé à nos serveurs.',
    riskTitle: 'À utiliser à vos risques',
    riskBody:
      'Les actions automatisées ou en masse peuvent enfreindre les conditions d’utilisation d’une plateforme et entraîner des limitations temporaires ou d’autres mesures sur le compte. Le script Instagram en particulier est un outil tiers non officiel. Vous êtes responsable de la façon dont vous utilisez ces fonctions sur vos propres comptes.',
    contactTitle: 'Contact',
    contactBody: 'Questions ou signalements :',
  },

  instagram: {
    introBody:
      'Instagram ne propose pas d’API publique pour les listes d’abonnés, alors celui-ci fonctionne différemment : vous copiez un petit script et le collez dans la console de votre navigateur pendant que vous êtes sur Instagram. Il s’exécute dans votre propre session.',
    introPrivacy:
      'Rien n’est envoyé à un serveur — le script communique uniquement avec Instagram, directement depuis votre navigateur. Nous ne pouvons pas voir votre compte ni vos données.',
    consoleLabel: 'Coller dans la console des DevTools',
    loading: 'Chargement…',
    copied: 'Copié !',
    copyCode: 'Copier le code',
    loadingScript: 'Chargement du script…',
    copiedToast: 'Code copié — collez-le maintenant dans la console',
    copyFailed: 'Impossible de copier dans le presse-papiers',
    tip_intro:
      'Un script à usage unique que vous collez vous-même — il n’est pas installé et ne change rien tant que vous ne l’exécutez pas.',
    step1: 'Copiez le script avec le bouton ci-dessus.',
    step2_pre: 'Ouvrez',
    step2_post: 'dans ce navigateur et assurez-vous d’être connecté.',
    step3_pre: 'Ouvrez la console développeur, puis cliquez sur l’onglet',
    step3_consoleWord: 'Console',
    step3_tab: ' :',
    step3_winLabel: 'Windows / Linux :',
    step3_winOr: 'ou',
    step3_macLabel: 'Mac :',
    step4_pre: 'Collez le script et appuyez sur',
    step4_enter: 'Entrée',
    step4_post:
      '. Un panneau apparaît dans le coin — appuyez sur Scan pour voir qui ne vous suit pas en retour, puis sélectionnez et désabonnez-vous.',
    troubleshoot:
      'Pas de panneau après avoir appuyé sur Entrée ? Assurez-vous d’être connecté et sur instagram.com, rechargez la page et recollez le script.',
    tip_pre:
      'Astuce : les navigateurs peuvent avertir avant de vous laisser coller dans la console — cet avertissement existe car coller du code que vous ne comprenez pas peut être dangereux. Ce script lit uniquement votre liste d’abonnements et désabonne ce que vous choisissez. Vous pouvez le consulter à tout moment sur',
    bmTitle: 'Ou utilisez un bookmarklet',
    bmIntro:
      'Vous préférez un seul clic ? Glissez ce bouton dans votre barre de favoris, puis ouvrez Instagram et cliquez dessus pour l’exécuter.',
    bmButton: 'Instagram Unfollower',
    bmDrag: 'Glissez ceci dans votre barre de favoris (ne cliquez pas ici).',
    bmRecommend:
      'Plus fiable sur Chrome et Edge. Sur Safari et Firefox, le bookmarklet peut être trop long à enregistrer — s’il ne s’exécute pas, utilisez plutôt « Copier le code » ci-dessus.',
    riskTitle: 'À utiliser à votre discrétion',
    riskBody:
      'Le désabonnement en masse peut enfreindre les politiques d’Instagram sur les comportements automatisés et déclencher un blocage temporaire des actions. L’outil espace les requêtes avec des délais et des pauses aléatoires pour rester humain, mais l’utilisation se fait à vos risques. Encore une fois : rien ne quitte votre navigateur.',
    featuresTitle: 'Ce que le panneau permet',
    features: {
      scan: 'Analyse uniquement les personnes que vous suivez et utilise le statut de suivi d’Instagram — il reste rapide même sur les grands comptes.',
      manage: 'Recherchez et filtrez par vérifié / privé / sans photo de profil, avec des raccourcis « sélectionner tous les vérifiés / privés / sans photo ».',
      unfollow: 'Sélectionnez des comptes et désabonnez-vous en masse, avec une barre de progression en direct et une nouvelle tentative en un clic pour les échecs.',
      summary: 'À la fin, il liste précisément qui a été désabonné (et les échecs éventuels), pour que vous puissiez vérifier le résultat.',
      safety: 'Des délais et pauses aléatoires gardent un comportement humain ; en cas de limitation, l’outil ralentit et se met en pause au lieu d’échouer en silence.',
      settings: 'Réglez chaque délai (analyse/désabonnement, pauses) dans les paramètres, ou rétablissez les valeurs prudentes par défaut.',
      comfort: 'Déplacez le panneau où vous voulez, redimensionnez-le depuis n’importe quel bord, réduisez-le et changez de thème (clair/sombre/système) et de langue — vos choix sont mémorisés.',
    },
    inspiredBy: 'Inspiré des workflows de',
  },

  twitter: {
    introBody:
      'X ne propose pas de moyen gratuit de lire les listes d’abonnés, alors ceci fonctionne à partir de votre archive de données : téléversez-en deux fichiers et nous les comparerons ici même dans votre navigateur.',
    introPrivacy: 'Rien n’est téléversé — les fichiers ne quittent jamais votre appareil.',
    step1_pre: 'Sur X, allez dans',
    step1_path: 'Paramètres → Votre compte → Télécharger une archive de vos données',
    step1_post: ', confirmez votre mot de passe et demandez l’archive.',
    step1_guide: 'Guide',
    step2: 'X vous envoie un e-mail quand c’est prêt (cela peut prendre de quelques heures à un jour). Téléchargez et décompressez.',
    step3_pre: 'Ouvrez le dossier',
    step3_dataWord: 'data',
    step3_mid: 'et téléversez',
    step3_and: 'et',
    step3_part: 'part',
    step3_post: ', ajoutez-les tous).',
    step3_ifSplit: '(s’ils sont répartis en fichiers',
    dropzone_pre: 'Glissez',
    dropzone_and: 'et',
    dropzone_post: 'ici, ou',
    reading: 'Lecture…',
    chooseFiles: 'Choisir des fichiers',
    bothFilesError:
      'Veuillez ajouter les deux fichiers : following.js et follower.js (du dossier data/ de votre archive).',
    readError:
      'Impossible de lire ces fichiers. Assurez-vous qu’ils proviennent de votre archive X.',
    ignoredFiles: '{{count}} fichier(s) non lié(s) ignoré(s).',
    resultSummary_one: '<0>{{count}} compte</0> que vous suivez ne vous suit pas en retour.',
    resultSummary_other: '<0>{{count}} comptes</0> que vous suivez ne vous suivent pas en retour.',
    idLimitNote:
      'Les archives X ne contiennent que des ID de compte numériques, donc les identifiants ne peuvent pas être affichés. Chaque lien ouvre le vrai profil sur X.',
    viewOnlyNote:
      'Liste en lecture seule — le désabonnement sur X n’est pas disponible ici. Ouvrez un profil pour vous désabonner sur X.',
    idLabel: 'ID {{id}}',
    openProfile: 'Ouvrir le profil',
    copyLinks: 'Copier les liens',
    copied: 'Copié !',
    copiedToast: 'Liens de profil copiés dans le presse-papiers',
    copyFailed: 'Impossible de copier dans le presse-papiers',
    startOver: 'Recommencer',
    zeroTitle: 'Tout le monde vous suit en retour !',
    zeroBody: 'D’après votre archive, tous ceux que vous suivez vous suivent en retour.',
  },
}
