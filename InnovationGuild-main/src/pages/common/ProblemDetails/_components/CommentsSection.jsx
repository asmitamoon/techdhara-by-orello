import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../../../../store/slices/authSlice'
import ForwardArrow from '../../../../assets/icons/forwardarrowWhite.svg'
import { useGetProblemComments } from '../../../../hooks/queries/common'
import { useCreateCommentOnProblem } from '../../../../hooks/mutations/common'

const getRelativeTime = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)} days ago`
}

const CommentsSection = ({ problemId }) => {
  const [commentText, setCommentText] = useState('')
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const navigate = useNavigate()

  const { data } = useGetProblemComments(problemId)
  const { mutate, isPending } = useCreateCommentOnProblem(problemId)

  const comments = data?.data?.comments ?? []
  const total = data?.data?.pagination?.total ?? 0

  const handleSubmitComment = () => {
    if (!commentText.trim()) return
    mutate(
      { problemId, content: commentText.trim() },
      { onSuccess: () => setCommentText('') }
    )
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
      <div className="inline-block bg-header border border-input-border rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 mb-5 sm:mb-6">
        <span className="text-heading text-sm sm:text-base lg:text-lg">{total} Comments</span>
      </div>

      <div className="mb-5 sm:mb-6">
        {comments.map((comment, index) => (
          <div
            key={comment._id}
            className={`${index < comments.length - 1 ? 'pb-5 sm:pb-6 border-b border-input-border' : ''} ${index > 0 ? 'pt-5 sm:pt-6' : ''}`}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2.5 sm:mb-3">
              {comment.userId?.profilePicture ? (
                <img
                  src={comment.userId.profilePicture}
                  alt={comment.userId.fullName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-muted flex-shrink-0" />
              )}
              <span className="text-primary text-sm sm:text-base lg:text-xl">{comment.userId?.fullName}</span>
              <span className="text-muted text-sm sm:text-base lg:text-lg">• {getRelativeTime(comment.createdAt)}</span>
            </div>
            <p className="text-heading text-sm sm:text-base lg:text-lg xl:text-xl">
              {comment.content}
            </p>
          </div>
        ))}
      </div>

      {/* Comment Input or Login Prompt */}
      {isLoggedIn ? (
        <>
          <div className="mb-5 sm:mb-6 lg:mb-7">
            <textarea
              placeholder="Post a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full h-24 sm:h-28 lg:h-36 border border-input-border rounded-xl sm:rounded-2xl p-4 sm:p-4 lg:p-5 resize-none text-sm sm:text-base lg:text-lg placeholder:text-heading focus:outline-none focus:border-button-dark"
            />
          </div>
          <button
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || isPending}
            className="bg-accent-brown text-white px-5 py-2.5 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 rounded-xl text-sm sm:text-base lg:text-lg font-medium hover:bg-accent-brown/90 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Submitting...' : 'Submit'}
            <img src={ForwardArrow} alt="Submit" className="w-4 sm:w-4 lg:w-5" />
          </button>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted text-sm sm:text-base mb-3">Login to post a comment</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-accent-brown text-white px-5 py-2.5 rounded-xl text-sm sm:text-base font-medium hover:bg-accent-brown/90 transition-all cursor-pointer"
          >
            Login
          </button>
        </div>
      )}
    </div>
  )
}

export default CommentsSection
