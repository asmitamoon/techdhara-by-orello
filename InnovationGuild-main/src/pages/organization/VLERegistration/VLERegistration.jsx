import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import VLERegistrationProfileFields from './_components/VLERegistrationProfileFields';
import OTPVerificationModal from './_components/OTPVerificationModal';
import { vleRegistrationByAOSchema } from '../../../schemas/registrationSchema';
import { useInitiateVleRegistration, useResendVleOtp, useRegisterVleByAo } from '../../../hooks/mutations/ao';

const VLERegistration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [submittedData, setSubmittedData] = useState(null);

  const { mutateAsync: initiateVle, isPending: isInitiating } = useInitiateVleRegistration();
  const { mutateAsync: resendVleOtpMutation } = useResendVleOtp();
  const { mutateAsync: registerVle, isPending: isRegistering } = useRegisterVleByAo();

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(vleRegistrationByAOSchema),
    defaultValues: {
      // Registration fields
      registrationType: 'email',
      identifier: '',
      password: '',
      confirmPassword: '',
      // VLE Profile fields (from vleSchema)
      profilePic: null,
      fullName: '',
      age: '',
      gender: '',
      state: '',
      district: '',
      village: '',
      mobile: '',
      mainLivelihood: '',
      livelihoodExperience: '',
      otherLivelihoods: [],
      yearlyRevenue: '',
      qualification: '',
      languages: [],
      isNotAffiliated: true,
      hasMachineExp: null,
      trainingsTaken: '',
      machineExpYears: '',
      machinesWorkedWith: [],
      vleCategory: '',
      vleCategoryOther: '',
      supportAssessment: []
    }
  });

  const registrationType = watch('registrationType');

  // Timer countdown effect for OTP resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleFormSubmit = async (data) => {
    try {
      const payload = data.registrationType === 'email'
        ? { email: data.identifier, password: data.password, confirmPassword: data.confirmPassword }
        : { phone: data.identifier };
      await initiateVle(payload);
      setSubmittedData(data);
      toast.success(`OTP sent to ${data.identifier}`);
      setShowOtpModal(true);
      setTimer(30);
    } catch {
      // onError in hook shows toast
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { toast.error('Please enter a valid 6-digit OTP'); return; }
    try {
      const formData = new FormData();
      if (submittedData.registrationType === 'email') {
        formData.append('email', submittedData.identifier);
      } else {
        formData.append('phone', submittedData.identifier);
      }
      formData.append('password', submittedData.password);
      formData.append('otp', otp);
      formData.append('fullName', submittedData.fullName);
      formData.append('mobile', submittedData.mobile);
      formData.append('age', submittedData.age);
      formData.append('gender', submittedData.gender);
      formData.append('state', submittedData.state);
      formData.append('district', submittedData.district);
      formData.append('village', submittedData.village);
      formData.append('mainLivelihood', submittedData.mainLivelihood);
      formData.append('livelihoodExperience', submittedData.livelihoodExperience);
      formData.append('languages', JSON.stringify(submittedData.languages));
      formData.append('hasMachineExp', submittedData.hasMachineExp);
      formData.append('machineExpYears', submittedData.machineExpYears ?? 0);
      formData.append('vleCategory', submittedData.vleCategory);
      if (submittedData.otherLivelihoods?.length) formData.append('otherLivelihoods', JSON.stringify(submittedData.otherLivelihoods));
      if (submittedData.yearlyRevenue) formData.append('yearlyRevenue', submittedData.yearlyRevenue);
      if (submittedData.qualification) formData.append('qualification', submittedData.qualification);
      if (submittedData.trainingsTaken) formData.append('trainingsTaken', submittedData.trainingsTaken);
      if (submittedData.machinesWorkedWith?.length) formData.append('machinesWorkedWith', JSON.stringify(submittedData.machinesWorkedWith));
      if (submittedData.vleCategoryOther) formData.append('vleCategoryOther', submittedData.vleCategoryOther);
      if (submittedData.supportAssessment?.length) formData.append('supportAssessment', JSON.stringify(submittedData.supportAssessment));
      if (submittedData.profilePic) formData.append('profilePic', submittedData.profilePic);
      await registerVle(formData);
      toast.success('VLE created successfully!');
      setShowOtpModal(false);
      navigate('/ao/vles');
    } catch {
      // onError in hook shows toast; keep modal open
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || !submittedData) return;
    try {
      const payload = submittedData.registrationType === 'email'
        ? { email: submittedData.identifier }
        : { phone: submittedData.identifier };
      await resendVleOtpMutation(payload);
      toast.success('OTP resent successfully!');
      setTimer(30);
      setOtp('');
    } catch {
      // onError in hook shows toast
    }
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setOtp('');
  };

  const handleCancel = () => {
    navigate('/ao/vles');
  };

  return (
    <div className="min-h-screen bg-page">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <button
            onClick={handleCancel}
            className="flex-shrink-0 p-2 hover:bg-light rounded-lg transition-colors group cursor-pointer"
            aria-label="Go back"
          >
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 text-muted group-hover:text-dark transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-regular text-black">
            Create VLE
          </h1>
        </div>
        <div className="border-t mt-6 border-accent-green-dark"></div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-8 space-y-6">
          {/* Registration Details Section */}
          <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg p-6 sm:p-8 lg:p-10 border border-accent-green-dark">
            <div className="form-section-header mb-6">Registration Details</div>

            <div className="space-y-5 sm:space-y-6 lg:space-y-8">
              {/* Registration Type */}
              <div>
                <label className="form-label">
                  Registration Type<span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 sm:gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="email"
                      {...register('registrationType')}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green"
                    />
                    <span className="radio-label">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="mobile"
                      {...register('registrationType')}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green"
                    />
                    <span className="radio-label">Mobile</span>
                  </label>
                </div>
                {errors.registrationType && (
                  <p className="text-red-500 text-xs lg:text-sm mt-1">
                    {errors.registrationType.message}
                  </p>
                )}
              </div>

              {/* Email/Mobile Input */}
              <div>
                <label className="form-label">
                  {registrationType === 'email' ? 'Email Address' : 'Mobile Number'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type={registrationType === 'email' ? 'email' : 'tel'}
                  {...register('identifier')}
                  placeholder={
                    registrationType === 'email'
                      ? 'Enter email address'
                      : 'Enter 10-digit mobile number'
                  }
                  className={`form-input ${errors.identifier ? 'border-red-500' : ''}`}
                />
                {errors.identifier && (
                  <p className="text-red-500 text-xs lg:text-sm mt-1">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="form-label">
                    Create Password<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="Enter password"
                      className={`form-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs lg:text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="form-label">
                    Re-enter Password<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      placeholder="Re-enter password"
                      className={`form-input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs lg:text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* VLE Profile Section - Rendered inline without form wrapper */}
          <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg p-6 sm:p-8 lg:p-10 border border-accent-green-dark">
            <VLERegistrationProfileFields
              register={register}
              control={control}
              watch={watch}
              setValue={setValue}
              errors={errors}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-start gap-4">
            <button
              type="submit"
              disabled={isInitiating}
              className="px-6 py-2 bg-button-dark border border-accent-green-dark text-white rounded-lg hover:bg-primary transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isInitiating ? 'Sending OTP...' : 'Create VLE'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-input-border text-primary rounded-lg hover:bg-light transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* OTP Verification Modal */}
        <OTPVerificationModal
          isOpen={showOtpModal}
          onClose={handleCloseOtpModal}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
          identifier={watch('identifier')}
          timer={timer}
          otp={otp}
          setOtp={setOtp}
          isLoading={isRegistering}
        />
      </div>
    </div>
  );
};

export default VLERegistration;
