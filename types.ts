import { User as SupabaseUser } from '@supabase/supabase-js';

// Define the user type, which can be extended from Supabase's user type if needed.
export interface User {
  id: string;
  displayName: string;
  avatarUrl: string; // This is now generated client-side, not from the DB
  email?: string;
}

// Define the structure for a music track, now perfectly matching the database schema.
export interface Track {
  id: string; // Changed from number to string to match UUID
  title: string;
  genre: string;
  audioUrl: string;
  coverArtUrl: string; // Changed from coverImageUrl to match DB column 'cover_art_url'
  duration: number;
  likeCount: number; // Added to store the number of likes
  uploadedAt: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string;
  };
}

// Define possible themes for the application.
export type Theme = 'light' | 'dark';

// Define supported languages.
export type Language = 'en' | 'ar';