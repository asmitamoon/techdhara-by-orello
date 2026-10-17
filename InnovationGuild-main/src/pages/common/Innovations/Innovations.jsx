import { useState } from 'react'
import { useSearchParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import InnovationsCategorySection from './_components/InnovationsCategorySection'
import InnovationsFilterSection from './_components/InnovationsFilterSection'
import InnovationsGridSection from './_components/InnovationsGridSection'
import ContactSection from '../../../components/layout/ContactSection'
import SharePopup from '../../../components/ui/SharePopup'
import { usePublishedInnovations, useInnovationFacets, useInnovationsCategoryPreview } from '../../../hooks/queries/public'
import { getStateName, getDistrictName, getStateOptions } from '../../../utils/LocationData/locationData'
import { INNOVATION_SUBCATEGORY_OPTIONS, INNOVATION_OPERATIONS_OPTIONS } from '../../../utils/constants/innovationConstants'

const PARAM_DEFAULTS = { category: 'all', sortBy: 'most-relevant' }

const CATEGORY_LABELS = {
  agriculture: 'Agriculture', textiles: 'Textiles', fisheries: 'Fisheries',
  bamboo: 'Bamboo', poultry: 'Poultry', dairy: 'Dairy', others: 'Others',
}
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS)

const mapInnovation = (inv) => ({
  id: inv._id,
  title: inv.innovationName,
  description: inv.description,
  image: inv.thumbnail,
  company: inv.innovatorId?.fullName ?? '',
  location: inv.state
    ? inv.district
      ? `${getDistrictName(inv.district, inv.state)}, ${getStateName(inv.state)}`
      : getStateName(inv.state)
    : '',
  category: Array.isArray(inv.category) ? inv.category[0] : inv.category,
})

const Innovations = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [shareConfig, setShareConfig] = useState({ isOpen: false, url: '' })

  const selectedCategory = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('search') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const filters = {
    subCategory: searchParams.get('subCategory') || '',
    state: searchParams.get('state') || '',
    operatingRequirement: searchParams.get('operation') || '',
    sortBy: searchParams.get('sortBy') || 'most-relevant',
  }

  const updateParams = (updates) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === PARAM_DEFAULTS[key]) {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      })
      return next
    })
  }

  const isAllView = selectedCategory === 'all'

  // All-view: per-category preview with filters applied (no pagination)
  const previewParams = isAllView ? {
    ...(filters.subCategory && { subCategory: filters.subCategory }),
    ...(filters.operatingRequirement && { operation: filters.operatingRequirement }),
    ...(filters.state && { state: filters.state }),
    ...(searchQuery.trim() && { search: searchQuery.trim() }),
  } : null

  // Category-specific view: paginated list
  const listParams = !isAllView ? {
    category: selectedCategory,
    ...(filters.subCategory && { subCategory: filters.subCategory }),
    ...(filters.operatingRequirement && { operation: filters.operatingRequirement }),
    ...(filters.state && { state: filters.state }),
    ...(searchQuery.trim() && { search: searchQuery.trim() }),
    page: currentPage,
    limit: 9,
    sortBy: 'createdAt',
    order: filters.sortBy === 'oldest' ? 'asc' : 'desc',
  } : null

  const { data: previewData, isLoading: previewLoading } = useInnovationsCategoryPreview(previewParams)
  const { data, isLoading: listLoading } = usePublishedInnovations(listParams)

  const isLoading = isAllView ? previewLoading : listLoading

  const facetsParams = selectedCategory !== 'all' ? { category: selectedCategory } : {}
  const { data: facetsData } = useInnovationFacets(facetsParams)
  const facets = facetsData?.data

  const availableSubCategories = facets !== undefined
    ? INNOVATION_SUBCATEGORY_OPTIONS.filter(o => facets.subCategories.includes(o.value))
    : INNOVATION_SUBCATEGORY_OPTIONS

  const availableOperations = facets !== undefined
    ? INNOVATION_OPERATIONS_OPTIONS.filter(o => facets.operations.includes(o.value))
    : INNOVATION_OPERATIONS_OPTIONS

  const availableStates = facets !== undefined
    ? facets.states.map(code => ({ value: code, label: getStateName(code) || code }))
    : getStateOptions()

  const noInnovations = facets !== undefined
    && facets.subCategories.length === 0
    && facets.operations.length === 0
    && facets.states.length === 0

  const innovations = isAllView ? [] : (data?.data?.innovations?.map(mapInnovation) ?? [])

  const categorizedInnovations = isAllView
    ? CATEGORY_ORDER.reduce((acc, catId) => {
        const items = (previewData?.data?.preview?.[catId] ?? []).map(mapInnovation)
        if (items.length > 0) acc.push({ id: catId, name: CATEGORY_LABELS[catId], innovations: items, count: items.length })
        return acc
      }, [])
    : null

  const pagination = data?.data?.pagination
  const paginationProps = pagination
    ? {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: (p) => updateParams({ page: p }),
        onPrevious: () => updateParams({ page: currentPage - 1 }),
        onNext: () => updateParams({ page: currentPage + 1 }),
        canGoPrevious: pagination.page > 1,
        canGoNext: pagination.page < pagination.totalPages,
      }
    : null

  const handleCategoryChange = (categoryId) => updateParams({ category: categoryId, page: null })

  const handleFiltersChange = (newFilters) => updateParams({
    subCategory: newFilters.subCategory,
    state: newFilters.state,
    operation: newFilters.operatingRequirement,
    sortBy: newFilters.sortBy,
    page: null,
  })

  const handleSearchChange = (value) => updateParams({ search: value, page: null })

  const toSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleOpenShare = (id, title) => {
    setShareConfig({
      isOpen: true,
      url: `https://techdhaara.com/innovations/${id}${title ? `/${toSlug(title)}` : ''}`
    })
  }

  return (
    <div className="min-h-screen bg-light">
      <PageHeader variant="innovations" title="Innovations Catalogue" />

      <InnovationsCategorySection
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      <InnovationsFilterSection
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        subCategoryOptions={availableSubCategories}
        operationsOptions={availableOperations}
        stateOptions={availableStates}
        noInnovations={noInnovations}
      />

      <InnovationsGridSection
        innovations={innovations}
        isLoading={isLoading}
        pagination={isAllView ? null : paginationProps}
        onShare={handleOpenShare}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categorizedInnovations={categorizedInnovations}
      />

      <ContactSection />

      <SharePopup
        isOpen={shareConfig.isOpen}
        url={shareConfig.url}
        onClose={() => setShareConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default Innovations
