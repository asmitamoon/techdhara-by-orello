import { useRef, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import Gallery1 from '../../../../assets/images/gallery1.png'
import Gallery3 from '../../../../assets/images/gallery3.png'
import Gallery4 from '../../../../assets/images/gallery4.png'
import Gallery5 from '../../../../assets/images/gallery5.png'
import Ecosystem from '../../../../components/layout/Ecosystem'
import { selectIsLoggedIn } from '../../../../store/slices/authSlice'

const AutoScrollGallery = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const images = [Gallery1, Gallery3, Gallery4, Gallery5]
  const containerRef = useRef(null)
  const timelineRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  // Wait for images to load before starting animation
  useEffect(() => {
    const imageElements = containerRef.current?.querySelectorAll('img')
    if (!imageElements?.length) return

    let loadedCount = 0
    const totalImages = imageElements.length

    const handleImageLoad = () => {
      loadedCount++
      if (loadedCount === totalImages) {
        // Small delay to ensure layout is stable
        setTimeout(() => setIsReady(true), 100)
      }
    }

    imageElements.forEach((img) => {
      if (img.complete) {
        handleImageLoad()
      } else {
        img.addEventListener('load', handleImageLoad)
      }
    })

    return () => {
      imageElements.forEach((img) => {
        img.removeEventListener('load', handleImageLoad)
      })
    }
  }, [])

  useGSAP(() => {
    if (!isReady) return

    const parts = gsap.utils.toArray('.marquee-part')
    if (!parts.length || !parts[0].offsetWidth) return

    const createAnimation = () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }

      // Get actual rendered width
      const partWidth = parts[0].getBoundingClientRect().width
      
      const durationInSeconds = 40 

      timelineRef.current = gsap.to(parts, {
        x: -partWidth,
        repeat: -1,
        duration: durationInSeconds,
        ease: "none",
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % partWidth) 
        }
      })
    }

    createAnimation()

    const container = containerRef.current
    const onEnter = () => timelineRef.current?.pause()
    const onLeave = () => timelineRef.current?.play()

    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)

    let resizeTimer
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        createAnimation()
      }, 300)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, { scope: containerRef, dependencies: [isReady] })

  return (
    <section className="py-16 md:py-26 overflow-hidden bg-[#EAE2D4]">
    <div className="mx-2">
      <div 
        ref={containerRef} 
        className="flex gap-3 md:gap-4 w-fit"
        style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.3s' }}
      >
        <MarqueePart images={images} />
        <MarqueePart images={images} />
      </div>
       {!isLoggedIn && <Ecosystem />}
       </div>
    </section>
  )
}

const MarqueePart = ({ images }) => (
  <div className="marquee-part flex shrink-0 gap-3 md:gap-4 items-center">
    {images.map((img, idx) => (
      <div key={idx} className="flex-shrink-0">
        <img
          src={img}
          alt={`Gallery ${idx + 1}`}
          className="h-[200px] sm:h-[300px] lg:h-[437px] w-auto object-cover rounded-lg"
          loading="eager"
        />
      </div>
     
    ))}
  </div>
)

export default AutoScrollGallery