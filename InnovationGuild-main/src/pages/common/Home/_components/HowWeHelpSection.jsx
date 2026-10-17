import { useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProcessStep from './ProcessStep'
import HowwehelpImg1 from '../../../../assets/images/HowwehelpImg1.png'
import HowwehelpImg2 from '../../../../assets/images/HowwehelpImg2.png'
import HowwehelpImg3 from '../../../../assets/images/HowwehelpImg3.png'
import HowwehelpImg4 from '../../../../assets/images/HowwehelpImg4.png'
import HowwehelpImg5 from '../../../../assets/images/HowwehelpImg5.png'
import HowwehelpImg6 from '../../../../assets/images/HowwehelpImg6.png'
import HowwehelpImg7 from '../../../../assets/images/HowwehelpImg7.png'

gsap.registerPlugin(ScrollTrigger)

const HowWeHelpSection = () => {
  const lineRef = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    if (window.location.hash === '#how-it-works') {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [])

  // Animate the dotted line with progressive opacity reveal using mask
  useGSAP(() => {
    if (!lineRef.current || !sectionRef.current) return

    gsap.fromTo(lineRef.current,
      {
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.26) 0%)',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.26) 0%)',
      },
      {
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 100%, rgba(0,0,0,1) 100%)',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 100%, rgba(0,0,0,1) 100%)',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'bottom top',
          scrub: 1
        }
      }
    )
  })

  const steps = [
    { number: '01', title: 'Problem Identified', description: 'TechDhaaraks with TechSetu (Nodal organizations and their village level units like FPOs) identify various livelihood technology gaps', alignment: 'right', image: HowwehelpImg1 },
    { number: '02', title: ' Problem Submission', description: ' TechDhaaraks and TechSetus submit problem statements for which they are unable to find technology solutions.', alignment: 'left', image: HowwehelpImg2 },
    { number: '03', title: 'Solution mapping', description: 'TechDhaara platform recommends relevant innovations based on problem tags and context.', alignment: 'right', image: HowwehelpImg3 },
    { number: '04', title: 'Stakeholder Exchange', description: 'TechDhaarak, TechNirmatas and TechSetus discuss potential solutions to implement', alignment: 'left', image: HowwehelpImg4 },
    { number: '05', title: 'Field Pilot', description: 'The solutions are tried in the real community context ', alignment: 'right', image: HowwehelpImg5 },
    { number: '06', title: 'Developments through feedbacks', description: 'Affiliated Organizations (village level units like FPOs) captures trial results from TechDhaaraks and provide feedbacks to TechNirmatas', alignment: 'left', image: HowwehelpImg6 },
    { number: '07', title: 'Adoption and Scale', description: 'Effective solutions are commercialized by TechDhaaraks in their regions ensuring scalable adoption', alignment: 'right', image: HowwehelpImg7 }
  ]

  return (
    <section id="how-it-works" ref={sectionRef} className="bg-[#FCF4E9] py-16 md:py-26">
      {/* Embedded CSS for responsive dot sizing */}
      <style>{`
        .responsive-dots {
          /* Mobile: 2px radius (4px dot), 15px spacing */
          background-image: radial-gradient(circle, var(--color-accent-tan) 2px, transparent 2px);
          background-size: 4px 15px;
          background-repeat: repeat-y;
          background-position: center 0px;
        }
        @media (min-width: 768px) {
          .responsive-dots {
            /* Desktop: 5px radius (10px dot), 25px spacing */
            background-image: radial-gradient(circle, var(--color-accent-tan) 5px, transparent 5px);
            background-size: 10px 25px;
          }
        }
      `}</style>

      <div className="container relative">
        <div className="text-center mb-20 md:mb-32">
          <h2 className="text-5xl md:text-8xl lg:text-9xl 2xl:text-10xl leading-tight md:leading-snug font-normal text-[#0A3718] mb-4">
            How do we work on accelerating technology adoption 
          </h2>
          <p className="text-lg md:text-3xl 2xl:text-4xl leading-relaxed md:leading-normal text-[#4A5565] max-w-[1100px] mx-auto px-4">
            We connect innovators with on ground organizations to deliver need based technical solutions for rural livelihoods through Tech Dhaaraks.
          </p>
        </div>

        <div className="relative max-w-[1200px] mx-auto">

          {/* Vertical Dotted Line */}
          <div
            ref={lineRef}
            className="responsive-dots absolute left-6 md:left-1/2 top-0 bottom-0 w-[4px] md:w-[10px] -translate-x-1/2"
          ></div>

          {/* Steps Wrapper */}
          <div className="space-y-16 md:space-y-55">
            {steps.map((step) => (
              <ProcessStep
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
                alignment={step.alignment}
                image={step.image}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowWeHelpSection