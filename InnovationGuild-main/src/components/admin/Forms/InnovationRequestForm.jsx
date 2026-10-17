import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Info, Edit3, X } from 'lucide-react';
import FormSelect from '../../ui/FormSelect';
import FormSelectAndAdd from '../../ui/FormSelectAndAdd';
import LocationGroup from '../../ui/LocationGroup';
import folderIcon from '../../../assets/icons/folderIcon.svg';
import { innovationRequestSchema } from '../../../schemas/problemSchema';
import { useOperations } from '../../../hooks/queries/public';
import {
  POWER_SOURCE_OPTIONS,
  RENEWABLE_ENERGY_OPTIONS,
  YES_NO_OPTIONS,
  AGRICULTURAL_OPERATIONS_OPTIONS
} from '../../../utils/constants/innovationConstants';
import { 
  PROBLEM_CATEGORY_OPTIONS, 
  PROBLEM_SUBCATEGORY_OPTIONS,
} from '../../../utils/constants/problemConstants';

const InnovationRequestForm = forwardRef(({ initialData, isEditMode, onEditToggle, onDataChange, onSubmit }, ref) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(innovationRequestSchema),
    defaultValues: initialData || {
      problemTitle: '',
      problemDescription: '',
      regionState: '',
      regionDistrict: '',
      regionVillage: '',
      category: '',
      categoryOther: '',
      valueChainStages: [],
      crops: '',
      operationsUndertaken: [], 
      machineOperations: [],    
      currentMethodology: '',
      knowMachinery: null,
      machineChallenge: '',
      energySource: [],
      pullCapacity: '',
      pullCapacityNotKnown: false,
      engineCapacity: '',
      motorCapacity: '',
      renewableType: '',
      specificInfo: '',
      problemSize: '',
      endProducts: '',
      salesChannels: '',
      newChannels: '',
      currentRevenue: '',
      expectedRevenue: '',
      machineBudget: '',
      uploadedImage: null,
      type: 'innovation'
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
    if (initialData) {
      const allSavedValues = [
        ...(initialData.operationsUndertaken || []),
        ...(initialData.machineOperations || []),
      ];
      const customOps = allSavedValues
        .filter(val => !operationOptions.find(opt => opt.value === val))
        .filter((val, i, arr) => arr.indexOf(val) === i)
        .map(val => ({ value: val, label: val.replace(/_/g, ' ') }));
      if (customOps.length > 0) {
        setOperationOptions(prev => [...prev, ...customOps]);
      }
    }
  }, [initialData]);

  const category = watch('category');
  const knowMachinery = watch('knowMachinery');
  const valueChainStages = watch('valueChainStages') || [];
  const energySource = watch('energySource') || [];
  const pullCapacityNotKnown = watch('pullCapacityNotKnown');
  const problemDescription = watch('problemDescription') || '';
  const uploadedImage = watch('uploadedImage');
  
  const [imagePreview, setImagePreview] = useState(null);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(onFormSubmit, () => toast.error('Please fix the form errors before submitting'))();
    }
  }));

  useEffect(() => {
    if (uploadedImage) {
      if (uploadedImage instanceof File) {
        const url = URL.createObjectURL(uploadedImage);
        setImagePreview(url);
        return () => URL.revokeObjectURL(url);
      } else if (typeof uploadedImage === 'string') {
        setImagePreview(uploadedImage);
      }
    } else {
      setImagePreview(null);
    }
  }, [uploadedImage]);

  useEffect(() => {
    if (pullCapacityNotKnown) {
      setValue('pullCapacity', '', { shouldValidate: true });
    }
  }, [pullCapacityNotKnown, setValue]);

  useEffect(() => {
    if (category !== 'others') {
      setValue('categoryOther', '', { shouldValidate: true });
    }
  }, [category, setValue]);

  useEffect(() => {
    if (!initialData || isEditMode) return;
    reset({
      ...initialData,
      pullCapacityNotKnown:
        (initialData.energySource?.includes('manual') || initialData.energySource?.includes('bullock'))
        && !initialData.pullCapacity,
    });
  }, [isEditMode, initialData, reset]);

  const onFormSubmit = (data) => {
    if (onDataChange) onDataChange(data);
    if (onSubmit) onSubmit(data);
  };

  useEffect(() => {
    const subscription = watch((data) => {
      if (onDataChange) onDataChange(data);
    });
    return () => subscription.unsubscribe();
  }, [watch, onDataChange]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images are supported');
      e.target.value = '';
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setValue('uploadedImage', file, { shouldValidate: true });
    toast.success('Image uploaded!');
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    setValue('uploadedImage', null, { shouldValidate: true });
  };

  const handleCheckboxToggle = (field, value) => {
    if (!isEditMode) return;
    const currentValues = watch(field) || [];
    if (currentValues.includes(value)) {
      setValue(field, currentValues.filter(v => v !== value), { shouldValidate: true });
    } else {
      setValue(field, [...currentValues, value], { shouldValidate: true });
    }
  };

  const inputClass = (fieldError) =>
    `form-input ${fieldError ? 'border-red-500' : ''} ${!isEditMode ? 'bg-transparent border-transparent focus:border-transparent cursor-default px-0 font-medium text-primary' : ''}`;

  return (
    <div className="bg-white rounded-3xl border border-accent-green-dark p-4 sm:p-5 lg:p-6 xl:p-8">
      <div className="border-b border-input-border pb-3 mb-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-primary font-heading">Innovation Request Details</h2>
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
        <div className="space-y-8 sm:space-y-10">
          <div className="form-section">
            <div className="form-section-header">Defining the Problem</div>
            
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div>
                <label className="form-label">Title of the Problem Statement<span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className={inputClass(errors.problemTitle)} 
                  placeholder="Your Answer"
                  readOnly={!isEditMode} 
                  {...register('problemTitle')} 
                />
                {errors.problemTitle && <p className="text-red-500 text-xs mt-1">{errors.problemTitle.message}</p>}
              </div>

              <div>
                <label className="form-label">Describe your problem statement in brief<span className="text-red-500">*</span></label>
                <div className="relative">
                  <textarea 
                    rows={4} 
                    className={`${inputClass(errors.problemDescription)} resize-none`} 
                    maxLength={3000}
                    placeholder="Your Answer"
                    readOnly={!isEditMode} 
                    {...register('problemDescription')} 
                  />
                  {isEditMode && (
                    <div className="absolute bottom-3 right-3 text-xs text-placeholder font-body">
                      {(problemDescription || '').length}/3000
                    </div>
                  )}
                </div>
                {errors.problemDescription && <p className="text-red-500 text-xs mt-1">{errors.problemDescription.message}</p>}
              </div>

              <div>
                <label className="form-label">For which regions are you submitting this problem statement?<span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <LocationGroup 
                    control={control}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    stateName="regionState"
                    districtName="regionDistrict"
                    showLabels={false}
                    isDisabled={!isEditMode}
                  />
                  <input 
                    type="text" 
                    className={inputClass(errors.regionVillage)} 
                    placeholder="Village/City" 
                    readOnly={!isEditMode} 
                    {...register('regionVillage')} 
                  />
                </div>
                {errors.regionVillage && <p className="text-red-500 text-xs mt-1">{errors.regionVillage.message}</p>}
              </div>

              <div>
                <label className="form-label">Which of the following verticals is your problem statement from?<span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                  {PROBLEM_CATEGORY_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        value={opt.value} 
                        disabled={!isEditMode} 
                        {...register('category')} 
                        className="w-4 h-4 text-accent-green-dark focus:ring-accent-green disabled:opacity-100" 
                      />
                      <span className="radio-label">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                {category === 'others' && (
                  <div className="mt-2">
                    <input 
                      type="text" 
                      className={`${inputClass(errors.categoryOther)} border-b border-0 border-b-gray-400 rounded-none px-0`} 
                      placeholder="Please specify" 
                      readOnly={!isEditMode} 
                      {...register('categoryOther')} 
                    />
                    {errors.categoryOther && <p className="text-red-500 text-xs mt-1">{errors.categoryOther.message}</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">For which stage of this value chain are you looking for the machine?<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {PROBLEM_SUBCATEGORY_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={valueChainStages.includes(opt.value)}
                          disabled={!isEditMode} 
                          onChange={() => handleCheckboxToggle('valueChainStages', opt.value)}
                          className="w-4 h-4 rounded border-gray-300 text-accent-green-dark focus:ring-accent-green disabled:opacity-100" 
                        />
                        <span className="radio-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.valueChainStages && <p className="text-red-500 text-xs mt-1">{errors.valueChainStages.message}</p>}
                </div>
                <div>
                  <label className="form-label">What crops or raw materials or any other elements are you looking to be covered by a machine?<span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className={inputClass(errors.crops)} 
                    placeholder="Your Answer" 
                    readOnly={!isEditMode} 
                    {...register('crops')} 
                  />
                  {errors.crops && <p className="text-red-500 text-xs mt-1">{errors.crops.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Mention all the operations that are being undertaken for this crop/raw material<span className="text-red-500">*</span></label>
                  <Controller
                    name="operationsUndertaken"
                    control={control}
                    render={({ field }) => (
                      <FormSelectAndAdd
                        {...field}
                        value={operationOptions.filter(opt => field.value?.includes(opt.value))}
                        onChange={(selected) => field.onChange(selected ? selected.map(opt => opt.value) : [])}
                        options={operationOptions}
                        onOptionsChange={setOperationOptions}
                        isMulti
                        isSearchable
                        isDisabled={!isEditMode}
                        maxSelections={10}
                        placeholder="Select or type to add operations..."
                        className={errors.operationsUndertaken ? 'border-red-500 rounded' : ''}
                      />
                    )}
                  />
                  {errors.operationsUndertaken && <p className="text-red-500 text-xs mt-1">{errors.operationsUndertaken.message}</p>}
                </div>
                <div>
                  <label className="form-label">Which operations are you trying to cover with a machine?<span className="text-red-500">*</span></label>
                  <Controller
                    name="machineOperations"
                    control={control}
                    render={({ field }) => (
                      <FormSelectAndAdd
                        {...field}
                        value={operationOptions.filter(opt => field.value?.includes(opt.value))}
                        onChange={(selected) => field.onChange(selected ? selected.map(opt => opt.value) : [])}
                        options={operationOptions}
                        onOptionsChange={setOperationOptions}
                        isMulti
                        isSearchable
                        isDisabled={!isEditMode}
                        maxSelections={10}
                        placeholder="Select or type to add operations..."
                        className={errors.machineOperations ? 'border-red-500 rounded' : ''}
                      />
                    )}
                  />
                  {errors.machineOperations && <p className="text-red-500 text-xs mt-1">{errors.machineOperations.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">What is the current methodology for this operation(s) and what are the challenges with it?<span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className={inputClass(errors.currentMethodology)} 
                  placeholder="Your Answer" 
                  readOnly={!isEditMode} 
                  {...register('currentMethodology')} 
                />
                {errors.currentMethodology && <p className="text-red-500 text-xs mt-1">{errors.currentMethodology.message}</p>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">Defining the Tech/Machine Requirements</div>
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Do you know of any machinery for this problem statement?<span className="text-red-500">*</span></label>
                  <div className="flex gap-6 mt-2">
                    {YES_NO_OPTIONS.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          value={opt.value} 
                          disabled={!isEditMode} 
                          {...register('knowMachinery')} 
                          className="w-4 h-4 text-accent-green-dark focus:ring-accent-green disabled:opacity-100" 
                        />
                        <span className="radio-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.knowMachinery && <p className="text-red-500 text-xs mt-1">{errors.knowMachinery.message}</p>}
                </div>
                <div className={knowMachinery !== 'yes' ? "opacity-50" : ""}>
                  <label className="form-label">If yes, what has been the challenge of accessing or using that machine?<span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className={inputClass(errors.machineChallenge)} 
                    placeholder="Your Answer" 
                    readOnly={!isEditMode || knowMachinery !== 'yes'} 
                    {...register('machineChallenge')} 
                  />
                  {errors.machineChallenge && knowMachinery === 'yes' && <p className="text-red-500 text-xs mt-1">{errors.machineChallenge.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">What source of energy will you prefer for the machine?<span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {POWER_SOURCE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={energySource.includes(opt.value)} 
                        disabled={!isEditMode} 
                        onChange={() => handleCheckboxToggle('energySource', opt.value)}
                        className="w-4 h-4 rounded border-gray-300 text-accent-green-dark focus:ring-accent-green disabled:opacity-100" 
                      />
                      <span className="radio-label">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.energySource && <p className="text-red-500 text-xs mt-1">{errors.energySource.message}</p>}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(energySource.includes('manual') || energySource.includes('bullock')) && (
                  <div>
                    <label className="form-label text-sm">What is the Pull capacity of the machine? (Click Checkbox, if not known)<span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className={`${inputClass(errors.pullCapacity)} ${pullCapacityNotKnown ? 'opacity-50' : ''}`} 
                      placeholder="Your Answer"
                      readOnly={!isEditMode || pullCapacityNotKnown} 
                      {...register('pullCapacity')} 
                    />
                    <label className="flex items-center gap-2 mt-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        disabled={!isEditMode} 
                        {...register('pullCapacityNotKnown')} 
                        className="w-4 h-4 rounded border-gray-300 text-accent-green-dark disabled:opacity-100" 
                      />
                      <span className="text-xs text-placeholder">Not known</span>
                    </label>
                    {errors.pullCapacity && !pullCapacityNotKnown && <p className="text-red-500 text-xs mt-1">{errors.pullCapacity.message}</p>}
                  </div>
                )}
                {energySource.includes('renewable') && (
                  <div>
                    <label className="form-label text-sm">Select renewable energy type<span className="text-red-500">*</span></label>
                    <Controller
                      name="renewableType"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          value={RENEWABLE_ENERGY_OPTIONS.find(opt => opt.value === field.value) || null}
                          onChange={(selected) => field.onChange(selected ? selected.value : '')}
                          options={RENEWABLE_ENERGY_OPTIONS}
                          placeholder="Select type..."
                          isDisabled={!isEditMode}
                          className={errors.renewableType ? 'border-red-500 rounded' : ''}
                        />
                      )}
                    />
                    {errors.renewableType && <p className="text-red-500 text-xs mt-1">{errors.renewableType.message}</p>}
                  </div>
                )}
                {energySource.includes('petrol_diesel') && (
                  <div>
                    <label className="form-label text-sm">What is the engine capacity?<span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className={inputClass(errors.engineCapacity)} 
                      placeholder="motor size / engine cc / RPM etc" 
                      readOnly={!isEditMode} 
                      {...register('engineCapacity')} 
                    />
                    {errors.engineCapacity && <p className="text-red-500 text-xs mt-1">{errors.engineCapacity.message}</p>}
                  </div>
                )}
                {(energySource.includes('electrical') || energySource.includes('renewable')) && (
                  <div>
                    <label className="form-label text-sm">What is the motor capacity (in HP)?<span className="text-red-500">*</span></label>
                    <input 
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

              <div>
                <label className="form-label">Provide any other specific information for the usage of the machine</label>
                <input 
                  type="text" 
                  className={inputClass(errors.specificInfo)} 
                  placeholder="Your Answer" 
                  readOnly={!isEditMode} 
                  {...register('specificInfo')} 
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">Market Understanding</div>
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div>
                <label className="form-label mb-1">How big is this problem statement in your area?<span className="text-red-500">*</span></label>
                <p className="text-xs sm:text-sm text-gray-500 italic mb-2">(Add an estimate of number of people or exact machines required)</p>
                <input 
                  type="text" 
                  className={inputClass(errors.problemSize)} 
                  placeholder="Your Answer" 
                  readOnly={!isEditMode} 
                  {...register('problemSize')} 
                />
                {errors.problemSize && <p className="text-red-500 text-xs mt-1">{errors.problemSize.message}</p>}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">What end products are being sold?<span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className={inputClass(errors.endProducts)} 
                    placeholder="Your Answer" 
                    readOnly={!isEditMode} 
                    {...register('endProducts')} 
                  />
                  {errors.endProducts && <p className="text-red-500 text-xs mt-1">{errors.endProducts.message}</p>}
                </div>
                <div>
                  <label className="form-label">What are the sales channels?<span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className={inputClass(errors.salesChannels)} 
                    placeholder="Your Answer" 
                    readOnly={!isEditMode} 
                    {...register('salesChannels')} 
                  />
                  {errors.salesChannels && <p className="text-red-500 text-xs mt-1">{errors.salesChannels.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">Is the organization (AO) introducing new sales channels?<span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className={inputClass(errors.newChannels)} 
                  placeholder="Your Answer" 
                  readOnly={!isEditMode} 
                  {...register('newChannels')} 
                />
                {errors.newChannels && <p className="text-red-500 text-xs mt-1">{errors.newChannels.message}</p>}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">What is the current annual revenue?<span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className={inputClass(errors.currentRevenue)} 
                    placeholder="Your Answer" 
                    readOnly={!isEditMode} 
                    {...register('currentRevenue')} 
                  />
                  {errors.currentRevenue && <p className="text-red-500 text-xs mt-1">{errors.currentRevenue.message}</p>}
                </div>
                <div>
                  <label className="form-label">What is the expected revenue after mechanization?<span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className={inputClass(errors.expectedRevenue)} 
                    placeholder="Your Answer" 
                    readOnly={!isEditMode} 
                    {...register('expectedRevenue')} 
                  />
                  {errors.expectedRevenue && <p className="text-red-500 text-xs mt-1">{errors.expectedRevenue.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">What is the budget of the innovation requirement?<span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className={inputClass(errors.machineBudget)} 
                  placeholder="Your Answer" 
                  readOnly={!isEditMode} 
                  {...register('machineBudget')} 
                />
                {errors.machineBudget && <p className="text-red-500 text-xs mt-1">{errors.machineBudget.message}</p>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">Uploads</div>
            <div className={`mt-4 border-2 border-dashed border-accent-green-dark rounded-3xl bg-light overflow-hidden ${!isEditMode ? 'pointer-events-none' : ''} ${errors.uploadedImage ? 'border-red-500' : ''}`}>
              {imagePreview ? (
                <div className="relative w-full h-64 flex items-center justify-center">
                  <img src={imagePreview} alt="Problem" className="w-full h-full object-contain" />
                  {isEditMode && (
                    <button 
                      type="button" 
                      onClick={handleRemoveImage} 
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-red-500 cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center p-8 w-full h-full">
                  <input type="file" className="hidden" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileUpload} />
                  <div className="mb-4 w-12 h-12 flex items-center justify-center bg-header rounded-lg border border-input-border">
                    <img src={folderIcon} alt="" className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-placeholder mb-4">
                    Drag and drop your image here or <span className="text-accent-green-dark underline">choose</span>
                  </p>
                  <div className="px-6 py-2 bg-button-dark text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors font-heading">Upload Image</div>
                </label>
              )}
            </div>
            {errors.uploadedImage && <p className="text-red-500 text-xs mt-1">{errors.uploadedImage.message}</p>}
          </div>
        </div>
      </form>
    </div>
  );
});

InnovationRequestForm.displayName = 'InnovationRequestForm';

export default InnovationRequestForm;
