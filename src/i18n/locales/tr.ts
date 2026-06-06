import type { Translation } from './en'

/** Türkçe */
export const tr: Translation = {
  header: {
    title: 'Takip Etmeyenler',
    subtitle:
      'Kullandığın platformlarda, takip ettiğin ama seni geri takip etmeyenleri öğren.',
  },

  selector: {
    label: 'Platform',
  },

  theme: {
    toLight: 'Açık temaya geç',
    toDark: 'Koyu temaya geç',
    light: 'Açık tema',
    dark: 'Koyu tema',
  },

  language: {
    label: 'Dil',
  },

  auth: {
    signIn: 'Giriş yap',
    signOut: 'Çıkış yap',
  },

  search: {
    check: 'Kontrol et',
    checking: 'Kontrol ediliyor…',
    handleAriaLabel: '{{platform}} kullanıcı adı',
    placeholderGithub: 'Bir GitHub kullanıcı adı gir',
    placeholderGithubAuthed: 'Başka bir kullanıcıya bak…',
    placeholderBluesky: 'Bir Bluesky handle gir (ad.bsky.social)',
    placeholderBlueskyAuthed: 'Başka bir handle’a bak…',
    invalidGithub: 'Lütfen geçerli bir GitHub kullanıcı adı gir',
    invalidBluesky: 'Lütfen geçerli bir Bluesky handle gir (ör. ad.bsky.social)',
  },

  results: {
    ownSummary_one: '<0>{{count}} kişi</0> seni geri takip etmiyor — kaldırmak için seç.',
    ownSummary_other: '<0>{{count}} kişi</0> seni geri takip etmiyor — kaldırmak için seç.',
    otherSummary: '<0>@{{handle}}</0> şunlar tarafından geri takip edilmiyor: <1>{{label}}</1>',
    countLabel_one: '{{count}} kişi',
    countLabel_other: '{{count}} kişi',
    onlyOwnAccount: 'Yalnızca kendi hesabından kişi kaldırabilirsin.',
    backToMyList: 'Listeme dön',
    readOnly:
      '{{platform}} üzerinde kaldırma henüz mümkün değil — şimdilik bu yalnızca görüntüleme.',
    signInCta: 'Seni geri takip etmeyenleri kaldırmak için giriş yap.',
    signInNote:
      'Görüntüleme giriş yapmadan da çalışır — yalnızca takibi bırakmak için giriş yaparsın.',
    privacyNote:
      'Resmi API üzerinden okunur. Hiçbir şey saklanmaz; token’lar tarayıcına ulaşmaz.',
    signInWith: '{{platform}} ile giriş yap',
    signingIn: 'Yönlendiriliyor…',
    blueskySignInCta:
      'Seni geri takip etmeyenleri kaldırmak için Bluesky ile giriş yap.',
    blueskyHandlePlaceholder: 'senin-handle.bsky.social',
    blueskyHandleAriaLabel: 'Bluesky handle’ın',
    selectAll: 'Tümünü seç',
    selectedCount: '{{count}} seçili',
    unfollowSelected: 'Seçilenleri bırak',
    copyUsernames: 'Kullanıcı adlarını kopyala',
    copied: 'Kopyalandı!',
    copiedToast: 'Kullanıcı adları panoya kopyalandı',
    copyFailed: 'Panoya kopyalanamadı',
    openOn: '{{handle}} profilini {{platform}} üzerinde aç',
    avatarAlt: '{{handle}} avatarı',
    onboarding:
      'Giriş yaptın. İstediğin kartları seç, sonra “Seçilenleri bırak”ı kullan. Takip bırakma yalnızca kendi hesabını etkiler.',
    dismiss: 'Kapat',
    confirmTitle: 'Takibi bırak?',
    confirmBody_one:
      '{{count}} kişinin takibini bırakmak üzeresin. Bu araç onları yeniden takip edemez — bunu elle yapman gerekir.',
    confirmBody_other:
      '{{count}} kişinin takibini bırakmak üzeresin. Bu araç onları yeniden takip edemez — bunu elle yapman gerekir.',
    confirmLabel: 'Takibi bırak',
    idleTitle: 'Hazır olduğunda başla',
    idleAuthed: 'Listen yükleniyor… ya da yukarıdan başka bir kullanıcı ara.',
    idleGuest:
      'Kimlerin geri takip etmediğini görmek için yukarıya bir {{platform}} handle gir.',
    idleGuest_github:
      'Kimlerin geri takip etmediğini görmek için yukarıya bir {{platform}} kullanıcı adı gir.',
    idleGuest_bluesky:
      'Kimlerin geri takip etmediğini görmek için yukarıya bir {{platform}} handle gir.',
    zeroTitle: 'Herkes geri takip ediyor!',
    zeroBody: 'Burada seni geri takip etmeyen kimse yok. Tertemiz.',
    errorTitle: 'Bir şeyler ters gitti',
    errorBody: 'Bu kontrolü tamamlayamadık. Lütfen tekrar dene.',
    largeAccountNote:
      'Çok büyük hesaplar bir sınıra kadar karşılaştırılır, bu yüzden sonuçlar eksik olabilir.',
    reportIssue: 'Sürekli mi oluyor? Bir sorun bildir',
    prevPage: 'Önceki',
    nextPage: 'Sonraki',
    pageOf: 'Sayfa {{page}} / {{total}}',
    loading: {
      following: 'Takip edilenler listesi alınıyor…',
      followers: 'Takipçiler toplanıyor…',
      popular: 'Popüler hesaplarda biraz sürebilir…',
      comparing: 'Kimin geri takip ettiği karşılaştırılıyor…',
      almost: 'Neredeyse bitti…',
    },
  },

  unfollow: {
    success_one: '{{count}} kişinin takibi bırakıldı',
    success_other: '{{count}} kişinin takibi bırakıldı',
    failed: '{{count}} kişi bırakılamadı',
  },

  confirm: {
    cancel: 'İptal',
    unfollowing: 'Bırakılıyor…',
  },

  errors: {
    network: 'Ağ hatası. Bağlantını kontrol edip tekrar dene.',
    timeout:
      'Bu hesap çok büyük ve zaman aşımına uğradı. Tekrar dene ya da daha küçük bir hesap.',
    generic: 'Bir şeyler ters gitti. Lütfen tekrar dene.',
    unfollowGeneric: 'Takip bırakılamadı. Lütfen tekrar dene.',
    rateLimit:
      'Platformun istek sınırına ulaştın. Birkaç dakika bekleyip tekrar dene.',
    notFound: 'Hesap bulunamadı. Handle’ı kontrol edip tekrar dene.',
  },

  footer: {
    viewSource: 'Kaynak kodu',
    sponsor: 'Destek ol',
    privacy: 'Gizlilik',
    disclaimer:
      'GitHub, Bluesky, X veya Instagram ile bağlantılı değildir. Kendi hesaplarında, kendi sorumluluğunda kullan.',
  },

  privacy: {
    title: 'Gizlilik ve sorumluluk reddi',
    close: 'Kapat',
    whatTitle: 'Bu araç ne yapar',
    whatBody:
      'Takip Etmeyenler; GitHub, Bluesky, X (Twitter) ve Instagram’da takip ettiğin ama seni geri takip etmeyen hesapları bulmana yardım eder. Ücretsiz, kişisel bir araçtır ve bu platformların hiçbiriyle bağlantılı, onaylı ya da ilişkili değildir.',
    storeTitle: 'Neyi saklıyoruz',
    storeBody:
      'Hiçbir şeyi. Veritabanı çalıştırmıyoruz ve verilerini saklamıyoruz. Takipçi ve takip listeleri yalnızca o tek istek için alınır, karşılaştırılır ve döndürülür — asla kaydedilmez veya loglanmaz.',
    howTitle: 'Her platform nasıl çalışır',
    howGithubLabel: 'GitHub ve Bluesky:',
    howGithubBody:
      'public takipçi verisi, sunucusuz fonksiyonlarımız üzerinden resmi API’leriyle okunur, böylece platform kimlik bilgileri tarayıcına hiç ulaşmaz. Takip bırakmak için giriş yaparsan bu, platformun resmi OAuth’u üzerinden olur ve oturum yalnızca senin seçtiğin işlemleri yapmak için kullanılır — token’lar saklanmaz.',
    howXLabel: 'X (Twitter):',
    howXBody:
      'tamamen tarayıcında çalışır. Veri arşivindeki dosyalar yerel olarak okunur ve karşılaştırılır, hiçbir yere yüklenmez.',
    howInstagramLabel: 'Instagram:',
    howInstagramBody:
      'tamamen kendi tarayıcı oturumunda, senin yapıştırdığın bir script ile çalışır. Sunucularımıza hiçbir şey gönderilmez.',
    riskTitle: 'Kendi sorumluluğunda kullan',
    riskBody:
      'Otomatik veya toplu işlemler bir platformun hizmet şartlarına aykırı olabilir ve geçici kısıtlamalara ya da başka hesap işlemlerine yol açabilir. Özellikle Instagram script’i resmi olmayan, üçüncü taraf bir araçtır. Bu özellikleri kendi hesaplarında nasıl kullandığından sen sorumlusun.',
    contactTitle: 'İletişim',
    contactBody: 'Soru veya bildirimler:',
  },

  instagram: {
    introBody:
      'Instagram, takipçi listeleri için herkese açık bir API sunmuyor, bu yüzden bu farklı çalışır: küçük bir script’i kopyalayıp Instagram’dayken tarayıcının konsoluna yapıştırırsın. Senin kendi oturumunda çalışır.',
    introPrivacy:
      'Hiçbir sunucuya bir şey gönderilmez — script yalnızca Instagram ile, doğrudan tarayıcından konuşur. Hesabını veya verilerini göremeyiz.',
    consoleLabel: 'DevTools konsoluna yapıştır',
    loading: 'Yükleniyor…',
    copied: 'Kopyalandı!',
    copyCode: 'Kodu kopyala',
    loadingScript: 'Script yükleniyor…',
    copiedToast: 'Kod kopyalandı — şimdi konsola yapıştır',
    copyFailed: 'Panoya kopyalanamadı',
    tip_intro:
      'Kendin yapıştırdığın tek seferlik bir script — kurulmaz ve sen çalıştırana kadar hiçbir şeyi değiştirmez.',
    step1: 'Yukarıdaki butonla script’i kopyala.',
    step2_pre: 'Bu tarayıcıda',
    step2_post: 'adresini aç ve giriş yapmış olduğundan emin ol.',
    step3_pre: 'Geliştirici konsolunu aç, sonra',
    step3_consoleWord: 'Console',
    step3_tab: 'sekmesine tıkla:',
    step3_winLabel: 'Windows / Linux:',
    step3_winOr: 'veya',
    step3_macLabel: 'Mac:',
    step4_pre: 'Script’i yapıştır ve',
    step4_enter: 'Enter',
    step4_post:
      '’a bas. Köşede bir panel belirir — kimin geri takip etmediğini görmek için Scan’e bas, sonra seç ve takibi bırak.',
    troubleshoot:
      'Enter’a bastıktan sonra panel çıkmadıysa: giriş yaptığından ve instagram.com’da olduğundan emin ol, sayfayı yenile ve script’i tekrar yapıştır.',
    tip_pre:
      'İpucu: tarayıcılar konsola yapıştırmadan önce uyarı verebilir — bu uyarı, anlamadığın bir kodu yapıştırmanın tehlikeli olabileceği içindir. Bu script yalnızca takip listeni okur ve senin seçtiklerinin takibini bırakır. Dilediğin zaman şu adresten okuyabilirsin:',
    bmTitle: 'Veya bir bookmarklet kullan',
    bmIntro:
      'Tek tıkla mı istersin? Bu butonu yer imi çubuğuna sürükle, sonra Instagram’ı açıp tıklayarak çalıştır.',
    bmButton: 'Instagram Takip Etmeyenler',
    bmDrag: 'Bunu yer imi çubuğuna sürükle (burada tıklama).',
    bmRecommend:
      'En sağlamı Chrome ve Edge’de. Safari ve Firefox’ta bookmarklet kaydedilemeyecek kadar uzun olabilir — çalışmazsa yukarıdaki “Kodu kopyala”yı kullan.',
    riskTitle: 'Kendi takdirine göre kullan',
    riskBody:
      'Toplu takip bırakma, Instagram’ın otomatik davranış politikalarına aykırı olabilir ve geçici bir işlem engeline yol açabilir. Araç, insansı kalmak için istekleri rastgele gecikmeler ve molalarla yayar, ama kullanım kendi sorumluluğundadır. Yine: tarayıcından hiçbir şey çıkmaz.',
    featuresTitle: 'Panel neler yapabiliyor',
    features: {
      scan: 'Yalnızca takip ettiklerini tarar ve Instagram’ın geri takip durumunu kullanır; büyük hesaplarda bile hızlı kalır.',
      manage: 'Ara ve onaylı / gizli / profil fotoğrafı olmayan filtrele; “tüm onaylıları / gizlileri / fotoğrafsızları seç” kısayollarıyla hızlıca seç.',
      unfollow: 'Hesapları seçip toplu takip bırak; canlı ilerleme çubuğu ve başarısız olanlar için tek tıkla tekrar deneme.',
      safety: 'Rastgele gecikme ve molalar insansı tutar; kısıtlamada sessizce başarısız olmak yerine otomatik geri çekilip duraklar.',
      settings: 'Her zamanlamayı (tarama/bırakma gecikmeleri, molalar) ayarlardan değiştir ya da muhafazakar varsayılanlara dön.',
      comfort: 'Paneli istediğin yere sürükle, her kenardan boyutlandır, küçült; temayı (açık/koyu/sistem) ve dili değiştir — seçimlerin hatırlanır.',
    },
    inspiredBy: 'Şu projelerin akışlarından ilham alındı',
  },

  twitter: {
    introBody:
      'X, takipçi listelerini okumanın ücretsiz bir yolunu sunmuyor, bu yüzden bu, veri arşivin üzerinden çalışır: ondan iki dosya yükle, biz de burada, tarayıcında karşılaştıralım.',
    introPrivacy: 'Hiçbir şey yüklenmez — dosyalar cihazından hiç çıkmaz.',
    step1_pre: 'X’te şuraya git:',
    step1_path: 'Ayarlar → Hesabın → Verilerinin bir arşivini indir',
    step1_post: ', şifreni onayla ve arşivi talep et.',
    step1_guide: 'Kılavuz',
    step2: 'Hazır olunca X sana e-posta gönderir (saatler sürebilir). İndir ve arşivden çıkar.',
    step3_pre: 'Şu klasörü aç:',
    step3_dataWord: 'data',
    step3_mid: 've şunları yükle:',
    step3_and: 've',
    step3_part: 'part',
    step3_post: 'dosyalarına bölünmüşse hepsini ekle).',
    step3_ifSplit: '(eğer',
    dropzone_pre: 'Şunları buraya sürükle:',
    dropzone_and: 've',
    dropzone_post: ', ya da',
    reading: 'Okunuyor…',
    chooseFiles: 'Dosya seç',
    bothFilesError:
      'Lütfen iki dosyayı da ekle: following.js ve follower.js (arşivindeki data/ klasöründen).',
    readError:
      'Bu dosyalar okunamadı. X arşivinden olduklarından emin ol.',
    ignoredFiles: 'İlgisiz {{count}} dosya yok sayıldı.',
    resultSummary_one: 'Takip ettiğin <0>{{count}} hesap</0> seni geri takip etmiyor.',
    resultSummary_other: 'Takip ettiğin <0>{{count}} hesap</0> seni geri takip etmiyor.',
    idLimitNote:
      'X arşivleri yalnızca sayısal hesap ID’leri içerir, bu yüzden kullanıcı adları gösterilemez. Her bağlantı gerçek profili X’te açar.',
    viewOnlyNote:
      'Bu yalnızca görüntüleme listesi — burada X’te takibi bırakma yok. Bırakmak için profili aç.',
    idLabel: 'ID {{id}}',
    openProfile: 'Profili aç',
    copyLinks: 'Bağlantıları kopyala',
    copied: 'Kopyalandı!',
    copiedToast: 'Profil bağlantıları panoya kopyalandı',
    copyFailed: 'Panoya kopyalanamadı',
    startOver: 'Baştan başla',
    zeroTitle: 'Herkes geri takip ediyor!',
    zeroBody: 'Arşivine göre, takip ettiğin herkes seni geri takip ediyor.',
  },
}
