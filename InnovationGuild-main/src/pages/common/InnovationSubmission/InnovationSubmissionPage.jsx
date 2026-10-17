import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { selectUser } from '../../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { useCreateInnovation, useSubmitInnovationForApproval, useUpdateInnovation } from '../../../hooks/mutations/innovator';
import { useGetInnovationById } from '../../../hooks/queries/innovator';
import { useOperations } from '../../../hooks/queries/public';
import PageHeader from '../../../components/ui/PageHeader';
import FormSelect from '../../../components/ui/FormSelect';
import FormSelectAndAdd from '../../../components/ui/FormSelectAndAdd';
import InnovationMediaUpload from './_components/InnovationMediaUpload.jsx';
import AiImportPanel from './_components/AiImportPanel.jsx';
import { getStateOptions } from '../../../utils/LocationData/locationData';
import { innovationSchema } from '../../../schemas/innovationSchema';
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

// Reverse-transform {min, max} → "min-max" string (or "min" if equal)
const sellingPriceToString = (price) => {
  if (!price || (price.min == null && price.max == null)) return '';
  if (price.min === price.max) return String(price.min);
  return `${price.min}-${price.max}`;
};

const buildFormData = (data) => {
  const fd = new FormData();

  const stringFields = [
    'innovationName', 'yearLaunched', 'description',
    'categoryOther', 'subcategoryOther', 'innovationStage', 'distributorNetwork',
    'manufacturingLocation', 'importedParts', 'spareParts',
    'powerSource', 'pullCapacity', 'engineCapacity', 'motorCapacity', 'renewableType',
    'dimensions', 'weight', 'attachments', 'performanceParams',
    'suitableCrops', 'suitableTerrains', 'suitableSoil', 'weatherConditions',
    'otherUsageConditions', 'maintenanceTraining', 'financingSupport',
    'technicalTraining', 'demoInstallations',
  ];

  stringFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== '') {
      fd.append(field, data[field]);
    }
  });

  ['category', 'subcategory', 'salesLocation', 'coveredOperations'].forEach(field => {
    if (data[field]?.length > 0) fd.append(field, JSON.stringify(data[field]));
  });

  if (data.sellingPrice) {
    fd.append('sellingPrice', JSON.stringify(data.sellingPrice));
  }

  const imagePositions = [];
  const videoPositions = [];
  const externalVideoData = [];
  data.mediaItems?.forEach((item, index) => {
    if (item.type === 'file') {
      if (item.fileType === 'image') {
        fd.append('images', item.file);
        imagePositions.push(index);
      } else if (item.fileType === 'video') {
        fd.append('videos', item.file);
        videoPositions.push(index);
      }
    } else if (item.type === 'url') {
      externalVideoData.push({ url: item.url, position: index });
    }
  });
  if (imagePositions.length > 0) fd.append('imagePositions', JSON.stringify(imagePositions));
  if (videoPositions.length > 0) fd.append('videoPositions', JSON.stringify(videoPositions));
  if (externalVideoData.length > 0) fd.append('externalVideoData', JSON.stringify(externalVideoData));

  data.otherDocuments?.forEach(doc => fd.append('documents', doc.file));

  return fd;
};

// Edit mode: only send NEW files; skip existing items; only send new YouTube URLs
const buildUpdateFormData = (data, originalYoutubeUrls = []) => {
  const fd = new FormData();

  const stringFields = [
    'innovationName', 'yearLaunched', 'description',
    'innovationStage', 'distributorNetwork',
    'manufacturingLocation', 'importedParts', 'spareParts',
    'powerSource', 'pullCapacity', 'engineCapacity', 'motorCapacity', 'renewableType',
    'dimensions', 'weight', 'attachments', 'performanceParams',
    'suitableCrops', 'suitableTerrains', 'suitableSoil', 'weatherConditions',
    'otherUsageConditions', 'maintenanceTraining', 'financingSupport',
    'technicalTraining', 'demoInstallations',
  ];

  stringFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== '') {
      fd.append(field, data[field]);
    }
  });
  // Always send these so the backend can explicitly clear them when 'others' is removed
  fd.append('categoryOther', data.categoryOther ?? '');
  fd.append('subcategoryOther', data.subcategoryOther ?? '');

  ['category', 'subcategory', 'salesLocation', 'coveredOperations'].forEach(field => {
    if (data[field]?.length > 0) fd.append(field, JSON.stringify(data[field]));
  });

  if (data.sellingPrice) {
    fd.append('sellingPrice', JSON.stringify(data.sellingPrice));
  }

  const imagePositions = [];
  const videoPositions = [];
  const externalVideoData = [];
  data.mediaItems?.forEach((item, index) => {
    if (item.type === 'existing') return; // already on backend, skip
    if (item.type === 'file') {
      if (item.fileType === 'image') {
        fd.append('images', item.file);
        imagePositions.push(index);
      } else if (item.fileType === 'video') {
        fd.append('videos', item.file);
        videoPositions.push(index);
      }
    } else if (item.type === 'url') {
      if (!originalYoutubeUrls.some(orig => orig.url === item.url)) {
        externalVideoData.push({ url: item.url, position: index });
      }
    }
  });
  if (imagePositions.length > 0) fd.append('imagePositions', JSON.stringify(imagePositions));
  if (videoPositions.length > 0) fd.append('videoPositions', JSON.stringify(videoPositions));
  if (externalVideoData.length > 0) fd.append('externalVideoData', JSON.stringify(externalVideoData));

  // Send new positions for ALL existing items so the backend can reorder them
  const mediaOrder = [];
  (data.mediaItems ?? []).forEach((item, index) => {
    if (item._id) mediaOrder.push({ _id: item._id, position: index });
  });
  if (mediaOrder.length > 0) fd.append('mediaOrder', JSON.stringify(mediaOrder));

  // Compute which original external URLs were removed and send their IDs for deletion
  const removedExternalVideoIds = originalYoutubeUrls
    .filter(orig => !(data.mediaItems ?? []).some(item => item.type === 'url' && item.url === orig.url))
    .map(orig => orig._id)
    .filter(Boolean);
  if (removedExternalVideoIds.length > 0) {
    fd.append('removedExternalVideoIds', JSON.stringify(removedExternalVideoIds));
  }

  data.otherDocuments?.forEach(doc => {
    if (doc.type === 'existing') return;
    fd.append('documents', doc.file);
  });

  return fd;
};

const InnovationSubmissionPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const user = useSelector(selectUser);
  const isApproved = user?.status === 'APPROVED';

  // Helper component for conditional "other" input fields
  const ConditionalOtherInput = ({ show, fieldName, placeholder, register, error }) => {
    if (!show) return null;

    return (
      <div className="mt-3 sm:mt-4">
        <input
          type="text"
          className={`form-input ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder}
          {...register(fieldName)}
        />
        {error && <p className="text-red-500 text-xs lg:text-sm mt-1">{error.message}</p>}
      </div>
    );
  };

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
    defaultValues: {
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

  const navigate = useNavigate();
  const submitIntentRef = useRef('submit');
  const originalYoutubeUrlsRef = useRef([]);
  const createMutation = useCreateInnovation();
  const updateMutation = useUpdateInnovation();
  const submitMutation = useSubmitInnovationForApproval();
  const isLoading = createMutation.isPending || updateMutation.isPending || submitMutation.isPending;

  // Edit mode: fetch existing innovation
  const { data: innovationData, isLoading: isFetching } = useGetInnovationById(id);

  const { data: fetchedOperations } = useOperations();
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

  const stateOptions = getStateOptions();
  const mediaItems = watch('mediaItems');
  const otherDocuments = watch('otherDocuments');
  const description = watch('description') || '';
  const category = watch('category') || [];
  const subcategory = watch('subcategory') || [];
  const powerSource = watch('powerSource');
  const pullCapacityNotKnown = watch('pullCapacityNotKnown');
  const importedPartsNotApplicable = watch('importedPartsNotApplicable');

  // Pre-populate form in edit mode when data loads
  useEffect(() => {
    if (!isEditMode || !innovationData) return;
    const inv = innovationData.data.innovation;

    originalYoutubeUrlsRef.current = inv.media?.videos
      ?.filter(v => v.isExternal).map(v => ({ url: v.url, _id: v._id })) ?? [];

    // Add any custom operations from the innovation that aren't in the default list
    if (inv.coveredOperations?.length > 0) {
      setOperationOptions(prev => {
        const existing = prev.map(o => o.value);
        const toAdd = inv.coveredOperations
          .filter(op => !existing.includes(op))
          .map(op => ({ value: op, label: op.charAt(0).toUpperCase() + op.slice(1) }));
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
      });
    }

    const allExistingMedia = [
      ...(inv.media?.images ?? []).map(m => ({ ...m, _kind: 'image' })),
      ...(inv.media?.videos ?? []).map(m => ({ ...m, _kind: 'video' })),
    ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const existingMediaItems = allExistingMedia.map(item => {
      if (item._kind === 'image') {
        return { type: 'existing', fileType: 'image', url: item.url, _id: item._id, name: item.filename };
      }
      if (item.isExternal) {
        return { type: 'url', url: item.url, _id: item._id };
      }
      return { type: 'existing', fileType: 'video', url: item.url, _id: item._id, name: item.filename };
    });

    reset({
      innovationName: inv.innovationName ?? '',
      yearLaunched: inv.yearLaunched ? String(inv.yearLaunched) : '',
      description: inv.description ?? '',
      category: [...(inv.category ?? []), ...(inv.categoryOther ? ['others'] : [])],
      categoryOther: inv.categoryOther ?? '',
      subcategory: [...(inv.subcategory ?? []), ...(inv.subcategoryOther ? ['others'] : [])],
      subcategoryOther: inv.subcategoryOther ?? '',
      innovationStage: inv.innovationStage ?? '',
      salesLocation: inv.salesLocation ?? [],
      distributorNetwork: inv.distributorNetwork ?? '',
      sellingPrice: sellingPriceToString(inv.sellingPrice),
      manufacturingLocation: inv.manufacturingLocation ?? '',
      importedParts: inv.importedParts ?? '',
      importedPartsNotApplicable: !inv.importedParts,
      spareParts: inv.spareParts ?? '',
      powerSource: inv.powerSource ?? '',
      pullCapacity: inv.pullCapacity ?? '',
      pullCapacityNotKnown: !inv.pullCapacity && ['manual', 'bullock'].includes(inv.powerSource),
      engineCapacity: inv.engineCapacity ?? '',
      motorCapacity: inv.motorCapacity ?? '',
      renewableType: inv.renewableType ?? '',
      dimensions: inv.dimensions ?? '',
      weight: inv.weight ?? '',
      attachments: inv.attachments ?? '',
      performanceParams: inv.performanceParams ?? '',
      coveredOperations: inv.coveredOperations ?? [],
      suitableCrops: inv.suitableCrops ?? '',
      suitableTerrains: inv.suitableTerrains ?? '',
      suitableSoil: inv.suitableSoil ?? '',
      weatherConditions: inv.weatherConditions ?? '',
      otherUsageConditions: inv.otherUsageConditions ?? '',
      maintenanceTraining: inv.maintenanceTraining ?? '',
      financingSupport: inv.financingSupport ?? '',
      technicalTraining: inv.technicalTraining ?? '',
      demoInstallations: inv.demoInstallations ?? '',
      mediaItems: existingMediaItems,
      otherDocuments: (inv.downloadableResources ?? []).map(doc => ({
        type: 'existing',
        _id: doc._id,
        id: doc._id,
        name: doc.filename,
        size: doc.size,
        url: doc.url,
      })),
    });
  }, [isEditMode, innovationData, reset]);

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

    if (powerSource !== 'manual' && powerSource !== 'bullock') {
      setValue('pullCapacity', '', { shouldValidate: true });
      setValue('pullCapacityNotKnown', false, { shouldValidate: true });
    }
    if (powerSource !== 'petrol_diesel') {
      setValue('engineCapacity', '', { shouldValidate: true });
    }
    if (powerSource !== 'electrical' && powerSource !== 'renewable') {
      setValue('motorCapacity', '', { shouldValidate: true });
    }
    if (powerSource !== 'renewable') {
      setValue('renewableType', '', { shouldValidate: true });
    }
  }, [powerSource, setValue]);

  const onFormSubmit = async (data) => {
    try {
      if (isEditMode) {
        const fd = buildUpdateFormData(data, originalYoutubeUrlsRef.current);
        await updateMutation.mutateAsync({ id, formData: fd });
        if (submitIntentRef.current === 'submit') {
          await submitMutation.mutateAsync(id);
          toast.success('Innovation updated and submitted for review!');
        } else {
          toast.success('Draft updated successfully!');
        }
        navigate('/my-innovations');
      } else {
        const fd = buildFormData(data);
        const result = await createMutation.mutateAsync(fd);
        const innovationId = result.data.innovation._id;

        if (submitIntentRef.current === 'submit') {
          await submitMutation.mutateAsync(innovationId);
          toast.success('Innovation submitted for review!');
        } else {
          toast.success('Draft saved successfully!');
        }
        navigate('/my-innovations');
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Something went wrong. Please try again.');
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

  const handleSaveDraft = () => {
    submitIntentRef.current = 'draft';
    handleSubmit(onFormSubmit, onInvalid)();
  };

  if (isEditMode && isFetching) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <p className="text-muted">Loading innovation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <PageHeader variant="innovations" title={isEditMode ? 'Edit Innovation' : 'Innovation Submission'} />

      <div className="container py-8 sm:py-10 lg:py-12">
        <form onSubmit={handleSubmit(onFormSubmit, onInvalid)}>
          {!isEditMode && <AiImportPanel />}
          <div className="space-y-10 sm:space-y-12">

            <InnovationMediaUpload
              mediaItems={mediaItems}
              otherDocuments={otherDocuments}
              onMediaItemsChange={(items) => setValue('mediaItems', items, { shouldValidate: true })}
              onOtherDocumentsChange={(file) => setValue('otherDocuments', file, { shouldValidate: true })}
            />
            {errors.mediaItems && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.mediaItems.message}</p>}

            <div className="form-section">
              <div className="form-section-header">Basic Details</div>
              <div className="space-y-5 sm:space-y-6 lg:space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                    <label htmlFor="innovationName" className="form-label">Name of the Innovation<span className="text-red-500">*</span></label>
                    <input id="innovationName" type="text" {...register('innovationName')} className={`form-input ${errors.innovationName ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                    {errors.innovationName && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.innovationName.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="yearLaunched" className="form-label">Year Launched<span className="text-red-500">*</span></label>
                    <input
                      id="yearLaunched"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      {...register('yearLaunched')}
                      className={`form-input ${errors.yearLaunched ? 'border-red-500' : ''}`}
                      placeholder="e.g. 2023"
                    />
                    {errors.yearLaunched && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.yearLaunched.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="form-label">Describe your Innovation<span className="text-red-500">*</span></label>
                  <div className="relative">
                    <textarea id="description" {...register('description')} rows={4} maxLength={3000} className={`form-input resize-none ${errors.description ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-xs sm:text-sm text-placeholder">{description.length}/3000</div>
                  </div>
                  {errors.description && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                    <label htmlFor="category" className="form-label">Category of the Innovation (Select up to 3)<span className="text-red-500">*</span></label>
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
                            if (!values.includes('others')) setValue('categoryOther', '');
                            field.onChange(values);
                          }}
                          options={INNOVATION_CATEGORY_OPTIONS}
                          placeholder="Select Categories"
                          isMulti={true}
                          isSearchable={true}
                          className={errors.category ? 'border-red-500 rounded' : ''}
                        />
                      )}
                    />
                    {errors.category && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.category.message}</p>}
                    <ConditionalOtherInput
                      show={category.includes('others')}
                      fieldName="categoryOther"
                      placeholder="Specify category"
                      register={register}
                      error={errors.categoryOther}
                    />
                  </div>
                  <div>
                    <label htmlFor="subcategory" className="form-label">Subcategory of the Innovation (Select up to 3)<span className="text-red-500">*</span></label>
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
                            if (!values.includes('others')) setValue('subcategoryOther', '');
                            field.onChange(values);
                          }}
                          options={INNOVATION_SUBCATEGORY_OPTIONS}
                          placeholder="Select Subcategories"
                          isMulti={true}
                          isSearchable={true}
                          className={errors.subcategory ? 'border-red-500 rounded' : ''}
                        />
                      )}
                    />
                    {errors.subcategory && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.subcategory.message}</p>}
                    <ConditionalOtherInput
                      show={subcategory.includes('others')}
                      fieldName="subcategoryOther"
                      placeholder="Specify subcategory"
                      register={register}
                      error={errors.subcategoryOther}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                    <label htmlFor="innovationStage" className="form-label">Stage of the Innovation<span className="text-red-500">*</span></label>
                    <Controller
                      name="innovationStage"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          {...field}
                          value={INNOVATION_STAGE_OPTIONS.find(opt => opt.value === field.value) || null}
                          onChange={(option) => field.onChange(option?.value || '')}
                          options={INNOVATION_STAGE_OPTIONS}
                          placeholder="Select Stage"
                          className={errors.innovationStage ? 'border-red-500 rounded' : ''}
                        />
                      )}
                    />
                    {errors.innovationStage && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.innovationStage.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="salesLocation" className="form-label">Location of your Sales<span className="text-red-500">*</span></label>
                    <Controller
                      name="salesLocation"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          {...field}
                          value={stateOptions.filter(opt => field.value.includes(opt.value))}
                          onChange={(options) => field.onChange(options ? options.map(opt => opt.value) : [])}
                          options={stateOptions}
                          placeholder="Select State(s)"
                          isSearchable={true}
                          isMulti={true}
                          className={errors.salesLocation ? 'border-red-500 rounded' : ''}
                        />
                      )}
                    />
                    {errors.salesLocation && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.salesLocation.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                    <label className="form-label">Do you have a network of distributors right now?<span className="text-red-500">*</span></label>
                    <div className={`flex flex-wrap gap-4 sm:gap-6 mt-3 sm:mt-4 items-center ${errors.distributorNetwork ? 'border-l-4 border-red-500 pl-4 rounded' : ''}`}>
                      {DISTRIBUTOR_NETWORK_OPTIONS.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                          <input type="radio" value={opt.value} {...register('distributorNetwork')} className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green" />
                          <span className="radio-label">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.distributorNetwork && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.distributorNetwork.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="sellingPrice" className="form-label">Selling Price in INR (Range, excluding logistics)<span className="text-red-500">*</span></label>
                    <input id="sellingPrice" type="text" {...register('sellingPrice')} className={`form-input ${errors.sellingPrice ? 'border-red-500' : ''}`} placeholder="e.g. 50000 or 50000-80000" />
                    {errors.sellingPrice && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.sellingPrice.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">Manufacturing Details</div>
              <div className="space-y-5 sm:space-y-6 lg:space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                    <label htmlFor="manufacturingLocation" className="form-label">Where is the innovation manufactured?<span className="text-red-500">*</span></label>
                    <input id="manufacturingLocation" type="text" {...register('manufacturingLocation')} className={`form-input ${errors.manufacturingLocation ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                    {errors.manufacturingLocation && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.manufacturingLocation.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="importedParts" className="form-label">List any imported parts (Click Checkbox, if not applicable)<span className="text-red-500">*</span></label>
                    <input
                      id="importedParts"
                      type="text"
                      {...register('importedParts')}
                      className={`form-input ${errors.importedParts ? 'border-red-500' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      placeholder="e.g. Engine components from Germany, Electronics from China"
                      disabled={importedPartsNotApplicable}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="importedPartsNotApplicable"
                        className="w-4 h-4 rounded border-gray-300 text-accent-green-dark focus:ring-accent-green-dark"
                        {...register('importedPartsNotApplicable')}
                      />
                      <label htmlFor="importedPartsNotApplicable" className="text-sm text-gray-500 cursor-pointer">No imported parts / Not applicable</label>
                    </div>
                    {errors.importedParts && !importedPartsNotApplicable && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.importedParts.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="form-label">Will you be able to provide spare parts for this product?<span className="text-red-500">*</span></label>
                  <div className={`flex flex-wrap gap-4 sm:gap-6 mt-3 sm:mt-4 items-center ${errors.spareParts ? 'border-l-4 border-red-500 pl-4 rounded' : ''}`}>
                    {YES_NO_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                        <input type="radio" value={opt.value} {...register('spareParts')} className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green" />
                        <span className="radio-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.spareParts && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.spareParts.message}</p>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">Technical Information</div>
              <div className="space-y-5 sm:space-y-6 lg:space-y-8">
                <div>
                  <label className="form-label">Power Source<span className="text-red-500">*</span></label>
                  <div className={`flex flex-wrap gap-4 sm:gap-6 mt-3 sm:mt-4 items-center ${errors.powerSource ? 'border-l-4 border-red-500 pl-4 rounded' : ''}`}>
                    {POWER_SOURCE_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                        <input type="radio" value={opt.value} {...register('powerSource')} className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green" />
                        <span className="radio-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.powerSource && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.powerSource.message}</p>}
                </div>

                {powerSource && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                    {(powerSource === 'manual' || powerSource === 'bullock') && (
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

                    {powerSource === 'renewable' && (
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

                    {powerSource === 'petrol_diesel' && (
                      <div>
                        <label htmlFor="engineCapacity" className="form-label">What is the engine capacity?<span className="text-red-500">*</span></label>
                        <input id="engineCapacity" type="text" {...register('engineCapacity')} className={`form-input ${errors.engineCapacity ? 'border-red-500' : ''}`} placeholder="motor size / engine cc / RPM etc" />
                        {errors.engineCapacity && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.engineCapacity.message}</p>}
                      </div>
                    )}

                    {(powerSource === 'electrical' || powerSource === 'renewable') && (
                      <div>
                        <label htmlFor="motorCapacity" className="form-label">What is the motor capacity (in HP)?<span className="text-red-500">*</span></label>
                        <input id="motorCapacity" type="text" {...register('motorCapacity')} className={`form-input ${errors.motorCapacity ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                        {errors.motorCapacity && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.motorCapacity.message}</p>}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                    <label htmlFor="dimensions" className="form-label">Dimensions of the product<span className="text-red-500">*</span></label>
                    <input id="dimensions" type="text" {...register('dimensions')} className={`form-input ${errors.dimensions ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                    {errors.dimensions && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.dimensions.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="weight" className="form-label">Weight of the product<span className="text-red-500">*</span></label>
                    <input id="weight" type="text" {...register('weight')} className={`form-input ${errors.weight ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                    {errors.weight && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.weight.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                    <label htmlFor="attachments" className="form-label">Are there any attachments to the product? If yes, provide details.</label>
                    <input id="attachments" type="text" {...register('attachments')} className={`form-input ${errors.attachments ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                    {errors.attachments && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.attachments.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="performanceParams" className="form-label">Mention any performance parameters that you have tested for the innovation</label>
                    <input id="performanceParams" type="text" {...register('performanceParams')} className={`form-input ${errors.performanceParams ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                    {errors.performanceParams && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.performanceParams.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="coveredOperations" className="form-label">What are the operations covered by this innovation? (Select up to 3)<span className="text-red-500">*</span></label>
                  <Controller
                    name="coveredOperations"
                    control={control}
                    render={({ field }) => (
                      <FormSelectAndAdd
                        {...field}
                        value={operationOptions.filter(opt => field.value.includes(opt.value))}
                        onChange={(selected) => {
                          const values = selected ? selected.map(opt => opt.value) : [];
                          if (values.length > 3) return;
                          field.onChange(values);
                        }}
                        options={operationOptions}
                        onOptionsChange={setOperationOptions}
                        placeholder="Select or type to add operations..."
                        isMulti={true}
                        isSearchable={true}
                        className={errors.coveredOperations ? 'border-red-500 rounded' : ''}
                      />
                    )}
                  />
                  {errors.coveredOperations && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.coveredOperations.message}</p>}
                </div>

              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">Usage Details</div>
              <div className="space-y-5 sm:space-y-6 lg:space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                    <label htmlFor="suitableCrops" className="form-label">Suitable Crops/Materials</label>
                    <input id="suitableCrops" type="text" {...register('suitableCrops')} className={`form-input ${errors.suitableCrops ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                    {errors.suitableCrops && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.suitableCrops.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="suitableTerrains" className="form-label">Suitable Terrains</label>
                    <input id="suitableTerrains" type="text" {...register('suitableTerrains')} className={`form-input ${errors.suitableTerrains ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                    {errors.suitableTerrains && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.suitableTerrains.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                    <label htmlFor="suitableSoil" className="form-label">Suitable Soil Types</label>
                    <input id="suitableSoil" type="text" {...register('suitableSoil')} className={`form-input ${errors.suitableSoil ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                    {errors.suitableSoil && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.suitableSoil.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="weatherConditions" className="form-label">Weather Conditions</label>
                    <input id="weatherConditions" type="text" {...register('weatherConditions')} className={`form-input ${errors.weatherConditions ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                    {errors.weatherConditions && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.weatherConditions.message}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="otherUsageConditions" className="form-label">Other usage conditions</label>
                  <input id="otherUsageConditions" type="text" {...register('otherUsageConditions')} className={`form-input ${errors.otherUsageConditions ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                  {errors.otherUsageConditions && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.otherUsageConditions.message}</p>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">Support and Services</div>
              <div className="space-y-6 sm:space-y-8 lg:space-y-10">

                <div>
                  <label className="form-label block mb-3">Are you able to provide training on maintenance and after sales services for this innovation?</label>
                  <div className={`flex flex-wrap gap-4 sm:gap-6 items-center ${errors.maintenanceTraining ? 'border-l-4 border-red-500 pl-4 rounded' : ''}`}>
                    {YES_NO_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                        <input type="radio" value={opt.value} {...register('maintenanceTraining')} className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green" />
                        <span className="radio-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.maintenanceTraining && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.maintenanceTraining.message}</p>}
                </div>

                <div>
                  <label className="form-label block mb-3">Are you providing any end-user financing support for this innovation?</label>
                  <div className={`flex flex-wrap gap-4 sm:gap-6 items-center ${errors.financingSupport ? 'border-l-4 border-red-500 pl-4 rounded' : ''}`}>
                    {SUPPORT_WITH_EXPLORE_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                        <input type="radio" value={opt.value} {...register('financingSupport')} className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green" />
                        <span className="radio-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.financingSupport && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.financingSupport.message}</p>}
                </div>

                <div>
                  <label className="form-label block mb-3">Will you be able to provide technical training for this innovation?</label>
                  <div className={`flex flex-wrap gap-4 sm:gap-6 items-center ${errors.technicalTraining ? 'border-l-4 border-red-500 pl-4 rounded' : ''}`}>
                    {SUPPORT_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                        <input type="radio" value={opt.value} {...register('technicalTraining')} className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green" />
                        <span className="radio-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.technicalTraining && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.technicalTraining.message}</p>}
                </div>

                <div>
                  <label className="form-label block mb-3">Will you be open to do demo installations in new geographies for this innovation?</label>
                  <div className={`flex flex-wrap gap-4 sm:gap-6 items-center ${errors.demoInstallations ? 'border-l-4 border-red-500 pl-4 rounded' : ''}`}>
                    {YES_NO_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                        <input type="radio" value={opt.value} {...register('demoInstallations')} className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green" />
                        <span className="radio-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.demoInstallations && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.demoInstallations.message}</p>}
                </div>

              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10 lg:mt-12">
            {isApproved && (
              <button
                type="submit"
                onClick={() => { submitIntentRef.current = 'submit'; }}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 lg:py-4 bg-button-dark text-white text-base sm:text-lg border border-accent-green rounded-xl hover:bg-primary transition-colors font-medium cursor-pointer font-heading disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && submitIntentRef.current === 'submit'
                  ? (isEditMode ? 'Updating...' : 'Submitting...')
                  : (isEditMode ? 'Update & Submit' : 'Submit Innovation')}
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 lg:py-4 bg-accent-green-dark text-white text-base sm:text-lg border border-accent-green rounded-xl hover:bg-accent-green transition-colors font-medium cursor-pointer font-heading disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && submitIntentRef.current === 'draft'
                ? 'Saving...'
                : (isEditMode ? 'Save Changes' : 'Save as Draft')}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 lg:py-4 bg-white text-muted text-base sm:text-lg border border-input-border rounded-xl hover:bg-header transition-colors font-medium cursor-pointer font-heading disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InnovationSubmissionPage;
