import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MdAutoAwesome } from 'react-icons/md';
import { selectUser } from '../../../../store/slices/authSlice';
import { importFromWebsite } from '../../../../api/ai';

const LOADING_MESSAGES = [
  'Fetching your website…',
  'Rendering page content…',
  'Analysing products with AI…',
  'Extracting product details…',
  'Saving innovations as drafts…',
];

const AiImportPanel = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const websiteUrl = user?.links ?? '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) { setMsgIndex(0); return; }
    const id = setInterval(() => {
      setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(id);
  }, [loading]);

  const handleImport = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await importFromWebsite(websiteUrl);
      queryClient.invalidateQueries({ queryKey: ['myInnovations'] });
      const { savedCount, skippedCount } = result.data;
      const msg = skippedCount > 0
        ? `${savedCount} saved as draft${savedCount !== 1 ? 's' : ''}. ${skippedCount} already existed and were skipped.`
        : `${savedCount} innovation${savedCount !== 1 ? 's' : ''} saved as draft${savedCount !== 1 ? 's' : ''}!`;
      toast.success(msg);
      navigate('/my-innovations');
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-primary/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 sm:p-10 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-accent-green-light border-t-accent-green-dark animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">Importing Innovations</h3>
            <p className="text-sm text-muted min-h-5 transition-all duration-300">{LOADING_MESSAGES[msgIndex]}</p>
            <p className="text-xs text-placeholder mt-3">This may take up to a minute</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-accent-green-light bg-linear-to-br from-white to-accent-green-light/30 p-5 sm:p-6 mb-8">

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-accent-green-dark/10 flex items-center justify-center shrink-0 mt-0.5">
            <MdAutoAwesome className="text-accent-green-dark text-lg" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-primary leading-tight">Import Innovations from Your Website</h3>
            <p className="text-sm text-muted mt-1">AI will scan your website, find all your products, and save them as draft innovations automatically.</p>
          </div>
        </div>

        {/* Action area */}
        <div className="border-t border-accent-green-light/60 pt-4">
          {websiteUrl ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-xs text-placeholder shrink-0">Website:</span>
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-green-dark font-medium truncate hover:underline">{websiteUrl}</a>
              </div>
              <button
                type="button"
                onClick={handleImport}
                disabled={loading}
                className="bg-accent-green-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-button-primary-hover transition-colors cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Import from Website
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-amber-500 shrink-0 leading-none">⚠</span>
              <p className="text-sm text-amber-800">No website URL found in your profile.</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

      </div>
    </>
  );
};

export default AiImportPanel;
