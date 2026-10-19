import React from 'react';
import { Linkedin } from 'lucide-react';
import asmita from '../../../../assets/images/asmita.png'
import mohan from '../../../../assets/images/mohan.png'
import santhosh from '../../../../assets/images/santhosh.png'
import harshita from '../../../../assets/images/harshita.png'
import vikas from '../../../../assets/images/vikas.png'
import tanmay from '../../../../assets/images/tanmay.png'
import ravindra from '../../../../assets/images/ravindra.png'
import linked from '../../../../assets/icons/linked.svg'
import ContactSection from '../../../../components/layout/ContactSection'

export default function TeamSection() {
  const coreTeam = [
    {
      name: "Asmita Moon",
      title: "Chief Executive Officer",
      image: asmita,
      bio: "Asmita heads TechDhaara covering the overall strategic and business development of the initiative. She has keen interest in technology inclusion for betterment of people and planet. Prior to this, Asmita has worked with grant programs providing business advisory to clean-tech startups. With trainings from London School of Economics and NITK Surathkal, Asmita is blending the worlds of technology and livelihoods.",
      linkedin: "https://www.linkedin.com/in/asmita-moon/"
    },
    {
      name: "Dr. Sai Mohan",
      title: "Program Coordinator",
      image: mohan,
      bio: "Sai is part of WASSAN India, facilitating innovation and entrepreneurship implementation of TechDhaara. He leads and coordinates all on ground operations of the initiative. He has done Ph.D. in Agricultural Engineering, specialised in Farm Machinery and Power Engineering with a passion for agricultural innovation, machine design, and project management. His academic career has been fueled by research-driven solutions to enhance agricultural mechanization, bridging the gap between traditional practices and modern technology.",
      linkedin: "https://www.linkedin.com/in/sai-mohan-samala-a42348120/"
    },
    {
      name: "Santosh Kure",
      title: "Program Officer",
      image: santhosh,
      bio: "Santosh is part of WASSAN India and his role focuses on bridging community-level challenges with appropriate technologies by systematically understanding grassroots problem statements and mapping them with suitable innovations. He actively supports the identification, validation, and deployment of context-specific technological solutions. He also engages with innovators through workshops, conferences, and field events, enabling knowledge exchange and collaboration. He holds an M.Tech in Agricultural Engineering, with specialization in Farm Machinery and Power Engineering.",
      linkedin: "https://www.linkedin.com/in/kure-santosh-24710522a/"
    },
    {
      name: "Harshita Tiyyagura",
      title: "Program Associate",
      image: harshita,
      bio: "Harshitha is part of WASSAN India and she supports ground-level operations by coordinating closely with Village Level Entrepreneurs (VLEs), managing follow-ups, and monitoring ongoing activities. Her responsibilities include collecting and documenting field-level problem statements, and supporting the implementation of project activities. She holds a Bachelor's degree in Agricultural Engineering and brings strong academic grounding along with enthusiasm to her role. As an early-career professional, she is keen to apply her knowledge to real-world contexts and contribute meaningfully to rural innovation and livelihood initiatives.",
      linkedin: "https://www.linkedin.com/in/tiyyaguraharshitha/"
    }
  ];

  const boardMembers = [
    {
      name: "Vikas Hosoor",
      title: "Board Member, TechDhaara",
      subtitle: "Rural Lead, Rainmatter Foundation\nCo-founder, Suryanilbhar AgriTech",
      image: vikas,
      bio: "Vikas works on soil, farming and localisation efforts of Rainmatter foundation. He has been working on natural farming for 4 years, and has tried a couple of initiatives in the farm to fork space. He also has a keen interest in making simple and affordable agri implements to reduce the drudgery of women farmers. Eco-friendly construction and waste recycling are his other areas of interest.",
      linkedin: "https://www.linkedin.com/in/vikas-hosoor-98928720/"
    },
    {
      name: "Tanmay Mukherji",
      title: "Board Member, TechDhaara",
      subtitle: "Strategy Lead - Entrepreneurship and Localised Production, Rainmatter Foundation\nFounder Director, Zeta Innovations Lab",
      image: tanmay,
      bio: "Tanmay leads the Strategy for Entrepreneurship and Localised Production at Rainmatter. He comes with an experience of close to 25 years of running his own industry in the Automotive sector catering to major OEMs in India and abroad. He exited his business in 2021 to work in the Grassroots. Volunteered for about a year in Ladakh with Sonam Wangchuk converting ideas into businesses. Post that he worked in Rural India with mainly women nano entrepreneurs helping them make the business sustainable and earn better. He mentors startups, runs a small innovation lab, is a TEDx speaker and loves to engage with students.",
      linkedin: "https://www.linkedin.com/in/tmukherji/"
    },
    {
      name: "Ravindra Adusumilli",
      title: "Board Member, TechDhaara",
      subtitle: "Director, WASSAN India",
      image: ravindra,
      bio: "Ravindra heads Watershed Support Services and Activities Network (WASSAN) and has been working on the issues of rainfed agriculture. He has conceptualized and led several projects at WASSAN on drought adaptation/mitigation, watershed management, rainfed agriculture, livelihoods development, adaptation to climate change, and also some of the large-scale government projects. He was a member of the Working Group of Natural Resource Management and Rainfed Farming for the 12th Five-year Plan and was a member of the drafting committees for the 11th and 12th Five Year plans. He has a major contribution in evolving the national Revitalising Rainfed Agriculture (RRA) Network.",
      linkedin: "https://www.linkedin.com/in/ravindra-adusumilli-124673188"
    }
  ];

  const TeamCard = ({ member, isBoard = false }) => (
    <div className={`${isBoard ? 'bg-[#F0E8DC]' : 'bg-[#FCF4E9]'} rounded-lg p-4 sm:p-6`}>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Image Section */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <img
            src={member.image}
            alt={member.name}
            className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 object-cover rounded"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              <h3 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-regular font-heading text-[#6D3C31] mb-1">
                {member.name}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-accent-green-dark mb-2">
                {member.title}
              </p>
              {member.subtitle && (
                <p className="text-xs sm:text-xs text-[#A3733E] font-semibold whitespace-pre-line mb-2 sm:mb-3">
                  {member.subtitle}
                </p>
              )}
              <p className="text-xs sm:text-sm text-black leading-relaxed">
                {member.bio}
              </p>
            </div>
            {member.linkedin && member.linkedin !== '#' && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-blue-600 self-start sm:self-auto"
                aria-label={`${member.name}'s LinkedIn profile`}
              >
                <img src={linked} alt="LinkedIn Icon" className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="bg-about-bg text-center px-4 pt-14 sm:pt-16 md:pt-18 xl:pt-24 pb-6 sm:pb-8 md:pb-10 lg:pb-14">
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-regular text-black mb-3 sm:mb-4 md:mb-6">
          Meet Our Team
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-black px-4">
          Meet the dedicated professionals driving TechDhaara's day-to-day operations
        </p>
      </div>

      {/* Core Team Section */}
      <section className="bg-[#F0E8DC]  py-8 sm:py-12">
        <div className="container mx-auto max-w-7xl">
          {/* Core Team Title */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-black">
              Core Team
            </h2>
          </div>

          {/* Core Team Grid */}
          <div className="space-y-3 sm:space-y-4">
            {coreTeam.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* Board Members Section */}
      <section className="bg-[#FCF4E9]  py-8 sm:py-12">
        <div className="container mx-auto max-w-7xl">
          {/* Board Members Title */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-black">
              Board Members
            </h2>
          </div>

          {/* Board Members Grid */}
          <div className="space-y-3 sm:space-y-4">
            {boardMembers.map((member) => (
              <TeamCard key={member.name} member={member} isBoard={true} />
            ))}
          </div>
        </div>
      </section>
      <ContactSection />
    </div>
  );
}