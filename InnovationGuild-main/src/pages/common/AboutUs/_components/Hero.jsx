import React from 'react'
import { useNavigate } from 'react-router'
import abouthero from '../../../../assets/images/abouthero.jpeg'
const HeroSection = () => {
  const navigate = useNavigate()
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${abouthero})` }}>
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-[#0D1408]/50"></div>
      
      {/* Content Container */}
      <div className="container relative z-10 px-4 py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-7xl lg:text-9xl  2xl:text-[95px] leading-tight md:leading-snug font-light text-white mb-6 md:mb-8">
            Where Rural Challenges Meet
            <br />
            Real Solutions
          </h1>
          
          {/* Description */}
          <p className="text-base font-light md:text-xl lg:text-2xl font-heading 2xl:text-3xl leading-relaxed md:leading-normal text-white/95 max-w-[1200px] mx-auto mb-10 md:mb-14">
            TechDhaara is a collaborative platform that brings together communities, innovators, and organizations to transform grassroots challenges into technology-driven solutions. By bridging field realities with innovation, it builds an ecosystem that enables sustainable technology adoption in rural India.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            <button onClick={() => window.dispatchEvent(new CustomEvent('navigateToTeam'))} className="w-full sm:w-auto px-8 md:px-12 py-3 md:py-4 cursor-pointer bg-button-bg text-black text-base md:text-lg lg:text-xl font-medium rounded-lg hover:bg-white transition-colors duration-300 shadow-lg">
              Our team
            </button>
            <button onClick={() => navigate('/#how-it-works')} className="w-full sm:w-auto px-8 md:px-12 py-3 md:py-4 cursor-pointer bg-accent-green-dark text-white text-base md:text-lg lg:text-xl font-medium rounded-lg hover:bg-accent-gold transition-colors duration-300 shadow-lg">
              How it works
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection