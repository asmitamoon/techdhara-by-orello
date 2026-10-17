import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import ContactSection from '../../../components/layout/ContactSection'
import PageHeader from '../../../components/ui/PageHeader'
import ProblemsTableSection from './_components/ProblemsTableSection'
import { usePublishedProblems } from '../../../hooks/queries/public'

const Problems = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [inputValue, setInputValue] = useState(searchQuery)
  const firstRender = useRef(true)

  useEffect(() => {
    // Skip on mount so returning to the listing (e.g. Back from a detail page)
    // doesn't wipe the ?page= param and snap to page 1.
    if (firstRender.current) { firstRender.current = false; return }
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (inputValue.trim()) {
          next.set('search', inputValue.trim())
        } else {
          next.delete('search')
        }
        next.delete('page')
        return next
      })
    }, 400)
    return () => clearTimeout(timer)
  }, [inputValue])

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
  }

  const { data, isLoading } = usePublishedProblems({
    search: searchQuery || undefined,
    page,
    limit: 6,
  })

  const { problems = [], pagination } = data ?? {}

  return (
    <div className="min-h-screen bg-light">
      <PageHeader variant="problems" title="Problems" showSearch={false} />
      <ProblemsTableSection
        problems={problems}
        searchQuery={inputValue}
        onSearchChange={setInputValue}
        currentPage={page}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
      <ContactSection/>
    </div>
  )
}

export default Problems
