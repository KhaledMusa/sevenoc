import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTracks } from '../hooks/useTracks';
import { useLanguage } from '../hooks/useLanguage';
import { uploadTrack, getGenres } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, Music, FileImage, AlertCircle, CheckCircle } from 'lucide-react';

interface IFormInput {
  title: string;
  genreId: number;
  audioFile: FileList;
  imageFile: FileList;
}

const UploadPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { addTrack } = useTracks();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [genres, setGenres] = useState<{ genre_id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const fetchedGenres = await getGenres();
        setGenres(fetchedGenres);
      } catch (err: any) {
        setError(err.message || "Failed to load genres.");
      }
    };
    fetchGenres();
  }, []);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const audioFile = data.audioFile[0];
    const imageFile = data.imageFile?.[0];

    // File size validation
    if (audioFile.size > 50 * 1024 * 1024) { // 50MB
        setError(t('error_file_size_audio'));
        setIsSubmitting(false);
        return;
    }
     if (imageFile && imageFile.size > 5 * 1024 * 1024) { // 5MB
        setError(t('error_file_size_img'));
        setIsSubmitting(false);
        return;
    }

    try {
      const newTrack = await uploadTrack(data.title, Number(data.genreId), audioFile, imageFile || null);
      addTrack(newTrack);
      setSuccess(t('upload_success'));
      setTimeout(() => navigate('/my-tracks'), 2000);
    } catch (err: any) {
      setError(err.message || t('error_uploading'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6">{t('upload_track')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('title')}</label>
          <input
            id="title"
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="genreId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('genre')}</label>
          <select
            id="genreId"
            {...register('genreId', { required: 'Genre is required' })}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select a genre...</option>
            {genres.map(genre => (
              <option key={genre.genre_id} value={genre.genre_id}>{genre.name}</option>
            ))}
          </select>
          {errors.genreId && <p className="mt-1 text-sm text-red-500">{errors.genreId.message}</p>}
        </div>

        <div>
          <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('audio_file')}</label>
          <div className="mt-1 flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
            <Music className="w-5 h-5 text-gray-400 mr-2" />
            <input
                id="audioFile"
                type="file"
                accept="audio/*"
                {...register('audioFile', { required: 'Audio file is required' })}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
            />
          </div>
          {errors.audioFile && <p className="mt-1 text-sm text-red-500">{errors.audioFile.message}</p>}
        </div>
        
        <div>
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('cover_image')}</label>
          <div className="mt-1 flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
            <FileImage className="w-5 h-5 text-gray-400 mr-2" />
            <input
                id="imageFile"
                type="file"
                accept="image/*"
                {...register('imageFile')}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
            />
          </div>
        </div>

        {error && <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-300"><AlertCircle className="w-5 h-5 mr-2" />{error}</div>}
        {success && <div className="flex items-center p-3 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900/20 dark:text-green-300"><CheckCircle className="w-5 h-5 mr-2" />{success}</div>}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
        >
          {isSubmitting ? (
            <>
              <UploadCloud className="w-5 h-5 mr-2 animate-pulse" />
              {t('uploading')}
            </>
          ) : (
            t('submit')
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default UploadPage;
