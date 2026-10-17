import {
  INNOVATION_CATEGORY_OPTIONS,
  INNOVATION_SUBCATEGORY_OPTIONS,
} from '../../../../utils/constants/innovationConstants'
import { operationLabel } from '../../../../utils/operationLabel'
import { useOperations } from '../../../../hooks/queries/public'

const getLabel = (options, value) =>
  options.find(o => o.value === value)?.label ?? value

const InnovationProductDetails = ({ productData }) => {
  const { data: operations = [] } = useOperations()
  return (
    <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl">
      <div className="space-y-4 mb-6 sm:mb-8 mt-4 sm:mt-6 lg:mt-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 sm:gap-6">
          
          {/* Main Category */}
          <div>
            <h4 className="text-sm sm:text-base lg:text-lg text-heading mb-2">Category</h4>
            <div className="flex flex-wrap gap-2">
              {productData.category.main.map((val, i) => (
                <span key={i} className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-button-dark text-light rounded-full text-sm sm:text-base">
                  {getLabel(INNOVATION_CATEGORY_OPTIONS, val)}
                </span>
              ))}
            </div>
          </div>

          {/* Sub Category */}
          <div>
            <h4 className="text-sm sm:text-base lg:text-lg text-heading mb-2">Sub Category</h4>
            <div className="flex flex-wrap gap-2">
              {productData.category.sub.map((val, i) => (
                <span key={i} className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 border border-[#CB913D] text-[#CB913D] bg-[#FBF6EE] rounded-full text-sm sm:text-base">
                  {getLabel(INNOVATION_SUBCATEGORY_OPTIONS, val)}
                </span>
              ))}
            </div>
          </div>

          {/* Operations */}
          <div>
            <h4 className="text-sm sm:text-base lg:text-lg text-heading mb-2">Operations</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {productData.category.operations.map((op, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 border border-[#649769] text-[#649769] bg-[#F5FAF5] rounded-full text-xs sm:text-sm font-medium"
                >
                  {operationLabel(operations, op)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10 sm:mb-12">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:gap-12">
          
          {/* Specifications */}
          <div>
            <h3 className="text-lg sm:text-xl lg:text-2xl text-heading mb-4 sm:mb-5 lg:mb-6">
              Product Specifications
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                <span className="text-sm sm:text-base lg:text-lg text-heading">Power Source:</span>
                <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.specifications.powerSource}</span>
              </div>
              {(productData.specifications.powerSource === 'Manual' || productData.specifications.powerSource === 'Bullock Drawn') && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                  <span className="text-sm sm:text-base lg:text-lg text-heading">Pull Capacity:</span>
                  <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.specifications.pullCapacity || 'Not Known'}</span>
                </div>
              )}
              {productData.specifications.powerSource === 'Petrol/Diesel' && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                  <span className="text-sm sm:text-base lg:text-lg text-heading">Engine Capacity:</span>
                  <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.specifications.engineCapacity}</span>
                </div>
              )}
              {(productData.specifications.powerSource === 'Electrical' || productData.specifications.powerSource === 'Renewable') && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                  <span className="text-sm sm:text-base lg:text-lg text-heading">Motor Capacity:</span>
                  <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.specifications.motorCapacity}</span>
                </div>
              )}
              {productData.specifications.powerSource === 'Renewable' && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                  <span className="text-sm sm:text-base lg:text-lg text-heading">Renewable Type:</span>
                  <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.specifications.renewableType}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                <span className="text-sm sm:text-base lg:text-lg text-heading">Dimensions:</span>
                <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.specifications.dimensions}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                <span className="text-sm sm:text-base lg:text-lg text-heading">Weight:</span>
                <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.specifications.weight}</span>
              </div>
              {productData.specifications.attachments && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                  <span className="text-sm sm:text-base lg:text-lg text-heading">Attachments:</span>
                  <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.specifications.attachments}</span>
                </div>
              )}
              {productData.specifications.performanceParams && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                  <span className="text-sm sm:text-base lg:text-lg text-heading">Performance Parameters:</span>
                  <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.specifications.performanceParams}</span>
                </div>
              )}
            </div>
          </div>

          {/* Usage */}
          <div>
            <h3 className="text-lg sm:text-xl lg:text-2xl text-heading mb-4 sm:mb-5 lg:mb-6">Usage</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                <span className="text-sm sm:text-base lg:text-lg text-heading">Suitable for crops/materials:</span>
                <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.usage.suitableCrops}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                <span className="text-sm sm:text-base lg:text-lg text-heading">Suitable terrains:</span>
                <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.usage.suitableTerrains}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                <span className="text-sm sm:text-base lg:text-lg text-heading">Suitable soil types:</span>
                <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.usage.suitableSoil}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                <span className="text-sm sm:text-base lg:text-lg text-heading">Weather Conditions:</span>
                <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.usage.weatherConditions}</span>
              </div>
              {productData.usage.otherUsageConditions && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 sm:py-3 border-b border-input-border">
                  <span className="text-sm sm:text-base lg:text-lg text-heading">Other usage conditions:</span>
                  <span className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">{productData.usage.otherUsageConditions}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="mb-10 sm:mb-12">
        <h3 className="text-lg sm:text-xl lg:text-2xl text-heading mb-4 sm:mb-5 lg:mb-6">Overview</h3>
        <p className="text-sm sm:text-base lg:text-lg text-muted wrap-break-word">
          {productData.overview}
        </p>
      </div>

      {/* Downloadable Resources */}
      {productData.downloadables?.length > 0 && <div>
        <h3 className="text-lg sm:text-xl lg:text-2xl text-heading mb-4 sm:mb-5 lg:mb-6">
          Downloadable Resources
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {productData.downloadables.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#D45555] bg-[#FFEBEB] rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-between hover:bg-red-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-heading line-clamp-1">
                    {resource.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted">
                    {resource.type} • {resource.size}
                  </p>
                </div>
              </div>
              <button className="text-heading hover:text-accent-brown transition-colors shrink-0 ml-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </a>
          ))}
        </div>
      </div>}
    </div>
  )
}

export default InnovationProductDetails