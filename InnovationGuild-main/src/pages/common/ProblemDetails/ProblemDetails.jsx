import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import PageHeader from '../../../components/ui/PageHeader'
import ProblemDetailsSection from './_components/ProblemDetailsSection'
import ContactSection from '../../../components/layout/ContactSection'
import PageLoader from '../../../components/ui/PageLoader'
import { useProblemById } from '../../../hooks/queries/public'
import { useGetSavedProblems } from '../../../hooks/queries/common'
import { useGetFacingSimilarProblems } from '../../../hooks/queries/vle'
import { selectUserRole, selectUser } from '../../../store/slices/authSlice'

const toSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const ProblemDetails = () => {
  const { id, slug } = useParams()
  const navigate = useNavigate()
  const userRole = useSelector(selectUserRole)
  const user = useSelector(selectUser)
  const isVle = userRole === 'vle' && user?.status === 'APPROVED'
  const { data: problem, isLoading } = useProblemById(id)
  const { isLoading: savedLoading } = useGetSavedProblems()
  const { isLoading: facingSimilarLoading } = useGetFacingSimilarProblems(undefined, { enabled: isVle })

  useEffect(() => {
    if (problem?.problemTitle) {
      const correctSlug = toSlug(problem.problemTitle)
      if (slug !== correctSlug) {
        navigate(`/problems/${id}/${correctSlug}`, { replace: true })
      }
    }
  }, [problem, id, slug, navigate])

  if (isLoading || savedLoading || facingSimilarLoading) {
    return (
      <div className="min-h-screen bg-light">
        <PageHeader variant="problems" title="Problem Description" isIndividual={true} />
        <PageLoader />
        <ContactSection />
      </div>
    )
  }
  if (!problem) return (
    <div className="min-h-screen bg-light flex items-center justify-center text-muted">
      Problem not found.
    </div>
  )

  return (
    <div className="min-h-screen bg-light">
      <PageHeader variant="problems" title="Problem Description" isIndividual={true} />
      <ProblemDetailsSection problemData={problem} />
      <ContactSection />
    </div>
  )
}

export default ProblemDetails
