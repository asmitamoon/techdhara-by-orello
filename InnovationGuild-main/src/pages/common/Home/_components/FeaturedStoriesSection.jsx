import { useState, useEffect } from 'react'
import StoryCard from './StoryCard'
import LeftArrow from '../../../../assets/icons/leftArrow.svg'
import featuredStories1 from '../../../../assets/images/featuredStories1.png'
import featuredStories2 from '../../../../assets/images/featuredStories2.png'
import featuredStories3 from '../../../../assets/images/featuredStories3.png'

const FeaturedStoriesSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)

  // Touch state for swipe detection
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const minSwipeDistance = 50 // Minimum pixel distance to count as a swipe

  // Track window resize to adjust carousel behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const stories = [
    { id: 1, title: 'Building Capacity for Last-Mile Innovation: ', image: featuredStories1, link: 'https://drive.google.com/file/d/1NFPUX6gZ1U62RdU7Jt4hgRaD43czSU8m/view' },
    { id: 2, title: 'Sustainable farm mechanisation', image: featuredStories2, link: 'https://drive.google.com/file/d/1xSBuaJnQTu1eIFgzxf5U0pdeyJsA5LVc/view' },
    { id: 3, title: 'Assessing and Reviving Agricultural Machinery at Mandal Level', image: featuredStories3, link: 'https://drive.google.com/file/d/1a4DCCG_9OHLS7JY22RwWszPI0aRdWS5T/view' },
    { id: 4, title: 'Building Capacity for Last-Mile Innovation: ', image: featuredStories1, link: 'https://drive.google.com/file/d/1NFPUX6gZ1U62RdU7Jt4hgRaD43czSU8m/view' },
    { id: 5, title: 'Sustainable farm mechanisation', image: featuredStories2, link: 'https://drive.google.com/file/d/1xSBuaJnQTu1eIFgzxf5U0pdeyJsA5LVc/view' },
    { id: 6, title: 'Assessing and Reviving Agricultural Machinery at Mandal Level', image: featuredStories3, link: 'https://drive.google.com/file/d/1a4DCCG_9OHLS7JY22RwWszPI0aRdWS5T/view' },
  ]

  // Configuration based on screen size
  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1024
  const isDesktop = windowWidth >= 1024

  // Cards visible per view
  const cardsPerView = isMobile ? 1 : isTablet ? 2 : 1

  // Maximum index for sliding
  const maxIndex = Math.max(0, stories.length - cardsPerView)

  // Handlers for Desktop Arrows & Swipe Logic
  const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1))
  const handleNext = () => setCurrentIndex((prev) => Math.min(maxIndex - (isDesktop ? 2 : 0), prev + 1))

  // Handler for Dots (Mobile/Tablet)
  const handleDotClick = (index) => {
    setCurrentIndex(index * cardsPerView)
  }

  // --- SWIPE HANDLERS ---
  const onTouchStart = (e) => {
    setTouchEnd(null) // Reset touch end
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNext()
    }
    if (isRightSwipe) {
      handlePrev()
    }
  }

  // Calculate sliding logic
  const getTransform = () => {
    if (isDesktop) {
      const cardWidth = 400
      const gap = 24
      const slideAmount = currentIndex * (cardWidth + gap)
      return `translateX(-${slideAmount}px)`
    } else {
      // Slide by (100 / cardsPerView)% per item index
      return `translateX(-${currentIndex * (100 / cardsPerView)}%)`
    }
  }

  return (
    <section className="bg-[#EAE2D4] py-16 md:py-26 overflow-hidden">
      <div className="container">
        {/* Layout: Vertical on Mobile/Tablet, Grid on Desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-16 items-start">

          {/* Section Title */}
          <div className="mb-2 lg:mb-0 text-center lg:text-left">
            <h2 className="text-7xl md:text-8xl lg:text-9xl 2xl:text-10xl leading-tight lg:leading-[71px] font-normal text-[#273228]">
              Featured
              <br className="hidden lg:block" />
              {" "}Stories
            </h2>
          </div>

          {/* Stories Container */}
          <div className="w-full space-y-8">
            {/* Overflow Container - attached Touch events here */}
            <div
              className="overflow-hidden w-full touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: getTransform(),
                  gap: isDesktop ? '24px' : '0px'
                }}
              >
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className={`
                      shrink-0 
                      ${isMobile ? 'w-full' : isTablet ? 'w-1/2' : 'w-[400px]'}
                      ${!isDesktop ? 'px-2' : ''} // Spacing for mobile/tablet
                    `}
                  >
                    <StoryCard
                      image={story.image}
                      title={story.title}
                      region={story.region}
                      link={story.link}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            {isDesktop ? (
              /* Desktop: Arrow Buttons */
              <div className="flex gap-4 justify-start">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`h-12 rounded-xl select-none flex items-center transition-all ${currentIndex === 0
                      ? 'w-12 bg-[#5C5853] cursor-not-allowed justify-center'
                      : 'w-27 bg-button-primary cursor-pointer hover:bg-button-primary-hover justify-start pl-3'
                    }`}
                >
                  <img
                    src={LeftArrow}
                    alt="previous"
                    className="w-5 h-5"
                    style={{ filter: currentIndex === 0 ? 'brightness(0) saturate(100%) invert(60%)' : 'brightness(0) invert(1)' }}
                  />
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex >= maxIndex - 2}
                  className={`h-12 rounded-xl select-none flex items-center transition-all ${currentIndex >= maxIndex - 2
                      ? 'w-12 bg-[#5C5853] cursor-not-allowed justify-center'
                      : 'w-27 bg-accent-green-dark cursor-pointer  justify-end pr-3'
                    }`}
                >
                  <img
                    src={LeftArrow}
                    alt="next"
                    className="w-5 h-5 rotate-180"
                    style={{ filter: currentIndex >= maxIndex - 2 ? 'brightness(0) saturate(100%) invert(60%)' : 'brightness(0) invert(1)' }}
                  />
                </button>
              </div>
            ) : (
              /* Mobile/Tablet: Pagination Dots */
              <div className="flex justify-center gap-3 mt-4">
                {Array.from({ length: Math.ceil(stories.length / cardsPerView) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDotClick(idx)}
                    className={`h-3 rounded-full transition-all duration-300 ${Math.floor(currentIndex / cardsPerView) === idx
                        ? 'w-8 bg-button-primary'
                        : 'w-3 bg-gray-300 hover:bg-gray-400'
                      }`}
                    aria-label={`Go to slide group ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedStoriesSection