
import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { TracksProvider } from './TracksContext';
import { AudioProvider } from './AudioContext';

interface CombinedProviderProps {
    children: React.ReactNode;
}

export const CombinedProvider: React.FC<CombinedProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TracksProvider>
            <AudioProvider>
              {children}
            </AudioProvider>
          </TracksProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};
