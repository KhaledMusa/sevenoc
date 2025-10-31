
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, getUserProfile, getLikedTrackIds, updateUserAvatar } from '../services/supabase';
import { User } from '../types';
import Spinner from '../components/Spinner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  likedTrackIds: Set<string>;
  setLikedTrackIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  updateUserProfile: (displayName: string, avatarFile?: File) => Promise<{ error: Error | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedTrackIds, setLikedTrackIds] = useState(new Set<string>());

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      const currentUser = session?.user;
      if (currentUser) {
        const [profile, likedIds] = await Promise.all([
            getUserProfile(currentUser.id),
            getLikedTrackIds(currentUser.id)
        ]);
        
        if (profile) {
            setUser({ ...profile, email: currentUser.email });
            setLikedTrackIds(likedIds);
        } else {
            console.warn(`Could not fetch profile for user ${currentUser.id}. The user may have been created without a profile entry.`);
            setUser(null);
            setLikedTrackIds(new Set());
        }
      } else {
        setUser(null);
        setLikedTrackIds(new Set());
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                display_name: displayName,
            }
        }
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error: error ? new Error(error.message) : null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const updateUserProfile = async (displayName: string, avatarFile?: File) => {
    if (!user) return { error: new Error("User not authenticated.") };
    
    let newAvatarUrl: string | undefined = undefined;
    if (avatarFile) {
        try {
            newAvatarUrl = await updateUserAvatar(user.id, avatarFile);
        } catch (err: any) {
            return { error: new Error(err.message) };
        }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        display_name: displayName,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
        setUser(prevUser => prevUser ? ({ 
            ...prevUser,
            displayName: data.display_name,
            // Update avatar if a new one was uploaded, otherwise keep the old one
            avatarUrl: newAvatarUrl || prevUser.avatarUrl,
        }) : null);
    }
    
    return { error: error ? new Error(error.message) : null };
  };

  const value = {
    user,
    loading,
    likedTrackIds,
    setLikedTrackIds,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateUserProfile,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
