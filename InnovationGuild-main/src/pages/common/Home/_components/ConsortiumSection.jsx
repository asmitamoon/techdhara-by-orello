import { useRef, useState } from 'react'
import PartnerCard from './PartnerCard'
import WhatChangeLooksLikeVideo from '../../../../assets/videos/WhatChangeLooksLike.mp4'
import RainmatterLogo from '../../../../assets/icons/RainmatterFoundationLogo.svg'
import WasanLogo from '../../../../assets/icons/WasanLogo.svg'
import ForwardArrow from '../../../../assets/icons/forwardArrow.svg'
import BgImageHome2 from '../../../../assets/images/BgImageHome2.png'

const ConsortiumSection = () => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      video.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  const partners = [
    {
      id: 1,
      badgeText: 'Foundation Partner',
      description: 'Rainmatter Foundation, founded in 2021, supports climate action, ecosystem restoration, and related livelihoods. The foundation is the parent organisation and primary funder of TechDhaara.',
      logo: RainmatterLogo,
      logoWrapperClassName: 'h-20 md:h-32 mb-6 md:mb-10 flex items-center'
    },
    {
      id: 2,
      badgeText: 'Implementation Partner',
      description: 'WASSAN is a public trust supporting sustainable livelihoods in rainfed regions. WASSAN India is the anchor organisation for the Village Level Entrepreneurship network of TechDhaara.',
      logo: WasanLogo,
      logoClassName: 'h-20 md:h-32 w-auto object-contain',
      logoWrapperClassName: 'h-20 md:h-32 mb-4 md:mb-10 flex items-center'
    }
  ]

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .consortium-bg {
            background: linear-gradient(to bottom, #FCF4E9 0%, #FCF4E9 35%, #EAE2D4 35%, #EAE2D4 100%);
          }
        }
        @media (min-width: 1600px) {
          .consortium-bg {
            background: linear-gradient(to bottom, #FCF4E9 0%, #FCF4E9 35%, #EAE2D4 35%, #EAE2D4 87%, #FCF4E9 87%, #FCF4E9 100%);
          }
        }
      `}</style>

      {/* Section 1 — With background image */}
      <section
        className="relative pt-16 md:pt-24 2xl:pt-36 pb-6 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${BgImageHome2})`,
        }}
      >
        <div className="container">
          {/* First Heading */}
          <h2 className="text-5xl md:text-8xl lg:text-9xl 2xl:text-10xl leading-tight md:leading-snug font-heading font-normal text-white mb-10 md:mb-20 text-center">
            How we are bringing this together on ground
          </h2>

          {/* Featured Video */}
          <div className="relative mb-16 md:mb-32">
            <video
              ref={videoRef}
              loop
              
              playsInline
              preload="auto"
              src={WhatChangeLooksLikeVideo}
              className="w-full lg:h-200 rounded-2xl"
            />

            {/* Play / Pause Button — centered over video */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 z-10 flex items-center justify-center w-full h-full cursor-pointer bg-transparent"
            >
              {isPlaying ? null : (
                <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent-green-dark">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7 md:w-9 md:h-9 ml-1">
                    <path d="M6 4l14 8-14 8V4z" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Section 2 — No background image, Our Consortium Partners */}
      <section className="py-16 md:py-24 2xl:py-36 bg-[#EAE2D4]">
        <div className="container">
          {/* Second Heading */}
          <h2 className="text-5xl md:text-8xl lg:text-9xl 2xl:text-10xl leading-tight md:leading-snug font-heading font-normal text-[#273228] mb-4 md:mb-6 text-center">
            Our Consortium Partners
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-3xl lg:text-4xl 2xl:text-[32px] leading-relaxed md:leading-[42px] font-heading font-normal text-[#273228] mb-12 md:mb-11 mx-auto text-center max-md:max-w-[900px]">
            TechDhaara is a collaborative initiative bringing together
            foundation support and grassroots expertise to bridge the gap between
            innovation and rural communities.
          </p>

          {/* Partner Cards and Learn More Link */}
          <div className="flex flex-col 2xl:flex-row items-center 2xl:items-end justify-between gap-12 2xl:gap-0">

            {/* Partner Cards Container */}
            <div className="flex flex-col md:flex-row md:items-stretch w-full lg:max-w-[70%] gap-6 md:gap-10">
              {partners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  badgeText={partner.badgeText}
                  description={partner.description}
                  logoSrc={partner.logo}
                  logoAlt={partner.badgeText}
                  logoClassName={partner.logoClassName}
                  logoWrapperClassName={partner.logoWrapperClassName}
                />
              ))}
            </div>

            {/* Learn More Link */}
            <div className="flex-shrink-0 inline-flex items-center gap-4 md:gap-9.5 self-center lg:self-center">
              <span className="text-3xl md:text-[34px] 2xl:text-5xl leading-tight md:leading-[40px] font-heading font-normal text-[#273228] text-center lg:text-left">
                Learn more about<br className="hidden md:block" /> the Consortium
              </span>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <img src={ForwardArrow} alt="forward arrow" className="w-10 md:w-16 h-auto" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ConsortiumSection