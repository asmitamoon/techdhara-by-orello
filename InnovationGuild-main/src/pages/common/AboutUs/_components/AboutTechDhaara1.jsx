import { useRef } from 'react'
import { useNavigate } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import oldman from  '../../../../assets/images/oldman.png'
import women from '../../../../assets/images/women.png'
import mission from '../../../../assets/icons/mission.svg'
import vission from '../../../../assets/icons/vission.svg'
import about1 from '../../../../assets/icons/about1.svg'
import about2 from '../../../../assets/icons/about2.svg'
import about3 from '../../../../assets/icons/about3.svg'
import about4 from '../../../../assets/icons/about4.svg'
import about5 from '../../../../assets/icons/about5.svg'


gsap.registerPlugin(ScrollTrigger)

const AboutContentSection = () => {
  const navigate = useNavigate()
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
    "Our work is rooted in the belief that rural progress",
    "happens when local entrepreneurs are empowered to",
    "identify problems, test solutions, and build viable,",
    "long-term enterprises around them."
  ]

  return (
    <>
      <section className="bg-about-bg py-24">
        <div className="container">
          {/* Top Section - Image and Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center mb-20 md:mb-32 lg:mb-35">
            {/* Left Side - Image */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={oldman}
                  alt="TechDhaara farmer working in field"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="order-1 lg:order-2 space-y-6 md:space-y-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl leading-tight font-normal text-[#0A3718]">
                Who we are
              </h2>

              <p className="text-base md:text-lg lg:text-xl 2xl:text-2xl leading-relaxed text-[#4A5565]">
                TechDhaara is a rural innovation and technology-matching platform designed to bridge the gap between real-world community challenges and practical, field-ready solutions.
              </p>

              <p className="text-base md:text-lg lg:text-xl 2xl:text-2xl leading-relaxed text-accent-brown font-medium">
                We work at the intersection of Village Level Entrepreneurs (VLEs), Affiliated Organisations (AOs), Nodal Organisations (NOs), and Innovators to ensure that technologies are not just introduced—but adopted, sustained, and scaled.
              </p>

              <button onClick={() => navigate('/register')} className="px-8 md:px-12 py-3 md:py-4 bg-accent-green-dark cursor-pointer text-white text-base md:text-lg lg:text-xl font-medium rounded-lg hover:bg-accent-gold transition-colors duration-300 shadow-lg">
                Register
              </button>
            </div>
          </div>

          {/* Bottom Section - Animated Text */}
          <div ref={headingRef} className="relative w-full mx-auto mb-20 md:mb-32">
            {textLines.map((line, index) => (
              <div key={index} className="relative">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl leading-tight font-normal text-center text-[#D7D7CD] px-4 sm:px-0">
                  {line}
                </h2>

                <h2
                  ref={(el) => (darkTextRefs.current[index] = el)}
                  className="absolute top-0 left-0 right-0 text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl leading-tight font-normal text-center text-[#123E39] px-4 sm:px-0"
                  style={{ clipPath: 'inset(0 100% 0 0)' }}
                >
                  {line}
                </h2>
              </div>
            ))}
          </div>

          {/* Mission/Vision/Problem Section */}
          <div className="space-y-26 ">
            {/* Mission and Vision Section */}
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
             {/* Mission Card */}
<div className="bg-[#F0E8DC] rounded-2xl px-8 pb-8 pt-8 text-center flex flex-col items-center">
  <div className="mb-4">
    <img src={mission} className="mx-auto" />
  </div>
  <h3 className="text-2xl font-semibold text-[#0A3718] mb-4">Mission</h3>
  <p className="text-[#0A3718] font-heading">
    To empower rural communities by connecting them with innovative solutions, fostering collaboration between grassroots organizations and technology innovators to create lasting, sustainable change.
  </p>
</div>
              {/* Vision Card */}
           <div className="bg-[#F0E8DC] rounded-2xl px-8 pb-8 pt-8 text-center flex flex-col items-center">
  <div className="mb-4">
    <img src={vission} className="mx-auto" />
  </div>
  <h3 className="text-2xl font-semibold text-[#0A3718] mb-4">Vision</h3>
  <p className="text-[#0A3718] font-heading">
    A thriving rural ecosystem where every challenge finds an innovative solution through collaborative partnerships, making technology accessible and impactful for communities that need it most.
  </p>
</div>
            </div>

            {/* The Problem Section */}
            <div>
              <h2 className="text-4xl md:text-6xl xl:text-8xl font-regular text-center text-[#0A3718] mb-3">
                The Problem
              </h2>
              <p className="text-center text-[20px] text-[#4A5565] mb-14">
                Lack of relevant solutions and repair ecosystem
              </p>

              {/* Problem Cards Grid */}
              <div className="grid md:grid-cols-2 font-heading lg:grid-cols-3 gap-6 ">
                {/* Awareness Gap */}
                <div className="bg-[#F0E8DC] rounded-2xl p-6">
                 <img src={about1}></img>
                  <h4 className="text-2xl font-regular text-[#292116] mt-4 mb-3">Awareness Gap</h4>
                  <p className="text-[#292116] text-xl  leading-relaxed">
                    Limited awareness of small livelihood owners to tools and technologies available
                  </p>
                </div>

                {/* Standardization Issue */}
                <div className="bg-[#F0E8DC]  rounded-2xl p-6">
                  <img src={about2}></img>
                  <h4 className="text-2xl font-regular text-[#292116] mt-4 mb-3">Standardization Issue</h4>
                  <p className="text-[#292116] text-xl leading-relaxed">
                    Standardized solutions available not compatible to local usage conditions
                  </p>
                </div>

                {/* Trust Barrier */}
                <div className="bg-[#F0E8DC] rounded-2xl p-6">
                  <img src={about3}></img>
                  <h4 className="text-2xl font-regular text-[#292116] mt-4 mb-3">Trust Barrier</h4>
                  <p className="text-[#292116] text-xl leading-relaxed">
                    Low trust in new technologies without proven reliable performance
                  </p>
                </div>

                {/* Service Breakdown */}
                <div className="bg-[#F0E8DC] rounded-2xl p-6">
                  <img src={about4}></img>
                  <h4 className="text-2xl font-regular text-[#292116] mt-4 mb-3">Service Breakdown</h4>
                  <p className="text-[#292116] text-xl leading-relaxed">
                    No access to standard operating procedures or reliable after-sales support
                  </p>
                </div>

                {/* Infrastructure Gap */}
                <div className="bg-[#F0E8DC] rounded-2xl p-6">
                  <img src={about5}></img>
                  <h4 className="text-2xl font-regular text-[#292116] mt-4 mb-3">Infrastructure Gap</h4>
                  <p className="text-[#292116] text-xl leading-relaxed">
                    Lack of local technicians and infrastructure for timely repairs and maintenance
                  </p>
                </div>

                {/* CTA Card */}
                <div className="bg-accent-green-dark rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-2xl font-regular text-white mb-3">Trust Barrier</h4>
                    <p className="text-white text-xl leading-relaxed mb-6">
                      Low trust in new technologies without proven reliable performance
                    </p>
                  </div>
                  <button onClick={() => navigate('/register')} className="w-full bg-about-bg cursor-pointer text-black font-regular py-3 px-6 rounded-lg hover:bg-[#F0E8DC] transition-colors duration-300">
                    Join Our Ecosystem
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default AboutContentSection