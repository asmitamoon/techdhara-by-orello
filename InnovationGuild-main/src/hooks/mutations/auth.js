import { useMutation } from '@tanstack/react-query';
import * as authApi from '../../api/auth';

// ── Core auth ──────────────────────────────────────────────────────────────
export const useLoginEmail        = () => useMutation({ mutationFn: authApi.loginEmail });
export const useRegisterEmail     = () => useMutation({ mutationFn: authApi.registerEmail });
export const useVerifyEmail       = () => useMutation({ mutationFn: authApi.verifyEmail });
export const useForgotPassword    = () => useMutation({ mutationFn: authApi.forgotPassword });
export const useVerifyResetOTP    = () => useMutation({ mutationFn: authApi.verifyResetOTP });
export const useResetPassword     = () => useMutation({ mutationFn: authApi.resetPassword });
export const useResendOtp         = () => useMutation({ mutationFn: authApi.resendOtp });
export const useMobileLogin       = () => useMutation({ mutationFn: authApi.mobileLogin });
export const useVerifyMobile      = () => useMutation({ mutationFn: authApi.verifyMobile });
export const useResendMobileOtp   = () => useMutation({ mutationFn: authApi.resendMobileOtp });
export const useLogout            = () => useMutation({ mutationFn: authApi.logoutAuth });
export const useUploadProfileImage = () => useMutation({ mutationFn: authApi.uploadProfileImage });

// ── Profile completion ─────────────────────────────────────────────────────
export const useCompleteVleRegistration         = () => useMutation({ mutationFn: authApi.completeVleRegistration });
export const useCompleteAoRegistration          = () => useMutation({ mutationFn: authApi.completeAoRegistration });
export const useCompleteInnovatorRegistration   = () => useMutation({ mutationFn: authApi.completeInnovatorRegistration });
export const useCompleteNodalOrgRegistration    = () => useMutation({ mutationFn: authApi.completeNodalOrgRegistration });
export const useCompleteGeneralUserRegistration = () => useMutation({ mutationFn: authApi.completeGeneralUserRegistration });
