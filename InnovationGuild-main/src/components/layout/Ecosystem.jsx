import { Link } from 'react-router'
import land from '../../assets/images/land.png'

export default function EcosystemCTA() {
  return (
    <div
      className="mt-12 sm:mt-16 container rounded-2xl min-h-0 lg:min-h-100 overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative mx-4"
      style={{
        backgroundImage: `url(${land})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Gradient overlay - dark on left, transparent on right */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(to right, #2D301C 30%, #403F3299 70%, transparent 100%)',
        }}
      ></div>

      <div className="relative z-10 text-white w-full sm:max-w-xl p-5 sm:p-8 md:p-12">
        <h3 className="text-lg sm:text-2xl md:text-3xl font-regular mb-2 sm:mb-3 leading-snug">
          Join the Tech Dhaara <br className="hidden sm:block" /> Ecosystem
        </h3>
        <p className="text-xs sm:text-sm text-white leading-relaxed mb-4 sm:mb-6">
          Be part of a growing network connecting rural communities,
          field partners, and innovators to turn real-world problems
          into working, scalable solutions.
        </p>
        <Link
          to="/register"
          className="bg-[#F4D5CC] cursor-pointer text-black text-xs sm:text-sm px-8 sm:px-14 py-2.5 sm:py-3 rounded-md transition whitespace-nowrap inline-block"
        >
          Join Us
        </Link>
      </div>
    </div>
  );
}