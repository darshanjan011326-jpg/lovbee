import React, { useState } from 'react';
import {
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Upload,
  AlertCircle,
  Camera,
  MapPin,
  Briefcase,
  Heart,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';
import { Profile, UserHobby } from '../types';
import { CURATED_HOBBIES } from '../services/sampleData';
import { store, calculateAge } from '../services/store';

interface ProfileEditViewProps {
  currentUser: Profile;
  onBack: () => void;
}

export const ProfileEditView: React.FC<ProfileEditViewProps> = ({ currentUser, onBack }) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [location, setLocation] = useState(currentUser.location || '');
  const [occupation, setOccupation] = useState(currentUser.occupation || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [dob, setDob] = useState(currentUser.dateOfBirth || '1997-05-15');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [hobbies, setHobbies] = useState<UserHobby[]>(currentUser.hobbies || []);

  const [gender, setGender] = useState<string>(currentUser.gender || 'Prefer not to say');
  const [genderSelfDescribe, setGenderSelfDescribe] = useState<string>(currentUser.genderSelfDescribe || '');
  const [showGenderOnProfile, setShowGenderOnProfile] = useState<boolean>(
    currentUser.showGenderOnProfile !== false
  );

  const [sexualOrientation, setSexualOrientation] = useState<string>(
    currentUser.sexualOrientation || 'Prefer not to say'
  );
  const [orientationSelfDescribe, setOrientationSelfDescribe] = useState<string>(
    currentUser.orientationSelfDescribe || ''
  );
  const [showOrientationOnProfile, setShowOrientationOnProfile] = useState<boolean>(
    currentUser.showOrientationOnProfile || false
  );

  const [interestedInGenders, setInterestedInGenders] = useState<string[]>(
    currentUser.datingPreferences?.interestedInGenders && currentUser.datingPreferences.interestedInGenders.length > 0
      ? currentUser.datingPreferences.interestedInGenders
      : ['All genders']
  );
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(
    currentUser.datingPreferences?.maxDistanceKm || 50
  );

  const [sleepSchedule, setSleepSchedule] = useState(
    currentUser.lifestyle?.sleepSchedule || 'early_bird'
  );
  const [weekendVibe, setWeekendVibe] = useState(
    currentUser.lifestyle?.weekendVibe || 'slow_mornings'
  );
  const [communicationStyle, setCommunicationStyle] = useState(
    currentUser.lifestyle?.communicationStyle || 'thoughtful_notes'
  );

  const [minAge, setMinAge] = useState(currentUser.datingPreferences?.minAge || 21);
  const [maxAge, setMaxAge] = useState(currentUser.datingPreferences?.maxAge || 38);
  const [relationshipIntent, setRelationshipIntent] = useState(
    currentUser.datingPreferences?.relationshipIntent || 'intentional_dating'
  );

  const [savedToast, setSavedToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const calculatedAge = calculateAge(dob);
  const isUnderage = calculatedAge < 18;

  const handleToggleInterestedGender = (g: string) => {
    if (g === 'All genders') {
      if (interestedInGenders.includes('All genders')) {
        setInterestedInGenders(['Men', 'Women', 'Non-binary']);
      } else {
        setInterestedInGenders(['All genders']);
      }
      return;
    }

    const withoutAll = interestedInGenders.filter((item) => item !== 'All genders');
    if (withoutAll.includes(g)) {
      const next = withoutAll.filter((item) => item !== g);
      setInterestedInGenders(next.length === 0 ? ['All genders'] : next);
    } else {
      setInterestedInGenders([...withoutAll, g]);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    store
      .uploadProfilePhoto(file)
      .then((dataUrl) => {
        setAvatarUrl(dataUrl);
        setPhotoUploading(false);
      })
      .catch((err) => {
        console.error(err);
        setPhotoUploading(false);
      });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isUnderage) {
      setErrorMsg('Under 18 years old is strictly prohibited. Date of birth is invalid.');
      return;
    }

    if (minAge > maxAge) {
      setErrorMsg('Minimum preferred age cannot be greater than maximum age.');
      return;
    }

    store.updateProfile({
      displayName,
      location,
      occupation,
      bio,
      avatarUrl,
      photos: [avatarUrl],
      dateOfBirth: dob,
      gender,
      genderSelfDescribe,
      showGenderOnProfile,
      sexualOrientation,
      orientationSelfDescribe,
      showOrientationOnProfile,
      hobbies,
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
    });

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const removeHobby = (hobbyId: string) => {
    setHobbies(hobbies.filter((h) => h.hobbyId !== hobbyId));
  };

  const addHobby = (hobby: (typeof CURATED_HOBBIES)[0]) => {
    if (hobbies.some((h) => h.hobbyId === hobby.id)) return;
    setHobbies([
      ...hobbies,
      {
        hobbyId: hobby.id,
        name: hobby.name,
        category: hobby.category,
        skillLevel: 'passionate',
        yearsPracticed: 1,
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Toast */}
      {savedToast && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 px-4 py-3 rounded-2xl bg-[#1C1C1E] border border-emerald-500/40 text-white text-xs shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-display text-white">Edit Your Dating Profile</h1>
            <p className="text-xs text-stone-400">
              Refine your photos, bio, craft passions, and matching preferences
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white text-xs font-semibold shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-[#2B0813] border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Profile Photo & Card Preview Section */}
        <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Primary Profile Photograph
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-40 rounded-2xl overflow-hidden border border-white/10 bg-[#1C1C1E] shrink-0 shadow-md">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'}
                alt={displayName}
                className="w-full h-full object-cover"
              />
              {photoUploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] text-white">
                  Uploading...
                </div>
              )}
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <p className="text-sm font-semibold text-white">Upload New Real Photo</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Your face and natural smile are the foundation of authentic connection. Real photos only.
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-[#FB7185]" />
                <span>Select Image from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Identity & Bio */}
        <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Identity & Narrative
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Date of Birth (18+ Verified)
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Occupation / Craft</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Romantic Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
            />
          </div>
        </div>

        {/* Sexuality & Gender Identity (Inclusive & Private by Default) */}
        <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FB7185]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Sexuality & Gender Identity
                </h2>
              </div>
              <p className="text-stone-400 text-xs mt-1">
                Your orientation is strictly confidential by default. Displayed only if you explicitly choose.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-semibold">
              Private by default
            </span>
          </div>

          {/* Gender Identity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-stone-300 font-semibold text-xs">
                Your Gender Identity
              </label>
              <label className="flex items-center gap-2 text-stone-400 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showGenderOnProfile}
                  onChange={(e) => setShowGenderOnProfile(e.target.checked)}
                  className="rounded border-white/20 accent-[#E11D48] w-3.5 h-3.5"
                />
                <span>Display gender on profile card</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                'Woman',
                'Man',
                'Non-binary',
                'Agender',
                'Genderfluid',
                'Two-Spirit',
                'Self-describe',
                'Prefer not to say',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setGender(opt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    gender === opt
                      ? 'bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white shadow-xs'
                      : 'bg-[#1C1C1E] text-stone-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {gender === 'Self-describe' && (
              <input
                type="text"
                placeholder="Describe your gender identity..."
                value={genderSelfDescribe}
                onChange={(e) => setGenderSelfDescribe(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#1C1C1E] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E11D48]"
              />
            )}
          </div>

          {/* Sexual Orientation */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-stone-300 font-semibold text-xs">
                  Sexual Orientation
                </label>
                <p className="text-stone-400 text-[11px]">
                  Used for bilateral mutual matching. Never assumed or exposed without consent.
                </p>
              </div>

              <label className="flex items-center gap-2 text-stone-400 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOrientationOnProfile}
                  onChange={(e) => setShowOrientationOnProfile(e.target.checked)}
                  className="rounded border-white/20 accent-[#E11D48] w-3.5 h-3.5"
                />
                <span className={showOrientationOnProfile ? 'text-[#FB7185] font-semibold' : ''}>
                  {showOrientationOnProfile ? 'Visible on profile' : 'Keep private (hidden)'}
                </span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
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
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSexualOrientation(opt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    sexualOrientation === opt
                      ? 'bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white shadow-xs'
                      : 'bg-[#1C1C1E] text-stone-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {sexualOrientation === 'Self-describe' && (
              <input
                type="text"
                placeholder="Describe your sexual orientation..."
                value={orientationSelfDescribe}
                onChange={(e) => setOrientationSelfDescribe(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#1C1C1E] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E11D48]"
              />
            )}
          </div>
        </div>

        {/* Selected Passions & Hobbies */}
        <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Selected Passions ({hobbies.length})
            </h2>
            <span className="text-[11px] text-stone-400">Match score is calculated from these</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {hobbies.map((h) => (
              <span
                key={h.hobbyId}
                className="px-3 py-1.5 rounded-full bg-[#2B0813] border border-[#E11D48]/40 text-stone-200 text-xs flex items-center gap-2"
              >
                <span>{h.name}</span>
                <button
                  type="button"
                  onClick={() => removeHobby(h.hobbyId)}
                  className="text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className="pt-2">
            <p className="text-xs font-semibold text-stone-400 mb-2">Add more pursuits:</p>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {CURATED_HOBBIES.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => addHobby(ch)}
                  className="px-2.5 py-1 rounded-lg bg-[#1C1C1E] hover:bg-white/10 border border-white/5 text-[11px] text-stone-300 transition-colors"
                >
                  + {ch.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Who You Want to Date & Mutual Matching Criteria */}
        <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 space-y-5">
          <div className="pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#FB7185] fill-current" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Who You Want to Date (Mutual Matching Criteria)
              </h2>
            </div>
            <p className="text-stone-400 text-xs mt-1">
              Lovbee strictly recommends dates only when <strong className="text-stone-200">both people's mutual criteria</strong> (gender, age range, 18+ adult verification) are satisfied.
            </p>
          </div>

          {/* Interested in Genders Multi-select */}
          <div className="space-y-2">
            <label className="block text-stone-300 font-semibold text-xs">
              Who are you interested in meeting? <span className="text-stone-400 font-normal">(Select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {['Men', 'Women', 'Non-binary', 'All genders'].map((g) => {
                const isSelected =
                  g === 'All genders'
                    ? interestedInGenders.includes('All genders')
                    : interestedInGenders.includes(g) || interestedInGenders.includes('All genders');

                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleToggleInterestedGender(g)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white shadow-xs'
                        : 'bg-[#1C1C1E] text-stone-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age Range & Distance Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-semibold">Preferred Age Window</span>
                <span className="text-white font-mono font-bold">
                  {minAge} – {maxAge} years
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={18}
                  max={60}
                  value={minAge}
                  onChange={(e) => setMinAge(Math.min(Number(e.target.value), maxAge))}
                  className="w-full accent-[#E11D48]"
                />
                <input
                  type="range"
                  min={18}
                  max={70}
                  value={maxAge}
                  onChange={(e) => setMaxAge(Math.max(Number(e.target.value), minAge))}
                  className="w-full accent-[#E11D48]"
                />
              </div>
              <p className="text-[10px] text-stone-500">
                Matches appear only if you also fall within their stated age window.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-semibold">Max Distance</span>
                <span className="text-white font-mono font-bold">{maxDistanceKm} km</span>
              </div>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-full accent-[#E11D48]"
              />
              <p className="text-[10px] text-stone-500">
                Radius for nearby romantic discovery and local craft partners.
              </p>
            </div>
          </div>

          {/* Relationship Intent and Lifestyle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Intent</label>
              <select
                value={relationshipIntent}
                onChange={(e) => setRelationshipIntent(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
              >
                <option value="serious_relationship">Long-term love</option>
                <option value="intentional_dating">Intentional dating</option>
                <option value="activity_partner_romance">Craft partner & romance</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Sleep Rhythm</label>
              <select
                value={sleepSchedule}
                onChange={(e) => setSleepSchedule(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
              >
                <option value="early_bird">Early bird</option>
                <option value="night_owl">Night owl</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Weekend Vibe</label>
              <select
                value={weekendVibe}
                onChange={(e) => setWeekendVibe(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
              >
                <option value="slow_mornings">Slow mornings</option>
                <option value="active_outdoors">Active outdoors</option>
                <option value="creative_projects">Creative projects</option>
                <option value="social_gatherings">Social gatherings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-stone-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-xs shadow-[0_4px_25px_rgba(225,29,72,0.45)] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
