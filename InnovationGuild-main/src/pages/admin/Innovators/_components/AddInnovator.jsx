import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { getStateOptions, getDistrictOptions } from '../../../../utils/LocationData/locationData';
import { pipelineInnovatorSchema } from '../../../../schemas/adminSchema';
import FormSelectAdmin from '../../../../components/ui/FormSelectAdmin';

const AddInnovatorModal = ({ open, onClose, initialData = null, onSave }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pipelineInnovatorSchema),
    defaultValues: {
      name: '',
      enterprise: '',
      emailId: '',
      mobile: '',
      state: '',
      district: '',
      link: '',
    },
  });

  const stateOptions = useMemo(() => getStateOptions(), []);
  const [districtOptions, setDistrictOptions] = useState([]);

  useEffect(() => {
    reset({
      name: initialData?.name || '',
      enterprise: initialData?.enterprise || '',
      emailId: initialData?.emailId || '',
      mobile: initialData?.mobile || '',
      state: initialData?.state || '',
      district: initialData?.district || '',
      link: initialData?.link || '',
    });
  }, [initialData, open, reset]);

  const watchedState = watch('state');
  useEffect(() => {
    const newOptions = watchedState ? getDistrictOptions(watchedState) : [];
    setDistrictOptions(newOptions);
    const currentDistrict = getValues('district');
    if (currentDistrict && !newOptions.some(opt => opt.value === currentDistrict)) {
      setValue('district', '');
    }
  }, [watchedState, getValues, setValue]);

  const inputClass = (fieldError) =>
    `w-full p-3 border border-accent-green-light rounded-xl focus:outline-none focus:border-accent-green-dark bg-light text-base placeholder:text-placeholder transition-colors !py-2${fieldError ? ' !border-red-500' : ''}`;

  const onSubmit = (data) => {
    onSave(data);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-[#123E39]/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] shadow-xl w-full max-w-2xl overflow-hidden border border-accent-green-dark">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-input-border">
          <h2 className="text-3xl font-regular text-black">
            {initialData ? 'Edit Innovator' : 'Add Innovator'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-header rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label mb-1 block text-sm">Name of Innovator</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className={inputClass(errors.name)}
                  {...register('name')}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="form-label mb-1 block text-sm">Name of Enterprise</label>
                <input
                  type="text"
                  placeholder="Enter enterprise name"
                  className={inputClass(errors.enterprise)}
                  {...register('enterprise')}
                />
                {errors.enterprise && <p className="text-red-500 text-xs mt-1">{errors.enterprise.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label mb-1 block text-sm">Email Address</label>
                <input
                  type="text"
                  placeholder="Enter email"
                  className={inputClass(errors.emailId)}
                  {...register('emailId')}
                />
                {errors.emailId && <p className="text-red-500 text-xs mt-1">{errors.emailId.message}</p>}
              </div>
              <div>
                <label className="form-label mb-1 block text-sm">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  className={inputClass(errors.mobile)}
                  {...register('mobile')}
                />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label mb-1 block text-sm">State</label>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <FormSelectAdmin
                      options={stateOptions}
                      value={stateOptions.find(opt => opt.value === field.value) || null}
                      onChange={(opt) => field.onChange(opt?.value || '')}
                      placeholder="Select State"
                      isSearchable
                    />
                  )}
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
              </div>
              <div>
                <label className="form-label mb-1 block text-sm">District</label>
                <Controller
                  name="district"
                  control={control}
                  render={({ field }) => (
                    <FormSelectAdmin
                      options={districtOptions}
                      value={districtOptions.find(opt => opt.value === field.value) || null}
                      onChange={(opt) => field.onChange(opt?.value || '')}
                      placeholder="Select District"
                      isSearchable
                      isDisabled={!watchedState}
                    />
                  )}
                />
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
              </div>
            </div>

            <div>
              <label className="form-label mb-1 block text-sm">Link</label>
              <input
                type="text"
                placeholder="https://example.com"
                className={inputClass(errors.link)}
                {...register('link')}
              />
              {errors.link && <p className="text-red-500 text-xs mt-1">{errors.link.message}</p>}
            </div>

            <div className="pt-2 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-2 border border-input-border text-muted rounded-full font-medium hover:bg-header transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-10 py-2 bg-accent-green-dark text-white rounded-full font-medium hover:bg-accent-green transition-colors cursor-pointer"
              >
                {initialData ? 'Update' : 'Submit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInnovatorModal;
