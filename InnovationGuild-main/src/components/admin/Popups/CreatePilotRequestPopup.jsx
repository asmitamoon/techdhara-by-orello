import { useState } from 'react';

// Icons
const Icons = {
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  )
};

const CreatePilotRequestPopup = ({
  isOpen,
  onClose,
  onSubmit = () => {},
  vleName = 'VLE Name',
  myInnovations = [],
  interestedInnovations = [],
  otherInnovations = [],
  myProblems = [],
  vleProblems = [],
  interestedProblems = [],
  vleInterestedProblems = [],
  otherProblems = []
}) => {
  // Step management
  const [step, setStep] = useState(1); // 1: innovation, 2: problem
  const [selectedInnovation, setSelectedInnovation] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && selectedInnovation) {
      setStep(2);
      setSearchQuery(''); // Reset search for next step
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSearchQuery(''); // Reset search
    }
  };

  const handleSubmit = () => {
    onSubmit({ innovationId: selectedInnovation, problemId: selectedProblem || undefined });
    onClose();
    // Reset state when closing
    setStep(1);
    setSelectedInnovation(null);
    setSelectedProblem(null);
    setSearchQuery('');
  };

  const handleClose = () => {
    onClose();
    // Reset state when closing
    setStep(1);
    setSelectedInnovation(null);
    setSelectedProblem(null);
    setSearchQuery('');
  };

  const filterItems = (arr) =>
    arr.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-[90%] sm:w-full max-w-[350px] sm:max-w-[500px] lg:max-w-[600px] rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] border-2 border-accent-green p-5 sm:p-6 lg:p-8 relative shadow-xl animate-in fade-in zoom-in-95 duration-200 my-8">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-placeholder hover:text-muted cursor-pointer transition-colors"
        >
          <Icons.Close />
        </button>

        {/* Header with Step Indicator */}
        <div className="flex flex-col items-center mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-heading text-center font-heading leading-tight px-2 mb-2">
            Create Pilot Request for {vleName}
          </h2>
          <div className="text-sm text-muted">
            Step {step} of 2
          </div>
        </div>

        {/* Step 1: Select Innovation */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold text-heading">
                Select Innovation
              </h3>
            </div>

            {/* Search Bar */}
            <div className="relative text-input-border">
              <input
                type="text"
                placeholder="Search Innovations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-light border border-input-border rounded-xl py-2.5 sm:py-3 pl-3 sm:pl-4 pr-10 sm:pr-12 text-primary outline-none focus:border-accent-green transition-colors font-body text-xs sm:text-sm placeholder:text-placeholder"
              />
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icons.Search />
              </div>
            </div>

            {/* Innovation Lists */}
            <div className="border border-accent-green rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-4 sm:space-y-6 max-h-[280px] sm:max-h-[350px] overflow-y-auto custom-scrollbar">
              {/* Saved Innovations */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-secondary mb-2 sm:mb-3">Saved Innovations</h3>
                {filterItems(myInnovations).length > 0 ? (
                  <div className="space-y-2">
                    {filterItems(myInnovations).map((innovation) => (
                      <div
                        key={innovation.id}
                        onClick={() => setSelectedInnovation(innovation.id)}
                        className={`border rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 cursor-pointer transition-colors ${
                          selectedInnovation === innovation.id
                          ? 'bg-accent-green text-white border-accent-green'
                          : 'border-input-border text-primary hover:bg-light hover:border-accent-green bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {innovation.image ? (
                            <img src={innovation.image} alt={innovation.title} className="w-10 h-10 rounded-md object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-light shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">{innovation.title}</div>
                            {innovation.innovatorName && (
                              <div className="text-xs opacity-70 truncate">{innovation.innovatorName}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted italic">No innovations found</p>
                )}
              </div>

              {/* VLE Saved Innovations */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-secondary mb-2 sm:mb-3">VLE Saved Innovations</h3>
                <div className="space-y-2">
                  {filterItems(interestedInnovations).map((innovation) => (
                    <div
                      key={innovation.id}
                      onClick={() => setSelectedInnovation(innovation.id)}
                      className={`border rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 cursor-pointer transition-colors ${
                        selectedInnovation === innovation.id
                        ? 'bg-accent-green text-white border-accent-green'
                        : 'border-input-border text-primary hover:bg-light hover:border-accent-green bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {innovation.image ? (
                          <img src={innovation.image} alt={innovation.title} className="w-10 h-10 rounded-md object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-light shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">{innovation.title}</div>
                          {innovation.innovatorName && (
                            <div className="text-xs opacity-70 truncate">{innovation.innovatorName}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Innovations */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-secondary mb-2 sm:mb-3">Other Innovations</h3>
                <div className="space-y-2">
                  {filterItems(otherInnovations).map((innovation) => (
                    <div
                      key={innovation.id}
                      onClick={() => setSelectedInnovation(innovation.id)}
                      className={`border rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 cursor-pointer transition-colors ${
                        selectedInnovation === innovation.id
                        ? 'bg-accent-green text-white border-accent-green'
                        : 'border-input-border text-primary hover:bg-light hover:border-accent-green bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {innovation.image ? (
                          <img src={innovation.image} alt={innovation.title} className="w-10 h-10 rounded-md object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-light shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">{innovation.title}</div>
                          {innovation.innovatorName && (
                            <div className="text-xs opacity-70 truncate">{innovation.innovatorName}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
              <button
                onClick={handleNext}
                disabled={!selectedInnovation}
                className={`w-full py-2.5 sm:py-3.5 rounded-xl font-semibold text-base sm:text-lg transition-all shadow-md active:scale-[0.99] ${
                  !selectedInnovation
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-button-dark text-white hover:bg-opacity-90 cursor-pointer'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Problem */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold text-heading">
                Link to Problem Statement
              </h3>
            </div>

            {/* Search Bar */}
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

            {/* Problem Lists */}
            <div className="border border-accent-green rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-4 sm:space-y-6 max-h-[280px] sm:max-h-[350px] overflow-y-auto custom-scrollbar">
              {/* My Problem Statement */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-secondary mb-2 sm:mb-3">My Problem Statement</h3>
                {filterItems(myProblems).length > 0 ? (
                  <div className="space-y-2">
                    {filterItems(myProblems).map((problem) => (
                      <div
                        key={problem.id}
                        onClick={() => setSelectedProblem(problem.id)}
                        className={`border rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm cursor-pointer transition-colors ${
                          selectedProblem === problem.id
                          ? 'bg-accent-green text-white border-accent-green'
                          : 'border-input-border text-primary hover:bg-light hover:border-accent-green bg-white'
                        }`}
                      >
                        {problem.title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted italic">No problem statements found</p>
                )}
              </div>

              {/* VLEs Problem Statement */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-secondary mb-2 sm:mb-3">VLEs Problem Statement</h3>
                {filterItems(vleProblems).length > 0 ? (
                  <div className="space-y-2">
                    {filterItems(vleProblems).map((problem) => (
                      <div
                        key={problem.id}
                        onClick={() => setSelectedProblem(problem.id)}
                        className={`border rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm cursor-pointer transition-colors ${
                          selectedProblem === problem.id
                          ? 'bg-accent-green text-white border-accent-green'
                          : 'border-input-border text-primary hover:bg-light hover:border-accent-green bg-white'
                        }`}
                      >
                        {problem.title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted italic">No problem statements found</p>
                )}
              </div>

              {/* My Interested Problem Statement */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-secondary mb-2 sm:mb-3">My Interested Problem Statement</h3>
                {filterItems(interestedProblems).length > 0 ? (
                  <div className="space-y-2">
                    {filterItems(interestedProblems).map((problem) => (
                      <div
                        key={problem.id}
                        onClick={() => setSelectedProblem(problem.id)}
                        className={`border rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm cursor-pointer transition-colors ${
                          selectedProblem === problem.id
                          ? 'bg-accent-green text-white border-accent-green'
                          : 'border-input-border text-primary hover:bg-light hover:border-accent-green bg-white'
                        }`}
                      >
                        {problem.title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted italic">No problem statements found</p>
                )}
              </div>

              {/* VLE Interested Problem Statement */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-secondary mb-2 sm:mb-3">VLE Interested Problem Statement</h3>
                {filterItems(vleInterestedProblems).length > 0 ? (
                  <div className="space-y-2">
                    {filterItems(vleInterestedProblems).map((problem) => (
                      <div
                        key={problem.id}
                        onClick={() => setSelectedProblem(problem.id)}
                        className={`border rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm cursor-pointer transition-colors ${
                          selectedProblem === problem.id
                          ? 'bg-accent-green text-white border-accent-green'
                          : 'border-input-border text-primary hover:bg-light hover:border-accent-green bg-white'
                        }`}
                      >
                        {problem.title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted italic">No problem statements found</p>
                )}
              </div>

              {/* Other Problems */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-secondary mb-2 sm:mb-3">Other Problems</h3>
                {filterItems(otherProblems).length > 0 ? (
                  <div className="space-y-2">
                    {filterItems(otherProblems).map((problem) => (
                      <div
                        key={problem.id}
                        onClick={() => setSelectedProblem(problem.id)}
                        className={`border rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-xs sm:text-sm cursor-pointer transition-colors ${
                          selectedProblem === problem.id
                          ? 'bg-accent-green text-white border-accent-green'
                          : 'border-input-border text-primary hover:bg-light hover:border-accent-green bg-white'
                        }`}
                      >
                        {problem.title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted italic">No problem statements found</p>
                )}
              </div>
            </div>

            {/* Back and Submit Buttons */}
            <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-2.5 sm:py-3.5 rounded-xl font-semibold text-base sm:text-lg bg-white text-muted border border-input-border hover:bg-light transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedProblem}
                className={`flex-1 py-2.5 sm:py-3.5 rounded-xl font-semibold text-base sm:text-lg transition-all shadow-md active:scale-[0.99] ${
                  !selectedProblem
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-button-dark text-white hover:bg-opacity-90 cursor-pointer'
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreatePilotRequestPopup;
