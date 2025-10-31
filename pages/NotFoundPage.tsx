
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';

const NotFoundPage: React.FC = () => {
    const { t } = useLanguage();
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center h-[calc(100vh-15rem)]"
        >
            <h1 className="text-9xl font-extrabold text-primary-500 tracking-widest">404</h1>
            <div className="bg-gray-800 dark:bg-gray-200 px-2 text-sm rounded rotate-12 absolute text-white dark:text-black">
                Page Not Found
            </div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Sorry, the page you are looking for does not exist.
            </p>
            <Link
                to="/"
                className="mt-6 inline-block px-8 py-3 bg-primary-500 text-white font-semibold rounded-md hover:bg-primary-600 transition-transform transform hover:scale-105"
            >
                {t('home')}
            </Link>
        </motion.div>
    );
};

export default NotFoundPage;
