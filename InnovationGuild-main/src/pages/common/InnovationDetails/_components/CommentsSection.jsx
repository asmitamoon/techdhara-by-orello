import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../../../../store/slices/authSlice'
import ForwardArrow from '../../../../assets/icons/forwardarrowWhite.svg'
import { useGetInnovationComments } from '../../../../hooks/queries/common'
import { useCreateCommentOnInnovation } from '../../../../hooks/mutations/common'

const getRelativeTime = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)} days ago`
}

const CommentsSection = ({ innovationId }) => {
  const [commentText, setCommentText] = useState('')
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const navigate = useNavigate()

  const { data } = useGetInnovationComments(innovationId)
  const { mutate, isPending } = useCreateCommentOnInnovation(innovationId)

  const comments = data?.data?.comments ?? []
  const total = data?.data?.pagination?.total ?? 0

  const handleSubmitComment = () => {
    if (!commentText.trim()) return
    mutate(
      { innovationId, content: commentText.trim() },
      { onSuccess: () => setCommentText('') }
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 md:p-8">
      {/* Comments Count Badge */}
      <div className="inline-block bg-header border border-input-border rounded-xl px-4 py-2 mb-6">
        <span className="text-heading text-sm md:text-base 2xl:text-lg leading-relaxed font-normal">{total} Comments</span>
      </div>

      {/* Comment Items */}
      <div className="mb-6">
        {comments.map((comment, index) => (
          <div
            key={comment._id}
            className={`${index < comments.length - 1 ? 'pb-6 border-b border-input-border' : ''} ${index > 0 ? 'pt-6' : ''}`}
          >
            {/* Avatar, Name, Time */}
            <div className="flex items-center gap-3 mb-3">
              {comment.userId?.profilePicture ? (
                <img
                  src={comment.userId.profilePicture}
                  alt={comment.userId.fullName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted shrink-0" />
              )}
              <span className="text-primary text-sm md:text-base 2xl:text-xl leading-relaxed font-normal">{comment.userId?.fullName}</span>
              <span className="text-muted text-base md:text-lg 2xl:text-xl leading-relaxed">• {getRelativeTime(comment.createdAt)}</span>
            </div>
            {/* Comment Text */}
            <p className="text-heading text-base md:text-lg 2xl:text-xl leading-relaxed">
              {comment.content}
            </p>
          </div>
        ))}
      </div>

      {/* Comment Input or Login Prompt */}
      {isLoggedIn ? (
        <>
          <div className="mb-5 md:mb-7">
            <textarea
              placeholder="Post a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full h-28 md:h-36 border border-input-border rounded-2xl p-4 md:p-5 resize-none text-base md:text-lg 2xl:text-xl leading-relaxed placeholder:text-heading focus:outline-none focus:border-button-dark"
            ></textarea>
          </div>
          <button
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || isPending}
            className="bg-accent-brown text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl text-base md:text-lg 2xl:text-xl leading-none font-medium hover:bg-accent-brown/90 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Submitting...' : 'Submit'}
            <img src={ForwardArrow} alt="Submit" className="ml-1 md:ml-2 w-4 md:w-5" />
          </button>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted text-base mb-3">Login to post a comment</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-accent-brown text-white px-5 py-2.5 rounded-xl text-base font-medium hover:bg-accent-brown/90 transition-all cursor-pointer"
          >
            Login
          </button>
        </div>
      )}
    </div>
  )
}

export default CommentsSection
