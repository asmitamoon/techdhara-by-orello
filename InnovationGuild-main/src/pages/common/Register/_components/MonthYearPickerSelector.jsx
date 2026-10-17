import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

// Icon Component
const ChevronDown = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)

const MonthYearPickerSelector = ({ initialDate, onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate)

  useEffect(() => {
    setSelectedDate(initialDate);
  }, [initialDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date)
    if (onDateChange) onDateChange(date)
  }

  return (
    <>
      <style>{`
        .react-datepicker {
          border: 1px solid #E29F88 !important;
          border-radius: 0.75rem !important;
          font-family: inherit !important;
          padding: 12px !important;
          background-color: #fdfdfd !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          width: max-content;
        }
        .react-datepicker__header {
          background-color: white !important;
          border-bottom: none !important;
          padding-top: 0 !important;
        }
        .react-datepicker__triangle { display: none !important; }
        .react-datepicker__month-text, .react-datepicker__year-text { 
            padding: 8px 12px !important; 
            border-radius: 0.5rem !important; 
            font-size: 0.875rem !important; 
            font-weight: 500; 
            width: auto !important;
            margin: 2px;
        }
        .react-datepicker__month-wrapper {
            display: flex;
            justify-content: center;
            gap: 4px;
        }
        .react-datepicker__month-text--selected, .react-datepicker__month-text--keyboard-selected { 
            background-color: #FEF2EB !important; 
            color: black !important; 
        }
        .react-datepicker__month-text:hover { 
            background-color: #f3f4f6 !important; 
            color: #1f2937 !important; 
        }
        .react-datepicker__month-text--selected:hover { 
            background-color: #fef2eb !important; 
            color: white !important; 
        }
      `}</style>

      <div className="relative w-full">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="MM/yyyy"
          showMonthYearPicker
          popperPlacement="bottom-start"
          wrapperClassName="w-full" 
          className="form-input w-full pr-10 cursor-pointer !border-accent-green-light"
          calendarClassName="border-0 shadow-lg rounded-xl font-sans"
          maxDate={new Date()}
          placeholderText="Select Date"
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
             <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </>
  )
}

export default MonthYearPickerSelector