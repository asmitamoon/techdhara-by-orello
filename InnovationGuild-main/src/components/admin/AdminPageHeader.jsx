import { useNavigate, Link } from 'react-router';

const AdminPageHeader = ({
  title,
  breadcrumbs = [],
  showBackButton = true,
  actions = null
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Browser history back
  };

  return (
    <div className="bg-white border-b border-input-border">
      <div className="container py-4 sm:py-6">
        {/* Breadcrumb Navigation */}
        {breadcrumbs.length > 0 && (
          <div className="text-sm text-muted mb-2 sm:mb-3">
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="hover:text-accent-green-dark transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-dark font-medium">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="mx-1.5 sm:mx-2">›</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Page Header with Back Button and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex-shrink-0 p-2 hover:bg-light rounded-lg transition-colors group"
                aria-label="Go back"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-muted group-hover:text-dark transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            )}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-semibold text-dark truncate">
              {title}
            </h1>
          </div>

          {/* Action Buttons */}
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminPageHeader;
