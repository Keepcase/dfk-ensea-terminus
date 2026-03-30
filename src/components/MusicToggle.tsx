import { useState } from 'react'
import {
  Music,
  Music2,
  Pause,
  Play,
  Repeat,
  ListMusic,
  X,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMusicPlayer, REGIONS, ALL_TRACKS } from '../hooks/useMusicPlayer'

function NowPlaying() {
  return <Music2 className="w-3.5 h-3.5 shrink-0 animate-pulse" />
}

/** Floating bottom player bar + jukebox modal */
export function MusicPlayer() {
  const {
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
  } = useMusicPlayer()
  const [modalOpen, setModalOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Collapsed: just a small floating button
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-6 left-6 z-40 w-10 h-10 rounded-full shadow-lg border border-border/40 bg-card/90 backdrop-blur-sm hover:bg-card hover:glow-gold flex items-center justify-center active:scale-95 transition-all duration-300"
        title="Show music player"
      >
        {playing ? <Music2 className="w-5 h-5 animate-pulse" /> : <Music className="w-5 h-5" />}
      </button>
    )
  }

  return (
    <>
      {/* Floating bottom bar */}
      <div
        data-music-bar
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/30 bg-background/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      >
        {/* Progress bar — clickable to seek */}
        <div
          className="h-1.5 bg-muted/50 cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            seek((e.clientX - rect.left) / rect.width)
          }}
          onMouseDown={(e) => {
            const bar = e.currentTarget
            const onMove = (ev: MouseEvent) => {
              const rect = bar.getBoundingClientRect()
              const frac = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
              seek(frac)
            }
            const onUp = () => {
              window.removeEventListener('mousemove', onMove)
              window.removeEventListener('mouseup', onUp)
            }
            window.addEventListener('mousemove', onMove)
            window.addEventListener('mouseup', onUp)
          }}
        >
          <div
            className="h-full transition-[width] duration-100"
            style={{
              width: `${(playing ? progress : 0) * 100}%`,
              backgroundColor: 'oklch(0.65 0.2 250)',
            }}
          />
        </div>
        <div className="max-w-screen-xl mx-auto flex items-center gap-2 sm:gap-3 px-4 py-2.5">
          {/* Transport controls */}
          <button
            onClick={skipPrev}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 active:scale-95 transition-all shrink-0"
            title="Previous track"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggle}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-foreground/70 hover:text-foreground hover:bg-secondary/50 active:scale-95 transition-all shrink-0"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={skipNext}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 active:scale-95 transition-all shrink-0"
            title="Next track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            {playing ? (
              <div className="overflow-hidden">
                <span className="inline-block text-xs font-medium whitespace-nowrap animate-marquee">
                  {ALL_TRACKS[trackIndex]?.fullName}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground/50">Music paused</span>
            )}
          </div>

          {/* Loop toggle */}
          <button
            onClick={toggleLoop}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all active:scale-95 shrink-0 ${
              looping
                ? 'bg-primary/15 text-primary border-primary/40'
                : 'text-muted-foreground/40 border-transparent hover:text-foreground hover:bg-secondary/50'
            }`}
            title={looping ? 'Loop: on (repeat track)' : 'Loop: off (play next)'}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setVolume(volume === 0 ? 0.3 : 0)}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground/50 hover:text-foreground transition-all"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 accent-foreground/60 cursor-pointer"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>

          {/* Open jukebox */}
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 active:scale-95 transition-all shrink-0"
            title="Open jukebox"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Collapse */}
          <button
            onClick={() => setCollapsed(true)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground/30 hover:text-foreground hover:bg-secondary/50 active:scale-95 transition-all shrink-0"
            title="Minimize player"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Spacer so content doesn't get hidden behind the bar */}
      <div className="h-14" />

      {/* Jukebox modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="max-w-none sm:max-w-2xl rounded-none sm:rounded-xl"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wide">Ensea Soundscapes</DialogTitle>
            <p className="text-xs text-muted-foreground/60">
              Original soundtrack by{' '}
              <a
                href="https://x.com/SamShandley"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-foreground transition-colors underline underline-offset-2"
              >
                Sam Shandley
              </a>
            </p>
          </DialogHeader>

          {/* Now Playing bar in modal */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-secondary/20 border border-border/15 mt-2">
            <button
              onClick={toggle}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-foreground/60 bg-foreground/10 text-foreground hover:bg-foreground/20 transition-all shrink-0"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/40">
                {playing ? (looping ? 'Looping' : 'Now Playing') : 'Select a track'}
              </div>
              <div className="text-sm font-medium truncate">{ALL_TRACKS[trackIndex]?.fullName}</div>
            </div>
            <button
              onClick={toggleLoop}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full border shrink-0 transition-all ${
                looping
                  ? 'bg-primary/15 text-primary border-primary/40'
                  : 'text-muted-foreground/40 border-transparent hover:text-foreground hover:bg-secondary/50'
              }`}
              title={looping ? 'Loop: on' : 'Loop: off'}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Track list */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-h-[70vh] overflow-y-auto -mx-1 px-1 pt-3">
            {REGIONS.map((region, regionIndex) => {
              const regionStartIndex = REGIONS.slice(0, regionIndex).reduce(
                (sum, r) => sum + r.tracks.length,
                0,
              )
              return (
                <div key={region.label}>
                  <h3 className="font-heading text-sm tracking-wide text-foreground/80 px-1 mb-2 pb-1.5 border-b border-border/20">
                    {region.label}
                  </h3>
                  <div className="space-y-0.5">
                    {region.tracks.map((track, i) => {
                      const idx = regionStartIndex + i
                      const isActive = idx === trackIndex && playing
                      return (
                        <button
                          key={track.url}
                          onClick={() => selectTrack(idx)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                            isActive
                              ? 'bg-foreground text-background font-medium'
                              : 'text-foreground/70 hover:bg-secondary/40 hover:text-foreground'
                          }`}
                        >
                          {isActive ? (
                            <NowPlaying />
                          ) : (
                            <span className="w-3.5 text-center text-[10px] text-foreground/30 font-mono">
                              {i + 1}
                            </span>
                          )}
                          {track.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
