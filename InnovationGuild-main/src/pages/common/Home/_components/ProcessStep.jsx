import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ProcessStep = ({ number, title, description, alignment, image }) => {
  const stepRef = useRef(null)
  const imageRef = useRef(null)
  const numberRef = useRef(null)
  const titleDarkRef = useRef(null)
  const descDarkRef = useRef(null)

  useGSAP(() => {
    if (!imageRef.current || !numberRef.current || !titleDarkRef.current || !descDarkRef.current || !stepRef.current) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stepRef.current,
        start: 'top 85%',
        end: 'bottom 60%',
        scrub: 1
      }
    })

    tl.to([imageRef.current, numberRef.current, titleDarkRef.current, descDarkRef.current], {
      opacity: 1,
      ease: 'none'
    }, 0)
  })

  const IllustrationImage = () => (
    <img
      ref={imageRef}
      src={image}
      alt={`Step ${number}`}
      className="h-[200px] md:h-[260px] w-auto object-contain mb-6 md:mb-0"
      style={{ opacity: 0.26 }}
    />
  )

  const TextContent = () => (
    <div className={`flex-1 max-w-full md:max-w-[420px] text-left ${alignment === 'left' ? 'md:text-right' : 'md:text-left'}`}>
      <div
        ref={numberRef}
        className="text-6xl md:text-[55px] 2xl:text-[60px] leading-none font-heading font-medium text-accent-brown mb-2"
        style={{ opacity: 0.26 }}
      >
        {number}
      </div>

      <h3
        ref={titleDarkRef}
        className="text-2xl md:text-4xl 2xl:text-[32px] leading-snug font-semibold text-[#1E1E1E] mb-2"
        style={{ opacity: 0.26 }}
      >
        {title}
      </h3>

      <p
        ref={descDarkRef}
        className="text-base md:text-2xl 2xl:text-2xl leading-relaxed text-[#1E1E1E]"
        style={{ opacity: 0.26 }}
      >
        {description}
      </p>
    </div>
  )

  return (
    <div ref={stepRef} className="pl-16 md:pl-0 flex flex-col md:grid md:grid-cols-2 md:gap-50">
      {alignment === 'right' ? (
        <>
          <div className="flex justify-start md:justify-end items-center order-1">
            <IllustrationImage />
          </div>
          <div className="flex items-center order-2">
            <TextContent />
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-start md:justify-end items-center order-2 md:order-1">
            <TextContent />
          </div>
          <div className="flex items-center justify-start order-1 md:order-2">
            <IllustrationImage />
          </div>
        </>
      )}
    </div>
  )
}

export default ProcessStep