import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { setToken } from '../../../../utils/tokenStore';
import { z } from 'zod';
import OtpInput from 'react-otp-input';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import registerSideBg from '../../../../assets/images/registerSideBg.png';
import googleLogo from '../../../../assets/icons/googleLogo.svg';
import { authSchema } from '../../../../schemas/registrationSchema';
import PasswordInput from '../../../../components/ui/PasswordInput';
import { login } from '../../../../store/slices/authSlice';
import {
  useRegisterEmail,
  useVerifyEmail,
  useMobileLogin,
  useVerifyMobile,
  useResendOtp,
  useResendMobileOtp,
} from '../../../../hooks/mutations/auth';

const isEmail = (val) => z.string().email().safeParse(val).success;

const BACKEND_ROLE = {
  vle: 'VLE',
  innovator: 'INNOVATOR',
  affiliated_organization: 'AO',
  nodal_organization: 'NO',
  general_user: 'GENERAL_USER',
};

const ROLE_DISPLAY = {
  vle:                    { label: 'Tech Dhaarak',           bg: '#FFEEDD', color: '#C1772E' },
  innovator:              { label: 'Tech Nirmata',           bg: '#F7E7E4', color: '#FC7760' },
  general_user:           { label: 'General User',           bg: '#F9F7F3', color: '#403F32' },
  affiliated_organization:{ label: 'Affiliated Organization',bg: '#EFF8EF', color: '#4A8A4A' },
  nodal_organization:     { label: 'Nodal Organization',     bg: '#F5EFDA', color: '#A08C40' },
};



const RegistrationForm = ({ onBack, onRegisterSuccess, role }) => {
  const dispatch = useDispatch();
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [submittedData, setSubmittedData] = useState(null);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);

  const registerEmailMutation = useRegisterEmail();
  const verifyEmailMutation = useVerifyEmail();
  const mobileLoginMutation = useMobileLogin();
  const verifyMobileMutation = useVerifyMobile();
  const resendOtpMutation = useResendOtp();
  const resendMobileOtpMutation = useResendMobileOtp();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      identifier: '',
      password: '',
      confirmPassword: ''
    }
  });

  const identifier = watch('identifier');

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (data) => {
    try {
      setSubmittedData(data);
      if (isEmail(data.identifier)) {
        await registerEmailMutation.mutateAsync({
          email: data.identifier,
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: BACKEND_ROLE[role],
        });
      } else {
        await mobileLoginMutation.mutateAsync({
          phone: data.identifier,
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: BACKEND_ROLE[role],
        });
      }
      toast.success(`OTP sent to ${data.identifier}`);
      setShowOtpField(true);
      setTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Registration failed');
    }
  };

  const handleChangeNumber = () => {
    setShowOtpField(false);
    setOtp('');
  };

  const handleVerify = async () => {
    if (otp.length !== 6) { toast.error('Please enter a valid 6-digit OTP'); return; }
    try {
      let result;
      if (isEmail(submittedData.identifier)) {
        result = await verifyEmailMutation.mutateAsync({
          email: submittedData.identifier,
          otp,
        });
      } else {
        result = await verifyMobileMutation.mutateAsync({
          phone: submittedData.identifier,
          otp,
        });
      }
      const { user, accessToken } = result.data;
      dispatch(login({ user, accessToken }));
      setToken(accessToken);
      toast.success('Verification successful!');
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Verification failed');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      if (isEmail(submittedData.identifier)) {
        await resendOtpMutation.mutateAsync({ email: submittedData.identifier });
      } else {
        await resendMobileOtpMutation.mutateAsync({ phone: submittedData.identifier });
      }
      toast.success('OTP resent successfully!');
      setTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to resend OTP');
    }
  };

  const isSendingOtp = registerEmailMutation.isPending || mobileLoginMutation.isPending;
  const isVerifying = verifyEmailMutation.isPending || verifyMobileMutation.isPending;
  const isResending = resendOtpMutation.isPending || resendMobileOtpMutation.isPending;

  return (
    <div className="bg-white max-lg:max-w-[500px] mx-auto border border-accent-green-dark rounded-2xl sm:rounded-3xl overflow-hidden w-full flex flex-col lg:flex-row">

      <div className="w-full lg:w-1/2 p-5 sm:p-8 lg:p-10 xl:p-12 relative flex flex-col justify-center">

        <div className='mb-8 sm:mb-12 lg:mb-15 2xl:mb-20'>
          <div className="mb-2">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-primary">Welcome to</h3>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl 2xl:text-[46px] font-semibold text-primary leading-tight">
              Tech Dhaara
            </h2>
          </div>
          <p className="text-muted text-xs sm:text-sm">
            {showOtpField
              ? `We've sent a verification code to ${identifier}`
              : `Sign up to create your account and get started${ROLE_DISPLAY[role] ? ` as ${ROLE_DISPLAY[role].label}` : ''}.`}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-5 2xl:space-y-6">

          {!showOtpField ? (
            <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="space-y-2">
                <label htmlFor="identifier" className="text-primary text-sm sm:text-base font-medium">Email Address or Mobile Number</label>
                <input
                  id="identifier"
                  type="text"
                  {...register('identifier')}
                  placeholder="Enter email or mobile number"
                  className={`w-full mt-2 p-2.5 sm:p-3 bg-light border ${errors.identifier ? 'border-red-500' : 'border-input-border'} rounded-lg text-base focus:outline-none focus:border-button-dark transition-colors`}
                />
                {errors.identifier && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.identifier.message}</p>}
              </div>

              <PasswordInput
                id="password"
                label="Password"
                placeholder="Create a password"
                register={register('password')}
                error={errors.password?.message}
              />

              <PasswordInput
                id="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter your password"
                register={register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full bg-button-dark border border-accent-green text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-[#f39c31] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingOtp ? 'Sending OTP...' : 'Sign Up'}
              </button>

              <div className="relative text-center">
                <span className="text-xs text-muted bg-white px-2">OR</span>
              </div>

              <button
                type="button"
                disabled={isGoogleRedirecting}
                onClick={() => { setIsGoogleRedirecting(true); window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/auth/google?role=${BACKEND_ROLE[role]}`; }}
                className="w-full border border-button-dark bg-white text-primary py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-header transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src={googleLogo} alt="Google" className="w-5 h-5" />
                Sign up using with Google
              </button>
            </form>
          ) : (
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-primary text-sm sm:text-base font-medium">Enter OTP</label>
                  <button onClick={handleChangeNumber} disabled={isVerifying} className="text-xs lg:text-sm text-accent-green hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <Pencil size={14} /> Edit Details
                  </button>
                </div>

                <div className="w-full">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="!w-10 !h-10 sm:!w-14 sm:!h-14 border border-input-border bg-light rounded-xl text-center text-xl font-bold text-primary focus:outline-none focus:border-accent-green focus:bg-white transition-all shadow-sm"
                      />
                    )}
                    containerStyle="flex justify-between gap-1 sm:gap-2"
                    inputType="tel"
                  />
                </div>
              </div>

              <button
                onClick={handleVerify}
                disabled={otp.length !== 6 || isVerifying}
                className="w-full bg-button-dark border border-accent-green text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-[#f39c31] transition-colors cursor-pointer mt-3 sm:mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Proceed'}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs sm:text-sm text-muted">
                  Didn't receive code? {' '}
                  <button
                    onClick={handleResend}
                    disabled={timer > 0 || isResending}
                    className={`font-semibold hover:underline cursor-pointer ${timer > 0 || isResending ? 'text-muted cursor-not-allowed' : 'text-primary'}`}
                  >
                    {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>

        {!showOtpField && onBack && (
          <button
            onClick={onBack}
            className="mt-5 sm:mt-6 text-xs sm:text-sm text-button-dark underline hover:text-secondary cursor-pointer self-start"
          >
            Back to Role Selection
          </button>
        )}
      </div>

      <div className="hidden lg:block w-1/2 bg-dark relative overflow-hidden min-h-[600px]">
        <div className="absolute inset-0 bottom-0 right-0">
          <img src={registerSideBg} alt="Decorative Topographic Lines" className="w-full h-full object-cover" />
        </div>
      </div>

    </div>
  );
};

export default RegistrationForm;
