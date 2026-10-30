import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'lovbee_supabase_url';
const STORAGE_KEY_KEY = 'lovbee_supabase_anon_key';
const LEGACY_STORAGE_KEY_URL = 'hobbi_supabase_url';
const LEGACY_STORAGE_KEY_KEY = 'hobbi_supabase_anon_key';

export function getSupabaseConfig(): { url: string; key: string; isLive: boolean } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  let localUrl = '';
  let localKey = '';

  if (typeof window !== 'undefined') {
    localUrl = (localStorage.getItem(STORAGE_KEY_URL) || localStorage.getItem(LEGACY_STORAGE_KEY_URL) || '').trim();
    localKey = (localStorage.getItem(STORAGE_KEY_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY_KEY) || '').trim();
  }

  const url = localUrl || envUrl;
  const key = localKey || envKey;

  const isLive = Boolean(url && key && url.startsWith('http'));

  return { url, key, isLive };
}

export function saveSupabaseConfig(url: string, key: string): void {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem(STORAGE_KEY_URL, url.trim());
      localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_URL);
      localStorage.removeItem(STORAGE_KEY_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY_URL);
      localStorage.removeItem(LEGACY_STORAGE_KEY_KEY);
    }
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key, isLive } = getSupabaseConfig();
  if (!isLive) return null;

  if (cachedClient && url === lastUrl && key === lastKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(
  url: string,
  key: string
): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url, key);
    // Simple ping to check if client can reach Supabase
    const { error } = await testClient.from('hobbies').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116' && !error.message.includes('permission')) {
      if (error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! (Database tables need migration via supabase_schema.sql)',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected and verified against Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error connecting to Supabase.' };
  }
}

/**
 * Uploads an image file or blob to the Supabase Storage bucket 'lovbee-media'.
 * Returns the public URL, or falls back to a base64 Data URL if storage bucket is not configured.
 */
export async function uploadMediaFile(
  file: File | Blob,
  folder: 'avatars' | 'checkins',
  userId: string
): Promise<string> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const ext =
        file instanceof File && file.name.includes('.')
          ? file.name.split('.').pop()
          : 'jpg';
      const cleanExt = (ext || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const filePath = `${folder}/${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

      const { data, error } = await supabase.storage
        .from('lovbee-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg',
        });

      if (!error && data?.path) {
        const { data: publicData } = supabase.storage
          .from('lovbee-media')
          .getPublicUrl(data.path);

        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }
      } else if (error) {
        console.warn('Supabase storage upload notice (using fallback):', error.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload error:', err);
    }
  }

  // Graceful fallback to Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Real-time subscription helper for new messages in an active connection.
 */
export function subscribeToRealtimeMessages(
  connectionId: string,
  onMessage: (message: any) => void
): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`messages:${connectionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `connection_id=eq.${connectionId}`,
      },
      (payload) => {
        onMessage(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
