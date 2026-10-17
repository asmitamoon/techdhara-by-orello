import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StatisticCard from './StatisticCard'
import ChallengeBox from './ChallengeBox'
import StatesticSection1 from '../../../../assets/icons/StatesticSection1.svg'
import StatesticSection2 from '../../../../assets/icons/StatesticSection2.svg'
import BgImageHome from '../../../../assets/images/BgImageHome.png'

gsap.registerPlugin(ScrollTrigger)

const StatisticsSection = () => {
  const headingRef = useRef(null)
  const darkTextRefs = useRef([])

  useGSAP(() => {
    if (darkTextRefs.current.length === 0) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: headingRef.current,
        start: 'top 80%',
        end: 'bottom 60%',
        scrub: 1
      }
    })

    darkTextRefs.current.forEach((line, index) => {
      tl.to(line, {
        clipPath: 'inset(0 0% 0 0)',
        ease: 'none'
      }, index === 0 ? 0 : '>')
    })
  }, { scope: headingRef })

  const textLines = [
    "The adoption of technologies in rural livelihoods grapples",
    "with issues beyond accessibility and financing. Innovation",
    " Guild has looked into place based adoption issues",
    "which highlighted contextual design and ecosystem gaps"
  ]

  return (
    <section className="bg-[#FCF4E9] pt-16 md:pt-20 lg:pt-26">
      <div className="container">
        
        <div ref={headingRef} className="relative w-full mb-25 md:mb-36 lg:mb-[153px] mx-auto">
          {textLines.map((line, index) => (
            <div key={index} className="relative">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl 2xl:text-[50px] leading-[1.25] font-semibold text-center text-[#A8A8A8] px-4 sm:px-0">
                {line}
              </h2>

              <h2
                ref={(el) => (darkTextRefs.current[index] = el)}
                className="absolute top-0 left-0 right-0 text-3xl sm:text-4xl md:text-5xl lg:text-7xl 2xl:text-[50px] leading-[1.24] font-semibold text-center text-primary px-4 sm:px-0"
                style={{ clipPath: 'inset(0 100% 0 0)' }}
              >
                {line}
              </h2>
            </div>
          ))}
        </div>

        <div className="flex flex-row justify-center  items-center gap-6 md:gap-16 lg:gap-32 mb-20 md:mb-30">
          <ChallengeBox 
            icon={StatesticSection1} 
            label="One-size-fits-all solutions" 
          />
          <ChallengeBox 
            icon={StatesticSection2} 
            label="Weak local repair and service systems" 
          />
        </div>
      </div>
     <div
  className="py-14 md:py-20 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: `url(${BgImageHome})`,
  }}
>
        <div className="flex flex-col md:flex-row gap-10 md:gap-6 lg:gap-0 justify-between items-center md:items-start text-center md:text-left container">
          <StatisticCard
            percentage="30-40%"
            description="Rural tech fails within 2-3 years"
          />
          <StatisticCard
            percentage="38%"
            description="Technologies see sustained use after one year"
          />
          <StatisticCard
            percentage="20-25%"
            description="Innovations are only able to scale beyond pilots"
          />
        </div>
        </div>
      
    </section>
  )
}

export default StatisticsSection