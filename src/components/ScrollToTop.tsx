import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import { useMusicPlayer } from '../hooks/useMusicPlayer'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const { playing } = useMusicPlayer()

  // Music bar is visible when playing (not collapsed by user)
  // We check for a DOM element to know if the bar is showing
  const [barVisible, setBarVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Check if the music bar DOM element exists
  useEffect(() => {
    const check = () => {
      const bar = document.querySelector('[data-music-bar]')
      setBarVisible(!!bar)
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [playing])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed right-6 z-40 w-10 h-10 rounded-full shadow-lg border border-border/40 bg-card/90 backdrop-blur-sm hover:bg-card hover:glow-gold transition-all duration-300 flex items-center justify-center ${
        barVisible ? 'bottom-[4.5rem]' : 'bottom-6'
      }`}
      title="Back to top"
    >
      <ChevronUp className="w-4 h-4" />
    </button>
  )
}
