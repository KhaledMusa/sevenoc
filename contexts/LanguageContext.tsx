import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language } from '../types';

const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    home: 'Home',
    discover: 'Discover',
    error: 'Error',
    // Header
    my_tracks: 'My Tracks',
    upload: 'Upload',
    settings: 'Settings',
    login: 'Login',
    logout: 'Logout',
    // Audio Player
    not_playing: 'Nothing is playing right now.',
    // Upload Page
    upload_track: 'Upload a New Track',
    title: 'Title',
    genre: 'Genre',
    audio_file: 'Audio File',
    cover_image: 'Cover Image (Optional)',
    submit: 'Submit Track',
    uploading: 'Uploading...',
    upload_success: 'Track uploaded successfully!',
    error_uploading: 'An error occurred during upload. Please try again.',
    error_file_size_audio: 'Audio file must be less than 50MB.',
    error_file_size_img: 'Image file must be less than 5MB.',
    // Settings Page
    profile_settings: 'Profile Settings',
    avatar: 'Avatar',
    display_name: 'Display Name',
    email: 'Email',
    update_profile: 'Update Profile',
    profile_updated: 'Profile updated successfully!',
    // Auth Page
    invalid_credentials: 'Invalid email or password.',
  },
  ar: {
    // General
    home: 'الرئيسية',
    discover: 'اكتشف',
    error: 'خطأ',
    // Header
    my_tracks: 'موسيقاي',
    upload: 'رفع ملف',
    settings: 'الإعدادات',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    // Audio Player
    not_playing: 'لا يوجد شيء قيد التشغيل حاليًا.',
    // Upload Page
    upload_track: 'رفع مقطع صوتي جديد',
    title: 'العنوان',
    genre: 'النوع',
    audio_file: 'الملف الصوتي',
    cover_image: 'صورة الغلاف (اختياري)',
    submit: 'إرسال المقطع',
    uploading: 'جاري الرفع...',
    upload_success: 'تم رفع المقطع بنجاح!',
    error_uploading: 'حدث خطأ أثناء الرفع. يرجى المحاولة مرة أخرى.',
    error_file_size_audio: 'يجب أن يكون حجم الملف الصوتي أقل من 50 ميغابايت.',
    error_file_size_img: 'يجب أن يكون حجم ملف الصورة أقل من 5 ميغابايت.',
    // Settings Page
    profile_settings: 'إعدادات الملف الشخصي',
    avatar: 'الصورة الرمزية',
    display_name: 'اسم العرض',
    email: 'البريد الإلكتروني',
    update_profile: 'تحديث الملف الشخصي',
    profile_updated: 'تم تحديث الملف الشخصي بنجاح!',
    // Auth Page
    invalid_credentials: 'بريد إلكتروني أو كلمة مرور غير صالحة.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Language | null;
    if (storedLang && ['en', 'ar'].includes(storedLang)) {
      setLanguage(storedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    const newDir = language === 'ar' ? 'rtl' : 'ltr';
    setDir(newDir);
    document.documentElement.lang = language;
    document.documentElement.dir = newDir;
  }, [language]);

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};
