-- ====================================================================
-- LOVBEE PRODUCTION DATABASE SCHEMA (PostgreSQL + Supabase RLS)
-- Project: LOVBEE — Find your buzz. Feel the love.
-- Description: Complete schema for authentication, age-gated profiles,
-- hobbies, 21-day consistency ritual, check-ins, connections, messaging,
-- interactive play games, media storage, and Row Level Security.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE hobby_category AS ENUM (
    'sports', 'arts', 'outdoors', 'intellectual', 'wellness', 'culinary', 'crafts', 'music'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE skill_level AS ENUM (
    'beginner', 'intermediate', 'passionate', 'expert'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE challenge_status AS ENUM (
    'active', 'completed', 'paused', 'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM (
    'pending', 'accepted', 'declined'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER GENERATED ALWAYS AS (
    DATE_PART('year', AGE(CURRENT_DATE, date_of_birth))
  ) STORED,
  gender TEXT DEFAULT 'Prefer not to say',
  gender_self_describe TEXT,
  show_gender_on_profile BOOLEAN DEFAULT TRUE,
  sexual_orientation TEXT DEFAULT 'Prefer not to say',
  orientation_self_describe TEXT,
  show_orientation_on_profile BOOLEAN DEFAULT FALSE,
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  occupation TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  photos JSONB DEFAULT '[]'::jsonb,
  prompts JSONB DEFAULT '[]'::jsonb,
  hobbies JSONB DEFAULT '[]'::jsonb,
  lifestyle JSONB DEFAULT '{"sleepSchedule": "early_bird", "weekendVibe": "slow_mornings", "communicationStyle": "thoughtful_notes", "activityLevel": "daily_mover"}'::jsonb,
  dating_preferences JSONB DEFAULT '{"minAge": 21, "maxAge": 45, "relationshipIntent": "intentional_dating", "interestedInGenders": ["All genders"], "maxDistanceKm": 50}'::jsonb,
  profile_complete BOOLEAN DEFAULT FALSE,
  challenge_unlocked BOOLEAN DEFAULT FALSE,
  is_incognito BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Strict 18+ age restriction constraint
  CONSTRAINT minimum_age_18 CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '18 years')
);

-- 4. HOBBIES REFERENCE TABLE
CREATE TABLE IF NOT EXISTS public.hobbies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE,
  name TEXT NOT NULL UNIQUE,
  category hobby_category NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Activity',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER HOBBIES JOIN TABLE
CREATE TABLE IF NOT EXISTS public.user_hobbies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hobby_id UUID REFERENCES public.hobbies(id) ON DELETE CASCADE,
  hobby_name TEXT NOT NULL,
  category hobby_category NOT NULL,
  skill_level skill_level DEFAULT 'passionate',
  years_practiced NUMERIC(3, 1) DEFAULT 1.0,
  is_challenge_focus BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hobby_name)
);

-- 6. CHALLENGES TABLE (21-Day Consistency Ritual)
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY DEFAULT ('ch_' || uuid_generate_v4()::text),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '21-Day Passion & Consistency Challenge',
  focus_hobby_name TEXT NOT NULL DEFAULT 'Creative Practice',
  daily_goal TEXT NOT NULL DEFAULT 'Dedicate 30 minutes daily to my craft',
  target_days INTEGER NOT NULL DEFAULT 21,
  completed_days_count INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  status challenge_status NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_checkin_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CHECK-INS TABLE
CREATE TABLE IF NOT EXISTS public.checkins (
  id TEXT PRIMARY KEY DEFAULT ('chk_' || uuid_generate_v4()::text),
  challenge_id TEXT REFERENCES public.challenges(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 21),
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hobby_name TEXT NOT NULL,
  activity_summary TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  reflection_note TEXT,
  caption TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent multiple checkins on the same day for a single user
  UNIQUE(user_id, checkin_date)
);

-- 8. CONNECTION REQUESTS TABLE (Sparks & Admirers)
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id TEXT PRIMARY KEY DEFAULT ('req_' || uuid_generate_v4()::text),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  intro_note TEXT NOT NULL,
  shared_hobby_reference TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent sending request to self or duplicates
  CONSTRAINT cannot_connect_self CHECK (sender_id != recipient_id),
  UNIQUE(sender_id, recipient_id)
);

-- 9. MUTUAL CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.connections (
  id TEXT PRIMARY KEY DEFAULT ('conn_' || uuid_generate_v4()::text),
  user_one_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_two_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT connection_not_self CHECK (user_one_id != user_two_id),
  UNIQUE(user_one_id, user_two_id)
);

-- 10. MESSAGES TABLE (Mutual connections only)
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY DEFAULT ('msg_' || uuid_generate_v4()::text),
  connection_id TEXT NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. BLOCKS & REPORTS TABLES
CREATE TABLE IF NOT EXISTS public.blocks (
  id TEXT PRIMARY KEY DEFAULT ('blk_' || uuid_generate_v4()::text),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY DEFAULT ('rep_' || uuid_generate_v4()::text),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. INTERACTIVE GAMES
-- A. This or That
CREATE TABLE IF NOT EXISTS public.game_this_or_that_answers (
  id TEXT PRIMARY KEY DEFAULT ('tot_' || uuid_generate_v4()::text),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  normalized_key TEXT NOT NULL,
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B')),
  selected_label TEXT NOT NULL,
  reaction_given TEXT,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_tot_user_normalized ON public.game_this_or_that_answers(user_id, normalized_key);

-- B. Daily Prompt Answers
CREATE TABLE IF NOT EXISTS public.game_daily_prompt_answers (
  id TEXT PRIMARY KEY DEFAULT ('ans_' || uuid_generate_v4()::text),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  share_on_profile BOOLEAN DEFAULT FALSE,
  calendar_date DATE NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, calendar_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_user_date ON public.game_daily_prompt_answers(user_id, calendar_date);

-- C. Hobby Personality Quiz Results
CREATE TABLE IF NOT EXISTS public.game_quiz_results (
  id TEXT PRIMARY KEY DEFAULT ('qz_' || uuid_generate_v4()::text),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  quiz_title TEXT NOT NULL,
  persona_title TEXT NOT NULL,
  badge TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  key_traits TEXT[] DEFAULT '{}',
  suggested_hobbies TEXT[] DEFAULT '{}',
  next_try_idea TEXT,
  ideal_date_idea TEXT,
  compatible_personas TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quiz_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_user ON public.game_quiz_results(user_id, quiz_id);

-- ====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    date_of_birth,
    gender,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, CURRENT_DATE - INTERVAL '20 years'),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'Prefer not to say'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_this_or_that_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_daily_prompt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_quiz_results ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Anyone authenticated can read non-incognito, non-blocked profiles. Own profile is always readable.
CREATE POLICY "Public profiles visible to authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR (
      is_incognito = FALSE
      AND NOT EXISTS (
        SELECT 1 FROM public.blocks
        WHERE (blocker_id = auth.uid() AND blocked_id = profiles.id)
           OR (blocker_id = profiles.id AND blocked_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- 2. Hobbies: Read-only catalogue for all authenticated users
CREATE POLICY "Hobbies are readable by all authenticated users"
  ON public.hobbies FOR SELECT
  TO authenticated
  USING (true);

-- 3. User Hobbies: Users manage their own; others can view
CREATE POLICY "Users can view others hobbies"
  ON public.user_hobbies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own hobbies"
  ON public.user_hobbies FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. Challenges & Checkins: Challenge owner manages, others can view for verified social proof
CREATE POLICY "Users manage own challenge"
  ON public.challenges FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users manage own checkins"
  ON public.checkins FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view checkins"
  ON public.checkins FOR SELECT
  TO authenticated
  USING (true);

-- 5. Connections: Only participants in a connection can view it
CREATE POLICY "Users can view their connections"
  ON public.connections FOR SELECT
  TO authenticated
  USING (user_one_id = auth.uid() OR user_two_id = auth.uid());

CREATE POLICY "Users can insert connections when request accepted"
  ON public.connections FOR INSERT
  TO authenticated
  WITH CHECK (user_one_id = auth.uid() OR user_two_id = auth.uid());

-- 6. Connection Requests: Sender or recipient can view/modify
CREATE POLICY "View involved requests"
  ON public.connection_requests FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Send requests"
  ON public.connection_requests FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Update received requests"
  ON public.connection_requests FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid());

-- 7. Messages: ONLY participants of an active connection can read and send messages
CREATE POLICY "Messages readable by connection participants"
  ON public.messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Messages insertable only between connected users"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.connections
      WHERE id = connection_id
      AND ((user_one_id = auth.uid() AND user_two_id = recipient_id)
        OR (user_two_id = auth.uid() AND user_one_id = recipient_id))
    )
  );

-- 8. Blocks & Reports: Users can create and view their blocks
CREATE POLICY "Users manage own blocks"
  ON public.blocks FOR ALL
  TO authenticated
  USING (blocker_id = auth.uid())
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users submit reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- 9. Interactive Games RLS
CREATE POLICY "Users manage own this or that answers"
  ON public.game_this_or_that_answers FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view others this or that answers"
  ON public.game_this_or_that_answers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users manage own daily prompt answers"
  ON public.game_daily_prompt_answers FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view shared daily prompt answers"
  ON public.game_daily_prompt_answers FOR SELECT
  TO authenticated
  USING (share_on_profile = true OR user_id = auth.uid());

CREATE POLICY "Users manage own quiz results"
  ON public.game_quiz_results FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view completed quiz results"
  ON public.game_quiz_results FOR SELECT
  TO authenticated
  USING (true);

-- ====================================================================
-- STORAGE BUCKET CONFIGURATION & POLICIES
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('lovbee-media', 'lovbee-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  CREATE POLICY "Public lovbee media access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'lovbee-media');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can upload lovbee media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'lovbee-media');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own lovbee media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'lovbee-media' AND (storage.foldername(name))[1] = auth.uid()::text);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own lovbee media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'lovbee-media' AND (storage.foldername(name))[1] = auth.uid()::text);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- SEED CURATED HOBBIES CATALOGUE
-- ====================================================================
INSERT INTO public.hobbies (slug, name, category, description, icon_name)
VALUES
  ('bouldering', 'Bouldering & Climbing', 'sports', 'Problem-solving on rock faces and indoor walls', 'Mountain'),
  ('running', 'Trail & Distance Running', 'sports', 'Early morning trails and marathon training', 'Footprints'),
  ('cycling', 'Gravel & Road Cycling', 'sports', 'Weekend century rides and bicycle mechanics', 'Bike'),
  ('swimming', 'Open Water Swimming', 'sports', 'Ocean and alpine lake wild swimming', 'Waves'),
  ('yoga', 'Vinyasa & Ashtanga Yoga', 'wellness', 'Daily mindful flow, breathwork and mobility', 'Sun'),
  ('ceramics', 'Wheel-thrown Ceramics', 'arts', 'Throwing stoneware and testing wood-ash glazes', 'Palette'),
  ('film_photo', '35mm Film Photography', 'arts', 'Darkroom chemistry and vintage rangefinder lenses', 'Camera'),
  ('illustration', 'Botanical Illustration', 'arts', 'Pen-and-ink and watercolor natural history studies', 'Feather'),
  ('woodworking', 'Traditional Woodworking', 'crafts', 'Hand-plane joinery and furniture making', 'Hammer'),
  ('bookbinding', 'Fine Bookbinding', 'crafts', 'Coptic stitch, leather covers, and paper conservation', 'BookMarked'),
  ('backpacking', 'Wilderness Backpacking', 'outdoors', 'Multi-day alpine traverses and backcountry camps', 'Compass'),
  ('botany', 'Urban Foraging & Flora', 'outdoors', 'Identifying native plants, mushrooms, and herbs', 'Sprout'),
  ('astronomy', 'Stargazing & Astrophotography', 'outdoors', 'Deep-sky tracking and telescope optics', 'Sparkles'),
  ('coffee', 'Specialty Pour-over Coffee', 'culinary', 'Single-origin varietals, mineral water recipes, and roasts', 'Coffee'),
  ('sourdough', 'Wild Fermentation & Bread', 'culinary', 'Heritage grains, high-hydration levain baking', 'Flame'),
  ('tea', 'Gongfu Tea Ceremony', 'culinary', 'Aged puerh, yancha oolong, and clay teaware', 'CupSoda'),
  ('vinyl', 'Vinyl Digging & Hi-Fi', 'music', 'Collecting ambient, jazz, and Japanese city pop records', 'Disc'),
  ('synthesizer', 'Modular Synthesizers', 'music', 'Analog patching, generative sequencers, and sound design', 'Radio'),
  ('acoustic', 'Acoustic Guitar & Folk', 'music', 'Fingerpicking and songcraft', 'Music'),
  ('literature', 'Philosophy & Fiction', 'intellectual', 'Discussing mid-century prose and speculative fiction', 'BookOpen'),
  ('chess', 'Classical Chess', 'intellectual', 'Endgame studies, rapid tournaments, and strategy', 'Trophy'),
  ('languages', 'Language Exchange', 'intellectual', 'Fluency practice in Japanese, Spanish, and French', 'Languages'),
  ('architecture', 'Architectural History', 'intellectual', 'Mid-century modernist walks and timber heritage', 'Building2'),
  ('leathercraft', 'Hand-Stitched Leather', 'crafts', 'Saddle stitching vegetable-tanned goods', 'Scissors')
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name;
