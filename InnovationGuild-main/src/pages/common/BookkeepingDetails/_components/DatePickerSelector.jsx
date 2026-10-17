import { useState } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

// Icon Components
const ChevronDown = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
)

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

// Custom Header Component
const CustomHeader = ({
  date,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) => (
  <div className="flex items-center justify-between px-2 py-2 mb-2 bg-[#EAEAEA] rounded-lg">
    <button
      type="button"
      onClick={decreaseMonth}
      disabled={prevMonthButtonDisabled}
      className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
    >
      <ChevronLeft />
    </button>
    <span className="text-sm font-semibold text-gray-700">
      {date.toLocaleString('default', { month: 'short', year: 'numeric' })}
    </span>
    <button
      type="button"
      onClick={increaseMonth}
      disabled={nextMonthButtonDisabled}
      className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
    >
      <ChevronRight />
    </button>
  </div>
)

// Main Component
const getMaxDate = (period) => {
  const today = new Date();
  if (period === 'Monthly') {
    return new Date(today.getFullYear(), today.getMonth() + 1, 0); // last day of current month
  }
  if (period === 'Yearly') {
    return new Date(today.getFullYear(), 11, 31); // Dec 31 of current year
  }
  return today;
};

const DatePickerSelector = ({ initialDate, onDateChange, onPeriodChange, hidePeriod = false, isDisabled = false, minDate }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date())
  const [isPeriodOpen, setIsPeriodOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('Daily')

  const handleDateChange = (date) => {
    setSelectedDate(date)
    if (onDateChange) onDateChange(date)
  }

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period)
    setIsPeriodOpen(false)
    if (onPeriodChange) onPeriodChange(period)
  }

  return (
    <>
      <style>{`
        .react-datepicker {
          border: 1px solid #e5e7eb !important;
          border-radius: 0.75rem !important;
          font-family: inherit !important;
          padding: 12px !important;
          background-color: #fdfdfd !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          width: max-content; /* Ensures the container wraps snugly */
        }
        .react-datepicker__header {
          background-color: white !important;
          border-bottom: none !important;
          padding-top: 0 !important;
        }
        .react-datepicker__triangle { display: none !important; }
        .react-datepicker__day--outside-month { visibility: hidden !important; pointer-events: none !important; }
        .react-datepicker__day-name { color: #9ca3af !important; font-weight: 700 !important; font-size: 0.75rem !important; }
        .react-datepicker__day { border-radius: 9999px !important; }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-color: #8CA877 !important; color: white !important; }
        .react-datepicker__day--today { font-weight: bold; color: #8CA877; }
        
        /* MONTH PICKER STYLING */
        .react-datepicker__month-wrapper {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 8px;
        }

        /* YEAR PICKER STYLING */
        .react-datepicker__year-wrapper { 
            display: flex; 
            flex-wrap: wrap; /* Allows years to wrap to next line */
            justify-content: center; 
            gap: 8px; 
            max-width: 240px; /* Constrains width to force a grid layout (3 items per row) */
            margin: 0 auto;
        }

        .react-datepicker__month-text, .react-datepicker__year-text { 
            padding: 8px 12px !important; 
            border-radius: 0.5rem !important; 
            font-size: 0.875rem !important; 
            font-weight: 500; 
            width: auto !important; /* Prevents text from squashing */
        }
        
        .react-datepicker__month-text--selected, .react-datepicker__year-text--selected { background-color: #8CA877 !important; color: white !important; }
        .react-datepicker__day:hover, .react-datepicker__month-text:hover, .react-datepicker__year-text:hover { background-color: #f3f4f6 !important; color: #1f2937 !important; }
        .react-datepicker__day--selected:hover, .react-datepicker__month-text--selected:hover, .react-datepicker__year-text--selected:hover { background-color: #7A9366 !important; color: white !important; }
      `}</style>

      <div className={`flex items-start gap-4 mb-3 sm:mb-6 ${isDisabled ? 'pointer-events-none opacity-80' : ''}`}>
        {!hidePeriod && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPeriodOpen(!isPeriodOpen)}
              className="flex items-center justify-between w-30 sm:w-40 px-4 py-2.5 bg-white border border-[#B8CEA8] rounded-xl text-gray-500 text-sm hover:border-[#8CA877] transition-colors cursor-pointer"
            >
              <span>{selectedPeriod}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {isPeriodOpen && (
              <div className="absolute top-12 left-0 w-40 bg-white border border-[#B8CEA8] rounded-xl shadow-lg overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex flex-col p-1">
                  {['Daily', 'Monthly', 'Yearly'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handlePeriodChange(item)}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${selectedPeriod === item ? 'bg-[#EFEBE9] text-[#1A2E28] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat={selectedPeriod === 'Monthly' ? "MM/yyyy" : selectedPeriod === 'Yearly' ? "yyyy" : "dd/MM/yyyy"}
            showMonthYearPicker={selectedPeriod === 'Monthly'}
            showYearPicker={selectedPeriod === 'Yearly'}
            renderCustomHeader={selectedPeriod === 'Daily' ? CustomHeader : undefined}
            popperPlacement="bottom-start"
            className="px-6 py-2.5 w-35 sm:w-40 bg-white border border-[#B8CEA8] rounded-xl text-gray-500 text-sm hover:border-[#8CA877] transition-colors text-left cursor-pointer outline-none focus:border-[#8CA877]"
            calendarClassName="border-0 shadow-lg rounded-xl font-sans"
            maxDate={getMaxDate(selectedPeriod)}
            minDate={minDate}
            readOnly={isDisabled}
          />
        </div>
      </div>
    </>
  )
}

export default DatePickerSelector