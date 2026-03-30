import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'

const CLICK_URL = 'https://defi-kingdoms.b-cdn.net/game-audio/ui/click.mp3'

interface Track {
  name: string
  url: string
}

interface Region {
  label: string
  tracks: Track[]
}

export const REGIONS: Region[] = [
  {
    label: 'Serendale',
    tracks: [
      // Official Spotify order
      {
        name: 'Overworld Map',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/map-loop.ogg',
      },
      {
        name: 'Marketplace',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/marketplace-loop.ogg',
      },
      { name: 'Jeweler', url: 'https://dfk-hv.b-cdn.net/game-audio/serendale/jeweler-loop.ogg' },
      {
        name: 'Tavern',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/tavern-loop-v2.ogg',
      },
      {
        name: 'Alchemist',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/alchemist-loop.ogg',
      },
      {
        name: 'Castle',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/castle-loop.ogg',
      },
      { name: 'Gardens', url: 'https://dfk-hv.b-cdn.net/game-audio/serendale/garden-loop-v2.ogg' },
      {
        name: 'Meditation Circle',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/meditation-loop-fade.ogg',
      },
      {
        name: 'Portal',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/portal-loop.ogg',
      },
      {
        name: 'Professions',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/professions-loop.ogg',
      },
      // Extra tracks
      {
        name: 'Docks',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/docks-loop-v2.ogg',
      },
      {
        name: 'East Marketplace',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/hatchery-loop.ogg',
      },
      {
        name: 'Divine Altar',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/divine-essence-loop.ogg',
      },
      {
        name: 'Combat Zone',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/combat-zone-loop.ogg',
      },
      {
        name: 'Rocboc Hunt',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/rocboc-hunt-loop.ogg',
      },
      {
        name: 'Combat',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/serendale/combat-loop.ogg',
      },
    ],
  },
  {
    label: 'Crystalvale',
    tracks: [
      // Official Spotify order
      {
        name: 'Overworld Map',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/map-loop.ogg',
      },
      {
        name: 'Marketplace',
        url: 'https://dfk-hv.b-cdn.net/game-audio/crystalvale/marketplace-loop.ogg',
      },
      { name: 'Jeweler', url: 'https://dfk-hv.b-cdn.net/game-audio/crystalvale/jeweler-loop.ogg' },
      { name: 'Portal', url: 'https://dfk-hv.b-cdn.net/game-audio/crystalvale/portal-loop.ogg' },
      {
        name: 'The Cradle',
        url: 'https://dfk-hv.b-cdn.net/game-audio/crystalvale/cradle-loop.ogg',
      },
      { name: 'Gardens', url: 'https://dfk-hv.b-cdn.net/game-audio/crystalvale/gardens-loop.ogg' },
      {
        name: 'Meditation Circle',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/meditation-loop.ogg',
      },
      {
        name: 'Docks',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/docks-loop.ogg',
      },
      { name: 'Tavern', url: 'https://dfk-hv.b-cdn.net/game-audio/crystalvale/tavern-loop.ogg' },
      {
        name: 'Outpost',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/outpost/outpost-loop.ogg',
      },
      // Extra tracks
      { name: 'Castle', url: 'https://dfk-hv.b-cdn.net/game-audio/crystalvale/castle-loop.ogg' },
      {
        name: 'Alchemist',
        url: 'https://dfk-hv.b-cdn.net/game-audio/crystalvale/alchemist-loop.ogg',
      },
      {
        name: 'Divine Altar',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/divine-essence-loop.ogg',
      },
      {
        name: 'Professions',
        url: 'https://dfk-hv.b-cdn.net/game-audio/crystalvale/professions-loop.ogg',
      },
      {
        name: 'Combat Zone',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/combat-zone-loop.ogg',
      },
      {
        name: 'Dark Summoner',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/dark-summoner-loop.ogg',
      },
      {
        name: 'Boar',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/boar-loop.ogg',
      },
      {
        name: 'Combat',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/combat-loop.ogg',
      },
    ],
  },
  {
    label: 'Sundered Isles',
    tracks: [
      {
        name: 'Overworld Map',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/sunderedisles/overworld-loop.ogg',
      },
      {
        name: 'Docks',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/sunderedisles/docks-loop.ogg',
      },
      {
        name: 'Registry',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/sunderedisles/registry-loop.ogg',
      },
      {
        name: 'Commerce District',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/sunderedisles/commerce-loop.ogg',
      },
      {
        name: "Mariner's District",
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/sunderedisles/mariner-loop.ogg',
      },
      {
        name: 'Military District',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/sunderedisles/military-loop.ogg',
      },
      {
        name: 'The Bloody Tusk',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/sunderedisles/ship-loop.ogg',
      },
      {
        name: 'Night Raid',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/sunderedisles/alleyway-patrols-loop-sun-v2.ogg',
      },
      {
        name: 'Dark Water',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/sunderedisles/mariner-patrols-loop-sun.ogg',
      },
      {
        name: 'Blood Moon Rising',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/sunderedisles/military-patrols-loop-sun.ogg',
      },
      {
        name: 'Colosseum',
        url: 'https://defi-kingdoms.b-cdn.net/game-audio/sunderedisles/colosseum-loop.ogg',
      },
    ],
  },
]

export const ALL_TRACKS = REGIONS.flatMap((r) =>
  r.tracks.map((t) => ({ ...t, region: r.label, fullName: `${r.label} - ${t.name}` })),
)

interface MusicPlayerState {
  playing: boolean
  trackIndex: number
  looping: boolean
  progress: number // 0 to 1
  volume: number // 0 to 1
  toggle: () => void
  selectTrack: (index: number) => void
  skipNext: () => void
  skipPrev: () => void
  seek: (fraction: number) => void
  toggleLoop: () => void
  setVolume: (v: number) => void
  playClick: () => void
}

const MusicContext = createContext<MusicPlayerState | null>(null)

function loadSavedState(): {
  trackIndex: number
  playing: boolean
  looping: boolean
  volume: number
} {
  try {
    const saved = localStorage.getItem('jukebox')
    if (saved) return { looping: false, volume: 0.3, ...JSON.parse(saved) }
  } catch {
    /* ignore corrupt localStorage */
  }
  return { trackIndex: 0, playing: false, looping: false, volume: 0.3 }
}

function saveState(trackIndex: number, playing: boolean, looping: boolean, volume: number) {
  try {
    localStorage.setItem('jukebox', JSON.stringify({ trackIndex, playing, looping, volume }))
  } catch {
    /* ignore localStorage errors */
  }
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const saved = loadSavedState()
  const [playing, setPlaying] = useState(saved.playing)
  const [trackIndex, setTrackIndex] = useState(saved.trackIndex)
  const [looping, setLooping] = useState(saved.looping)
  const [progress, setProgress] = useState(0)
  const [volume, setVolumeState] = useState(saved.volume)
  const volumeRef = useRef(saved.volume)
  const musicRef = useRef<HTMLAudioElement | null>(null)
  const clickRef = useRef<HTMLAudioElement | null>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const trackIndexRef = useRef(saved.trackIndex)
  const loopingRef = useRef(saved.looping)

  // Keep refs in sync with state
  useEffect(() => {
    trackIndexRef.current = trackIndex
  }, [trackIndex])
  useEffect(() => {
    loopingRef.current = looping
  }, [looping])

  const startProgressTracking = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current)
    progressInterval.current = setInterval(() => {
      const m = musicRef.current
      if (m && m.duration && isFinite(m.duration)) {
        setProgress(m.currentTime / m.duration)
      }
    }, 250)
  }, [])

  const stopProgressTracking = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
      progressInterval.current = null
    }
  }, [])

  const playNext = useCallback(() => {
    if (loopingRef.current) {
      // Loop: replay same track
      if (musicRef.current) {
        musicRef.current.currentTime = 0
        musicRef.current.play().catch(() => {})
      }
      return
    }

    // Auto-advance to next track
    const next = (trackIndexRef.current + 1) % ALL_TRACKS.length
    trackIndexRef.current = next
    setTrackIndex(next)

    if (musicRef.current) {
      musicRef.current.pause()
      musicRef.current.src = ''
    }
    const track = ALL_TRACKS[next]
    if (!track) return
    const music = new Audio(track.url)
    music.volume = volumeRef.current
    music.onended = () => playNext()
    musicRef.current = music
    setProgress(0)
    music.play().catch(() => {})
    saveState(next, true, loopingRef.current, volumeRef.current)
  }, [])

  const loadTrack = useCallback(
    (index: number) => {
      if (musicRef.current) {
        musicRef.current.pause()
        musicRef.current.src = ''
      }
      const track = ALL_TRACKS[index]
      if (!track) throw new Error(`Invalid track index: ${index}`)
      const music = new Audio(track.url)
      music.volume = volumeRef.current
      music.onended = () => playNext()
      musicRef.current = music
      return music
    },
    [playNext],
  )

  useEffect(() => {
    const music = loadTrack(saved.trackIndex)
    clickRef.current = new Audio(CLICK_URL)
    clickRef.current.volume = 0.5

    if (saved.playing) {
      music
        .play()
        .then(() => {
          startProgressTracking()
        })
        .catch(() => {
          // Browser blocked auto-play — reset state to paused
          setPlaying(false)
          saveState(saved.trackIndex, false, saved.looping, volumeRef.current)
        })
    }

    return () => {
      musicRef.current?.pause()
      if (musicRef.current) musicRef.current.src = ''
      stopProgressTracking()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(() => {
    clickRef.current?.play().catch(() => {})
    const next = !playing
    if (next) {
      musicRef.current?.play().catch(() => {})
      startProgressTracking()
    } else {
      musicRef.current?.pause()
      stopProgressTracking()
    }
    setPlaying(next)
    saveState(trackIndex, next, looping, volumeRef.current)
  }, [playing, trackIndex, looping, startProgressTracking, stopProgressTracking])

  const selectTrack = useCallback(
    (index: number) => {
      clickRef.current?.play().catch(() => {})
      setTrackIndex(index)
      setProgress(0)
      const music = loadTrack(index)
      setPlaying(true)
      music.play().catch(() => {})
      startProgressTracking()
      saveState(index, true, loopingRef.current, volumeRef.current)
    },
    [loadTrack, startProgressTracking],
  )

  const skipNext = useCallback(() => {
    const next = (trackIndexRef.current + 1) % ALL_TRACKS.length
    selectTrack(next)
  }, [selectTrack])

  const skipPrev = useCallback(() => {
    // If more than 3 seconds in, restart current track. Otherwise go to previous.
    if (musicRef.current && musicRef.current.currentTime > 3) {
      musicRef.current.currentTime = 0
      setProgress(0)
      return
    }
    const prev = (trackIndexRef.current - 1 + ALL_TRACKS.length) % ALL_TRACKS.length
    selectTrack(prev)
  }, [selectTrack])

  const seek = useCallback((fraction: number) => {
    const m = musicRef.current
    if (m && m.duration && isFinite(m.duration)) {
      m.currentTime = fraction * m.duration
      setProgress(fraction)
    }
  }, [])

  const toggleLoop = useCallback(() => {
    clickRef.current?.play().catch(() => {})
    const next = !looping
    setLooping(next)
    loopingRef.current = next
    saveState(trackIndexRef.current, playing, next, volumeRef.current)
  }, [looping, playing])

  const setVolume = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(1, v))
      volumeRef.current = clamped
      setVolumeState(clamped)
      if (musicRef.current) musicRef.current.volume = clamped
      saveState(trackIndexRef.current, playing, loopingRef.current, clamped)
    },
    [playing],
  )

  const playClick = useCallback(() => {
    clickRef.current?.play().catch(() => {})
  }, [])

  return (
    <MusicContext
      value={{
        playing,
        trackIndex,
        looping,
        progress,
        volume,
        toggle,
        selectTrack,
        skipNext,
        skipPrev,
        seek,
        toggleLoop,
        setVolume,
        playClick,
      }}
    >
      {children}
    </MusicContext>
  )
}

export function useMusicPlayer(): MusicPlayerState {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusicPlayer must be used within MusicProvider')
  return ctx
}
