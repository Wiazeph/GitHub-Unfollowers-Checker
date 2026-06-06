import type { SVGProps } from 'react'

/** Shared shape for our brand glyphs (Lucide v1 dropped brand icons). */
export type BrandIcon = (props: SVGProps<SVGSVGElement>) => React.ReactElement

const base = (props: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24',
  width: '1em',
  height: '1em',
  'aria-hidden': true as const,
  ...props,
})

export const GithubIcon: BrandIcon = (props) => (
  <svg {...base(props)} fill="currentColor">
    <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.42.36.8 1.08.8 2.18v3.23c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
  </svg>
)

export const BlueskyIcon: BrandIcon = (props) => (
  <svg {...base(props)} fill="currentColor">
    <path d="M5.77 3.4c2.4 1.8 4.98 5.46 5.93 7.42.95-1.96 3.53-5.62 5.93-7.42 1.73-1.3 4.54-2.3 4.54.9 0 .64-.37 5.37-.58 6.14-.75 2.66-3.47 3.34-5.88 2.93 4.22.72 5.3 3.1 2.98 5.49-4.4 4.52-6.33-1.14-6.82-2.59-.09-.27-.13-.39-.17-.39s-.08.12-.17.39c-.49 1.45-2.42 7.11-6.82 2.59-2.32-2.39-1.25-4.77 2.98-5.49-2.41.41-5.13-.27-5.88-2.93C1.6 9.67 1.23 4.94 1.23 4.3c0-3.2 2.81-2.2 4.54-.9Z" />
  </svg>
)

export const InstagramIcon: BrandIcon = (props) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const TwitterIcon: BrandIcon = (props) => (
  <svg {...base(props)} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25h6.83l4.713 6.231 5.447-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
  </svg>
)
