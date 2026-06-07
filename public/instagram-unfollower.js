/*!
 * Instagram Unfollower — paste into the browser console on instagram.com
 * Runs entirely in your own browser using your own Instagram session.
 * No data is sent to any server.
 */
(() => {
  "use strict";

  if (location.hostname !== "www.instagram.com") {
    alert("Open https://www.instagram.com first, then paste this script again.");
    return;
  }

  const APP_ID = "iu-app";
  const STYLE_ID = "iu-style";
  const STORAGE_KEY = "iu_state_v3";
  const IG_HEADERS = {
    "x-ig-app-id": "936619743392459",
    "x-requested-with": "XMLHttpRequest"
  };

  // Conservative defaults: slower = safer against Instagram's rate limiting and
  // action blocks. Users can still tune these in settings.
  const DEFAULT_TIMINGS = {
    scanDelayMin: 900,
    scanDelayMax: 1800,
    scanPauseEveryPages: 5,
    scanPauseMs: 10000,
    unfollowDelayMin: 6000,
    unfollowDelayMax: 12000,
    unfollowPauseEvery: 4,
    unfollowPauseMs: 300000
  };

  // Ordered list of supported languages; the header button cycles through them.
  const LANGS = ["en", "tr", "de", "fr", "es"];

  const PANEL_WIDTH = 500;
  const PANEL_MIN_WIDTH = 320;
  const PANEL_MIN_HEIGHT = 320;
  const PANEL_MARGIN = 18;
  const MAX_RETRIES = 3;

  const I18N = {
    en: {
      title: "Instagram Unfollower",
      subtitle: "See who doesn't follow you back",
      welcomeTitle: "Ready when you are",
      welcomeBody: "We'll scan only the people you follow and use Instagram's follow-back status to keep the scan fast. Nothing is changed on your account during the scan.",
      scanBtn: "Scan now",
      scanning: "Scanning",
      loadingFollowing: "Loading the people you follow",
      loadingFollowers: "Checking follow-back status",
      paused: "Paused",
      pause: "Pause",
      resume: "Resume",
      cancel: "Cancel",
      ofTotal: "{current} of {total}",
      ofUnknown: "{current} so far",
      scanCompletedToast: "{count} non-followers found",
      scanFailed: "Scan failed",
      retry: "Try again",
      goBack: "Back to results",
      search: "Search by name or username",
      filterVerified: "Verified",
      filterPrivate: "Private",
      filterNoAvatar: "No profile picture",
      filterShowHidden: "Hidden users",
      foundCount: "{count} non-followers",
      foundOne: "1 non-follower",
      foundNone: "Nice — everyone you follow follows you back.",
      noMatches: "No users match your filters.",
      hide: "Hide",
      unhide: "Unhide",
      hideTooltip: "Hide from this list",
      unhideTooltip: "Show again",
      openProfile: "Open profile",
      copy: "Copy",
      copyAll: "Copy all",
      copiedToast: "Copied {count} usernames",
      selectAll: "Select all",
      selectNone: "Clear",
      selectedCount: "{count} selected",
      unfollow: "Unfollow",
      unfollowConfirmTitle: "Unfollow {count} users?",
      unfollowConfirmBody: "This will run slowly to protect your account from rate limiting. You can pause at any time, but already-completed unfollows cannot be reversed from this tool.",
      unfollowConfirmBtn: "Yes, unfollow {count}",
      unfollowing: "Unfollowing",
      currently: "Currently",
      nextActionIn: "Next action in {seconds}s",
      cooldownIn: "Cooldown — {seconds}s",
      idle: "Ready",
      unfollowDoneTitle: "Done",
      unfollowDoneBody: "{ok} unfollowed, {fail} failed",
      doneRemoved: "Unfollowed ({count})",
      doneFailed: "Failed ({count})",
      settings: "Settings",
      settingsTitle: "Timing settings",
      settingsBody: "Lower delays make Instagram more likely to throttle or block your account. Keep these conservative.",
      minScanDelay: "Min scan delay (ms)",
      maxScanDelay: "Max scan delay (ms)",
      scanPauseEvery: "Long pause every N pages",
      scanPauseLength: "Long pause length (ms)",
      minUnfollowDelay: "Min unfollow delay (ms)",
      maxUnfollowDelay: "Max unfollow delay (ms)",
      unfollowPauseEvery: "Cooldown every N unfollows",
      unfollowPauseLength: "Cooldown length (ms)",
      restoreDefaults: "Restore defaults",
      save: "Save",
      saved: "Settings saved",
      cookieMissing: "Could not read your login cookie. Make sure you're signed in to Instagram.",
      csrfMissing: "Could not read your session. Make sure you're signed in to Instagram.",
      requestFailed: "Request failed: {status}",
      tooManyRequests: "Instagram is rate-limiting requests. Try again later or increase delays in settings.",
      rateLimitPaused: "Instagram is rate-limiting you. Paused automatically — wait a few minutes, then press Resume.",
      keepTabOpen: "Keep this tab and browser open — closing it stops the process.",
      close: "Close",
      minimize: "Minimize",
      expand: "Expand",
      theme: "Theme",
      themeSystem: "Theme: system",
      themeLight: "Theme: light",
      themeDark: "Theme: dark",
      language: "Language",
      selectVerified: "Select verified",
      selectPrivate: "Select private",
      selectNoPhoto: "Select no photo",
      retryFailed: "Retry failed ({count})",
      pillScanning: "Scanning {current}/{total}",
      pillUnfollowing: "Unfollowing {current}/{total}",
      pillResults: "{count} non-followers",
      pillIdle: "Open"
    },
    tr: {
      title: "Instagram Takip Etmeyenler",
      subtitle: "Seni geri takip etmeyenleri gör",
      welcomeTitle: "Hazır olduğunda başlat",
      welcomeBody: "Sadece takip ettiklerin taranır ve Instagram'ın geri takip durumuyla hızlıca kontrol edilir. Tarama sırasında hesabında hiçbir şey değişmez.",
      scanBtn: "Taramayı başlat",
      scanning: "Taranıyor",
      loadingFollowing: "Takip ettiklerin yükleniyor",
      loadingFollowers: "Geri takip durumu kontrol ediliyor",
      paused: "Duraklatıldı",
      pause: "Duraklat",
      resume: "Devam et",
      cancel: "İptal",
      ofTotal: "{current} / {total}",
      ofUnknown: "Şu ana kadar {current}",
      scanCompletedToast: "{count} takip etmeyen bulundu",
      scanFailed: "Tarama başarısız",
      retry: "Tekrar dene",
      goBack: "Sonuçlara dön",
      search: "İsim veya kullanıcı adı ara",
      filterVerified: "Onaylı",
      filterPrivate: "Gizli",
      filterNoAvatar: "Profil resmi yok",
      filterShowHidden: "Gizlenen kullanıcılar",
      foundCount: "{count} takip etmeyen",
      foundOne: "1 takip etmeyen",
      foundNone: "Harika — takip ettiğin herkes seni takip ediyor.",
      noMatches: "Filtrelerinle eşleşen kullanıcı yok.",
      hide: "Gizle",
      unhide: "Göster",
      hideTooltip: "Bu listeden gizle",
      unhideTooltip: "Tekrar göster",
      openProfile: "Profili aç",
      copy: "Kopyala",
      copyAll: "Tümünü kopyala",
      copiedToast: "{count} kullanıcı adı kopyalandı",
      selectAll: "Tümünü seç",
      selectNone: "Temizle",
      selectedCount: "{count} seçili",
      unfollow: "Takibi bırak",
      unfollowConfirmTitle: "{count} kullanıcının takibi bırakılsın mı?",
      unfollowConfirmBody: "Hesabını korumak için işlem yavaş çalışır. İstediğin zaman duraklatabilirsin, ama tamamlanan işlemler bu araçtan geri alınamaz.",
      unfollowConfirmBtn: "Evet, {count} kişiyi bırak",
      unfollowing: "Takip bırakılıyor",
      currently: "Şu an",
      nextActionIn: "Sonraki işlem {seconds} sn sonra",
      cooldownIn: "Mola — {seconds} sn",
      idle: "Hazır",
      unfollowDoneTitle: "Tamamlandı",
      unfollowDoneBody: "{ok} başarılı, {fail} başarısız",
      doneRemoved: "Takibi bırakıldı ({count})",
      doneFailed: "Başarısız ({count})",
      settings: "Ayarlar",
      settingsTitle: "Hız ayarları",
      settingsBody: "Düşük gecikmeler Instagram'ın hesabını kısıtlamasına neden olabilir. Yavaş tut.",
      minScanDelay: "Min tarama gecikmesi (ms)",
      maxScanDelay: "Maks tarama gecikmesi (ms)",
      scanPauseEvery: "Her N sayfada uzun mola",
      scanPauseLength: "Uzun mola süresi (ms)",
      minUnfollowDelay: "Min takip bırakma gecikmesi (ms)",
      maxUnfollowDelay: "Maks takip bırakma gecikmesi (ms)",
      unfollowPauseEvery: "Her N takip bırakmada mola",
      unfollowPauseLength: "Mola süresi (ms)",
      restoreDefaults: "Varsayılana dön",
      save: "Kaydet",
      saved: "Ayarlar kaydedildi",
      cookieMissing: "Giriş çerezi okunamadı. Instagram'a giriş yaptığından emin ol.",
      csrfMissing: "Oturumun okunamadı. Instagram'a giriş yaptığından emin ol.",
      requestFailed: "İstek başarısız: {status}",
      tooManyRequests: "Instagram istekleri kısıtlıyor. Sonra dene veya ayarlardan gecikmeleri artır.",
      rateLimitPaused: "Instagram seni kısıtlıyor. Otomatik duraklatıldı — birkaç dakika bekleyip Devam et'e bas.",
      keepTabOpen: "Bu sekmeyi ve tarayıcıyı kapatma — kapatırsan işlem durur.",
      close: "Kapat",
      minimize: "Küçült",
      expand: "Aç",
      theme: "Tema",
      themeSystem: "Tema: sistem",
      themeLight: "Tema: açık",
      themeDark: "Tema: koyu",
      language: "Dil",
      selectVerified: "Onaylıları seç",
      selectPrivate: "Gizlileri seç",
      selectNoPhoto: "Fotoğrafsızları seç",
      retryFailed: "Başarısızları dene ({count})",
      pillScanning: "Taranıyor {current}/{total}",
      pillUnfollowing: "Bırakılıyor {current}/{total}",
      pillResults: "{count} takip etmeyen",
      pillIdle: "Aç"
    },
    de: {
      title: "Instagram Unfollower",
      subtitle: "Sieh, wer dir nicht zurückfolgt",
      welcomeTitle: "Bereit, wenn du es bist",
      welcomeBody: "Es werden nur die Personen gescannt, denen du folgst, und Instagrams Rückfolge-Status genutzt, damit der Scan schnell bleibt. Während des Scans wird an deinem Konto nichts geändert.",
      scanBtn: "Jetzt scannen",
      scanning: "Wird gescannt",
      loadingFollowing: "Lade die Personen, denen du folgst",
      loadingFollowers: "Prüfe den Rückfolge-Status",
      paused: "Pausiert",
      pause: "Pause",
      resume: "Fortsetzen",
      cancel: "Abbrechen",
      ofTotal: "{current} von {total}",
      ofUnknown: "Bisher {current}",
      scanCompletedToast: "{count} Nicht-Follower gefunden",
      scanFailed: "Scan fehlgeschlagen",
      retry: "Erneut versuchen",
      goBack: "Zurück zu den Ergebnissen",
      search: "Nach Name oder Benutzername suchen",
      filterVerified: "Verifiziert",
      filterPrivate: "Privat",
      filterNoAvatar: "Kein Profilbild",
      filterShowHidden: "Ausgeblendete Nutzer",
      foundCount: "{count} Nicht-Follower",
      foundOne: "1 Nicht-Follower",
      foundNone: "Super — alle, denen du folgst, folgen dir zurück.",
      noMatches: "Keine Nutzer entsprechen deinen Filtern.",
      hide: "Ausblenden",
      unhide: "Einblenden",
      hideTooltip: "Aus dieser Liste ausblenden",
      unhideTooltip: "Wieder anzeigen",
      openProfile: "Profil öffnen",
      copy: "Kopieren",
      copyAll: "Alle kopieren",
      copiedToast: "{count} Benutzernamen kopiert",
      selectAll: "Alle auswählen",
      selectNone: "Leeren",
      selectedCount: "{count} ausgewählt",
      unfollow: "Entfolgen",
      unfollowConfirmTitle: "{count} Nutzern entfolgen?",
      unfollowConfirmBody: "Dies läuft langsam, um dein Konto vor Rate-Limits zu schützen. Du kannst jederzeit pausieren, aber bereits abgeschlossene Entfolgungen können mit diesem Tool nicht rückgängig gemacht werden.",
      unfollowConfirmBtn: "Ja, {count} entfolgen",
      unfollowing: "Wird entfolgt",
      currently: "Aktuell",
      nextActionIn: "Nächste Aktion in {seconds}s",
      cooldownIn: "Abkühlung — {seconds}s",
      idle: "Bereit",
      unfollowDoneTitle: "Fertig",
      unfollowDoneBody: "{ok} entfolgt, {fail} fehlgeschlagen",
      doneRemoved: "Entfolgt ({count})",
      doneFailed: "Fehlgeschlagen ({count})",
      settings: "Einstellungen",
      settingsTitle: "Timing-Einstellungen",
      settingsBody: "Niedrigere Verzögerungen erhöhen das Risiko, dass Instagram dein Konto drosselt oder sperrt. Halte sie konservativ.",
      minScanDelay: "Min. Scan-Verzögerung (ms)",
      maxScanDelay: "Max. Scan-Verzögerung (ms)",
      scanPauseEvery: "Lange Pause alle N Seiten",
      scanPauseLength: "Länge der langen Pause (ms)",
      minUnfollowDelay: "Min. Entfolgen-Verzögerung (ms)",
      maxUnfollowDelay: "Max. Entfolgen-Verzögerung (ms)",
      unfollowPauseEvery: "Abkühlung alle N Entfolgungen",
      unfollowPauseLength: "Abkühlungsdauer (ms)",
      restoreDefaults: "Standard wiederherstellen",
      save: "Speichern",
      saved: "Einstellungen gespeichert",
      cookieMissing: "Login-Cookie konnte nicht gelesen werden. Stelle sicher, dass du bei Instagram angemeldet bist.",
      csrfMissing: "Deine Sitzung konnte nicht gelesen werden. Stelle sicher, dass du bei Instagram angemeldet bist.",
      requestFailed: "Anfrage fehlgeschlagen: {status}",
      tooManyRequests: "Instagram drosselt die Anfragen. Versuche es später oder erhöhe die Verzögerungen in den Einstellungen.",
      rateLimitPaused: "Instagram drosselt dich. Automatisch pausiert — warte ein paar Minuten und drücke dann Fortsetzen.",
      keepTabOpen: "Lass diesen Tab und den Browser offen — beim Schließen stoppt der Vorgang.",
      close: "Schließen",
      minimize: "Minimieren",
      expand: "Öffnen",
      theme: "Design",
      themeSystem: "Design: System",
      themeLight: "Design: Hell",
      themeDark: "Design: Dunkel",
      language: "Sprache",
      selectVerified: "Verifizierte wählen",
      selectPrivate: "Private wählen",
      selectNoPhoto: "Ohne Bild wählen",
      retryFailed: "Fehlgeschlagene erneut ({count})",
      pillScanning: "Scannen {current}/{total}",
      pillUnfollowing: "Entfolgen {current}/{total}",
      pillResults: "{count} Nicht-Follower",
      pillIdle: "Öffnen"
    },
    fr: {
      title: "Instagram Unfollower",
      subtitle: "Voyez qui ne vous suit pas en retour",
      welcomeTitle: "Prêt quand vous l'êtes",
      welcomeBody: "Nous analysons uniquement les personnes que vous suivez et utilisons le statut de suivi d'Instagram pour rester rapides. Rien n'est modifié sur votre compte pendant l'analyse.",
      scanBtn: "Analyser maintenant",
      scanning: "Analyse en cours",
      loadingFollowing: "Chargement des personnes que vous suivez",
      loadingFollowers: "Vérification du suivi en retour",
      paused: "En pause",
      pause: "Pause",
      resume: "Reprendre",
      cancel: "Annuler",
      ofTotal: "{current} sur {total}",
      ofUnknown: "{current} jusqu'à présent",
      scanCompletedToast: "{count} non-abonnés trouvés",
      scanFailed: "Échec de l'analyse",
      retry: "Réessayer",
      goBack: "Retour aux résultats",
      search: "Rechercher par nom ou identifiant",
      filterVerified: "Vérifié",
      filterPrivate: "Privé",
      filterNoAvatar: "Sans photo de profil",
      filterShowHidden: "Utilisateurs masqués",
      foundCount: "{count} non-abonnés",
      foundOne: "1 non-abonné",
      foundNone: "Parfait — tout le monde que vous suivez vous suit en retour.",
      noMatches: "Aucun utilisateur ne correspond à vos filtres.",
      hide: "Masquer",
      unhide: "Afficher",
      hideTooltip: "Masquer de cette liste",
      unhideTooltip: "Afficher à nouveau",
      openProfile: "Ouvrir le profil",
      copy: "Copier",
      copyAll: "Tout copier",
      copiedToast: "{count} identifiants copiés",
      selectAll: "Tout sélectionner",
      selectNone: "Effacer",
      selectedCount: "{count} sélectionné(s)",
      unfollow: "Ne plus suivre",
      unfollowConfirmTitle: "Ne plus suivre {count} utilisateurs ?",
      unfollowConfirmBody: "L'opération est lente pour protéger votre compte des limitations. Vous pouvez mettre en pause à tout moment, mais les désabonnements déjà effectués ne peuvent pas être annulés depuis cet outil.",
      unfollowConfirmBtn: "Oui, ne plus suivre {count}",
      unfollowing: "Désabonnement",
      currently: "Actuellement",
      nextActionIn: "Prochaine action dans {seconds}s",
      cooldownIn: "Pause — {seconds}s",
      idle: "Prêt",
      unfollowDoneTitle: "Terminé",
      unfollowDoneBody: "{ok} désabonnés, {fail} échoués",
      doneRemoved: "Désabonnés ({count})",
      doneFailed: "Échoués ({count})",
      settings: "Paramètres",
      settingsTitle: "Réglages de cadence",
      settingsBody: "Des délais plus courts augmentent le risque qu'Instagram limite ou bloque votre compte. Restez prudent.",
      minScanDelay: "Délai d'analyse min (ms)",
      maxScanDelay: "Délai d'analyse max (ms)",
      scanPauseEvery: "Longue pause toutes les N pages",
      scanPauseLength: "Durée de la longue pause (ms)",
      minUnfollowDelay: "Délai de désabonnement min (ms)",
      maxUnfollowDelay: "Délai de désabonnement max (ms)",
      unfollowPauseEvery: "Pause toutes les N désabonnements",
      unfollowPauseLength: "Durée de la pause (ms)",
      restoreDefaults: "Réinitialiser",
      save: "Enregistrer",
      saved: "Paramètres enregistrés",
      cookieMissing: "Impossible de lire le cookie de connexion. Assurez-vous d'être connecté à Instagram.",
      csrfMissing: "Impossible de lire votre session. Assurez-vous d'être connecté à Instagram.",
      requestFailed: "Échec de la requête : {status}",
      tooManyRequests: "Instagram limite les requêtes. Réessayez plus tard ou augmentez les délais dans les paramètres.",
      rateLimitPaused: "Instagram vous limite. Mis en pause automatiquement — attendez quelques minutes puis appuyez sur Reprendre.",
      keepTabOpen: "Gardez cet onglet et le navigateur ouverts — les fermer arrête le processus.",
      close: "Fermer",
      minimize: "Réduire",
      expand: "Ouvrir",
      theme: "Thème",
      themeSystem: "Thème : système",
      themeLight: "Thème : clair",
      themeDark: "Thème : sombre",
      language: "Langue",
      selectVerified: "Sélectionner vérifiés",
      selectPrivate: "Sélectionner privés",
      selectNoPhoto: "Sélectionner sans photo",
      retryFailed: "Réessayer les échecs ({count})",
      pillScanning: "Analyse {current}/{total}",
      pillUnfollowing: "Désabonnement {current}/{total}",
      pillResults: "{count} non-abonnés",
      pillIdle: "Ouvrir"
    },
    es: {
      title: "Instagram Unfollower",
      subtitle: "Mira quién no te sigue de vuelta",
      welcomeTitle: "Listo cuando tú lo estés",
      welcomeBody: "Solo analizamos a las personas que sigues y usamos el estado de seguimiento de Instagram para que el análisis sea rápido. No se cambia nada en tu cuenta durante el análisis.",
      scanBtn: "Analizar ahora",
      scanning: "Analizando",
      loadingFollowing: "Cargando a las personas que sigues",
      loadingFollowers: "Comprobando el seguimiento de vuelta",
      paused: "En pausa",
      pause: "Pausar",
      resume: "Reanudar",
      cancel: "Cancelar",
      ofTotal: "{current} de {total}",
      ofUnknown: "{current} hasta ahora",
      scanCompletedToast: "{count} no seguidores encontrados",
      scanFailed: "Error en el análisis",
      retry: "Intentar de nuevo",
      goBack: "Volver a los resultados",
      search: "Buscar por nombre o usuario",
      filterVerified: "Verificado",
      filterPrivate: "Privado",
      filterNoAvatar: "Sin foto de perfil",
      filterShowHidden: "Usuarios ocultos",
      foundCount: "{count} no seguidores",
      foundOne: "1 no seguidor",
      foundNone: "Genial — todos a los que sigues te siguen de vuelta.",
      noMatches: "Ningún usuario coincide con tus filtros.",
      hide: "Ocultar",
      unhide: "Mostrar",
      hideTooltip: "Ocultar de esta lista",
      unhideTooltip: "Mostrar de nuevo",
      openProfile: "Abrir perfil",
      copy: "Copiar",
      copyAll: "Copiar todo",
      copiedToast: "{count} nombres de usuario copiados",
      selectAll: "Seleccionar todo",
      selectNone: "Limpiar",
      selectedCount: "{count} seleccionados",
      unfollow: "Dejar de seguir",
      unfollowConfirmTitle: "¿Dejar de seguir a {count} usuarios?",
      unfollowConfirmBody: "Esto se ejecuta lentamente para proteger tu cuenta de los límites de Instagram. Puedes pausar en cualquier momento, pero a quienes ya dejaste de seguir no se puede revertir desde esta herramienta.",
      unfollowConfirmBtn: "Sí, dejar de seguir a {count}",
      unfollowing: "Dejando de seguir",
      currently: "Actualmente",
      nextActionIn: "Próxima acción en {seconds}s",
      cooldownIn: "Enfriamiento — {seconds}s",
      idle: "Listo",
      unfollowDoneTitle: "Hecho",
      unfollowDoneBody: "{ok} dejados de seguir, {fail} fallidos",
      doneRemoved: "Dejados de seguir ({count})",
      doneFailed: "Fallidos ({count})",
      settings: "Ajustes",
      settingsTitle: "Ajustes de ritmo",
      settingsBody: "Retrasos más cortos aumentan la probabilidad de que Instagram limite o bloquee tu cuenta. Mantenlos conservadores.",
      minScanDelay: "Retraso mín. de análisis (ms)",
      maxScanDelay: "Retraso máx. de análisis (ms)",
      scanPauseEvery: "Pausa larga cada N páginas",
      scanPauseLength: "Duración de la pausa larga (ms)",
      minUnfollowDelay: "Retraso mín. al dejar de seguir (ms)",
      maxUnfollowDelay: "Retraso máx. al dejar de seguir (ms)",
      unfollowPauseEvery: "Enfriamiento cada N dejados de seguir",
      unfollowPauseLength: "Duración del enfriamiento (ms)",
      restoreDefaults: "Restaurar valores",
      save: "Guardar",
      saved: "Ajustes guardados",
      cookieMissing: "No se pudo leer la cookie de inicio de sesión. Asegúrate de haber iniciado sesión en Instagram.",
      csrfMissing: "No se pudo leer tu sesión. Asegúrate de haber iniciado sesión en Instagram.",
      requestFailed: "La solicitud falló: {status}",
      tooManyRequests: "Instagram está limitando las solicitudes. Inténtalo más tarde o aumenta los retrasos en los ajustes.",
      rateLimitPaused: "Instagram te está limitando. Pausado automáticamente — espera unos minutos y pulsa Reanudar.",
      keepTabOpen: "Mantén esta pestaña y el navegador abiertos — cerrarlos detiene el proceso.",
      close: "Cerrar",
      minimize: "Minimizar",
      expand: "Abrir",
      theme: "Tema",
      themeSystem: "Tema: sistema",
      themeLight: "Tema: claro",
      themeDark: "Tema: oscuro",
      language: "Idioma",
      selectVerified: "Seleccionar verificados",
      selectPrivate: "Seleccionar privados",
      selectNoPhoto: "Seleccionar sin foto",
      retryFailed: "Reintentar fallidos ({count})",
      pillScanning: "Analizando {current}/{total}",
      pillUnfollowing: "Dejando de seguir {current}/{total}",
      pillResults: "{count} no seguidores",
      pillIdle: "Abrir"
    }
  };

  const SVG = {
    minimize: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="3" y="7.25" width="10" height="1.5" rx="0.75" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    gear: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm6.7 2.5a6.7 6.7 0 0 0-.1-1.1l1.4-1.1-1.5-2.6-1.7.7a6.6 6.6 0 0 0-1.9-1.1L10.5 1h-3l-.4 1.8a6.6 6.6 0 0 0-1.9 1.1l-1.7-.7L1.9 5.8 3.3 6.9a6.7 6.7 0 0 0 0 2.2L1.9 10.2l1.5 2.6 1.7-.7a6.6 6.6 0 0 0 1.9 1.1L7.5 15h3l.4-1.8a6.6 6.6 0 0 0 1.9-1.1l1.7.7 1.5-2.6-1.4-1.1c.1-.4.1-.7.1-1.1z"/></svg>',
    open: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M6 3h7v7M13 3L6.5 9.5M9 13H3V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2zm6 11l1 2.8L22 17l-3 .8L18 21l-1-3.2L14 17l3-1.2 1-2.8z"/></svg>',
    alert: '<svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M12 2 1 21h22L12 2zm0 6 7.5 13h-15L12 8zm-1 4v4h2v-4h-2zm0 5v2h2v-2h-2z"/></svg>',
    check: '<svg viewBox="0 0 16 16" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M14 4.5L6 12.5l-4-4L3 7.5l3 3 7-7z"/></svg>',
    sun: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="currentColor"/><g stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3 3l1.1 1.1M11.9 11.9 13 13M13 3l-1.1 1.1M4.1 11.9 3 13"/></g></svg>',
    moon: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M6 1.4A6.6 6.6 0 1 0 14.6 10 5.2 5.2 0 0 1 6 1.4z"/></svg>',
    auto: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="9" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M5.5 14h5M8 11.5V14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
  };

  const persisted = loadStored();

  const state = {
    mode: "idle",
    scanPaused: false,
    scanCancelled: false,
    unfollowPaused: false,
    progress: { current: 0, total: 0, label: "scanning", note: "" },
    waitUntil: 0,
    waitReason: "",
    users: [],
    followingCount: 0,
    followersCount: 0,
    selected: new Set(),
    hidden: new Set(persisted.hidden || []),
    log: [],
    search: "",
    filters: persisted.filters || { verified: true, private: true, noAvatar: true, showHidden: false },
    timings: { ...DEFAULT_TIMINGS, ...(persisted.timings || {}) },
    panelPos: persisted.panelPos || null,
    // Persisted panel size (user can resize from any edge/corner). Null = default.
    panelSize: (persisted.panelSize && Number.isFinite(persisted.panelSize.w) && Number.isFinite(persisted.panelSize.h)) ? persisted.panelSize : null,
    minimized: Boolean(persisted.minimized),
    language: LANGS.includes(persisted.language) ? persisted.language : "en",
    // User preference: 'system' follows the OS; 'light'/'dark' force a theme.
    theme: persisted.theme === "light" || persisted.theme === "dark" ? persisted.theme : "system",
    // Transient (not persisted): ids that failed during the last unfollow run.
    failed: new Set(),
    // Transient: which quick-select shortcut is active ('all'|'verified'|'private'|'no-photo'|null).
    // While one is active, the others are disabled and it acts as a "clear" toggle.
    selectMode: null,
    // Set true once a permanent rate-limit auto-pauses the current operation.
    rateLimited: false,
    error: ""
  };

  let countdownTimer = null;
  let toastTimer = null;

  function loadStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        hidden: [...state.hidden],
        timings: state.timings,
        filters: state.filters,
        panelPos: state.panelPos,
        panelSize: state.panelSize,
        minimized: state.minimized,
        language: state.language,
        theme: state.theme
      }));
    } catch {
      /* storage may be disabled; ignore */
    }
  }

  function t(key, vars) {
    const dict = I18N[state.language] || I18N.en;
    const template = dict[key] ?? I18N.en[key] ?? key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "");
  }

  function cleanupExisting() {
    if (typeof window.__iuCleanup === "function") {
      try { window.__iuCleanup(); } catch { /* ignore */ }
    }
    document.getElementById(APP_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function mount() {
    const root = document.createElement("div");
    root.id = APP_ID;
    document.body.appendChild(root);
    window.__iuCleanup = unmount;
    prefersDark.addEventListener("change", onSystemThemeChange);
    window.addEventListener("beforeunload", onBeforeUnload);
    renderShell();
    applyTheme();
  }

  function unmount() {
    stopCountdown();
    if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
    prefersDark.removeEventListener("change", onSystemThemeChange);
    window.removeEventListener("beforeunload", onBeforeUnload);
    document.getElementById(APP_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
    if (window.__iuCleanup === unmount) window.__iuCleanup = null;
  }

  // Warn before leaving while a scan/unfollow is running — closing the tab or
  // browser stops the operation mid-way.
  function onBeforeUnload(event) {
    if (state.mode === "scanning" || state.mode === "unfollowing") {
      event.preventDefault();
      event.returnValue = "";
      return "";
    }
  }

  function renderShell() {
    const root = document.getElementById(APP_ID);
    if (!root) return;
    if (state.minimized) {
      root.innerHTML = `
        <button class="iu-pill" data-action="expand" type="button" aria-label="${escapeAttr(t("expand"))}">
          <span class="iu-pill-dot ${pillStateClass()}"></span>
          <span data-pill-label>${escapeHTML(pillLabel())}</span>
        </button>
      `;
      root.querySelector("[data-action='expand']")?.addEventListener("click", () => setMinimized(false));
      applyPanelPosition();
      applyTheme();
      return;
    }
    root.innerHTML = `
      <section class="iu-panel" role="dialog" aria-label="${escapeAttr(t("title"))}">
        <header class="iu-header" data-drag>
          <div class="iu-brand">
            <span class="iu-brand-dot"></span>
            <div class="iu-brand-text">
              <strong>${escapeHTML(t("title"))}</strong>
              <span data-subtitle>${escapeHTML(t("subtitle"))}</span>
            </div>
          </div>
          <div class="iu-header-actions">
            <button type="button" data-action="settings" aria-label="${escapeAttr(t("settings"))}" title="${escapeAttr(t("settings"))}">${SVG.gear}</button>
            <button type="button" data-action="theme" aria-label="${escapeAttr(t("theme"))}" title="${escapeAttr(t(themeTitleKey()))}">${themeIcon()}</button>
            <button type="button" data-action="language" aria-label="${escapeAttr(t("language"))}" title="${escapeAttr(t("language"))}"><span data-lang>${escapeHTML(state.language.toUpperCase())}</span></button>
            <button type="button" data-action="minimize" aria-label="${escapeAttr(t("minimize"))}" title="${escapeAttr(t("minimize"))}">${SVG.minimize}</button>
            <button type="button" data-action="close" aria-label="${escapeAttr(t("close"))}" title="${escapeAttr(t("close"))}">${SVG.close}</button>
          </div>
        </header>
        <div class="iu-body" data-body></div>
        <div class="iu-resize iu-resize--n" data-resize="n"></div>
        <div class="iu-resize iu-resize--s" data-resize="s"></div>
        <div class="iu-resize iu-resize--e" data-resize="e"></div>
        <div class="iu-resize iu-resize--w" data-resize="w"></div>
        <div class="iu-resize iu-resize--ne" data-resize="ne"></div>
        <div class="iu-resize iu-resize--nw" data-resize="nw"></div>
        <div class="iu-resize iu-resize--se" data-resize="se"></div>
        <div class="iu-resize iu-resize--sw" data-resize="sw"></div>
      </section>
    `;
    bindHeader(root);
    bindDrag(root.querySelector("[data-drag]"));
    bindResize(root.querySelector(".iu-panel"));
    applyPanelPosition();
    applyTheme();
    renderBody();
  }

  function bindHeader(root) {
    root.querySelector("[data-action='close']")?.addEventListener("click", () => unmount());
    root.querySelector("[data-action='minimize']")?.addEventListener("click", () => setMinimized(true));
    root.querySelector("[data-action='settings']")?.addEventListener("click", showSettings);
    root.querySelector("[data-action='theme']")?.addEventListener("click", cycleTheme);
    root.querySelector("[data-action='language']")?.addEventListener("click", cycleLanguage);
  }

  // Only the results list justifies a fixed (resizable) height. Every other view
  // — idle, scan/unfollow progress, AND the unfollow-done summary — hugs its
  // content so there's no large empty area below. The done list scrolls within
  // its own max-height when it's long.
  function modeUsesFixedHeight() {
    return state.mode === "results";
  }

  // Apply the persisted panel size: width always, height only for list views.
  function applyPanelSize() {
    const node = document.querySelector(`#${APP_ID} .iu-panel`);
    if (!node) return;
    if (state.panelSize) {
      const maxW = Math.max(PANEL_MIN_WIDTH, window.innerWidth - 16);
      node.style.width = clamp(state.panelSize.w, PANEL_MIN_WIDTH, maxW) + "px";
      if (modeUsesFixedHeight()) {
        const maxH = Math.max(PANEL_MIN_HEIGHT, window.innerHeight - 16);
        node.style.height = clamp(state.panelSize.h, PANEL_MIN_HEIGHT, maxH) + "px";
      } else {
        node.style.height = "auto";
      }
    } else {
      node.style.height = "auto";
    }
  }

  function applyPanelPosition() {
    const root = document.getElementById(APP_ID);
    if (!root) return;
    const node = root.querySelector(".iu-panel") || root.querySelector(".iu-pill");
    if (!node) return;
    if (node.classList.contains("iu-panel")) applyPanelSize();
    const pos = state.panelPos;
    if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
      const max = panelBounds(node);
      node.style.left = clamp(pos.x, 0, max.x) + "px";
      node.style.top = clamp(pos.y, 0, max.y) + "px";
      node.style.right = "auto";
      node.style.bottom = "auto";
    } else {
      node.style.left = "auto";
      node.style.top = "auto";
      node.style.right = PANEL_MARGIN + "px";
      node.style.bottom = PANEL_MARGIN + "px";
    }
  }

  function panelBounds(node) {
    const rect = node.getBoundingClientRect();
    return {
      x: Math.max(0, window.innerWidth - rect.width),
      y: Math.max(0, window.innerHeight - rect.height)
    };
  }

  function bindDrag(handle) {
    if (!handle) return;
    const panel = handle.closest(".iu-panel");
    if (!panel) return;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let dragging = false;

    handle.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      dragging = true;
      const rect = panel.getBoundingClientRect();
      originX = rect.left;
      originY = rect.top;
      startX = event.clientX;
      startY = event.clientY;
      panel.style.left = originX + "px";
      panel.style.top = originY + "px";
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      handle.setPointerCapture(event.pointerId);
      handle.classList.add("iu-dragging");
    });

    handle.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const max = panelBounds(panel);
      const x = clamp(originX + (event.clientX - startX), 0, max.x);
      const y = clamp(originY + (event.clientY - startY), 0, max.y);
      panel.style.left = x + "px";
      panel.style.top = y + "px";
    });

    const stop = (event) => {
      if (!dragging) return;
      dragging = false;
      handle.releasePointerCapture?.(event.pointerId);
      handle.classList.remove("iu-dragging");
      const rect = panel.getBoundingClientRect();
      state.panelPos = { x: rect.left, y: rect.top };
      persist();
    };
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  }

  // Make the panel resizable from any edge or corner. Each handle adjusts width
  // and/or height (and shifts left/top when dragging the top/left edges so the
  // opposite edge stays put). The chosen size is clamped and persisted.
  function bindResize(panel) {
    if (!panel) return;
    panel.querySelectorAll("[data-resize]").forEach((handle) => {
      const dir = handle.getAttribute("data-resize");
      let startX = 0, startY = 0, x0 = 0, y0 = 0, w0 = 0, h0 = 0, resizing = false;

      handle.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        resizing = true;
        const rect = panel.getBoundingClientRect();
        x0 = rect.left; y0 = rect.top; w0 = rect.width; h0 = rect.height;
        startX = event.clientX; startY = event.clientY;
        // Pin the panel to explicit left/top so edge resizes can move it.
        panel.style.left = x0 + "px";
        panel.style.top = y0 + "px";
        panel.style.right = "auto";
        panel.style.bottom = "auto";
        panel.style.maxWidth = "none";
        panel.style.maxHeight = "none";
        handle.setPointerCapture(event.pointerId);
        panel.classList.add("iu-resizing");
      });

      handle.addEventListener("pointermove", (event) => {
        if (!resizing) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        const maxW = Math.max(PANEL_MIN_WIDTH, window.innerWidth - 8);
        const maxH = Math.max(PANEL_MIN_HEIGHT, window.innerHeight - 8);
        let w = w0, h = h0, left = x0, top = y0;

        if (dir.includes("e")) w = clamp(w0 + dx, PANEL_MIN_WIDTH, maxW);
        if (dir.includes("s")) h = clamp(h0 + dy, PANEL_MIN_HEIGHT, maxH);
        if (dir.includes("w")) {
          w = clamp(w0 - dx, PANEL_MIN_WIDTH, Math.min(maxW, x0 + w0));
          left = x0 + (w0 - w);
        }
        if (dir.includes("n")) {
          h = clamp(h0 - dy, PANEL_MIN_HEIGHT, Math.min(maxH, y0 + h0));
          top = y0 + (h0 - h);
        }

        panel.style.width = w + "px";
        panel.style.height = h + "px";
        panel.style.left = Math.max(0, left) + "px";
        panel.style.top = Math.max(0, top) + "px";
      });

      const stop = (event) => {
        if (!resizing) return;
        resizing = false;
        handle.releasePointerCapture?.(event.pointerId);
        panel.classList.remove("iu-resizing");
        const rect = panel.getBoundingClientRect();
        state.panelSize = { w: Math.round(rect.width), h: Math.round(rect.height) };
        state.panelPos = { x: rect.left, y: rect.top };
        persist();
      };
      handle.addEventListener("pointerup", stop);
      handle.addEventListener("pointercancel", stop);
    });
  }

  function setMinimized(value) {
    state.minimized = Boolean(value);
    persist();
    renderShell();
  }

  function pillLabel() {
    if (state.mode === "scanning") {
      return t("pillScanning", { current: state.progress.current, total: state.progress.total || "?" });
    }
    if (state.mode === "unfollowing") {
      return t("pillUnfollowing", { current: state.progress.current, total: state.progress.total });
    }
    if (state.mode === "results" && state.users.length) {
      return t("pillResults", { count: state.users.filter((u) => !u.follows_viewer && !state.hidden.has(u.id)).length });
    }
    return t("pillIdle");
  }

  function pillStateClass() {
    if (state.mode === "scanning" || state.mode === "unfollowing") return "iu-pill-dot--active";
    if (state.error) return "iu-pill-dot--error";
    return "";
  }

  function renderBody() {
    const body = document.querySelector(`#${APP_ID} [data-body]`);
    if (!body) return;
    if (state.mode === "scanning") {
      body.innerHTML = renderScanView();
      bindScan(body);
    } else if (state.mode === "results") {
      body.innerHTML = renderResultsView();
      bindResults(body);
    } else if (state.mode === "unfollowing" || state.mode === "unfollowDone") {
      body.innerHTML = renderUnfollowView();
      bindUnfollow(body);
    } else {
      body.innerHTML = renderIdleView();
      bindIdle(body);
    }
    // Re-evaluate the panel height: fixed for list views, auto for short ones.
    applyPanelSize();
    if (state.mode === "scanning" || state.mode === "unfollowing") startCountdown();
    else stopCountdown();
  }

  function renderIdleView() {
    if (state.error) {
      return `
        <div class="iu-welcome">
          <div class="iu-welcome-icon iu-welcome-icon--error">${SVG.alert}</div>
          <h2>${escapeHTML(t("scanFailed"))}</h2>
          <p>${escapeHTML(state.error)}</p>
          <button type="button" class="iu-btn iu-btn--primary" data-action="scan">${escapeHTML(t("retry"))}</button>
        </div>
      `;
    }
    return `
      <div class="iu-welcome">
        <div class="iu-welcome-icon">${SVG.sparkle}</div>
        <h2>${escapeHTML(t("welcomeTitle"))}</h2>
        <p>${escapeHTML(t("welcomeBody"))}</p>
        <button type="button" class="iu-btn iu-btn--primary iu-btn--lg" data-action="scan">${escapeHTML(t("scanBtn"))}</button>
      </div>
    `;
  }

  function bindIdle(body) {
    body.querySelector("[data-action='scan']")?.addEventListener("click", startScan);
  }

  function renderScanView() {
    const { current, total, label, note } = state.progress;
    const percent = total ? Math.min(100, Math.round((current / total) * 100)) : 0;
    const counter = total ? t("ofTotal", { current, total }) : t("ofUnknown", { current });
    return `
      <div class="iu-progress">
        <div class="iu-progress-head">
          <h2 data-progress-label>${escapeHTML(state.scanPaused ? t("paused") : t(label))}</h2>
          <p data-progress-note>${escapeHTML(note)}</p>
        </div>
        <div class="iu-bar"><span data-progress-bar style="width:${percent}%"></span></div>
        <div class="iu-progress-meta">
          <span data-progress-counter>${escapeHTML(counter)}</span>
          <span data-countdown class="iu-muted"></span>
        </div>
        ${state.rateLimited ? `<div class="iu-warn">${escapeHTML(t("rateLimitPaused"))}</div>` : ""}
        <div class="iu-warn iu-warn--soft">${escapeHTML(t("keepTabOpen"))}</div>
        <div class="iu-progress-actions">
          <button type="button" class="iu-btn" data-action="pause-scan">${escapeHTML(t(state.scanPaused ? "resume" : "pause"))}</button>
          <button type="button" class="iu-btn iu-btn--ghost" data-action="cancel-scan">${escapeHTML(t("cancel"))}</button>
        </div>
      </div>
    `;
  }

  function bindScan(body) {
    body.querySelector("[data-action='pause-scan']")?.addEventListener("click", () => {
      state.scanPaused = !state.scanPaused;
      const btn = body.querySelector("[data-action='pause-scan']");
      if (btn) btn.textContent = t(state.scanPaused ? "resume" : "pause");
      const label = body.querySelector("[data-progress-label]");
      if (label) label.textContent = state.scanPaused ? t("paused") : t(state.progress.label);
    });
    body.querySelector("[data-action='cancel-scan']")?.addEventListener("click", () => {
      state.scanCancelled = true;
      state.scanPaused = false;
    });
  }

  function renderResultsView() {
    const display = getDisplayUsers();
    const totalNonFollowers = state.users.filter((u) => !u.follows_viewer && !state.hidden.has(u.id)).length;
    let summary;
    if (totalNonFollowers === 0) summary = t("foundNone");
    else if (totalNonFollowers === 1) summary = t("foundOne");
    else summary = t("foundCount", { count: totalNonFollowers });

    // Chip visibility is based on the whole pool (not the active filters/search),
    // so a category's chip is shown only when that category exists at all.
    const pool = getPool();

    return `
      <div class="iu-results">
        <div class="iu-results-summary">${escapeHTML(summary)}</div>
        <div class="iu-search-row">
          <input
            class="iu-search"
            type="search"
            data-search
            placeholder="${escapeAttr(t("search"))}"
            value="${escapeAttr(state.search)}"
            autocomplete="off"
            spellcheck="false"
          >
        </div>
        <div class="iu-filters">
          ${filterChip("verified", t("filterVerified"), pool.some((u) => u.is_verified))}
          ${filterChip("private", t("filterPrivate"), pool.some((u) => u.is_private))}
          ${filterChip("noAvatar", t("filterNoAvatar"), pool.some((u) => isDefaultAvatar(u)))}
          ${filterChip("showHidden", t("filterShowHidden"), state.hidden.size > 0 || state.filters.showHidden)}
        </div>
        <div class="iu-list" data-list>${renderUserList(display)}</div>
        <div class="iu-actionbar">
          <div class="iu-actionbar-left">
            <span class="iu-select-group" data-select-group>${renderSelectButtons()}</span>
            <span class="iu-muted" data-selected-label>${escapeHTML(t("selectedCount", { count: state.selected.size }))}</span>
          </div>
          <div class="iu-actionbar-right">
            <button type="button" class="iu-btn iu-btn--small" data-action="copy" ${display.length ? "" : "disabled"}>${escapeHTML(state.selected.size ? t("copy") : t("copyAll"))}</button>
            <button type="button" class="iu-btn iu-btn--danger iu-btn--small" data-action="unfollow" ${state.selected.size ? "" : "disabled"}>${escapeHTML(t("unfollow"))}${state.selected.size ? " (" + state.selected.size + ")" : ""}</button>
          </div>
        </div>
      </div>
    `;
  }

  // The quick-select buttons (Select all / verified / private / no-photo). They
  // behave as one exclusive group: activating one selects exactly its matches,
  // turns that button into a "Clear" toggle, and disables the others until
  // cleared. Visibility is based on the filtered set WITHOUT search, so typing a
  // non-matching query never makes the buttons vanish. A button is shown only
  // when its category has at least one (filter-respecting) match.
  function renderSelectButtons() {
    const display = getDisplayNoSearch();
    const defs = [
      { mode: "all", action: "select-all", label: "selectAll", show: display.length > 0 },
      { mode: "verified", action: "select-verified", label: "selectVerified", show: display.some((u) => u.is_verified) },
      { mode: "private", action: "select-private", label: "selectPrivate", show: display.some((u) => u.is_private) },
      { mode: "no-photo", action: "select-no-photo", label: "selectNoPhoto", show: display.some((u) => isDefaultAvatar(u)) },
    ];
    const active = state.selectMode;
    return defs
      .filter((d) => d.show)
      .map((d) => {
        const isActive = active === d.mode;
        const disabled = active && !isActive;
        const ghost = d.mode === "all" ? "" : " iu-btn--ghost";
        return `<button type="button" class="iu-btn iu-btn--small${ghost}" data-action="${d.action}"${disabled ? " disabled" : ""}>${escapeHTML(isActive ? t("selectNone") : t(d.label))}</button>`;
      })
      .join("");
  }

  // Quick-select group behaviour: activating one selects exactly its matches in
  // the filtered list (ignoring the search box, to match the buttons' own
  // visibility) and turns it into a "Clear" toggle; the others disable until
  // cleared. Clicking the active one again clears the selection.
  const SELECT_PREDS = {
    all: () => true,
    verified: (u) => u.is_verified,
    private: (u) => u.is_private,
    "no-photo": (u) => isDefaultAvatar(u),
  };

  function bindSelectButtons(body) {
    const apply = (mode) => {
      if (state.selectMode === mode) {
        state.selected.clear();
        state.selectMode = null;
      } else {
        state.selected = new Set(getDisplayNoSearch().filter(SELECT_PREDS[mode]).map((u) => u.id));
        state.selectMode = mode;
      }
      renderBody();
    };
    body.querySelector("[data-action='select-all']")?.addEventListener("click", () => apply("all"));
    body.querySelector("[data-action='select-verified']")?.addEventListener("click", () => apply("verified"));
    body.querySelector("[data-action='select-private']")?.addEventListener("click", () => apply("private"));
    body.querySelector("[data-action='select-no-photo']")?.addEventListener("click", () => apply("no-photo"));
  }

  // Re-render just the quick-select buttons in place (used after a search edit,
  // so the search input keeps focus instead of a full re-render).
  function refreshSelectButtons(body) {
    const group = body.querySelector("[data-select-group]");
    if (!group) return;
    group.innerHTML = renderSelectButtons();
    bindSelectButtons(body);
  }

  function filterChip(key, label, visible = true) {
    // Hide a chip when its category doesn't exist in the current pool.
    if (!visible) return "";
    const active = state.filters[key];
    return `
      <button type="button" class="iu-chip ${active ? "iu-chip--on" : ""}" data-filter="${escapeAttr(key)}" aria-pressed="${active ? "true" : "false"}">
        <span class="iu-chip-tick">${active ? SVG.check : ""}</span>
        ${escapeHTML(label)}
      </button>
    `;
  }

  function renderUserList(display) {
    if (!display.length) {
      return `<div class="iu-list-empty">${escapeHTML(t("noMatches"))}</div>`;
    }
    return display.map(renderUserRow).join("");
  }

  function renderUserRow(user) {
    const hidden = state.hidden.has(user.id);
    const checked = state.selected.has(user.id);
    const tags = [];
    if (user.is_verified) tags.push(`<span class="iu-tag iu-tag--brand">${escapeHTML(t("filterVerified"))}</span>`);
    if (user.is_private) tags.push(`<span class="iu-tag">${escapeHTML(t("filterPrivate"))}</span>`);
    return `
      <div class="iu-row ${hidden ? "iu-row--hidden" : ""} ${checked ? "iu-row--selected" : ""}" data-row="${escapeAttr(user.id)}" role="button" tabindex="0">
        <input type="checkbox" class="iu-row-check" data-select="${escapeAttr(user.id)}" ${checked ? "checked" : ""} aria-label="${escapeAttr(user.username)}">
        <img class="iu-avatar" src="${escapeAttr(user.profile_pic_url || "")}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <div class="iu-row-text">
          <div class="iu-row-name">
            <a href="/${encodeURIComponent(user.username)}/" target="_blank" rel="noopener noreferrer" data-stop>@${escapeHTML(user.username)}</a>
            ${tags.join(" ")}
          </div>
          <div class="iu-row-sub">${escapeHTML(user.full_name || "")}</div>
        </div>
        <div class="iu-row-actions">
          <a class="iu-icon-btn" href="/${encodeURIComponent(user.username)}/" target="_blank" rel="noopener noreferrer" data-stop title="${escapeAttr(t("openProfile"))}" aria-label="${escapeAttr(t("openProfile"))}">${SVG.open}</a>
          <button type="button" class="iu-icon-btn iu-text-btn" data-hide="${escapeAttr(user.id)}" data-stop title="${escapeAttr(hidden ? t("unhideTooltip") : t("hideTooltip"))}">${escapeHTML(hidden ? t("unhide") : t("hide"))}</button>
        </div>
      </div>
    `;
  }

  function bindResults(body) {
    const search = body.querySelector("[data-search]");
    if (search) {
      search.addEventListener("input", (event) => {
        state.search = event.target.value;
        const list = body.querySelector("[data-list]");
        if (list) list.innerHTML = renderUserList(getDisplayUsers());
        // If a quick-select was active, searching changes the visible set, so the
        // grouping is stale: drop the mode and re-enable the buttons in place
        // (without a full re-render, to keep the search input focused).
        if (state.selectMode) {
          state.selectMode = null;
          refreshSelectButtons(body);
        }
      });
    }

    body.querySelectorAll("[data-filter]").forEach((el) => {
      el.addEventListener("click", () => {
        const key = el.getAttribute("data-filter");
        state.filters[key] = !state.filters[key];
        // Changing what's visible invalidates an active quick-select grouping.
        state.selectMode = null;
        persist();
        renderBody();
      });
    });

    body.addEventListener("change", (event) => {
      const checkbox = event.target.closest("[data-select]");
      if (!checkbox) return;
      const id = checkbox.getAttribute("data-select");
      if (checkbox.checked) state.selected.add(id);
      else state.selected.delete(id);
      // A manual tweak breaks the quick-select grouping → drop the mode and
      // re-render so the disabled buttons come back.
      if (state.selectMode) { state.selectMode = null; renderBody(); return; }
      const row = checkbox.closest("[data-row]");
      if (row) row.classList.toggle("iu-row--selected", checkbox.checked);
      updateSelectedLabel(body);
    });

    body.addEventListener("click", (event) => {
      const hideBtn = event.target.closest("[data-hide]");
      if (hideBtn) {
        event.preventDefault();
        event.stopPropagation();
        const id = hideBtn.getAttribute("data-hide");
        if (state.hidden.has(id)) state.hidden.delete(id);
        else { state.hidden.add(id); state.selected.delete(id); }
        state.selectMode = null;
        persist();
        renderBody();
        return;
      }
      if (event.target.closest("[data-stop]")) {
        event.stopPropagation();
        return;
      }
      const row = event.target.closest("[data-row]");
      if (!row || event.target.closest(".iu-row-check")) return;
      const id = row.getAttribute("data-row");
      const checkbox = row.querySelector("[data-select]");
      if (!checkbox) return;
      if (state.selected.has(id)) {
        state.selected.delete(id);
        checkbox.checked = false;
      } else {
        state.selected.add(id);
        checkbox.checked = true;
      }
      if (state.selectMode) { state.selectMode = null; renderBody(); return; }
      row.classList.toggle("iu-row--selected", checkbox.checked);
      updateSelectedLabel(body);
    });

    body.addEventListener("keydown", (event) => {
      if (event.key !== " " && event.key !== "Enter") return;
      const row = event.target.closest("[data-row]");
      if (!row || event.target.tagName === "INPUT" || event.target.tagName === "A" || event.target.tagName === "BUTTON") return;
      event.preventDefault();
      row.click();
    });

    bindSelectButtons(body);

    body.querySelector("[data-action='copy']")?.addEventListener("click", copyUsernames);
    body.querySelector("[data-action='unfollow']")?.addEventListener("click", confirmUnfollow);
  }

  function updateSelectedLabel(body) {
    const root = body || document.querySelector(`#${APP_ID} [data-body]`);
    if (!root) return;
    const label = root.querySelector("[data-selected-label]");
    if (label) label.textContent = t("selectedCount", { count: state.selected.size });
    const unfollowBtn = root.querySelector("[data-action='unfollow']");
    if (unfollowBtn) {
      unfollowBtn.disabled = state.selected.size === 0;
      unfollowBtn.textContent = t("unfollow") + (state.selected.size ? " (" + state.selected.size + ")" : "");
    }
    const copyBtn = root.querySelector("[data-action='copy']");
    if (copyBtn) copyBtn.textContent = state.selected.size ? t("copy") : t("copyAll");
  }

  function renderUnfollowView() {
    const total = state.progress.total;
    const done = state.progress.current;
    const percent = total ? Math.round((done / total) * 100) : 0;
    const isDone = state.mode === "unfollowDone";
    const removed = state.log.filter((e) => e.ok).map((e) => e.user);
    const failed = state.log.filter((e) => !e.ok).map((e) => e.user);
    const last = state.log[state.log.length - 1];
    const summary = isDone
      ? t("unfollowDoneBody", { ok: removed.length, fail: failed.length })
      : t("ofTotal", { current: done, total });

    // The done state lists exactly who was unfollowed (and who failed) in a
    // scrollable area that fills the panel, so there's no dead space and the
    // user can review the outcome. The in-progress state shows the live row.
    const resultList = isDone
      ? `
        <div class="iu-done-list">
          ${removed.length ? `
            <div class="iu-done-section">${escapeHTML(t("doneRemoved", { count: removed.length }))}</div>
            ${removed.map((u) => doneRow(u, true)).join("")}
          ` : ""}
          ${failed.length ? `
            <div class="iu-done-section">${escapeHTML(t("doneFailed", { count: failed.length }))}</div>
            ${failed.map((u) => doneRow(u, false)).join("")}
          ` : ""}
        </div>`
      : (last ? `
          <div class="iu-current">
            <span class="iu-muted">${escapeHTML(t("currently"))}</span>
            <strong>@${escapeHTML(last.user.username)}</strong>
            <span class="iu-tag ${last.ok ? "iu-tag--green" : "iu-tag--red"}">${last.ok ? "✓" : "✕"}</span>
          </div>` : "");

    return `
      <div class="iu-progress ${isDone ? "iu-progress--done" : ""}">
        <div class="iu-progress-head">
          <h2>${escapeHTML(isDone ? t("unfollowDoneTitle") : (state.unfollowPaused ? t("paused") : t("unfollowing")))}</h2>
          <p data-progress-note>${escapeHTML(state.progress.note || "")}</p>
        </div>
        <div class="iu-bar"><span data-progress-bar style="width:${percent}%"></span></div>
        <div class="iu-progress-meta">
          <span>${escapeHTML(summary)}</span>
          <span data-countdown class="iu-muted"></span>
        </div>
        ${resultList}
        ${state.mode === "unfollowing" && state.rateLimited ? `<div class="iu-warn">${escapeHTML(t("rateLimitPaused"))}</div>` : ""}
        ${state.mode === "unfollowing" ? `<div class="iu-warn iu-warn--soft">${escapeHTML(t("keepTabOpen"))}</div>` : ""}
        <div class="iu-progress-actions">
          ${state.mode === "unfollowing" ? `
            <button type="button" class="iu-btn" data-action="pause-unfollow">${escapeHTML(t(state.unfollowPaused ? "resume" : "pause"))}</button>
            <button type="button" class="iu-btn iu-btn--ghost" data-action="cancel-unfollow">${escapeHTML(t("cancel"))}</button>
          ` : `
            ${failed.length ? `<button type="button" class="iu-btn iu-btn--danger" data-action="retry-failed">${escapeHTML(t("retryFailed", { count: failed.length }))}</button>` : ""}
            <button type="button" class="iu-btn iu-btn--primary" data-action="back-results">${escapeHTML(t("goBack"))}</button>
          `}
        </div>
      </div>
    `;
  }

  // A compact, non-interactive row for the unfollow-done summary list.
  function doneRow(user, ok) {
    return `
      <div class="iu-done-row">
        <img class="iu-avatar iu-avatar--sm" src="${escapeAttr(user.profile_pic_url || "")}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <a class="iu-done-name" href="/${encodeURIComponent(user.username)}/" target="_blank" rel="noopener noreferrer">@${escapeHTML(user.username)}</a>
        <span class="iu-tag ${ok ? "iu-tag--green" : "iu-tag--red"}">${ok ? "✓" : "✕"}</span>
      </div>`;
  }

  function bindUnfollow(body) {
    body.querySelector("[data-action='pause-unfollow']")?.addEventListener("click", () => {
      state.unfollowPaused = !state.unfollowPaused;
      renderBody();
    });
    body.querySelector("[data-action='cancel-unfollow']")?.addEventListener("click", () => {
      state.unfollowCancelled = true;
      state.unfollowPaused = false;
    });
    body.querySelector("[data-action='back-results']")?.addEventListener("click", () => {
      state.mode = "results";
      state.log = [];
      state.unfollowCancelled = false;
      renderBody();
    });
    body.querySelector("[data-action='retry-failed']")?.addEventListener("click", () => {
      const retryTargets = state.log.filter((e) => !e.ok).map((e) => e.user);
      if (retryTargets.length) startUnfollow(retryTargets);
    });
  }

  async function startScan() {
    state.error = "";
    state.mode = "scanning";
    state.scanPaused = false;
    state.scanCancelled = false;
    state.users = [];
    state.followingCount = 0;
    state.followersCount = 0;
    state.selected.clear();
    state.selectMode = null;
    state.log = [];
    state.progress = { current: 0, total: 0, label: "loadingFollowing", note: "" };
    renderBody();

    try {
      const sessErr = sessionError();
      if (sessErr) throw new Error(t(sessErr));
      const viewerId = getCookie("ds_user_id");

      const onPage = (results, totalGuess) => {
        state.progress = {
          current: results.length,
          total: totalGuess || 0,
          label: "loadingFollowing",
          note: ""
        };
        updateProgressDOM();
      };

      const following = await fetchFollowingWithBackStatus(viewerId, onPage);
      if (state.scanCancelled) return resetToIdle();
      state.followingCount = following.length;
      state.followersCount = following.filter((user) => user.follows_viewer).length;
      state.users = following;

      state.mode = "results";
      const nonFollowers = state.users.filter((u) => !u.follows_viewer && !state.hidden.has(u.id)).length;
      toast(t("scanCompletedToast", { count: nonFollowers }));
      renderBody();
    } catch (error) {
      console.error("[iu] scan failed:", error);
      state.error = error?.message || String(error) || t("scanFailed");
      state.mode = "idle";
      renderBody();
    }
  }

  function resetToIdle() {
    state.mode = "idle";
    state.users = [];
    state.scanCancelled = false;
    state.error = "";
    renderBody();
  }

  async function fetchFollowingWithBackStatus(viewerId, onPage) {
    const results = [];
    let cursor = "";
    let page = 0;
    let totalGuess = 0;

    while (true) {
      await waitWhile(() => state.scanPaused && !state.scanCancelled);
      if (state.scanCancelled) return results;

      const variables = {
        id: viewerId,
        include_reel: true,
        fetch_mutual: false,
        first: 24
      };
      if (cursor) variables.after = cursor;
      const url = `/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables=${encodeURIComponent(JSON.stringify(variables))}`;
      const json = await igFetch(url);
      const edge = json?.data?.user?.edge_follow;
      if (!edge?.edges) throw new Error(t("scanFailed"));
      const users = edge.edges.map((item) => normalizeUser(item.node)).filter((u) => u.id && u.username);
      results.push(...users);

      if (!totalGuess && typeof edge.count === "number") totalGuess = edge.count;
      onPage(results, totalGuess);

      cursor = edge.page_info?.end_cursor || "";
      page += 1;
      if (!edge.page_info?.has_next_page || !cursor) break;

      await sleep(randomBetween(state.timings.scanDelayMin, state.timings.scanDelayMax));
      if (state.timings.scanPauseEveryPages > 0 && page % state.timings.scanPauseEveryPages === 0) {
        await sleepWithCountdown(state.timings.scanPauseMs, "scanPause");
      }
    }
    return dedupe(results);
  }

  // Shared fetch with rate-limit resilience: retries on 429/5xx up to MAX_RETRIES
  // with Retry-After / exponential backoff, surfacing a countdown. Pass
  // { raw: true } to get the Response back (no JSON parse) — used by unfollow,
  // which only cares whether the request succeeded.
  async function igFetch(url, init = {}) {
    const { raw, headers, ...rest } = init;
    let attempt = 0;
    while (true) {
      const response = await fetch(url, {
        credentials: "include",
        ...rest,
        headers: { ...IG_HEADERS, ...(headers || {}) }
      });
      if (response.ok) return raw ? response : response.json();
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        if (attempt >= MAX_RETRIES) {
          if (response.status === 429) throw new Error(t("tooManyRequests"));
          throw new Error(t("requestFailed", { status: response.status }));
        }
        const retryAfter = parseRetryAfter(response.headers.get("retry-after"));
        const wait = retryAfter || Math.min(60000, 5000 * Math.pow(2, attempt));
        await sleepWithCountdown(wait, "cooldownIn");
        attempt += 1;
        continue;
      }
      throw new Error(t("requestFailed", { status: response.status }));
    }
  }

  function parseRetryAfter(value) {
    if (!value) return 0;
    const seconds = Number(value);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
    const date = Date.parse(value);
    if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
    return 0;
  }

  function confirmUnfollow() {
    if (!state.selected.size) return;
    const count = state.selected.size;
    showDialog({
      title: t("unfollowConfirmTitle", { count }),
      body: t("unfollowConfirmBody"),
      confirmLabel: t("unfollowConfirmBtn", { count }),
      destructive: true,
      onConfirm: () => startUnfollow(state.users.filter((u) => state.selected.has(u.id)))
    });
  }

  async function startUnfollow(targets) {
    targets = (targets || []).filter(Boolean);
    if (!targets.length) return;
    const sessErr = sessionError();
    if (sessErr) {
      toast(t(sessErr));
      return;
    }
    const csrf = getCookie("csrftoken");

    state.mode = "unfollowing";
    state.unfollowPaused = false;
    state.unfollowCancelled = false;
    state.rateLimited = false;
    state.log = [];
    state.failed.clear();
    state.progress = { current: 0, total: targets.length, label: "unfollowing", note: "" };
    renderBody();

    let processed = 0;
    for (let i = 0; i < targets.length; i += 1) {
      await waitWhile(() => state.unfollowPaused && !state.unfollowCancelled);
      if (state.unfollowCancelled) break;

      const user = targets[i];
      let ok = false;
      let rateLimited = false;
      try {
        ok = await unfollowUser(user.id, csrf);
      } catch (error) {
        console.error("[iu] unfollow failed for", user.username, error);
        rateLimited = error && error.message === t("tooManyRequests");
      }

      // Permanent rate-limit: auto-pause instead of silently failing, surface a
      // clear warning, and re-try the SAME user once the user resumes.
      if (rateLimited && !state.unfollowCancelled) {
        state.rateLimited = true;
        state.unfollowPaused = true;
        renderBody();
        await waitWhile(() => state.unfollowPaused && !state.unfollowCancelled);
        if (state.unfollowCancelled) break;
        state.rateLimited = false;
        i -= 1; // retry this user
        continue;
      }

      state.log.push({ user, ok });
      if (ok) {
        state.failed.delete(user.id);
        state.selected.delete(user.id);
        const userRef = state.users.find((u) => u.id === user.id);
        if (userRef) userRef.unfollowed = true;
      } else {
        state.failed.add(user.id);
      }
      processed += 1;
      state.progress = { current: processed, total: targets.length, label: "unfollowing", note: "" };
      renderBody();

      const isLast = i === targets.length - 1;
      if (!isLast) {
        await sleepWithCountdown(randomBetween(state.timings.unfollowDelayMin, state.timings.unfollowDelayMax), "nextActionIn");
        if (state.timings.unfollowPauseEvery > 0 && (i + 1) % state.timings.unfollowPauseEvery === 0) {
          await sleepWithCountdown(state.timings.unfollowPauseMs, "cooldownIn");
        }
      }
    }

    state.users = state.users.filter((u) => !u.unfollowed);
    state.mode = "unfollowDone";
    state.waitUntil = 0;
    state.waitReason = "";
    renderBody();
  }

  async function unfollowUser(id, csrf) {
    const init = {
      method: "POST",
      raw: true,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "x-csrftoken": csrf
      }
    };
    // Both endpoints go through igFetch, so a 429/5xx auto-backs-off (and a
    // permanent rate-limit throws, letting startUnfollow auto-pause). The first
    // is the modern API; the second is a fallback for other failures.
    const primary = await igFetch(`/api/v1/friendships/destroy/${id}/`, init);
    if (primary.ok) return true;
    const fallback = await igFetch(`/web/friendships/${id}/unfollow/`, init);
    return fallback.ok;
  }

  async function copyUsernames() {
    const display = getDisplayUsers();
    const target = state.selected.size
      ? display.filter((u) => state.selected.has(u.id))
      : display;
    if (!target.length) return;
    const text = target.map((u) => u.username).sort().join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast(t("copiedToast", { count: target.length }));
    } catch (error) {
      console.error("[iu] copy failed:", error);
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast(t("copiedToast", { count: target.length })); }
      catch { /* give up */ }
      ta.remove();
    }
  }

  function showSettings() {
    const fields = [
      ["scanDelayMin", "minScanDelay", 100],
      ["scanDelayMax", "maxScanDelay", 100],
      ["scanPauseEveryPages", "scanPauseEvery", 1],
      ["scanPauseMs", "scanPauseLength", 1000],
      ["unfollowDelayMin", "minUnfollowDelay", 1000],
      ["unfollowDelayMax", "maxUnfollowDelay", 1000],
      ["unfollowPauseEvery", "unfollowPauseEvery", 1],
      ["unfollowPauseMs", "unfollowPauseLength", 1000]
    ];
    const formHTML = fields.map(([key, label, step]) => `
      <label class="iu-field">
        <span>${escapeHTML(t(label))}</span>
        <input type="number" min="0" step="${step}" data-setting="${escapeAttr(key)}" value="${Number(state.timings[key])}">
      </label>
    `).join("");

    showDialog({
      title: t("settingsTitle"),
      body: t("settingsBody"),
      contentHTML: `<div class="iu-form">${formHTML}</div>`,
      confirmLabel: t("save"),
      extraButton: { label: t("restoreDefaults"), action: "restore" },
      onConfirm: (dialog) => {
        dialog.querySelectorAll("[data-setting]").forEach((input) => {
          const key = input.getAttribute("data-setting");
          const val = Number(input.value);
          if (Number.isFinite(val) && val >= 0) state.timings[key] = val;
        });
        persist();
        toast(t("saved"));
      },
      onExtra: (dialog) => {
        Object.assign(state.timings, DEFAULT_TIMINGS);
        dialog.querySelectorAll("[data-setting]").forEach((input) => {
          const key = input.getAttribute("data-setting");
          input.value = state.timings[key];
        });
      }
    });
  }

  function showDialog({ title, body, contentHTML, confirmLabel, destructive, extraButton, onConfirm, onExtra }) {
    const overlay = document.createElement("div");
    overlay.className = "iu-overlay";
    overlay.innerHTML = `
      <div class="iu-dialog" role="dialog" aria-modal="true">
        <h3>${escapeHTML(title)}</h3>
        ${body ? `<p>${escapeHTML(body)}</p>` : ""}
        ${contentHTML || ""}
        <div class="iu-dialog-actions">
          ${extraButton ? `<button type="button" class="iu-btn iu-btn--ghost iu-btn--small" data-extra>${escapeHTML(extraButton.label)}</button>` : ""}
          <button type="button" class="iu-btn iu-btn--small" data-cancel>${escapeHTML(t("cancel"))}</button>
          <button type="button" class="iu-btn iu-btn--small ${destructive ? "iu-btn--danger" : "iu-btn--primary"}" data-confirm>${escapeHTML(confirmLabel)}</button>
        </div>
      </div>
    `;
    document.getElementById(APP_ID).appendChild(overlay);
    const close = () => overlay.remove();
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    overlay.querySelector("[data-cancel]").addEventListener("click", close);
    overlay.querySelector("[data-confirm]").addEventListener("click", () => {
      try { onConfirm?.(overlay.querySelector(".iu-dialog")); } finally { close(); }
    });
    if (extraButton && onExtra) {
      overlay.querySelector("[data-extra]").addEventListener("click", () => onExtra(overlay.querySelector(".iu-dialog")));
    }
  }

  function cycleLanguage() {
    const i = LANGS.indexOf(state.language);
    state.language = LANGS[(i + 1) % LANGS.length];
    persist();
    renderShell();
  }

  // --- Theme (light / dark / system) -----------------------------------------
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  function resolvedTheme() {
    if (state.theme === "light" || state.theme === "dark") return state.theme;
    return prefersDark.matches ? "dark" : "light";
  }

  function applyTheme() {
    document.getElementById(APP_ID)?.classList.toggle("iu-theme-light", resolvedTheme() === "light");
  }

  function cycleTheme() {
    // system -> light -> dark -> system
    state.theme = state.theme === "system" ? "light" : state.theme === "light" ? "dark" : "system";
    persist();
    renderShell();
  }

  function themeIcon() {
    if (state.theme === "light") return SVG.sun;
    if (state.theme === "dark") return SVG.moon;
    return SVG.auto;
  }

  function themeTitleKey() {
    return state.theme === "light" ? "themeLight" : state.theme === "dark" ? "themeDark" : "themeSystem";
  }

  function onSystemThemeChange() {
    if (state.theme === "system") applyTheme();
  }

  function getDisplayUsers() {
    const query = state.search.trim().toLowerCase();
    return getDisplayNoSearch()
      .filter((u) => !query || (u.username + " " + (u.full_name || "")).toLowerCase().includes(query));
  }

  // The non-followers visible after the hidden/showHidden + category filters,
  // but WITHOUT the search query. Used to decide which quick-select buttons to
  // show, so typing a non-matching search never makes the buttons disappear.
  function getDisplayNoSearch() {
    return getPool()
      .filter((u) => state.filters.verified || !u.is_verified)
      .filter((u) => state.filters.private || !u.is_private)
      .filter((u) => state.filters.noAvatar || !isDefaultAvatar(u))
      .sort((a, b) => a.username.localeCompare(b.username));
  }

  // The base population: people you follow who don't follow back, respecting only
  // the hidden/showHidden toggle. Used to decide which filter chips are relevant
  // (a chip is shown only if that category exists at all), independent of the
  // category filters or search.
  function getPool() {
    return state.users
      .filter((u) => !u.follows_viewer)
      .filter((u) => state.filters.showHidden ? state.hidden.has(u.id) : !state.hidden.has(u.id));
  }

  function normalizeUser(raw) {
    return {
      id: String(raw.id || raw.pk || raw.pk_id || ""),
      username: String(raw.username || ""),
      full_name: String(raw.full_name || ""),
      profile_pic_url: String(raw.profile_pic_url || raw.profile_pic_url_hd || ""),
      is_verified: Boolean(raw.is_verified),
      is_private: Boolean(raw.is_private),
      follows_viewer: Boolean(raw.follows_viewer ?? raw.friendship_status?.followed_by ?? raw.followed_by)
    };
  }

  function dedupe(list) {
    const seen = new Set();
    return list.filter((u) => {
      if (!u.id || seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
  }

  function isDefaultAvatar(user) {
    const url = user.profile_pic_url || "";
    return /44884218_345707102882519|464760996_1254146839119862/.test(url);
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
  }

  // Verify the user is logged in before any network work. Distinguishes a
  // missing/expired session from a rate-limit so we can guide the user correctly.
  // NOTE: Instagram's `sessionid` cookie is HttpOnly, so it's never visible to
  // document.cookie — we must NOT check it here or logged-in users always fail.
  // `ds_user_id` (the viewer id) and `csrftoken` are readable and sufficient.
  // Returns an i18n error key if something's wrong, else null.
  function sessionError() {
    if (!getCookie("ds_user_id")) return "cookieMissing";
    if (!getCookie("csrftoken")) return "csrfMissing";
    return null;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
  }

  function randomBetween(min, max) {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  }

  async function waitWhile(predicate, interval = 200) {
    while (predicate()) await sleep(interval);
  }

  async function sleepWithCountdown(ms, reasonKey) {
    state.waitUntil = Date.now() + ms;
    state.waitReason = reasonKey;
    updateCountdownDOM();
    const start = Date.now();
    while (Date.now() - start < ms) {
      if (state.scanCancelled || state.unfollowCancelled) break;
      await sleep(Math.min(250, ms - (Date.now() - start)));
      if (state.scanPaused || state.unfollowPaused) {
        const pauseStart = Date.now();
        await waitWhile(() => state.scanPaused || state.unfollowPaused);
        state.waitUntil += Date.now() - pauseStart;
        updateCountdownDOM();
      }
    }
    state.waitUntil = 0;
    state.waitReason = "";
    updateCountdownDOM();
  }

  function startCountdown() {
    if (countdownTimer) return;
    countdownTimer = setInterval(updateCountdownDOM, 500);
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function updateCountdownDOM() {
    const node = document.querySelector(`#${APP_ID} [data-countdown]`);
    if (!node) return;
    if (!state.waitUntil) {
      node.textContent = "";
      return;
    }
    const remaining = Math.max(0, Math.ceil((state.waitUntil - Date.now()) / 1000));
    const reason = state.waitReason || "nextActionIn";
    node.textContent = t(reason, { seconds: remaining });
  }

  function updateProgressDOM() {
    const root = document.querySelector(`#${APP_ID} [data-body]`);
    if (!root) return;
    const { current, total, label, note } = state.progress;
    const percent = total ? Math.min(100, Math.round((current / total) * 100)) : 0;
    const bar = root.querySelector("[data-progress-bar]");
    if (bar) bar.style.width = percent + "%";
    const counter = root.querySelector("[data-progress-counter]");
    if (counter) counter.textContent = total ? t("ofTotal", { current, total }) : t("ofUnknown", { current });
    const labelEl = root.querySelector("[data-progress-label]");
    if (labelEl) labelEl.textContent = state.scanPaused ? t("paused") : t(label);
    const noteEl = root.querySelector("[data-progress-note]");
    if (noteEl) noteEl.textContent = note || "";
    if (state.minimized) {
      const pillLabelEl = document.querySelector(`#${APP_ID} [data-pill-label]`);
      if (pillLabelEl) pillLabelEl.textContent = pillLabel();
    }
  }

  function toast(message) {
    const root = document.getElementById(APP_ID);
    if (!root) return;
    root.querySelector(".iu-toast")?.remove();
    if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
    const node = document.createElement("div");
    node.className = "iu-toast";
    node.textContent = message;
    root.appendChild(node);
    toastTimer = setTimeout(() => { node.remove(); toastTimer = null; }, 3500);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function escapeAttr(value) {
    return escapeHTML(value);
  }

  const CSS = `
    #${APP_ID}, #${APP_ID} * { box-sizing: border-box; }
    /* Dark palette (default) — mirrors the website's brand greens (oklch hue 150)
       and surface tokens so the panel matches the site's design language. */
    #${APP_ID} {
      --iu-bg: oklch(0.18 0.005 250);
      --iu-bg-2: oklch(0.22 0.006 250);
      --iu-bg-3: oklch(0.26 0.007 250);
      --iu-line: oklch(0.30 0.008 250);
      --iu-line-strong: oklch(0.38 0.009 250);
      --iu-text: oklch(0.97 0 0);
      --iu-muted: oklch(0.72 0.01 250);
      --iu-accent: oklch(0.70 0.17 150);
      --iu-accent-2: oklch(0.78 0.16 150);
      --iu-accent-ink: oklch(0.18 0.005 250);
      --iu-danger: #ef4444;
      --iu-success: oklch(0.70 0.17 150);
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483647;
      color: var(--iu-text);
      font: 14px/1.45 'Inter Variable', Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    }
    /* Light palette — mirrors the site's light surface + brand tokens. */
    #${APP_ID}.iu-theme-light {
      --iu-bg: oklch(0.98 0.003 250);
      --iu-bg-2: oklch(0.96 0.004 250);
      --iu-bg-3: oklch(0.92 0.006 250);
      --iu-line: oklch(0.87 0.008 250);
      --iu-line-strong: oklch(0.80 0.010 250);
      --iu-text: oklch(0.22 0.01 250);
      --iu-muted: oklch(0.50 0.01 250);
      --iu-accent: oklch(0.60 0.17 150);
      --iu-accent-2: oklch(0.68 0.16 150);
      --iu-accent-ink: #ffffff;
      --iu-danger: #dc2626;
      --iu-success: oklch(0.60 0.17 150);
    }
    #${APP_ID} > * { pointer-events: auto; }
    #${APP_ID} button, #${APP_ID} input, #${APP_ID} a { font: inherit; color: inherit; }
    #${APP_ID} a { text-decoration: none; }
    #${APP_ID} button { cursor: pointer; }

    #${APP_ID} .iu-panel {
      position: absolute;
      width: ${PANEL_WIDTH}px;
      max-width: calc(100vw - 24px);
      max-height: calc(100vh - 24px);
      display: flex;
      flex-direction: column;
      background: var(--iu-bg);
      border: 1px solid var(--iu-line);
      border-radius: 12px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.3);
      overflow: hidden;
      animation: iu-pop 0.18s ease-out;
    }
    #${APP_ID} .iu-panel.iu-resizing { user-select: none; }
    /* Resize handles: thin strips on the 4 edges, small squares on the 4 corners. */
    #${APP_ID} .iu-resize { position: absolute; z-index: 5; touch-action: none; }
    #${APP_ID} .iu-resize--n { top: -3px; left: 8px; right: 8px; height: 8px; cursor: ns-resize; }
    #${APP_ID} .iu-resize--s { bottom: -3px; left: 8px; right: 8px; height: 8px; cursor: ns-resize; }
    #${APP_ID} .iu-resize--e { right: -3px; top: 8px; bottom: 8px; width: 8px; cursor: ew-resize; }
    #${APP_ID} .iu-resize--w { left: -3px; top: 8px; bottom: 8px; width: 8px; cursor: ew-resize; }
    #${APP_ID} .iu-resize--ne { top: -4px; right: -4px; width: 14px; height: 14px; cursor: nesw-resize; }
    #${APP_ID} .iu-resize--nw { top: -4px; left: -4px; width: 14px; height: 14px; cursor: nwse-resize; }
    #${APP_ID} .iu-resize--se { bottom: -4px; right: -4px; width: 14px; height: 14px; cursor: nwse-resize; }
    #${APP_ID} .iu-resize--sw { bottom: -4px; left: -4px; width: 14px; height: 14px; cursor: nesw-resize; }
    @keyframes iu-pop {
      from { opacity: 0; transform: translateY(8px) scale(0.985); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    #${APP_ID} .iu-header {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 12px 12px 14px;
      border-bottom: 1px solid var(--iu-line);
      cursor: grab;
      user-select: none;
      background: linear-gradient(180deg, color-mix(in srgb, var(--iu-text) 3%, transparent), transparent);
    }
    #${APP_ID} .iu-header.iu-dragging { cursor: grabbing; }
    #${APP_ID} .iu-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
    #${APP_ID} .iu-brand-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--iu-accent);
      flex-shrink: 0;
    }
    #${APP_ID} .iu-brand-text { min-width: 0; }
    #${APP_ID} .iu-brand-text strong { display: block; font-size: 14px; font-weight: 600; }
    #${APP_ID} .iu-brand-text span { display: block; font-size: 11px; color: var(--iu-muted); }
    #${APP_ID} .iu-header-actions { display: flex; gap: 4px; flex-shrink: 0; }
    #${APP_ID} .iu-header-actions button {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border: none;
      background: transparent;
      border-radius: 6px;
      color: var(--iu-muted);
      transition: background 0.15s, color 0.15s;
      font-size: 11px;
      font-weight: 600;
    }
    #${APP_ID} .iu-header-actions button:hover { background: var(--iu-bg-2); color: var(--iu-text); }
    #${APP_ID} .iu-header-actions svg { display: block; }

    #${APP_ID} .iu-body {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    #${APP_ID} .iu-welcome {
      padding: 28px 22px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    #${APP_ID} .iu-welcome-icon {
      width: 64px;
      height: 64px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: color-mix(in srgb, var(--iu-accent) 15%, transparent);
      color: var(--iu-accent);
      margin-bottom: 4px;
    }
    #${APP_ID} .iu-welcome-icon--error { background: color-mix(in srgb, var(--iu-danger) 15%, transparent); color: var(--iu-danger); }
    #${APP_ID} .iu-welcome h2 { margin: 0; font-size: 17px; font-weight: 600; }
    #${APP_ID} .iu-welcome p { margin: 0; color: var(--iu-muted); font-size: 13px; max-width: 300px; }

    #${APP_ID} .iu-btn {
      border: 1px solid var(--iu-line);
      background: var(--iu-bg-2);
      color: var(--iu-text);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.15s, border-color 0.15s, transform 0.05s;
    }
    #${APP_ID} .iu-btn:hover:not(:disabled) { background: var(--iu-bg-3); border-color: var(--iu-line-strong); }
    #${APP_ID} .iu-btn:active:not(:disabled) { transform: scale(0.98); }
    #${APP_ID} .iu-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    #${APP_ID} .iu-btn--primary { background: var(--iu-accent); border-color: var(--iu-accent); color: var(--iu-accent-ink); }
    #${APP_ID} .iu-btn--primary:hover:not(:disabled) { background: var(--iu-accent-2); border-color: var(--iu-accent-2); }
    #${APP_ID} .iu-btn--danger { background: var(--iu-danger); border-color: var(--iu-danger); color: #fff; }
    #${APP_ID} .iu-btn--danger:hover:not(:disabled) { background: color-mix(in srgb, var(--iu-danger) 85%, white); border-color: color-mix(in srgb, var(--iu-danger) 85%, white); }
    #${APP_ID} .iu-btn--ghost { background: transparent; }
    #${APP_ID} .iu-btn--lg { padding: 10px 20px; font-size: 14px; margin-top: 8px; }
    #${APP_ID} .iu-btn--small { padding: 6px 10px; font-size: 12px; }

    #${APP_ID} .iu-progress { padding: 22px 20px; display: flex; flex-direction: column; gap: 14px; }
    #${APP_ID} .iu-progress-head h2 { margin: 0; font-size: 15px; font-weight: 600; }
    #${APP_ID} .iu-progress-head p { margin: 4px 0 0; color: var(--iu-muted); font-size: 12px; min-height: 1em; }
    #${APP_ID} .iu-bar {
      height: 6px;
      border-radius: 3px;
      background: color-mix(in srgb, var(--iu-text) 8%, transparent);
      overflow: hidden;
    }
    #${APP_ID} .iu-bar > span {
      display: block;
      height: 100%;
      background: var(--iu-accent);
      transition: width 0.3s ease;
    }
    #${APP_ID} .iu-progress-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }
    #${APP_ID} .iu-progress-actions { display: flex; gap: 8px; }
    #${APP_ID} .iu-current {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      background: var(--iu-bg-2);
      border-radius: 8px;
      font-size: 12px;
    }
    #${APP_ID} .iu-current strong { font-weight: 600; }
    /* Done state hugs its content (no fixed panel height), so the panel shrinks to
       fit the summary. A long list scrolls within its own max-height instead of
       growing the panel past the screen. */
    #${APP_ID} .iu-progress--done { flex: 0 1 auto; min-height: 0; }
    #${APP_ID} .iu-done-list {
      flex: 0 1 auto;
      max-height: 50vh;
      overflow-y: auto;
      overscroll-behavior: contain;
      margin: 0 -20px;
      border-top: 1px solid var(--iu-line);
      border-bottom: 1px solid var(--iu-line);
    }
    #${APP_ID} .iu-done-section {
      position: sticky;
      top: 0;
      padding: 8px 20px 4px;
      background: var(--iu-bg);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--iu-muted);
    }
    #${APP_ID} .iu-done-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 20px;
    }
    #${APP_ID} .iu-avatar--sm { width: 28px; height: 28px; }
    #${APP_ID} .iu-done-name {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 13px;
      font-weight: 500;
      color: var(--iu-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #${APP_ID} .iu-done-name:hover { color: var(--iu-accent-2); }
    #${APP_ID} .iu-warn {
      padding: 8px 10px;
      border-radius: 8px;
      font-size: 12px;
      line-height: 1.4;
      background: color-mix(in srgb, var(--iu-danger) 14%, transparent);
      border: 1px solid color-mix(in srgb, var(--iu-danger) 35%, transparent);
      color: var(--iu-text);
    }
    #${APP_ID} .iu-warn--soft {
      background: color-mix(in srgb, var(--iu-accent) 12%, transparent);
      border-color: color-mix(in srgb, var(--iu-accent) 30%, transparent);
      color: var(--iu-text);
    }

    #${APP_ID} .iu-results {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
    #${APP_ID} .iu-results-summary {
      padding: 12px 16px 4px;
      font-size: 13px;
      color: var(--iu-muted);
    }
    #${APP_ID} .iu-search-row {
      padding: 8px 16px;
    }
    #${APP_ID} .iu-search {
      width: 100%;
      height: 36px;
      padding: 0 12px;
      border: 1px solid var(--iu-line);
      border-radius: 8px;
      background: var(--iu-bg-2);
      color: var(--iu-text);
      outline: none;
      transition: border-color 0.15s;
    }
    #${APP_ID} .iu-search:focus { border-color: var(--iu-accent); }
    /* Replace the faint native clear (×) with a clearly-visible themed glyph that
       shows a pointer cursor and brightens on hover. */
    #${APP_ID} .iu-search::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      cursor: pointer;
      background-color: var(--iu-muted);
      -webkit-mask: no-repeat center / 12px url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 4l8 8M12 4l-8 8' stroke='black' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E");
      mask: no-repeat center / 12px url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 4l8 8M12 4l-8 8' stroke='black' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E");
      transition: background-color 0.15s;
    }
    #${APP_ID} .iu-search::-webkit-search-cancel-button:hover { background-color: var(--iu-text); }

    #${APP_ID} .iu-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 16px 10px;
    }
    #${APP_ID} .iu-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border: 1px solid var(--iu-line);
      border-radius: 999px;
      background: transparent;
      color: var(--iu-muted);
      font-size: 12px;
      transition: border-color 0.15s, color 0.15s, background 0.15s;
    }
    #${APP_ID} .iu-chip:hover { border-color: var(--iu-line-strong); color: var(--iu-text); }
    #${APP_ID} .iu-chip--on { background: color-mix(in srgb, var(--iu-accent) 12%, transparent); border-color: color-mix(in srgb, var(--iu-accent) 50%, transparent); color: var(--iu-accent-2); }
    #${APP_ID} .iu-chip-tick { display: inline-grid; place-items: center; width: 12px; height: 12px; }
    #${APP_ID} .iu-chip-tick svg { width: 12px; height: 12px; }

    #${APP_ID} .iu-list {
      flex: 1 1 auto;
      min-height: 100px;
      overflow-y: auto;
      overscroll-behavior: contain;
      border-top: 1px solid var(--iu-line);
      border-bottom: 1px solid var(--iu-line);
    }
    #${APP_ID} .iu-list-empty {
      padding: 30px 20px;
      text-align: center;
      color: var(--iu-muted);
      font-size: 13px;
    }
    #${APP_ID} .iu-row {
      display: grid;
      grid-template-columns: 18px 36px 1fr auto;
      gap: 10px;
      padding: 8px 16px;
      align-items: center;
      cursor: pointer;
      border-bottom: 1px solid var(--iu-line);
      transition: background 0.1s;
    }
    #${APP_ID} .iu-row:hover { background: color-mix(in srgb, var(--iu-text) 4%, transparent); }
    #${APP_ID} .iu-row:focus-visible { outline: none; background: color-mix(in srgb, var(--iu-accent) 6%, transparent); }
    #${APP_ID} .iu-row--selected { background: color-mix(in srgb, var(--iu-accent) 8%, transparent); }
    #${APP_ID} .iu-row--selected:hover { background: color-mix(in srgb, var(--iu-accent) 12%, transparent); }
    #${APP_ID} .iu-row:last-child { border-bottom: none; }
    #${APP_ID} .iu-row--hidden { opacity: 0.55; }
    #${APP_ID} .iu-row-check {
      width: 16px;
      height: 16px;
      accent-color: var(--iu-accent);
      cursor: pointer;
      margin: 0;
    }
    #${APP_ID} .iu-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      background: var(--iu-bg-3);
    }
    #${APP_ID} .iu-row-text { min-width: 0; }
    #${APP_ID} .iu-row-name {
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
      font-weight: 500;
    }
    #${APP_ID} .iu-row-name a { color: var(--iu-text); }
    #${APP_ID} .iu-row-name a:hover { color: var(--iu-accent-2); }
    #${APP_ID} .iu-row-sub {
      font-size: 12px;
      color: var(--iu-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #${APP_ID} .iu-row-actions {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    #${APP_ID} .iu-icon-btn {
      display: inline-grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--iu-muted);
      transition: background 0.15s, color 0.15s;
    }
    #${APP_ID} .iu-icon-btn:hover { background: var(--iu-bg-2); color: var(--iu-text); }
    #${APP_ID} .iu-text-btn {
      width: auto;
      padding: 0 8px;
      font-size: 11px;
      font-weight: 500;
    }
    #${APP_ID} .iu-tag {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      background: color-mix(in srgb, var(--iu-text) 8%, transparent);
      color: var(--iu-muted);
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    #${APP_ID} .iu-tag--brand { background: color-mix(in srgb, var(--iu-accent) 12%, transparent); border: 1px solid color-mix(in srgb, var(--iu-accent) 30%, transparent); color: var(--iu-accent-2); }
    #${APP_ID} .iu-tag--green { background: color-mix(in srgb, var(--iu-success) 15%, transparent); color: var(--iu-success); }
    #${APP_ID} .iu-tag--red { background: color-mix(in srgb, var(--iu-danger) 15%, transparent); color: var(--iu-danger); }

    #${APP_ID} .iu-actionbar {
      flex-shrink: 0;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: var(--iu-bg);
      border-top: 1px solid var(--iu-line);
    }
    #${APP_ID} .iu-actionbar-left,
    #${APP_ID} .iu-actionbar-right {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    #${APP_ID} .iu-select-group { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    #${APP_ID} .iu-muted { color: var(--iu-muted); font-size: 12px; }

    #${APP_ID} .iu-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: grid;
      place-items: center;
      padding: 20px;
      z-index: 1;
    }
    #${APP_ID} .iu-dialog {
      width: 100%;
      max-width: 380px;
      background: var(--iu-bg);
      border: 1px solid var(--iu-line);
      border-radius: 12px;
      padding: 18px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.55);
    }
    #${APP_ID} .iu-dialog h3 { margin: 0 0 8px; font-size: 16px; }
    #${APP_ID} .iu-dialog p { margin: 0 0 14px; color: var(--iu-muted); font-size: 13px; }
    #${APP_ID} .iu-dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
    #${APP_ID} .iu-dialog-actions [data-extra] { margin-right: auto; }
    #${APP_ID} .iu-form { display: grid; gap: 8px; max-height: 50vh; overflow-y: auto; padding-right: 4px; }
    #${APP_ID} .iu-field { display: grid; grid-template-columns: 1fr 110px; align-items: center; gap: 10px; font-size: 12px; color: var(--iu-muted); }
    #${APP_ID} .iu-field input {
      height: 32px;
      padding: 0 10px;
      border: 1px solid var(--iu-line);
      border-radius: 6px;
      background: var(--iu-bg-2);
      color: var(--iu-text);
      outline: none;
    }
    #${APP_ID} .iu-field input:focus { border-color: var(--iu-accent); }

    #${APP_ID} .iu-toast {
      position: absolute;
      left: 50%;
      bottom: 12px;
      transform: translateX(-50%);
      padding: 8px 14px;
      background: var(--iu-bg-2);
      border: 1px solid var(--iu-line);
      border-radius: 999px;
      font-size: 12px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.35);
      pointer-events: none;
      animation: iu-pop 0.18s ease-out;
    }

    #${APP_ID} .iu-pill {
      position: absolute;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: var(--iu-bg);
      border: 1px solid var(--iu-line);
      color: var(--iu-text);
      border-radius: 999px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.4);
      font-size: 12px;
      font-weight: 500;
      transition: background 0.15s;
      cursor: pointer;
    }
    #${APP_ID} .iu-pill:hover { background: var(--iu-bg-2); }
    #${APP_ID} .iu-pill-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--iu-muted);
    }
    #${APP_ID} .iu-pill-dot--active { background: var(--iu-accent); animation: iu-pulse 1.4s infinite; }
    #${APP_ID} .iu-pill-dot--error { background: var(--iu-danger); }
    @keyframes iu-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    @media (max-width: 480px) {
      #${APP_ID} .iu-panel {
        width: calc(100vw - 16px) !important;
        max-height: calc(100vh - 16px) !important;
        left: 8px !important;
        right: 8px !important;
        top: 8px !important;
        bottom: 8px !important;
      }
      #${APP_ID} .iu-list { max-height: none; flex: 1 1 auto; }
    }
  `;

  cleanupExisting();
  injectStyles();
  mount();
})();
