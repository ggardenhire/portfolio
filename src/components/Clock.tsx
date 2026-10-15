import { useEffect, useState } from 'react'

/** Live taskbar clock, formatted the way Windows used to show it. */
export function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="taskbar__clock" title={now.toLocaleString()}>
      {time}
    </div>
  )
}
