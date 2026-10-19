import { useEffect, useRef, useState } from 'react';
import PageLoader from '../../../../components/ui/PageLoader';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import FormSelect from '../../../../components/ui/FormSelect';
import FormSelectAndAdd from '../../../../components/ui/FormSelectAndAdd';
import LocationGroup from '../../../../components/ui/LocationGroup';
import folderIcon from '../../../../assets/icons/folderIcon.svg';
import { innovationRequestSchema } from '../../../../schemas/problemSchema';
import {
  POWER_SOURCE_OPTIONS,
  RENEWABLE_ENERGY_OPTIONS,
  YES_NO_OPTIONS,
  AGRICULTURAL_OPERATIONS_OPTIONS
} from '../../../../utils/constants/innovationConstants';
import {
  PROBLEM_CATEGORY_OPTIONS,
  PROBLEM_SUBCATEGORY_OPTIONS,
  NEW_CHANNEL_OPTIONS,
  withLegacyOption
} from '../../../../utils/constants/problemConstants';
import {
  useCreateProblem,
  useSubmitProblemForApproval,
  useUpdateProblem,
} from '../../../../hooks/mutations/common';
import { useGetProblemById } from '../../../../hooks/queries/common';
import { useOperations } from '../../../../hooks/queries/public';

const InnovationRequestForm = ({ id }) => {
  const navigate = useNavigate();
  const isEditMode = !!id;
  const submitIntentRef = useRef('submit');
  const createProblemMutation = useCreateProblem();
  const updateProblemMutation = useUpdateProblem();
  const submitProblemMutation = useSubmitProblemForApproval();
  const { data: problemData, isLoading: isFetching } = useGetProblemById(id);
  const { data: fetchedOperations } = useOperations();
  const [existingCoverUrl, setExistingCoverUrl] = useState(null);
  const removeCoverImageRef = useRef(false);

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
    defaultValues: {
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
      uploadedImage: null
    }
  });

  const [operationOptions, setOperationOptions] = useState(AGRICULTURAL_OPERATIONS_OPTIONS);

  // Sync operations from DB; preserve any custom options already added (e.g. from edit mode)
  useEffect(() => {
    if (fetchedOperations?.length > 0) {
      setOperationOptions(prev => {
        const fetchedValues = fetchedOperations.map(o => o.value);
        const customOps = prev.filter(o => !fetchedValues.includes(o.value));
        return [...fetchedOperations, ...customOps];
      });
    }
  }, [fetchedOperations]);

  const category = watch('category');
  const knowMachinery = watch('knowMachinery');
  const valueChainStages = watch('valueChainStages');
  const energySource = watch('energySource');
  const pullCapacityNotKnown = watch('pullCapacityNotKnown');
  const problemDescription = watch('problemDescription') || '';
  const uploadedImage = watch('uploadedImage');
  const [imagePreview, setImagePreview] = useState(null);

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
    if (uploadedImage) {
      const url = URL.createObjectURL(uploadedImage);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [uploadedImage]);

  useEffect(() => {
    if (!isEditMode || !problemData) return;
    const p = problemData.data.problem;
    setExistingCoverUrl(p.coverImage || null);
    removeCoverImageRef.current = false;
    reset({
      problemTitle: p.problemTitle ?? '',
      problemDescription: p.problemDescription ?? '',
      regionState: p.regionState ?? '',
      regionDistrict: p.regionDistrict ?? '',
      regionVillage: p.regionVillage ?? '',
      category: p.category === '' && p.categoryOther ? 'others' : (p.category ?? ''),
      categoryOther: p.categoryOther ?? '',
      valueChainStages: p.valueChainStages ?? [],
      crops: p.crops ?? '',
      operationsUndertaken: p.operationsUndertaken ?? [],
      machineOperations: p.machineOperations ?? [],
      currentMethodology: p.currentMethodology ?? '',
      knowMachinery: p.knowMachinery ?? null,
      machineChallenge: p.machineChallenge ?? '',
      energySource: p.energySource ?? [],
      pullCapacity: p.pullCapacity ?? '',
      pullCapacityNotKnown: (p.energySource?.includes('manual') || p.energySource?.includes('bullock')) && !p.pullCapacity,
      engineCapacity: p.engineCapacity ?? '',
      motorCapacity: p.motorCapacity ?? '',
      renewableType: p.renewableType ?? '',
      specificInfo: p.specificInfo ?? '',
      problemSize: p.problemSize ?? '',
      endProducts: p.endProducts ?? '',
      salesChannels: p.salesChannels ?? '',
      newChannels: p.newChannels ?? '',
      currentRevenue: p.currentRevenue != null ? String(p.currentRevenue) : '',
      expectedRevenue: p.expectedRevenue != null ? String(p.expectedRevenue) : '',
      machineBudget: p.machineBudget != null ? String(p.machineBudget) : '',
      uploadedImage: null,
    });
  }, [isEditMode, problemData, reset]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images are supported');
      e.target.value = '';
      return;
    }

    // Validate file size (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image size must be less than 10MB');
      e.target.value = '';
      return;
    }

    // If validation passes, set the file
    setValue('uploadedImage', file, { shouldValidate: true });
    setExistingCoverUrl(null);
    toast.success('Image uploaded!');
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    setValue('uploadedImage', null, { shouldValidate: true });
    setExistingCoverUrl(null);
    removeCoverImageRef.current = true;
  };

  const handleCheckboxToggle = (field, value) => {
    const currentValues = watch(field) || [];
    if (currentValues.includes(value)) {
      setValue(field, currentValues.filter(v => v !== value), { shouldValidate: true });
    } else {
      setValue(field, [...currentValues, value], { shouldValidate: true });
    }
  };

  const buildFormData = (data) => {
    const fd = new FormData();
    const stringFields = [
      'problemTitle', 'problemDescription', 'regionState', 'regionDistrict',
      'regionVillage', 'category', 'categoryOther', 'crops', 'currentMethodology',
      'knowMachinery', 'machineChallenge', 'pullCapacity', 'engineCapacity',
      'motorCapacity', 'renewableType', 'specificInfo', 'problemSize',
      'endProducts', 'salesChannels', 'newChannels',
    ];
    stringFields.forEach(field => {
      if (data[field] != null) fd.append(field, data[field]);
    });
    ['currentRevenue', 'expectedRevenue', 'machineBudget'].forEach(field => {
      if (data[field] != null) fd.append(field, String(data[field]));
    });
    ['valueChainStages', 'operationsUndertaken', 'machineOperations', 'energySource'].forEach(field => {
      fd.append(field, JSON.stringify(data[field]));
    });
    if (data.uploadedImage) {
      fd.append('cover', data.uploadedImage);
      removeCoverImageRef.current = false;
    } else if (isEditMode && removeCoverImageRef.current) {
      fd.append('removeCoverImage', 'true');
    }
    return fd;
  };

  const onFormSubmit = async (data) => {
    try {
      const fd = buildFormData(data);

      if (isEditMode) {
        await updateProblemMutation.mutateAsync({ id, formData: fd });
        if (submitIntentRef.current === 'submit') {
          await submitProblemMutation.mutateAsync(id);
          toast.success('Problem updated and submitted for review!');
        } else {
          toast.success('Draft updated successfully!');
        }
      } else {
        const result = await createProblemMutation.mutateAsync(fd);
        const problemId = result.data.problem._id;
        if (submitIntentRef.current === 'submit') {
          await submitProblemMutation.mutateAsync(problemId);
          toast.success('Problem submitted for review!');
        } else {
          toast.success('Draft saved successfully!');
        }
      }
      navigate('/my-problem-statements');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Submission failed');
    }
  };

  const handleSaveDraft = () => {
    submitIntentRef.current = 'draft';
    handleSubmit(onFormSubmit)();
  };


  if (isEditMode && isFetching) {
    return <PageLoader />;
  }

  return (
    <div className=" pb-8 sm:pb-10 lg:pb-12">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        
        {/* Section 1: Defining the Problem */}
        <div className="form-section">
          <div className="form-section-header">Defining the Problem</div>
          
          <div className="mt-4 space-y-5 sm:space-y-6 lg:space-y-8">
            <div>
              <label htmlFor="problemTitle" className="form-label">Title of the Problem Statement<span className="text-red-500">*</span></label>
              <input id="problemTitle" type="text" {...register('problemTitle')} className={`form-input ${errors.problemTitle ? 'border-red-500' : ''}`} placeholder="Your Answer" />
              {errors.problemTitle && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.problemTitle.message}</p>}
            </div>

            <div>
              <label htmlFor="problemDescription" className="form-label">Describe your problem statement in brief<span className="text-red-500">*</span></label>
              <div className="relative">
                <textarea id="problemDescription" {...register('problemDescription')} rows={4} maxLength={3000} className={`form-input resize-none ${errors.problemDescription ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-xs sm:text-sm text-placeholder">{problemDescription.length}/3000</div>
              </div>
              {errors.problemDescription && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.problemDescription.message}</p>}
            </div>

            <div>
              <label className="form-label">For which regions are you submitting this problem statement?<span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <LocationGroup 
                  control={control}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  stateName="regionState"
                  districtName="regionDistrict"
                  showLabels={false}
                />
                <div className="flex flex-col">
                  <input id="regionVillage" type="text" {...register('regionVillage')} className={`form-input ${errors.regionVillage ? 'border-red-500' : ''}`} placeholder="Village/City" />
                  {errors.regionVillage && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.regionVillage.message}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Which of the following verticals is your problem statement from?<span className="text-red-500">*</span></label>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-3">
                {PROBLEM_CATEGORY_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value={option.value} {...register('category')} className="w-4 h-4 text-accent-green-dark focus:ring-accent-green" />
                    <span className="radio-label">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.category.message}</p>}
              {category === 'others' && (
                <div className="mt-3">
                  <input type="text" {...register('categoryOther')} className={`form-input border-b border-0 border-b-gray-400 rounded-none px-0 ${errors.categoryOther ? 'border-b-red-500' : ''}`} placeholder="Please specify" />
                  {errors.categoryOther && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.categoryOther.message}</p>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:gap-8">
              <div>
                <label className="form-label">For which stage of this value chain are you looking for the machine?<span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-6 mt-3">
                  {PROBLEM_SUBCATEGORY_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={valueChainStages.includes(option.value)} onChange={() => handleCheckboxToggle('valueChainStages', option.value)} className="w-4 h-4 text-accent-green-dark focus:ring-accent-green rounded" />
                      <span className="radio-label">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.valueChainStages && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.valueChainStages.message}</p>}
              </div>
              
              <div>
                <label htmlFor="crops" className="form-label">What crops or raw materials or any other elements are you looking to be covered by a machine?<span className="text-red-500">*</span></label>
                <input id="crops" type="text" {...register('crops')} className={`form-input ${errors.crops ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                {errors.crops && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.crops.message}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Mention all the operations that are being undertaken for this crop/raw material<span className="text-red-500">*</span></label>
              <Controller
                name="operationsUndertaken"
                control={control}
                render={({ field }) => (
                  <FormSelectAndAdd
                    {...field}
                    value={operationOptions.filter(opt => field.value.includes(opt.value))}
                    onChange={(selected) => field.onChange(selected ? selected.map(opt => opt.value) : [])}
                    options={operationOptions}
                    onOptionsChange={setOperationOptions}
                    placeholder="Select or type to add operations..."
                    isMulti={true}
                    isSearchable={true}
                    maxSelections={10}
                    className={errors.operationsUndertaken ? 'border-red-500 rounded' : ''}
                  />
                )}
              />
              {errors.operationsUndertaken && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.operationsUndertaken.message}</p>}
            </div>

            <div>
              <label className="form-label">Which operations are you trying to cover with a machine?<span className="text-red-500">*</span></label>
              <Controller
                name="machineOperations"
                control={control}
                render={({ field }) => (
                  <FormSelectAndAdd
                    {...field}
                    value={operationOptions.filter(opt => field.value.includes(opt.value))}
                    onChange={(selected) => field.onChange(selected ? selected.map(opt => opt.value) : [])}
                    options={operationOptions}
                    onOptionsChange={setOperationOptions}
                    placeholder="Select or type to add operations..."
                    isMulti={true}
                    isSearchable={true}
                    maxSelections={10}
                    className={errors.machineOperations ? 'border-red-500 rounded' : ''}
                  />
                )}
              />
              {errors.machineOperations && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.machineOperations.message}</p>}
            </div>

            <div>
              <label htmlFor="currentMethodology" className="form-label">What is the current methodology for this operation(s) and what are the challenges with it?<span className="text-red-500">*</span></label>
              <input id="currentMethodology" type="text" {...register('currentMethodology')} className={`form-input ${errors.currentMethodology ? 'border-red-500' : ''}`} placeholder="Your Answer" />
              {errors.currentMethodology && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.currentMethodology.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Tech/Machine Requirements */}
        <div className="form-section">
          <div className="form-section-header">Defining the Tech/Machine Requirements</div>
          <div className="mt-4 space-y-5 sm:space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              <div>
                <label className="form-label">Do you know of any machinery for this problem statement?<span className="text-red-500">*</span></label>
                <div className="flex gap-6 mt-3">
                  {YES_NO_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                      <input type="radio" value={opt.value} {...register('knowMachinery')} className="w-4 h-4 text-accent-green-dark focus:ring-accent-green" />
                      <span className="radio-label">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.knowMachinery && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.knowMachinery.message}</p>}
              </div>

              <div className={knowMachinery !== 'yes' ? 'opacity-50' : ''}>
                <label className="form-label">If yes, what has been the challenge of accessing or using that machine?<span className="text-red-500">*</span></label>
                <input type="text" {...register('machineChallenge')} className={`form-input ${errors.machineChallenge && knowMachinery === 'yes' ? 'border-red-500' : ''}`} placeholder="Your Answer" disabled={knowMachinery !== 'yes'} />
                {errors.machineChallenge && knowMachinery === 'yes' && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.machineChallenge.message}</p>}
              </div>

              <div className="lg:col-span-2">
                <label className="form-label">What source of energy will you prefer for the machine?<span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4 mt-3">
                  {POWER_SOURCE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={energySource.includes(opt.value)} onChange={() => handleCheckboxToggle('energySource', opt.value)} className="w-4 h-4 text-accent-green-dark focus:ring-accent-green rounded" />
                      <span className="radio-label">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.energySource && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.energySource.message}</p>}
              </div>

              {(energySource.includes('manual') || energySource.includes('bullock')) && (
                <div>
                  <label htmlFor="pullCapacity" className="form-label">What is the Pull capacity of the machine? (Click Checkbox, if not known)<span className="text-red-500">*</span></label>
                  <input id="pullCapacity" type="text" {...register('pullCapacity')} className={`form-input ${errors.pullCapacity && !pullCapacityNotKnown ? 'border-red-500' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`} placeholder="Your Answer" disabled={pullCapacityNotKnown} />
                  <div className="mt-2 flex items-center gap-2">
                    <input type="checkbox" id="pullCapacityNotKnown" className="w-4 h-4 rounded border-gray-300 text-accent-green-dark focus:ring-accent-green-dark" {...register('pullCapacityNotKnown')} />
                    <label htmlFor="pullCapacityNotKnown" className="text-sm text-gray-500 cursor-pointer">Not known</label>
                  </div>
                  {errors.pullCapacity && !pullCapacityNotKnown && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.pullCapacity.message}</p>}
                </div>
              )}

              {energySource.includes('renewable') && (
                <div>
                  <label className="form-label">Select renewable energy type<span className="text-red-500">*</span></label>
                  <Controller
                    name="renewableType"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        value={RENEWABLE_ENERGY_OPTIONS.find(opt => opt.value === field.value) || null}
                        onChange={(selected) => field.onChange(selected ? selected.value : '')}
                        options={RENEWABLE_ENERGY_OPTIONS}
                        placeholder="Select type..."
                        className={errors.renewableType ? 'border-red-500 rounded' : ''}
                      />
                    )}
                  />
                  {errors.renewableType && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.renewableType.message}</p>}
                </div>
              )}

              {energySource.includes('petrol_diesel') && (
                <div>
                  <label htmlFor="engineCapacity" className="form-label">What is the engine capacity?<span className="text-red-500">*</span></label>
                  <input id="engineCapacity" type="text" {...register('engineCapacity')} className={`form-input ${errors.engineCapacity ? 'border-red-500' : ''}`} placeholder="motor size / engine cc / RPM etc" />
                  {errors.engineCapacity && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.engineCapacity.message}</p>}
                </div>
              )}

              {(energySource.includes('electrical') || energySource.includes('renewable')) && (
                <div>
                  <label htmlFor="motorCapacity" className="form-label">What is the motor capacity (in HP)?<span className="text-red-500">*</span></label>
                  <input id="motorCapacity" type="text" {...register('motorCapacity')} className={`form-input ${errors.motorCapacity ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                  {errors.motorCapacity && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.motorCapacity.message}</p>}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="specificInfo" className="form-label">Provide any other specific information for the usage of the machine</label>
              <input id="specificInfo" type="text" {...register('specificInfo')} className="form-input" placeholder="Your Answer" />
            </div>
          </div>
        </div>

        {/* Section 3: Market Understanding */}
        <div className="form-section">
          <div className="form-section-header">Market Understanding</div>
          <div className="mt-4 space-y-5 sm:space-y-6 lg:space-y-8">
            <div>
              <label htmlFor="problemSize" className="form-label mb-1">How big is this problem statement in your area?<span className="text-red-500">*</span></label>
              <p className="text-xs sm:text-sm text-gray-500 italic mb-2">(Add an estimate of number of people or exact machines required)</p>
              <input id="problemSize" type="text" {...register('problemSize')} className={`form-input ${errors.problemSize ? 'border-red-500' : ''}`} placeholder="Your Answer" />
              {errors.problemSize && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.problemSize.message}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              <div>
                <label htmlFor="endProducts" className="form-label">What end products are being sold?<span className="text-red-500">*</span></label>
                <input id="endProducts" type="text" {...register('endProducts')} className={`form-input ${errors.endProducts ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                {errors.endProducts && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.endProducts.message}</p>}
              </div>
              <div>
                <label htmlFor="salesChannels" className="form-label">What are the sales channels?<span className="text-red-500">*</span></label>
                <input id="salesChannels" type="text" {...register('salesChannels')} className={`form-input ${errors.salesChannels ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                {errors.salesChannels && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.salesChannels.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="newChannels" className="form-label">Is the organization (AO) introducing new sales channels?<span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-6 mt-3">
                {withLegacyOption(NEW_CHANNEL_OPTIONS, watch('newChannels')).map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                    <input type="radio" value={opt.value} {...register('newChannels')} className="w-4 h-4 text-accent-green-dark focus:ring-accent-green" />
                    <span className="radio-label">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.newChannels && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.newChannels.message}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              <div>
                <label htmlFor="currentRevenue" className="form-label">What is the current annual revenue?<span className="text-red-500">*</span></label>
                <input id="currentRevenue" type="text" {...register('currentRevenue')} className={`form-input ${errors.currentRevenue ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                {errors.currentRevenue && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.currentRevenue.message}</p>}
              </div>
              <div>
                <label htmlFor="expectedRevenue" className="form-label">What is the expected revenue after mechanization?<span className="text-red-500">*</span></label>
                <input id="expectedRevenue" type="text" {...register('expectedRevenue')} className={`form-input ${errors.expectedRevenue ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                {errors.expectedRevenue && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.expectedRevenue.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="machineBudget" className="form-label">What is the budget of the innovation requirement?<span className="text-red-500">*</span></label>
              <input id="machineBudget" type="text" {...register('machineBudget')} className={`form-input ${errors.machineBudget ? 'border-red-500' : ''}`} placeholder="Your Answer" />
              {errors.machineBudget && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.machineBudget.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 4: Uploads */}
        <div className="form-section">
          <div className="form-section-header">Uploads</div>
          <div className="mt-6 border-2 border-dashed border-accent-green-dark rounded-[20px] bg-light overflow-hidden">
            <input type="file" id="uploadedImage" className="hidden" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileUpload} />
            {(imagePreview || existingCoverUrl) ? (
              <div className="relative w-full h-64 sm:h-80 flex items-center justify-center bg-gray-50">
                  <img src={imagePreview || existingCoverUrl} alt="Preview" className="w-full h-full object-contain" />
                  <button type="button" onClick={handleRemoveImage} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 transition-colors cursor-pointer" title="Remove Image">
                      <X size={20} />
                  </button>
              </div>
            ) : (
              <label htmlFor="uploadedImage" className="cursor-pointer flex flex-col items-center justify-center p-8 sm:p-12 w-full h-full">
                  <div className="mb-4 w-12 h-12 flex items-center justify-center bg-header rounded-lg border border-input-border">
                     <img src={folderIcon} alt="" className="w-8 h-8" />
                  </div>
                  <p className="text-sm sm:text-base text-placeholder mb-4">
                    Drag and drop your image here or <label htmlFor="uploadedImage" className="text-accent-green-dark underline cursor-pointer">choose</label>
                  </p>
                  <div className="px-6 py-2.5 bg-button-dark text-white text-sm sm:text-base rounded-lg hover:bg-opacity-90 transition-colors font-heading cursor-pointer">Upload Image</div>
              </label>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
          <button
            type="submit"
            onClick={() => { submitIntentRef.current = 'submit'; }}
            disabled={createProblemMutation.isPending || updateProblemMutation.isPending || submitProblemMutation.isPending}
            className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-button-dark text-white text-base sm:text-lg border border-accent-green rounded-xl hover:bg-primary transition-colors font-medium cursor-pointer font-heading disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createProblemMutation.isPending || updateProblemMutation.isPending || submitProblemMutation.isPending ? 'Submitting...' : 'Submit Problem'}
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={createProblemMutation.isPending || updateProblemMutation.isPending}
            className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-accent-green-dark text-white text-base sm:text-lg border border-accent-green rounded-xl hover:bg-accent-green transition-colors font-medium cursor-pointer font-heading disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save as Draft
          </button>
          <button type="button" onClick={() => navigate(-1)} className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-muted text-base sm:text-lg border border-input-border rounded-xl hover:bg-header transition-colors font-medium cursor-pointer font-heading">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default InnovationRequestForm;