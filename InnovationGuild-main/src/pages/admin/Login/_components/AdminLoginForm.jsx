import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { z } from 'zod';
import toast from 'react-hot-toast';
import PasswordInput from '../../../../components/ui/PasswordInput';
import { login } from '../../../../store/slices/authSlice';
import { useLoginEmail } from '../../../../hooks/mutations/auth';
import { setToken } from '../../../../utils/tokenStore';

const adminLoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const AdminLoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginMutation = useLoginEmail();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await loginMutation.mutateAsync({ email: data.email, password: data.password });
      const { user, accessToken } = result.data;

      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        toast.error('Not authorized as admin');
        return;
      }

      dispatch(login({ user, accessToken }));
      setToken(accessToken);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Login failed');
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="font-heading font-semibold text-xl text-primary">Tech Dhaara</span>
        </div>
        <h1 className="text-2xl font-heading font-semibold text-heading">Admin Login</h1>
        <p className="text-muted text-sm mt-1">Sign in to access the admin dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`p-3 border border-accent-green-light rounded-xl focus:outline-none focus:border-accent-green-dark bg-light text-sm sm:text-base lg:text-lg placeholder:text-placeholder transition-colors;
  } w-full${errors.email ? ' border-red-500' : ''}`}
            placeholder="admin@example.com"
            {...register('email')}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="form-label" htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            register={register('password')}
            error={errors.password?.message}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-button-primary text-white font-semibold rounded-xl py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default AdminLoginForm;
