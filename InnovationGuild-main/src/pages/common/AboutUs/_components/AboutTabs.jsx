import React, { useState, useEffect, useRef } from 'react'
import AboutTechDhaara from './AboutTechDhaara'
import WhoCanJoin from './WhoCanJoin'
import Glossary from './Glossary'
import Team from './Team'
import Partners from './Partners'

const AboutSection = () => {
  const [activeTab, setActiveTab] = useState('about')
  const sectionRef = useRef(null)
  const isUserTabChange = useRef(false) // ✅ only true on explicit user click

  const tabs = [
    { id: 'about', label: 'About TechDhaara' },
    { id: 'whocanjoin', label: 'Who can Join' },
    { id: 'partners', label: 'Partners' },
    { id: 'team', label: 'Team' },
    { id: 'glossary', label: 'Glossary' }
  ]

  // ✅ Listen for custom event from Hero section button
  useEffect(() => {
    const handleNavigateToTeam = () => {
      setActiveTab('team')

      if (sectionRef.current) {
        const yOffset = -100
        const y =
          sectionRef.current.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset

        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }

    window.addEventListener('navigateToTeam', handleNavigateToTeam)
    return () => window.removeEventListener('navigateToTeam', handleNavigateToTeam)
  }, [])

  useEffect(() => {
    const handler = () => {
      setActiveTab('about')
      if (sectionRef.current) {
        const y = sectionRef.current.getBoundingClientRect().top + window.pageYOffset - 100
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
    window.addEventListener('navigateToAbout', handler)
    return () => window.removeEventListener('navigateToAbout', handler)
  }, [])

  useEffect(() => {
    const handler = () => {
      setActiveTab('whocanjoin')
      if (sectionRef.current) {
        const y = sectionRef.current.getBoundingClientRect().top + window.pageYOffset - 100
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
    window.addEventListener('navigateToWhocanjoin', handler)
    return () => window.removeEventListener('navigateToWhocanjoin', handler)
  }, [])

  // ✅ Support URL hash for any tab on load (e.g. #team, #partners, #whocanjoin)
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const matched = tabs.find(t => t.id === hash)
    if (matched) {
      setActiveTab(matched.id)

      setTimeout(() => {
        if (sectionRef.current) {
          const yOffset = -100
          const y =
            sectionRef.current.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset

          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 100)
    }
  }, [])

  // ✅ Scroll ONLY when tab changes by explicit user interaction (never on mount/refresh)
  useEffect(() => {
    if (!isUserTabChange.current) return
    isUserTabChange.current = false

    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect()

      // only scroll if section not already in view
      if (rect.top < 0 || rect.top > window.innerHeight) {
        const yOffset = -100
        const y =
          rect.top +
          window.pageYOffset +
          yOffset

        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
  }, [activeTab])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return <AboutTechDhaara />
      case 'whocanjoin':
        return <WhoCanJoin />
      case 'partners':
        return <Partners />
      case 'team':
        return <Team />
      case 'glossary':
        return <Glossary />
      default:
        return <AboutTechDhaara />
    }
  }

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab)

  const handlePrevTab = () => {
    const newIndex = currentTabIndex > 0 ? currentTabIndex - 1 : tabs.length - 1
    isUserTabChange.current = true
    setActiveTab(tabs[newIndex].id)
  }

  const handleNextTab = () => {
    const newIndex = currentTabIndex < tabs.length - 1 ? currentTabIndex + 1 : 0
    isUserTabChange.current = true
    setActiveTab(tabs[newIndex].id)
  }

  const handleTabClick = (tabId) => {
    isUserTabChange.current = true
    setActiveTab(tabId)
  }

  return (
    <section ref={sectionRef} className="bg-about-bg flex flex-col min-h-screen">
      <div className="flex flex-col h-full">

        {/* Sticky Header */}
        <div className="sticky top-4 md:top-8 z-20 bg-about-bg">

          {/* Top spacing */}
          <div className="pt-16 md:pt-24 border-b border-[#DAD1C2]">

            {/* Mobile / Tablet */}
            <div className="lg:hidden relative flex items-center justify-between px-4 pb-4">
              <button
                onClick={handlePrevTab}
                className="p-2 text-[#0A3718] hover:text-accent-brown transition-colors flex-shrink-0"
                aria-label="Previous tab"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div className="flex-1 flex justify-center">
                <span className="text-base md:text-lg font-medium text-[#0A3718] uppercase tracking-wide">
                  {tabs[currentTabIndex].label}
                </span>
              </div>

              <button
                onClick={handleNextTab}
                className="p-2 text-[#0A3718] hover:text-accent-brown transition-colors flex-shrink-0"
                aria-label="Next tab"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Desktop */}
            <div className="hidden lg:flex flex-wrap justify-center gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-14 py-5 text-lg cursor-pointer font-medium transition-all duration-300 rounded-t-xl ${
                    activeTab === tab.id
                      ? 'bg-accent-green-dark text-white'
                      : 'bg-[#F0E8DC] text-[#0A3718] hover:bg-[#DDD0BA]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-visible">
          <div className="max-w-full mx-auto">
            {renderTabContent()}
          </div>
        </div>

      </div>
    </section>
  )
}

export default AboutSection