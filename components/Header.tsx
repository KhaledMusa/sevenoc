import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { Sun, Moon, LogOut, Settings, Music, Upload, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLangMenuOpen, setLangMenuOpen] = useState(false);

  const navLinks = [
    { name: t('home'), path: '/' },
    // A discover link could be added in the future
    // { name: t('discover'), path: '/discover' },
  ];
  
  const userNavLinks = [
      { name: t('my_tracks'), path: '/my-tracks', icon: Music },
      { name: t('upload'), path: '/upload', icon: Upload },
      { name: t('settings'), path: '/settings', icon: Settings },
  ]

  const handleSignOut = async () => {
    await signOut();
    setProfileMenuOpen(false);
    navigate('/');
  };
  
  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setLangMenuOpen(false);
  }

  const renderNavLinks = (isMobile = false) => (
    <nav className={isMobile ? "flex flex-col space-y-2" : "hidden md:flex items-center space-x-6"}>
      {navLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${
              isActive ? 'text-primary-500' : 'text-gray-500 dark:text-gray-300 hover:text-primary-500'
            }`
          }
          onClick={() => isMobile && closeAllMenus()}
        >
          {link.name}
        </NavLink>
      ))}
    </nav>
  );
  
  const renderUserMenu = () => (
    <div className="relative">
      <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} data-testid="profile-menu-button">
        <img
          src={user?.avatarUrl}
          alt={user?.displayName}
          className="w-8 h-8 rounded-full"
        />
      </button>
      <AnimatePresence>
        {isProfileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#181818] rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-2 border-b dark:border-gray-700">
                <p className="text-sm font-semibold truncate">{user?.displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            {userNavLinks.map(link => (
                <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <link.icon className="w-4 h-4 mr-2" />
                    {link.name}
                </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  
  const renderLanguageMenu = () => (
    <div className="relative">
        <button onClick={() => setLangMenuOpen(!isLangMenuOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Globe size={20} />
        </button>
        <AnimatePresence>
        {isLangMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-28 bg-white dark:bg-[#181818] rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
          >
            <button 
                onClick={() => { setLanguage('en'); setLangMenuOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'font-bold' : ''} hover:bg-gray-100 dark:hover:bg-gray-800`}
            >
                English
            </button>
            <button 
                onClick={() => { setLanguage('ar'); setLangMenuOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm ${language === 'ar' ? 'font-bold' : ''} hover:bg-gray-100 dark:hover:bg-gray-800`}
            >
                العربية
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );


  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <Music className="w-6 h-6 text-primary-500" />
            <span className="font-bold text-lg">sevenoc</span>
          </Link>
          {renderNavLinks()}
        </div>

        <div className="flex items-center space-x-4">
          {renderLanguageMenu()}
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          {user ? (
            renderUserMenu()
          ) : (
            <Link to="/auth" className="hidden md:inline-block px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-600">
              {t('login')}
            </Link>
          )}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-black"
          >
            <div className="px-4 pt-2 pb-4 space-y-4">
                {renderNavLinks(true)}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                {user ? (
                    userNavLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center w-full px-2 py-2 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <link.icon className="w-5 h-5 mr-3" />
                            {link.name}
                        </Link>
                    ))
                ) : (
                    <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600"
                    >
                    {t('login')}
                    </Link>
                )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
