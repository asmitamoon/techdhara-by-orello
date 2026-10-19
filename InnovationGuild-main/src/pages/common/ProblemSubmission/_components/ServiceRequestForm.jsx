import { useEffect, useRef } from 'react';
import PageLoader from '../../../../components/ui/PageLoader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { serviceRequestSchema } from '../../../../schemas/problemSchema';
import { UNIT_TYPE_OPTIONS, OWNERSHIP_OPTIONS } from '../../../../utils/constants/problemConstants';
import {
  useCreateServiceRequest,
  useSubmitServiceRequestForApproval,
  useUpdateServiceRequest,
} from '../../../../hooks/mutations/common';
import { useGetServiceRequestById } from '../../../../hooks/queries/common';

const ServiceRequestForm = ({ id }) => {
  const navigate = useNavigate();
  const isEditMode = !!id;
  const submitIntentRef = useRef('submit');
  const createServiceRequestMutation = useCreateServiceRequest();
  const updateServiceRequestMutation = useUpdateServiceRequest();
  const submitServiceRequestMutation = useSubmitServiceRequestForApproval();
  const { data: srData, isLoading: isFetching } = useGetServiceRequestById(id);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      unitType: '',
      techName: '',
      techSpecs: '',
      techCompany: '',
      techCompanyNotAvailable: false,
      cost: '',
      ownership: '',
      individualBusinessPlan: '',
      challenges: '',
      photosLink: ''
    }
  });

  const ownership = watch('ownership');
  const techCompanyNotAvailable = watch('techCompanyNotAvailable');

  useEffect(() => {
    if (techCompanyNotAvailable) {
      setValue('techCompany', '', { shouldValidate: true });
    }
  }, [techCompanyNotAvailable, setValue]);

  useEffect(() => {
    if (!isEditMode || !srData) return;
    const sr = srData.data.serviceRequest;
    reset({
      unitType: sr.unitType ?? '',
      techName: sr.techName ?? '',
      techSpecs: sr.techSpecs ?? '',
      techCompany: sr.techCompany ?? '',
      techCompanyNotAvailable: !sr.techCompany,
      cost: sr.cost ? (sr.cost.min === sr.cost.max ? String(sr.cost.min) : `${sr.cost.min}-${sr.cost.max}`) : '',
      ownership: sr.ownership ?? '',
      individualBusinessPlan: sr.individualBusinessPlan ?? '',
      challenges: sr.challenges ?? '',
      photosLink: sr.photosLink ?? '',
    });
  }, [isEditMode, srData, reset]);

  const onFormSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateServiceRequestMutation.mutateAsync({ id, data });
        if (submitIntentRef.current === 'submit') {
          await submitServiceRequestMutation.mutateAsync(id);
          toast.success('Service request published!');
        } else {
          toast.success('Draft updated successfully!');
        }
      } else {
        const result = await createServiceRequestMutation.mutateAsync(data);
        const serviceRequestId = result.data.serviceRequest._id;
        if (submitIntentRef.current === 'submit') {
          await submitServiceRequestMutation.mutateAsync(serviceRequestId);
          toast.success('Service request published!');
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
    <div className="pb-8 sm:pb-10 lg:pb-12">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="form-section">
          <div className="form-section-header">Details</div>

          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              <div>
                <label className="form-label">Local Unit name (Branch / FPO / SHG / Other)<span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4 sm:gap-6 mt-3 sm:mt-4">
                  {UNIT_TYPE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                      <input type="radio" value={opt.value} {...register('unitType')} className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green" />
                      <span className="radio-label">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.unitType && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.unitType.message}</p>}
              </div>
              <div>
                <label htmlFor="techName" className="form-label">Technology Name<span className="text-red-500">*</span></label>
                <input id="techName" type="text" {...register('techName')} className={`form-input ${errors.techName ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                {errors.techName && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.techName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              <div>
                <label htmlFor="techSpecs" className="form-label">Technology Specifications (basic)<span className="text-red-500">*</span></label>
                <input id="techSpecs" type="text" {...register('techSpecs')} className={`form-input ${errors.techSpecs ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                {errors.techSpecs && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.techSpecs.message}</p>}
              </div>
              <div>
                <label htmlFor="techCompany" className="form-label">Technology Company (Click Checkbox, if not available)<span className="text-red-500">*</span></label>
                <input
                  id="techCompany"
                  type="text"
                  {...register('techCompany')}
                  className={`form-input ${errors.techCompany ? 'border-red-500' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="Your Answer"
                  disabled={techCompanyNotAvailable}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="techCompanyNotAvailable"
                    className="w-4 h-4 rounded border-gray-300 text-accent-green-dark focus:ring-accent-green-dark"
                    {...register('techCompanyNotAvailable')}
                  />
                  <label htmlFor="techCompanyNotAvailable" className="text-sm text-gray-500 cursor-pointer">
                    Technology company not available
                  </label>
                </div>
                {errors.techCompany && !techCompanyNotAvailable && (
                  <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.techCompany.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              <div>
                <label htmlFor="cost" className="form-label">Cost of the machine (provide a range if exact is unknown)<span className="text-red-500">*</span></label>
                <input id="cost" type="text" {...register('cost')} className={`form-input ${errors.cost ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                {errors.cost && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.cost.message}</p>}
              </div>
              <div>
                <label className="form-label">Who has the ownership? (Techsetu, FPO or an Individual)<span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4 sm:gap-6 mt-3 sm:mt-4">
                  {OWNERSHIP_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                      <input type="radio" value={opt.value} {...register('ownership')} className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green" />
                      <span className="radio-label">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.ownership && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.ownership.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              <div className={ownership !== 'Individual' ? 'opacity-50' : ''}>
                <label htmlFor="individualBusinessPlan" className="form-label">If Individual, what business is planned?<span className="text-red-500">*</span></label>
                <input id="individualBusinessPlan" type="text" {...register('individualBusinessPlan')} className={`form-input ${errors.individualBusinessPlan ? 'border-red-500' : ''}`} placeholder="Your Answer" disabled={ownership !== 'Individual'} />
                {errors.individualBusinessPlan && ownership === 'Individual' && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.individualBusinessPlan.message}</p>}
              </div>
              <div>
                <label htmlFor="challenges" className="form-label">What are the current challenges with the machine?<span className="text-red-500">*</span></label>
                <input id="challenges" type="text" {...register('challenges')} className={`form-input ${errors.challenges ? 'border-red-500' : ''}`} placeholder="Your Answer" />
                {errors.challenges && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.challenges.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="photosLink" className="form-label">Photos (if any, add drive links)</label>
              <input id="photosLink" type="text" {...register('photosLink')} className={`form-input ${errors.photosLink ? 'border-red-500' : ''}`} placeholder="Add Link(s)" />
              {errors.photosLink && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.photosLink.message}</p>}
            </div>

          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
          <button
            type="submit"
            onClick={() => { submitIntentRef.current = 'submit'; }}
            disabled={createServiceRequestMutation.isPending || updateServiceRequestMutation.isPending || submitServiceRequestMutation.isPending}
            className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-button-dark text-white text-base sm:text-lg border border-accent-green rounded-xl hover:bg-primary transition-colors font-medium cursor-pointer font-heading disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createServiceRequestMutation.isPending || updateServiceRequestMutation.isPending || submitServiceRequestMutation.isPending ? 'Submitting...' : 'Submit Problem'}
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={createServiceRequestMutation.isPending || updateServiceRequestMutation.isPending}
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

export default ServiceRequestForm;