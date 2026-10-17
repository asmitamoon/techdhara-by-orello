import { Link } from 'react-router'

const PageHeader = ({
  variant = 'problems',
  title,
  isIndividual = false
}) => {
  const pageName = variant === 'problems' ? 'Problems' : 'Innovations'
  const pageLink = variant === 'problems' ? '/problems' : '/innovations'

  return (
    <section className="bg-accent-green-dark pt-navbar pb-6 sm:pb-8 lg:pb-12">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="text-sm lg:text-base text-[#fef2eb] mb-3 lg:mb-4">
          <Link to="/" className="hover:text-accent-brown">Home</Link>
          <span className="mx-1.5 sm:mx-2">›</span>
          {isIndividual ? (
            <>
              <Link to={pageLink} className="hover:text-accent-brown">{pageName}</Link>
              <span className="mx-1.5 sm:mx-2">›</span>
              <span>{title}</span>
            </>
          ) : (
            <span>{pageName}</span>
          )}
        </div>

        {/* Page Title */}
        <h1 className="text-3xl md:text-6xl lg:text-8xl 2xl:text-9xl leading-tight md:leading-snug text-[#fef2eb]">
          {title}
        </h1>
      </div>
    </section>
  )
}

export default PageHeader