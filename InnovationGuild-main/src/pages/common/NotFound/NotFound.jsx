import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const homeUrl = pathname.startsWith('/admin') ? '/admin'
    : pathname.startsWith('/ao') ? '/ao'
    : pathname.startsWith('/no') ? '/no'
    : '/';

  const homeLabel = homeUrl === '/' ? 'Go to Home' : 'Go to Dashboard';

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">

        {/* 404 Number */}
        <p className="font-heading leading-none text-[9rem] sm:text-[12rem] font-bold text-primary select-none opacity-15">
          404
        </p>

        {/* Title */}
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-heading mb-3">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="font-body text-muted text-base mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-body text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <button
            onClick={() => navigate(homeUrl)}
            className="flex items-center gap-2 px-6 py-3 border border-accent-green-dark text-primary font-body text-sm font-medium rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Home size={18} />
            {homeLabel}
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
