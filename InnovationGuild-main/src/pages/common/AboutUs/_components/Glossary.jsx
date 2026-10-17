import React, { useState, useMemo } from 'react';
import ContactSection from '../../../../components/layout/ContactSection'

const Glossary = () => {
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedLetter, setSelectedLetter] = useState('All');

  const alphabet = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const glossaryItems = [
    {
      term: 'Affiliated Organisations (AO)',
      category: 'Roles',
      description: 'NGOs or community-based organisations that work in specific regions or sectors, serving as implementing partners within the TechDhaara ecosystem. They coordinate between communities, innovators, and provide on-ground support for solution implementation.'
    },
    {
      term: 'Book Keeping',
      category: 'Documentation',
      description: ''
    },
    {
      term: 'Commercial Phase',
      category: 'Project Phases',
      description: ''
    },
    {
      term: 'Field Reports',
      category: 'Documentation',
      description: ''
    },
    {
      term: 'Innovations',
      category: 'General',
      description: ''
    },
    {
      term: 'Innovator',
      category: 'Roles',
      description: ''
    },
    {
      term: 'Nodal Organisation',
      category: 'Roles',
      description: ''
    },
    {
      term: 'Pilot Phase',
      category: 'Project Phases',
      description: ''
    },
    {
      term: 'Rural Innovation Ecosystem',
      category: 'Documentation',
      description: ''
    },
    {
      term: 'Solution Matching',
      category: 'Process',
      description: ''
    },
    {
      term: 'Stakeholder',
      category: 'General',
      description: ''
    },
    {
      term: 'Village Level Entrepreneurs',
      category: 'Roles',
      description: ''
    }
  ];

  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    setExpandedItems({}); // Close all expanded items when filter changes
  };

  // Filter and sort glossary items based on selected letter
  const filteredItems = useMemo(() => {
    let filtered = glossaryItems;
    
    if (selectedLetter !== 'All') {
      filtered = glossaryItems.filter(item => 
        item.term.charAt(0).toUpperCase() === selectedLetter
      );
    }
    
    // Sort: items starting with selected letter first, then alphabetically
    return [...filtered].sort((a, b) => {
      const aFirstLetter = a.term.charAt(0).toUpperCase();
      const bFirstLetter = b.term.charAt(0).toUpperCase();
      
      if (selectedLetter !== 'All') {
        // All items already start with selected letter, just sort alphabetically
        return a.term.localeCompare(b.term);
      }
      
      // For 'All': sort alphabetically
      return a.term.localeCompare(b.term);
    });
  }, [selectedLetter]);

  return (
    <div className=" bg-about-bg pt-14 sm:pt-16 md:pt-18 xl:pt-24">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-regular text-black mb-4 sm:mb-6">Glossary</h1>
          <p className="text-lg sm:text-xl text-black mb-6 sm:mb-8 md:mb-10 xl:mb-14">
            Key terms and definitions to help you navigate the TechDhaara ecosystem
          </p>
        </div>

        {/* Alphabet Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {alphabet.map((letter, index) => (
              <button
                key={index}
                onClick={() => handleLetterClick(letter)}
                className={`
                  px-3 py-1.5 rounded text-sm font-medium transition-colors
                  ${letter === selectedLetter
                    ? 'bg-gray-700 text-white hover:bg-gray-800' 
                    : 'bg-transparent text-[#6D3C31] hover:bg-gray-200'
                  }
                  min-w-[40px]
                `}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Items */}
        <div className="space-y-3 sm:mb-8 md:mb-12 xl:mb-16">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={index}
                className="bg-[#F0E8DC]  overflow-hidden "
              >
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full px-4 sm:px-6 py-4 cursor-pointer flex items-center justify-between text-left"
                >
                  <div className="flex-1  flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="font-semibold font-heading text-gray-900 text-lg sm:text-xl">
                      {item.term}
                    </span>
                    <span className="inline-block px-3 py-1 bg-accent-green-light text-gray-700 text-xs rounded-full w-fit">
                      {item.category}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform flex-shrink-0 ml-2 ${
                      expandedItems[index] ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedItems[index] && item.description && (
                  <div className="px-4 sm:px-6 pb-4">
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No terms found starting with "{selectedLetter}"
              </p>
            </div>
          )}
        </div>
      </div>
      <ContactSection />
    </div>
  );
};

export default Glossary;