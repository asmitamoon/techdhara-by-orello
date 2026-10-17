const PageLoader = ({ className = 'py-20' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="w-10 h-10 rounded-full border-[3px] border-accent-green border-t-transparent animate-spin" />
  </div>
)

export default PageLoader
