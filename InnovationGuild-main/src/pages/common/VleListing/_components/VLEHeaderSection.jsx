const VLEHeaderSection = ({ title = "VLE Community" }) => {
  return (
    <div className="bg-button-dark pt-navbar pb-16 sm:pb-20 lg:pb-28">
      <div className="container">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl xl:text-9xl 2xl:text-10xl leading-none text-light mb-2 sm:mb-3">
            {title}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed text-light/80 max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-0">
            Connect with Village Level Entrepreneurs across India
          </p>
        </div>
      </div>
    </div>
  )
}

export default VLEHeaderSection