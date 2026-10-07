import type React from "react"

export function IconButton({
  label,
  children,
  onClick,
  className = "",
}: {
  label: string
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`icon-button ${className}`}
    >
      {children}
    </button>
  )
}
