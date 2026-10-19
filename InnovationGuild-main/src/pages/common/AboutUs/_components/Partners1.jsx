import React from 'react';
import { useNavigate } from 'react-router'
import environment from '../../../../assets/images/environment.png';
import wasan from '../../../../assets/icons/wasan.svg'
import rain from '../../../../assets/icons/rain.svg'
const PartnersSection = () => {
  const navigate = useNavigate()
  return (
    <div className="w-full relative" style={{ backgroundImage: `url(${environment})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Partners Section */}
      <div className="pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-32 px-4 backdrop-blur-md bg-black/30 ">
        <div className="container mx-auto text-center ">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-3 sm:mb-4 ">
            Partners
          </h2>
          <p className="text-white text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Strategic partners providing foundational support and network access
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-[#F4D5CC] cursor-pointer text-gray-900 px-6 sm:px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Become a Partner
            </button>
            <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-accent-green-dark cursor-pointer text-white px-6 sm:px-8 py-3 rounded-md font-medium hover:bg-accent-gold transition-colors">
              Know more
            </button>
          </div>
        </div>
      </div>

      {/* Anchor Organizations Section */}
      <div className="px-4 pb-12 sm:pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-8 sm:mb-10 md:mb-12 mt-8 sm:mt-12 md:mt-16 text-center">
            Anchor Organizations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Rainmatter Card */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                 <img src={rain} alt="Rainmatter Logo" className="h-12 sm:h-14 md:h-16"/>

              </div>

              <h4 className="text-white text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                Rainmatter Foundation
              </h4>

              <p className="text-white text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                Founded in 2021, Rainmatter Foundation is a non-profit organisation that supports organisations and projects for climate action, a healthier environment, and livelihoods associated with them. They recognise that climate change is the biggest existential threat to life as we know it. They have committed to using the resources available to us to enable, and to attempt to replicate at scale, the potential solutions that may help address at least some of these threats, and aid in the restoration of our natural ecosystems.
              </p>

              <p className="text-white text-xs sm:text-sm leading-relaxed">
                <span className="font-semibold">
Rainmatter Foundation is the parent organization of TechDhaara and is the primary funder for the initiative. </span>
              </p>
            </div>

            {/* WASSAN India Card */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                 <img src={wasan} alt="WASSAN Logo" className="h-12 sm:h-14 md:h-16"/>
              </div>

              <h4 className="text-white text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                WASSAN India
              </h4>

              <p className="text-white text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                WASSAN is a public trust strengthening sustainable livelihoods in rainfed and marginalised regions through watershed development, ecological security, and inclusive prosperity. It works with civil society organisations and public systems to translate grassroots evidence into effective policy and practice. Its work spans watershed management, natural farming, seed systems, livestock, millets, integrated farming systems, gender integration, participatory machinery development, climate resilience, biodiversity, nutrition, markets, and renewable energy.
              </p>

              <p className="text-white text-xs sm:text-sm leading-relaxed">
                <span className="font-semibold">WASSAN India is the anchor organization for Village Level Entrepreneurship network of TechDhaara. </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersSection;