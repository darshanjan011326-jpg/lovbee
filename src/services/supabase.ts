import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'lovbee_supabase_url';
const STORAGE_KEY_KEY = 'lovbee_supabase_anon_key';
const LEGACY_STORAGE_KEY_URL = 'hobbi_supabase_url';
const LEGACY_STORAGE_KEY_KEY = 'hobbi_supabase_anon_key';

function isPlaceholder(val: string): boolean {
  if (!val) return true;
  const lower = val.toLowerCase().trim();
  return (
    lower.includes('placeholder') ||
    lower.includes('your-project') ||
    lower.includes('un_publishable') ||
    lower.includes('your_anon_key') ||
    lower.includes('your-anon-key') ||
    lower === 'un_publishable_key_here'
  );
}

export function getSupabaseConfig(): { url: string; key: string; isLive: boolean } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  let localUrl = '';
  let localKey = '';

  if (typeof window !== 'undefined') {
    localUrl = (localStorage.getItem(STORAGE_KEY_URL) || localStorage.getItem(LEGACY_STORAGE_KEY_URL) || '').trim();
    localKey = (localStorage.getItem(STORAGE_KEY_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY_KEY) || '').trim();
  }

  const rawUrl = localUrl || envUrl;
  const rawKey = localKey || envKey;

  const url = isPlaceholder(rawUrl) ? '' : rawUrl;
  const key = isPlaceholder(rawKey) ? '' : rawKey;

  const isLive = Boolean(url && key && url.startsWith('http') && !isPlaceholder(url) && !isPlaceholder(key));

  return { url, key, isLive };
}

export function saveSupabaseConfig(url: string, key: string): void {
  cachedClient = null;
  lastUrl = '';
  lastKey = '';

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

/**
 * Direct initialized Supabase client instance (or null if unconfigured).
 */
export const supabase = getSupabase();

export async function testSupabaseConnection(
  url?: string,
  key?: string
): Promise<{ success: boolean; message: string; tablesExist?: boolean }> {
  try {
    const config = getSupabaseConfig();
    const targetUrl = (url !== undefined ? url : config.url).trim();
    const targetKey = (key !== undefined ? key : config.key).trim();

    if (!targetUrl || !targetKey) {
      return { success: false, message: 'Supabase URL and Anon Key are required.' };
    }

    if (!targetUrl.startsWith('http')) {
      return { success: false, message: 'Invalid Supabase URL: must start with https://' };
    }

    if (isPlaceholder(targetUrl) || isPlaceholder(targetKey)) {
      return { success: false, message: 'Supabase configuration contains unconfigured placeholder values.' };
    }

    const testClient = createClient(targetUrl, targetKey);
    const { error, status } = await testClient.from('profiles').select('id').limit(1);

    if (!error) {
      return {
        success: true,
        message: 'Successfully connected and verified against Supabase database!',
        tablesExist: true,
      };
    }

    const isTableMissing =
      error.code === 'PGRST205' ||
      error.code === '42P01' ||
      error.message?.includes('schema cache') ||
      error.message?.includes('does not exist');

    if (isTableMissing) {
      return {
        success: true,
        message: 'Connected to Supabase! (Database tables need migration via supabase_schema.sql)',
        tablesExist: false,
      };
    }

    const isPermission =
      error.code === '42501' ||
      error.code === 'PGRST116' ||
      error.message?.toLowerCase().includes('permission denied');

    if (isPermission) {
      return {
        success: true,
        message: 'Successfully connected to Supabase with RLS active!',
        tablesExist: true,
      };
    }

    const isAuthError =
      status === 401 ||
      error.message?.toLowerCase().includes('invalid api key') ||
      error.message?.toLowerCase().includes('jwt') ||
      error.code === 'PGRST301';

    if (isAuthError) {
      return {
        success: false,
        message: 'Invalid Supabase Anon Key. Please check your credentials.',
        tablesExist: false,
      };
    }

    return {
      success: false,
      message: error.message || 'Database error connecting to Supabase.',
      tablesExist: false,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error connecting to Supabase. Check URL and connection.',
      tablesExist: false,
    };
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
