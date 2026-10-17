import React, { useState, useEffect, useRef } from 'react';
import bangladesh from '../../../../assets/images/bangladesh.png';
import bangladesh2 from '../../../../assets/images/bangladesh2.png';
import bangladesh3 from '../../../../assets/images/bangladesh3.png';
import ContactSection from '../../../../components/layout/ContactSection'
import money from '../../../../assets/icons/money.svg'
import ball from '../../../../assets/icons/ball.svg'
import head from '../../../../assets/icons/head.svg'
import production from '../../../../assets/icons/production.svg'
import processing from '../../../../assets/icons/processing.svg'
import management from '../../../../assets/icons/management.svg'
import Ecosystem from '../../../../components/layout/Ecosystem'

const operationIcons = {
  Production: production,
  Processing: processing,
  Management: management,
};

export default function EcosystemRoles() {
  const [activeTab, setActiveTab] = useState('vles');
  const vlesRef = useRef(null);
  const innovatorsRef = useRef(null);
  const partnersRef = useRef(null);
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const isScrollingProgrammatically = useRef(false);

  const vlesContent = {
    title: "Village Level Entrepreneurs",
    description: "VLEs are the backbone of our ecosystem, working directly with communities to identify challenges, implement solutions, and drive grassroots impact. They serve as the crucial link between rural needs and innovative solutions.",
    image: bangladesh,
    sections: [
      {
        title: "Sales & Rental VLE's",
        criteria: [
          "Identify Local Technology Gaps",
          "Community engagement capacity",
          "Local language literacy",
          "Entrepreneurial mindset",
          "Basic tech awareness",
          "Smartphone & internet access",
          "Space for machines/inventory"
        ],
        responsibilities: [
          "Report technology gaps",
          "Build local business models",
          "Facilitate demos and trials",
          "Maintain documentation",
          "Provide pilot feedback",
          "Maintain bookkeeping records"
        ]
      },
      {
        title: "Servicing VLEs – Additional Eligibility",
        criteria: [
          "Machinery servicing capability",
          "Technical training or workshop access",
          "Willingness to learn and upskill"
        ],
        responsibilities: [
          "Identify servicing gaps",
          "Manage spare parts",
          "Perform maintenance and repairs",
          "Track machine usage",
          "Train farmers on safe operation"
        ]
      }
    ]
  };

  const innovatorsContent = {
    title: "Innovator",
    description: "Innovators develop and refine solutions addressing specific rural challenges. They work closely with communities and organizations to ensure their innovations are contextually appropriate, scalable, and sustainable.",
    subtitle: "Technologies across different livelihood sectors, in the operations of:",
    operations: ["Production", "Processing", "Management"],
    image: bangladesh2,
    criteria: [
      "Reduce drudgery in rural operations",
      "Improve operational efficiency",
      "Maintain environmental balance",
      "Open to local customization and feedback",
      "Provide demos and training support",
      "Supply spare parts and SOPs",
      "Support VLE network integration",
      "MVP or production-ready solutions",
      "Open to non-patented innovations"
    ]
  };

  const partnersContent = {
    title: "Partners",
    description: "Our partners anchor the ecosystem by connecting communities, markets, and institutions to enable sustainable scale and long-term regional impact.",
    image: bangladesh3,
    criteria: [
      "Identify Local Technology Gaps",
      "Identify Local Technology Gaps",
      "Livelihood development programs",
      "Community mobilization capacity",
      "Market access support systems",
      "Scaling-ready ecosystem support",
      "Scaling-ready ecosystem support",
      "Alignment with rural innovation goals"
    ]
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingProgrammatically.current) return;
      if (!sectionRef.current || !vlesRef.current || !innovatorsRef.current || !partnersRef.current) return;

      const sectionRect = sectionRef.current.getBoundingClientRect();
      if (sectionRect.bottom < 0 || sectionRect.top > window.innerHeight) return;

      const threshold = window.innerWidth >= 1024 ? 220 : window.innerWidth >= 768 ? 256 : 208;
      const partnersTop = partnersRef.current.getBoundingClientRect().top;
      const innovatorsTop = innovatorsRef.current.getBoundingClientRect().top;

      if (partnersTop <= threshold) {
        setActiveTab('partners');
      } else if (innovatorsTop <= threshold) {
        setActiveTab('innovators');
      } else {
        setActiveTab('vles');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (ref, tabName) => {
    setActiveTab(tabName);
    isScrollingProgrammatically.current = true;
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 1000);
  };

  return (
    <div className="bg-about-bg pt-14 sm:pt-16 md:pt-18 xl:pt-24">
      <div className="container">
        <div ref={sectionRef} className="flex flex-col lg:flex-row gap-4 lg:gap-8 lg:items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 lg:self-stretch sticky top-34.25 md:top-46.25 lg:top-auto z-10">
            <div
              ref={containerRef}
              className="bg-about-bg p-0 lg:sticky lg:top-52"
              style={{}}
            >
              <div className="flex flex-row lg:flex-col gap-4 lg:gap-0 overflow-x-auto lg:overflow-x-visible sticky">
                <button
                  onClick={() => scrollToSection(vlesRef, 'vles')}
                  className={`flex-shrink-0 text-left px-0 py-2 lg:py-4 mb-0 lg:mb-1 cursor-pointer transition-all whitespace-nowrap ${
                    activeTab === 'vles'
                      ? 'text-black font-normal text-xl lg:text-2xl'
                      : 'text-[#c9bcb0] font-light text-xl lg:text-2xl'
                  }`}
                >
                  VLEs
                </button>
                <div className={`hidden lg:block h-[2px] mb-6 ${activeTab === 'vles' ? 'bg-accent-green-dark' : 'bg-[#c9bcb0]'}`}></div>

                <button
                  onClick={() => scrollToSection(innovatorsRef, 'innovators')}
                  className={`flex-shrink-0 text-left px-0 py-2 lg:py-4 mb-0 lg:mb-1 cursor-pointer transition-all whitespace-nowrap ${
                    activeTab === 'innovators'
                      ? 'text-black font-normal text-xl lg:text-2xl'
                      : 'text-[#c9bcb0] font-light text-xl lg:text-2xl'
                  }`}
                >
                  Innovators
                </button>
                <div className={`hidden lg:block h-[2px] mb-6 ${activeTab === 'innovators' ? 'bg-accent-green-dark' : 'bg-[#c9bcb0]'}`}></div>

                <button
                  onClick={() => scrollToSection(partnersRef, 'partners')}
                  className={`flex-shrink-0 text-left px-0 py-2 lg:py-4 mb-0 lg:mb-1 cursor-pointer transition-all whitespace-nowrap ${
                    activeTab === 'partners'
                      ? 'text-black font-normal text-xl lg:text-2xl'
                      : 'text-[#c9bcb0] font-light text-xl lg:text-2xl'
                  }`}
                >
                  Partners
                </button>
                <div className={`hidden lg:block h-[2px] ${activeTab === 'partners' ? 'bg-accent-green-dark' : 'bg-[#c9bcb0]'}`}></div>
              </div>
              {/* Mobile indicator line */}
              <div className={`block lg:hidden h-[2px] mt-2 bg-[#8b6f47]`}></div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* VLEs Content */}
            <div ref={vlesRef} className="mb-12 scroll-mt-52 md:scroll-mt-64 lg:scroll-mt-52">
              <div className="relative rounded-none overflow-hidden h-[250px] sm:h-[300px] lg:h-[350px]">
                <img
                  src={vlesContent.image}
                  alt="Village Level Entrepreneurs"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#1C2010]/70"></div>
                <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-center">
                  <h1 className="text-white text-lg sm:text-xl lg:text-2xl font-heading font-normal mb-2">
                    {vlesContent.title}
                  </h1>
                  <p className="text-white text-xs sm:text-sm lg:text-lg leading-relaxed font-light">
                    {vlesContent.description}
                  </p>
                </div>
              </div>

              {vlesContent.sections.map((section, idx) => (
                <div key={idx} className="bg-[#F0E8DC] rounded-none p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                    <div className="w-10 h-8 sm:w-14 sm:h-12 bg-accent-green-dark rounded-md"><img src={idx === 0 ? money : head} className="p-2"></img></div>
                    <h2 className="text-accent-brown text-base sm:text-lg lg:text-2xl font-normal">
                      {section.title}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                    {/* Criteria */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="w-5 h-5 sm:w-7 sm:h-7 bg-[#123E39] rounded-sm"><img src={ball} className="p-1"></img></div>
                        <h3 className="text-[#123E39] font-semibold text-base sm:text-lg lg:text-xl">Criteria</h3>
                      </div>
                      <div className="space-y-0">
                        {section.criteria.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 sm:gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#8b6f47] rounded-sm flex-shrink-0 mt-1"></div>
                              {i < section.criteria.length - 1 && (
                                <div className="w-[1.5px] sm:w-[2px] flex-1 bg-[#8b6f47] my-1" style={{minHeight: '24px'}}></div>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm lg:text-xl text-black flex-1 leading-relaxed py-1">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Responsibilities */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="w-5 h-5 sm:w-7 sm:h-7 bg-[#123E39] rounded-sm"><img src={ball} className="p-1"></img></div>
                        <h3 className="text-[#123E39] font-semibold text-base sm:text-lg lg:text-xl">
                          Key Responsibilities
                        </h3>
                      </div>
                      <div className="space-y-0">
                        {section.responsibilities.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 sm:gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#8b6f47] rounded-sm flex-shrink-0 mt-1"></div>
                              {i < section.responsibilities.length - 1 && (
                                <div className="w-[1.5px] sm:w-[2px] flex-1 bg-[#8b6f47] my-1" style={{minHeight: '24px'}}></div>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm lg:text-xl text-black flex-1 leading-relaxed py-1">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Innovators Content */}
            <div ref={innovatorsRef} className="mb-12 scroll-mt-52 md:scroll-mt-64 lg:scroll-mt-52">
              <div className="relative rounded-none overflow-hidden h-[280px] sm:h-[320px] lg:h-[380px]">
                <img
                  src={innovatorsContent.image}
                  alt="Innovator"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#1C2010]/70">
                </div>
                <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-center">
                  <h1 className="text-white text-lg sm:text-xl lg:text-2xl font-heading font-normal mb-2">
                    {innovatorsContent.title}
                  </h1>
                  <p className="text-white text-xs sm:text-sm lg:text-lg leading-relaxed font-light mb-4 sm:mb-6">
                    {innovatorsContent.description}
                  </p>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-white font-semibold text-xs sm:text-sm lg:text-base">
                      {innovatorsContent.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6">
                      {innovatorsContent.operations.map((op, i) => (
                        <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                          <img src={operationIcons[op]} className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" alt={op} />
                          <span className="text-white font-normal text-xs sm:text-sm">{op}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#F0E8DC] rounded-none p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="w-5 h-5 sm:w-7 sm:h-7 bg-[#123E39] rounded-sm"><img src={ball} className="p-1"></img></div>
                      <h3 className="text-[#123E39] font-semibold text-base sm:text-lg lg:text-xl">Criteria</h3>
                    </div>
                    <div className="space-y-0">
                      {innovatorsContent.criteria.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 sm:gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#8b6f47] rounded-sm flex-shrink-0 mt-1"></div>
                            {i < innovatorsContent.criteria.length - 1 && (
                              <div className="w-[1.5px] sm:w-[2px] flex-1 bg-[#8b6f47] my-1" style={{minHeight: '24px'}}></div>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm lg:text-xl text-black flex-1 leading-relaxed py-1">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Partners Content */}
            <div ref={partnersRef} className="mb-12 scroll-mt-52 md:scroll-mt-64 lg:scroll-mt-52">
              <div className="relative rounded-none overflow-hidden h-[250px] sm:h-[300px] lg:h-[350px]">
                <img
                  src={partnersContent.image}
                  alt="Partners"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#1C2010]/70"></div>
                <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-center">
                  <h1 className="text-white text-lg sm:text-xl lg:text-2xl font-heading font-normal mb-2">
                    {partnersContent.title}
                  </h1>
                  <p className="text-white text-xs sm:text-sm lg:text-lg leading-relaxed font-light">
                    {partnersContent.description}
                  </p>
                </div>
              </div>

              <div className="bg-[#F0E8DC] rounded-none p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                     <div className="w-5 h-5 sm:w-7 sm:h-7 bg-[#123E39] rounded-sm"><img src={ball} className="p-1"></img></div>
                      <h3 className="text-[#123E39] font-semibold text-base sm:text-lg lg:text-xl">Criteria</h3>
                    </div>
                    <div className="space-y-0">
                      {partnersContent.criteria.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 sm:gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#8b6f47] rounded-sm flex-shrink-0 mt-1"></div>
                            {i < partnersContent.criteria.length - 1 && (
                              <div className="w-[1.5px] sm:w-[2px] flex-1 bg-[#8b6f47] my-1" style={{minHeight: '24px'}}></div>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm lg:text-xl text-black flex-1 leading-relaxed py-1">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

       <Ecosystem />
      </div>
      <ContactSection />
    </div>
  );
}