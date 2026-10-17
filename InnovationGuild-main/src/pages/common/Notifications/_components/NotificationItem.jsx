import trashcanGray from '../../../../assets/icons/trashcanGray.svg';

const NotificationItem = ({ sender, title, message, time, onDelete }) => {
  return (
    <div className="flex flex-col gap-2 group">
      {/* First Row: Sender + Actions */}
      <div className="flex justify-between items-center gap-4">
        <p className="text-base md:text-lg text-muted">
          {sender}
        </p>

        {/* Right Actions (Icon + Time) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="hover:opacity-70 transition-opacity cursor-pointer p-1"
            onClick={onDelete}
          >
            <img src={trashcanGray} alt="Delete" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <span className="text-xs md:text-sm text-gray-400 font-medium whitespace-nowrap">
            • {time}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base md:text-lg font-semibold text-primary">
        {title}
      </h3>

      {/* Message */}
      <p className="text-sm md:text-base text-muted leading-relaxed">
        {message}
      </p>
    </div>
  );
};

export default NotificationItem;
