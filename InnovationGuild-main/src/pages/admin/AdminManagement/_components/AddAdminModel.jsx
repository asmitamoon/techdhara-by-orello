import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminSchema } from '../../../../schemas/registrationSchema';
import { useCreateAdminAdmin } from '../../../../hooks/queries/admin';

const AddAdminModel = ({ open, onClose }) => {
  const createMutation = useCreateAdminAdmin();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = ({ fullName, email, password }) => {
    createMutation.mutate({ fullName, email, password }, {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-page w-105 max-w-[90%] rounded-2xl shadow-xl p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#403F32]">
            Add New Admin
          </h2>
          <button
            onClick={handleClose}
            className="text-black text-2xl cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            name="fullName"
            register={register}
            error={errors.fullName}
          />
          <Input
            label="Email Address"
            type="email"
            name="email"
            register={register}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            register={register}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            register={register}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-button-green cursor-pointer hover:bg-accent-green-dark text-white px-6 py-2 rounded-md text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
};

const Input = ({ label, type = "text", name, register, error }) => (
  <div>
    <label className="block text-sm font-medium text-black mb-1">
      {label}
    </label>
    <input
      type={type}
      {...register(name)}
      className="w-full rounded-md border border-input-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-green-dark"
    />
    {error && (
      <p className="text-sm text-[#D55E5E] mt-1">{error.message}</p>
    )}
  </div>
);

export default AddAdminModel;
