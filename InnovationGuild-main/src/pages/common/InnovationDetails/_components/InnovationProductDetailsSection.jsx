// Mock data
const productData = {
  category: {
    main: 'Technology',
    sub: 'Processing',
    operations: ['Water', 'Field-Tested', 'Solar']
  },
  specifications: {
    powerSource: 'NA',
    dimensions: 'NA',
    weight: 'NA'
  },
  usage: {
    suitableForCrops: 'NA',
    suitableTerrains: 'NA',
    suitableSoilTypes: 'NA',
    otherConditions: ''
  },
  overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  downloadables: [
    {
      title: 'Product Brochure',
      type: 'PDF',
      size: '2.3 MB'
    },
    {
      title: 'User Manual',
      type: 'PDF',
      size: '2.5 MB'
    },
    {
      title: 'Standard Operating Brochure',
      type: 'PDF',
      size: '2.5 MB'
    }
  ]
}

const InnovationProductDetailsSection = () => {
  return (
    <div className="bg-light py-12">
      <div className="container">
        <div className="bg-white p-8 rounded-xl max-w-[1200px] mx-auto">
          {/* Category Tags */}
          <div className="space-y-4 mb-8">
            {/* Category, Sub Category, Operations */}
            <div className="flex flex-wrap items-center gap-6">
              {/* Category */}
              <div>
                <h4 className="text-base 2xl:text-md leading-relaxed font-body font-normal text-heading mb-2">Category</h4>
                <span className="inline-block px-4 py-2 bg-button-dark text-light rounded-full text-base 2xl:text-md leading-relaxed font-body font-normal">
                  {productData.category.main}
                </span>
              </div>

              {/* Sub Category */}
              <div>
                <h4 className="text-base 2xl:text-md leading-relaxed font-body font-normal text-heading mb-2">Sub Category</h4>
                <span className="inline-block px-4 py-2 border border-[#CB913D] text-[#CB913D] bg-[#FBF6EE] rounded-full text-base 2xl:text-md leading-relaxed font-body font-normal">
                  {productData.category.sub}
                </span>
              </div>

              {/* Operations */}
              <div>
                <h4 className="text-base 2xl:text-md leading-relaxed font-body font-normal text-heading mb-2">Operations</h4>
                <div className="flex flex-wrap gap-2">
                  {productData.category.operations.map((op, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#649769] text-[#649769] bg-[#F5FAF5] rounded-full text-xs 2xl:text-2xs leading-normal font-body"
                    >
                      {/* Icons for specific operations */}
                      {op === 'Water' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      )}
                      {op === 'Solar' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                      )}
                      {op === 'Field-Tested' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {op}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Specifications & Usage */}
          <div className="mb-12">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
              {/* Left Column - Product Specifications */}
              <div>
                <h3 className="text-4xl 2xl:text-4.5xl leading-tight font-heading font-normal text-heading mb-6">
                  Product Specifications
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-input-border">
                    <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-heading">Power Source:</span>
                    <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-muted">{productData.specifications.powerSource}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-input-border">
                    <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-heading">Dimensions:</span>
                    <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-muted">{productData.specifications.dimensions}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-input-border">
                    <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-heading">Weight:</span>
                    <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-muted">{productData.specifications.weight}</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Usage */}
              <div>
                <h3 className="text-4xl 2xl:text-4.5xl leading-tight font-heading font-normal text-heading mb-6">Usage</h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-input-border">
                    <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-heading">Suitable for crops/materials:</span>
                    <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-muted">{productData.usage.suitableForCrops}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-input-border">
                    <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-heading">Suitable terrains:</span>
                    <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-muted">{productData.usage.suitableTerrains}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-input-border">
                    <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-heading">Suitable soil types:</span>
                    <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-muted">{productData.usage.suitableSoilTypes}</span>
                  </div>
                  {productData.usage.otherConditions && (
                    <div className="py-3">
                      <span className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-heading">Other usage conditions:</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="mb-12">
            <h3 className="text-4xl 2xl:text-4.5xl leading-tight font-heading font-normal text-heading mb-6">Overview</h3>
            <p className="text-lg 2xl:text-1.5xl leading-relaxed font-body text-muted">
              {productData.overview}
            </p>
          </div>

          {/* Downloadable Resources */}
          <div>
            <h3 className="text-4xl 2xl:text-4.5xl leading-tight font-heading font-normal text-heading mb-6">
              Downloadable Resources
            </h3>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
              {productData.downloadables.map((resource, index) => (
                <div
                  key={index}
                  className="border border-red-200 bg-red-50 rounded-xl p-5 flex items-center justify-between hover:bg-red-100 transition-colors cursor-pointer"
                >
                  {/* Left side - Icon and Info */}
                  <div className="flex items-center gap-3">
                    {/* Document Icon */}
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {/* Title and Size */}
                    <div>
                      <p className="text-base 2xl:text-md leading-relaxed font-body font-medium text-heading">
                        {resource.title}
                      </p>
                      <p className="text-sm 2xl:text-base leading-relaxed font-body text-muted">
                        {resource.type} • {resource.size}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Download Icon */}
                  <button className="text-heading hover:text-accent-brown transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InnovationProductDetailsSection
