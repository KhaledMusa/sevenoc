

import { createClient } from '@supabase/supabase-js';
import { Track, User } from '../types';
import { getAudioDuration } from '../utils/helpers';

// Fix: Hardcoded Supabase credentials to resolve the critical connection error.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is not defined.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'media';

// **IMPROVED**: Now fetches the stored avatar_url and has a fallback.
export const getUserProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error(`Supabase error fetching profile for user ${userId}:`, error.message);
        throw new Error(`Failed to fetch profile. Please check RLS policies on 'profiles' table. DB Error: ${error.message}`);
    }

    if (!data) return null;

    // Use the stored avatar_url if it exists, otherwise generate one.
    const avatarUrl = data.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(data.display_name || 'User')}`;
    
    return {
        id: data.id,
        displayName: data.display_name || 'Unknown Artist',
        avatarUrl: avatarUrl,
    };
};

// **NEW**: A dedicated function to upload an avatar and update the profile.
export const updateUserAvatar = async (userId: string, avatarFile: File): Promise<string> => {
    const filePath = `avatars/${userId}/${Date.now()}-${avatarFile.name}`;
    
    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

    if (dbError) throw new Error(`Failed to update profile with new avatar URL: ${dbError.message}`);

    return publicUrl;
};


interface GetTracksParams {
    userId?: string;
    genreId?: number;
    limit?: number;
}
export const getTracks = async (params: GetTracksParams = {}): Promise<Track[]> => {
    let query = supabase
        .from('tracks')
        .select('track_id, title, duration, audio_url, cover_art_url, user_id, genre_id, uploaded_at')
        .order('uploaded_at', { ascending: false });

    if (params.userId) query = query.eq('user_id', params.userId);
    if (params.genreId) query = query.eq('genre_id', params.genreId);
    if (params.limit) query = query.limit(params.limit);

    const { data: tracksData, error: tracksError } = await query;
    if (tracksError) throw new Error(`Failed to fetch tracks. DB Error: ${tracksError.message}`);
    if (!tracksData || tracksData.length === 0) return [];

    const trackIds = tracksData.map(t => t.track_id);
    const userIds = [...new Set(tracksData.map(t => t.user_id).filter(id => id))];
    const genreIds = [...new Set(tracksData.map(t => t.genre_id).filter(id => id))];

    const [profilesResponse, genresResponse, likesResponse] = await Promise.all([
        userIds.length > 0 ? supabase.from('profiles').select('id, display_name, avatar_url').in('id', userIds) : Promise.resolve({ data: [], error: null }),
        genreIds.length > 0 ? supabase.from('genres').select('genre_id, name').in('genre_id', genreIds) : Promise.resolve({ data: [], error: null }),
        trackIds.length > 0 ? supabase.from('track_likes').select('track_id').in('track_id', trackIds) : Promise.resolve({ data: [], error: null })
    ]);

    if (profilesResponse.error || genresResponse.error || likesResponse.error) {
        console.error('Error fetching relations:', profilesResponse.error, genresResponse.error, likesResponse.error);
        throw new Error('Failed to fetch related artist, genre, or like data.');
    }
    
    const profileMap = new Map((profilesResponse.data || []).map((p: { id: string; display_name: string; avatar_url: string | null; }) => [p.id, { displayName: p.display_name, avatarUrl: p.avatar_url }]));
    const genreMap = new Map((genresResponse.data || []).map((g: { genre_id: number; name: string; }) => [g.genre_id, g.name]));
    
    const likeCounts = new Map<string, number>();
    if (likesResponse.data) {
        for (const like of likesResponse.data) {
            likeCounts.set(like.track_id, (likeCounts.get(like.track_id) || 0) + 1);
        }
    }

    return tracksData.map(track => {
        const profile = profileMap.get(track.user_id);
        const displayName = profile?.displayName || 'Unknown Artist';
        const avatarUrl = profile?.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
        
        return {
            id: track.track_id,
            title: track.title,
            duration: track.duration,
            audioUrl: track.audio_url,
            coverArtUrl: track.cover_art_url,
            genre: genreMap.get(track.genre_id) || 'Uncategorized',
            likeCount: likeCounts.get(track.track_id) || 0,
            uploadedAt: track.uploaded_at,
            user: {
                id: track.user_id,
                displayName: displayName,
                avatarUrl: avatarUrl,
            },
        };
    });
};

export const getLikedTrackIds = async (userId: string): Promise<Set<string>> => {
    const { data, error } = await supabase
        .from('track_likes')
        .select('track_id')
        .eq('user_id', userId);
    if (error) {
        console.error("Error fetching liked tracks:", error);
        return new Set();
    }
    return new Set(data.map(like => like.track_id));
};

export const likeTrack = async (trackId: string, userId: string) => {
    const { error } = await supabase.from('track_likes').insert({ track_id: trackId, user_id: userId });
    if (error) throw new Error(error.message);
};

export const unlikeTrack = async (trackId: string, userId: string) => {
    const { error } = await supabase.from('track_likes').delete().match({ track_id: trackId, user_id: userId });
    if (error) throw new Error(error.message);
};

export const getGenres = async (): Promise<{ genre_id: number; name: string }[]> => {
    const { data, error } = await supabase
        .from('genres')
        .select('genre_id, name')
        .order('name', { ascending: true });

    if (error) throw new Error(`Error fetching genres: ${error.message}`);
    return data || [];
};

export const uploadTrack = async (
    title: string,
    genreId: number,
    audioFile: File,
    imageFile: File | null
): Promise<Track> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated for upload.");

    const audioFilePath = `audio/${user.id}/${Date.now()}-${audioFile.name}`;
    const { error: audioError } = await supabase.storage.from(BUCKET_NAME).upload(audioFilePath, audioFile);
    if (audioError) throw new Error(`Audio upload failed: ${audioError.message}`);
    const { data: { publicUrl: audioUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(audioFilePath);

    let coverArtUrl = `https://api.dicebear.com/8.x/icons/svg?seed=${encodeURIComponent(title)}`;
    if (imageFile) {
        const imageFilePath = `covers/${user.id}/${Date.now()}-${imageFile.name}`;
        const { error: imageError } = await supabase.storage.from(BUCKET_NAME).upload(imageFilePath, imageFile);
        if (imageError) throw new Error(`Image upload failed: ${imageError.message}`);
        coverArtUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(imageFilePath).data.publicUrl;
    }
    
    const duration = await getAudioDuration(audioFile);

    const { data: newTrackData, error: insertError } = await supabase
        .from('tracks')
        .insert({
            title: title,
            genre_id: genreId,
            user_id: user.id,
            duration: duration,
            audio_url: audioUrl,
            cover_art_url: coverArtUrl,
        })
        .select('track_id')
        .single();
    
    if (insertError) throw new Error(`Database insert failed: ${insertError.message}`);
    
    const newTracks = await getTracks();
    const newTrack = newTracks.find(t => t.id === newTrackData.track_id);
    if (!newTrack) throw new Error("Could not retrieve the newly uploaded track.");

    return newTrack;
};
