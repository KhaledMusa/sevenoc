import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AudioPlayer from './components/AudioPlayer';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';
import MyTracksPage from './pages/MyTracksPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#121212] text-black dark:text-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/my-tracks" element={<ProtectedRoute><MyTracksPage /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <AudioPlayer />
      </div>
    </Router>
  );
};

export default App;
