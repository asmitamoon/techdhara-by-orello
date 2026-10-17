import React from "react";
import logo1 from '../../../../assets/icons/logo1.svg'
import logo2 from '../../../../assets/icons/logo2.svg'
import logo3 from '../../../../assets/icons/logo3.svg'
import logo4 from '../../../../assets/icons/logo4.svg'
import logo5 from '../../../../assets/icons/logo5.svg'
import logo6 from '../../../../assets/icons/logo6.svg'
import logo7 from '../../../../assets/icons/logo7.svg'
import Ecosystem from '../../../../components/layout/Ecosystem'

const nodalLogos = [
  { src: logo1, alt: "Logo 1" },
  { src: logo2, alt: "Gramya" },
  { src: logo3, alt: "WINS" },
  { src: logo4, alt: "Art of Living" },
  { src: logo5, alt: "Well Labs" },
  { src: logo6, alt: "Transform Rural India" },
  { src: logo7, alt: "Lipok Social Foundation" },
];

const ecosystemLogos = [
  { src: logo1, alt: "Dvara E-Registry" },
  { src: logo2, alt: "Gramya" },
  { src: logo3, alt: "WINS" },
  { src: logo4, alt: "Art of Living" },
  { src: logo5, alt: "Well Labs" },
  { src: logo6, alt: "Transform Rural India" },
  { src: logo7, alt: "Lipok Social Foundation" },
];

export default function PartnersSection() {
  return (
    <section className="w-full bg-about-bg">
      {/* Nodal Organisations */}
      <div className="py-12 px-4 sm:px-8">
        <h2 className="text-center text-black text-lg sm:text-xl font-medium mb-4">
          Nodal Organisations
        </h2>
        <div className="w-32 h-px bg-[#C8B89A] mx-auto mb-8"></div>

        <div className="max-w-6xl mx-auto space-y-16">
          {/* First row - 4 logos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center">
            {nodalLogos.slice(0, 4).map((logo, idx) => (
              <img
                key={idx}
                src={logo.src}
                alt={logo.alt}
                className="max-h-14 sm:max-h-16 md:max-h-18 object-contain"
              />
            ))}
          </div>
          
          {/* Second row - 3 logos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 items-center justify-items-center max-w-3xl mx-auto">
            {nodalLogos.slice(4, 7).map((logo, idx) => (
              <img
                key={idx}
                src={logo.src}
                alt={logo.alt}
                className="max-h-14 sm:max-h-16 md:max-h-18 object-contain"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Divider background strip */}
      <div className="bg-[#F0E8DC] py-12 px-4 sm:px-8">
        <h2 className="text-center text-black text-lg sm:text-xl font-medium mb-4">
          Ecosystem Partners
        </h2>
        <div className="w-32 h-px bg-[#C8B89A] mx-auto mb-8"></div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* First row - 4 logos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center">
            {ecosystemLogos.slice(0, 4).map((logo, idx) => (
              <img
                key={idx}
                src={logo.src}
                alt={logo.alt}
                className="max-h-14 sm:max-h-16 md:max-h-18 object-contain"
              />
            ))}
          </div>
          
          {/* Second row - 3 logos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 items-center justify-items-center max-w-3xl mx-auto">
            {ecosystemLogos.slice(4, 7).map((logo, idx) => (
              <img
                key={idx}
                src={logo.src}
                alt={logo.alt}
                className="max-h-14 sm:max-h-16 md:max-h-18 object-contain"
              />
            ))}
          </div>
        </div>
      </div>
   <Ecosystem />
    </section>
  );
}