import {
  ThisOrThatQuestion,
  DailyPromptQuestion,
  QuizSet,
} from '../types';

/**
 * Normalization helper: strips punctuation, collapses whitespace, converts to lowercase.
 */
export function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a This or That pair so reversed choices (A vs B and B vs A)
 * resolve to the exact same normalized key, preventing duplicates.
 */
export function normalizeThisOrThatKey(labelA: string, labelB: string): string {
  const cleanA = normalizeText(labelA);
  const cleanB = normalizeText(labelB);
  return [cleanA, cleanB].sort().join(':::');
}

/**
 * Normalizes a prompt string to detect duplicate or near-duplicate prompts.
 */
export function normalizePrompt(prompt: string): string {
  return normalizeText(prompt);
}

// ============================================================================
// 1. THIS OR THAT CONTENT BANK (30+ Creative, Relatable & Imaginative Pairs)
// ============================================================================

export const THIS_OR_THAT_BANK: ThisOrThatQuestion[] = [
  // --- Prompt Requested Examples ---
  {
    id: 'tot_relive_or_future',
    normalizedKey: normalizeThisOrThatKey('Relive one perfect day from your past', 'See one day from your future'),
    category: 'Time & Destiny',
    situationContext: 'If you were handed a one-time pocket chronometer...',
    optionA: {
      id: 'past_day',
      label: 'Relive one perfect day from your past',
      sublabel: 'Feel every golden sensation all over again',
      iconName: 'RotateCcw',
    },
    optionB: {
      id: 'future_day',
      label: 'See one day from your future',
      sublabel: 'Get a single glimpse of where your story leads',
      iconName: 'Compass',
    },
    reactionA: 'The sweet pull of nostalgia! Some memories truly deserve an encore.',
    reactionB: 'A bold heart looking forward! Just don’t let spoilers ruin the wonder.',
    communityPercentA: 52,
  },
  {
    id: 'tot_phone_thought_or_erase',
    normalizedKey: normalizeThisOrThatKey('Reveal one honest thought from someone', 'Erase one embarrassing memory from everyone’s mind'),
    category: 'Superpowers & Secrets',
    situationContext: 'Your phone vibrates with an impossible notification...',
    optionA: {
      id: 'honest_thought',
      label: 'Reveal one honest thought from someone',
      sublabel: 'Know what they truly feel, unfiltered',
      iconName: 'Eye',
    },
    optionB: {
      id: 'erase_embarrassment',
      label: 'Erase one embarrassing memory from everyone’s mind',
      sublabel: 'Wipe away that awkward moment forever',
      iconName: 'Sparkles',
    },
    reactionA: 'Curiosity wins! Unfiltered truth is the rarest currency.',
    reactionB: 'Peace of mind! We have all had moments we wish the universe forgot.',
    communityPercentA: 59,
  },
  {
    id: 'tot_plane_ticket_choice',
    normalizedKey: normalizeThisOrThatKey('Pack your bag and fly out tomorrow morning', 'Hand the ticket over as a surprise to your best friend'),
    category: 'Spontaneity & Friendship',
    situationContext: 'An airline envelope lands in your lap with an open boarding pass...',
    optionA: {
      id: 'leave_tomorrow',
      label: 'Pack your bag and fly out tomorrow morning',
      sublabel: 'Say yes to a whirlwind solo escape',
      iconName: 'Send',
    },
    optionB: {
      id: 'gift_friend',
      label: 'Hand the ticket over as a surprise to your best friend',
      sublabel: 'Give them the dream getaway they desperately need',
      iconName: 'Gift',
    },
    reactionA: 'Pure spontaneity! The world belongs to those who pack in ten minutes.',
    reactionB: 'A generous soul. Watching someone you love light up is its own journey.',
    communityPercentA: 47,
  },
  {
    id: 'tot_learn_skill_or_fearless',
    normalizedKey: normalizeThisOrThatKey('Instantly master any craft or language', 'Become completely fearless for 24 hours'),
    category: 'Personal Evolution',
    situationContext: 'A genie offers you a single sip of an ancient elixir...',
    optionA: {
      id: 'master_skill',
      label: 'Instantly master any craft or language',
      sublabel: 'Piano mastery, fluent Japanese, or flawless pottery',
      iconName: 'BookOpen',
    },
    optionB: {
      id: 'fearless_day',
      label: 'Become completely fearless for 24 hours',
      sublabel: 'Zero self-doubt, total courage to do what scares you',
      iconName: 'Flame',
    },
    reactionA: 'The joy of lifelong craft! Instant mastery opens an endless horizon.',
    reactionB: 'Imagine what you could confess or conquer with zero fear holding you back.',
    communityPercentA: 64,
  },
  {
    id: 'tot_remember_little_or_surprise',
    normalizedKey: normalizeThisOrThatKey('Remember every little detail and habit about you', 'Surprise you with things you never saw coming'),
    category: 'Romantic Wavelength',
    situationContext: 'When it comes to how someone shows you they care...',
    optionA: {
      id: 'remember_details',
      label: 'Remember every little detail and habit about you',
      sublabel: 'How you take your tea, your quiet tells, your old stories',
      iconName: 'Heart',
    },
    optionB: {
      id: 'delightful_surprises',
      label: 'Surprise you with things you never saw coming',
      sublabel: 'Spontaneous detours and gifts you didn’t know you wanted',
      iconName: 'Gift',
    },
    reactionA: 'Being deeply seen and remembered is the most tender form of love.',
    reactionB: 'The thrill of butterflies! Life is sweeter with unexpected magic.',
    communityPercentA: 68,
  },
  {
    id: 'tot_future_letters_box',
    normalizedKey: normalizeThisOrThatKey('Open the letters right now with tea', 'Seal the box and save it for a momentous day'),
    category: 'Patience & Wonder',
    situationContext: 'You discover a wooden box labeled “Letters from your future self”...',
    optionA: {
      id: 'open_now',
      label: 'Open the letters right now with tea',
      sublabel: 'Read what wisdom and secrets await you today',
      iconName: 'MailOpen',
    },
    optionB: {
      id: 'save_special',
      label: 'Seal the box and save it for a momentous day',
      sublabel: 'Let life unfold naturally until the time feels right',
      iconName: 'Lock',
    },
    reactionA: 'Too exciting to wait! Life is happening now, why stay in the dark?',
    reactionB: 'Incredible discipline! The anticipation will make reading them unforgettable.',
    communityPercentA: 43,
  },
  {
    id: 'tot_pause_hour_or_rewind_five',
    normalizedKey: normalizeThisOrThatKey('Pause time for one peaceful hour every day', 'Rewind the last five minutes once a day'),
    category: 'Superpowers & Secrets',
    situationContext: 'Which temporal power would you build into your wristwatch?',
    optionA: {
      id: 'pause_hour',
      label: 'Pause time for one peaceful hour every day',
      sublabel: 'Complete silence to rest, walk, or breathe without deadlines',
      iconName: 'Clock',
    },
    optionB: {
      id: 'rewind_five',
      label: 'Rewind the last five minutes once a day',
      sublabel: 'Undo a clumsy spill, a wrong word, or a missed train',
      iconName: 'RotateCcw',
    },
    reactionA: 'One uninterrupted hour of stillness every day sounds like paradise.',
    reactionB: 'The ultimate safety net! Saying the wrong thing is officially a thing of the past.',
    communityPercentA: 55,
  },
  {
    id: 'tot_favorite_things_or_secret_date',
    normalizedKey: normalizeThisOrThatKey('A date planned strictly around your known favorite things', 'A completely mystery date planned by someone who knows you well'),
    category: 'Romantic Wavelength',
    situationContext: 'Your partner looks at you on Friday evening and says “I planned Saturday”...',
    optionA: {
      id: 'favorite_things',
      label: 'A date planned strictly around your known favorite things',
      sublabel: 'Your dream dessert, your preferred spot, your comfort tempo',
      iconName: 'Heart',
    },
    optionB: {
      id: 'mystery_date',
      label: 'A completely mystery date planned by someone who knows you well',
      sublabel: 'You get a dress code and a departure time, nothing else',
      iconName: 'Sparkles',
    },
    reactionA: 'Comfort and intention! Nothing beats being treated to your exact favorites.',
    reactionB: 'The romance of trust! Letting someone guide you into the unknown is electric.',
    communityPercentA: 41,
  },
  {
    id: 'tot_mind_music_or_mood_colors',
    normalizedKey: normalizeThisOrThatKey('Hear the melody or song playing in someone’s mind', 'See a soft color halo matching their true mood'),
    category: 'Empathy & Senses',
    situationContext: 'If you could perceive one hidden layer of human emotion...',
    optionA: {
      id: 'mind_music',
      label: 'Hear the melody or song playing in someone’s mind',
      sublabel: 'The rhythm, tempo, and song scoring their thoughts',
      iconName: 'Music',
    },
    optionB: {
      id: 'mood_color',
      label: 'See a soft color halo matching their true mood',
      sublabel: 'Warm amber for calm, soft rose for affection, deep blue for contemplation',
      iconName: 'Palette',
    },
    reactionA: 'A walking soundtrack of humanity! You’d always know when someone was grooving.',
    reactionB: 'An emotional painter. Empathy would become a visual masterpiece.',
    communityPercentA: 46,
  },
  {
    id: 'tot_ask_future_or_tell_past',
    normalizedKey: normalizeThisOrThatKey('Ask your future self one pressing question', 'Send your past self one 20-word letter'),
    category: 'Time & Destiny',
    situationContext: 'A cosmic mailbox appears at midnight with one token...',
    optionA: {
      id: 'ask_future',
      label: 'Ask your future self one pressing question',
      sublabel: 'Find out if a dream comes true or what was worth the stress',
      iconName: 'Compass',
    },
    optionB: {
      id: 'tell_past',
      label: 'Send your past self one 20-word letter',
      sublabel: 'Reassure younger you during a difficult crossroad',
      iconName: 'Mail',
    },
    reactionA: 'Looking forward with courage! Knowing what matters most ahead gives clarity.',
    reactionB: 'Tender healing. Reassuring your younger self that things turn out alright.',
    communityPercentA: 51,
  },

  // --- Relatable Habits, Humor & Unexpected Scenarios ---
  {
    id: 'tot_no_wifi_cabin_or_foreign_city',
    normalizedKey: normalizeThisOrThatKey('A timber cabin with zero Wi-Fi and stack of books for a week', 'A vibrant boutique hotel where you don’t speak the language'),
    category: 'Spontaneity & Travel',
    situationContext: 'For your next long weekend reset...',
    optionA: {
      id: 'unplugged_cabin',
      label: 'A timber cabin with zero Wi-Fi and stack of books for a week',
      sublabel: 'Woodstove, mountain air, and absolute stillness',
      iconName: 'Home',
    },
    optionB: {
      id: 'foreign_metropolis',
      label: 'A vibrant boutique hotel where you don’t speak the language',
      sublabel: 'Neon alleyways, night markets, and hand gestures',
      iconName: 'MapPin',
    },
    reactionA: 'The ultimate nervous system cleanse! Digital detoxes are pure luxury.',
    reactionB: 'Thriving in translation! Getting happily lost in a foreign city wakes you up.',
    communityPercentA: 53,
  },
  {
    id: 'tot_perfect_comeback_or_no_awkward',
    normalizedKey: normalizeThisOrThatKey('Always having the witty comeback in the exact moment', 'Never experiencing an awkward silence ever again'),
    category: 'Humor & Social Style',
    situationContext: 'If an angel of conversation granted you one social gift...',
    optionA: {
      id: 'sharp_comeback',
      label: 'Always having the witty comeback in the exact moment',
      sublabel: 'No more thinking of the perfect line three hours later in the shower',
      iconName: 'Zap',
    },
    optionB: {
      id: 'no_awkward_silence',
      label: 'Never experiencing an awkward silence ever again',
      sublabel: 'Every pause feels comfortable, warm, and intentional',
      iconName: 'Smile',
    },
    reactionA: 'Razor-sharp wit! Shower arguments will finally have zero regrets.',
    reactionB: 'Golden comfort! When silence feels peaceful, true intimacy begins.',
    communityPercentA: 49,
  },
  {
    id: 'tot_cook_elaborate_or_clean_up',
    normalizedKey: normalizeThisOrThatKey('A partner who loves cooking elaborate 3-course dinners for you', 'A partner who always does the dishes and cleans the kitchen while you cook'),
    category: 'Everyday Magic',
    situationContext: 'In the domestic dream team championship...',
    optionA: {
      id: 'cook_for_you',
      label: 'A partner who loves cooking elaborate 3-course dinners for you',
      sublabel: 'Candles, homemade pasta, and secret sauces on weeknights',
      iconName: 'Utensils',
    },
    optionB: {
      id: 'cleans_dishes',
      label: 'A partner who always does the dishes and cleans the kitchen while you cook',
      sublabel: 'You cook freely with every pan, and wake up to a spotless kitchen',
      iconName: 'Sparkles',
    },
    reactionA: 'The food lover’s paradise! Coming home to delicious aromas is hard to beat.',
    reactionB: 'The unsung hero of true love. Clean counters are the highest love language.',
    communityPercentA: 56,
  },
  {
    id: 'tot_hidden_antique_or_wild_hotspring',
    normalizedKey: normalizeThisOrThatKey('Discovering a secret room in an eccentric antique shop', 'Stumbling across a natural unmapped hot spring in the pine woods'),
    category: 'Curiosity & Mystery',
    situationContext: 'On a slow Sunday wander through the countryside...',
    optionA: {
      id: 'antique_secret_room',
      label: 'Discovering a secret room in an eccentric antique shop',
      sublabel: 'Filled with vintage lenses, old globes, and handwritten letters',
      iconName: 'Search',
    },
    optionB: {
      id: 'wild_hot_spring',
      label: 'Stumbling across a natural unmapped hot spring in the pine woods',
      sublabel: 'Steaming mineral water surrounded by mossy cedar trees',
      iconName: 'Waves',
    },
    reactionA: 'A treasure hunter at heart! There is magic locked inside forgotten objects.',
    reactionB: 'Pure wild sanctuary! Warm mineral water under pine boughs is medicine.',
    communityPercentA: 45,
  },
  {
    id: 'tot_sunrise_sea_or_3am_porch',
    normalizedKey: normalizeThisOrThatKey('Waking up at dawn to watch sunrise break over the ocean', 'Sitting on a dim porch talking softly until 3:30 AM'),
    category: 'Romantic Wavelength',
    situationContext: 'Your soul’s preferred romantic time capsule...',
    optionA: {
      id: 'dawn_ocean',
      label: 'Waking up at dawn to watch sunrise break over the ocean',
      sublabel: 'Chilly sea breeze, warm thermos, and pink skies',
      iconName: 'Sun',
    },
    optionB: {
      id: 'porch_3am',
      label: 'Sitting on a dim porch talking softly until 3:30 AM',
      sublabel: 'Heavy blankets, crickets, and thoughts you never tell anyone else',
      iconName: 'Moon',
    },
    reactionA: 'Early light optimist! Morning clarity with sea salt in the air clears the mind.',
    reactionB: 'Midnight philosopher. The best confessions only happen after 2 AM.',
    communityPercentA: 42,
  },
  {
    id: 'tot_talking_dog_or_empathic_cat',
    normalizedKey: normalizeThisOrThatKey('A dog that can speak fluent English for 10 minutes a day', 'A cat that completely understands everything you say and nods back'),
    category: 'Humor & Relatability',
    situationContext: 'Your pet suddenly exhibits miraculous comprehension...',
    optionA: {
      id: 'talking_dog',
      label: 'A dog that can speak fluent English for 10 minutes a day',
      sublabel: '“Why did you leave for eight hours? Who is a good boy? I love you.”',
      iconName: 'MessageSquare',
    },
    optionB: {
      id: 'empathic_cat',
      label: 'A cat that completely understands everything you say and nods back',
      sublabel: 'The ultimate secret-keeper who blinks slowly with total comprehension',
      iconName: 'Smile',
    },
    reactionA: 'Ten minutes of pure hype and unconditional devotion! Best debrief of the day.',
    reactionB: 'A quiet confidante who never judges and holds every secret with feline grace.',
    communityPercentA: 58,
  },
  {
    id: 'tot_curated_playlist_or_mystery_postcard',
    normalizedKey: normalizeThisOrThatKey('A 20-song playlist made specially for you by someone you like', 'A handwritten postcard sent to you with no return address from an unfamiliar city'),
    category: 'Romantic Wavelength',
    situationContext: 'Which romantic gesture would make your heart flutter more?',
    optionA: {
      id: 'personal_playlist',
      label: 'A 20-song playlist made specially for you by someone you like',
      sublabel: 'Every lyric feels like a coded love note in headphone audio',
      iconName: 'Music',
    },
    optionB: {
      id: 'mystery_postcard',
      label: 'A handwritten postcard sent to you with no return address from an unfamiliar city',
      sublabel: 'A stamp from Lisbon, ink-smudged thoughts, and poetic intrigue',
      iconName: 'Mail',
    },
    reactionA: 'Music is the direct highway to the soul. A thoughtful playlist is modern poetry.',
    reactionB: 'A lover of old-world mystery! Physical ink and stamps carry undeniable charm.',
    communityPercentA: 65,
  },
  {
    id: 'tot_hidden_room_or_century_diary',
    normalizedKey: normalizeThisOrThatKey('Finding a hidden room in your home behind a bookcase', 'Finding an intact diary from 1924 hidden under the floorboards'),
    category: 'Curiosity & Mystery',
    situationContext: 'During an ordinary afternoon at home...',
    optionA: {
      id: 'hidden_room',
      label: 'Finding a hidden room in your home behind a bookcase',
      sublabel: 'A cozy secret sanctuary that nobody else on earth knows about',
      iconName: 'Home',
    },
    optionB: {
      id: 'century_diary',
      label: 'Finding an intact diary from 1924 hidden under the floorboards',
      sublabel: 'Spill-stained calligraphy chronicling a forgotten love affair',
      iconName: 'Book',
    },
    reactionA: 'Your very own private sanctuary! Every adult secretly wants a hidden door.',
    reactionB: 'A keeper of forgotten stories. Unlocking the past is an emotional thrill.',
    communityPercentA: 61,
  },
  {
    id: 'tot_teleport_monthly_or_walk_fly',
    normalizedKey: normalizeThisOrThatKey('Teleport to any place on Earth once every month', 'Fly at walking speed whenever you feel like it'),
    category: 'Superpowers & Secrets',
    situationContext: 'Pick your whimsical mode of transit...',
    optionA: {
      id: 'monthly_teleport',
      label: 'Teleport to any place on Earth once every month',
      sublabel: 'Instant Tokyo ramen or Icelandic aurora, then back home',
      iconName: 'Compass',
    },
    optionB: {
      id: 'walk_fly',
      label: 'Fly at walking speed whenever you feel like it',
      sublabel: 'Hovering over traffic, floating up to tree branches, zero effort',
      iconName: 'Wind',
    },
    reactionA: 'The ultimate globetrotter! Weekend getaways without airport security.',
    reactionB: 'Pure daydream energy. Floating three feet above sidewalk puddles sounds sublime.',
    communityPercentA: 53,
  },
  {
    id: 'tot_spontaneous_roadtrip_or_curated_gems',
    normalizedKey: normalizeThisOrThatKey('A spontaneous road trip with zero destination in mind', 'A carefully curated weekend itinerary with reservations at hidden gems'),
    category: 'Spontaneity & Travel',
    situationContext: 'You’re handing over the car keys for Saturday morning...',
    optionA: {
      id: 'zero_plan_drive',
      label: 'A spontaneous road trip with zero destination in mind',
      sublabel: 'Flip a coin at every fork in the road and sleep wherever you end up',
      iconName: 'Compass',
    },
    optionB: {
      id: 'curated_gems',
      label: 'A carefully curated weekend itinerary with reservations at hidden gems',
      sublabel: 'The best bakery table secured, historic walks, seamless ease',
      iconName: 'CheckCircle2',
    },
    reactionA: 'A true nomad! Some of the finest stories start with no map at all.',
    reactionB: 'Flawless execution! Good food and no waiting in lines is true elegance.',
    communityPercentA: 48,
  },
  {
    id: 'tot_boundless_morning_or_midnight_muse',
    normalizedKey: normalizeThisOrThatKey('Boundless radiant energy from 6 AM to noon every single day', 'Endless creative flow and deep inspiration between midnight and 4 AM'),
    category: 'Everyday Magic',
    situationContext: 'If your circadian clock could lock in one superpower window...',
    optionA: {
      id: 'radiant_morning',
      label: 'Boundless radiant energy from 6 AM to noon every single day',
      sublabel: 'Wake up effortlessly, run trails, finish work before lunch',
      iconName: 'Sun',
    },
    optionB: {
      id: 'midnight_flow',
      label: 'Endless creative flow and deep inspiration between midnight and 4 AM',
      sublabel: 'The world is asleep, headphones on, making your greatest work',
      iconName: 'Moon',
    },
    reactionA: 'The master of mornings! Conquering the day while the world is still stretching.',
    reactionB: 'The nocturnal creator. The quietest hours often hold the deepest genius.',
    communityPercentA: 57,
  },
  {
    id: 'tot_whisper_courage_or_laugh_forget',
    normalizedKey: normalizeThisOrThatKey('Someone who whispers an encouraging truth when you are nervous', 'Someone who makes you laugh so hard you forget you were even worried'),
    category: 'Romantic Wavelength',
    situationContext: 'When you are facing an anxious moment before something big...',
    optionA: {
      id: 'whisper_courage',
      label: 'Someone who whispers an encouraging truth when you are nervous',
      sublabel: 'Gentle eye contact, warm hand squeeze, and calm belief in you',
      iconName: 'Heart',
    },
    optionB: {
      id: 'laugh_forget',
      label: 'Someone who makes you laugh so hard you forget you were even worried',
      sublabel: 'A ridiculous joke or silly face that breaks the tension instantly',
      iconName: 'Smile',
    },
    reactionA: 'Grounded tenderness. Having someone anchor your courage is pure comfort.',
    reactionB: 'Laughter is medicine! Melting away anxiety with joyful giggles is priceless.',
    communityPercentA: 52,
  },
  {
    id: 'tot_found_cash_or_forgotten_note',
    normalizedKey: normalizeThisOrThatKey('Finding 100 dollars in cash inside a forgotten winter coat pocket', 'Finding an old sweet note written by someone you still care about'),
    category: 'Everyday Magic',
    situationContext: 'Reaching your hand into the pocket of an old jacket...',
    optionA: {
      id: 'found_hundred',
      label: 'Finding 100 dollars in cash inside a forgotten winter coat pocket',
      sublabel: 'Instant free feast or impulse shopping treat on the spot',
      iconName: 'Sparkles',
    },
    optionB: {
      id: 'forgotten_note',
      label: 'Finding an old sweet note written by someone you still care about',
      sublabel: 'Folded paper with ink handwriting that brings an instant smile',
      iconName: 'Heart',
    },
    reactionA: 'Free fun money! Past you just bought present you dinner and drinks.',
    reactionB: 'A hopeless romantic. Sentimental artifacts beat currency every single time.',
    communityPercentA: 44,
  },
  {
    id: 'tot_stars_desert_or_rain_glasshouse',
    normalizedKey: normalizeThisOrThatKey('Sleeping under millions of desert stars in an open bed', 'Sleeping in a warm glasshouse attic while heavy autumn rain pours above you'),
    category: 'Curiosity & Mystery',
    situationContext: 'Your dream bedtime sanctuary for the night...',
    optionA: {
      id: 'desert_stars',
      label: 'Sleeping under millions of desert stars in an open bed',
      sublabel: 'Dry midnight breeze, shooting stars, and cosmic awe',
      iconName: 'Moon',
    },
    optionB: {
      id: 'rain_glasshouse',
      label: 'Sleeping in a warm glasshouse attic while heavy autumn rain pours above you',
      sublabel: 'Thick duvet, rhythmic raindrops tapping the glass, and steaming tea',
      iconName: 'CloudRain',
    },
    reactionA: 'Expansive cosmic soul! Gazing into the infinite universe puts everything in perspective.',
    reactionB: 'The ultimate cozy haven. That rain sound on glass is better than any lullaby.',
    communityPercentA: 39,
  },
];

// ============================================================================
// 2. DAILY QUESTIONS CONTENT BANK (35+ Thoughtful, Non-Interview Prompts)
// ============================================================================

export const DAILY_PROMPTS_BANK: DailyPromptQuestion[] = [
  // --- Prompt Requested Examples ---
  {
    id: 'dp_bad_to_good',
    normalizedPrompt: normalizePrompt('What is one small thing that can turn a bad day into a good one for you?'),
    dayIndex: 1,
    category: 'Daily Comfort',
    flavorContext: 'Small Joy',
    prompt: 'What is one small thing that can turn a bad day into a good one for you?',
    exampleAnswer: 'A hot shower, clean sheets, and listening to rain on the window with a fresh cup of tea.',
  },
  {
    id: 'dp_hidden_chapter',
    normalizedPrompt: normalizePrompt('If your life had a hidden chapter that nobody knew about, what would it be about?'),
    dayIndex: 2,
    category: 'Personal Stories',
    flavorContext: 'Secret Lore',
    prompt: 'If your life had a hidden chapter that nobody knew about, what would it be about?',
    exampleAnswer: 'The summer I worked in an isolated seaside bakery and learned to bake sourdough at 4 AM.',
  },
  {
    id: 'dp_childhood_joy',
    normalizedPrompt: normalizePrompt('What is something you loved as a child that you still enjoy today?'),
    dayIndex: 3,
    category: 'Nostalgia & Memory',
    flavorContext: 'Enduring Spark',
    prompt: 'What is something you loved as a child that you still enjoy today?',
    exampleAnswer: 'Building cozy blanket forts on rainy afternoons and rereading mystery adventure novels.',
  },
  {
    id: 'dp_movie_title',
    normalizedPrompt: normalizePrompt('If your friends made a movie about you, what would its title be?'),
    dayIndex: 4,
    category: 'Humor & Self-Reflection',
    flavorContext: 'Cinematic You',
    prompt: 'If your friends made a movie about you, what would its title be?',
    exampleAnswer: '“Easily Distracted by Cute Dogs and Fresh Baked Pastries” — a comedy in three acts.',
  },
  {
    id: 'dp_forget_phone',
    normalizedPrompt: normalizePrompt('What kind of moment makes you forget to check your phone?'),
    dayIndex: 5,
    category: 'Flow & Presence',
    flavorContext: 'Total Immersion',
    prompt: 'What kind of moment makes you forget to check your phone?',
    exampleAnswer: 'Being waist-deep in clay on the pottery wheel, or sitting around a crackling campfire laughing.',
  },
  {
    id: 'dp_keep_one_memory',
    normalizedPrompt: normalizePrompt('If you could keep one memory exactly as it is forever, which memory would you choose?'),
    dayIndex: 6,
    category: 'Deep Value',
    flavorContext: 'Time Capsule',
    prompt: 'If you could keep one memory exactly as it is forever, which memory would you choose?',
    exampleAnswer: 'Sitting on the dock at dusk with someone I loved, watching the water turn to liquid rose gold.',
  },
  {
    id: 'dp_understood_without_explaining',
    normalizedPrompt: normalizePrompt('What is one thing you wish people understood about you without you having to explain it?'),
    dayIndex: 7,
    category: 'Vulnerability',
    flavorContext: 'Quiet Truth',
    prompt: 'What is one thing you wish people understood about you without you having to explain it?',
    exampleAnswer: 'When I go quiet, I’m not upset or distant—I’m just observing the room and feeling peaceful.',
  },
  {
    id: 'dp_perfect_ordinary_sunday',
    normalizedPrompt: normalizePrompt('What would your perfect ordinary Sunday look like?'),
    dayIndex: 8,
    category: 'Everyday Rhythms',
    flavorContext: 'Comfort Tempo',
    prompt: 'What would your perfect ordinary Sunday look like?',
    exampleAnswer: 'Waking up with no alarm, walking to an unhurried bakery, and spending hours with a good book.',
  },
  {
    id: 'dp_skill_overnight',
    normalizedPrompt: normalizePrompt('If you could become really good at one thing overnight, what would you choose?'),
    dayIndex: 9,
    category: 'Curiosity & Dreams',
    flavorContext: 'Instant Mastery',
    prompt: 'If you could become really good at one thing overnight, what would you choose?',
    exampleAnswer: 'Fingerstyle acoustic guitar, so I could play warm bossa nova chords on the porch at twilight.',
  },
  {
    id: 'dp_tiny_green_flag',
    normalizedPrompt: normalizePrompt('What is a tiny green flag that makes you like someone more?'),
    dayIndex: 10,
    category: 'Romance & Connection',
    flavorContext: 'Subtle Magnetism',
    prompt: 'What is a tiny green flag that makes you like someone more?',
    exampleAnswer: 'When they remember a passing detail you mentioned weeks ago and ask how it turned out.',
  },
  {
    id: 'dp_try_without_fail',
    normalizedPrompt: normalizePrompt('What is something you would love to try if you knew you could not fail?'),
    dayIndex: 11,
    category: 'Ambition & Dreams',
    flavorContext: 'Fearless Leap',
    prompt: 'What is something you would love to try if you knew you could not fail?',
    exampleAnswer: 'Opening a quiet late-night bookstore cafe that serves herbal teas and records.',
  },
  {
    id: 'dp_unusual_home_feature',
    normalizedPrompt: normalizePrompt('If your future home had one unusual feature, what would you want it to be?'),
    dayIndex: 12,
    category: 'Imagination & Space',
    flavorContext: 'Dream Sanctuary',
    prompt: 'If your future home had one unusual feature, what would you want it to be?',
    exampleAnswer: 'A glass-ceiling greenhouse reading nook tucked directly above the main bedroom.',
  },

  // --- Extended Clever & Engaging Prompts ---
  {
    id: 'dp_unforgettable_compliment',
    normalizedPrompt: normalizePrompt('What is a compliment you received that you never forgot?'),
    dayIndex: 13,
    category: 'Warm Moments',
    flavorContext: 'Heartfelt Words',
    prompt: 'What is a compliment you received that you never forgot?',
    exampleAnswer: 'Someone told me: “You make ordinary rooms feel safe to be silly in.”',
  },
  {
    id: 'dp_national_holiday',
    normalizedPrompt: normalizePrompt('If you could design a national holiday, what would people celebrate on that day?'),
    dayIndex: 14,
    category: 'Playful Ideas',
    flavorContext: 'World Celebration',
    prompt: 'If you could design a national holiday, what would people celebrate on that day?',
    exampleAnswer: '“Unplug & Stroll Day”—all screens shut off at 2 PM, and everyone walks outside with baked goods.',
  },
  {
    id: 'dp_stubborn_harmless',
    normalizedPrompt: normalizePrompt('What is something harmless that you are very stubborn about?'),
    dayIndex: 15,
    category: 'Quirks & Habits',
    flavorContext: 'Little Principles',
    prompt: 'What is something harmless that you are very stubborn about?',
    exampleAnswer: 'Never washing a cast-iron skillet with soap, and always smelling old books when I open them.',
  },
  {
    id: 'dp_main_character_song',
    normalizedPrompt: normalizePrompt('What song always makes you feel like you are the main character in a movie?'),
    dayIndex: 16,
    category: 'Music & Vibes',
    flavorContext: 'Personal Soundtrack',
    prompt: 'What song always makes you feel like you are the main character in a movie?',
    exampleAnswer: 'Fleetwood Mac’s “Dreams” while walking down a sunlit city street with iced coffee.',
  },
  {
    id: 'dp_accidental_advice',
    normalizedPrompt: normalizePrompt('What is the best piece of accidental advice you have ever overheard?'),
    dayIndex: 17,
    category: 'Wisdom & Stories',
    flavorContext: 'Overheard Magic',
    prompt: 'What is the best piece of accidental advice you have ever overheard?',
    exampleAnswer: 'An elderly man on a bench telling his friend: “Don’t save the good perfume for special occasions.”',
  },
  {
    id: 'dp_invisible_history_observer',
    normalizedPrompt: normalizePrompt('If you could visit any moment in history just as an invisible observer, where would you go?'),
    dayIndex: 18,
    category: 'Imagination & History',
    flavorContext: 'Time Traveler',
    prompt: 'If you could visit any moment in history just as an invisible observer, where would you go?',
    exampleAnswer: 'Watching a quiet candlelit recording session of Miles Davis playing “Kind of Blue” in 1959.',
  },
  {
    id: 'dp_accidental_hobby',
    normalizedPrompt: normalizePrompt('What was a habit or hobby you picked up purely out of curiosity that ended up changing your life?'),
    dayIndex: 19,
    category: 'Passions & Growth',
    flavorContext: 'Turning Point',
    prompt: 'What was a habit or hobby you picked up purely out of curiosity that ended up changing your life?',
    exampleAnswer: 'Buying a $15 thrifted film camera and realizing I saw colors completely differently after that.',
  },
  {
    id: 'dp_comfort_food_memory',
    normalizedPrompt: normalizePrompt('What is a simple dish or meal that tastes like pure emotional comfort to you?'),
    dayIndex: 20,
    category: 'Sensory & Heart',
    flavorContext: 'Soul Food',
    prompt: 'What is a simple dish or meal that tastes like pure emotional comfort to you?',
    exampleAnswer: 'Toasted sourdough with salted Irish butter, hot tomato soup, and a sprinkle of cracked pepper.',
  },
  {
    id: 'dp_warning_label',
    normalizedPrompt: normalizePrompt('If you had a warning label on yourself, what would it say in tiny print?'),
    dayIndex: 21,
    category: 'Humor & Honesty',
    flavorContext: 'Self-Awareness',
    prompt: 'If you had a warning label on yourself, what would it say in tiny print?',
    exampleAnswer: '“Warning: Will become emotionally attached to fictional characters and stray cats within seconds.”',
  },
  {
    id: 'dp_teenager_dislike_now_love',
    normalizedPrompt: normalizePrompt('What is something you used to dislike as a teenager that you now genuinely appreciate?'),
    dayIndex: 22,
    category: 'Maturity & Evolution',
    flavorContext: 'Growing Up',
    prompt: 'What is something you used to dislike as a teenager that you now genuinely appreciate?',
    exampleAnswer: 'Going to bed early on a Friday night and having an empty, sunlit Saturday morning to myself.',
  },
  {
    id: 'dp_magical_skill_watching',
    normalizedPrompt: normalizePrompt('What is a craft or skill that looks like magic to you when you watch someone do it well?'),
    dayIndex: 23,
    category: 'Wonder & Craft',
    flavorContext: 'True Artistry',
    prompt: 'What is a craft or skill that looks like magic to you when you watch someone do it well?',
    exampleAnswer: 'A glassblower shaping glowing amber molten glass into a delicate, paper-thin fluted vase.',
  },
  {
    id: 'dp_laugh_until_stomach_hurt',
    normalizedPrompt: normalizePrompt('When was the last time you laughed until your stomach hurt, and what caused it?'),
    dayIndex: 24,
    category: 'Laughter & Light',
    flavorContext: 'Pure Hilarity',
    prompt: 'When was the last time you laughed until your stomach hurt, and what caused it?',
    exampleAnswer: 'Trying to teach my dog how to catch a ball, and watching him politely walk past it every time.',
  },
  {
    id: 'dp_sensory_nostalgia',
    normalizedPrompt: normalizePrompt('What is one smell, sound, or taste that instantly brings back a vivid childhood memory?'),
    dayIndex: 25,
    category: 'Nostalgia & Memory',
    flavorContext: 'Sensory Trigger',
    prompt: 'What is one smell, sound, or taste that instantly brings back a vivid childhood memory?',
    exampleAnswer: 'The smell of wet asphalt after summer rain and lawnmowers on Saturday morning.',
  },
  {
    id: 'dp_looking_forward_month',
    normalizedPrompt: normalizePrompt('What is one small thing you are looking forward to in the coming month?'),
    dayIndex: 26,
    category: 'Hope & Anticipation',
    flavorContext: 'Upcoming Joy',
    prompt: 'What is one small thing you are looking forward to in the coming month?',
    exampleAnswer: 'Cooler autumn breezes, putting on an oversized wool sweater, and drinking spiced cider.',
  },
  {
    id: 'dp_dream_hobby_room',
    normalizedPrompt: normalizePrompt('If you could add one extra room to your home dedicated entirely to a hobby, what would it be?'),
    dayIndex: 27,
    category: 'Craft & Spaces',
    flavorContext: 'Sanctuary Dream',
    prompt: 'If you could add one extra room to your home dedicated entirely to a hobby, what would it be?',
    exampleAnswer: 'A wood-paneled darkroom and audio listening lounge with floor cushions and tube amplifiers.',
  },
  {
    id: 'dp_emotional_safety_definition',
    normalizedPrompt: normalizePrompt('What does genuine emotional safety feel like to you when getting to know someone?'),
    dayIndex: 28,
    category: 'Vulnerability & Romance',
    flavorContext: 'Tender Depths',
    prompt: 'What does genuine emotional safety feel like to you when getting to know someone?',
    exampleAnswer: 'Being able to tell an awkward or unfinished story without worrying they will judge or mock you.',
  },
  {
    id: 'dp_unpopular_opinion_defend',
    normalizedPrompt: normalizePrompt('What is an unpopular opinion you have about food, movies, or daily life that you will defend forever?'),
    dayIndex: 29,
    category: 'Playful Debate',
    flavorContext: 'Hot Takes',
    prompt: 'What is an unpopular opinion you have about food, movies, or daily life that you will defend forever?',
    exampleAnswer: 'The edge crust of brownies is 100x better than the gooey center, and cold pizza beats hot pizza.',
  },
  {
    id: 'dp_quiet_unthanked_kindness',
    normalizedPrompt: normalizePrompt('What is a small, quiet kindness someone did for you that you never got to thank them for?'),
    dayIndex: 30,
    category: 'Gratitude & Grace',
    flavorContext: 'Quiet Angels',
    prompt: 'What is a small, quiet kindness someone did for you that you never got to thank them for?',
    exampleAnswer: 'A stranger on the subway noticing I was overwhelmed and handing me an unopened peppermint with a smile.',
  },
];

// ============================================================================
// 3. HOBBY PERSONALITY QUIZZES (5 Diverse Scenario-Based Quizzes)
// ============================================================================

export const QUIZ_SETS: QuizSet[] = [
  // --- QUIZ 1 ---
  {
    id: 'quiz_fun_personality',
    title: 'What Kind of Fun Matches Your Personality?',
    category: 'Play & Social Energy',
    tagline: 'Discover what type of social, creative, or restful energy recharges you most.',
    estimatedMinutes: 2,
    iconName: 'Sparkles',
    questions: [
      {
        id: 'qfun_1',
        question: 'A free Saturday suddenly opens up with zero obligations. Your immediate impulse is...',
        subtitle: 'Listen to your gut before your brain starts planning.',
        options: [
          {
            id: 'qfun_1a',
            label: 'Put on warm socks, brew something delicious, and lose yourself in a creative project',
            archetypeWeight: { creator: 3, thinker: 1 },
          },
          {
            id: 'qfun_1b',
            label: 'Send a quick text to a close friend: “Let’s hit the road and see where we end up”',
            archetypeWeight: { explorer: 3, spark: 1 },
          },
          {
            id: 'qfun_1c',
            label: 'Pick a quiet corner of a local park or cafe with a notebook or headphones',
            archetypeWeight: { thinker: 3, creator: 1 },
          },
          {
            id: 'qfun_1d',
            label: 'Rally a group for food, board games, or spontaneous laughter somewhere lively',
            archetypeWeight: { spark: 3, explorer: 1 },
          },
        ],
      },
      {
        id: 'qfun_2',
        question: 'At a gathering with people you like, where are you most naturally drawn?',
        subtitle: 'Your natural habitat in a social ecosystem.',
        options: [
          {
            id: 'qfun_2a',
            label: 'In the kitchen helping chop ingredients and chatting with two people one-on-one',
            archetypeWeight: { creator: 2, thinker: 2 },
          },
          {
            id: 'qfun_2b',
            label: 'Near the center of the room, sparking animated debates and making people laugh',
            archetypeWeight: { spark: 3, explorer: 1 },
          },
          {
            id: 'qfun_2c',
            label: 'Out on the balcony or porch having a deep, unhurried conversation under the stars',
            archetypeWeight: { thinker: 3, creator: 1 },
          },
          {
            id: 'qfun_2d',
            label: 'Proposing a spontaneous detour: “Who wants to walk down to the river right now?”',
            archetypeWeight: { explorer: 3, spark: 1 },
          },
        ],
      },
      {
        id: 'qfun_3',
        question: 'You’re picking music for an evening drive through scenic hills. What’s the vibe?',
        subtitle: 'The frequency that unlocks your heart.',
        options: [
          {
            id: 'qfun_3a',
            label: 'Acoustic fingerpicking, ambient jazz, or intimate indie folk with poetic lyrics',
            archetypeWeight: { creator: 3, thinker: 1 },
          },
          {
            id: 'qfun_3b',
            label: 'Upbeat indie rock or nostalgic 90s anthems that everyone can scream-sing along to',
            archetypeWeight: { spark: 3, explorer: 1 },
          },
          {
            id: 'qfun_3c',
            label: 'Cinematic instrumentals or vinyl-crackled lo-fi that makes the landscape look epic',
            archetypeWeight: { thinker: 3, creator: 1 },
          },
          {
            id: 'qfun_3d',
            label: 'Energetic electronic beats that make you want to roll the windows down and speed up',
            archetypeWeight: { explorer: 3, spark: 1 },
          },
        ],
      },
      {
        id: 'qfun_4',
        question: 'How do you react when a friend calls at 9:30 PM with a wild, unexpected idea?',
        subtitle: 'Honest reaction time.',
        options: [
          {
            id: 'qfun_4a',
            label: '“I’m already in pajama pants, but if it involves quiet tea or a late diner, maybe.”',
            archetypeWeight: { creator: 2, thinker: 2 },
          },
          {
            id: 'qfun_4b',
            label: '“Give me ten minutes to find my keys and sneakers—where are we going?”',
            archetypeWeight: { explorer: 3, spark: 1 },
          },
          {
            id: 'qfun_4c',
            label: '“Tell me the full plan first, including how late we’ll be out and parking.”',
            archetypeWeight: { thinker: 3 },
          },
          {
            id: 'qfun_4d',
            label: '“YES. And I’m bringing snacks and aux cord privileges.”',
            archetypeWeight: { spark: 3, explorer: 1 },
          },
        ],
      },
      {
        id: 'qfun_5',
        question: 'What keepsake from a memorable week would make you smile a year from now?',
        subtitle: 'The artifact that holds the joy.',
        options: [
          {
            id: 'qfun_5a',
            label: 'A handcrafted cup, sketch, or preserved plant clipping made during the week',
            archetypeWeight: { creator: 3 },
          },
          {
            id: 'qfun_5b',
            label: 'A funny video of someone falling into the river and everyone laughing hysterically',
            archetypeWeight: { spark: 3 },
          },
          {
            id: 'qfun_5c',
            label: 'A smooth river rock and a diary entry written late at night on the dock',
            archetypeWeight: { thinker: 3 },
          },
          {
            id: 'qfun_5d',
            label: 'A scuffed trail map marked with a secret viewpoint you discovered together',
            archetypeWeight: { explorer: 3 },
          },
        ],
      },
    ],
    results: {
      creator: {
        personaTitle: 'The Cozy Creator',
        badge: '🎨 Tactile Soul & Warm Hearth',
        tagline: 'You find your greatest joy in making, touching, and savoring the quiet details.',
        description:
          'Your idea of true fun involves hands-on craft, unhurried rituals, and spaces where you don’t have to perform. You recharge when creating something tangible—whether bread, sketches, ceramic forms, or garden blooms.',
        keyTraits: ['Intentionally present', 'Patient craftsmanship', 'Warm conversationalist', 'Comfort curator'],
        suggestedHobbies: ['Wheel-thrown ceramics', 'Wild sourdough baking', 'Botanical illustration', 'Hand-stitched leathercraft'],
        nextTryIdea: 'Try a weekend natural dye workshop or join a local pottery studio drop-in night.',
        idealDateIdea: 'Browsing a quiet flea market for vintage glassware, followed by baking something sweet together.',
        compatiblePersonas: ['The Deep Contemplator', 'The Spontaneous Explorer'],
      },
      explorer: {
        personaTitle: 'The Spontaneous Explorer',
        badge: '🧭 Open Horizon & Wild Pulse',
        tagline: 'Life is meant to be lived outside the lines, with a full tank of gas and an open mind.',
        description:
          'Your energy lights up when plans get thrown out the window and an adventure takes over. You value vitality, unpredictability, and feeling the elements on your skin rather than reading about them.',
        keyTraits: ['Courageous spirit', 'Adaptable & resilient', 'Brings high energy', 'Contagious enthusiasm'],
        suggestedHobbies: ['Bouldering & climbing', 'Backcountry trail running', 'Wild camping & kayaking', 'Gravel cycling'],
        nextTryIdea: 'Rent an alpine canoe for dawn paddling or sign up for an intro bouldering session.',
        idealDateIdea: 'Driving to an unmapped coastal viewpoint with a thermos of hot tea and binoculars.',
        compatiblePersonas: ['The Playful Spark', 'The Cozy Creator'],
      },
      thinker: {
        personaTitle: 'The Deep Contemplator',
        badge: '📖 Inquiring Mind & Midnight Sanctuary',
        tagline: 'You look beneath the surface, treasuring stillness, rich ideas, and rare conversations.',
        description:
          'For you, fun is about genuine depth. You prefer one meaningful midnight conversation over ten polite small-talk encounters. You find beauty in architecture, literature, chess puzzles, and vinyl grooves.',
        keyTraits: ['Observant & thoughtful', 'Attentive listener', 'Treasures authenticity', 'Subtle witty humor'],
        suggestedHobbies: ['Classical chess', '35mm film photography', 'Philosophy reading circles', 'Archival bookbinding'],
        nextTryIdea: 'Visit an independent archive library or spend an afternoon browsing dusty vinyl record bins.',
        idealDateIdea: 'A quiet gallery visit followed by late-afternoon tea and honest, wandering conversation.',
        compatiblePersonas: ['The Cozy Creator', 'The Playful Spark'],
      },
      spark: {
        personaTitle: 'The Playful Spark',
        badge: '✨ Laughter Catalyst & Group Glue',
        tagline: 'You bring warmth, spontaneous delight, and contagious laughter wherever you show up.',
        description:
          'Your superpower is making people feel welcome, comfortable, and ready to laugh until their stomach aches. You turn ordinary Tuesday grocery trips into playful memories and keep friendships alive.',
        keyTraits: ['Natural connector', 'Warm sense of humor', 'Loves shared games', 'Generous with affection'],
        suggestedHobbies: ['Improv & theater games', 'Board game design', 'Group trail hikes', 'Collaborative cooking feasts'],
        nextTryIdea: 'Host a themed blind-taste test night with friends or try a local social climbing club.',
        idealDateIdea: 'An arcade bar showdown followed by midnight street tacos and sharing funny childhood memories.',
        compatiblePersonas: ['The Spontaneous Explorer', 'The Deep Contemplator'],
      },
    },
  },

  // --- QUIZ 2 ---
  {
    id: 'quiz_weekend_style',
    title: 'What Is Your Ideal Weekend Style?',
    category: 'Lifestyle & Recharge',
    tagline: 'Discover your natural rhythm for slowing down, resetting, and feeling alive.',
    estimatedMinutes: 2,
    iconName: 'Calendar',
    questions: [
      {
        id: 'qweek_1',
        question: 'Sunday morning arrives with bright sunlight streaming across the floor. You...',
        subtitle: 'The golden hours are yours.',
        options: [
          {
            id: 'qweek_1a',
            label: 'Stay under the covers reading, make slow pour-over coffee, and keep the apartment quiet',
            archetypeWeight: { nester: 3, culture: 1 },
          },
          {
            id: 'qweek_1b',
            label: 'Already have your running or cycling shoes laced up before the streets wake up',
            archetypeWeight: { outdoor: 3, rover: 1 },
          },
          {
            id: 'qweek_1c',
            label: 'Walk to a lively neighborhood corner for brunch, catching up with people you adore',
            archetypeWeight: { social: 3, rover: 1 },
          },
          {
            id: 'qweek_1d',
            label: 'Grab a tote bag and head to an obscure secondhand bookshop or indie cinema',
            archetypeWeight: { culture: 3, nester: 1 },
          },
        ],
      },
      {
        id: 'qweek_2',
        question: 'An unexpected thunderstorm cancels outdoor plans on Saturday afternoon. You feel...',
        subtitle: 'When the weather takes the steering wheel.',
        options: [
          {
            id: 'qweek_2a',
            label: 'Secretly overjoyed—now you have an excuse to light candles, bake, and do nothing',
            archetypeWeight: { nester: 3 },
          },
          {
            id: 'qweek_2b',
            label: 'Restless—so you put on a waterproof jacket and go for a walk in the rain anyway',
            archetypeWeight: { outdoor: 3 },
          },
          {
            id: 'qweek_2c',
            label: 'Creative—you put on an album and invite friends over for board games and soup',
            archetypeWeight: { social: 3 },
          },
          {
            id: 'qweek_2d',
            label: 'Curious—you dive down a 3-hour rabbit hole researching an obscure art movement',
            archetypeWeight: { culture: 3 },
          },
        ],
      },
      {
        id: 'qweek_3',
        question: 'If you were gifted a free 3-hour workshop on a Sunday, you’d pick...',
        subtitle: 'A chance to cultivate something new.',
        options: [
          {
            id: 'qweek_3a',
            label: 'Traditional Japanese joinery or hand-throwing ceramic bowls',
            archetypeWeight: { nester: 2, culture: 2 },
          },
          {
            id: 'qweek_3b',
            label: 'Wild plant foraging and backcountry navigation skills',
            archetypeWeight: { outdoor: 3 },
          },
          {
            id: 'qweek_3c',
            label: 'Fresh pasta making from scratch with wine pairing',
            archetypeWeight: { social: 3, nester: 1 },
          },
          {
            id: 'qweek_3d',
            label: 'Vintage darkroom film printing and chemical development',
            archetypeWeight: { culture: 3 },
          },
        ],
      },
      {
        id: 'qweek_4',
        question: 'How do you prefer to close out your weekend on Sunday evening?',
        subtitle: 'The golden hour before the new week begins.',
        options: [
          {
            id: 'qweek_4a',
            label: 'A long hot bath, clean pajamas, herbal tea, and an early bedtime',
            archetypeWeight: { nester: 3 },
          },
          {
            id: 'qweek_4b',
            label: 'Stretching out tired muscles after a big day in the hills or on the water',
            archetypeWeight: { outdoor: 3 },
          },
          {
            id: 'qweek_4c',
            label: 'Sharing a casual family-style dinner with friends where nobody rushes to leave',
            archetypeWeight: { social: 3 },
          },
          {
            id: 'qweek_4d',
            label: 'Journaling thoughts from the week and organizing ideas for creative projects',
            archetypeWeight: { culture: 3 },
          },
        ],
      },
      {
        id: 'qweek_5',
        question: 'What makes a weekend feel genuinely restorative rather than wasted?',
        subtitle: 'Your definition of soul-level satisfaction.',
        options: [
          {
            id: 'qweek_5a',
            label: 'Having zero rushed moments and feeling your heart rate settle down completely',
            archetypeWeight: { nester: 3 },
          },
          {
            id: 'qweek_5b',
            label: 'Breaking a good sweat outdoors and feeling the crisp breeze on your face',
            archetypeWeight: { outdoor: 3 },
          },
          {
            id: 'qweek_5c',
            label: 'Deep belly laughs with people who remind you of who you really are',
            archetypeWeight: { social: 3 },
          },
          {
            id: 'qweek_5d',
            label: 'Learning something fascinating or experiencing art that gave you chills',
            archetypeWeight: { culture: 3 },
          },
        ],
      },
    ],
    results: {
      nester: {
        personaTitle: 'The Mindful Nester',
        badge: '🕯️ Hearth Keeper & Gentle Pace',
        tagline: 'Weekends are your sanctuary for restorative calm, warmth, and unhurried rituals.',
        description:
          'You understand the rare power of slow living. While the rest of the world rushes, your idea of paradise is soft light, a simmer on the stove, and space to simply exist without a ticking clock.',
        keyTraits: ['Comfort cultivator', 'Nervous system whisperer', 'Grounded stability', 'Deep self-care'],
        suggestedHobbies: ['Baking artisanal loaves', 'Plant propagation', 'Loose-leaf tea brewing', 'Knitting & textiles'],
        nextTryIdea: 'Try hand-rolling beeswax candles or testing an heirloom focaccia recipe with rosemary.',
        idealDateIdea: 'A quiet morning farmers market run followed by cooking a leisurely lunch together in socks.',
        compatiblePersonas: ['The Cultural Chronicler', 'The Outdoor Charger'],
      },
      outdoor: {
        personaTitle: 'The Outdoor Charger',
        badge: '🌲 Crisp Pines & Trail Dust',
        tagline: 'Your spirit recharges when physical movement meets the wide open sky.',
        description:
          'Stale indoor air drains you, but an hour under granite peaks or open waters resets your entire outlook. You love the satisfying exhaustion that comes from earned summits and fresh trail dirt.',
        keyTraits: ['High physical vitality', 'Adventurous mindset', 'Clear-headed perspective', 'Loves simple gear'],
        suggestedHobbies: ['Trail running', 'Open water wild swimming', 'Alpine hiking', 'Gravel bike packing'],
        nextTryIdea: 'Map a sunrise trail loop with a hot thermos in your daypack.',
        idealDateIdea: 'A crisp morning ridge hike followed by hearty diner food and comparing trail blisters with a smile.',
        compatiblePersonas: ['The Mindful Nester', 'The Social Feast Maker'],
      },
      social: {
        personaTitle: 'The Social Feast Maker',
        badge: '🥖 Shared Table & Warm Laughter',
        tagline: 'You feel most alive when good food, shared stories, and loved ones gather together.',
        description:
          'A weekend alone is fine, but a weekend filled with intimate dinners, casual porch hangouts, and collaborative cooking is where your heart truly expands. You create the rooms people never want to leave.',
        keyTraits: ['Natural host', 'Generous spirit', 'Builds community', 'Effortless warmth'],
        suggestedHobbies: ['Regional pasta making', 'Hosting dinner circles', 'Pickleball & casual games', 'Fermentation & wine tasting'],
        nextTryIdea: 'Host a DIY flatbread or pizza night where everyone brings one secret wild topping.',
        idealDateIdea: 'Exploring a neighborhood food hall together, picking three dishes to split, and people-watching.',
        compatiblePersonas: ['The Outdoor Charger', 'The Cultural Chronicler'],
      },
      culture: {
        personaTitle: 'The Cultural Chronicler',
        badge: '🎞️ Curious Observer & Aesthetic Eye',
        tagline: 'You savor the city’s quiet cultural treasures, vintage paper, and thoughtful aesthetics.',
        description:
          'Your weekend is a private treasure hunt. Whether finding a rare novel in an antique bookstall, admiring mid-century architecture, or enjoying film grain, you appreciate the poetry of human craftsmanship.',
        keyTraits: ['Discerning aesthetic', 'Rich inner life', 'Observant explorer', 'Storyteller instincts'],
        suggestedHobbies: ['Film photography', 'Independent bookstore crawls', 'Architectural sketches', 'Hi-Fi vinyl collecting'],
        nextTryIdea: 'Spend a rainy afternoon in a university art archive or antique camera repair shop.',
        idealDateIdea: 'Trekking through a labyrinthine used bookstore and picking a mystery book for each other to read.',
        compatiblePersonas: ['The Mindful Nester', 'The Social Feast Maker'],
      },
    },
  },

  // --- QUIZ 3 ---
  {
    id: 'quiz_creative_side',
    title: 'What Is Your Creative Side?',
    category: 'Creativity & Imagination',
    tagline: 'Explore the way your imagination naturally expresses itself in everyday life.',
    estimatedMinutes: 2,
    iconName: 'Palette',
    questions: [
      {
        id: 'qcreat_1',
        question: 'When you need to decompress after an overwhelming week, your hands want to...',
        subtitle: 'Your natural creative reflex.',
        options: [
          {
            id: 'qcreat_1a',
            label: 'Touch physical raw materials—kneading dough, carving wood, planting herbs',
            archetypeWeight: { maker: 3 },
          },
          {
            id: 'qcreat_1b',
            label: 'Curate a mood—sequencing a playlist, editing photos, writing a long journal entry',
            archetypeWeight: { storyteller: 3 },
          },
          {
            id: 'qcreat_1c',
            label: 'Solve a clever puzzle—reorganizing a space, building furniture, strategic games',
            archetypeWeight: { architect: 3 },
          },
          {
            id: 'qcreat_1d',
            label: 'Improvise freely—cooking without measuring, doodling abstract shapes, humming melodies',
            archetypeWeight: { improviser: 3 },
          },
        ],
      },
      {
        id: 'qcreat_2',
        question: 'You step into an unfamiliar living room for the first time. You immediately notice...',
        subtitle: 'What your sensory radar catches first.',
        options: [
          {
            id: 'qcreat_2a',
            label: 'The textures—the rough linen sofa, the cool stone fireplace, the heavy timber table',
            archetypeWeight: { maker: 3 },
          },
          {
            id: 'qcreat_2b',
            label: 'The mood—the warm amber lighting, the faint background music, the cozy shadows',
            archetypeWeight: { storyteller: 3 },
          },
          {
            id: 'qcreat_2c',
            label: 'The layout—how the furniture flows, sightlines, and clever uses of corner space',
            archetypeWeight: { architect: 3 },
          },
          {
            id: 'qcreat_2d',
            label: 'The quirky details—a bizarre ceramic mug, an eccentric painting, funny fridge magnets',
            archetypeWeight: { improviser: 3 },
          },
        ],
      },
      {
        id: 'qcreat_3',
        question: 'How do you approach cooking a completely new recipe?',
        subtitle: 'Kitchen psychology.',
        options: [
          {
            id: 'qcreat_3a',
            label: 'Focus on technique—getting the sear just right, tasting the salt balance with clean hands',
            archetypeWeight: { maker: 3 },
          },
          {
            id: 'qcreat_3b',
            label: 'Focus on the story—pairing it with the right beverage, lighting, and an evocative playlist',
            archetypeWeight: { storyteller: 3 },
          },
          {
            id: 'qcreat_3c',
            label: 'Prep with precision—mise en place, organized cutting board, following timing strictly',
            archetypeWeight: { architect: 3 },
          },
          {
            id: 'qcreat_3d',
            label: 'Glance at the ingredients once, discard the measuring spoons, and follow intuition',
            archetypeWeight: { improviser: 3 },
          },
        ],
      },
      {
        id: 'qcreat_4',
        question: 'Someone hands you a blank sketchbook and black ink pens. You naturally...',
        subtitle: 'Faced with pure potential.',
        options: [
          {
            id: 'qcreat_4a',
            label: 'Carefully study an object in front of you—a leaf, a coffee cup—and sketch its form',
            archetypeWeight: { maker: 3 },
          },
          {
            id: 'qcreat_4b',
            label: 'Write down a compelling sentence, a fleeting thought, or fragments of a poem',
            archetypeWeight: { storyteller: 3 },
          },
          {
            id: 'qcreat_4c',
            label: 'Draw geometric floorplans, intricate repeating patterns, or architectural elevations',
            archetypeWeight: { architect: 3 },
          },
          {
            id: 'qcreat_4d',
            label: 'Draw funny exaggerated cartoons, wild caricatures, or expressive abstract doodles',
            archetypeWeight: { improviser: 3 },
          },
        ],
      },
      {
        id: 'qcreat_5',
        question: 'Which compliment about something you created would stay with you the longest?',
        subtitle: 'The reflection that rings true.',
        options: [
          {
            id: 'qcreat_5a',
            label: '“You can feel how much care, patience, and love was poured into making this.”',
            archetypeWeight: { maker: 3 },
          },
          {
            id: 'qcreat_5b',
            label: '“This made me feel something deep that I haven’t felt in a very long time.”',
            archetypeWeight: { storyteller: 3 },
          },
          {
            id: 'qcreat_5c',
            label: '“The way you structured this is pure elegance—so clever and well thought-out.”',
            archetypeWeight: { architect: 3 },
          },
          {
            id: 'qcreat_5d',
            label: '“Nobody else in the world would have thought of this—it’s so delightfully original.”',
            archetypeWeight: { improviser: 3 },
          },
        ],
      },
    ],
    results: {
      maker: {
        personaTitle: 'The Tactile Maker',
        badge: '🏺 Clay, Grain & Devoted Hands',
        tagline: 'Your creativity lives in your fingertips, transforming raw materials into tangible warmth.',
        description:
          'You have a deep respect for physical craft. You believe that things made by hand carry a quiet soul that machine-made goods can never replicate. Your love language is often crafting a gift with pure patience.',
        keyTraits: ['Hands-on mastery', 'Grounded patience', 'Respect for natural textures', 'Quiet focus'],
        suggestedHobbies: ['Wheel-thrown ceramics', 'Woodworking & joinery', 'Linocut printmaking', 'Bookbinding'],
        nextTryIdea: 'Try carving a single wooden eating spoon from green wood using a sloyd knife.',
        idealDateIdea: 'Taking a hands-on wheel throwing class together and laughing through wobbly clay pots.',
        compatiblePersonas: ['The Storyteller Soul', 'The Visionary Architect'],
      },
      storyteller: {
        personaTitle: 'The Storyteller Soul',
        badge: '🎞️ Lyric, Mood & Emotional Depth',
        tagline: 'You understand atmospheric resonance, capturing feelings words usually fail to hold.',
        description:
          'You perceive life as an unfolding cinematic narrative. You notice the light through window blinds, the specific lyric that breaks someone’s heart, and the bittersweet beauty in fleeting seasons.',
        keyTraits: ['Emotional resonance', 'Vivid aesthetic sense', 'Deeply empathetic', 'Poetic perspective'],
        suggestedHobbies: ['35mm film photography', 'Creative nonfiction writing', 'Vinyl mixtape curation', 'Sound design'],
        nextTryIdea: 'Carry an analog disposable or rangefinder camera for a week and shoot only 1 frame per day.',
        idealDateIdea: 'Sitting in a dimly lit listening cafe listening to a full record from start to finish without speaking.',
        compatiblePersonas: ['The Tactile Maker', 'The Intuitive Freehand'],
      },
      architect: {
        personaTitle: 'The Visionary Architect',
        badge: '📐 Balance, Structure & Clever Design',
        tagline: 'You see the hidden blueprints of the world, designing spaces and systems of pure elegance.',
        description:
          'Your imagination loves structure, harmony, and function. You appreciate clean typography, well-designed furniture, and elegant solutions that make everyday life smoother and more beautiful.',
        keyTraits: ['Spatial intelligence', 'Appreciates clean beauty', 'Strategic problem solver', 'Discerning taste'],
        suggestedHobbies: ['Architectural drafting', 'Interior restoration', 'Chess strategy', 'Modular synthesizer patching'],
        nextTryIdea: 'Take a walking tour of historic modern architecture in your closest city.',
        idealDateIdea: 'Visiting a design museum followed by sketching favorite buildings over a shared espresso.',
        compatiblePersonas: ['The Tactile Maker', 'The Storyteller Soul'],
      },
      improviser: {
        personaTitle: 'The Intuitive Freehand',
        badge: '🎨 Playful Spark & Unfiltered Spirit',
        tagline: 'You create from pure instinct, bringing delightfully original and joyful ideas to life.',
        description:
          'Rigid rules bore you—your imagination thrives on spontaneous leaps, accidental discoveries, and playful humor. You remind everyone around you that creation is meant to be joyful, not solemn.',
        keyTraits: ['Spontaneous originality', 'Lighthearted courage', 'Thinks outside every box', 'Fun-loving energy'],
        suggestedHobbies: ['Improvised cooking', 'Cartooning & comic zines', 'Collage art', 'Ceramic sculpting without molds'],
        nextTryIdea: 'Create a mini zine using magazine cutouts and hand stamps in one afternoon.',
        idealDateIdea: 'Heading to an art supply shop, picking three wacky materials, and making funny sculptures for each other.',
        compatiblePersonas: ['The Storyteller Soul', 'The Visionary Architect'],
      },
    },
  },

  // --- QUIZ 4 ---
  {
    id: 'quiz_adventure_style',
    title: 'What Kind of Adventure Speaks to You?',
    category: 'Travel & Exploration',
    tagline: 'Discover what kind of journey makes your heart beat faster.',
    estimatedMinutes: 2,
    iconName: 'Compass',
    questions: [
      {
        id: 'qadv_1',
        question: 'You’re booking a 4-day escape. Which setting calls to your spirit first?',
        subtitle: 'Where does your mind wander when you close your eyes?',
        options: [
          {
            id: 'qadv_1a',
            label: 'A high-elevation alpine ridge with mountain mist and cold granite peaks',
            archetypeWeight: { alpine: 3 },
          },
          {
            id: 'qadv_1b',
            label: 'A rugged coastal headland where ocean waves crash against sea cliffs and tidepools',
            archetypeWeight: { coastal: 3 },
          },
          {
            id: 'qadv_1c',
            label: 'A centuries-old historic city with cobblestone alleys and late-night noodle shops',
            archetypeWeight: { historic: 3 },
          },
          {
            id: 'qadv_1d',
            label: 'A secluded cabin hidden deep in birch woods with a woodstove and sauna',
            archetypeWeight: { cabin: 3 },
          },
        ],
      },
      {
        id: 'qadv_2',
        question: 'While traveling in a new destination, what is your approach to planning?',
        subtitle: 'The balance between map and wanderlust.',
        options: [
          {
            id: 'qadv_2a',
            label: 'Topographical map in hand, tracking elevation gains and packing lightweight essentials',
            archetypeWeight: { alpine: 3 },
          },
          {
            id: 'qadv_2b',
            label: 'Following the shoreline, stopping whenever a beach looks secluded or wild',
            archetypeWeight: { coastal: 3 },
          },
          {
            id: 'qadv_2c',
            label: 'A notebook filled with handwritten recommendations from locals and antique books',
            archetypeWeight: { historic: 3 },
          },
          {
            id: 'qadv_2d',
            label: 'Unpacking your bag once, lighting a fire, and barely checking what time it is for three days',
            archetypeWeight: { cabin: 3 },
          },
        ],
      },
      {
        id: 'qadv_3',
        question: 'You get temporarily turned around in an unfamiliar area. Your first thought is...',
        subtitle: 'When the path goes sideways.',
        options: [
          {
            id: 'qadv_3a',
            label: 'Check the sun’s angle and compass—this is where the real route finding begins',
            archetypeWeight: { alpine: 3 },
          },
          {
            id: 'qadv_3b',
            label: 'Smile and keep walking toward the sound of the ocean',
            archetypeWeight: { coastal: 3 },
          },
          {
            id: 'qadv_3c',
            label: 'Great—this is probably the exact alleyway where the best local cafe is hidden',
            archetypeWeight: { historic: 3 },
          },
          {
            id: 'qadv_3d',
            label: 'Stop, sit on a log, enjoy the view, and wait for the quiet to settle in',
            archetypeWeight: { cabin: 3 },
          },
        ],
      },
      {
        id: 'qadv_4',
        question: 'What is your ultimate memorable meal while on a trip?',
        subtitle: 'The food that anchors the memory.',
        options: [
          {
            id: 'qadv_4a',
            label: 'Hot stew cooked on a camp stove at 8,000 feet after 12 miles of trail',
            archetypeWeight: { alpine: 3 },
          },
          {
            id: 'qadv_4b',
            label: 'Fresh smoked fish and crusty bread eaten on a rocky beach while wrapped in a blanket',
            archetypeWeight: { coastal: 3 },
          },
          {
            id: 'qadv_4c',
            label: 'A bowl of steaming broth at a tiny 6-seat stall down an old city side street',
            archetypeWeight: { historic: 3 },
          },
          {
            id: 'qadv_4d',
            label: 'A slow-braised pot roast cooked for four hours while rain taps on the roof',
            archetypeWeight: { cabin: 3 },
          },
        ],
      },
      {
        id: 'qadv_5',
        question: 'What feeling do you most want to bring home in your chest when an adventure ends?',
        subtitle: 'The imprint left on your spirit.',
        options: [
          {
            id: 'qadv_5a',
            label: 'The thrilling memory of conquering a high pass that tested your grit',
            archetypeWeight: { alpine: 3 },
          },
          {
            id: 'qadv_5b',
            label: 'The breezy, salt-air freedom of knowing how big and untamed the ocean is',
            archetypeWeight: { coastal: 3 },
          },
          {
            id: 'qadv_5c',
            label: 'The wonder of having stepped into a rich tapestry of human history and culture',
            archetypeWeight: { historic: 3 },
          },
          {
            id: 'qadv_5d',
            label: 'A deeply grounded nervous system that feels rested down to the marrow',
            archetypeWeight: { cabin: 3 },
          },
        ],
      },
    ],
    results: {
      alpine: {
        personaTitle: 'The Alpine Seeker',
        badge: '⛰️ Granite Ridge & Big Sky',
        tagline: 'You come alive where the tree line ends and the wind turns cold and clear.',
        description:
          'You thrive on journeys that require grit, stamina, and reverence for wilderness. You believe the greatest viewpoints cannot be driven to—they must be earned one footstep at a time.',
        keyTraits: ['High endurance', 'Loves wilderness simplicity', 'Self-reliant & steady', 'Awe-seeking'],
        suggestedHobbies: ['Multi-day backpacking', 'Alpine climbing', 'Cross-country trail running', 'Topography mapping'],
        nextTryIdea: 'Plan a high alpine loop camp near an emerald glacial lake with a small pack.',
        idealDateIdea: 'A sunrise hike up a local mountain peak with a shared thermos of hot coffee at the summit.',
        compatiblePersonas: ['The Coastal Wanderer', 'The Cozy Sanctuary Nomad'],
      },
      coastal: {
        personaTitle: 'The Coastal Wanderer',
        badge: '🌊 Salt Fog & Crashing Waves',
        tagline: 'The rhythm of tides, ocean horizons, and rugged beaches settles your soul.',
        description:
          'The coastline is your natural cathedral. You love the misty, mood-shifting weather of northern beaches, driftwood campfires, and walking for miles along the edge where water meets land.',
        keyTraits: ['Free-spirited', 'Tolerant of weather', 'Appreciates raw elements', 'Romantic soul'],
        suggestedHobbies: ['Wild beach walking', 'Open water sea swimming', 'Tidepool ecology', 'Coastal gravel cycling'],
        nextTryIdea: 'Explore a rugged coastal trail and build a windbreak for hot tea on the shore.',
        idealDateIdea: 'Walking a rugged shoreline in warm knit sweaters, collecting sea glass and listening to waves.',
        compatiblePersonas: ['The Alpine Seeker', 'The Historic Alleys Explorer'],
      },
      historic: {
        personaTitle: 'The Historic Alleys Explorer',
        badge: '🏮 Cobblestones, Lanterns & Stories',
        tagline: 'You are magnetized by old cities, forgotten doorways, and cultural warmth.',
        description:
          'For you, the world is an infinite living novel. You love cities that have layers of centuries underfoot, where winding alleys reveal unexpected jazz clubs, spice merchants, and centuries of human stories.',
        keyTraits: ['Curious cultural palate', 'Loves architecture & history', 'Great sense of local taste', 'Engaging conversationalist'],
        suggestedHobbies: ['Historical walking tours', 'Street photography', 'Culinary exploration', 'Language learning'],
        nextTryIdea: 'Take an evening train to an old port city and wander without a map until dinner.',
        idealDateIdea: 'Exploring an old town district at dusk, ducking into a secret courtyard bar with live acoustic music.',
        compatiblePersonas: ['The Coastal Wanderer', 'The Cozy Sanctuary Nomad'],
      },
      cabin: {
        personaTitle: 'The Cozy Sanctuary Nomad',
        badge: '🪵 Woodstove, Tea & Forest Silence',
        tagline: 'Your ultimate adventure is an unhurried retreat into the heart of the woods.',
        description:
          'You don’t need to conquer ten peaks to feel refreshed. You seek deep seclusion, cedar air, crackling wood fires, and the restorative luxury of uninterrupted time.',
        keyTraits: ['Deeply restorative', 'Content in solitude', 'Values peaceful warmth', 'Gentle companion'],
        suggestedHobbies: ['Woodstove cooking', 'Nature journaling', 'Wild sauna rituals', 'Acoustic guitar playing'],
        nextTryIdea: 'Rent an off-grid tiny cabin with a woodstove for a weekend of unplugged reading.',
        idealDateIdea: 'A weekend cabin stay cooking hearty stews and watching stars from a cedar porch.',
        compatiblePersonas: ['The Alpine Seeker', 'The Historic Alleys Explorer'],
      },
    },
  },

  // --- QUIZ 5 ---
  {
    id: 'quiz_connection_style',
    title: 'What Is Your Style of Showing Care?',
    category: 'Romantic & Social Bonds',
    tagline: 'Discover the subtle, natural ways you express affection and bond with others.',
    estimatedMinutes: 2,
    iconName: 'Heart',
    questions: [
      {
        id: 'qcare_1',
        question: 'Someone you care about has had a grueling, exhausting day. Your immediate instinct is...',
        subtitle: 'Your natural reflex when love calls for action.',
        options: [
          {
            id: 'qcare_1a',
            label: 'Handle something practical—make dinner, wash the dishes, and take things off their plate',
            archetypeWeight: { anchor: 3 },
          },
          {
            id: 'qcare_1b',
            label: 'Make them laugh, show them a hilarious meme, and lift the heavy mood with warmth',
            archetypeWeight: { spark: 3 },
          },
          {
            id: 'qcare_1c',
            label: 'Sit quietly beside them, pour tea, and simply listen without trying to fix anything',
            archetypeWeight: { sanctuary: 3 },
          },
          {
            id: 'qcare_1d',
            label: 'Say: “Get your shoes, we’re going for a quiet walk to breathe and reset together”',
            archetypeWeight: { teammate: 3 },
          },
        ],
      },
      {
        id: 'qcare_2',
        question: 'When you want to show someone they truly matter to you, you naturally...',
        subtitle: 'Your signature expression of care.',
        options: [
          {
            id: 'qcare_2a',
            label: 'Remember the small, unspoken details—their coffee order, their favorite snack, an old story',
            archetypeWeight: { anchor: 3 },
          },
          {
            id: 'qcare_2b',
            label: 'Plan a delightful, unexpected adventure or surprise that makes their eyes light up',
            archetypeWeight: { spark: 3 },
          },
          {
            id: 'qcare_2c',
            label: 'Write an honest, vulnerable note or tell them specifically what you admire about them',
            archetypeWeight: { sanctuary: 3 },
          },
          {
            id: 'qcare_2d',
            label: 'Show up reliably to help them build, move, or conquer a difficult goal together',
            archetypeWeight: { teammate: 3 },
          },
        ],
      },
      {
        id: 'qcare_3',
        question: 'What kind of gift feels most deeply satisfying for you to give someone?',
        subtitle: 'The giving philosophy.',
        options: [
          {
            id: 'qcare_3a',
            label: 'Something they casually mentioned needing three months ago that they forgot they wanted',
            archetypeWeight: { anchor: 3 },
          },
          {
            id: 'qcare_3b',
            label: 'An experiential surprise—tickets to a secret event or a spontaneous road trip itinerary',
            archetypeWeight: { spark: 3 },
          },
          {
            id: 'qcare_3c',
            label: 'A book with annotations in the margins or a handcrafted item made with love',
            archetypeWeight: { sanctuary: 3 },
          },
          {
            id: 'qcare_3d',
            label: 'High-quality gear or an essential tool that will serve them on shared adventures for years',
            archetypeWeight: { teammate: 3 },
          },
        ],
      },
      {
        id: 'qcare_4',
        question: 'During a long conversation, what makes you feel closest to someone?',
        subtitle: 'The moment the spark catches.',
        options: [
          {
            id: 'qcare_4a',
            label: 'When you realize both of you have each other’s backs in real, practical everyday life',
            archetypeWeight: { anchor: 3 },
          },
          {
            id: 'qcare_4b',
            label: 'When you get into an unstoppable loop of inside jokes and breathless laughter',
            archetypeWeight: { spark: 3 },
          },
          {
            id: 'qcare_4c',
            label: 'When they share a fragile truth or insecurity they haven’t told anyone else',
            archetypeWeight: { sanctuary: 3 },
          },
          {
            id: 'qcare_4d',
            label: 'When you brainstorm a dream or project together and build on each other’s excitement',
            archetypeWeight: { teammate: 3 },
          },
        ],
      },
      {
        id: 'qcare_5',
        question: 'What makes you feel most genuinely loved and appreciated in return?',
        subtitle: 'Your personal emotional fuel.',
        options: [
          {
            id: 'qcare_5a',
            label: 'When someone notices when I’m quietly tired and steps in without me having to ask',
            archetypeWeight: { anchor: 3 },
          },
          {
            id: 'qcare_5b',
            label: 'When someone brings playful enthusiasm into my day and reminds me not to take life so seriously',
            archetypeWeight: { spark: 3 },
          },
          {
            id: 'qcare_5c',
            label: 'When someone accepts my quiet moods and loves me for who I am, unfinished edges and all',
            archetypeWeight: { sanctuary: 3 },
          },
          {
            id: 'qcare_5d',
            label: 'When someone cheers loudly for my wins and stands shoulder-to-shoulder with me through challenges',
            archetypeWeight: { teammate: 3 },
          },
        ],
      },
    ],
    results: {
      anchor: {
        personaTitle: 'The Thoughtful Anchor',
        badge: '⚓ Steady Presence & Everyday Devotion',
        tagline: 'Your care shows up in practical devotion, quiet reliability, and remembering every detail.',
        description:
          'You show love not with grand speeches, but with steady devotion. You are the one who checks the tire pressure, puts on the kettle when someone looks drained, and remembers the exact way they take their coffee.',
        keyTraits: ['Rock-solid reliability', 'Notices unspoken needs', 'Grounding presence', 'Loyal partner'],
        suggestedHobbies: ['Baking comfort foods', 'Home carpentry & repair', 'Garden stewardship', 'Specialty coffee brewing'],
        nextTryIdea: 'Leave a surprise note and their favorite morning snack where they will find it on a busy day.',
        idealDateIdea: 'Cooking an unhurried dinner together and talking without any phones on the table.',
        compatiblePersonas: ['The Deep Sanctuary', 'The Uplifting Spark'],
      },
      spark: {
        personaTitle: 'The Uplifting Spark',
        badge: '✨ Joy Catalyst & Playful Heart',
        tagline: 'Your care shines through bringing laughter, lightness, and delight into heavy days.',
        description:
          'You believe that love should feel like an exhale and a smile. When someone you care about is overwhelmed, your instinct is to break the tension, bring warmth, and remind them that the world is still full of joy.',
        keyTraits: ['Contagious optimism', 'Brings emotional lightness', 'Playful & affectionate', 'Great at surprises'],
        suggestedHobbies: ['Social game nights', 'Improv & comedy', 'Spontaneous road trips', 'Baking whimsical treats'],
        nextTryIdea: 'Plan a mystery date night with a playful dress code and surprise dessert stop.',
        idealDateIdea: 'An evening arcade or miniature golf match followed by hot chocolate and hilarious storytelling.',
        compatiblePersonas: ['The Thoughtful Anchor', 'The Shared-Journey Teammate'],
      },
      sanctuary: {
        personaTitle: 'The Deep Sanctuary',
        badge: '🕯️ Sacred Space & Emotional Depth',
        tagline: 'You offer safe harbor for the soul, holding space for raw vulnerability without judgment.',
        description:
          'You are a gifted emotional listener. People feel comfortable taking off their armor around you because they know you won’t try to rush them or minimize their pain. You love with profound empathy and patience.',
        keyTraits: ['Deep emotional safety', 'Rare listening skill', 'Vulnerable & honest', 'Treasures authenticity'],
        suggestedHobbies: ['Letter writing & journaling', 'Acoustic songwriting', '35mm portrait photography', 'Meditation & breathwork'],
        nextTryIdea: 'Write a heartfelt letter of appreciation to someone who made a quiet difference in your year.',
        idealDateIdea: 'Walking through a quiet conservatory or botanic garden and sharing deep childhood memories.',
        compatiblePersonas: ['The Thoughtful Anchor', 'The Shared-Journey Teammate'],
      },
      teammate: {
        personaTitle: 'The Shared-Journey Teammate',
        badge: '🤝 Shoulder-to-Shoulder & Mutual Fire',
        tagline: 'You care by being an equal partner in crime, backing dreams and tackling life together.',
        description:
          'For you, love is a partnership of equals. You express love by building things together, pushing each other toward growth, and standing side-by-side through life’s steepest trails with unwavering encouragement.',
        keyTraits: ['Inspiring co-pilot', 'Encourages growth', 'Loyal teammate', 'Action-oriented affection'],
        suggestedHobbies: ['Partner bouldering', 'Joint creative projects', 'Tandem outdoor expeditions', 'Fitness & running goals'],
        nextTryIdea: 'Set a collaborative fun 30-day mini-goal together, like learning a new language or cooking 10 new dishes.',
        idealDateIdea: 'A collaborative project like assembling a terrarium or tackling a scenic trail, followed by great local food.',
        compatiblePersonas: ['The Uplifting Spark', 'The Deep Sanctuary'],
      },
    },
  },
];
