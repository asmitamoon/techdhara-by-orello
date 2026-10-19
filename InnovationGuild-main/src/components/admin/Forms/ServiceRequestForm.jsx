import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Info, Edit3 } from 'lucide-react';
import { serviceRequestSchema } from '../../../schemas/problemSchema';
import { UNIT_TYPE_OPTIONS, OWNERSHIP_OPTIONS } from '../../../utils/constants/problemConstants';

const ServiceRequestForm = forwardRef(({ initialData, isEditMode, onEditToggle, onDataChange, onSubmit }, ref) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: initialData || {
      unitType: '',
      techName: '',
      techSpecs: '',
      techCompany: '',
      techCompanyNotAvailable: false,
      cost: '',
      ownership: '',
      individualBusinessPlan: '',
      challenges: '',
      photosLink: '',
      type: 'service'
    }
  });

  const ownership = watch('ownership');
  const techCompanyNotAvailable = watch('techCompanyNotAvailable');

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(
        onFormSubmit,
        () => toast.error('Please fix the form errors before submitting')
      )();
    }
  }));

  useEffect(() => {
    if (techCompanyNotAvailable) {
      setValue('techCompany', '', { shouldValidate: true });
    }
  }, [techCompanyNotAvailable, setValue]);

  useEffect(() => {
    if (!isEditMode && initialData) {
      Object.keys(initialData).forEach(key => {
        setValue(key, initialData[key]);
      });
    }
  }, [isEditMode, initialData, setValue]);

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

  const inputClass = (fieldError) =>
    `form-input ${fieldError ? 'border-red-500' : ''} ${!isEditMode ? 'bg-transparent border-transparent focus:border-transparent cursor-default px-0 font-medium text-primary' : ''}`;

  return (
    <div className="bg-white rounded-3xl border border-accent-green-dark p-4 sm:p-5 lg:p-6 xl:p-8">
      <div className="border-b border-input-border pb-3 mb-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-primary font-heading">Service Request Details</h2>
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
            <div className="form-section-header">Service Request Details</div>
            
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Local Unit name (Branch / FPO / SHG / Other)<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {UNIT_TYPE_OPTIONS.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          value={opt.value} 
                          disabled={!isEditMode} 
                          {...register('unitType')} 
                          className="w-4 h-4 text-accent-green-dark focus:ring-accent-green disabled:opacity-100" 
                        />
                        <span className="radio-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.unitType && <p className="text-red-500 text-xs mt-1">{errors.unitType.message}</p>}
                </div>
                <div>
                  <label htmlFor="techName" className="form-label">Technology Name<span className="text-red-500">*</span></label>
                  <input 
                    id="techName"
                    type="text" 
                    className={inputClass(errors.techName)} 
                    placeholder="Your Answer" 
                    readOnly={!isEditMode} 
                    {...register('techName')} 
                  />
                  {errors.techName && <p className="text-red-500 text-xs mt-1">{errors.techName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="techSpecs" className="form-label">Technology Specifications (basic)<span className="text-red-500">*</span></label>
                  <input 
                    id="techSpecs"
                    type="text" 
                    className={inputClass(errors.techSpecs)} 
                    placeholder="Your Answer" 
                    readOnly={!isEditMode} 
                    {...register('techSpecs')} 
                  />
                  {errors.techSpecs && <p className="text-red-500 text-xs mt-1">{errors.techSpecs.message}</p>}
                </div>
                <div>
                  <label htmlFor="techCompany" className="form-label">Technology Company (Click Checkbox, if not available)<span className="text-red-500">*</span></label>
                  <input
                    id="techCompany"
                    type="text"
                    className={`${inputClass(errors.techCompany)} ${techCompanyNotAvailable ? 'opacity-50' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    placeholder="Your Answer"
                    readOnly={!isEditMode}
                    disabled={techCompanyNotAvailable}
                    {...register('techCompany')}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="techCompanyNotAvailable"
                      className="w-4 h-4 rounded border-gray-300 text-accent-green-dark focus:ring-accent-green-dark disabled:opacity-100"
                      disabled={!isEditMode}
                      {...register('techCompanyNotAvailable')}
                    />
                    <label htmlFor="techCompanyNotAvailable" className="text-sm text-gray-500 cursor-pointer">
                      Technology company not available
                    </label>
                  </div>
                  {errors.techCompany && !techCompanyNotAvailable && (
                    <p className="text-red-500 text-xs mt-1">{errors.techCompany.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cost" className="form-label">Cost of the machine (provide a range if exact is unknown)<span className="text-red-500">*</span></label>
                  <input 
                    id="cost"
                    type="text" 
                    className={inputClass(errors.cost)} 
                    placeholder="Your Answer" 
                    readOnly={!isEditMode} 
                    {...register('cost')} 
                  />
                  {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost.message}</p>}
                </div>
                <div>
                  <label className="form-label">Who has the ownership? (Techsetu, FPO or an Individual)<span className="text-red-500">*</span></label>
                  <div className="flex gap-4 mt-2">
                    {OWNERSHIP_OPTIONS.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          value={opt.value} 
                          disabled={!isEditMode} 
                          {...register('ownership')} 
                          className="w-4 h-4 text-accent-green-dark focus:ring-accent-green disabled:opacity-100" 
                        />
                        <span className="radio-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.ownership && <p className="text-red-500 text-xs mt-1">{errors.ownership.message}</p>}
                </div>
              </div>

              <div className={ownership !== 'Individual' ? 'opacity-50' : ''}>
                <label htmlFor="individualBusinessPlan" className="form-label">If Individual, what business is planned?<span className="text-red-500">*</span></label>
                <input
                  id="individualBusinessPlan"
                  type="text"
                  className={inputClass(errors.individualBusinessPlan)}
                  placeholder="Your Answer"
                  readOnly={!isEditMode}
                  disabled={ownership !== 'Individual'}
                  {...register('individualBusinessPlan')}
                />
                {errors.individualBusinessPlan && ownership === 'Individual' && (
                  <p className="text-red-500 text-xs mt-1">{errors.individualBusinessPlan.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="challenges" className="form-label">What are the current challenges with the machine?<span className="text-red-500">*</span></label>
                <input
                  id="challenges"
                  type="text"
                  className={inputClass(errors.challenges)}
                  placeholder="Your Answer"
                  readOnly={!isEditMode}
                  {...register('challenges')}
                />
                {errors.challenges && <p className="text-red-500 text-xs mt-1">{errors.challenges.message}</p>}
              </div>

              <div>
                <label htmlFor="photosLink" className="form-label">Photos (if any, add drive links)</label>
                <input
                  id="photosLink"
                  type="text"
                  className={inputClass(errors.photosLink)}
                  placeholder="Add Link(s)"
                  readOnly={!isEditMode}
                  {...register('photosLink')}
                />
                {errors.photosLink && <p className="text-red-500 text-xs mt-1">{errors.photosLink.message}</p>}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
});

ServiceRequestForm.displayName = 'ServiceRequestForm';

export default ServiceRequestForm;