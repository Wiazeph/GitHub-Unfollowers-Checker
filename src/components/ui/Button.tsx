import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export const Button = ({ children, className = '', ...props }: ButtonProps) => {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 font-medium text-bg transition-colors outline-none hover:bg-brand-600 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
