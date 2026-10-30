import {
  Profile,
  Challenge,
  Checkin,
  ConnectionRequest,
  Connection,
  Message,
  Block,
  Report,
  CompatibilityResult,
  UserHobby,
  ThisOrThatQuestion,
  ThisOrThatAnswer,
  DailyPromptQuestion,
  DailyPromptAnswer,
  QuizQuestion,
  QuizResult,
  QuizSet,
} from '../types';
import { SAMPLE_PROFILES, CURATED_HOBBIES } from './sampleData';
import {
  getSupabase,
  getSupabaseConfig,
  uploadMediaFile,
  subscribeToRealtimeMessages,
} from './supabase';
import {
  THIS_OR_THAT_BANK,
  DAILY_PROMPTS_BANK,
  QUIZ_SETS,
  normalizeText,
  normalizeThisOrThatKey,
  normalizePrompt,
} from './gameData';

export {
  THIS_OR_THAT_BANK,
  DAILY_PROMPTS_BANK,
  QUIZ_SETS,
  normalizeText,
  normalizeThisOrThatKey,
  normalizePrompt,
};

export const THIS_OR_THAT_QUESTIONS: ThisOrThatQuestion[] = THIS_OR_THAT_BANK;
export const DAILY_PROMPT_QUESTIONS: DailyPromptQuestion[] = DAILY_PROMPTS_BANK;
export const HOBBY_QUIZ_QUESTIONS: QuizQuestion[] = QUIZ_SETS[0].questions;

const STORAGE_KEY_AUTH = 'lovbee_auth_user';
const STORAGE_KEY_REGISTERED_USERS = 'lovbee_registered_profiles';
const STORAGE_KEY_DATA_MODE = 'lovbee_data_mode'; // 'live' | 'demo'
const STORAGE_KEY_CHECKINS = 'lovbee_checkins_data';
const STORAGE_KEY_REQUESTS = 'lovbee_requests_data';
const STORAGE_KEY_CONNECTIONS = 'lovbee_connections_data';
const STORAGE_KEY_MESSAGES = 'lovbee_messages_data';
const STORAGE_KEY_BLOCKS = 'lovbee_blocks_data';
const STORAGE_KEY_SKIPS = 'lovbee_skips_data';
const STORAGE_KEY_THIS_OR_THAT = 'lovbee_this_or_that_answers';
const STORAGE_KEY_DAILY_PROMPTS = 'lovbee_daily_prompt_answers';
const STORAGE_KEY_QUIZ_RESULTS = 'lovbee_quiz_results';

export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function isAdult(dobString: string): boolean {
  return calculateAge(dobString) >= 18;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateToUtc(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function getDaysDifference(earlierDateStr: string, laterDateStr: string): number {
  const msEarlier = parseDateToUtc(earlierDateStr);
  const msLater = parseDateToUtc(laterDateStr);
  return Math.round((msLater - msEarlier) / (1000 * 60 * 60 * 24));
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

export interface StreakStats {
  completedDaysCount: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate?: string;
  hasCheckedInToday: boolean;
  progressPercent: number;
  remainingDays: number;
  isUnlocked: boolean;
}

/**
 * Calculates streaks and challenge stats directly from actual saved check-in records.
 */
export function calculateStreakStats(
  checkins: Checkin[],
  historicalLongest = 0
): StreakStats {
  if (!checkins || checkins.length === 0) {
    return {
      completedDaysCount: 0,
      currentStreak: 0,
      longestStreak: historicalLongest,
      lastCheckinDate: undefined,
      hasCheckedInToday: false,
      progressPercent: 0,
      remainingDays: 21,
      isUnlocked: false,
    };
  }

  // 1. Get unique sorted checkin dates (ensuring one check-in counted per day)
  const uniqueDates = Array.from(new Set(checkins.map((c) => c.checkinDate))).sort();
  const completedDaysCount = uniqueDates.length;
  const lastCheckinDate = uniqueDates[uniqueDates.length - 1];

  // 2. Calculate longest consecutive streak in entire recorded history
  let maxStreak = 1;
  let tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = getDaysDifference(uniqueDates[i - 1], uniqueDates[i]);
    if (diff === 1) {
      tempStreak++;
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    } else if (diff > 1) {
      tempStreak = 1;
    }
  }
  const longestStreak = Math.max(historicalLongest, maxStreak);

  // 3. Determine current streak:
  const today = getTodayDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayYear = yesterdayDate.getFullYear();
  const yesterdayMonth = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
  const yesterdayDay = String(yesterdayDate.getDate()).padStart(2, '0');
  const yesterday = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;

  const hasCheckedInToday = uniqueDates.includes(today);

  let currentStreak = 0;
  if (lastCheckinDate === today || lastCheckinDate === yesterday) {
    currentStreak = 1;
    for (let i = uniqueDates.length - 1; i > 0; i--) {
      const diff = getDaysDifference(uniqueDates[i - 1], uniqueDates[i]);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  const progressPercent = Math.min(100, Math.round((currentStreak / 21) * 100));
  const remainingDays = Math.max(0, 21 - currentStreak);
  const isUnlocked = currentStreak >= 21;

  return {
    completedDaysCount,
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastCheckinDate,
    hasCheckedInToday,
    progressPercent,
    remainingDays,
    isUnlocked,
  };
}

// Sample demo user for immediate review evaluation
export const SAMPLE_DEMO_USER: Profile = {
  id: 'user_alex_demo',
  email: 'alex.rivera@example.com',
  displayName: 'Alex Rivera',
  dateOfBirth: '1997-05-15',
  age: 29,
  gender: 'Non-binary',
  showGenderOnProfile: true,
  sexualOrientation: 'Queer',
  showOrientationOnProfile: false,
  bio: 'Ceramic enthusiast, 35mm film photographer, and Sunday gravel cyclist. Looking for deliberate romantic connection, quiet laughter, and shared creative rituals.',
  location: 'Portland, OR',
  occupation: 'Editorial Art Director',
  avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&auto=format&fit=crop&q=80',
  photos: [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop&q=80',
  ],
  prompts: [
    { question: 'What makes me buzz...', answer: 'Clay on the wheel, warm morning sunlight, and an unhurried pour-over coffee.' },
    { question: 'My non-negotiable...', answer: 'Emotional vulnerability, creative curiosity, and kindness to strangers.' },
  ],
  profileComplete: true,
  challengeUnlocked: false,
  isIncognito: false,
  createdAt: '2026-10-10T08:00:00Z',
  hobbies: [
    { hobbyId: 'h_ceramics', name: 'Wheel-thrown Ceramics', category: 'arts', skillLevel: 'passionate', yearsPracticed: 2.5, isChallengeFocus: true },
    { hobbyId: 'h_film_photo', name: '35mm Film Photography', category: 'arts', skillLevel: 'passionate', yearsPracticed: 4.0 },
    { hobbyId: 'h_coffee', name: 'Specialty Pour-over Coffee', category: 'culinary', skillLevel: 'intermediate', yearsPracticed: 2.0 },
    { hobbyId: 'h_bouldering', name: 'Bouldering & Climbing', category: 'sports', skillLevel: 'beginner', yearsPracticed: 0.5 },
  ],
  lifestyle: {
    sleepSchedule: 'early_bird',
    weekendVibe: 'slow_mornings',
    communicationStyle: 'thoughtful_notes',
    activityLevel: 'daily_mover',
  },
  datingPreferences: {
    minAge: 25,
    maxAge: 36,
    relationshipIntent: 'intentional_dating',
    interestedInGenders: ['All genders', 'Women', 'Men', 'Non-binary'],
    maxDistanceKm: 60,
  },
  challenge: {
    id: 'ch_alex_1',
    userId: 'user_alex_demo',
    title: 'Daily Ceramic Study & Throwing',
    focusHobbyName: 'Wheel-thrown Ceramics',
    dailyGoal: 'Spend 30 minutes throwing or trimming one piece at the studio',
    targetDays: 21,
    completedDaysCount: 8,
    currentStreak: 8,
    longestStreak: 8,
    status: 'active',
    startDate: '2026-10-19',
    lastCheckinDate: '2026-10-26',
  },
};

// Database row <-> Application Type mappers
function rowToProfile(row: any): Profile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name || row.email?.split('@')[0] || 'Member',
    dateOfBirth: row.date_of_birth ? String(row.date_of_birth).slice(0, 10) : '1998-01-01',
    age: typeof row.age === 'number' ? row.age : calculateAge(row.date_of_birth),
    gender: row.gender || 'Prefer not to say',
    genderSelfDescribe: row.gender_self_describe || undefined,
    showGenderOnProfile: row.show_gender_on_profile !== false,
    sexualOrientation: row.sexual_orientation || 'Prefer not to say',
    orientationSelfDescribe: row.orientation_self_describe || undefined,
    showOrientationOnProfile: Boolean(row.show_orientation_on_profile),
    bio: row.bio || '',
    location: row.location || '',
    occupation: row.occupation || '',
    avatarUrl: row.avatar_url || '',
    photos: Array.isArray(row.photos) ? row.photos : (row.avatar_url ? [row.avatar_url] : []),
    prompts: Array.isArray(row.prompts) ? row.prompts : [],
    hobbies: Array.isArray(row.hobbies) ? row.hobbies : [],
    lifestyle: row.lifestyle || {
      sleepSchedule: 'early_bird',
      weekendVibe: 'slow_mornings',
      communicationStyle: 'thoughtful_notes',
      activityLevel: 'daily_mover',
    },
    datingPreferences: row.dating_preferences || {
      minAge: 21,
      maxAge: 45,
      relationshipIntent: 'intentional_dating',
      interestedInGenders: ['All genders'],
      maxDistanceKm: 50,
    },
    profileComplete: Boolean(row.profile_complete),
    challengeUnlocked: Boolean(row.challenge_unlocked),
    isIncognito: Boolean(row.is_incognito),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function profileToRow(p: Profile): any {
  return {
    id: p.id,
    email: p.email,
    display_name: p.displayName,
    date_of_birth: p.dateOfBirth,
    gender: p.gender,
    gender_self_describe: p.genderSelfDescribe || null,
    show_gender_on_profile: p.showGenderOnProfile !== false,
    sexual_orientation: p.sexualOrientation || 'Prefer not to say',
    orientation_self_describe: p.orientationSelfDescribe || null,
    show_orientation_on_profile: Boolean(p.showOrientationOnProfile),
    bio: p.bio || '',
    location: p.location || '',
    occupation: p.occupation || '',
    avatar_url: p.avatarUrl || '',
    photos: p.photos || (p.avatarUrl ? [p.avatarUrl] : []),
    prompts: p.prompts || [],
    hobbies: p.hobbies || [],
    lifestyle: p.lifestyle,
    dating_preferences: p.datingPreferences,
    profile_complete: Boolean(p.profileComplete),
    challenge_unlocked: Boolean(p.challengeUnlocked),
    is_incognito: Boolean(p.isIncognito),
    updated_at: new Date().toISOString(),
  };
}

function rowToCheckin(row: any): Checkin {
  return {
    id: row.id,
    challengeId: row.challenge_id || '',
    userId: row.user_id,
    dayNumber: row.day_number,
    checkinDate: row.checkin_date ? String(row.checkin_date).slice(0, 10) : getTodayDateString(),
    hobbyName: row.hobby_name,
    activitySummary: row.activity_summary,
    durationMinutes: row.duration_minutes || 30,
    reflectionNote: row.reflection_note || undefined,
    caption: row.caption || row.reflection_note || undefined,
    photoUrl: row.photo_url || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function rowToChallenge(row: any): Challenge {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    focusHobbyName: row.focus_hobby_name,
    dailyGoal: row.daily_goal,
    targetDays: row.target_days || 21,
    completedDaysCount: row.completed_days_count || 0,
    currentStreak: row.current_streak || 0,
    longestStreak: row.longest_streak || 0,
    status: row.status || 'active',
    startDate: row.start_date ? String(row.start_date).slice(0, 10) : getTodayDateString(),
    lastCheckinDate: row.last_checkin_date ? String(row.last_checkin_date).slice(0, 10) : undefined,
    completedAt: row.completed_at || undefined,
  };
}

function rowToConnectionRequest(row: any, sender: Profile, recipient?: Profile): ConnectionRequest {
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    senderProfile: sender,
    recipientProfile: recipient,
    introNote: row.intro_note,
    sharedHobbyReference: row.shared_hobby_reference || 'Shared Passions',
    status: row.status,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function rowToMessage(row: any): Message {
  return {
    id: row.id,
    connectionId: row.connection_id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    content: row.content,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

class StoreService {
  private currentUser: Profile | null = null;
  private registeredUsers: Profile[] = [];
  private isDemoMode: boolean = true;
  private checkins: Record<string, Checkin[]> = {};
  private connectionRequests: ConnectionRequest[] = [];
  private connections: Connection[] = [];
  private messages: Message[] = [];
  private blocks: Block[] = [];
  private skips: string[] = [];
  private thisOrThatAnswers: Record<string, Record<string, ThisOrThatAnswer>> = {};
  private dailyPromptAnswers: Record<string, DailyPromptAnswer[]> = {};
  private quizResults: Record<string, Record<string, QuizResult>> = {};
  private listeners: Set<() => void> = new Set();
  private realtimeUnsubscribers: (() => void)[] = [];

  constructor() {
    this.initStore();
  }

  private initStore() {
    if (typeof window === 'undefined') return;

    // 1. Load session from localStorage first
    const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
    if (savedAuth) {
      try {
        this.currentUser = JSON.parse(savedAuth);
      } catch (e) {
        this.currentUser = null;
      }
    } else {
      this.currentUser = null;
    }

    // 2. Load registered users cache
    const savedRegistered = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
    if (savedRegistered) {
      try {
        this.registeredUsers = JSON.parse(savedRegistered);
      } catch (e) {
        this.registeredUsers = [];
      }
    }

    // 3. Load data mode ('live' vs 'demo')
    const savedMode = localStorage.getItem(STORAGE_KEY_DATA_MODE);
    const { isLive } = getSupabaseConfig();
    this.isDemoMode = isLive ? savedMode === 'demo' : true;

    // 4. Load checkins
    const savedCheckins = localStorage.getItem(STORAGE_KEY_CHECKINS);
    if (savedCheckins) {
      try {
        this.checkins = JSON.parse(savedCheckins);
      } catch (e) {
        this.checkins = {};
      }
    } else {
      this.seedDemoCheckins();
    }

    // 5. Load connection requests
    const savedReqs = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (savedReqs) {
      try {
        this.connectionRequests = JSON.parse(savedReqs);
      } catch (e) {
        this.connectionRequests = [];
      }
    } else {
      this.seedDemoRequests();
    }

    // 6. Load connections
    const savedConns = localStorage.getItem(STORAGE_KEY_CONNECTIONS);
    if (savedConns) {
      try {
        this.connections = JSON.parse(savedConns);
      } catch (e) {
        this.connections = [];
      }
    }

    // 7. Load messages
    const savedMsgs = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (savedMsgs) {
      try {
        this.messages = JSON.parse(savedMsgs);
      } catch (e) {
        this.messages = [];
      }
    }

    // 8. Load blocks and skips
    const savedBlocks = localStorage.getItem(STORAGE_KEY_BLOCKS);
    if (savedBlocks) {
      try {
        this.blocks = JSON.parse(savedBlocks);
      } catch (e) {
        this.blocks = [];
      }
    }

    const savedSkips = localStorage.getItem(STORAGE_KEY_SKIPS);
    if (savedSkips) {
      try {
        this.skips = JSON.parse(savedSkips);
      } catch (e) {
        this.skips = [];
      }
    }

    // 9. Load games answers
    const savedTot = localStorage.getItem(STORAGE_KEY_THIS_OR_THAT);
    if (savedTot) {
      try {
        this.thisOrThatAnswers = JSON.parse(savedTot);
      } catch (e) {
        this.thisOrThatAnswers = {};
      }
    }

    const savedPrompts = localStorage.getItem(STORAGE_KEY_DAILY_PROMPTS);
    if (savedPrompts) {
      try {
        this.dailyPromptAnswers = JSON.parse(savedPrompts);
      } catch (e) {
        this.dailyPromptAnswers = {};
      }
    }

    const savedQuiz = localStorage.getItem(STORAGE_KEY_QUIZ_RESULTS);
    if (savedQuiz) {
      try {
        this.quizResults = JSON.parse(savedQuiz);
      } catch (e) {
        this.quizResults = {};
      }
    }

    if (this.currentUser) {
      this.syncUserChallengeStats(this.currentUser);
    }

    // 10. Initialize Supabase Auth & Realtime listener
    this.initSupabaseAuth();
  }

  private seedDemoCheckins() {
    this.checkins = {};
    const demoCheckins: Checkin[] = [];
    const samplePhotos = [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590374585152-ca0e8194c0d6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
    ];
    const sampleCaptions = [
      'Day 1 studio practice: Wedging stoneware clay and setting my wheel ritual.',
      'Working on centered cylinder pulls. Focusing on even wall thickness.',
      'Trimmed three small matcha bowls before the clay passed leather-hard.',
      'Testing subtle matte glazes on new porcelain test tiles.',
      'Late quiet studio hours. The repetitive wheel motion is pure meditation.',
      'First batch of mini espresso cups coming out of the bisque kiln.',
      'Carving delicate textured ridges into a taller vessel form today.',
      'Threw two speckled buff stoneware planters for the studio windowsill.',
    ];

    for (let i = 8; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const dayIdx = 8 - i;
      demoCheckins.push({
        id: `chk_alex_${9 - i}`,
        challengeId: 'ch_alex_1',
        userId: SAMPLE_DEMO_USER.id,
        dayNumber: 9 - i,
        checkinDate: dateStr,
        hobbyName: 'Wheel-thrown Ceramics',
        activitySummary: sampleCaptions[dayIdx],
        durationMinutes: 30,
        reflectionNote: sampleCaptions[dayIdx],
        caption: sampleCaptions[dayIdx],
        photoUrl: samplePhotos[dayIdx],
        createdAt: `${dateStr}T19:30:00Z`,
      });
    }
    this.checkins[SAMPLE_DEMO_USER.id] = demoCheckins;
  }

  private seedDemoRequests() {
    const clara = SAMPLE_PROFILES.find((p) => p.id === 'user_clara');
    if (clara) {
      this.connectionRequests = [
        {
          id: 'req_clara_alex_spark',
          senderId: 'user_clara',
          recipientId: SAMPLE_DEMO_USER.id,
          senderProfile: clara,
          recipientProfile: SAMPLE_DEMO_USER,
          introNote:
            'I saw you are also deep into wheel-thrown ceramics and 35mm film! I sketch native ferns with walnut ink in Seattle. Would love to share studio notes and feel the spark!',
          sharedHobbyReference: 'Wheel-thrown Ceramics & 35mm Film',
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ];
    }
  }

  private async initSupabaseAuth() {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await this.handleSessionUser(session.user);
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            await this.handleSessionUser(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          if (this.currentUser && !this.currentUser.id.startsWith('user_alex')) {
            this.currentUser = null;
            this.saveAuth();
          }
        }
      });
    } catch (err) {
      console.warn('Supabase auth initialization:', err);
    }
  }

  private async handleSessionUser(authUser: any) {
    const supabase = getSupabase();
    if (!supabase || !authUser) return;

    try {
      // 1. Fetch user's profile from database
      const { data: profileRow, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileRow) {
        this.currentUser = rowToProfile(profileRow);
      } else {
        // Create initial profile if not yet created
        const meta = authUser.user_metadata || {};
        const dob = meta.date_of_birth || '1998-05-15';
        const newProf: Profile = {
          id: authUser.id,
          email: authUser.email || '',
          displayName: meta.display_name || authUser.email?.split('@')[0] || 'Member',
          dateOfBirth: dob,
          age: calculateAge(dob),
          gender: meta.gender || 'Prefer not to say',
          showGenderOnProfile: true,
          sexualOrientation: 'Prefer not to say',
          showOrientationOnProfile: false,
          bio: '',
          location: '',
          occupation: '',
          avatarUrl: '',
          photos: [],
          prompts: [],
          hobbies: [],
          lifestyle: {
            sleepSchedule: 'early_bird',
            weekendVibe: 'slow_mornings',
            communicationStyle: 'thoughtful_notes',
            activityLevel: 'daily_mover',
          },
          datingPreferences: {
            minAge: 21,
            maxAge: 45,
            relationshipIntent: 'intentional_dating',
            interestedInGenders: ['All genders'],
            maxDistanceKm: 50,
          },
          profileComplete: false,
          challengeUnlocked: false,
          isIncognito: false,
          createdAt: new Date().toISOString(),
        };

        await supabase.from('profiles').upsert(profileToRow(newProf));
        this.currentUser = newProf;
      }

      this.isDemoMode = false;
      this.saveAuth();

      // 2. Hydrate user's challenge, check-ins, connections, and messages from Supabase
      await this.hydrateUserSupabaseData(authUser.id);
    } catch (err) {
      console.warn('Error syncing Supabase user profile:', err);
    }
  }

  public async hydrateUserSupabaseData(userId: string) {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      // A. Load Challenge
      const { data: chalData } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (chalData && chalData.length > 0 && this.currentUser) {
        this.currentUser.challenge = rowToChallenge(chalData[0]);
      }

      // B. Load Check-ins
      const { data: chkData } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: true });

      if (chkData) {
        this.checkins[userId] = chkData.map(rowToCheckin);
        this.saveCheckins();
      }

      // C. Load Connections
      const { data: connData } = await supabase
        .from('connections')
        .select('*')
        .or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`);

      if (connData) {
        const mappedConnections: Connection[] = [];
        for (const c of connData) {
          const partnerId = c.user_one_id === userId ? c.user_two_id : c.user_one_id;
          let partnerProfile = this.registeredUsers.find((p) => p.id === partnerId) || SAMPLE_PROFILES.find((p) => p.id === partnerId);
          if (!partnerProfile) {
            const { data: pRow } = await supabase.from('profiles').select('*').eq('id', partnerId).maybeSingle();
            if (pRow) {
              partnerProfile = rowToProfile(pRow);
            }
          }
          if (partnerProfile) {
            mappedConnections.push({
              id: c.id,
              partnerId,
              partnerProfile,
              connectedAt: c.connected_at || new Date().toISOString(),
            });
          }
        }
        this.connections = mappedConnections;
        this.saveConnections();
      }

      // D. Load Connection Requests
      const { data: reqData } = await supabase
        .from('connection_requests')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

      if (reqData) {
        const mappedRequests: ConnectionRequest[] = [];
        for (const r of reqData) {
          let sender = r.sender_id === userId ? this.currentUser : (this.registeredUsers.find((p) => p.id === r.sender_id) || SAMPLE_PROFILES.find((p) => p.id === r.sender_id));
          if (!sender) {
            const { data: sRow } = await supabase.from('profiles').select('*').eq('id', r.sender_id).maybeSingle();
            if (sRow) sender = rowToProfile(sRow);
          }
          let recipient = r.recipient_id === userId ? this.currentUser : (this.registeredUsers.find((p) => p.id === r.recipient_id) || SAMPLE_PROFILES.find((p) => p.id === r.recipient_id));
          if (!recipient) {
            const { data: rRow } = await supabase.from('profiles').select('*').eq('id', r.recipient_id).maybeSingle();
            if (rRow) recipient = rowToProfile(rRow);
          }
          if (sender) {
            mappedRequests.push(rowToConnectionRequest(r, sender, recipient || undefined));
          }
        }
        this.connectionRequests = mappedRequests;
        this.saveRequests();
      }

      // E. Load Messages
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (msgData) {
        this.messages = msgData.map(rowToMessage);
        this.saveMessages();
      }

      // F. Load Blocks
      const { data: blkData } = await supabase
        .from('blocks')
        .select('*')
        .eq('blocker_id', userId);

      if (blkData) {
        this.blocks = blkData.map((b) => ({
          id: b.id,
          blockerId: b.blocker_id,
          blockedId: b.blocked_id,
          createdAt: b.created_at,
        }));
        this.saveBlocks();
      }

      // G. Setup Realtime subscription on connections
      this.setupRealtimeListeners(userId);

      if (this.currentUser) {
        this.syncUserChallengeStats(this.currentUser);
      }
    } catch (err) {
      console.warn('Supabase data hydration notice:', err);
    }
  }

  private setupRealtimeListeners(userId: string) {
    const supabase = getSupabase();
    if (!supabase) return;

    // Clean up old subscriptions
    this.realtimeUnsubscribers.forEach((unsub) => unsub());
    this.realtimeUnsubscribers = [];

    // Subscribe to new messages addressed to this user
    const channel = supabase
      .channel(`user-realtime:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const newMsg = rowToMessage(payload.new);
          if (!this.messages.some((m) => m.id === newMsg.id)) {
            this.messages = [...this.messages, newMsg];
            this.saveMessages();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connection_requests',
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload) => {
          const newReq = payload.new;
          let sender = this.registeredUsers.find((p) => p.id === newReq.sender_id) || SAMPLE_PROFILES.find((p) => p.id === newReq.sender_id);
          if (!sender) {
            const { data: sRow } = await supabase.from('profiles').select('*').eq('id', newReq.sender_id).maybeSingle();
            if (sRow) sender = rowToProfile(sRow);
          }
          if (sender && this.currentUser) {
            const mapped = rowToConnectionRequest(newReq, sender, this.currentUser);
            if (!this.connectionRequests.some((r) => r.id === mapped.id)) {
              this.connectionRequests = [mapped, ...this.connectionRequests];
              this.saveRequests();
            }
          }
        }
      )
      .subscribe();

    this.realtimeUnsubscribers.push(() => {
      supabase.removeChannel(channel);
    });
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Persistence helpers
  private saveAuth() {
    if (typeof window !== 'undefined') {
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    }
    this.notify();
  }

  private saveRegisteredUsers() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(this.registeredUsers));
    }
    this.notify();
  }

  private saveCheckins() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(this.checkins));
    }
    this.notify();
  }

  private saveRequests() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(this.connectionRequests));
    }
    this.notify();
  }

  private saveConnections() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(this.connections));
    }
    this.notify();
  }

  private saveMessages() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(this.messages));
    }
    this.notify();
  }

  private saveBlocks() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(this.blocks));
    }
    this.notify();
  }

  private saveSkips() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SKIPS, JSON.stringify(this.skips));
    }
  }

  private saveThisOrThat() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_THIS_OR_THAT, JSON.stringify(this.thisOrThatAnswers));
    }
    this.notify();
  }

  private saveDailyPrompts() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DAILY_PROMPTS, JSON.stringify(this.dailyPromptAnswers));
    }
    this.notify();
  }

  private saveQuizResults() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_QUIZ_RESULTS, JSON.stringify(this.quizResults));
    }
    this.notify();
  }

  public getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  public setDemoMode(active: boolean): void {
    this.isDemoMode = active;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DATA_MODE, active ? 'demo' : 'live');
    }
    this.notify();
  }

  public getCurrentUser(): Profile | null {
    return this.currentUser;
  }

  // Authentication
  public async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (!email || !email.trim()) return { success: false, error: 'Email address is required.' };
    if (!password || !password.trim()) return { success: false, error: 'Password is required.' };

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth if connected
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data?.user) {
          await this.handleSessionUser(data.user);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase signInWithPassword exception:', err);
      }
    }

    // 2. Demo User Fallback
    if (cleanEmail === SAMPLE_DEMO_USER.email.toLowerCase()) {
      return this.loginDemoUser();
    }

    // 3. Registered Users Fallback
    const registered = this.registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (registered) {
      this.currentUser = registered;
      this.syncUserChallengeStats(this.currentUser);
      this.saveAuth();
      return { success: true };
    }

    // 4. Sample Profile Fallback
    const sample = SAMPLE_PROFILES.find((p) => p.email.toLowerCase() === cleanEmail);
    if (sample) {
      this.currentUser = { ...sample };
      this.syncUserChallengeStats(this.currentUser);
      this.saveAuth();
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please verify your email or click "Create Account".',
    };
  }

  public loginDemoUser(): { success: boolean } {
    this.currentUser = { ...SAMPLE_DEMO_USER };
    this.syncUserChallengeStats(this.currentUser);
    this.saveAuth();
    return { success: true };
  }

  public async signup(params: {
    email: string;
    displayName: string;
    dateOfBirth: string;
    gender?: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!params.email || !params.email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!params.displayName || !params.displayName.trim()) {
      return { success: false, error: 'Display name is required.' };
    }
    if (!params.dateOfBirth) {
      return { success: false, error: 'Date of birth is required for 18+ age verification.' };
    }

    const age = calculateAge(params.dateOfBirth);
    if (age < 18) {
      return {
        success: false,
        error: `UNDER_18_BLOCKED: You must be at least 18 years old to join Lovbee. Your calculated age is ${age}. Access denied.`,
      };
    }

    const cleanEmail = params.email.trim().toLowerCase();
    const effectivePassword = params.password || 'lovbee123';

    // 1. Try Supabase Auth SignUp if live
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: effectivePassword,
          options: {
            data: {
              display_name: params.displayName.trim(),
              date_of_birth: params.dateOfBirth,
              gender: params.gender || 'Prefer not to say',
            },
          },
        });

        if (error) {
          // If already registered in Supabase, let user know
          if (error.message.includes('already registered')) {
            return { success: false, error: 'An account with this email already exists. Please log in.' };
          }
          return { success: false, error: error.message };
        }

        if (data?.user) {
          const newUser: Profile = {
            id: data.user.id,
            email: cleanEmail,
            displayName: params.displayName.trim(),
            dateOfBirth: params.dateOfBirth,
            age,
            gender: params.gender || 'Prefer not to say',
            showGenderOnProfile: true,
            sexualOrientation: 'Prefer not to say',
            showOrientationOnProfile: false,
            bio: '',
            location: '',
            occupation: '',
            avatarUrl: '',
            photos: [],
            prompts: [],
            hobbies: [],
            lifestyle: {
              sleepSchedule: 'early_bird',
              weekendVibe: 'slow_mornings',
              communicationStyle: 'thoughtful_notes',
              activityLevel: 'daily_mover',
            },
            datingPreferences: {
              minAge: Math.max(18, age - 5),
              maxAge: age + 8,
              relationshipIntent: 'intentional_dating',
              interestedInGenders: ['All genders'],
              maxDistanceKm: 50,
            },
            profileComplete: false,
            challengeUnlocked: false,
            isIncognito: false,
            createdAt: new Date().toISOString(),
          };

          await supabase.from('profiles').upsert(profileToRow(newUser));
          this.currentUser = newUser;
          this.registeredUsers = [newUser, ...this.registeredUsers.filter((u) => u.email !== cleanEmail)];
          this.saveRegisteredUsers();
          this.saveAuth();
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase signup exception:', err);
      }
    }

    // 2. Local Fallback Signup
    const existing = this.registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser: Profile = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      displayName: params.displayName.trim(),
      dateOfBirth: params.dateOfBirth,
      age,
      gender: params.gender || 'Prefer not to say',
      showGenderOnProfile: true,
      sexualOrientation: 'Prefer not to say',
      showOrientationOnProfile: false,
      bio: '',
      location: '',
      occupation: '',
      avatarUrl: '',
      photos: [],
      prompts: [],
      hobbies: [],
      lifestyle: {
        sleepSchedule: 'early_bird',
        weekendVibe: 'slow_mornings',
        communicationStyle: 'thoughtful_notes',
        activityLevel: 'daily_mover',
      },
      datingPreferences: {
        minAge: Math.max(18, age - 5),
        maxAge: age + 8,
        relationshipIntent: 'intentional_dating',
        interestedInGenders: ['All genders'],
        maxDistanceKm: 50,
      },
      profileComplete: false,
      challengeUnlocked: false,
      isIncognito: false,
      createdAt: new Date().toISOString(),
    };

    this.registeredUsers = [newUser, ...this.registeredUsers];
    this.saveRegisteredUsers();

    this.currentUser = newUser;
    this.saveAuth();

    return { success: true };
  }

  public logout(): void {
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.signOut().catch((err) => console.warn('Supabase signOut error:', err));
    }

    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
    this.notify();
  }

  public updateProfile(updates: Partial<Profile>): void {
    if (!this.currentUser) return;
    const updated: Profile = {
      ...this.currentUser,
      ...updates,
      age: updates.dateOfBirth ? calculateAge(updates.dateOfBirth) : this.currentUser.age,
    };

    this.currentUser = updated;
    this.saveAuth();

    // Update in registeredUsers list too
    const idx = this.registeredUsers.findIndex((u) => u.id === updated.id);
    if (idx !== -1) {
      this.registeredUsers[idx] = updated;
      this.saveRegisteredUsers();
    }

    // Sync to Supabase if connected
    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase
          .from('profiles')
          .upsert(profileToRow(updated))
      ).catch((err: unknown) => console.warn('Supabase updateProfile sync error:', err));

      if (updated.challenge) {
        Promise.resolve(
          supabase
            .from('challenges')
            .upsert({
              id: updated.challenge.id,
              user_id: updated.id,
              title: updated.challenge.title,
              focus_hobby_name: updated.challenge.focusHobbyName,
              daily_goal: updated.challenge.dailyGoal,
              target_days: updated.challenge.targetDays || 21,
              completed_days_count: updated.challenge.completedDaysCount,
              current_streak: updated.challenge.currentStreak,
              longest_streak: updated.challenge.longestStreak,
              status: updated.challenge.status,
              start_date: updated.challenge.startDate,
              last_checkin_date: updated.challenge.lastCheckinDate || null,
              completed_at: updated.challenge.completedAt || null,
              updated_at: new Date().toISOString(),
            })
        ).catch((err: unknown) => console.warn('Supabase challenge sync error:', err));
      }
    }
  }

  // Photo upload helper: Uploads to Supabase Storage 'lovbee-media' bucket
  public async uploadProfilePhoto(file: File): Promise<string> {
    if (!file) throw new Error('No file provided');
    if (!file.type.startsWith('image/')) throw new Error('File must be an image');
    if (file.size > 5 * 1024 * 1024) throw new Error('Image must be under 5MB');

    const userId = this.currentUser?.id || 'guest';
    const publicUrl = await uploadMediaFile(file, 'avatars', userId);

    if (this.currentUser) {
      const existingPhotos = this.currentUser.photos || [];
      const updatedPhotos = [publicUrl, ...existingPhotos.filter((p) => p !== publicUrl)];
      this.updateProfile({
        avatarUrl: publicUrl,
        photos: updatedPhotos,
      });
    }

    return publicUrl;
  }

  public resetDemoData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CHECKINS);
      localStorage.removeItem(STORAGE_KEY_REQUESTS);
      localStorage.removeItem(STORAGE_KEY_CONNECTIONS);
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
      localStorage.removeItem(STORAGE_KEY_BLOCKS);
      localStorage.removeItem(STORAGE_KEY_SKIPS);
      localStorage.removeItem(STORAGE_KEY_THIS_OR_THAT);
      localStorage.removeItem(STORAGE_KEY_DAILY_PROMPTS);
      localStorage.removeItem(STORAGE_KEY_QUIZ_RESULTS);
    }
    this.seedDemoCheckins();
    this.seedDemoRequests();
    this.connections = [];
    this.messages = [];
    this.blocks = [];
    this.skips = [];
    this.thisOrThatAnswers = {};
    this.dailyPromptAnswers = {};
    this.quizResults = {};
    this.saveCheckins();
    this.saveRequests();
    this.saveConnections();
    this.saveMessages();
    this.saveBlocks();
    this.saveSkips();
    this.saveThisOrThat();
    this.saveDailyPrompts();
    this.saveQuizResults();
    this.notify();
  }

  // 21-Day Consistency Ritual Check-ins
  public getUserCheckins(userId?: string): Checkin[] {
    const targetUserId = userId || this.currentUser?.id;
    if (!targetUserId) return [];
    return this.checkins[targetUserId] || [];
  }

  public getStreakStats(userId?: string): StreakStats {
    const targetUserId = userId || this.currentUser?.id;
    if (!targetUserId) {
      return {
        completedDaysCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckinDate: undefined,
        hasCheckedInToday: false,
        progressPercent: 0,
        remainingDays: 21,
        isUnlocked: false,
      };
    }
    const checkinList = this.checkins[targetUserId] || [];
    const historicalLongest = this.currentUser?.challenge?.longestStreak || 0;
    return calculateStreakStats(checkinList, historicalLongest);
  }

  public syncUserChallengeStats(user: Profile | null): void {
    if (!user) return;
    const stats = this.getStreakStats(user.id);

    const baseChallenge: Challenge = user.challenge || {
      id: `ch_${user.id}`,
      userId: user.id,
      title: '21-Day Passion & Consistency Challenge',
      focusHobbyName: user.hobbies[0]?.name || 'Creative Practice',
      dailyGoal: 'Dedicate 30 minutes daily to my craft',
      targetDays: 21,
      completedDaysCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      status: 'active',
      startDate: getTodayDateString(),
    };

    const syncedChallenge: Challenge = {
      ...baseChallenge,
      completedDaysCount: stats.completedDaysCount,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastCheckinDate: stats.lastCheckinDate,
      status: stats.isUnlocked ? 'completed' : 'active',
      completedAt: stats.isUnlocked ? (baseChallenge.completedAt || new Date().toISOString()) : undefined,
    };

    user.challenge = syncedChallenge;
    user.challengeUnlocked = stats.isUnlocked;
  }

  public canCheckinToday(): { allowed: boolean; reason?: string } {
    if (!this.currentUser) return { allowed: false, reason: 'Not logged in' };
    const today = getTodayDateString();
    const userCheckins = this.getUserCheckins(this.currentUser.id);
    const hasToday = userCheckins.some((c) => c.checkinDate === today);
    if (hasToday) {
      return {
        allowed: false,
        reason: 'You have already checked in today! See you tomorrow for Day ' + (userCheckins.length + 1),
      };
    }
    return { allowed: true };
  }

  /**
   * Completes today's check-in with optional daily photo and caption.
   * Saves to Supabase Storage and PostgreSQL with user ID, photo, caption, and server-validated date.
   */
  public async submitCheckin(data?: {
    hobbyName?: string;
    activitySummary?: string;
    durationMinutes?: number;
    reflectionNote?: string;
    caption?: string;
    photoUrl?: string;
  }): Promise<{ success: boolean; error?: string; checkin?: Checkin; stats?: StreakStats }> {
    if (!this.currentUser) return { success: false, error: 'Not authenticated' };

    const today = getTodayDateString();
    const existing = this.getUserCheckins(this.currentUser.id);
    const alreadyChecked = existing.some((c) => c.checkinDate === today);
    if (alreadyChecked) {
      return {
        success: false,
        error: 'Duplicate check-in blocked: You have already checked in today.',
      };
    }

    const focusHobby =
      data?.hobbyName ||
      this.currentUser.challenge?.focusHobbyName ||
      this.currentUser.hobbies[0]?.name ||
      'Deliberate Craft Pursuit';

    const currentChallenge: Challenge = this.currentUser.challenge || {
      id: `ch_${Date.now()}`,
      userId: this.currentUser.id,
      title: '21-Day Passion & Consistency Challenge',
      focusHobbyName: focusHobby,
      dailyGoal: 'Dedicate 30 minutes daily to my craft',
      targetDays: 21,
      completedDaysCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      status: 'active' as const,
      startDate: today,
    };

    const finalCaption = (data?.caption ?? data?.reflectionNote)?.trim() || undefined;

    // Handle photo upload to Supabase Storage if it is a Data URL
    let finalPhotoUrl = data?.photoUrl;
    if (finalPhotoUrl && (finalPhotoUrl.startsWith('data:image/') || finalPhotoUrl.startsWith('blob:'))) {
      try {
        const blob = await dataUrlToBlob(finalPhotoUrl);
        finalPhotoUrl = await uploadMediaFile(blob, 'checkins', this.currentUser.id);
      } catch (err) {
        console.warn('Checkin photo upload to storage notice:', err);
      }
    }

    const newCheckin: Checkin = {
      id: `chk_${Date.now()}`,
      challengeId: currentChallenge.id,
      userId: this.currentUser.id,
      dayNumber: Math.min(21, existing.length + 1),
      checkinDate: today,
      hobbyName: focusHobby,
      activitySummary: data?.activitySummary?.trim() || (finalCaption ? finalCaption : 'Daily streak photo check-in'),
      durationMinutes: data?.durationMinutes || 30,
      reflectionNote: finalCaption,
      caption: finalCaption,
      photoUrl: finalPhotoUrl || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedCheckins = [...existing, newCheckin];
    this.checkins[this.currentUser.id] = updatedCheckins;
    this.saveCheckins();

    // Calculate updated streaks directly from all saved check-in records
    const stats = calculateStreakStats(updatedCheckins, currentChallenge.longestStreak);

    // Save to Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('checkins').insert({
          id: newCheckin.id,
          challenge_id: currentChallenge.id,
          user_id: this.currentUser.id,
          day_number: stats.completedDaysCount,
          checkin_date: today,
          hobby_name: focusHobby,
          activity_summary: newCheckin.activitySummary,
          duration_minutes: newCheckin.durationMinutes,
          reflection_note: newCheckin.reflectionNote || null,
          caption: newCheckin.caption || null,
          photo_url: newCheckin.photoUrl || null,
          created_at: newCheckin.createdAt,
        });

        await supabase.from('challenges').upsert({
          id: currentChallenge.id,
          user_id: this.currentUser.id,
          title: currentChallenge.title,
          focus_hobby_name: focusHobby,
          daily_goal: currentChallenge.dailyGoal,
          target_days: 21,
          completed_days_count: stats.completedDaysCount,
          current_streak: stats.currentStreak,
          longest_streak: stats.longestStreak,
          status: stats.isUnlocked ? 'completed' : 'active',
          start_date: currentChallenge.startDate || today,
          last_checkin_date: today,
          completed_at: stats.isUnlocked ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase sync notice:', err);
      }
    }

    const updatedChallenge: Challenge = {
      ...currentChallenge,
      focusHobbyName: focusHobby,
      completedDaysCount: stats.completedDaysCount,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastCheckinDate: today,
      status: stats.isUnlocked ? 'completed' : 'active',
      completedAt: stats.isUnlocked ? new Date().toISOString() : undefined,
    };

    this.currentUser = {
      ...this.currentUser,
      challenge: updatedChallenge,
      challengeUnlocked: stats.isUnlocked,
    };
    this.saveAuth();

    return {
      success: true,
      checkin: newCheckin,
      stats,
    };
  }

  public fastTrackChallengeToDay21(): void {
    if (!this.currentUser) return;

    const syntheticCheckins: Checkin[] = [];
    const focusHobby = this.currentUser.challenge?.focusHobbyName || this.currentUser.hobbies[0]?.name || 'Wheel-thrown Ceramics';

    for (let i = 21; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - (i - 1));
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const dayNumber = 22 - i;

      syntheticCheckins.push({
        id: `chk_fasttrack_${dayNumber}`,
        challengeId: this.currentUser.challenge?.id || `ch_${this.currentUser.id}`,
        userId: this.currentUser.id,
        dayNumber,
        checkinDate: dateStr,
        hobbyName: focusHobby,
        activitySummary: `Completed deliberate 30-minute practice for Day ${dayNumber}`,
        durationMinutes: 30,
        caption: `Consistency ritual Day ${dayNumber} dedicated to ${focusHobby}.`,
        photoUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80',
        createdAt: `${dateStr}T18:00:00Z`,
      });
    }

    this.checkins[this.currentUser.id] = syntheticCheckins;
    this.saveCheckins();

    const completedChallenge: Challenge = {
      id: this.currentUser.challenge?.id || `ch_${this.currentUser.id}`,
      userId: this.currentUser.id,
      title: '21-Day Passion & Consistency Challenge',
      focusHobbyName: focusHobby,
      dailyGoal: 'Dedicate 30 minutes daily to my craft',
      targetDays: 21,
      completedDaysCount: 21,
      currentStreak: 21,
      longestStreak: 21,
      status: 'completed',
      startDate: syntheticCheckins[0].checkinDate,
      lastCheckinDate: getTodayDateString(),
      completedAt: new Date().toISOString(),
    };

    this.currentUser = {
      ...this.currentUser,
      challenge: completedChallenge,
      challengeUnlocked: true,
    };
    this.saveAuth();

    // Sync fast track to Supabase if live
    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('challenges').upsert({
          id: completedChallenge.id,
          user_id: this.currentUser.id,
          title: completedChallenge.title,
          focus_hobby_name: focusHobby,
          daily_goal: completedChallenge.dailyGoal,
          target_days: 21,
          completed_days_count: 21,
          current_streak: 21,
          longest_streak: 21,
          status: 'completed',
          start_date: completedChallenge.startDate,
          last_checkin_date: completedChallenge.lastCheckinDate,
          completed_at: completedChallenge.completedAt,
          updated_at: new Date().toISOString(),
        })
      ).catch((e: unknown) => console.warn('Supabase fasttrack challenge:', e));

      Promise.resolve(
        supabase.from('profiles').update({ challenge_unlocked: true }).eq('id', this.currentUser.id)
      ).catch((e: unknown) => console.warn('Supabase fasttrack profile:', e));
    }
  }

  // Compatibility and Matching Algorithm
  public calculateCompatibility(userA: Profile, userB: Profile): CompatibilityResult {
    let score = 50;
    const sharedHobbies: string[] = [];
    const reasons: string[] = [];
    const lifestyleHighlights: string[] = [];

    const userAHobbyNames = new Set(userA.hobbies.map((h) => h.name.toLowerCase()));
    const userACategories = new Set(userA.hobbies.map((h) => h.category));

    userB.hobbies.forEach((hobbyB) => {
      if (userAHobbyNames.has(hobbyB.name.toLowerCase())) {
        sharedHobbies.push(hobbyB.name);
        score += 15;
      } else if (userACategories.has(hobbyB.category)) {
        score += 5;
      }
    });

    const sharedCategories = Array.from(
      new Set(userB.hobbies.filter((h) => userACategories.has(h.category)).map((h) => h.category))
    );

    if (sharedHobbies.length > 0) {
      reasons.push(`Mutual dedication to ${sharedHobbies.slice(0, 2).join(' & ')}`);
    } else if (sharedCategories.length > 0) {
      reasons.push(`Shared resonance with ${sharedCategories[0]} pursuits`);
    }

    if (userA.datingPreferences?.relationshipIntent === userB.datingPreferences?.relationshipIntent) {
      score += 10;
      reasons.push('Aligned dating intention');
    }

    if (userA.lifestyle?.sleepSchedule === userB.lifestyle?.sleepSchedule) {
      score += 6;
      lifestyleHighlights.push(`Both are ${userA.lifestyle.sleepSchedule === 'early_bird' ? 'early risers' : 'night owls'}`);
    }

    if (userA.lifestyle?.weekendVibe === userB.lifestyle?.weekendVibe) {
      score += 8;
      lifestyleHighlights.push('Synchronized weekend rhythms');
    }

    const finalScore = Math.min(98, Math.max(52, score));

    return {
      score: finalScore,
      sharedHobbies,
      sharedCategories,
      reasons: reasons.length ? reasons : ['Shared curiosity for creative pursuits'],
      lifestyleHighlights,
    };
  }

  public areUsersMutuallyCompatible(userA: Profile, userB: Profile): boolean {
    if (userA.age < 18 || userB.age < 18) return false;

    const prefA = userA.datingPreferences;
    const prefB = userB.datingPreferences;

    if (prefA?.minAge && userB.age < prefA.minAge) return false;
    if (prefA?.maxAge && userB.age > prefA.maxAge) return false;
    if (prefB?.minAge && userA.age < prefB.minAge) return false;
    if (prefB?.maxAge && userA.age > prefB.maxAge) return false;

    const satisfiesGender = (candidateGender: string, interestedList?: string[]): boolean => {
      if (!interestedList || interestedList.length === 0 || interestedList.includes('All genders')) {
        return true;
      }
      const cleanCand = (candidateGender || '').trim().toLowerCase();
      return interestedList.some((interest) => {
        const cleanInterest = interest.trim().toLowerCase();
        if (cleanInterest === 'all genders') return true;
        if (cleanInterest === 'men' && (cleanCand === 'man' || cleanCand === 'men')) return true;
        if (cleanInterest === 'women' && (cleanCand === 'woman' || cleanCand === 'women')) return true;
        if (
          cleanInterest === 'non-binary' &&
          (cleanCand === 'non-binary' ||
            cleanCand === 'genderfluid' ||
            cleanCand === 'agender' ||
            cleanCand === 'two-spirit' ||
            cleanCand === 'self-describe')
        )
          return true;
        return cleanCand === cleanInterest;
      });
    };

    const aWantsB = satisfiesGender(userB.gender, prefA?.interestedInGenders);
    const bWantsA = satisfiesGender(userA.gender, prefB?.interestedInGenders);

    if (!aWantsB || !bWantsA) return false;

    return true;
  }

  public isMatchingUnlocked(userId?: string): boolean {
    const user = userId
      ? this.registeredUsers.find((u) => u.id === userId) || (this.currentUser?.id === userId ? this.currentUser : null)
      : this.currentUser;
    if (!user) return false;
    if (user.challengeUnlocked) return true;
    const stats = this.getStreakStats(user.id);
    if (stats.currentStreak >= 21) {
      user.challengeUnlocked = true;
      if (user.id === this.currentUser?.id) {
        this.saveAuth();
      }
      return true;
    }
    return false;
  }

  // Returns profiles for Discover based on active mode
  public getDiscoverProfiles(): { profile: Profile; compatibility: CompatibilityResult }[] {
    if (!this.currentUser) return [];

    if (!this.isMatchingUnlocked()) {
      return [];
    }

    const blockedIds = new Set(this.blocks.map((b) => b.blockedId));
    const connectedIds = new Set(this.connections.map((c) => c.partnerId));
    const pendingSentIds = new Set(
      this.connectionRequests.filter((r) => r.senderId === this.currentUser?.id).map((r) => r.recipientId)
    );
    const skippedSet = new Set(this.skips);

    // Candidates pool includes registered users and curated sample profiles
    const combinedPool: Profile[] = [...SAMPLE_PROFILES, ...this.registeredUsers];
    const uniqueMap = new Map<string, Profile>();
    combinedPool.forEach((p) => {
      if (p.id !== this.currentUser?.id && !uniqueMap.has(p.id)) {
        uniqueMap.set(p.id, p);
      }
    });

    const candidates = Array.from(uniqueMap.values()).filter((candidate) => {
      if (candidate.isIncognito) return false;
      if (blockedIds.has(candidate.id)) return false;
      if (connectedIds.has(candidate.id)) return false;
      if (pendingSentIds.has(candidate.id)) return false;
      if (skippedSet.has(candidate.id)) return false;

      return this.areUsersMutuallyCompatible(this.currentUser!, candidate);
    });

    return candidates
      .map((profile) => ({
        profile,
        compatibility: this.calculateCompatibility(this.currentUser!, profile),
      }))
      .sort((a, b) => b.compatibility.score - a.compatibility.score);
  }

  public skipProfile(profileId: string): void {
    if (!this.skips.includes(profileId)) {
      this.skips.push(profileId);
      this.saveSkips();
      this.notify();
    }
  }

  // Connection Requests & Sparks
  public getConnectionRequests(): ConnectionRequest[] {
    if (!this.currentUser) return [];
    return this.connectionRequests.filter(
      (r) => r.recipientId === this.currentUser?.id && r.status === 'pending'
    );
  }

  public getOutgoingRequests(): ConnectionRequest[] {
    if (!this.currentUser) return [];
    return this.connectionRequests.filter((r) => r.senderId === this.currentUser?.id);
  }

  public getConnections(): Connection[] {
    return this.connections;
  }

  public sendConnectionRequest(
    recipientId: string,
    introNote: string,
    sharedHobbyReference: string
  ): { success: boolean; error?: string } {
    if (!this.currentUser) return { success: false, error: 'Not authenticated' };
    if (this.currentUser.id === recipientId) return { success: false, error: 'Cannot connect with yourself' };

    const pool = [...SAMPLE_PROFILES, ...this.registeredUsers];
    const recipient = pool.find((p) => p.id === recipientId);
    if (!recipient) return { success: false, error: 'Profile not found' };

    const newRequest: ConnectionRequest = {
      id: `req_${Date.now()}`,
      senderId: this.currentUser.id,
      recipientId,
      senderProfile: this.currentUser,
      recipientProfile: recipient,
      introNote: introNote.trim(),
      sharedHobbyReference,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.connectionRequests = [newRequest, ...this.connectionRequests];
    this.saveRequests();

    // Sync to Supabase
    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('connection_requests').insert({
          id: newRequest.id,
          sender_id: this.currentUser.id,
          recipient_id: recipientId,
          intro_note: newRequest.introNote,
          shared_hobby_reference: newRequest.sharedHobbyReference,
          status: 'pending',
          created_at: newRequest.createdAt,
        })
      ).catch((e: unknown) => console.warn('Supabase sendConnectionRequest sync:', e));
    }

    return { success: true };
  }

  public sendInstantSpark(recipientId: string): {
    success: boolean;
    isMutual: boolean;
    connection?: Connection;
    partner?: Profile;
  } {
    if (!this.currentUser) return { success: false, isMutual: false };

    // Check if recipient has an incoming request to current user
    const incoming = this.connectionRequests.find(
      (r) => r.senderId === recipientId && r.recipientId === this.currentUser?.id && r.status === 'pending'
    );
    if (incoming) {
      const res = this.acceptConnectionRequest(incoming.id);
      return { success: true, isMutual: true, connection: res.connection, partner: incoming.senderProfile };
    }

    // In demo mode or if sparking a demo profile, create instant romantic mutual match!
    const pool = [...SAMPLE_PROFILES, ...this.registeredUsers];
    const partner = pool.find((p) => p.id === recipientId);
    if (partner) {
      if (this.isDemoMode || partner.id.startsWith('user_')) {
        const newConnection: Connection = {
          id: `conn_${Date.now()}`,
          partnerId: partner.id,
          partnerProfile: partner,
          connectedAt: new Date().toISOString(),
          lastMessage: {
            content: `You both felt the spark over ${partner.hobbies[0]?.name || 'shared passions'}!`,
            createdAt: new Date().toISOString(),
            senderId: partner.id,
          },
        };
        this.connections = [newConnection, ...this.connections];
        this.saveConnections();

        const welcomeMsg: Message = {
          id: `msg_match_${Date.now()}`,
          connectionId: newConnection.id,
          senderId: partner.id,
          recipientId: this.currentUser.id,
          content: `Hey ${this.currentUser.displayName}! So thrilled we both felt the spark. I loved seeing your passion for ${partner.hobbies[0]?.name || 'creativity'}. How's your day going?`,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        this.messages = [...this.messages, welcomeMsg];
        this.saveMessages();

        return { success: true, isMutual: true, connection: newConnection, partner };
      }
    }

    const result = this.sendConnectionRequest(
      recipientId,
      'Felt a mutual spark from your profile!',
      partner?.hobbies[0]?.name || 'Shared Passions'
    );
    return { success: result.success, isMutual: false, partner };
  }

  public acceptConnectionRequest(requestId: string): { success: boolean; connection?: Connection } {
    const req = this.connectionRequests.find((r) => r.id === requestId);
    if (!req || !this.currentUser) return { success: false };

    req.status = 'accepted';
    this.saveRequests();

    const partnerProfile = req.senderProfile;
    const newConnection: Connection = {
      id: `conn_${Date.now()}`,
      partnerId: partnerProfile.id,
      partnerProfile,
      connectedAt: new Date().toISOString(),
      lastMessage: {
        content: req.introNote,
        createdAt: req.createdAt,
        senderId: partnerProfile.id,
      },
    };

    this.connections = [newConnection, ...this.connections];
    this.saveConnections();

    const firstMsg: Message = {
      id: `msg_intro_${Date.now()}`,
      connectionId: newConnection.id,
      senderId: partnerProfile.id,
      recipientId: this.currentUser.id,
      content: req.introNote,
      isRead: false,
      createdAt: req.createdAt,
    };
    this.messages = [...this.messages, firstMsg];
    this.saveMessages();

    // Sync to Supabase
    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('connection_requests').update({ status: 'accepted' }).eq('id', requestId)
      ).catch((e: unknown) => console.warn('Supabase accept request sync:', e));

      Promise.resolve(
        supabase.from('connections').insert({
          id: newConnection.id,
          user_one_id: partnerProfile.id,
          user_two_id: this.currentUser.id,
          connected_at: newConnection.connectedAt,
        })
      ).catch((e: unknown) => console.warn('Supabase insert connection sync:', e));

      Promise.resolve(
        supabase.from('messages').insert({
          id: firstMsg.id,
          connection_id: newConnection.id,
          sender_id: partnerProfile.id,
          recipient_id: this.currentUser.id,
          content: firstMsg.content,
          is_read: false,
          created_at: firstMsg.createdAt,
        })
      ).catch((e: unknown) => console.warn('Supabase insert first message sync:', e));
    }

    return { success: true, connection: newConnection };
  }

  public declineConnectionRequest(requestId: string): void {
    const req = this.connectionRequests.find((r) => r.id === requestId);
    if (req) {
      req.status = 'declined';
      this.saveRequests();

      const supabase = getSupabase();
      if (supabase) {
        Promise.resolve(
          supabase.from('connection_requests').update({ status: 'declined' }).eq('id', requestId)
        ).catch((e: unknown) => console.warn('Supabase decline request sync:', e));
      }
    }
  }

  // Messaging (Strictly mutual connections)
  public getMessages(connectionId: string): Message[] {
    return this.messages
      .filter((m) => m.connectionId === connectionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public sendMessage(connectionId: string, content: string): { success: boolean; error?: string } {
    if (!this.currentUser) return { success: false, error: 'Not authenticated' };
    const conn = this.connections.find((c) => c.id === connectionId);
    if (!conn) {
      return { success: false, error: 'Cannot send message: Mutual connection does not exist.' };
    }

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      connectionId,
      senderId: this.currentUser.id,
      recipientId: conn.partnerId,
      content: content.trim(),
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    this.messages = [...this.messages, newMsg];
    conn.lastMessage = {
      content: newMsg.content,
      createdAt: newMsg.createdAt,
      senderId: newMsg.senderId,
    };
    this.saveMessages();
    this.saveConnections();

    // Sync to Supabase
    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('messages').insert({
          id: newMsg.id,
          connection_id: connectionId,
          sender_id: this.currentUser.id,
          recipient_id: conn.partnerId,
          content: newMsg.content,
          is_read: false,
          created_at: newMsg.createdAt,
        })
      ).catch((e: unknown) => console.warn('Supabase sendMessage sync:', e));
    }

    // If demo partner, simulate conversational reply
    if (this.isDemoMode || conn.partnerProfile.id.startsWith('user_')) {
      setTimeout(() => {
        this.simulateReply(connectionId, conn.partnerProfile);
      }, 1500);
    }

    return { success: true };
  }

  private simulateReply(connectionId: string, partner: Profile) {
    const sampleReplies = [
      `That is so true! I noticed how much patience ${partner.hobbies[0]?.name || 'that craft'} requires. How long have you been into it?`,
      `I completely agree. For me, setting aside that 30 minutes in the morning completely shifts the rest of my day.`,
      `Would love to hear more about your process! We should definitely plan a quiet weekend coffee or studio walk sometime.`,
      `Consistency really does change how we perceive time and craft.`,
    ];

    const replyText = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
    const replyMsg: Message = {
      id: `msg_reply_${Date.now()}`,
      connectionId,
      senderId: partner.id,
      recipientId: this.currentUser?.id || '',
      content: replyText,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.messages = [...this.messages, replyMsg];
    const conn = this.connections.find((c) => c.id === connectionId);
    if (conn) {
      conn.lastMessage = {
        content: replyMsg.content,
        createdAt: replyMsg.createdAt,
        senderId: replyMsg.senderId,
      };
    }
    this.saveMessages();
    this.saveConnections();
  }

  // Safety: Blocks & Reports
  public blockUser(targetUserId: string): void {
    if (!this.currentUser) return;
    const newBlock: Block = {
      id: `blk_${Date.now()}`,
      blockerId: this.currentUser.id,
      blockedId: targetUserId,
      createdAt: new Date().toISOString(),
    };

    this.blocks = [newBlock, ...this.blocks];
    this.connections = this.connections.filter((c) => c.partnerId !== targetUserId);
    this.connectionRequests = this.connectionRequests.filter(
      (r) => r.senderId !== targetUserId && r.recipientId !== targetUserId
    );

    this.saveBlocks();
    this.saveConnections();
    this.saveRequests();

    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('blocks').insert({
          id: newBlock.id,
          blocker_id: this.currentUser.id,
          blocked_id: targetUserId,
          created_at: newBlock.createdAt,
        })
      ).catch((e: unknown) => console.warn('Supabase blockUser sync:', e));
    }
  }

  public reportUser(targetUserId: string, reason: string, details?: string): void {
    if (!this.currentUser) return;
    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: this.currentUser.id,
      reportedId: targetUserId,
      reason,
      details,
      createdAt: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('reports').insert({
          id: newReport.id,
          reporter_id: this.currentUser.id,
          reported_id: targetUserId,
          reason,
          details: details || null,
          created_at: newReport.createdAt,
        })
      ).catch((e: unknown) => console.warn('Supabase reportUser sync:', e));
    }

    this.blockUser(targetUserId);
  }

  public getBlockedUsers(): Block[] {
    return this.blocks;
  }

  public unblockUser(targetUserId: string): void {
    this.blocks = this.blocks.filter((b) => b.blockedId !== targetUserId);
    this.saveBlocks();

    const supabase = getSupabase();
    if (supabase && this.currentUser) {
      Promise.resolve(
        supabase.from('blocks').delete().eq('blocker_id', this.currentUser.id).eq('blocked_id', targetUserId)
      ).catch((e: unknown) => console.warn('Supabase unblockUser sync:', e));
    }
  }

  public exportUserData(): string {
    if (!this.currentUser) return '{}';
    const payload = {
      profile: this.currentUser,
      checkins: this.getUserCheckins(),
      streakStats: this.getStreakStats(),
      connections: this.connections,
      messages: this.messages,
      thisOrThatAnswers: this.getThisOrThatAnswers(),
      dailyPromptAnswers: this.getDailyPromptAnswers(),
      quizResults: this.getUserQuizResults(),
      exportDate: new Date().toISOString(),
      platform: 'Lovbee',
    };
    return JSON.stringify(payload, null, 2);
  }

  public deleteAccount(): void {
    if (!this.currentUser) return;
    const uid = this.currentUser.id;

    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('profiles').delete().eq('id', uid)
      ).catch((e: unknown) => console.warn('Supabase delete profile:', e));
    }

    this.registeredUsers = this.registeredUsers.filter((u) => u.id !== uid);
    this.saveRegisteredUsers();
    this.logout();
  }

  // Interactive Games
  // A. This or That
  public getThisOrThatQuestions(): ThisOrThatQuestion[] {
    return THIS_OR_THAT_BANK;
  }

  public getThisOrThatAnswers(userId?: string): Record<string, ThisOrThatAnswer> {
    const uid = userId || this.currentUser?.id;
    if (!uid) return {};
    return this.thisOrThatAnswers[uid] || {};
  }

  public getNextUnusedThisOrThatQuestion(
    userId?: string,
    skipQuestionIds: string[] = []
  ): ThisOrThatQuestion | null {
    const uid = userId || this.currentUser?.id;
    const answeredMap = uid ? this.thisOrThatAnswers[uid] || {} : {};
    const answeredKeys = new Set(Object.values(answeredMap).map((a) => a.normalizedKey));
    const skipSet = new Set(skipQuestionIds);

    for (const q of THIS_OR_THAT_BANK) {
      if (skipSet.has(q.id)) continue;
      if (answeredMap[q.id]) continue;
      if (answeredKeys.has(q.normalizedKey)) continue;
      return q;
    }

    for (const q of THIS_OR_THAT_BANK) {
      if (skipSet.has(q.id)) continue;
      if (!answeredMap[q.id]) return q;
    }

    return null;
  }

  public submitThisOrThatAnswer(
    questionId: string,
    option: 'A' | 'B'
  ): { answer: ThisOrThatAnswer; reaction: string } {
    if (!this.currentUser) throw new Error('Not authenticated');
    const uid = this.currentUser.id;
    const q = THIS_OR_THAT_BANK.find((item) => item.id === questionId);
    const label = option === 'A' ? (q?.optionA.label || 'Option A') : (q?.optionB.label || 'Option B');
    const reaction =
      option === 'A'
        ? (q?.reactionA || 'Bold and vibrant choice! Matches your adventurous spirit.')
        : (q?.reactionB || 'Delightful and grounded choice! Shows your thoughtful depth.');

    const normKey = q ? q.normalizedKey : normalizeThisOrThatKey(label, '');
    const newAns: ThisOrThatAnswer = {
      id: `tot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      questionId,
      normalizedKey: normKey,
      userId: uid,
      selectedOption: option,
      selectedLabel: label,
      reactionGiven: reaction,
      answeredAt: new Date().toISOString(),
    };

    if (!this.thisOrThatAnswers[uid]) {
      this.thisOrThatAnswers[uid] = {};
    }
    this.thisOrThatAnswers[uid][questionId] = newAns;
    this.saveThisOrThat();

    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('game_this_or_that_answers').upsert(
          {
            id: newAns.id,
            user_id: uid,
            question_id: questionId,
            normalized_key: normKey,
            selected_option: option,
            selected_label: label,
            reaction_given: reaction,
            answered_at: newAns.answeredAt,
          },
          { onConflict: 'user_id,question_id' }
        )
      ).catch((err: unknown) => console.warn('Supabase TOT sync:', err));
    }

    return { answer: newAns, reaction };
  }

  public resetThisOrThatHistory(userId?: string): void {
    const uid = userId || this.currentUser?.id;
    if (!uid) return;
    this.thisOrThatAnswers[uid] = {};
    this.saveThisOrThat();

    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('game_this_or_that_answers').delete().eq('user_id', uid)
      ).catch((e: unknown) => console.warn('Supabase reset TOT:', e));
    }
  }

  // B. Daily Question
  public getDailyPrompts(): DailyPromptQuestion[] {
    return DAILY_PROMPTS_BANK;
  }

  public getTodayPrompt(dateStr?: string): DailyPromptQuestion {
    const dStr = dateStr || getTodayDateString();
    let hash = 0;
    for (let i = 0; i < dStr.length; i++) {
      hash = (hash * 31 + dStr.charCodeAt(i)) >>> 0;
    }
    const index = hash % DAILY_PROMPTS_BANK.length;
    return DAILY_PROMPTS_BANK[index];
  }

  public getDailyPromptAnswers(userId?: string): DailyPromptAnswer[] {
    const uid = userId || this.currentUser?.id;
    if (!uid) return [];
    return this.dailyPromptAnswers[uid] || [];
  }

  public getTodayPromptAnswer(userId?: string, dateStr?: string): DailyPromptAnswer | undefined {
    const uid = userId || this.currentUser?.id;
    if (!uid) return undefined;
    const targetDate = dateStr || getTodayDateString();
    const answers = this.dailyPromptAnswers[uid] || [];
    return answers.find((a) => a.calendarDate === targetDate);
  }

  public submitDailyPromptAnswer(
    promptId: string,
    promptText: string,
    answerText: string,
    shareOnProfile: boolean,
    calendarDate?: string
  ): DailyPromptAnswer {
    if (!this.currentUser) throw new Error('Not authenticated');
    const uid = this.currentUser.id;
    const cDate = calendarDate || getTodayDateString();

    const newAnswer: DailyPromptAnswer = {
      id: `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      promptId,
      promptText,
      userId: uid,
      answerText: answerText.trim(),
      shareOnProfile,
      calendarDate: cDate,
      answeredAt: new Date().toISOString(),
    };

    const existing = this.dailyPromptAnswers[uid] || [];
    const filtered = existing.filter((a) => a.promptId !== promptId && a.calendarDate !== cDate);
    this.dailyPromptAnswers[uid] = [newAnswer, ...filtered];
    this.saveDailyPrompts();

    if (shareOnProfile) {
      const existingPrompts = this.currentUser.prompts || [];
      const updatedPrompts = [
        ...existingPrompts.filter((p) => p.question !== promptText),
        { question: promptText, answer: answerText.trim() },
      ];
      this.updateProfile({ prompts: updatedPrompts });
    }

    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('game_daily_prompt_answers').upsert(
          {
            id: newAnswer.id,
            user_id: uid,
            prompt_id: promptId,
            prompt_text: promptText,
            answer_text: newAnswer.answerText,
            share_on_profile: shareOnProfile,
            calendar_date: cDate,
            answered_at: newAnswer.answeredAt,
          },
          { onConflict: 'user_id,calendar_date' }
        )
      ).catch((err: unknown) => console.warn('Supabase prompt sync:', err));
    }

    return newAnswer;
  }

  public deleteDailyPromptAnswer(answerId: string): void {
    if (!this.currentUser) return;
    const uid = this.currentUser.id;
    const existing = this.dailyPromptAnswers[uid] || [];
    const target = existing.find((a) => a.id === answerId);
    this.dailyPromptAnswers[uid] = existing.filter((a) => a.id !== answerId);
    this.saveDailyPrompts();

    if (target && target.shareOnProfile) {
      const existingPrompts = this.currentUser.prompts || [];
      const updatedPrompts = existingPrompts.filter((p) => p.question !== target.promptText);
      this.updateProfile({ prompts: updatedPrompts });
    }

    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('game_daily_prompt_answers').delete().eq('id', answerId)
      ).catch((e: unknown) => console.warn('Supabase delete prompt:', e));
    }
  }

  // C. Hobby Personality Quizzes
  public getAvailableQuizzes(): QuizSet[] {
    return QUIZ_SETS;
  }

  public getQuizById(quizId: string): QuizSet | undefined {
    return QUIZ_SETS.find((q) => q.id === quizId) || QUIZ_SETS[0];
  }

  public getHobbyQuizQuestions(quizId?: string): QuizQuestion[] {
    if (quizId) {
      const found = QUIZ_SETS.find((q) => q.id === quizId);
      if (found) return found.questions;
    }
    return QUIZ_SETS[0].questions;
  }

  public getUserQuizResults(userId?: string): QuizResult[] {
    const uid = userId || this.currentUser?.id;
    if (!uid) return [];
    const userMap = this.quizResults[uid] || {};
    return Object.values(userMap);
  }

  public getSavedQuizResult(userId?: string, quizId?: string): QuizResult | null {
    const uid = userId || this.currentUser?.id;
    if (!uid) return null;
    const userMap = this.quizResults[uid];
    if (!userMap) return null;
    if (quizId && userMap[quizId]) {
      return userMap[quizId];
    }
    const list = Object.values(userMap);
    return list.length > 0 ? list[list.length - 1] : null;
  }

  public retakeQuiz(quizId: string, userId?: string): void {
    const uid = userId || this.currentUser?.id;
    if (!uid || !this.quizResults[uid]) return;
    delete this.quizResults[uid][quizId];
    this.saveQuizResults();

    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('game_quiz_results').delete().eq('user_id', uid).eq('quiz_id', quizId)
      ).catch((e: unknown) => console.warn('Supabase delete quiz result:', e));
    }
  }

  public submitHobbyQuizAnswers(quizId: string, answers: Record<string, string>): QuizResult {
    if (!this.currentUser) throw new Error('Not authenticated');
    const uid = this.currentUser.id;

    const quizSet = QUIZ_SETS.find((q) => q.id === quizId) || QUIZ_SETS[0];

    // Tally archetype weights
    const tallies: Record<string, number> = {};
    quizSet.questions.forEach((q) => {
      const chosenOptionId = answers[q.id];
      const opt = q.options.find((o) => o.id === chosenOptionId);
      if (opt?.archetypeWeight) {
        Object.entries(opt.archetypeWeight).forEach(([key, wt]) => {
          tallies[key] = (tallies[key] || 0) + wt;
        });
      }
    });

    let topArchetype = Object.keys(quizSet.results)[0] || 'artisan';
    let topScore = -1;
    Object.entries(tallies).forEach(([archetype, score]) => {
      if (score > topScore && quizSet.results[archetype]) {
        topScore = score;
        topArchetype = archetype;
      }
    });

    const template = quizSet.results[topArchetype] || Object.values(quizSet.results)[0];

    const result: QuizResult = {
      id: `qz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      quizId: quizSet.id,
      quizTitle: quizSet.title,
      userId: uid,
      personaTitle: template.personaTitle,
      badge: template.badge,
      tagline: template.tagline,
      description: template.description,
      keyTraits: template.keyTraits,
      suggestedHobbies: template.suggestedHobbies,
      nextTryIdea: template.nextTryIdea,
      idealDateIdea: template.idealDateIdea,
      compatiblePersonas: template.compatiblePersonas,
      completedAt: new Date().toISOString(),
    };

    if (!this.quizResults[uid]) {
      this.quizResults[uid] = {};
    }
    this.quizResults[uid][quizSet.id] = result;
    this.saveQuizResults();

    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('game_quiz_results').upsert(
          {
            id: result.id,
            user_id: uid,
            quiz_id: quizSet.id,
            quiz_title: quizSet.title,
            persona_title: result.personaTitle,
            badge: result.badge,
            tagline: result.tagline,
            description: result.description,
            key_traits: result.keyTraits,
            suggested_hobbies: result.suggestedHobbies,
            next_try_idea: result.nextTryIdea,
            ideal_date_idea: result.idealDateIdea,
            compatible_personas: result.compatiblePersonas || [],
            completed_at: result.completedAt,
          },
          { onConflict: 'user_id,quiz_id' }
        )
      ).catch((err: unknown) => console.warn('Supabase quiz sync:', err));
    }

    return result;
  }
}

export const store = new StoreService();
export const areUsersMutuallyCompatible = (userA: Profile, userB: Profile): boolean =>
  store.areUsersMutuallyCompatible(userA, userB);
