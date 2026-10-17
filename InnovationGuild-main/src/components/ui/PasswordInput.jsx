import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({
  id,
  placeholder = "Enter password",
  error,
  register,
  label,
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-primary text-sm sm:text-base font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          {...register}
          placeholder={placeholder}
          className={`w-full mt-2 p-2.5 sm:p-3 bg-light border ${
            error ? 'border-red-500' : 'border-input-border'
          } rounded-lg text-base focus:outline-none focus:border-button-dark transition-colors pr-10 ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[calc(50%+0.25rem)] -translate-y-1/2 text-muted hover:text-primary transition-colors cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-xs lg:text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default PasswordInput;
