import type { Translation } from './en'

/** Español */
export const es: Translation = {
  header: {
    title: 'Comprobador de seguidores',
    subtitle:
      'Descubre a quién sigues que no te sigue de vuelta — en las plataformas que usas.',
  },

  selector: {
    label: 'Plataforma',
  },

  theme: {
    toLight: 'Cambiar al tema claro',
    toDark: 'Cambiar al tema oscuro',
    light: 'Tema claro',
    dark: 'Tema oscuro',
  },

  language: {
    label: 'Idioma',
  },

  auth: {
    signOut: 'Cerrar sesión',
  },

  search: {
    check: 'Comprobar',
    checking: 'Comprobando…',
    handleAriaLabel: 'Usuario de {{platform}}',
    placeholderGithub: 'Introduce un usuario de GitHub',
    placeholderGithubAuthed: 'Buscar otro usuario…',
    placeholderBluesky: 'Introduce un identificador de Bluesky (nombre.bsky.social)',
    placeholderBlueskyAuthed: 'Buscar otro identificador…',
    invalidGithub: 'Introduce un usuario de GitHub válido',
    invalidBluesky: 'Introduce un identificador de Bluesky válido (p. ej. nombre.bsky.social)',
  },

  results: {
    ownSummary_one: '<0>{{count}} usuario</0> no te sigue de vuelta — selecciona para quitar.',
    ownSummary_other: '<0>{{count}} usuarios</0> no te siguen de vuelta — selecciona para quitar.',
    otherSummary: 'A <0>@{{handle}}</0> no le devuelven el seguimiento <1>{{label}}</1>',
    countLabel_one: '{{count}} usuario',
    countLabel_other: '{{count}} usuarios',
    onlyOwnAccount: 'Solo puedes quitar personas de tu propia cuenta.',
    backToMyList: 'Volver a mi lista',
    readOnly:
      'Quitar en {{platform}} aún no está disponible — por ahora es solo una vista de lectura.',
    signInCta: 'Inicia sesión para quitar a quienes no te siguen de vuelta.',
    signInNote:
      'Ver funciona sin iniciar sesión — solo inicias sesión para dejar de seguir.',
    privacyNote:
      'Se lee a través de la API oficial. No se guarda nada; los tokens nunca llegan a tu navegador.',
    signInWith: 'Iniciar sesión con {{platform}}',
    signingIn: 'Redirigiendo…',
    blueskySignInCta:
      'Inicia sesión con Bluesky para quitar a quienes no te siguen de vuelta.',
    blueskyHandlePlaceholder: 'tu-identificador.bsky.social',
    blueskyHandleAriaLabel: 'Tu identificador de Bluesky',
    selectAll: 'Seleccionar todo',
    selectedCount: '{{count}} seleccionados',
    unfollowSelected: 'Dejar de seguir a los seleccionados',
    copyUsernames: 'Copiar nombres de usuario',
    copied: '¡Copiado!',
    copiedToast: 'Nombres de usuario copiados al portapapeles',
    copyFailed: 'No se pudo copiar al portapapeles',
    openOn: 'Abrir {{handle}} en {{platform}}',
    avatarAlt: 'Avatar de {{handle}}',
    onboarding:
      'Has iniciado sesión. Selecciona las tarjetas que quieras y usa «Dejar de seguir a los seleccionados». Dejar de seguir solo afecta a tu propia cuenta.',
    dismiss: 'Cerrar',
    confirmTitle: '¿Dejar de seguir a estos usuarios?',
    confirmBody_one:
      'Vas a dejar de seguir a {{count}} usuario. Esta herramienta no puede volver a seguirlo — tendrías que hacerlo manualmente.',
    confirmBody_other:
      'Vas a dejar de seguir a {{count}} usuarios. Esta herramienta no puede volver a seguirlos — tendrías que hacerlo manualmente.',
    confirmLabel: 'Dejar de seguir',
    idleTitle: 'Listo cuando tú lo estés',
    idleAuthed: 'Cargando tu lista… o busca otro usuario arriba.',
    idleGuest:
      'Introduce un identificador de {{platform}} arriba para ver quién no le sigue de vuelta.',
    zeroTitle: '¡Todos te siguen de vuelta!',
    zeroBody: 'Aquí no hay nadie que no te siga de vuelta. Todo en orden.',
    errorTitle: 'Algo salió mal',
    errorBody: 'No pudimos completar esa comprobación. Inténtalo de nuevo.',
    largeAccountNote:
      'Las cuentas muy grandes se comparan hasta un límite, así que los resultados pueden ser parciales.',
    reportIssue: '¿Sigue ocurriendo? Informa de un problema',
    prevPage: 'Anterior',
    nextPage: 'Siguiente',
    pageOf: 'Página {{page}} de {{total}}',
    loading: {
      following: 'Obteniendo la lista de seguidos…',
      followers: 'Reuniendo seguidores…',
      popular: 'Esto puede tardar un momento en cuentas populares…',
      comparing: 'Comparando quién sigue de vuelta…',
      almost: 'Casi listo…',
    },
  },

  unfollow: {
    success_one: 'Dejaste de seguir a {{count}} usuario',
    success_other: 'Dejaste de seguir a {{count}} usuarios',
    failed: 'No se pudo dejar de seguir a {{count}}',
  },

  confirm: {
    cancel: 'Cancelar',
    unfollowing: 'Dejando de seguir…',
  },

  errors: {
    network: 'Error de red. Comprueba tu conexión e inténtalo de nuevo.',
    timeout:
      'Esta cuenta es muy grande y se agotó el tiempo. Inténtalo de nuevo o con una cuenta más pequeña.',
    generic: 'Algo salió mal. Inténtalo de nuevo.',
    unfollowGeneric: 'No se pudo dejar de seguir. Inténtalo de nuevo.',
    rateLimit:
      'Has alcanzado el límite de solicitudes de la plataforma. Espera unos minutos e inténtalo de nuevo.',
    notFound: 'Cuenta no encontrada. Revisa el identificador e inténtalo de nuevo.',
  },

  footer: {
    viewSource: 'Ver el código en GitHub',
    privacy: 'Privacidad',
    disclaimer:
      'Sin afiliación con GitHub, Bluesky, X o Instagram. Úsalo en tus propias cuentas, bajo tu propia responsabilidad.',
  },

  privacy: {
    title: 'Privacidad y aviso legal',
    close: 'Cerrar',
    whatTitle: 'Qué hace esta herramienta',
    whatBody:
      'El Comprobador de seguidores te ayuda a encontrar cuentas que sigues y que no te siguen de vuelta, en GitHub, Bluesky, X (Twitter) e Instagram. Es una herramienta gratuita y personal, sin afiliación, respaldo ni conexión con ninguna de esas plataformas.',
    storeTitle: 'Qué almacenamos',
    storeBody:
      'Nada. No tenemos base de datos ni guardamos tus datos. Las listas de seguidores y seguidos se obtienen, comparan y devuelven para esa única solicitud — nunca se registran ni se guardan.',
    howTitle: 'Cómo funciona cada plataforma',
    howGithubLabel: 'GitHub y Bluesky:',
    howGithubBody:
      'los datos públicos de seguidores se leen a través de sus API oficiales mediante nuestras funciones sin servidor, de modo que las credenciales de la plataforma nunca llegan a tu navegador. Si inicias sesión para dejar de seguir, eso ocurre mediante el OAuth oficial de la plataforma y la sesión solo se usa para realizar las acciones que elijas — los tokens no se conservan.',
    howXLabel: 'X (Twitter):',
    howXBody:
      'se ejecuta por completo en tu navegador. Los archivos de tu archivo de datos se leen y comparan localmente y nunca se suben a ningún sitio.',
    howInstagramLabel: 'Instagram:',
    howInstagramBody:
      'se ejecuta por completo en tu propia sesión del navegador mediante un script que pegas tú mismo. No se envía nada a nuestros servidores.',
    riskTitle: 'Úsalo bajo tu propia responsabilidad',
    riskBody:
      'Las acciones automatizadas o masivas pueden infringir las condiciones del servicio de una plataforma y provocar límites temporales u otras medidas en la cuenta. El script de Instagram en particular es una herramienta de terceros no oficial. Tú eres responsable de cómo usas estas funciones en tus propias cuentas.',
    contactTitle: 'Contacto',
    contactBody: 'Preguntas o informes:',
  },

  instagram: {
    introBody:
      'Instagram no ofrece una API pública para listas de seguidores, así que esta funciona de otra forma: copias un pequeño script y lo pegas en la consola de tu navegador mientras estás en Instagram. Se ejecuta en tu propia sesión.',
    introPrivacy:
      'No se envía nada a ningún servidor — el script solo se comunica con Instagram, directamente desde tu navegador. No podemos ver tu cuenta ni tus datos.',
    consoleLabel: 'Pegar en la consola de DevTools',
    loading: 'Cargando…',
    copied: '¡Copiado!',
    copyCode: 'Copiar el código',
    loadingScript: 'Cargando el script…',
    copiedToast: 'Código copiado — ahora pégalo en la consola',
    copyFailed: 'No se pudo copiar al portapapeles',
    tip_intro:
      'Un script de un solo uso que pegas tú mismo — no se instala y no cambia nada hasta que lo ejecutas.',
    step1: 'Copia el script con el botón de arriba.',
    step2_pre: 'Abre',
    step2_post: 'en este navegador y asegúrate de haber iniciado sesión.',
    step3_pre: 'Abre la consola de desarrollador y luego haz clic en la pestaña',
    step3_consoleWord: 'Console',
    step3_tab: ':',
    step3_winLabel: 'Windows / Linux:',
    step3_winOr: 'o',
    step3_macLabel: 'Mac:',
    step4_pre: 'Pega el script y pulsa',
    step4_enter: 'Intro',
    step4_post:
      '. Aparece un panel en la esquina — pulsa Scan para ver quién no te sigue de vuelta, luego selecciona y deja de seguir.',
    troubleshoot:
      '¿No aparece el panel tras pulsar Intro? Asegúrate de haber iniciado sesión y estar en instagram.com, recarga la página y pega el script de nuevo.',
    tip_pre:
      'Consejo: los navegadores pueden advertirte antes de dejarte pegar en la consola — esa advertencia existe porque pegar código que no entiendes puede ser peligroso. Este script solo lee tu lista de seguidos y deja de seguir lo que elijas. Puedes leerlo en cualquier momento en',
    bmTitle: 'O usa un bookmarklet',
    bmIntro:
      '¿Prefieres un solo clic? Arrastra este botón a tu barra de marcadores, luego abre Instagram y haz clic en él para ejecutarlo.',
    bmButton: 'Instagram Unfollower',
    bmDrag: 'Arrastra esto a tu barra de marcadores (no hagas clic aquí).',
    bmRecommend:
      'Más fiable en Chrome y Edge. En Safari y Firefox el bookmarklet puede ser demasiado largo para guardarlo — si no funciona, usa «Copiar el código» de arriba.',
    riskTitle: 'Úsalo a tu criterio',
    riskBody:
      'Dejar de seguir de forma masiva puede infringir las políticas de comportamiento automatizado de Instagram y provocar un bloqueo temporal de acciones. La herramienta espacia las solicitudes con retrasos y pausas aleatorias para parecer humana, pero el uso es bajo tu responsabilidad. De nuevo: nada sale de tu navegador.',
  },

  twitter: {
    introBody:
      'X no ofrece una forma gratuita de leer listas de seguidores, así que esto funciona desde tu archivo de datos: sube dos archivos y los compararemos aquí mismo en tu navegador.',
    introPrivacy: 'No se sube nada — los archivos nunca salen de tu dispositivo.',
    step1_pre: 'En X, ve a',
    step1_path: 'Configuración → Tu cuenta → Descargar un archivo de tus datos',
    step1_post: ', confirma tu contraseña y solicita el archivo.',
    step1_guide: 'Guía',
    step2: 'X te envía un correo cuando está listo (puede tardar de horas a un día). Descárgalo y descomprímelo.',
    step3_pre: 'Abre la carpeta',
    step3_dataWord: 'data',
    step3_mid: 'y sube',
    step3_and: 'y',
    step3_part: 'part',
    step3_post: ', añádelos todos).',
    step3_ifSplit: '(si están divididos en archivos',
    dropzone_pre: 'Arrastra',
    dropzone_and: 'y',
    dropzone_post: 'aquí, o',
    reading: 'Leyendo…',
    chooseFiles: 'Elegir archivos',
    bothFilesError:
      'Añade ambos archivos: following.js y follower.js (de la carpeta data/ de tu archivo).',
    readError:
      'No se pudieron leer esos archivos. Asegúrate de que provienen de tu archivo de X.',
    ignoredFiles: 'Se ignoraron {{count}} archivo(s) no relacionado(s).',
    resultSummary_one: '<0>{{count}} cuenta</0> que sigues no te sigue de vuelta.',
    resultSummary_other: '<0>{{count}} cuentas</0> que sigues no te siguen de vuelta.',
    idLimitNote:
      'Los archivos de X solo contienen ID numéricos de cuenta, así que no se pueden mostrar los identificadores. Cada enlace abre el perfil real en X.',
    viewOnlyNote:
      'Esta es una lista de solo lectura — dejar de seguir en X no está disponible aquí. Abre un perfil para dejar de seguir en X.',
    idLabel: 'ID {{id}}',
    openProfile: 'Abrir perfil',
    copyLinks: 'Copiar enlaces',
    copied: '¡Copiado!',
    copiedToast: 'Enlaces de perfil copiados al portapapeles',
    copyFailed: 'No se pudo copiar al portapapeles',
    startOver: 'Empezar de nuevo',
    zeroTitle: '¡Todos te siguen de vuelta!',
    zeroBody: 'Según tu archivo, todos los que sigues te siguen de vuelta.',
  },
}
