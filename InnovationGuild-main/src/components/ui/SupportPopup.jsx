import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import locationIcon from '../../assets/icons/location.svg';
import mobileIcon from '../../assets/icons/mobileIcon.svg';
import mailIcon from '../../assets/icons/mailIcon.svg';
import { useGetPilotRequestContext, useGetPilotRequestProblems } from '../../hooks/queries/vle';
import { useCreatePilotRequest } from '../../hooks/mutations/vle';
import { viewContact } from '../../api/common';

const Icons = {
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  ShareNetwork: () => (
    <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  )
};

const SupportPopup = ({
  isOpen,
  onClose,
  innovationId,
  innovatorUserId,
  innovatorName,
  innovatorLocation,
  hasAffiliatedOrg = true,
}) => {
  const navigate = useNavigate();
  const [supportNeeded, setSupportNeeded] = useState('yes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [contactLoading, setContactLoading] = useState(false);

  const { data: contextData, isLoading: contextLoading } = useGetPilotRequestContext({ enabled: isOpen });
  const { data: allProblemsData } = useGetPilotRequestProblems(
    { search: searchQuery || undefined },
    { enabled: isOpen }
  );
  const pilotMutation = useCreatePilotRequest();

  const myProblems = contextData?.data?.problems?.myProblems ?? [];
  const interestedProblems = contextData?.data?.problems?.myInterested ?? [];

  const excludedIds = new Set([
    ...myProblems.map(p => p._id),
    ...interestedProblems.map(p => p._id),
  ]);
  const otherProblems = (allProblemsData?.data?.problems ?? []).filter(
    p => !excludedIds.has(p._id)
  );

  // Reset state when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      if (!hasAffiliatedOrg) setSupportNeeded('no');
    } else {
      setSupportNeeded('yes');
      setSearchQuery('');
      setSelectedProblem(null);
      setContactData(null);
    }
  }, [isOpen]);

  // Fetch contact when user switches to "No"
  useEffect(() => {
    if (supportNeeded === 'no' && !contactData && innovatorUserId) {
      setContactLoading(true);
      viewContact(innovatorUserId)
        .then((res) => {
          const user = res.data.user;
          setContactData({
            name: innovatorName,
            location: innovatorLocation,
            phone: user.contactDetails?.phone ?? '',
            email: user.contactDetails?.email ?? '',
            image: user.profilePicture ?? null,
          });
        })
        .catch(() => {
          setContactData({ name: innovatorName, location: innovatorLocation, phone: '', email: '', image: null });
        })
        .finally(() => setContactLoading(false));
    }
  }, [supportNeeded, contactData, innovatorUserId, innovatorName, innovatorLocation]);

  const filtered = (arr) => arr.filter(p =>
    (p.problemTitle ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  const isSubmitDisabled = !selectedProblem || pilotMutation.isPending;

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    pilotMutation.mutate(
      { innovationId, problemId: selectedProblem },
      {
        onSuccess: (data) => {
          onClose();
          const pilotId = data?.data?.pilot?._id;
          if (pilotId) navigate(`/business-models/${pilotId}`);
        }
      }
    );
  };

  const handleAddNewProblem = () => {
    onClose();
    navigate('/submit-problem');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-[90%] sm:w-full max-w-[350px] sm:max-w-[500px] lg:max-w-[600px] rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] border-2 border-accent-green p-5 sm:p-6 lg:p-8 relative shadow-xl animate-in fade-in zoom-in-95 duration-200 my-8">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-placeholder hover:text-muted cursor-pointer transition-colors"
        >
          <Icons.Close />
        </button>

        <div className="flex flex-col items-center mb-5 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-button-dark rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
            <Icons.ShareNetwork />
          </div>

          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-heading text-center font-heading leading-tight px-2">
            Do you need support from TechDhaara?
          </h2>
        </div>

        {hasAffiliatedOrg && (
          <div className="flex justify-center gap-6 sm:gap-8 mb-5 sm:mb-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="support"
                value="yes"
                checked={supportNeeded === 'yes'}
                onChange={() => setSupportNeeded('yes')}
                className="w-4 h-4 sm:w-5 sm:h-5 accent-button-dark cursor-pointer"
              />
              <span className="text-input-text text-sm sm:text-base font-medium group-hover:text-heading transition-colors cursor-pointer">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="support"
                value="no"
                checked={supportNeeded === 'no'}
                onChange={() => setSupportNeeded('no')}
                className="w-4 h-4 sm:w-5 sm:h-5 accent-button-dark cursor-pointer"
              />
              <span className="text-input-text text-sm sm:text-base font-medium group-hover:text-heading transition-colors cursor-pointer">No</span>
            </label>
          </div>
        )}

        {supportNeeded === 'yes' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">

            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold text-heading">
                Link it to a Problem Statement
              </h3>
            </div>

            <div className="relative text-input-border">
              <input
                type="text"
                placeholder="Search Problem Statements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-light border border-input-border rounded-xl py-2.5 sm:py-3 pl-3 sm:pl-4 pr-10 sm:pr-12 text-primary outline-none focus:border-accent-green transition-colors font-body text-xs sm:text-sm placeholder:text-placeholder"
              />
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icons.Search />
              </div>
            </div>

            {contextLoading ? (
              <div className="border border-accent-green rounded-xl sm:rounded-2xl p-4 flex items-center justify-center min-h-25">
                <svg className="w-6 h-6 animate-spin text-accent-green" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            ) : (
              <div className="border border-accent-green rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-4 sm:space-y-6 max-h-70 sm:max-h-87.5 overflow-y-auto custom-scrollbar">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-secondary mb-2 sm:mb-3">My Problem Statements</h3>

                  {filtered(myProblems).length > 0 ? (
                    <div className="space-y-2">
                      {filtered(myProblems).map((problem) => (
                        <div
                          key={problem._id}
                          onClick={() => setSelectedProblem(problem._id)}
                          className={`border rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm cursor-pointer transition-colors ${
                            selectedProblem === problem._id
                            ? 'bg-accent-green text-white border-accent-green'
                            : 'border-input-border text-primary hover:bg-light hover:border-accent-green bg-white'
                          }`}
                        >
                          {problem.problemTitle}
                        </div>
                      ))}
                    </div>
                  ) : myProblems.length === 0 && !searchQuery ? (
                    <button
                      onClick={handleAddNewProblem}
                      className="w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-dashed border-accent-green text-accent-green font-medium hover:bg-light transition-colors text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      + Add a New Problem
                    </button>
                  ) : null}
                </div>

                {filtered(interestedProblems).length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-secondary mb-2 sm:mb-3">Interested Problem Statements</h3>
                    <div className="space-y-2">
                      {filtered(interestedProblems).map((problem) => (
                        <div
                          key={problem._id}
                          onClick={() => setSelectedProblem(problem._id)}
                          className={`border rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm cursor-pointer transition-colors ${
                            selectedProblem === problem._id
                            ? 'bg-accent-green text-white border-accent-green'
                            : 'border-input-border text-primary hover:bg-light hover:border-accent-green bg-white'
                          }`}
                        >
                          {problem.problemTitle}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {otherProblems.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-secondary mb-2 sm:mb-3">Other Problems</h3>
                    <div className="space-y-2">
                      {otherProblems.map((problem) => (
                        <div
                          key={problem._id}
                          onClick={() => setSelectedProblem(problem._id)}
                          className={`border rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm cursor-pointer transition-colors ${
                            selectedProblem === problem._id
                            ? 'bg-accent-green text-white border-accent-green'
                            : 'border-input-border text-primary hover:bg-light hover:border-accent-green bg-white'
                          }`}
                        >
                          {problem.problemTitle}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {supportNeeded === 'yes' && (
          <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className={`w-full py-2.5 sm:py-3.5 rounded-xl font-semibold text-base sm:text-lg transition-all shadow-md active:scale-[0.99] ${
                isSubmitDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-button-dark text-white hover:bg-opacity-90 cursor-pointer'
              }`}
            >
              {pilotMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit'}
            </button>
          </div>
        )}

        {/* Contact Details Section - Only shown when "No" is selected */}
        {supportNeeded === 'no' && (
          <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-heading mb-4 text-center">
              Contact Innovator
            </h3>

            {contactLoading ? (
              <div className="flex items-center justify-center py-6">
                <svg className="w-6 h-6 animate-spin text-accent-green" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-accent-green flex items-center justify-center bg-[#D9D9D9] overflow-hidden relative">
                    <div className="absolute inset-1 rounded-full border-2 border-white pointer-events-none"></div>
                    {contactData?.image ? (
                      <img src={contactData.image} alt={contactData.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#5C5853] z-10 select-none">
                        <span className="text-sm sm:text-base font-bold tracking-wider opacity-60 text-input-text">PHOTO</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <h4 className="text-lg sm:text-xl font-bold text-heading mb-2 font-heading">
                    {contactData?.name ?? innovatorName}
                  </h4>

                  <div className="flex items-center gap-2 mb-3 text-primary">
                    <img src={locationIcon} alt="Location" className="w-4 h-4 object-contain" />
                    <span className="text-sm sm:text-base">{contactData?.location ?? innovatorLocation}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm">
                    {contactData?.phone && (
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <img src={mobileIcon} alt="Phone" className="w-4 h-4 object-contain opacity-60" />
                        <span className="text-muted">Mobile</span>
                        <span className="text-primary font-medium">{contactData.phone}</span>
                      </div>
                    )}

                    {contactData?.email && (
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <img src={mailIcon} alt="Mail" className="w-4 h-4 object-contain opacity-60" />
                        <span className="text-muted">Email</span>
                        <span className="text-primary font-medium">{contactData.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default SupportPopup;
