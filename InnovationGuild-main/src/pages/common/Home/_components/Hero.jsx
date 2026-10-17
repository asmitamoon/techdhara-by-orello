import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../../../../store/slices/authSlice'
import RegistrationCard from './RegistrationCard'
import igherovideo from '../../../../assets/images/igherovideo.mp4'
import RoleIconTechDharak from '../../../../assets/icons/RoleIconTechDharak.svg'
import RoleIconTechSetu from '../../../../assets/icons/RoleIconTechSetu.svg'
import RoleIconTechNirmata from '../../../../assets/icons/RoleIconTechNirmata.svg'
import JustBrowsingForwardArrow from '../../../../assets/icons/JustBrowsingForwardArrow.svg'

const Hero = () => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src={igherovideo}
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 container pt-24 sm:pt-28 md:pt-32 lg:pt-40 xl:pt-46 pb-8 md:pb-10 text-center">

        <h1 className="text-4xl sm:text-7xl lg:text-9xl  2xl:text-[95px] leading-relaxed md:leading-snug lg:leading-normal  font-light text-light mb-2 sm:mb-3 lg:mb-4">
          Threading Technology Into
          <br />
           Livelihoods
        </h1>


        <h2 className="text-lg sm:text-3xl lg:text-4xl 2xl:text-7xl leading-tight font-semibold text-accent-gold mb-2 sm:mb-3 md:mb-4 lg:mb-6">
          One Connection at a Time.
        </h2>


        <p className="text-base sm:text-2xl lg:text-3xl leading-relaxed font-light text-white max-w-[280px] sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-[950px] mx-auto mb-6 sm:mb-8 md:mb-10 px-4 sm:px-0">
          Connecting innovators, implementation partners, Village Level Entrepreneurs and communities to accelerate technology adoption for rural livelihoods.
        </p>

        {!isLoggedIn && (
          <>
            {/* Registration Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6 max-w-sm md:max-w-xl lg:max-w-none mx-auto sm:px-0">
              <RegistrationCard
                title="Tech Dhaarak"
                subtitle="Community technology holders "
                buttonText="Register as an Enterprenuer"
                bgColor="bg-[#FFA731]/30"
                iconColor="bg-[#C1772E]"
                icon={RoleIconTechDharak}
                subtitleColor="#E4C656"
                onClick={() => navigate('/register?role=vle')}
              />

              <RegistrationCard
                title="Tech Setu"
                subtitle="The bridging organizations"
                buttonText="Register as an Organisation"
                bgColor="bg-[#9ED2A1]/45"
                iconColor="bg-[#9ED2A1]"
                icon={RoleIconTechSetu}
                subtitleColor="#9ED2A1"
                onClick={() => navigate('/register?type=org')}
              />

              <RegistrationCard
                title="Tech Nirmatas"
                subtitle="Technology builders and providers"
                buttonText="Register as a Tech Provider"
                bgColor="bg-[#EB6952]/34"
                iconColor="bg-[#FC7760]"
                icon={RoleIconTechNirmata}
                subtitleColor="#EFC6BA"
                onClick={() => navigate('/register?role=innovator')}
              />
            </div>

            <button
              onClick={() => navigate('/register?role=general_user')}
              className="w-full max-w-[400px] mx-auto flex justify-between items-center mt-6 md:mt-10 bg-[#D5E4C9]/50 text-sm lg:text-lg 2xl:text-xl border border-[#ffffff] leading-relaxed text-[#D5E4C9] font-medium py-3 px-6 rounded-xl cursor-pointer"
            >
              <span>Just Browsing</span>  <img src={JustBrowsingForwardArrow} alt="Forward Arrow" className="w-6 h-6 inline-block" />
            </button>
          </>
        )}

      </div>
    </section>
  )
}

export default Hero