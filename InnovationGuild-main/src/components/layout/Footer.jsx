import { useState } from 'react'
import { Link } from 'react-router'
import FooterBg from '../../assets/images/footerBackgroundImage.png'
import FooterLogo from '../../assets/icons/FooterLogo.svg'
import FooterBg2 from '../../assets/images/FooterBg2.png'
import { useSubscribeNewsletter } from '../../hooks/mutations/public'
import orelloLogo from '../../assets/icons/orelloLogo.svg'


const Footer = () => {
  const [email, setEmail] = useState('')
  const mutation = useSubscribeNewsletter()

  const handleSubscribe = () => {
    mutation.mutate({ email }, { onSuccess: () => setEmail('') })
  }

  return (
   <footer
  className="relative text-white overflow-hidden bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: `url(${FooterBg2})`,
  }}
>
      <div className="absolute bottom-0 right-0 pointer-events-none opacity-50 lg:opacity-100">
        <img src={FooterBg} alt="" className="object-contain w-full lg:w-auto" />
      </div>

      <div className="relative z-10 container pt-12 sm:pt-16 lg:pt-30 pb-6 sm:pb-8">
        
        <div className="flex flex-col lg:grid lg:grid-cols-[auto_700px] lg:justify-between mb-10 sm:mb-12 lg:mb-20 gap-8 sm:gap-12 lg:gap-20">

          <div className="order-1 lg:order-none">
            <h3 className="text-accent-gold text-sm sm:text-base 2xl:text-lg leading-relaxed mb-1.5 sm:mb-2 lg:mb-3">
              Direct Contact:
            </h3>
            <p className="text-[#ECE8DF] text-base sm:text-lg lg:text-xl 2xl:text-2xl leading-relaxed mb-0.5 sm:mb-1">
              connect@techdhaara.com
            </p>
            <p className="text-[#ECE8DF] text-base sm:text-lg lg:text-xl 2xl:text-2xl leading-relaxed">
              +91-XXX-XXX-XXXX
            </p>
          </div>

          <div className='order-2 lg:order-none lg:row-span-2 w-full'>
            <h3 className="text-accent-gold text-xl sm:text-2xl lg:text-4xl 2xl:text-[50px] leading-snug font-light mb-4 sm:mb-5">
              Subscribe to our newsletter
            </h3>
            <div className="flex flex-col items-start space-y-3 sm:space-y-4 lg:space-y-6">
              <input
                type="email"
                placeholder="Type your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full max-w-[450px] lg:max-w-none px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-3 bg-[#6B6B5A] border-none rounded-xl text-base sm:text-lg lg:text-xl 2xl:text-2xl leading-relaxed text-white placeholder-[#A8A89A] focus:outline-none"
              />
              <button
                onClick={handleSubscribe}
                disabled={mutation.isPending}
                className="bg-[#FCF9F1] text-lg sm:text-xl lg:text-3xl 2xl:text-4xl leading-normal text-[#5C5C4D] px-5 py-1.5 sm:px-6 sm:py-2 lg:px-8 lg:py-1 rounded-xl hover:bg-[#E5E5CC] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>

          <div className="order-3 lg:order-none grid grid-cols-2 gap-x-4 sm:gap-x-6 lg:gap-x-12 gap-y-2 sm:gap-y-3">
            <Link to="/" className="text-white/66 font-light text-sm sm:text-base lg:text-xl 2xl:text-2xl leading-relaxed hover:text-white transition-colors">
              Home
            </Link>
            <Link
              to="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-white/66 font-light text-sm sm:text-base lg:text-xl 2xl:text-2xl leading-relaxed hover:text-white transition-colors"
            >
              Contact
            </Link>
            <Link to="/about-us" className="text-white/66 font-light text-sm sm:text-base lg:text-xl 2xl:text-2xl leading-relaxed hover:text-white transition-colors">
              About
            </Link>
            <Link to="/faqs" className="text-white/66 font-light text-sm sm:text-base lg:text-xl 2xl:text-2xl leading-relaxed hover:text-white transition-colors">
              FAQs
            </Link>
            <Link
              to="/#how-it-works"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-white/66 font-light text-sm sm:text-base lg:text-xl 2xl:text-2xl leading-relaxed hover:text-white transition-colors"
            >
              How it Works
            </Link>
            <Link to="/terms" className="text-white/66 font-light text-sm sm:text-base lg:text-xl 2xl:text-2xl leading-relaxed hover:text-white transition-colors">
              Terms and Conditions
            </Link>
<Link to="/privacy" className="text-white/66 font-light text-sm sm:text-base lg:text-xl 2xl:text-2xl leading-relaxed hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/innovations" className="text-white/66 font-light text-sm sm:text-base lg:text-xl 2xl:text-2xl leading-relaxed hover:text-white transition-colors">
              Innovations
            </Link>
            <Link to="/about-us#partners" className="text-white/66 font-light text-sm sm:text-base lg:text-xl 2xl:text-2xl leading-relaxed hover:text-white transition-colors">
              Partners
            </Link>
            <Link to="/about-us#whocanjoin" className="text-white/66 font-light text-sm sm:text-base lg:text-xl 2xl:text-2xl leading-relaxed hover:text-white transition-colors">
              Selection Criteria
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 sm:pt-8 mt-6 sm:mt-8 lg:border-none lg:pt-0 lg:mt-0">
        
        <img src={FooterLogo} ></img>
      
          <p className="text-[#D4AF37] mt-4 text-sm sm:text-base lg:text-xl 2xl:text-2xl leading-relaxed mb-1.5 sm:mb-2">
           Tech Dhaara | Rainmatter Foundation | WASSAN
          </p>

          <p className="text-[#D4AF37] text-xs sm:text-sm lg:text-lg 2xl:text-xl leading-relaxed opacity-80">
            © 2025 Tech Dhaara. All rights reserved.
          </p>

          <div className="flex items-center gap-2 mt-3 sm:mt-4">
            <span className="text-white/50 text-xs sm:text-sm lg:text-base leading-relaxed">
              This website is curated by
            </span>
            <a href="https://orello.io" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
              <img src={orelloLogo} alt="Orello" className="h-4 sm:h-5 lg:h-6 w-auto" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer