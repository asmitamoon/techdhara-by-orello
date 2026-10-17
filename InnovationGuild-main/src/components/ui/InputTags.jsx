import { useState } from 'react';

const XIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const InputTags = ({
    value = [],
    onChange,
    placeholder = "Type and press Enter",
    className = ''
}) => {
    const [inputValue, setInputValue] = useState('');

    const addTag = () => {
        if (inputValue.trim() && !value.includes(inputValue.trim())) {
            onChange([...value, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            // Remove last tag when backspace is pressed on empty input
            onChange(value.slice(0, -1));
        }
    };

    const removeTag = (indexToRemove) => {
        onChange(value.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="flex gap-2 sm:gap-3">
            <div className={`form-input min-h-[45.6px] sm:min-h-[57.6px] lg:min-h-[70px] flex flex-wrap gap-2 p-2 sm:p-3 lg:p-4 flex-1 ${className}`}>
                {value.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-accent-green-light text-primary text-sm sm:text-base rounded-lg border border-accent-green"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="text-red-400 cursor-pointer"
                        >
                            <XIcon />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-sm sm:text-base lg:text-lg text-primary placeholder:text-muted"
                />
            </div>
            <div>
                <button
                    type="button"
                    onClick={addTag}
                    disabled={!inputValue.trim()}
                    className="min-h-[45.6px] sm:min-h-[57.6px] lg:min-h-[70px] px-4 sm:px-6 lg:px-8 bg-accent-green-dark text-white text-sm sm:text-base lg:text-lg rounded-xl hover:bg-primary transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed font-medium"
                    title="Add tag"
                >
                    Add
                </button>
            </div>
        </div>
    );
};

export default InputTags;