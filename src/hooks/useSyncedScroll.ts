import { useRef, useEffect, useCallback, useState } from 'react'

/**
 * Creates a synced horizontal scrollbar at the top of a container.
 * Only visible when the content actually overflows horizontally.
 */
export function useSyncedScroll<T extends HTMLElement>() {
  const topRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<T>(null)
  const syncing = useRef(false)
  const [overflows, setOverflows] = useState(false)

  const syncScroll = useCallback((source: HTMLElement, target: HTMLElement) => {
    if (syncing.current) return
    syncing.current = true
    target.scrollLeft = source.scrollLeft
    requestAnimationFrame(() => {
      syncing.current = false
    })
  }, [])

  useEffect(() => {
    const top = topRef.current
    const content = contentRef.current
    if (!top || !content) return

    const onTopScroll = () => syncScroll(top, content)
    const onContentScroll = () => syncScroll(content, top)

    top.addEventListener('scroll', onTopScroll)
    content.addEventListener('scroll', onContentScroll)

    const resizeObserver = new ResizeObserver(() => {
      const inner = top.firstElementChild as HTMLElement
      if (inner) {
        inner.style.width = `${content.scrollWidth}px`
      }
      setOverflows(content.scrollWidth > content.clientWidth)
    })
    resizeObserver.observe(content)

    return () => {
      top.removeEventListener('scroll', onTopScroll)
      content.removeEventListener('scroll', onContentScroll)
      resizeObserver.disconnect()
    }
  }, [syncScroll])

  return { topRef, contentRef, overflows }
}
