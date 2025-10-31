import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import Spinner from '../components/Spinner';

type FormMode = 'signIn' | 'signUp';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<FormMode>('signIn');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit: SubmitHandler<any> = async (data) => {
    setLoading(true);
    setError(null);
    let authError: { error: Error | null } | null = null;
    if (mode === 'signIn') {
      authError = await signIn(data.email, data.password);
    } else {
      authError = await signUp(data.email, data.password, data.displayName);
    }
    
    if (authError?.error) {
      setError(authError.error.message === 'Invalid login credentials' ? t('invalid_credentials') : authError.error.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
      setLoading(true);
      const { error } = await signInWithGoogle();
      if (error) {
          setError(error.message);
      }
      setLoading(false);
  }

  const password = watch("password");

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
  const errorTextClass = "mt-1 text-sm text-red-500";
  const primaryButtonClass = "w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)]">
        <motion.div
            layout
            className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-[#181818] rounded-lg shadow-lg"
        >
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setMode('signIn')}
                    className={`w-1/2 py-3 text-sm font-medium transition-colors ${mode === 'signIn' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t('login')}
                </button>
                <button
                    onClick={() => setMode('signUp')}
                    className={`w-1/2 py-3 text-sm font-medium transition-colors ${mode === 'signUp' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Sign Up
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.form
                    key={mode}
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {mode === 'signUp' && (
                        <div>
                            <label className={labelClass}>{t('display_name')}</label>
                            <input type="text" {...register("displayName", { required: true })} className={inputClass} />
                            {errors.displayName && <p className={errorTextClass}>Display name is required.</p>}
                        </div>
                    )}
                    <div>
                        <label className={labelClass}>{t('email')}</label>
                        <input type="email" {...register("email", { required: true })} className={inputClass} />
                        {errors.email && <p className={errorTextClass}>Email is required.</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Password</label>
                        <input type="password" {...register("password", { required: true, minLength: 6 })} className={inputClass} />
                        {errors.password && <p className={errorTextClass}>Password must be at least 6 characters.</p>}
                    </div>
                    {mode === 'signUp' && (
                         <div>
                            <label className={labelClass}>Confirm Password</label>
                            <input type="password" {...register("confirmPassword", { required: true, validate: value => value === password })} className={inputClass} />
                            {errors.confirmPassword && <p className={errorTextClass}>Passwords must match.</p>}
                        </div>
                    )}

                    {error && <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-300"><AlertCircle className="w-5 h-5 mr-2" />{error}</div>}

                    <button type="submit" className={primaryButtonClass} disabled={loading}>
                        {loading ? <Spinner /> : (mode === 'signIn' ? <><LogIn className="mr-2" size={16}/>{t('login')}</> : <><UserPlus className="mr-2" size={16}/>Sign Up</>)}
                    </button>
                </motion.form>
            </AnimatePresence>
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-[#181818] text-gray-500">OR</span>
                </div>
            </div>

            <button onClick={handleGoogleSignIn} className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700" disabled={loading}>
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.24,44,30.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                Sign in with Google
            </button>
        </motion.div>
    </div>
  );
};

export default AuthPage;
