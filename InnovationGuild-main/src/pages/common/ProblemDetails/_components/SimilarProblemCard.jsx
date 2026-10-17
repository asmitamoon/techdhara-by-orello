import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import ContactUserIcon from '../../../../assets/icons/contactUser.svg'
import { selectUserRole, selectUser } from '../../../../store/slices/authSlice'
import { useToggleFacingSimilar } from '../../../../hooks/mutations/vle'
import { useGetFacingSimilarProblems } from '../../../../hooks/queries/vle'

const SimilarProblemCard = ({ problemId, problemOwnerId, onViewContact, isContactLoading = false }) => {
  const userRole = useSelector(selectUserRole)
  const currentUser = useSelector(selectUser)
  const isVle = userRole === 'vle' && currentUser?.status === 'APPROVED'
  const currentUserId = currentUser?._id ?? currentUser?.id
  const isOwnProblem = !!currentUserId && currentUserId === problemOwnerId

  const { data: facingData } = useGetFacingSimilarProblems(undefined, { enabled: isVle })
  const [isFacingSimilar, setIsFacingSimilar] = useState(false)

  useEffect(() => {
    if (facingData?.data?.problems) {
      setIsFacingSimilar(facingData.data.problems.some(r => r.problemId?._id === problemId))
    }
  }, [facingData, problemId])

  const toggleMutation = useToggleFacingSimilar()

  const handleToggleSimilarProblem = () => {
    const prev = isFacingSimilar
    setIsFacingSimilar(!prev)
    toggleMutation.mutate(problemId, {
      onSuccess: (res) => setIsFacingSimilar(res.data.interested),
      onError: () => setIsFacingSimilar(prev),
    })
  }

  return (
    <div className="border border-input-border rounded-xl sm:rounded-2xl p-4 sm:p-5">
      {isVle && !isOwnProblem && (
        <>
        <p className="text-primary text-sm sm:text-base text-center mb-3 sm:mb-4">
          Are you facing a similar problem?
        </p>
        <button
          onClick={handleToggleSimilarProblem}
          disabled={toggleMutation.isPending}
          className={`w-full py-2.5 sm:py-3 border rounded-xl text-sm sm:text-base transition-all cursor-pointer mb-2.5 sm:mb-3 disabled:opacity-60 disabled:cursor-not-allowed ${
            isFacingSimilar
              ? 'bg-accent-green-dark border-accent-green-dark text-white'
              : 'bg-transparent border-accent-green-dark text-accent-green-dark'
          }`}
        >
          Facing Similar Problem
        </button>
        </>
      )}

      <button
        onClick={onViewContact}
        disabled={isContactLoading}
        className="w-full py-2.5 sm:py-3 bg-button-primary border border-input-border text-light rounded-xl text-sm sm:text-base hover:bg-accent-gold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <img src={ContactUserIcon} alt="Contact" className="w-4 h-4" />
        {isContactLoading ? 'Loading...' : 'View Contact Info'}
      </button>
    </div>
  )
}

export default SimilarProblemCard
