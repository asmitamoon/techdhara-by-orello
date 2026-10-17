import React from 'react';
import OtpInput from 'react-otp-input';
import { Pencil, X } from 'lucide-react';

const OTPVerificationModal = ({
  isOpen,
  onClose,
  onVerify,
  onResend,
  identifier,
  timer,
  otp,
  setOtp,
  isLoading = false,
  buttonText = "Verify & Create VLE"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 w-full max-w-md mx-4 border border-accent-green-dark">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-dark transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary mb-2">
            Verify OTP
          </h2>
          <p className="text-sm text-muted">
            We've sent a verification code to <span className="font-medium text-primary">{identifier}</span>
          </p>
        </div>

        {/* OTP Input Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-primary text-sm sm:text-base font-medium">Enter OTP</label>
              <button
                onClick={onClose}
                className="text-xs lg:text-sm text-accent-green hover:underline flex items-center gap-1 cursor-pointer"
              >
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

          {/* Verify Button */}
          <button
            onClick={onVerify}
            disabled={otp.length !== 6 || isLoading}
            className="w-full bg-button-dark border border-accent-green-dark text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : buttonText}
          </button>

          {/* Resend Section */}
          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-muted">
              Didn't receive code? {' '}
              <button
                onClick={onResend}
                disabled={timer > 0}
                className={`font-semibold hover:underline cursor-pointer ${timer > 0 ? 'text-muted cursor-not-allowed' : 'text-primary'}`}
              >
                {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
