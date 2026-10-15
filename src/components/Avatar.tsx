import { useState } from 'react'

interface AvatarProps {
  src?: string
  name: string
  className?: string
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Framed headshot. If no src is given — or the image fails to load (e.g. the
 * file hasn't been added to public/images yet) — it falls back to initials
 * so the layout never shows a broken image.
 */
export function Avatar({ src, name, className }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed

  return (
    <div className={`avatar ${className ?? ''}`}>
      {showImage ? (
        <img
          className="avatar__img"
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="avatar__initials" aria-label={name}>
          {initials(name)}
        </span>
      )}
    </div>
  )
}
