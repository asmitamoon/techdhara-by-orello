import { Link } from 'react-router'
import ForwardArrow from '../../assets/icons/forwardarrowWhite.svg'
import { useSimilarInnovations, useProblemMatches } from '../../hooks/queries/public'

const toSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const SuggestedMatchesSection = ({ title = "Suggested Matches", innovationId, problemId }) => {
  const { data: similarMatches = [] } = useSimilarInnovations(innovationId)
  const { data: problemMatchData = [] } = useProblemMatches(problemId)
  const matches = problemId ? problemMatchData : similarMatches

  if (!matches.length) return null

  return (
    <div className="w-full bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
      <h2 className="text-heading text-3xl sm:text-4xl lg:text-5xl xl:text-7xl leading-tight mb-5 sm:mb-6 lg:mb-8">
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 min-[72rem]:grid-cols-3 gap-5 sm:gap-6">
        {matches.map((match) => (
          <div key={match.id} className="flex flex-col">
            <div className="w-full h-44 sm:h-48 lg:h-62 rounded-xl overflow-hidden mb-3 sm:mb-4 bg-gray-200">
              {match.image ? (
                <img
                  src={match.image}
                  alt={match.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            <h3 className="text-heading text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-2.5 line-clamp-1" title={match.title}>
              {match.title}
            </h3>

            <p className="text-sm sm:text-base text-secondary mb-3 sm:mb-4 line-clamp-2" title={match.description}>
              {match.description}
            </p>

            <Link
              to={`/innovations/${match.id}/${toSlug(match.title)}`}
              className="w-full py-2.5 sm:py-3 bg-button-dark border border-accent-green text-light rounded-xl text-sm sm:text-base hover:bg-accent-gold transition-all cursor-pointer flex items-center justify-between px-4 sm:px-4 lg:px-5 mt-auto group"
            >
              <span>View Innovation</span>
              <img src={ForwardArrow} alt="Arrow" className="w-4 sm:w-4 lg:w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SuggestedMatchesSection
