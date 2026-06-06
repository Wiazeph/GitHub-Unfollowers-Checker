import type { Translation } from './en'

/** Deutsch */
export const de: Translation = {
  header: {
    title: 'Unfollower-Checker',
    subtitle:
      'Finde heraus, wem du folgst, der dir nicht zurückfolgt — auf den Plattformen, die du nutzt.',
  },

  selector: {
    label: 'Plattform',
  },

  theme: {
    toLight: 'Zum hellen Design wechseln',
    toDark: 'Zum dunklen Design wechseln',
    light: 'Helles Design',
    dark: 'Dunkles Design',
  },

  language: {
    label: 'Sprache',
  },

  auth: {
    signOut: 'Abmelden',
  },

  search: {
    check: 'Prüfen',
    checking: 'Wird geprüft…',
    handleAriaLabel: '{{platform}}-Handle',
    placeholderGithub: 'GitHub-Benutzernamen eingeben',
    placeholderGithubAuthed: 'Anderen Nutzer nachschlagen…',
    placeholderBluesky: 'Bluesky-Handle eingeben (name.bsky.social)',
    placeholderBlueskyAuthed: 'Anderes Handle nachschlagen…',
    invalidGithub: 'Bitte gib einen gültigen GitHub-Benutzernamen ein',
    invalidBluesky: 'Bitte gib ein gültiges Bluesky-Handle ein (z. B. name.bsky.social)',
  },

  results: {
    ownSummary_one: '<0>{{count}} Nutzer</0> folgt dir nicht zurück — zum Entfernen auswählen.',
    ownSummary_other: '<0>{{count}} Nutzer</0> folgen dir nicht zurück — zum Entfernen auswählen.',
    otherSummary: '<0>@{{handle}}</0> wird nicht zurückgefolgt von <1>{{label}}</1>',
    countLabel_one: '{{count}} Nutzer',
    countLabel_other: '{{count}} Nutzer',
    onlyOwnAccount: 'Du kannst nur Personen aus deinem eigenen Konto entfernen.',
    backToMyList: 'Zurück zu meiner Liste',
    readOnly:
      'Das Entfernen auf {{platform}} ist noch nicht verfügbar — dies ist vorerst eine reine Ansicht.',
    signInCta: 'Melde dich an, um Personen zu entfernen, die dir nicht zurückfolgen.',
    signInWith: 'Mit {{platform}} anmelden',
    signingIn: 'Weiterleitung…',
    blueskySignInCta:
      'Melde dich mit Bluesky an, um Personen zu entfernen, die dir nicht zurückfolgen.',
    blueskyHandlePlaceholder: 'dein-handle.bsky.social',
    blueskyHandleAriaLabel: 'Dein Bluesky-Handle',
    selectAll: 'Alle auswählen',
    selectedCount: '{{count}} ausgewählt',
    unfollowSelected: 'Ausgewählte entfolgen',
    copyUsernames: 'Benutzernamen kopieren',
    copied: 'Kopiert!',
    copiedToast: 'Benutzernamen in die Zwischenablage kopiert',
    copyFailed: 'Konnte nicht in die Zwischenablage kopieren',
    openOn: '{{handle}} auf {{platform}} öffnen',
    avatarAlt: 'Avatar von {{handle}}',
    onboarding:
      'Du bist angemeldet. Wähle die gewünschten Karten aus und nutze dann „Ausgewählte entfolgen“. Entfolgen betrifft nur dein eigenes Konto.',
    dismiss: 'Schließen',
    confirmTitle: 'Nutzer entfolgen?',
    confirmBody_one:
      'Du bist dabei, {{count}} Nutzer zu entfolgen. Das kann hier nicht rückgängig gemacht werden.',
    confirmBody_other:
      'Du bist dabei, {{count}} Nutzern zu entfolgen. Das kann hier nicht rückgängig gemacht werden.',
    confirmLabel: 'Entfolgen',
    idleTitle: 'Bereit, wenn du es bist',
    idleAuthed: 'Deine Liste wird geladen… oder suche oben nach einem anderen Nutzer.',
    idleGuest:
      'Gib oben ein {{platform}}-Handle ein, um zu sehen, wer nicht zurückfolgt.',
    zeroTitle: 'Alle folgen zurück!',
    zeroBody: 'Hier folgt dir niemand nicht zurück. Schön aufgeräumt.',
    errorTitle: 'Etwas ist schiefgelaufen',
    errorBody:
      'Wir konnten diese Prüfung nicht abschließen. Details findest du in der Benachrichtigung — versuch es erneut.',
    reportIssue: 'Tritt es weiterhin auf? Melde ein Problem',
    loading: {
      following: 'Folgt-Liste wird abgerufen…',
      followers: 'Follower werden gesammelt…',
      popular: 'Bei beliebten Konten kann das einen Moment dauern…',
      comparing: 'Vergleiche, wer zurückfolgt…',
      almost: 'Fast geschafft…',
    },
  },

  unfollow: {
    success_one: '{{count}} Nutzer entfolgt',
    success_other: '{{count}} Nutzern entfolgt',
    failed: '{{count}} konnten nicht entfolgt werden',
  },

  confirm: {
    cancel: 'Abbrechen',
    unfollowing: 'Wird entfolgt…',
  },

  errors: {
    network: 'Netzwerkfehler. Prüfe deine Verbindung und versuch es erneut.',
    timeout:
      'Dieses Konto ist sehr groß und hat das Zeitlimit überschritten. Versuch es erneut oder ein kleineres Konto.',
    generic: 'Etwas ist schiefgelaufen. Bitte versuch es erneut.',
    unfollowGeneric: 'Entfolgen nicht möglich. Bitte versuch es erneut.',
  },

  footer: {
    viewSource: 'Quellcode auf GitHub ansehen',
    privacy: 'Datenschutz',
    disclaimer:
      'Nicht verbunden mit GitHub, Bluesky, X oder Instagram. Nutzung mit eigenen Konten, auf eigene Verantwortung.',
  },

  privacy: {
    title: 'Datenschutz & Haftungsausschluss',
    close: 'Schließen',
    whatTitle: 'Was dieses Tool macht',
    whatBody:
      'Der Unfollower-Checker hilft dir, Konten zu finden, denen du folgst, die dir aber nicht zurückfolgen — auf GitHub, Bluesky, X (Twitter) und Instagram. Es ist ein kostenloses, persönliches Tool und steht in keiner Verbindung zu diesen Plattformen, wird von ihnen nicht unterstützt oder befürwortet.',
    storeTitle: 'Was wir speichern',
    storeBody:
      'Nichts. Wir betreiben keine Datenbank und speichern deine Daten nicht. Follower- und Folgt-Listen werden für diese eine Anfrage abgerufen, verglichen und zurückgegeben — niemals protokolliert oder gespeichert.',
    howTitle: 'Wie jede Plattform funktioniert',
    howGithubLabel: 'GitHub & Bluesky:',
    howGithubBody:
      'Öffentliche Follower-Daten werden über ihre offiziellen APIs von unseren serverlosen Funktionen gelesen, sodass Plattform-Zugangsdaten nie deinen Browser erreichen. Wenn du dich zum Entfolgen anmeldest, geschieht das über das offizielle OAuth der Plattform und die Sitzung wird nur für die von dir gewählten Aktionen genutzt — Tokens werden nicht gespeichert.',
    howXLabel: 'X (Twitter):',
    howXBody:
      'läuft vollständig in deinem Browser. Die Dateien aus deinem Datenarchiv werden lokal gelesen und verglichen und nirgendwo hochgeladen.',
    howInstagramLabel: 'Instagram:',
    howInstagramBody:
      'läuft vollständig in deiner eigenen Browser-Sitzung über ein Skript, das du selbst einfügst. Es wird nichts an unsere Server gesendet.',
    riskTitle: 'Nutzung auf eigene Verantwortung',
    riskBody:
      'Automatisierte oder Massenaktionen können gegen die Nutzungsbedingungen einer Plattform verstoßen und zu vorübergehenden Einschränkungen oder anderen Kontomaßnahmen führen. Besonders das Instagram-Skript ist ein inoffizielles Drittanbieter-Tool. Du bist dafür verantwortlich, wie du diese Funktionen mit deinen eigenen Konten nutzt.',
    contactTitle: 'Kontakt',
    contactBody: 'Fragen oder Meldungen:',
  },

  instagram: {
    introBody:
      'Instagram bietet keine öffentliche API für Follower-Listen, daher funktioniert das hier anders: Du kopierst ein kleines Skript und fügst es in die Konsole deines Browsers ein, während du auf Instagram bist. Es läuft in deiner eigenen Sitzung.',
    introPrivacy:
      'Es wird nichts an einen Server gesendet — das Skript kommuniziert nur mit Instagram, direkt aus deinem Browser. Wir können dein Konto oder deine Daten nicht sehen.',
    consoleLabel: 'In die DevTools-Konsole einfügen',
    loading: 'Wird geladen…',
    copied: 'Kopiert!',
    copyCode: 'Code kopieren',
    loadingScript: 'Skript wird geladen…',
    copiedToast: 'Code kopiert — jetzt in die Konsole einfügen',
    copyFailed: 'Konnte nicht in die Zwischenablage kopieren',
    tip_intro:
      'Ein einmaliges Skript, das du selbst einfügst — es wird nicht installiert und ändert nichts, bis du es ausführst.',
    step1: 'Kopiere das Skript mit dem Button oben.',
    step2_pre: 'Öffne',
    step2_post: 'in diesem Browser und stelle sicher, dass du angemeldet bist.',
    step3_pre: 'Öffne die Entwicklerkonsole und klicke dann auf den Tab',
    step3_consoleWord: 'Console',
    step3_tab: ':',
    step3_winLabel: 'Windows / Linux:',
    step3_winOr: 'oder',
    step3_macLabel: 'Mac:',
    step4_pre: 'Füge das Skript ein und drücke',
    step4_enter: 'Enter',
    step4_post:
      '. Ein Panel erscheint in der Ecke — drücke auf Scan, um zu sehen, wer dir nicht zurückfolgt, dann auswählen und entfolgen.',
    tip_pre:
      'Tipp: Browser warnen möglicherweise, bevor du in die Konsole einfügen darfst — diese Warnung gibt es, weil das Einfügen von Code, den du nicht verstehst, gefährlich sein kann. Dieses Skript liest nur deine Folgt-Liste und entfolgt, was du auswählst. Du kannst es jederzeit hier lesen:',
    bmTitle: 'Oder ein Bookmarklet verwenden',
    bmIntro:
      'Lieber mit einem Klick? Zieh diesen Button in deine Lesezeichenleiste, öffne dann Instagram und klicke darauf, um ihn auszuführen.',
    bmButton: 'Instagram Unfollower',
    bmDrag: 'Zieh dies in deine Lesezeichenleiste (hier nicht anklicken).',
    bmRecommend:
      'Am zuverlässigsten in Chrome und Edge. In Safari und Firefox kann das Bookmarklet zu lang zum Speichern sein — wenn es nicht läuft, nutze stattdessen oben „Code kopieren“.',
    riskTitle: 'Nutzung nach eigenem Ermessen',
    riskBody:
      'Massenhaftes Entfolgen kann gegen Instagrams Richtlinien zu automatisiertem Verhalten verstoßen und eine vorübergehende Aktionssperre auslösen. Das Tool verteilt Anfragen mit zufälligen Verzögerungen und Pausen, um menschlich zu wirken, aber die Nutzung erfolgt auf eigene Gefahr. Nochmals: Nichts verlässt deinen Browser.',
  },

  twitter: {
    introBody:
      'X bietet keine kostenlose Möglichkeit, Follower-Listen zu lesen, daher funktioniert das über dein Datenarchiv: Lade zwei Dateien daraus hoch und wir vergleichen sie direkt hier in deinem Browser.',
    introPrivacy: 'Es wird nichts hochgeladen — die Dateien verlassen nie dein Gerät.',
    step1_pre: 'Gehe auf X zu',
    step1_path: 'Einstellungen → Dein Konto → Archiv deiner Daten herunterladen',
    step1_post: ', bestätige dein Passwort und fordere das Archiv an.',
    step1_guide: 'Anleitung',
    step2: 'X schickt dir eine E-Mail, wenn es bereit ist (kann Stunden bis zu einem Tag dauern). Herunterladen und entpacken.',
    step3_pre: 'Öffne den Ordner',
    step3_dataWord: 'data',
    step3_mid: 'und lade hoch:',
    step3_and: 'und',
    step3_part: 'part',
    step3_post: '-Dateien aufgeteilt sind, füge sie alle hinzu).',
    step3_ifSplit: '(falls sie in',
    dropzone_pre: 'Ziehe',
    dropzone_and: 'und',
    dropzone_post: 'hierher, oder',
    reading: 'Wird gelesen…',
    chooseFiles: 'Dateien auswählen',
    bothFilesError:
      'Bitte füge beide Dateien hinzu: following.js und follower.js (aus dem Ordner data/ deines Archivs).',
    readError:
      'Diese Dateien konnten nicht gelesen werden. Stelle sicher, dass sie aus deinem X-Archiv stammen.',
    ignoredFiles: '{{count}} nicht zugehörige Datei(en) ignoriert.',
    resultSummary_one: '<0>{{count}} Konto</0>, dem du folgst, folgt dir nicht zurück.',
    resultSummary_other: '<0>{{count}} Konten</0>, denen du folgst, folgen dir nicht zurück.',
    idLimitNote:
      'X-Archive enthalten nur numerische Konto-IDs, daher können keine Handles angezeigt werden. Jeder Link öffnet das echte Profil auf X.',
    idLabel: 'ID {{id}}',
    openProfile: 'Profil öffnen',
    copyLinks: 'Links kopieren',
    copied: 'Kopiert!',
    copiedToast: 'Profil-Links in die Zwischenablage kopiert',
    copyFailed: 'Konnte nicht in die Zwischenablage kopieren',
    startOver: 'Von vorne beginnen',
    zeroTitle: 'Alle folgen zurück!',
    zeroBody: 'Laut deinem Archiv folgen dir alle, denen du folgst, zurück.',
  },
}
