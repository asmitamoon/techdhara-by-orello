import React, { useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';

const ImageUpload = ({
  id = "profilePic",
  label = "Add a profile picture",
  file,
  onChange,
  error,
  icon: Icon = Plus,
  disabled = false
}) => {
  // Compute imageSrc only when `file` changes — not on every render
  const imageSrc = useMemo(() => {
    if (!file) return null;
    if (typeof file === 'string') return file;
    if (file instanceof File) return URL.createObjectURL(file);
    return null;
  }, [file]);

  // Revoke the blob URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (file instanceof File && imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-accent-green-dark flex items-center justify-center bg-[#fef2eb] overflow-hidden group transition-colors ${!disabled ? 'hover:border-accent-green-dark cursor-pointer' : ''}`}>
        <input
          type="file"
          id={id}
          onChange={onChange}
          className={`absolute inset-0 opacity-0 z-10 ${!disabled ? 'cursor-pointer' : 'pointer-events-none'}`}
          accept="image/*"
          disabled={disabled}
        />
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Preview"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-green-dark rounded-full flex items-center justify-center text-white">
            <Icon size={id === "logo" ? 32 : 24} />
          </div>
        )}
      </div>
      <div>
        <label htmlFor={id} className={`text-primary text-sm sm:text-base font-medium block ${!disabled ? 'cursor-pointer' : ''}`}>
          {label}
        </label>
        {!disabled ? (
          <p className="text-xs text-muted">
            Drop an image or <label htmlFor={id} className="underline cursor-pointer hover:text-accent-green-dark">choose</label>
          </p>
        ) : null}
        {error && <p className="text-red-500 text-xs lg:text-sm mt-1">{error.message}</p>}
      </div>
    </div>
  );
};

export default ImageUpload;
