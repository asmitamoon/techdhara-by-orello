import { useState } from 'react'

function getYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s/]+)/)
  return match?.[1] ?? null
}

function getEmbedUrl(url) {
  const ytId = getYouTubeId(url)
  if (ytId) return `https://www.youtube.com/embed/${ytId}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return null
}

const PlayIcon = () => (
  <svg className="w-8 h-8 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const InnovationImageGallery = ({ mediaItems = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const isPlaceholder = mediaItems.length === 0
  const selected = mediaItems[selectedIndex]

  const mainHeight = 'h-[200px] sm:h-[250px] lg:h-[400px] xl:h-[500px]'
  const thumbHeight = 'h-14 sm:h-16 lg:h-24 xl:h-35'

  const renderMain = () => {
    if (isPlaceholder) {
      return (
        <div className={`w-full ${mainHeight} bg-header rounded-lg flex items-center justify-center`}>
          <span className="text-muted text-sm sm:text-base">Main Image Placeholder</span>
        </div>
      )
    }
    if (selected.type === 'image') {
      return (
        <div className={`w-full ${mainHeight} rounded-lg bg-header overflow-hidden flex items-center justify-center`}>
          <img
            src={selected.url}
            alt="Innovation"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )
    }
    // Video
    const isProcessing = !selected.isExternal &&
      ['QUEUED', 'PROCESSING'].includes(selected.processingStatus)
    if (isProcessing) {
      return (
        <div className={`w-full ${mainHeight} bg-header rounded-lg flex flex-col items-center justify-center gap-2`}>
          <div className="w-8 h-8 rounded-full border-[3px] border-accent-green border-t-transparent animate-spin" />
          <span className="text-muted text-sm">Video processing...</span>
        </div>
      )
    }
    const embedUrl = selected.isExternal ? getEmbedUrl(selected.url) : null
    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          className={`w-full ${mainHeight} rounded-lg`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Innovation Video"
        />
      )
    }
    return (
      <div className={`w-full ${mainHeight} rounded-lg bg-header overflow-hidden flex items-center justify-center`}>
        <video
          key={selected.url}
          src={selected.url}
          controls
          className="max-w-full max-h-full object-contain"
        />
      </div>
    )
  }

  const renderThumbnail = (item, index) => {
    const isSelected = selectedIndex === index
    const wrapperClass = `rounded-lg overflow-hidden cursor-pointer transition-all ${
      isSelected ? 'ring-2 ring-accent-brown' : 'hover:opacity-80'
    }`
    if (item.type === 'image') {
      return (
        <div key={index} onClick={() => setSelectedIndex(index)} className={wrapperClass}>
          <img src={item.url} alt={`Thumbnail ${index + 1}`} className={`w-full ${thumbHeight} object-cover`} />
        </div>
      )
    }
    const ytId = item.isExternal ? getYouTubeId(item.url) : null
    const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null
    return (
      <div key={index} onClick={() => setSelectedIndex(index)} className={`${wrapperClass} relative`}>
        {ytThumb
          ? <img src={ytThumb} alt={`Video ${index + 1}`} className={`w-full ${thumbHeight} object-cover`} />
          : <video
              src={`${item.url}#t=0.1`}
              preload="metadata"
              muted
              className={`w-full ${thumbHeight} object-cover pointer-events-none`}
            />
        }
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <PlayIcon />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="w-full mb-3 sm:mb-4">
        {renderMain()}
      </div>
      <div className="grid grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        {isPlaceholder
          ? [0, 1, 2, 3, 4].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden">
                <div className={`w-full ${thumbHeight} bg-header flex items-center justify-center`}>
                  <span className="text-muted text-xs sm:text-sm">Img {i + 1}</span>
                </div>
              </div>
            ))
          : mediaItems.slice(0, 5).map((item, index) => renderThumbnail(item, index))
        }
      </div>
    </div>
  )
}

export default InnovationImageGallery
