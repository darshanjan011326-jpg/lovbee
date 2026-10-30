export type HobbyCategory =
  | 'sports'
  | 'arts'
  | 'outdoors'
  | 'intellectual'
  | 'wellness'
  | 'culinary'
  | 'crafts'
  | 'music';

export type SkillLevel = 'beginner' | 'intermediate' | 'passionate' | 'expert';

export interface Hobby {
  id: string;
  name: string;
  category: HobbyCategory;
  description: string;
  iconName: string;
}

export interface UserHobby {
  hobbyId: string;
  name: string;
  category: HobbyCategory;
  skillLevel: SkillLevel;
  yearsPracticed: number;
  isChallengeFocus?: boolean;
}

export interface LifestylePreferences {
  sleepSchedule: 'early_bird' | 'night_owl' | 'flexible';
  weekendVibe: 'active_outdoors' | 'slow_mornings' | 'social_gatherings' | 'creative_projects';
  communicationStyle: 'thoughtful_notes' | 'quick_checkins' | 'voice_notes' | 'in_person_only';
  activityLevel: 'daily_mover' | 'weekend_warrior' | 'relaxed_explorer';
}

export type SexualOrientation =
  | 'Straight'
  | 'Gay'
  | 'Lesbian'
  | 'Bisexual'
  | 'Pansexual'
  | 'Asexual'
  | 'Queer'
  | 'Self-describe'
  | 'Prefer not to say';

export type GenderIdentity =
  | 'Woman'
  | 'Man'
  | 'Non-binary'
  | 'Agender'
  | 'Genderfluid'
  | 'Two-Spirit'
  | 'Self-describe'
  | 'Prefer not to say';

export interface DatingPreferences {
  minAge: number;
  maxAge: number;
  relationshipIntent: 'serious_relationship' | 'intentional_dating' | 'activity_partner_romance';
  interestedInGenders: string[]; // ['Men', 'Women', 'Non-binary', 'All genders']
  maxDistanceKm: number;
}

export interface Challenge {
  id: string;
  userId: string;
  title: string;
  focusHobbyName: string;
  dailyGoal: string;
  targetDays: number; // default 21
  completedDaysCount: number;
  currentStreak: number;
  longestStreak: number;
  status: 'active' | 'completed' | 'paused';
  startDate: string; // ISO date YYYY-MM-DD
  lastCheckinDate?: string;
  completedAt?: string;
}

export interface Checkin {
  id: string;
  challengeId: string;
  userId: string;
  dayNumber: number; // 1..21
  checkinDate: string; // YYYY-MM-DD
  hobbyName: string;
  activitySummary: string;
  durationMinutes: number;
  reflectionNote?: string;
  caption?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  gender: string;
  genderSelfDescribe?: string;
  showGenderOnProfile?: boolean; // default true
  sexualOrientation?: string;
  orientationSelfDescribe?: string;
  showOrientationOnProfile?: boolean; // private by default (false)
  bio: string;
  location: string;
  occupation: string;
  avatarUrl: string;
  photos?: string[];
  prompts?: { question: string; answer: string }[];
  hobbies: UserHobby[];
  lifestyle: LifestylePreferences;
  datingPreferences: DatingPreferences;
  profileComplete: boolean;
  challengeUnlocked: boolean; // unlocked when 21 days completed or unlocked
  isIncognito: boolean;
  createdAt: string;
  challenge?: Challenge;
  checkins?: Checkin[];
}

export interface ConnectionRequest {
  id: string;
  senderId: string;
  recipientId: string;
  senderProfile: Profile;
  recipientProfile?: Profile;
  introNote: string;
  sharedHobbyReference: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Connection {
  id: string;
  partnerId: string;
  partnerProfile: Profile;
  connectedAt: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
}

export interface Message {
  id: string;
  connectionId: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  details?: string;
  createdAt: string;
}

export interface CompatibilityResult {
  score: number; // 0-100%
  sharedHobbies: string[];
  sharedCategories: string[];
  reasons: string[];
  lifestyleHighlights: string[];
}

export type NavTabType =
  | 'discover'
  | 'likes'
  | 'connections'
  | 'messages'
  | 'challenge'
  | 'play'
  | 'profile'
  | 'settings'
  | 'home';

export interface ThisOrThatQuestion {
  id: string;
  normalizedKey: string; // for duplicate detection & reversed pair matching
  category: string;
  situationContext?: string; // e.g. "Superpower Dilemma", "Midnight Spontaneity"
  optionA: {
    id: string;
    label: string;
    sublabel?: string;
    iconName?: string;
  };
  optionB: {
    id: string;
    label: string;
    sublabel?: string;
    iconName?: string;
  };
  reactionA?: string; // friendly witty takeaway when A is picked
  reactionB?: string; // friendly witty takeaway when B is picked
  communityPercentA: number; // e.g. 54
}

export interface ThisOrThatAnswer {
  id: string;
  questionId: string;
  normalizedKey: string;
  userId: string;
  selectedOption: 'A' | 'B';
  selectedLabel: string;
  reactionGiven?: string;
  answeredAt: string;
}

export interface DailyPromptQuestion {
  id: string;
  normalizedPrompt: string; // for duplicate & normalization checks
  dayIndex: number;
  category: string;
  flavorContext?: string;
  prompt: string;
  exampleAnswer?: string;
}

export interface DailyPromptAnswer {
  id: string;
  promptId: string;
  promptText: string;
  userId: string;
  answerText: string;
  shareOnProfile: boolean;
  calendarDate: string; // YYYY-MM-DD
  answeredAt: string;
}

export interface QuizOption {
  id: string;
  label: string;
  sublabel?: string;
  archetypeWeight: Record<string, number>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: QuizOption[];
}

export interface QuizResultTemplate {
  personaTitle: string;
  badge: string;
  tagline: string;
  description: string;
  keyTraits: string[];
  suggestedHobbies: string[];
  nextTryIdea: string;
  idealDateIdea: string;
  compatiblePersonas?: string[];
}

export interface QuizSet {
  id: string;
  title: string;
  category: string;
  tagline: string;
  estimatedMinutes: number;
  iconName?: string;
  questions: QuizQuestion[];
  results: Record<string, QuizResultTemplate>;
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  personaTitle: string;
  badge: string;
  tagline: string;
  description: string;
  keyTraits: string[];
  suggestedHobbies: string[];
  nextTryIdea: string;
  idealDateIdea: string;
  compatiblePersonas?: string[];
  completedAt: string;
}
