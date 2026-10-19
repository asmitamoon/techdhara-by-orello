import { Link } from 'react-router'
import Farmers from '../../assets/images/Farmers.png'

const CTASection = ({
  title = "Become Part of the TechDhaara Community",
  description = "Join thousands of Village Level Entrepreneurs working together to solve rural challenges and bring innovative solutions to communities across India.",
  buttonText = "Join as VLE",
  buttonLink = "/how-it-works"
}) => {
  return (
    <div className="container mb-10 sm:mb-12 lg:mb-16">
      <div
        className="relative border-1 border-[#E5E7EB] rounded-2xl p-6 sm:p-8 lg:p-16 xl:p-20 text-center lg:text-left overflow-hidden"
        style={{
          backgroundImage: `url(${Farmers})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
        }}
      >
        {/* Left-side dark overlay */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(to right, #403F32 5%, #403F32cc 60%, #403F3299 75%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-5xl lg:text-7xl 2xl:text-7xl leading-tight text-light mb-3 sm:mb-4 max-w-2xl mx-auto lg:mx-0">
            {title}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg 2xl:text-xl leading-relaxed text-light/80 mb-5 sm:mb-6 max-w-3xl mx-auto lg:mx-0">
            {description}
          </p>
          <Link
            to={buttonLink}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-5 py-2.5 sm:px-6 sm:py-3 lg:px-8 bg-[#D4A055] text-white rounded-lg text-sm sm:text-base lg:text-lg 2xl:text-xl leading-none hover:bg-accent-brown/90 transition-all"
          >
            {buttonText}
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CTASection