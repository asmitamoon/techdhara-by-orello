import React from 'react';
import { useNavigate } from 'react-router'
import women from '../../../../assets/images/women.png';
import evid from '../../../../assets/icons/evid.svg'
import file from '../../../../assets/icons/file.svg'
import loca from '../../../../assets/icons/loca.svg'


export default function ResearchEvidence() {
  const navigate = useNavigate()
  return (
    <>
      <section
        className="relative py-24 w-full flex items-center"
        style={{
          backgroundImage: `url(${women})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#223714]/50"></div>

        {/* Content */}
        <div className="relative z-10 container w-full px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="max-w-2xl">
            {/* Icon */}
            <img src={evid}></img>

            {/* Heading */}
            <h2 className="text-about-bg text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-4 font-bold mb-4 sm:mb-6 leading-tight">
              Research Evidence
            </h2>

            {/* Description */}
            <p className="text-about-bg text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-xl">
              In a study of 600 rural technology interventions across India by IIT-Madras (2022),{' '}
              <span className="font-bold">
                only 38% had sustained usage after one year; most failed due to lack of community involvement in design.
              </span>
            </p>

            {/* CTA */}
            <button onClick={() => navigate('/register')} className="bg-about-bg cursor-pointer text-gray-800 px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg  transition-colors duration-300 shadow-lg">
              Join Our Ecosystem
            </button>
          </div>
        </div>
      </section>

      {/* New Image Section */}
      <section className="w-full">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Policy Findings */}
            <div className="bg-[#C6482A] p-8 sm:p-10 md:p-16 lg:p-24 xl:p-32 2xl:p-40">
             <img src={file}></img>
              <h3 className="text-about-bg text-2xl mt-4 sm:text-3xl md:text-4xl font-regular mb-4 sm:mb-6">
                Policy Findings
              </h3>
              <p className="text-about-bg text-base sm:text-lg md:text-xl leading-relaxed">
                Government evaluation of rural innovation funds (2021) found that <span className="font-bold">~35% of decentralized innovations scaled beyond the pilot stage.</span>
              </p>
            </div>

            {/* Field Reality */}
            <div className="bg-[#273228] p-8 sm:p-10 md:p-16 lg:p-24 xl:p-32 2xl:p-40">
             <img src={loca}></img>
              <h3 className="text-about-bg mt-4 text-2xl sm:text-3xl md:text-4xl font-regular mb-4 sm:mb-6">
                Field Reality
              </h3>
              <p className="text-white text-base sm:text-lg md:text-xl leading-relaxed mb-4">
                More than <span className="font-semibold">50% of solar pumps in Bihar and UP were found non-operational in 2021</span> due to poor after-sales support (Council on Energy, Environment and Water - CEEW).
              </p>
              <p className="text-white text-base sm:text-lg md:text-xl leading-relaxed">
                <span className="font-semibold">30-40% of rural tech installations fail within 2-3 years</span> due to lack of maintenance, training, or spare parts (NABARD, IRMA, 2020).
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}