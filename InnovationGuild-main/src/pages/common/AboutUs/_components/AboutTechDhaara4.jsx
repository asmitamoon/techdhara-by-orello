import React from "react";
import { useNavigate } from 'react-router'
import dhaara from '../../../../assets/images/dhaara.png'
import avatar1 from '../../../../assets/icons/avatar1.svg'
import avatar2 from '../../../../assets/icons/avatar2.svg'
import avatar3 from '../../../../assets/icons/avatar3.svg'
import Ecosystem from '../../../../components/layout/Ecosystem'

export default function AboutTechDhaara4() {
  const navigate = useNavigate()
  return (
    <>
      {/* ===== EXISTING SECTION (UNCHANGED) ===== */}
      <section
        className="relative w-full min-h-[420px] sm:min-h-[500px] md:min-h-[560px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url(${dhaara})`, 
        }}
      >
        <div className="absolute inset-0 bg-[#360606]/50"></div>

        <div className="relative z-10 max-w-4xl px-6 text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-regular mb-4">
            Selection Criteria as a Pathway
          </h2>

          <p className="text-lg sm:text-xl font-bold mb-3">
            Strong ecosystems start with the right people.
          </p>

          <p className="text-sm sm:text-base md:text-lg text-white leading-relaxed mb-8">
            Our platform uses a structured selection process to onboard VLEs,
            innovators, and partners who are aligned with long-term impact,
            community trust, and sustainable deployment.
          </p>

          <button onClick={() => window.dispatchEvent(new CustomEvent('navigateToWhocanjoin'))} className="inline-flex items-center justify-center gap-2 bg-about-bg cursor-pointer text-black font-medium px-6 py-3 rounded-md hover:bg-[#efe2d9] transition">
            View Selection Criteria →
          </button>
        </div>
      </section>

      {/* ===== NEW SECTION : VOICES FROM THE FIELD ===== */}
      <section className="bg-about-bg py-14 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Intro Card */}
            <div className="bg-[#F0E8DC] rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[280px] sm:min-h-[320px]">
              <div>
                <h3 className="text-3xl sm:text-4xl md:text-5xl text-[#6D3C31] font-regular mb-3 leading-tight">
                  Voices From <br /> The Field
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Many of our members have started their early careers with us.
                </p>
              </div>

              <button onClick={() => navigate('/register')} className="mt-6 w-fit bg-accent-green-dark text-white text-sm cursor-pointer px-5 py-2 rounded-md hover:bg-accent-gold transition">
                Join our Ecosystem
              </button>
            </div>

            {/* Testimonial Cards */}
            {[
              {
                name: "Full Name",
                role: "VLE, Maharashtra",
                text: "Tech Dhaara helped us move from trial to real business. The platform didn't stop at connecting us with a machine.",
                avatar: avatar1
              },
              {
                name: "Full Name",
                role: "AO, Telangana",
                text: "For the first time, we can see what's working across villages and respond faster to our field teams.",
                avatar: avatar2
              },
              {
                name: "Full Name",
                role: "Innovator Company Name, Location",
                text: "For the first time, we can see what's working across villages and respond faster to our field teams.",
                avatar: avatar3
              },
              {
                name: "Full Name",
                role: "Partner Organisation Name",
                text: "The visibility into pilots, results, and outcomes makes collaboration across partners far more effective.",
                avatar: avatar1
              },
              {
                name: "Full Name",
                role: "Persona and Role",
                text: "The quality of the design is top-notch, and I love how organized the files are. It's easy to find what I need.",
                avatar: avatar2
              }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col min-h-[280px] sm:min-h-[320px]"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-300 overflow-hidden">
                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                <h4 className="text-sm sm:text-base font-semibold text-center">
                  {item.name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 text-center mb-4">
                  {item.role}
                </p>

                <div className="w-full h-px bg-gray-200 mb-4"></div>

                <p className="text-sm sm:text-base text-gray-700 text-center leading-relaxed flex-grow">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

         
          <Ecosystem />

        </div>
      </section>
    </>
  );
}