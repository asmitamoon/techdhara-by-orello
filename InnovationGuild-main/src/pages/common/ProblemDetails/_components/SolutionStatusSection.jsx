import FiguringOutImage from '../../../../assets/icons/figuringOut.png'

const SolutionStatusSection = () => {
  return (
    <div className="mt-6 sm:mt-8 border-t border-b border-input-border py-8 sm:py-10 lg:py-12">
      <div className="w-full bg-white rounded-xl sm:rounded-2xl py-10 sm:py-12 lg:py-14 flex flex-col lg:flex-row justify-center items-center gap-8 sm:gap-12 lg:gap-20 px-5 sm:px-8">
        <div className="flex-shrink-0 flex items-center justify-center">
          <img src={FiguringOutImage} alt="Figuring out solutions" className="h-32 sm:h-36 lg:h-38 object-contain" />
        </div>
        <p className="text-heading max-w-full sm:max-w-[450px] text-sm sm:text-base lg:text-lg text-center lg:text-left font-medium">
          We are currently working on figuring out the best solutions for you
        </p>
      </div>
    </div>
  )
}

export default SolutionStatusSection