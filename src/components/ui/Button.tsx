import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  children: ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles =
    'px-6 py-3 font-medium text-sm uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variantStyles =
    variant === 'primary'
      ? 'bg-white hover:bg-accent-hover text-black'
      : 'bg-bg-input hover:bg-opacity-80 text-text-primary'

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  )
}
