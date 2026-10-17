import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { z } from 'zod';
import OtpInput from 'react-otp-input';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import registerSideBg from '../../../../assets/images/registerSideBg.png';
import googleLogo from '../../../../assets/icons/googleLogo.svg';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../../../schemas/loginSchema';
import PasswordInput from '../../../../components/ui/PasswordInput';
import { login } from '../../../../store/slices/authSlice';
import {
  useLoginEmail,
  useForgotPassword,
  useVerifyResetOTP,
  useResetPassword,
} from '../../../../hooks/mutations/auth';
import { setToken } from '../../../../utils/tokenStore';
import { ROLE_TO_URL } from '../../../../utils/constants/roles';

const isEmail = (val) => z.string().email().safeParse(val).success;


const VIEWS = {
  LOGIN: 'login',
  FORGOT_PASSWORD: 'forgot_password',
  FORGOT_OTP: 'forgot_otp',
  RESET_PASSWORD: 'reset_password'
};

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState(VIEWS.LOGIN);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);

  useEffect(() => {
    const googleError = searchParams.get('googleError')
    if (googleError) {
      toast.error(googleError)
      setSearchParams({})
    }
  }, [])

  const loginMutation = useLoginEmail();
  const forgotMutation = useForgotPassword();
  const verifyResetOtpMutation = useVerifyResetOTP();
  const resetMutation = useResetPassword();

  // Login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' }
  });

  // Forgot password form
  const {
    register: forgotRegister,
    handleSubmit: handleForgotSubmit,
    watch: forgotWatch,
    formState: { errors: forgotErrors }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: '' }
  });

  // Reset password form
  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const identifier = forgotWatch('identifier');

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleLogin = async (data) => {
    try {
      const body = isEmail(data.identifier)
        ? { email: data.identifier, password: data.password }
        : { phone: data.identifier, password: data.password };
      const result = await loginMutation.mutateAsync(body);
      const { user, accessToken } = result.data;
      dispatch(login({ user, accessToken }));
      setToken(accessToken);
      toast.success('Login successful!');
      if (user.registrationComplete === false) {
        const frontendRole = ROLE_TO_URL[user.role?.toLowerCase()] || user.role?.toLowerCase();
        navigate(`/register?role=${frontendRole}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Login failed');
    }
  };

  const handleForgotPassword = async (data) => {
    try {
      const body = isEmail(data.identifier)
        ? { email: data.identifier }
        : { phone: data.identifier };
      await forgotMutation.mutateAsync(body);
      setResetIdentifier(data.identifier);
      toast.success(`Reset code sent to ${data.identifier}`);
      setCurrentView(VIEWS.FORGOT_OTP);
      setTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to send reset code');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { toast.error('Please enter a valid 6-digit code'); return; }
    try {
      const body = isEmail(resetIdentifier)
        ? { email: resetIdentifier, otp }
        : { phone: resetIdentifier, otp };
      const result = await verifyResetOtpMutation.mutateAsync(body);
      setResetToken(result.data.resetToken);
      setCurrentView(VIEWS.RESET_PASSWORD);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Invalid or expired code');
    }
  };

  const handleResetPassword = async (data) => {
    try {
      await resetMutation.mutateAsync({ resetToken, newPassword: data.password });
      toast.success('Password reset successfully!');
      setCurrentView(VIEWS.LOGIN);
      setOtp('');
      setResetIdentifier('');
      setResetToken('');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Password reset failed');
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    try {
      const body = isEmail(resetIdentifier)
        ? { email: resetIdentifier }
        : { phone: resetIdentifier };
      await forgotMutation.mutateAsync(body);
      toast.success('Code resent successfully!');
      setTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to resend code');
    }
  };

  const handleBackToLogin = () => {
    setCurrentView(VIEWS.LOGIN);
    setOtp('');
    setResetIdentifier('');
    setResetToken('');
  };

  const handleChangeIdentifier = () => {
    setCurrentView(VIEWS.FORGOT_PASSWORD);
    setOtp('');
  };

  const renderView = () => {
    switch (currentView) {
      case VIEWS.LOGIN:
        return (
          <>
            <div className='mb-8 sm:mb-12 lg:mb-15 2xl:mb-20'>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-primary">Welcome back to</h3>
                  <h2 className="text-2xl sm:text-3xl lg:text-5xl 2xl:text-[46px] font-semibold text-primary leading-tight">
                    Tech Dhaara
                  </h2>
                </div>
               
              </div>
              <p className="text-muted text-xs sm:text-sm">
                Log in to access your account
              </p>
            </div>

            <form onSubmit={handleLoginSubmit(handleLogin)} className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="space-y-2">
                <label htmlFor="identifier" className="text-primary text-sm sm:text-base font-medium">
                  Email Address or Mobile Number
                </label>
                <input
                  id="identifier"
                  type="text"
                  {...loginRegister('identifier')}
                  placeholder="Enter email or mobile number"
                  className={`w-full mt-2 p-2.5 sm:p-3 bg-light border ${loginErrors.identifier ? 'border-red-500' : 'border-input-border'} rounded-lg text-base focus:outline-none focus:border-button-dark transition-colors`}
                />
                {loginErrors.identifier && <p className="text-red-500 text-xs lg:text-sm mt-1">{loginErrors.identifier.message}</p>}
              </div>

              <div className="space-y-2">
                <PasswordInput
                  id="password"
                  label="Password"
                  placeholder="Enter your password"
                  register={loginRegister('password')}
                  error={loginErrors.password?.message}
                />
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setCurrentView(VIEWS.FORGOT_PASSWORD)}
                    className="text-xs sm:text-sm text-primary hover:text-secondary underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-button-dark border border-accent-green text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-[#f39c31] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? 'Logging in...' : 'Log In'}
              </button>

              <div className="relative text-center">
                <span className="text-xs text-muted bg-white px-2">OR</span>
              </div>

              <button
                type="button"
                disabled={isGoogleRedirecting}
                onClick={() => { setIsGoogleRedirecting(true); window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/auth/google?role=GENERAL_USER&source=login`; }}
                className="w-full border border-button-dark bg-white text-primary py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-header transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src={googleLogo} alt="Google" className="w-5 h-5" />
                Sign in with Google
              </button>
            </form>
          </>
        );

      case VIEWS.FORGOT_PASSWORD:
        return (
          <>
            <div className='mb-8 sm:mb-12 lg:mb-15 2xl:mb-20'>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-primary">Reset Your</h3>
                  <h2 className="text-2xl sm:text-3xl lg:text-5xl 2xl:text-[46px] font-semibold text-primary leading-tight">
                    Password
                  </h2>
                </div>
              </div>
              <p className="text-muted text-xs sm:text-sm">
                Enter your email or mobile number to receive a reset code
              </p>
            </div>

            <form onSubmit={handleForgotSubmit(handleForgotPassword)} className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="space-y-2">
                <label htmlFor="forgot-identifier" className="text-primary text-sm sm:text-base font-medium">
                  Email Address or Mobile Number
                </label>
                <input
                  id="forgot-identifier"
                  type="text"
                  {...forgotRegister('identifier')}
                  placeholder="Enter email or mobile number"
                  className={`w-full mt-2 p-2.5 sm:p-3 bg-light border ${forgotErrors.identifier ? 'border-red-500' : 'border-input-border'} rounded-lg text-base focus:outline-none focus:border-button-dark transition-colors`}
                />
                {forgotErrors.identifier && <p className="text-red-500 text-xs lg:text-sm mt-1">{forgotErrors.identifier.message}</p>}
              </div>

              <button
                type="submit"
                disabled={forgotMutation.isPending}
                className="w-full bg-button-dark border border-accent-green text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotMutation.isPending ? 'Sending...' : 'Send Reset Code'}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full text-xs sm:text-sm text-button-dark underline hover:text-secondary cursor-pointer"
              >
                Back to Login
              </button>
            </form>
          </>
        );

      case VIEWS.FORGOT_OTP:
        return (
          <>
            <div className='mb-8 sm:mb-12 lg:mb-15 2xl:mb-20'>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-primary">Verify</h3>
                  <h2 className="text-2xl sm:text-3xl lg:text-5xl 2xl:text-[46px] font-semibold text-primary leading-tight">
                    Reset Code
                  </h2>
                </div> 
              </div>
              <p className="text-muted text-xs sm:text-sm">
                We've sent a verification code to {resetIdentifier}
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-primary text-sm sm:text-base font-medium">Enter Code</label>
                  <button
                    type="button"
                    onClick={handleChangeIdentifier}
                    className="text-xs lg:text-sm text-accent-green hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil size={14} /> Change Email/Mobile
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
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || verifyResetOtpMutation.isPending}
                className="w-full bg-button-dark border border-accent-green text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-primary transition-colors cursor-pointer mt-3 sm:mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyResetOtpMutation.isPending ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs sm:text-sm text-muted">
                  Didn't receive code?{' '}
                  <button
                    onClick={handleResendOtp}
                    disabled={timer > 0 || forgotMutation.isPending}
                    className={`font-semibold hover:underline cursor-pointer ${timer > 0 || forgotMutation.isPending ? 'text-muted cursor-not-allowed' : 'text-primary'}`}
                  >
                    {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
                  </button>
                </p>
              </div>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full text-xs sm:text-sm text-button-dark underline hover:text-secondary cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </>
        );

      case VIEWS.RESET_PASSWORD:
        return (
          <>
            <div className='mb-8 sm:mb-12 lg:mb-15 2xl:mb-20'>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-5xl 2xl:text-[46px] font-semibold text-primary leading-tight">
                   Create New Password
                  </h2>
                </div>
              </div>
              <p className="text-muted text-xs sm:text-sm">
                Enter a strong password for your account
              </p>
            </div>

            <form onSubmit={handleResetSubmit(handleResetPassword)} className="space-y-4 sm:space-y-5 lg:space-y-6">
              <PasswordInput
                id="new-password"
                label="New Password"
                placeholder="Create a new password"
                register={resetRegister('password')}
                error={resetErrors.password?.message}
              />

              <PasswordInput
                id="confirm-new-password"
                label="Confirm Password"
                placeholder="Re-enter your password"
                register={resetRegister('confirmPassword')}
                error={resetErrors.confirmPassword?.message}
              />

              <button
                type="submit"
                disabled={resetMutation.isPending}
                className="w-full bg-button-dark border border-accent-green text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setCurrentView(VIEWS.FORGOT_OTP)}
                className="w-full text-xs sm:text-sm text-button-dark underline hover:text-secondary cursor-pointer"
              >
                Back
              </button>
            </form>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white max-lg:max-w-[500px] mx-auto border border-accent-green-dark rounded-2xl sm:rounded-3xl overflow-hidden w-full flex flex-col lg:flex-row">

      <div className="w-full lg:w-1/2 p-5 sm:p-8 lg:p-10 xl:p-12 relative flex flex-col justify-center">

        <div className="space-y-4 sm:space-y-5 2xl:space-y-6">
          {renderView()}
        </div>

        {currentView === VIEWS.LOGIN && (
          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:text-secondary underline">
                Sign up
              </Link>
            </p>
          </div>
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

export default LoginForm;
