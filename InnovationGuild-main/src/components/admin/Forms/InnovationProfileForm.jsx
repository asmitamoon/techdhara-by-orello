import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Edit3 } from 'lucide-react';
import FormSelect from '../../ui/FormSelect';
import FormSelectAndAdd from '../../ui/FormSelectAndAdd';
import InnovationMediaUpload from '../../../pages/common/InnovationSubmission/_components/InnovationMediaUpload.jsx';
import { getStateOptions } from '../../../utils/LocationData/locationData';
import { innovationSchema } from '../../../schemas/innovationSchema';
import { useOperations } from '../../../hooks/queries/public';
import {
  INNOVATION_CATEGORY_OPTIONS,
  INNOVATION_SUBCATEGORY_OPTIONS,
  INNOVATION_STAGE_OPTIONS,
  POWER_SOURCE_OPTIONS,
  RENEWABLE_ENERGY_OPTIONS,
  DISTRIBUTOR_NETWORK_OPTIONS,
  YES_NO_OPTIONS,
  SUPPORT_OPTIONS,
  SUPPORT_WITH_EXPLORE_OPTIONS,
  AGRICULTURAL_OPERATIONS_OPTIONS
} from '../../../utils/constants/innovationConstants';

const InnovationProfileForm = forwardRef(({ initialData, isEditMode, onEditToggle, onDataChange, onSubmit }, ref) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(innovationSchema),
    defaultValues: initialData || {
      mediaItems: [],
      otherDocuments: [],
      innovationName: '',
      yearLaunched: '',
      description: '',
      category: [],
      categoryOther: '',
      subcategory: [],
      subcategoryOther: '',
      innovationStage: '',
      salesLocation: [],
      distributorNetwork: '',
      sellingPrice: '',
      manufacturingLocation: '',
      importedParts: '',
      importedPartsNotApplicable: false,
      spareParts: '',
      powerSource: '',
      pullCapacity: '',
      pullCapacityNotKnown: false,
      engineCapacity: '',
      motorCapacity: '',
      renewableType: '',
      dimensions: '',
      weight: '',
      attachments: '',
      performanceParams: '',
      coveredOperations: [],
      suitableCrops: '',
      suitableTerrains: '',
      suitableSoil: '',
      weatherConditions: '',
      otherUsageConditions: '',
      maintenanceTraining: '',
      financingSupport: '',
      technicalTraining: '',
      demoInstallations: '',
    }
  });

  const { data: fetchedOperations } = useOperations();
  const [operationOptions, setOperationOptions] = useState(AGRICULTURAL_OPERATIONS_OPTIONS);

  useEffect(() => {
    if (fetchedOperations?.length > 0) {
      setOperationOptions(prev => {
        const fetchedValues = fetchedOperations.map(o => o.value);
        const customOps = prev.filter(o => !fetchedValues.includes(o.value));
        return [...fetchedOperations, ...customOps];
      });
    }
  }, [fetchedOperations]);

  useEffect(() => {
    if (initialData?.coveredOperations?.length) {
      const customOps = initialData.coveredOperations
        .filter(val => !operationOptions.find(opt => opt.value === val))
        .map(val => ({ value: val, label: val.replace(/_/g, ' ') }));
      if (customOps.length > 0) {
        setOperationOptions(prev => [...prev, ...customOps]);
      }
    }
  }, [initialData]);

  const stateOptions = getStateOptions();
  
  const mediaItems = watch('mediaItems');
  const otherDocuments = watch('otherDocuments');
  const description = watch('description') || '';
  const category = watch('category') || [];
  const subcategory = watch('subcategory') || [];
  const powerSource = watch('powerSource');
  const pullCapacityNotKnown = watch('pullCapacityNotKnown');
  const importedPartsNotApplicable = watch('importedPartsNotApplicable');

  // Expose submit trigger to parent
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(onFormSubmit, onInvalid)();
    }
  }));

  // Reset form to initial data when edit mode is cancelled
  useEffect(() => {
    if (!isEditMode && initialData) {
      reset(initialData);
    }
  }, [isEditMode, initialData, reset]);

  // Handle side effects for dependent fields
  useEffect(() => {
    if (pullCapacityNotKnown) {
      setValue('pullCapacity', '', { shouldValidate: true });
    }
  }, [pullCapacityNotKnown, setValue]);

  useEffect(() => {
    if (importedPartsNotApplicable) {
      setValue('importedParts', '', { shouldValidate: true });
    }
  }, [importedPartsNotApplicable, setValue]);

  // Clear conditional fields when powerSource changes to prevent stale data
  useEffect(() => {
    if (!powerSource) return; // Skip on initial render

    // Clear pullCapacity fields if not manual/bullock
    if (powerSource !== 'manual' && powerSource !== 'bullock') {
      setValue('pullCapacity', '', { shouldValidate: true });
      setValue('pullCapacityNotKnown', false, { shouldValidate: true });
    }

    // Clear engineCapacity if not petrol_diesel
    if (powerSource !== 'petrol_diesel') {
      setValue('engineCapacity', '', { shouldValidate: true });
    }

    // Clear motorCapacity if not electrical/renewable
    if (powerSource !== 'electrical' && powerSource !== 'renewable') {
      setValue('motorCapacity', '', { shouldValidate: true });
    }

    // Clear renewableType if not renewable
    if (powerSource !== 'renewable') {
      setValue('renewableType', '', { shouldValidate: true });
    }
  }, [powerSource, setValue]);

  // Sync current form data upward
  const onFormSubmit = (data) => {
    if (onDataChange) {
      onDataChange(data);
    }
    if (onSubmit) {
      onSubmit(data);
    }
  };

  const onInvalid = () => {
    toast.error('Please fix the errors before continuing.');
    setTimeout(() => {
      const firstError = document.querySelector('.text-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  // Also sync on every change
  useEffect(() => {
    const subscription = watch((data) => {
      if (onDataChange) onDataChange(data);
    });
    return () => subscription.unsubscribe();
  }, [watch, onDataChange]);

  const inputClass = (fieldError) =>
    `form-input ${fieldError ? 'border-red-500' : ''} ${!isEditMode ? 'bg-transparent border-transparent focus:border-transparent cursor-default px-0' : ''}`;

  return (
    <div className="bg-white rounded-3xl border border-accent-green-dark p-4 sm:p-5 lg:p-6 xl:p-8">
      {/* Header */}
      <div className="border-b border-input-border pb-3 mb-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-primary">Innovation Detail</h2>
            <Info size={16} className="text-muted" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1">
            {initialData?.submittedDate && (
              <div className="text-sm text-muted flex items-center gap-1.5">
                <span className="font-medium">Submitted Date:</span>
                <span className="text-primary font-semibold">{initialData.submittedDate}</span>
              </div>
            )}
            {initialData?.status === 'approved' && initialData?.approvedDate && (
              <div className="text-sm text-muted flex items-center gap-1.5">
                <span className="font-medium">Approved Date:</span>
                <span className="text-primary font-semibold">{initialData.approvedDate}</span>
              </div>
            )}
          </div>
        </div>
        {!isEditMode && onEditToggle && (
          <button
            type="button"
            onClick={onEditToggle}
            className="flex items-center gap-2 px-4 py-2 text-sm text-accent-green-dark border border-accent-green-dark rounded-lg hover:bg-accent-green/5 transition-colors cursor-pointer font-medium"
          >
            <Edit3 size={16} />
            Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="space-y-10 sm:space-y-12">
          
          {/* Basic Details Section */}
          <div className="form-section">
            <div className="form-section-header">Basic Details</div>
            
            <div className="space-y-5 sm:space-y-6 lg:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label htmlFor="innovationName" className="form-label">Name of the Innovation<span className="text-red-500">*</span></label>
                  <input 
                    id="innovationName"
                    type="text" 
                    className={inputClass(errors.innovationName)} 
                    placeholder="Your Answer"
                    readOnly={!isEditMode} 
                    {...register('innovationName')} 
                  />
                  {errors.innovationName && <p className="text-red-500 text-xs mt-1">{errors.innovationName.message}</p>}
                </div>
                <div>
                  <label htmlFor="yearLaunched" className="form-label">Year Launched<span className="text-red-500">*</span></label>
                  <input 
                    id="yearLaunched"
                    type="text" 
                    className={inputClass(errors.yearLaunched)} 
                    placeholder="e.g. 2023"
                    readOnly={!isEditMode} 
                    {...register('yearLaunched')} 
                  />
                  {errors.yearLaunched && <p className="text-red-500 text-xs mt-1">{errors.yearLaunched.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="form-label">Describe your Innovation<span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <textarea 
                    id="description"
                    rows={4} 
                    className={`${inputClass(errors.description)} resize-none`} 
                    maxLength={3000}
                    placeholder="Your Answer"
                    readOnly={!isEditMode} 
                    {...register('description')} 
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-placeholder font-body">{(description || '').length}/3000</div>
                </div>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="form-label">Category of the Innovation (Select up to 3)<span className="text-red-500">*</span></label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        {...field}
                        value={INNOVATION_CATEGORY_OPTIONS.filter(opt => field.value.includes(opt.value))}
                        onChange={(options) => {
                          const values = options ? options.map(opt => opt.value) : [];
                          if (values.length > 3) return;
                          
                          const nonOthersCount = values.filter(v => v !== 'others').length;
                          if (nonOthersCount === 3 && values.includes('others')) return;
                          
                          if (!values.includes('others')) setValue('categoryOther', '', { shouldValidate: true });
                          
                          field.onChange(values);
                        }}
                        options={INNOVATION_CATEGORY_OPTIONS}
                        isMulti
                        isDisabled={!isEditMode}
                        className={errors.category ? 'border-red-500 rounded' : ''}
                      />
                    )}
                  />
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                  {category.includes('others') && (
                    <div className="mt-3">
                      <input
                        type="text"
                        className={inputClass(errors.categoryOther)}
                        placeholder="Please specify the category"
                        readOnly={!isEditMode}
                        {...register('categoryOther')}
                      />
                      {errors.categoryOther && <p className="text-red-500 text-xs mt-1">{errors.categoryOther.message}</p>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label">Subcategory of the Innovation (Select up to 3)<span className="text-red-500">*</span></label>
                  <Controller
                    name="subcategory"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        {...field}
                        value={INNOVATION_SUBCATEGORY_OPTIONS.filter(opt => field.value.includes(opt.value))}
                        onChange={(options) => {
                          const values = options ? options.map(opt => opt.value) : [];
                          if (values.length > 3) return;
                          
                          const nonOthersCount = values.filter(v => v !== 'others').length;
                          if (nonOthersCount === 3 && values.includes('others')) return;
                          
                          if (!values.includes('others')) setValue('subcategoryOther', '', { shouldValidate: true });
                          
                          field.onChange(values);
                        }}
                        options={INNOVATION_SUBCATEGORY_OPTIONS}
                        isMulti
                        isDisabled={!isEditMode}
                        className={errors.subcategory ? 'border-red-500 rounded' : ''}
                      />
                    )}
                  />
                  {errors.subcategory && <p className="text-red-500 text-xs mt-1">{errors.subcategory.message}</p>}
                  {subcategory.includes('others') && (
                    <div className="mt-3">
                      <input
                        type="text"
                        className={inputClass(errors.subcategoryOther)}
                        placeholder="Please specify the subcategory"
                        readOnly={!isEditMode}
                        {...register('subcategoryOther')}
                      />
                      {errors.subcategoryOther && <p className="text-red-500 text-xs mt-1">{errors.subcategoryOther.message}</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="form-label">Stage of the Innovation<span className="text-red-500">*</span></label>
                  <Controller
                    name="innovationStage"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        {...field}
                        value={INNOVATION_STAGE_OPTIONS.find(opt => opt.value === field.value) || null}
                        onChange={(option) => field.onChange(option?.value || '')}
                        options={INNOVATION_STAGE_OPTIONS}
                        isDisabled={!isEditMode}
                        className={errors.innovationStage ? 'border-red-500 rounded' : ''}
                      />
                    )}
                  />
                  {errors.innovationStage && <p className="text-red-500 text-xs mt-1">{errors.innovationStage.message}</p>}
                </div>
                <div>
                  <label className="form-label">Location of your Sales<span className="text-red-500">*</span></label>
                  <Controller
                    name="salesLocation"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        {...field}
                        value={stateOptions.filter(opt => field.value.includes(opt.value))}
                        onChange={(options) => field.onChange(options ? options.map(opt => opt.value) : [])}
                        options={stateOptions}
                        isMulti
                        isSearchable
                        isDisabled={!isEditMode}
                        className={errors.salesLocation ? 'border-red-500 rounded' : ''}
                      />
                    )}
                  />
                  {errors.salesLocation && <p className="text-red-500 text-xs mt-1">{errors.salesLocation.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="form-label">Do you have a network of distributors right now?<span className="text-red-500">*</span></label>
                  <div className={`flex flex-wrap gap-4 mt-2 ${errors.distributorNetwork ? 'border-l-4 border-red-500 pl-4 rounded' : ''}`}>
                    {DISTRIBUTOR_NETWORK_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value={opt.value}
                          disabled={!isEditMode}
                          {...register('distributorNetwork')}
                          className="w-4 h-4 accent-accent-green-dark disabled:opacity-100"
                        />
                        <span className="text-sm text-muted radio-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.distributorNetwork && <p className="text-red-500 text-xs mt-1">{errors.distributorNetwork.message}</p>}
                </div>
                <div>
                  <label htmlFor="sellingPrice" className="form-label">Selling Price in INR (Range, excluding logistics)<span className="text-red-500">*</span></label>
                  <input 
                    id="sellingPrice"
                    type="text" 
                    className={inputClass(errors.sellingPrice)} 
                    placeholder="e.g. 50000 or 50000-80000"
                    readOnly={!isEditMode} 
                    {...register('sellingPrice')} 
                  />
                  {errors.sellingPrice && <p className="text-red-500 text-xs mt-1">{errors.sellingPrice.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Manufacturing Details Section */}
          <div className="form-section">
            <div className="form-section-header">Manufacturing Details</div>
            <div className="space-y-5 lg:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label htmlFor="manufacturingLocation" className="form-label">Where is the innovation manufactured?<span className="text-red-500">*</span></label>
                  <input 
                    id="manufacturingLocation"
                    type="text" 
                    className={inputClass(errors.manufacturingLocation)} 
                    placeholder="Your Answer"
                    readOnly={!isEditMode} 
                    {...register('manufacturingLocation')} 
                  />
                  {errors.manufacturingLocation && <p className="text-red-500 text-xs mt-1">{errors.manufacturingLocation.message}</p>}
                </div>
                <div>
                  <label htmlFor="importedParts" className="form-label">List any imported parts (Click Checkbox, if not applicable)<span className="text-red-500">*</span></label>
                  <input
                    id="importedParts"
                    type="text"
                    className={`${inputClass(errors.importedParts)} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    placeholder="e.g. Engine components from Germany, Electronics from China"
                    readOnly={!isEditMode}
                    disabled={importedPartsNotApplicable}
                    {...register('importedParts')}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="importedPartsNotApplicable-admin"
                      className="w-4 h-4 rounded border-gray-300 text-accent-green-dark focus:ring-accent-green-dark"
                      disabled={!isEditMode}
                      {...register('importedPartsNotApplicable')}
                    />
                    <label htmlFor="importedPartsNotApplicable-admin" className="text-sm text-gray-500 cursor-pointer">No imported parts / Not applicable</label>
                  </div>
                  {errors.importedParts && !importedPartsNotApplicable && <p className="text-red-500 text-xs mt-1">{errors.importedParts.message}</p>}
                </div>
              </div>
              <div>
                <label className="form-label">Will you be able to provide spare parts for this product?<span className="text-red-500">*</span></label>
                <div className={`flex gap-4 mt-2 ${errors.spareParts ? 'border-l-4 border-red-500 pl-4 rounded' : ''}`}>
                  {['yes', 'no'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        value={opt} 
                        disabled={!isEditMode} 
                        {...register('spareParts')} 
                        className="w-4 h-4 accent-accent-green-dark disabled:opacity-100" 
                      />
                      <span className="text-sm text-muted radio-label capitalize">{opt}</span>
                    </label>
                  ))}
                </div>
                {errors.spareParts && <p className="text-red-500 text-xs mt-1">{errors.spareParts.message}</p>}
              </div>
            </div>
          </div>

          {/* Technical Information Section */}
          <div className="form-section">
            <div className="form-section-header">Technical Information</div>
            <div className="space-y-5 lg:space-y-8">
              <div>
                <label className="form-label">Power Source<span className="text-red-500">*</span></label>
                <div className={`flex flex-wrap gap-4 mt-2 ${errors.powerSource ? 'border-l-4 border-red-500 pl-4 rounded' : ''}`}>
                  {POWER_SOURCE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        value={opt.value} 
                        disabled={!isEditMode} 
                        {...register('powerSource')} 
                        className="w-4 h-4 accent-accent-green-dark disabled:opacity-100" 
                      />
                      <span className="text-sm text-muted radio-label">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.powerSource && <p className="text-red-500 text-xs mt-1">{errors.powerSource.message}</p>}
              </div>

              {powerSource && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                  {(powerSource === 'manual' || powerSource === 'bullock') && (
                    <div>
                      <label htmlFor="pullCapacity" className="form-label">What is the Pull capacity of the machine? (Click Checkbox, if not known)<span className="text-red-500">*</span></label>
                      <div className="flex flex-col gap-2">
                        <input 
                          id="pullCapacity"
                          type="text" 
                          className={`${inputClass(errors.pullCapacity)} ${pullCapacityNotKnown ? 'opacity-50' : ''}`} 
                          placeholder="Your Answer"
                          readOnly={!isEditMode || pullCapacityNotKnown} 
                          {...register('pullCapacity')} 
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            disabled={!isEditMode} 
                            {...register('pullCapacityNotKnown')} 
                            className="w-4 h-4 rounded border-gray-300 text-accent-green-dark focus:ring-accent-green" 
                          />
                          <span className="text-sm text-gray-500 font-body">Not known</span>
                        </label>
                      </div>
                      {errors.pullCapacity && !pullCapacityNotKnown && <p className="text-red-500 text-xs mt-1">{errors.pullCapacity.message}</p>}
                    </div>
                  )}
                  {powerSource === 'renewable' && (
                    <div>
                      <label className="form-label">Select renewable energy type<span className="text-red-500">*</span></label>
                      <Controller
                        name="renewableType"
                        control={control}
                        render={({ field }) => (
                          <FormSelect
                            {...field}
                            value={RENEWABLE_ENERGY_OPTIONS.find(opt => opt.value === field.value)}
                            onChange={(opt) => field.onChange(opt?.value || '')}
                            options={RENEWABLE_ENERGY_OPTIONS}
                            isDisabled={!isEditMode}
                            className={errors.renewableType ? 'border-red-500 rounded' : ''}
                          />
                        )}
                      />
                      {errors.renewableType && <p className="text-red-500 text-xs mt-1">{errors.renewableType.message}</p>}
                    </div>
                  )}
                  {powerSource === 'petrol_diesel' && (
                    <div>
                      <label htmlFor="engineCapacity" className="form-label">What is the engine capacity?<span className="text-red-500">*</span></label>
                      <input 
                        id="engineCapacity"
                        type="text" 
                        className={inputClass(errors.engineCapacity)} 
                        placeholder="motor size / engine cc / RPM etc"
                        readOnly={!isEditMode} 
                        {...register('engineCapacity')} 
                      />
                      {errors.engineCapacity && <p className="text-red-500 text-xs mt-1">{errors.engineCapacity.message}</p>}
                    </div>
                  )}
                  {(powerSource === 'electrical' || powerSource === 'renewable') && (
                    <div>
                      <label htmlFor="motorCapacity" className="form-label">What is the motor capacity (in HP)?<span className="text-red-500">*</span></label>
                      <input 
                        id="motorCapacity"
                        type="text" 
                        className={inputClass(errors.motorCapacity)} 
                        placeholder="Your Answer"
                        readOnly={!isEditMode} 
                        {...register('motorCapacity')} 
                      />
                      {errors.motorCapacity && <p className="text-red-500 text-xs mt-1">{errors.motorCapacity.message}</p>}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label htmlFor="dimensions" className="form-label">Dimensions of the product<span className="text-red-500">*</span></label>
                  <input 
                    id="dimensions"
                    type="text" 
                    className={inputClass(errors.dimensions)} 
                    placeholder="Your Answer"
                    readOnly={!isEditMode} 
                    {...register('dimensions')} 
                  />
                  {errors.dimensions && <p className="text-red-500 text-xs mt-1">{errors.dimensions.message}</p>}
                </div>
                <div>
                  <label htmlFor="weight" className="form-label">Weight of the product<span className="text-red-500">*</span></label>
                  <input 
                    id="weight"
                    type="text" 
                    className={inputClass(errors.weight)} 
                    placeholder="Your Answer"
                    readOnly={!isEditMode} 
                    {...register('weight')} 
                  />
                  {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label htmlFor="attachments" className="form-label">Are there any attachments to the product? If yes, provide details.</label>
                  <input 
                    id="attachments"
                    type="text" 
                    className={inputClass(errors.attachments)} 
                    placeholder="Your Answer"
                    readOnly={!isEditMode} 
                    {...register('attachments')}
                  />
                  {errors.attachments && <p className="text-red-500 text-xs mt-1">{errors.attachments.message}</p>}
                </div>
                <div>
                  <label htmlFor="performanceParams" className="form-label">Mention any performance parameters that you have tested for the innovation</label>
                  <input 
                    id="performanceParams"
                    type="text" 
                    className={inputClass(errors.performanceParams)} 
                    placeholder="Your Answer"
                    readOnly={!isEditMode} 
                    {...register('performanceParams')}
                  />
                  {errors.performanceParams && <p className="text-red-500 text-xs mt-1">{errors.performanceParams.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">What are the operations covered by this innovation? (Select up to 3)<span className="text-red-500">*</span></label>
                <Controller
                  name="coveredOperations"
                  control={control}
                  render={({ field }) => (
                    <FormSelectAndAdd
                      {...field}
                      value={operationOptions.filter(opt => field.value?.includes(opt.value))}
                      onChange={(selected) => {
                         const values = selected ? selected.map(opt => opt.value) : [];
                         if (values.length > 3) return;
                         field.onChange(values);
                      }}
                      options={operationOptions}
                      onOptionsChange={setOperationOptions}
                      isMulti
                      isSearchable
                      isDisabled={!isEditMode}
                      placeholder="Select or type to add operations..."
                      className={errors.coveredOperations ? 'border-red-500 rounded' : ''}
                    />
                  )}
                />
                {errors.coveredOperations && <p className="text-red-500 text-xs mt-1">{errors.coveredOperations.message}</p>}
              </div>
            </div>
          </div>

          {/* Usage Details Section */}
          <div className="form-section">
            <div className="form-section-header">Usage Details</div>
            <div className="space-y-5 lg:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label htmlFor="suitableCrops" className="form-label">Suitable Crops/Materials</label>
                  <input 
                    id="suitableCrops"
                    type="text" 
                    className={inputClass(errors.suitableCrops)} 
                    placeholder="Your Answer"
                    readOnly={!isEditMode} 
                    {...register('suitableCrops')}
                  />
                  {errors.suitableCrops && <p className="text-red-500 text-xs mt-1">{errors.suitableCrops.message}</p>}
                </div>
                <div>
                  <label htmlFor="suitableTerrains" className="form-label">Suitable Terrains</label>
                  <input 
                    id="suitableTerrains"
                    type="text" 
                    className={inputClass(errors.suitableTerrains)} 
                    placeholder="Your Answer"
                    readOnly={!isEditMode} 
                    {...register('suitableTerrains')}
                  />
                  {errors.suitableTerrains && <p className="text-red-500 text-xs mt-1">{errors.suitableTerrains.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label htmlFor="suitableSoil" className="form-label">Suitable Soil Types</label>
                  <input 
                    id="suitableSoil"
                    type="text" 
                    className={inputClass(errors.suitableSoil)} 
                    placeholder="Your Answer"
                    readOnly={!isEditMode} 
                    {...register('suitableSoil')}
                  />
                  {errors.suitableSoil && <p className="text-red-500 text-xs mt-1">{errors.suitableSoil.message}</p>}
                </div>
                <div>
                  <label htmlFor="weatherConditions" className="form-label">Weather Conditions</label>
                  <input 
                    id="weatherConditions"
                    type="text" 
                    className={inputClass(errors.weatherConditions)} 
                    placeholder="Your Answer"
                    readOnly={!isEditMode} 
                    {...register('weatherConditions')}
                  />
                  {errors.weatherConditions && <p className="text-red-500 text-xs mt-1">{errors.weatherConditions.message}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="otherUsageConditions" className="form-label">Other usage conditions</label>
                <input 
                  id="otherUsageConditions"
                  type="text" 
                  className={inputClass(errors.otherUsageConditions)} 
                  placeholder="Your Answer"
                  readOnly={!isEditMode} 
                  {...register('otherUsageConditions')}
                />
                {errors.otherUsageConditions && <p className="text-red-500 text-xs mt-1">{errors.otherUsageConditions.message}</p>}
              </div>
            </div>
          </div>

          {/* Support and Services Section */}
          <div className="form-section">
            <div className="form-section-header">Support and Services</div>
            <div className="space-y-6 lg:space-y-8">
              {['maintenanceTraining', 'financingSupport', 'technicalTraining', 'demoInstallations'].map((field) => {
                const labelMap = {
                  maintenanceTraining: 'Are you able to provide training on maintenance and after sales services for this innovation?',
                  financingSupport: 'Are you providing any end-user financing support for this innovation?',
                  technicalTraining: 'Will you be able to provide technical training for this innovation?',
                  demoInstallations: 'Will you be open to do demo installations in new geographies for this innovation?'
                };
                const opts = field === 'maintenanceTraining' || field === 'demoInstallations'
                  ? YES_NO_OPTIONS
                  : field === 'technicalTraining'
                    ? SUPPORT_OPTIONS
                    : SUPPORT_WITH_EXPLORE_OPTIONS;  // financingSupport

                return (
                  <div key={field}>
                    <label className="form-label">{labelMap[field]}</label>
                    <div className={`flex flex-wrap gap-4 mt-2 ${errors[field] ? 'border-l-4 border-red-500 pl-4 rounded' : ''}`}>
                      {opts.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value={opt.value}
                            disabled={!isEditMode}
                            {...register(field)}
                            className="w-4 h-4 accent-accent-green-dark disabled:opacity-100"
                          />
                          <span className="text-sm text-muted radio-label">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field].message}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Media Upload Section — Moved to Last */}
          <div className={!isEditMode ? "pointer-events-none" : ""}>
            <InnovationMediaUpload
              mediaItems={mediaItems}
              otherDocuments={otherDocuments}
              onMediaItemsChange={(items) => setValue('mediaItems', items, { shouldValidate: true })}
              onOtherDocumentsChange={(file) => setValue('otherDocuments', file, { shouldValidate: true })}
            />
            {errors.mediaItems && <p className="text-red-500 text-xs mt-1">{errors.mediaItems.message}</p>}
          </div>
        </div>
      </form>
    </div>
  );
});

InnovationProfileForm.displayName = 'InnovationProfileForm';

export default InnovationProfileForm;
