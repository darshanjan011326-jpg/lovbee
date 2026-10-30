import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Heart,
  Flame,
  ShieldCheck,
  Camera,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  User,
  Users,
} from 'lucide-react';
import { Profile, UserHobby, SexualOrientation, GenderIdentity } from '../types';
import { CURATED_HOBBIES } from '../services/sampleData';
import { store, getTodayDateString } from '../services/store';
import { LovbeeLogo } from './LovbeeLogo';

interface OnboardingFlowProps {
  user: Profile;
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete }) => {
  // 5 elegant steps
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Essentials & Photo
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [location, setLocation] = useState(user.location || '');
  const [occupation, setOccupation] = useState(user.occupation || '');
  const [bio, setBio] = useState(user.bio || '');
  const [photoDataUrl, setPhotoDataUrl] = useState(user.avatarUrl || '');
  const [photoUploading, setPhotoUploading] = useState(false);

  // Step 2: Gender Identity & Sexual Orientation (Respectful & Private)
  const [gender, setGender] = useState<string>(user.gender || 'Woman');
  const [genderSelfDescribe, setGenderSelfDescribe] = useState(user.genderSelfDescribe || '');
  const [showGenderOnProfile, setShowGenderOnProfile] = useState<boolean>(
    user.showGenderOnProfile !== false
  );

  const [sexualOrientation, setSexualOrientation] = useState<string>(
    user.sexualOrientation || 'Prefer not to say'
  );
  const [orientationSelfDescribe, setOrientationSelfDescribe] = useState(
    user.orientationSelfDescribe || ''
  );
  const [showOrientationOnProfile, setShowOrientationOnProfile] = useState<boolean>(
    Boolean(user.showOrientationOnProfile) // Private by default (false)
  );

  // Step 3: Who They Want to Date & Preferences
  const [interestedInGenders, setInterestedInGenders] = useState<string[]>(
    user.datingPreferences?.interestedInGenders?.length
      ? user.datingPreferences.interestedInGenders
      : ['All genders']
  );
  const [minAge, setMinAge] = useState<number>(user.datingPreferences?.minAge || Math.max(18, user.age - 5));
  const [maxAge, setMaxAge] = useState<number>(user.datingPreferences?.maxAge || user.age + 8);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(user.datingPreferences?.maxDistanceKm || 50);
  const [relationshipIntent, setRelationshipIntent] = useState<
    'serious_relationship' | 'intentional_dating' | 'activity_partner_romance'
  >(user.datingPreferences?.relationshipIntent || 'intentional_dating');

  const [sleepSchedule, setSleepSchedule] = useState<'early_bird' | 'night_owl' | 'flexible'>(
    user.lifestyle?.sleepSchedule || 'early_bird'
  );
  const [weekendVibe, setWeekendVibe] = useState<
    'active_outdoors' | 'slow_mornings' | 'social_gatherings' | 'creative_projects'
  >(user.lifestyle?.weekendVibe || 'slow_mornings');
  const [communicationStyle, setCommunicationStyle] = useState<
    'thoughtful_notes' | 'quick_checkins' | 'voice_notes' | 'in_person_only'
  >(user.lifestyle?.communicationStyle || 'thoughtful_notes');

  // Step 4: Hobbies & Passions
  const [selectedHobbies, setSelectedHobbies] = useState<UserHobby[]>(user.hobbies || []);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Step 5: 21-Day Consistency Ritual Anchor
  const defaultFocusHobby = selectedHobbies[0]?.name || 'Wheel-thrown Ceramics';
  const [focusHobby, setFocusHobby] = useState<string>(defaultFocusHobby);
  const [dailyGoal, setDailyGoal] = useState<string>(
    'Commit 30 minutes daily to practicing techniques and documenting my ritual.'
  );

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    store
      .uploadProfilePhoto(file)
      .then((dataUrl) => {
        setPhotoDataUrl(dataUrl);
        setPhotoUploading(false);
      })
      .catch((err) => {
        console.error(err);
        setPhotoUploading(false);
      });
  };

  const toggleGenderInterest = (val: string) => {
    if (val === 'All genders') {
      setInterestedInGenders(['All genders']);
      return;
    }
    const current = interestedInGenders.filter((g) => g !== 'All genders');
    if (current.includes(val)) {
      const next = current.filter((g) => g !== val);
      setInterestedInGenders(next.length ? next : ['All genders']);
    } else {
      setInterestedInGenders([...current, val]);
    }
  };

  const toggleHobby = (h: (typeof CURATED_HOBBIES)[0]) => {
    const exists = selectedHobbies.find((item) => item.hobbyId === h.id);
    if (exists) {
      setSelectedHobbies(selectedHobbies.filter((item) => item.hobbyId !== h.id));
    } else {
      if (selectedHobbies.length >= 6) return;
      setSelectedHobbies([
        ...selectedHobbies,
        {
          hobbyId: h.id,
          name: h.name,
          category: h.category,
          skillLevel: 'passionate',
          yearsPracticed: 1,
          isChallengeFocus: selectedHobbies.length === 0,
        },
      ]);
    }
  };

  const handleFinish = () => {
    const today = getTodayDateString();
    const effectiveGender = gender === 'Self-describe' && genderSelfDescribe.trim()
      ? genderSelfDescribe.trim()
      : gender;

    const effectiveOrientation = sexualOrientation === 'Self-describe' && orientationSelfDescribe.trim()
      ? orientationSelfDescribe.trim()
      : sexualOrientation;

    store.updateProfile({
      displayName,
      location,
      occupation,
      bio,
      avatarUrl: photoDataUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      photos: [
        photoDataUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      ],
      gender: effectiveGender,
      genderSelfDescribe,
      showGenderOnProfile,
      sexualOrientation: effectiveOrientation,
      orientationSelfDescribe,
      showOrientationOnProfile,
      profileComplete: true,
      hobbies: selectedHobbies.map((h) => ({
        ...h,
        isChallengeFocus: h.name === focusHobby,
      })),
      lifestyle: {
        sleepSchedule,
        weekendVibe,
        communicationStyle,
        activityLevel: 'daily_mover',
      },
      datingPreferences: {
        minAge,
        maxAge,
        relationshipIntent,
        interestedInGenders,
        maxDistanceKm,
      },
      challenge: {
        id: `ch_${Date.now()}`,
        userId: user.id,
        title: `21-Day ${focusHobby} Ritual`,
        focusHobbyName: focusHobby,
        dailyGoal,
        targetDays: 21,
        completedDaysCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        status: 'active',
        startDate: today,
      },
    });

    onComplete();
  };

  const categories = [
    { id: 'all', label: 'All Passions' },
    { id: 'arts', label: 'Arts & Design' },
    { id: 'sports', label: 'Sports & Movement' },
    { id: 'culinary', label: 'Culinary & Rituals' },
    { id: 'outdoors', label: 'Wilderness & Nature' },
    { id: 'music', label: 'Music & Vinyl' },
    { id: 'intellectual', label: 'Mind & Letters' },
    { id: 'crafts', label: 'Handicrafts' },
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-gradient-to-b from-[#E11D48]/20 via-[#230810]/30 to-transparent blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-xl mx-auto w-full flex items-center justify-between pb-4 border-b border-[#BE123C]/20">
        <LovbeeLogo size="sm" showWordmark={true} />
        <span className="text-xs text-stone-400 font-medium">
          Step <strong className="text-white font-mono">{step}</strong> of 5
        </span>
      </header>

      {/* Step Indicators Bar */}
      <div className="relative z-10 max-w-xl mx-auto w-full my-3 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              s <= step ? 'bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#FDA4AF]' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Main Step Container */}
      <main className="relative z-10 max-w-xl mx-auto w-full my-4 flex-1">
        <div className="bg-[#150D11]/92 border border-[#BE123C]/25 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
          {/* STEP 1: Basic Identity & Photo */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#FB7185]">
                  <Sparkles className="w-3.5 h-3.5 text-[#FB7185]" />
                  <span>Dating Profile Setup</span>
                </div>
                <h2 className="text-2xl font-bold font-display text-white">Your Authentic Self</h2>
                <p className="text-xs text-stone-400">
                  Upload an authentic photo and introduce who you are to intentional singles.
                </p>
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-300">
                  Profile Photo (Real photographs only)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-28 rounded-2xl overflow-hidden border-2 border-white/10 bg-[#1C1C1E] shrink-0 shadow-md flex items-center justify-center">
                    {photoDataUrl ? (
                      <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-stone-500" />
                    )}
                    {photoUploading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] text-white">
                        Uploading...
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-[#FB7185]" />
                      <span>{photoDataUrl ? 'Replace Photo' : 'Upload From Device'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-stone-400">
                      Clear natural lighting recommended. No AI-generated faces.
                    </p>
                  </div>
                </div>
              </div>

              {/* Name & Occupation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#1C1C1E] border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Occupation / Discipline
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Landscape Architect & Runner"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#1C1C1E] border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  City / Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Portland, OR"
                    className="w-full px-3.5 py-2.5 pl-9 text-xs bg-[#1C1C1E] border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
                  />
                  <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Romantic Bio */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Short Romantic Bio
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What captures your curiosity? What kind of connection are you longing for?"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#1C1C1E] border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!displayName.trim()}
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white text-xs font-semibold flex items-center gap-2 hover:brightness-110 active:scale-98 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  <span>Next: Sexuality & Identity</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Gender Identity & Sexual Orientation (Private & Inclusive) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-xs font-semibold text-[#FB7185]">
                  <Lock className="w-3.5 h-3.5 text-[#F5D061]" />
                  <span>Private, Respectful & Inclusive</span>
                </div>
                <h2 className="text-2xl font-bold font-display text-white">
                  Sexuality & Gender Identity
                </h2>
                <p className="text-xs text-stone-400 leading-relaxed">
                  We never assume someone's orientation or gender based on their name or photos. Your orientation is private by default and used strictly for mutual matching.
                </p>
              </div>

              {/* Gender Identity Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-200">
                    Your Gender Identity
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-stone-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGenderOnProfile}
                      onChange={(e) => setShowGenderOnProfile(e.target.checked)}
                      className="rounded accent-[#E11D48]"
                    />
                    <span>Show on dating card</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    'Woman',
                    'Man',
                    'Non-binary',
                    'Agender',
                    'Genderfluid',
                    'Two-Spirit',
                    'Self-describe',
                    'Prefer not to say',
                  ].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        gender === g
                          ? 'bg-[#2B0813] border-[#E11D48] text-white font-semibold shadow-xs'
                          : 'bg-[#1C1C1E] border-white/5 text-stone-300 hover:border-white/20'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                {gender === 'Self-describe' && (
                  <input
                    type="text"
                    value={genderSelfDescribe}
                    onChange={(e) => setGenderSelfDescribe(e.target.value)}
                    placeholder="Enter how you describe your gender..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#1C1C1E] border border-[#E11D48]/40 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
                  />
                )}
              </div>

              {/* Sexual Orientation Selector */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-200">
                    Your Sexual Orientation
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Private by default</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    'Straight',
                    'Gay',
                    'Lesbian',
                    'Bisexual',
                    'Pansexual',
                    'Asexual',
                    'Queer',
                    'Self-describe',
                    'Prefer not to say',
                  ].map((so) => (
                    <button
                      key={so}
                      type="button"
                      onClick={() => setSexualOrientation(so)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        sexualOrientation === so
                          ? 'bg-[#2B0813] border-[#E11D48] text-white font-semibold shadow-xs'
                          : 'bg-[#1C1C1E] border-white/5 text-stone-300 hover:border-white/20'
                      }`}
                    >
                      {so}
                    </button>
                  ))}
                </div>

                {sexualOrientation === 'Self-describe' && (
                  <input
                    type="text"
                    value={orientationSelfDescribe}
                    onChange={(e) => setOrientationSelfDescribe(e.target.value)}
                    placeholder="Enter your sexual orientation..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#1C1C1E] border border-[#E11D48]/40 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
                  />
                )}

                {/* Privacy Consent Toggle */}
                <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOrientationOnProfile}
                      onChange={(e) => setShowOrientationOnProfile(e.target.checked)}
                      className="mt-0.5 rounded accent-[#E11D48]"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-white">
                        Display my sexual orientation on my public dating card
                      </span>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        If unchecked, your orientation remains 100% confidential and is only used to compute mutual match compatibility.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white text-xs font-semibold flex items-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-xs"
                >
                  <span>Next: Who You Want to Date</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Dating Preferences & Mutual Intentions */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#FB7185]">
                  <Heart className="w-3.5 h-3.5 fill-[#E11D48] text-[#E11D48]" />
                  <span>Mutual Compatibility</span>
                </div>
                <h2 className="text-2xl font-bold font-display text-white">Who Do You Want to Date?</h2>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Matches only appear when both of your dating preferences and age ranges are mutually satisfied.
                </p>
              </div>

              {/* Who you want to date (Multiselect) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-300">
                  I want to date (Select all that apply):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['Men', 'Women', 'Non-binary', 'All genders'].map((opt) => {
                    const isSelected = interestedInGenders.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleGenderInterest(opt)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#2B0813] border-[#E11D48] text-white font-semibold shadow-xs'
                            : 'bg-[#1C1C1E] border-white/5 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Age Range Slider */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="block text-xs font-semibold text-stone-300">
                  Preferred Dating Age: <strong className="text-white font-mono">{minAge} – {maxAge} yrs</strong>
                </label>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-stone-400">Min Age (18+)</span>
                    <input
                      type="range"
                      min={18}
                      max={55}
                      value={minAge}
                      onChange={(e) => setMinAge(Number(e.target.value))}
                      className="w-full accent-[#E11D48]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400">Max Age</span>
                    <input
                      type="range"
                      min={minAge}
                      max={70}
                      value={maxAge}
                      onChange={(e) => setMaxAge(Number(e.target.value))}
                      className="w-full accent-[#E11D48]"
                    />
                  </div>
                </div>
              </div>

              {/* Max Distance */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-300">Preferred Distance</span>
                  <span className="font-mono text-white font-semibold">Within {maxDistanceKm} km</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={maxDistanceKm}
                  onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                  className="w-full accent-[#E11D48]"
                />
              </div>

              {/* Relationship Intent */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="block text-xs font-semibold text-stone-300">
                  Relationship Intention
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'serious_relationship', label: 'Long-term Love', desc: 'Seeking life partner' },
                    { id: 'intentional_dating', label: 'Intentional Dating', desc: 'Dating with purpose' },
                    { id: 'activity_partner_romance', label: 'Shared Craft & Romance', desc: 'Bonding through passion' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRelationshipIntent(item.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        relationshipIntent === item.id
                          ? 'bg-[#2B0813] border-[#E11D48] text-white'
                          : 'bg-[#1C1C1E] border-white/5 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <p className="text-xs font-semibold">{item.label}</p>
                      <p className="text-[10px] text-stone-400">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white text-xs font-semibold flex items-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-xs"
                >
                  <span>Next: Passions & Crafts</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Hobbies & Passions */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#FB7185]">
                  <Sparkles className="w-3.5 h-3.5 text-[#F5D061]" />
                  <span>Shared Crafts</span>
                </div>
                <h2 className="text-2xl font-bold font-display text-white">Your Passions & Pursuits</h2>
                <p className="text-xs text-stone-400">
                  Select 2 to 6 crafts that anchor your life. Lovbee uses shared pursuits to spark conversation.
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                      activeCategoryFilter === cat.id
                        ? 'bg-[#E11D48] text-white font-semibold'
                        : 'bg-[#1C1C1E] text-stone-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {CURATED_HOBBIES.filter((h) =>
                  activeCategoryFilter === 'all' ? true : h.category === activeCategoryFilter
                ).map((h) => {
                  const isSelected = selectedHobbies.some((item) => item.hobbyId === h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => toggleHobby(h)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#2B0813] border-[#E11D48] text-white shadow-xs'
                          : 'bg-[#1C1C1E] border-white/5 hover:border-white/15 text-stone-300'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold">{h.name}</p>
                        <p className="text-[10px] text-stone-400 line-clamp-1">{h.description}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-[#E11D48] border-[#E11D48] text-white'
                            : 'border-white/20 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-stone-400">
                Selected: <strong className="text-white font-mono">{selectedHobbies.length}</strong> / 6 pursuits
              </div>

              {/* Navigation */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={selectedHobbies.length < 1}
                  onClick={() => setStep(5)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white text-xs font-semibold flex items-center gap-2 hover:brightness-110 active:scale-98 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  <span>Next: 21-Day Ritual</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: 21-Day Consistency Ritual Anchor */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-xs font-semibold text-[#FB7185]">
                  <Flame className="w-3.5 h-3.5 text-[#F5D061]" />
                  <span>The 21-Day Consistency Ritual</span>
                </div>
                <h2 className="text-2xl font-bold font-display text-white">Your Focus Ritual</h2>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Pick one craft to dedicate 30 minutes daily. Consistency proves emotional availability before meeting.
                </p>
              </div>

              {/* Focus Hobby Choice */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Focus Craft for 21 Days
                </label>
                <select
                  value={focusHobby}
                  onChange={(e) => setFocusHobby(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
                >
                  {selectedHobbies.map((h) => (
                    <option key={h.hobbyId} value={h.name}>
                      {h.name}
                    </option>
                  ))}
                  {selectedHobbies.length === 0 && (
                    <option value="Wheel-thrown Ceramics">Wheel-thrown Ceramics</option>
                  )}
                </select>
              </div>

              {/* Daily Intention */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Daily 30-Minute Intention
                </label>
                <input
                  type="text"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(e.target.value)}
                  placeholder="e.g. Throw 1 piece at the wheel or sketch one new specimen"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#1C1C1E] border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              {/* Authenticity Pledge Note */}
              <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-1 text-xs text-stone-300">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>The Lovbee Authenticity Pledge</span>
                </p>
                <p className="text-stone-400 leading-relaxed text-[11px]">
                  I commit to genuine daily check-ins, respect for all orientations and identities, and honest engagement with fellow adults. Maintain your daily streak with a single tap—no photo or video proof is ever required.
                </p>
              </div>

              {/* Complete Setup Action */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] active:scale-98 transition-all cursor-pointer shadow-[0_4px_25px_rgba(225,29,72,0.45)]"
                >
                  <Sparkles className="w-4 h-4 text-[#FDA4AF]" />
                  <span>Enter Lovbee Community</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-2 text-xs text-stone-500">
        18+ Adults Only · Inclusive, Private & Respectful Dating Community
      </footer>
    </div>
  );
};
