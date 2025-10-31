
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import Spinner from '../components/Spinner';

interface IFormInput {
  displayName: string;
  avatarFile: FileList;
}

const SettingsPage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<IFormInput>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { t } = useLanguage();
  
  const avatarFile = watch('avatarFile');

  useEffect(() => {
    if (user) {
      setValue('displayName', user.displayName);
      setAvatarPreview(user.avatarUrl);
    }
  }, [user, setValue]);
  
  useEffect(() => {
    if (avatarFile && avatarFile.length > 0) {
      const file = avatarFile[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image file must be less than 5MB.");
        return;
      }
      setError(null);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [avatarFile]);


  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const newAvatarFile = data.avatarFile?.[0];

    const { error: updateError } = await updateUserProfile(data.displayName, newAvatarFile);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(t('profile_updated'));
    }
    
    setIsSubmitting(false);
  };
  
  if (!user) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-md mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6">{t('profile_settings')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('avatar')}</label>
          <div className="mt-2 flex items-center space-x-4">
              {avatarPreview && <img src={avatarPreview} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover"/>}
              <label htmlFor="avatarFile" className="cursor-pointer px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <div className="flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Change Picture
                  </div>
                  <input id="avatarFile" type="file" accept="image/*" {...register('avatarFile')} className="hidden" />
              </label>
          </div>
        </div>
        
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('display_name')}</label>
          <input
            id="displayName"
            type="text"
            {...register('displayName', { required: 'Display name is required' })}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.displayName && <p className="mt-1 text-sm text-red-500">{errors.displayName.message}</p>}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('email')}</label>
          <input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm cursor-not-allowed"
          />
        </div>

        {error && <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-300"><AlertCircle className="w-5 h-5 mr-2" />{error}</div>}
        {success && <div className="flex items-center p-3 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900/20 dark:text-green-300"><CheckCircle className="w-5 h-5 mr-2" />{success}</div>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
        >
          {isSubmitting ? t('uploading') : t('update_profile')}
        </button>
      </form>
    </motion.div>
  );
};

export default SettingsPage;
