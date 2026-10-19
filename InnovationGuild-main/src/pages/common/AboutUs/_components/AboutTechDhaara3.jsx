import React, { useRef, useState } from 'react';
import inspection from '../../../../assets/images/inspection.png'
import asmitamona from '../../../../assets/videos/WhatChangeLooksLike.mp4'
import rig1 from '../../../../assets/icons/rig1.svg'
import rig2 from '../../../../assets/icons/rig2.svg'
import rig3 from '../../../../assets/icons/rig3.svg'
import net1 from '../../../../assets/icons/net1.svg'
import net2 from '../../../../assets/icons/net2.svg'
import net3 from '../../../../assets/icons/net3.svg'
import net4 from '../../../../assets/icons/net4.svg'
import net5 from '../../../../assets/icons/net5.svg'
import net6 from '../../../../assets/icons/net6.svg'



// Component 1: The Solution Section
const TheSolution = () => {
  return (
    <section className=" py-16 sm:py-24">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-light mb-4 lg:mb-6">
            The Solution
          </h1>
          <p className="text-sm sm:text-[16px] lg:text-xl text-gray-700 max-w-3xl mx-auto">
            An ecosystem of enablers that helps communities clearly define their needs and strengthens the
            reach of relevant innovations on the ground.
          </p>
        </div>

        {/* How the Ecosystem Works */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-center mb-8 lg:mb-12">
            How the Ecosystem Works
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Image */}
          <div className="w-full">
            <img
              src={inspection}
              alt="Field workers examining crops"
              className="w-full h-64 sm:h-80 lg:h-[720px] object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Cards */}
          <div className="space-y-4 lg:space-y-6">
            {/* Nodal Organisation */}
           <div className="relative bg-[#F0E8DC] rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
  
  {/* Left accent border */}
  <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#A3733E] rounded-full"></div>

  <div className="flex items-start gap-4 ">
    <img src={rig1}></img>
    
    <div>
      <h3 className="text-lg sm:text-2xl font-medium mb-2 text-[#274E31]">
        Nodal Organisation
      </h3>
      
      <p className="text-sm sm:text-xl text-[#274E31] mb-2">
        TechDhaara partners with nodal organizations that lead rural livelihood initiatives across multiple regions.
      </p>
      
      <p className="text-xs sm:text-sm italic text-[#274E31]">
        Role: Strategy, regional coordination, partnerships, and governance
      </p>
    </div>
  </div>
</div>

         {/* Affiliated Organisation */}
<div className="relative bg-[#F0E8DC] rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
  
  {/* Left accent border */}
  <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#A3733E] rounded-full"></div>

  <div className="flex items-start gap-4 ">
     <img src={rig2}></img>
    
    <div>
      <h3 className="text-lg sm:text-2xl font-medium mb-2 text-[#274E31]">
        Affiliated Organisation
      </h3>
      
      <p className="text-sm sm:text-xl text-[#274E31] mb-2">
        Through nodal organizations, TechDhaara works with branches, ground partners, and affiliated organizations such as FPOs to identify real technology gaps and field challenges.
      </p>
      
      <p className="text-xs sm:text-sm italic text-[#274E31]">
        Role: Local validation, onboarding VLEs, problem identification, pilot coordination
      </p>
    </div>
  </div>
</div>


   {/* Village Level Entrepreneurs */}
  <div className="relative bg-[#F0E8DC] rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
  
  {/* Left accent border */}
  <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#A3733E] rounded-full"></div>

  <div className="flex items-start gap-4">
     <img src={rig3}></img>
    
    <div>
      <h3 className="text-lg sm:text-2xl font-medium mb-2 text-[#274E31]">
        Village Level Entrepreneurs
      </h3>
      
      <p className="text-sm sm:text-xl text-[#274E31] mb-2">
        TechDhaara partners with nodal organizations that lead rural livelihood initiatives across multiple regions.
      </p>
      
      <p className="text-xs sm:text-sm italic text-[#274E31]">
        Role: Deployment, servicing, bookkeeping, and community engagement
      </p>
    </div>
  </div>
</div>

          </div>
        </div>
      </div>
    </section>
  );
};

// Component 2: Video Section
const VideoSection = () => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      video.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  return (
    <section className="py-16 sm:py-24">
      <div className="container">
        {/* Video Container */}
        <div className="container">
          <div className="relative bg-[#F0E8DC] rounded-2xl overflow-hidden shadow-lg">
            {/* Video Thumbnail/Container */}
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                loop
               
                playsInline
                preload="auto"
                src={asmitamona}
                className="w-full h-full object-cover"
              />

              {/* Play / Pause Button — centered over video */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 z-10 flex items-center justify-center w-full h-full cursor-pointer bg-transparent"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {!isPlaying && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent-green-dark rounded-full flex items-center justify-center hover:bg-[#1a3321] transition-colors shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7 sm:w-9 sm:h-9 ml-1">
                      <path d="M6 4l14 8-14 8V4z" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Bottom Right Name Badge */}
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white/90 backdrop-blur-sm px-4 py-2 sm:px-6 sm:py-3 rounded-lg z-20">
                <p className="text-[#274E31] font-medium text-sm sm:text-base">Asmita Moon</p>
                <p className="text-[#274E31] text-xs sm:text-sm italic">CEO, TechDhaara</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Component 3: What We Enable Section
const WhatWeEnable = () => {
  return (
    <section className="py-4">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl  font-light mb-8">
            What We Enable
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1 */}
          <div className="bg-[#F0E8DC]  rounded-2xl px-6 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-14 h-16 sm:w-16 sm:h-18 bg-[#2D301C] rounded-xl mb-6 flex items-center justify-center">
              <img src={net1} className="p-2"></img>
            </div>
            <h3 className="text-lg sm:text-2xl font-light mb-3 sm:mb-4">
              Build a Network<br />of VLEs
            </h3>
            <p className="text-sm sm:text-base text-black leading-relaxed">
              Identify and onboard skilled local individuals through trusted ground partners to create a last-mile technology and service network.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#F0E8DC] rounded-2xl px-6 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-14 h-16 sm:w-16 sm:h-18 bg-[#2D301C] rounded-xl mb-6 flex items-center justify-center">
              <img src={net2} className="p-2"></img>
            </div>
            <h3 className="text-lg sm:text-2xl font-light mb-3 sm:mb-4 ">
              Bring Clarity to Problem<br />Statements
            </h3>
            <p className="text-sm sm:text-base text-black leading-relaxed">
              Work with VLEs and partners to diagnose real field challenges and clearly define solution needs rooted in community context.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#F0E8DC]  rounded-2xl px-6 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-14 h-16 sm:w-16 sm:h-18 bg-[#2D301C] rounded-xl mb-6 flex items-center justify-center">
              <img src={net3} className="p-2"></img>
            </div>
            <h3 className="text-lg sm:text-2xl font-light mb-3 sm:mb-4">
              Match Problems<br />to Technologies
            </h3>
            <p className="text-sm sm:text-base text-black leading-relaxed">
              Connect with solution providers who are open to customizing technology, training VLEs, and ensuring spare part availability.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#F0E8DC]  rounded-2xl px-6 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-14 h-16 sm:w-16 sm:h-18 bg-[#2D301C] rounded-xl mb-6 flex items-center justify-center">
              <img src={net4} className="p-2"></img>
            </div>
            <h3 className="text-lg sm:text-2xl font-light mb-3 sm:mb-4">
              Capture Business<br />Models
            </h3>
            <p className="text-sm sm:text-base text-black leading-relaxed">
              Help VLEs choose their path — sales, service, rental, or fabrication — to support technology adoption and enterprise building.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#F0E8DC]  rounded-2xl px-6 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-14 h-16 sm:w-16 sm:h-18 bg-[#2D301C] rounded-xl mb-6 flex items-center justify-center">
              <img src={net5} className="p-2"></img>
            </div>
            <h3 className="text-lg sm:text-2xl font-light mb-3 sm:mb-4">
              Capacity<br />Building
            </h3>
            <p className="text-sm sm:text-base text-black leading-relaxed">
              Link with training institutes to upskill VLEs in both basic and advanced technical and enterprise skills.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#F0E8DC]  rounded-2xl px-6 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-14 h-16 sm:w-16 sm:h-18 bg-[#2D301C] rounded-xl mb-6 flex items-center justify-center">
              <img src={net6} className="p-2"></img>
            </div>
            <h3 className="text-lg sm:text-2xl font-light mb-3 sm:mb-4">
              Support Desk<br />Services
            </h3>
            <p className="text-sm sm:text-base text-black leading-relaxed">
              Provide end-to-end support through partners, including financing access, vendor networks, events, and ecosystem connections.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};


const EcosystemSolution = () => {
  return (
    <div className="w-full bg-[#F5F1E8] min-h-screen">
      <TheSolution />
      <WhatWeEnable />
      <VideoSection />
    </div>
  );
};

export default EcosystemSolution;