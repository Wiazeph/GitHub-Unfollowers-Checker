/** English — the canonical source. Other locales mirror these exact keys. */
export const en = {
  header: {
    title: 'Unfollowers Checker',
    subtitle:
      "Find out who you follow that doesn't follow you back — across the platforms you use.",
  },

  selector: {
    label: 'Platform',
  },

  theme: {
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
    light: 'Light theme',
    dark: 'Dark theme',
  },

  language: {
    label: 'Language',
  },

  auth: {
    signIn: 'Sign in',
    signOut: 'Sign out',
  },

  search: {
    check: 'Check',
    checking: 'Checking…',
    handleAriaLabel: '{{platform}} handle',
    placeholderGithub: 'Enter a GitHub username',
    placeholderGithubAuthed: 'Look up another user…',
    placeholderBluesky: 'Enter a Bluesky handle (name.bsky.social)',
    placeholderBlueskyAuthed: 'Look up another handle…',
    invalidGithub: 'Please enter a valid GitHub username',
    invalidBluesky: 'Please enter a valid Bluesky handle (e.g. name.bsky.social)',
  },

  results: {
    ownSummary_one: "<0>{{count}} user</0> doesn't follow you back — select to remove.",
    ownSummary_other: "<0>{{count}} users</0> don't follow you back — select to remove.",
    otherSummary: '<0>@{{handle}}</0> is not followed back by <1>{{label}}</1>',
    countLabel_one: '{{count}} user',
    countLabel_other: '{{count}} users',
    onlyOwnAccount: 'You can only remove people from your own account.',
    backToMyList: 'Back to my list',
    readOnly:
      "Removing people on {{platform}} isn't available yet — this is a read-only view for now.",
    signInCta: "Sign in to remove the people who don't follow you back.",
    signInNote: 'Viewing works without signing in — you only sign in to unfollow.',
    privacyNote:
      'Read through the official API. Nothing is stored; tokens never reach your browser.',
    signInWith: 'Sign in with {{platform}}',
    signingIn: 'Redirecting…',
    blueskySignInCta:
      "Sign in with Bluesky to remove the people who don't follow you back.",
    blueskyHandlePlaceholder: 'your-handle.bsky.social',
    blueskyHandleAriaLabel: 'Your Bluesky handle',
    selectAll: 'Select all',
    selectedCount: '{{count}} selected',
    unfollowSelected: 'Unfollow selected',
    copyUsernames: 'Copy usernames',
    copied: 'Copied!',
    copiedToast: 'Usernames copied to clipboard',
    copyFailed: 'Could not copy to clipboard',
    openOn: 'Open {{handle}} on {{platform}}',
    avatarAlt: '{{handle}} avatar',
    onboarding:
      'You’re signed in. Select the cards you want, then use “Unfollow selected”. Unfollowing only affects your own account.',
    dismiss: 'Dismiss',
    confirmTitle: 'Unfollow users?',
    confirmBody_one:
      "You're about to unfollow {{count}} user. This tool can't re-follow them — you'd have to do that manually.",
    confirmBody_other:
      "You're about to unfollow {{count}} users. This tool can't re-follow them — you'd have to do that manually.",
    confirmLabel: 'Unfollow',
    idleTitle: 'Ready when you are',
    idleAuthed: 'Loading your list… or search for another user above.',
    idleGuest:
      "Enter a {{platform}} handle above to see who doesn't follow them back.",
    zeroTitle: 'Everyone follows back!',
    zeroBody: "There's no one here that isn't following back. Nice and tidy.",
    errorTitle: 'Something went wrong',
    errorBody:
      "We couldn't complete that check. Please try again.",
    largeAccountNote:
      'Very large accounts are compared up to a limit, so results may be partial.',
    reportIssue: 'Keeps happening? Report an issue',
    prevPage: 'Previous',
    nextPage: 'Next',
    pageOf: 'Page {{page}} of {{total}}',
    loading: {
      following: 'Fetching the following list…',
      followers: 'Gathering followers…',
      popular: 'This can take a moment for popular accounts…',
      comparing: 'Comparing who follows back…',
      almost: 'Almost there…',
    },
  },

  unfollow: {
    success_one: 'Unfollowed {{count}} user',
    success_other: 'Unfollowed {{count}} users',
    failed: 'Could not unfollow {{count}}',
  },

  confirm: {
    cancel: 'Cancel',
    unfollowing: 'Unfollowing…',
  },

  errors: {
    network: 'Network error. Check your connection and try again.',
    timeout:
      'This account is very large and timed out. Try again, or a smaller account.',
    generic: 'Something went wrong. Please try again.',
    unfollowGeneric: 'Could not unfollow. Please try again.',
    rateLimit:
      "You've hit the platform's rate limit. Wait a few minutes and try again.",
    notFound: 'Account not found. Check the handle and try again.',
  },

  footer: {
    viewSource: 'View source on GitHub',
    sponsor: 'Sponsor',
    privacy: 'Privacy',
    disclaimer:
      'Not affiliated with GitHub, Bluesky, X, or Instagram. Use on your own accounts, at your own discretion.',
  },

  privacy: {
    title: 'Privacy & disclaimer',
    close: 'Close',
    whatTitle: 'What this tool does',
    whatBody:
      "Unfollowers Checker helps you find accounts you follow that don't follow you back, across GitHub, Bluesky, X (Twitter), and Instagram. It's a free, personal utility and is not affiliated with, endorsed by, or connected to any of those platforms.",
    storeTitle: 'What we store',
    storeBody:
      "Nothing. We don't run a database and we don't keep your data. Follower and following lists are fetched, compared, and returned for that one request — never logged or saved.",
    howTitle: 'How each platform works',
    howGithubLabel: 'GitHub & Bluesky:',
    howGithubBody:
      "public follower data is read through their official APIs by our serverless functions, so platform credentials never reach your browser. If you sign in to unfollow, that happens over the platform's official OAuth and the session is used only to carry out the actions you choose — tokens aren't persisted.",
    howXLabel: 'X (Twitter):',
    howXBody:
      'runs entirely in your browser. The files from your data archive are read and compared locally and never uploaded anywhere.',
    howInstagramLabel: 'Instagram:',
    howInstagramBody:
      'runs entirely in your own browser session via a script you paste yourself. Nothing is sent to our servers.',
    riskTitle: 'Use at your own risk',
    riskBody:
      "Automated or bulk actions can run against a platform's terms of service and may lead to temporary limits or other account actions. The Instagram script in particular is an unofficial, third-party tool. You are responsible for how you use these features on your own accounts.",
    contactTitle: 'Contact',
    contactBody: 'Questions or reports:',
  },

  instagram: {
    introBody:
      "Instagram doesn't offer a public API for follower lists, so this one works differently: you copy a small script and paste it into your browser's console while on Instagram. It runs in your own session.",
    introPrivacy:
      "Nothing is sent to any server — the script talks only to Instagram, directly from your browser. We can't see your account or your data.",
    consoleLabel: 'Paste into the DevTools console',
    loading: 'Loading…',
    copied: 'Copied!',
    copyCode: 'Copy the code',
    loadingScript: 'Loading the script…',
    copiedToast: 'Code copied — now paste it into the console',
    copyFailed: 'Could not copy to clipboard',
    tip_intro:
      "A one-time script you paste yourself — it isn't installed and changes nothing until you run it.",
    step1: 'Copy the script using the button above.',
    step2_pre: 'Open',
    step2_post: "in this browser and make sure you're signed in.",
    step3_pre: 'Open the developer console, then click the',
    step3_consoleWord: 'Console',
    step3_tab: 'tab:',
    step3_winLabel: 'Windows / Linux:',
    step3_winOr: 'or',
    step3_macLabel: 'Mac:',
    step4_pre: 'Paste the script and press',
    step4_enter: 'Enter',
    step4_post:
      ". A panel appears in the corner — press Scan to see who doesn't follow you back, then select and unfollow.",
    troubleshoot:
      'No panel after pressing Enter? Make sure you’re logged in and on instagram.com, refresh the page, and paste the script again.',
    tip_pre:
      "Tip: browsers may warn before letting you paste into the console — that warning exists because pasting code you don't understand can be dangerous. This script only reads your following list and unfollows what you pick. You can read it any time at",
    bmTitle: 'Or use a bookmarklet',
    bmIntro:
      'Prefer one click? Drag this button to your bookmarks bar, then open Instagram and click it to run.',
    bmButton: 'Instagram Unfollower',
    bmDrag: 'Drag this to your bookmarks bar (don’t click it here).',
    bmRecommend:
      'Most reliable in Chrome and Edge. On Safari and Firefox the bookmarklet can be too long to save — if it doesn’t run, use “Copy the code” above instead.',
    riskTitle: 'Use at your own discretion',
    riskBody:
      "Bulk unfollowing can run against Instagram's automated-behavior policies and may trigger a temporary action block. The tool spaces requests out with randomized delays and cooldowns to stay human-like, but use is at your own risk. Again: nothing leaves your browser.",
  },

  twitter: {
    introBody:
      "X doesn't offer a free way to read follower lists, so this works from your data archive: upload two files from it and we'll compare them right here in your browser.",
    introPrivacy: 'Nothing is uploaded — the files never leave your device.',
    step1_pre: 'On X, go to',
    step1_path: 'Settings → Your account → Download an archive of your data',
    step1_post: ', confirm your password, and request the archive.',
    step1_guide: 'Guide',
    step2: "X emails you when it's ready (can take hours to a day). Download and unzip it.",
    step3_pre: 'Open the',
    step3_dataWord: 'data',
    step3_mid: 'folder and upload',
    step3_and: 'and',
    step3_part: 'part',
    step3_post: "files, add all of them).",
    step3_ifSplit: "(if they're split into",
    dropzone_pre: 'Drag',
    dropzone_and: 'and',
    dropzone_post: 'here, or',
    reading: 'Reading…',
    chooseFiles: 'Choose files',
    bothFilesError:
      'Please add both files: following.js and follower.js (from your archive’s data/ folder).',
    readError:
      'Could not read those files. Make sure they are from your X archive.',
    ignoredFiles: 'Ignored {{count}} unrelated file(s).',
    resultSummary_one: '<0>{{count}} account</0> you follow doesn’t follow you back.',
    resultSummary_other: '<0>{{count}} accounts</0> you follow don’t follow you back.',
    idLimitNote:
      "X archives only contain numeric account IDs, so handles can't be shown. Each link opens the real profile on X.",
    viewOnlyNote:
      'This is a view-only list — unfollowing on X isn’t available here. Open a profile to unfollow on X.',
    idLabel: 'ID {{id}}',
    openProfile: 'Open profile',
    copyLinks: 'Copy links',
    copied: 'Copied!',
    copiedToast: 'Profile links copied to clipboard',
    copyFailed: 'Could not copy to clipboard',
    startOver: 'Start over',
    zeroTitle: 'Everyone follows back!',
    zeroBody: 'Based on your archive, everyone you follow follows you back.',
  },
}

/** Same shape as `en`, but every leaf is a plain string so locales can differ. */
type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>
}
export type Translation = DeepString<typeof en>
