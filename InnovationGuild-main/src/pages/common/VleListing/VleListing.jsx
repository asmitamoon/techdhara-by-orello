import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../../../store/slices/authSlice'
import VLEHeaderSection from './_components/VLEHeaderSection'
import VLEStatsBar from './_components/VLEStatsBar'
import VLEFiltersSection from './_components/VLEFiltersSection'
import VLEGridSection from './_components/VLEGridSection'
import CTASection from '../../../components/layout/CTASection'
import ContactSection from '../../../components/layout/ContactSection'
import { usePublishedVles } from '../../../hooks/queries/public'

const VleListing = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const searchQuery = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const stateFilter = searchParams.get('state') || ''
  const genderFilter = searchParams.get('gender') || ''
  const categoryFilter = searchParams.get('category') || ''
  const personaFilter = searchParams.get('persona') || ''
  const statusFilter = searchParams.get('status') || ''

  const [inputValue, setInputValue] = useState(searchQuery)
  const firstRender = useRef(true)

  useEffect(() => {
    // Skip on mount so returning to the listing (e.g. Back from a detail page)
    // doesn't wipe the ?page= param and snap to page 1.
    if (firstRender.current) { firstRender.current = false; return }
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (inputValue.trim()) next.set('search', inputValue.trim())
        else next.delete('search')
        next.delete('page')
        return next
      })
    }, 400)
    return () => clearTimeout(timer)
  }, [inputValue])

  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    })
  }

  const handleClearFilters = () => {
    setInputValue('')
    setSearchParams({})
  }

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
  }

  const { data, isLoading } = usePublishedVles({
    search: searchQuery || undefined,
    state: stateFilter || undefined,
    gender: genderFilter || undefined,
    category: categoryFilter || undefined,
    persona: personaFilter || undefined,
    vleStatus: statusFilter || undefined,
    page,
    limit: 9,
  })

  const isLoggedIn = useSelector(selectIsLoggedIn)

  const { vles = [], pagination } = data ?? {}

  const filters = {
    category: categoryFilter,
    state: stateFilter,
    gender: genderFilter,
    status: statusFilter,
    persona: personaFilter,
  }

  return (
    <div className="min-h-screen bg-light">
      <VLEHeaderSection />
      <VLEStatsBar />
      <VLEFiltersSection
        filters={filters}
        searchQuery={inputValue}
        onFilterChange={setFilter}
        onSearchChange={setInputValue}
        onClearFilters={handleClearFilters}
      />
      <VLEGridSection
        vles={vles}
        isLoading={isLoading}
        currentPage={page}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={handlePageChange}
      />
      {!isLoggedIn && <CTASection buttonLink="/register?role=vle" />}
      <ContactSection />
    </div>
  )
}

export default VleListing
