import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };
  duration: number;
  preview_url?: string;
  deezer_url?: string;
  full_song_url?: string;
  trackId?: string;
}

export interface SavedPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: PlaylistTrack[];
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  duration?: number;
  trackCount?: number;
  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };
  genre?: string;
  mood?: string;
  source?: string;
}

export interface RecentlyPlayed {
  id: string;
  userId: string;
  trackId: string;
  title: string;
  artist: string;
  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };
  duration: number;
  preview_url?: string;
  playedAt: Timestamp;
}

export async function savePlaylist(playlist: Omit<SavedPlaylist, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const playlistData = {
      ...playlist,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'playlists'), playlistData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving playlist:', error);
    throw new Error('Failed to save playlist');
  }
}

export async function getUserPlaylists(userId: string): Promise<SavedPlaylist[]> {
  try {
    const q = query(
      collection(db, 'playlists'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const playlists: SavedPlaylist[] = [];
    
    querySnapshot.forEach((doc) => {
      playlists.push({
        id: doc.id,
        ...doc.data()
      } as SavedPlaylist);
    });
    
    return playlists;
  } catch (error) {
    console.error('Error getting user playlists from Firestore:', error);
    throw new Error('Failed to get playlists');
  }
}

export async function deletePlaylist(playlistId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'playlists', playlistId));
  } catch (error) {
    console.error('Error deleting playlist:', error);
    throw new Error('Failed to delete playlist');
  }
}

export async function updatePlaylist(playlistId: string, updates: Partial<SavedPlaylist>): Promise<void> {
  try {
    const playlistRef = doc(db, 'playlists', playlistId);
    await updateDoc(playlistRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating playlist:', error);
    throw new Error('Failed to update playlist');
  }
}

export async function saveRecentlyPlayed(recentlyPlayed: Omit<RecentlyPlayed, 'id' | 'playedAt'>): Promise<void> {
  try {
    const recentlyPlayedData = {
      ...recentlyPlayed,
      playedAt: Timestamp.now()
    };
    
    await addDoc(collection(db, 'recentlyPlayed'), recentlyPlayedData);
  } catch (error) {
    console.error('Error saving recently played track:', error);
  }
}

export async function getRecentlyPlayed(userId: string, limitCount: number = 20): Promise<RecentlyPlayed[]> {
  try {
    // Fetch more songs than requested to account for duplicates
    const fetchLimit = Math.max(limitCount * 2, 20);
    
    const q = query(
      collection(db, 'recentlyPlayed'),
      where('userId', '==', userId),
      orderBy('playedAt', 'desc'),
      limit(fetchLimit)
    );
    
    const querySnapshot = await getDocs(q);
    const recentlyPlayed: RecentlyPlayed[] = [];
    
    querySnapshot.forEach((doc) => {
      recentlyPlayed.push({
        id: doc.id,
        ...doc.data()
      } as RecentlyPlayed);
    });
    
    // Filter out duplicates and return the requested number
    const uniqueTracks = recentlyPlayed.filter((track, index, self) => 
      index === self.findIndex(t => t.trackId === track.trackId)
    );
    
    return uniqueTracks.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting recently played tracks from Firestore:', error);
    throw new Error('Failed to get recently played tracks');
  }
} 