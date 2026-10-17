import ForwardArrow from '../../assets/icons/forwardarrowWhite.svg'

const CommentsSection = ({ comments = [], commentText = '', onCommentChange, onSubmit }) => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
      <div className="inline-block bg-header border border-input-border rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 mb-5 sm:mb-6">
        <span className="text-heading text-sm sm:text-base lg:text-lg">{comments.length} Comments</span>
      </div>

      <div className="mb-5 sm:mb-6">
        {comments.map((comment, index) => (
          <div
            key={comment.id}
            className={`${index < comments.length - 1 ? 'pb-5 sm:pb-6 border-b border-input-border' : ''} ${index > 0 ? 'pt-5 sm:pt-6' : ''}`}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2.5 sm:mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-muted flex-shrink-0"></div>
              <span className="text-primary text-sm sm:text-base lg:text-xl">{comment.name}</span>
              <span className="text-muted text-sm sm:text-base lg:text-lg">• {comment.time}</span>
            </div>
            <p className="text-heading text-sm sm:text-base lg:text-lg xl:text-xl">
              {comment.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-5 sm:mb-6 lg:mb-7">
        <textarea
          placeholder="Post a comment..."
          value={commentText}
          onChange={onCommentChange}
          className="w-full h-24 sm:h-28 lg:h-36 border border-input-border rounded-xl sm:rounded-2xl p-4 sm:p-4 lg:p-5 resize-none text-sm sm:text-base lg:text-lg placeholder:text-heading focus:outline-none focus:border-button-dark"
        ></textarea>
      </div>

      <button onClick={onSubmit} className="bg-accent-brown text-white px-5 py-2.5 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 rounded-xl text-sm sm:text-base lg:text-lg font-medium hover:bg-accent-brown/90 transition-all cursor-pointer flex items-center gap-2">
        Submit
        <img src={ForwardArrow} alt="Submit" className="w-4 sm:w-4 lg:w-5" />
      </button>
    </div>
  )
}

export default CommentsSection