import { GoogleGenAI } from '@google/genai';
import { Profile } from '../types';

const STORAGE_KEY_GEMINI = 'lovbee_gemini_api_key';

/**
 * Returns the active Gemini API key from localStorage or Vite environment.
 */
export function getGeminiApiKey(): string {
  let localKey = '';
  if (typeof window !== 'undefined') {
    localKey = (localStorage.getItem(STORAGE_KEY_GEMINI) || '').trim();
  }

  const envKey = (
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  ).trim();

  const key = localKey || envKey;
  if (!key || key.toLowerCase().includes('placeholder') || key.toLowerCase().includes('my_gemini')) {
    return '';
  }
  return key;
}

/**
 * Saves or clears the user-specified Gemini API key in localStorage.
 */
export function saveGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY_GEMINI, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_GEMINI);
    }
  }
}

/**
 * Checks if a valid Gemini API key is configured.
 */
export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

/**
 * Initializes the GoogleGenAI client with the active key.
 */
function getClient(customKey?: string): GoogleGenAI | null {
  const key = (customKey || getGeminiApiKey()).trim();
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

/**
 * Verifies connectivity to the Gemini API.
 */
export async function testGeminiConnection(
  customKey?: string
): Promise<{ success: boolean; message: string }> {
  const key = (customKey || getGeminiApiKey()).trim();
  if (!key) {
    return {
      success: false,
      message: 'No Gemini API key found. Please provide an API key.',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Respond with exactly one word: "Connected"',
    });

    const text = response.text?.trim() || '';
    if (text) {
      return {
        success: true,
        message: 'Successfully connected to Google Gemini API (gemini-2.5-flash)!',
      };
    }
    return {
      success: false,
      message: 'Received empty response from Gemini API.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error connecting to Gemini API. Please check your key.',
    };
  }
}

/**
 * Generates personalized, warm, hobby-focused icebreakers for a match.
 */
export async function generateIcebreakers(
  partner: Profile,
  currentUser: Profile
): Promise<string[]> {
  const ai = getClient();
  if (!ai) {
    // Intelligent offline fallback
    const hobby = partner.hobbies[0]?.name || 'your craft';
    return [
      `I noticed your dedication to ${hobby} — what inspired you to start?`,
      `How has your 21-day ritual been going with ${hobby} lately?`,
      `What ritual or project are you most excited about this week?`,
    ];
  }

  try {
    const partnerHobbies = partner.hobbies.map((h) => `${h.name} (${h.category})`).join(', ') || 'creative crafts';
    const myHobbies = currentUser.hobbies.map((h) => h.name).join(', ') || 'creative hobbies';

    const prompt = `You are a thoughtful wingman on Lovbee, a mindful dating app centered on genuine hobbies and personal consistency rituals.
Create 3 distinct, warm, charming, and respectful conversation starter icebreakers for me to send to ${partner.displayName}.

Context about ${partner.displayName}:
- Hobbies: ${partnerHobbies}
- Bio: "${partner.bio || 'Creative enthusiast'}"
- Lifestyle: ${partner.lifestyle?.weekendVibe || 'slow weekends'}, activity: ${partner.lifestyle?.activityLevel || 'daily mover'}
- Daily Challenge: ${partner.challenge?.title || 'Daily ritual'}

My Hobbies: ${myHobbies}

Rules:
- Be authentic, respectful, and hobby-focused.
- No cheesy pickup lines or creepy small-talk.
- Keep each icebreaker under 25 words.
- Return EXACTLY 3 bullet points, each starting with "- ".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const lines = (response.text || '')
      .split('\n')
      .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter((l) => l.length > 5);

    if (lines.length >= 3) {
      return lines.slice(0, 3);
    }
    return lines.length > 0 ? lines : [
      `I noticed your passion for ${partner.hobbies[0]?.name || 'your craft'}! How did you first get into it?`
    ];
  } catch (err) {
    console.warn('Gemini icebreaker generation notice:', err);
    return [
      `I noticed your passion for ${partner.hobbies[0]?.name || 'your craft'}! How did you first get into it?`,
      `What ritual or project are you most excited about this week?`,
      `How has your 21-day consistency ritual been feeling so far?`,
    ];
  }
}

/**
 * Generates polished, compelling bio variations for dating profiles.
 */
export async function generateBioPolish(
  currentBio: string,
  hobbies: string[],
  vibe: string
): Promise<{ style: string; bio: string }[]> {
  const ai = getClient();
  const hobbiesList = hobbies.join(', ') || 'Ceramics, Bouldering, Pour-over Coffee';

  if (!ai) {
    return [
      {
        style: 'Warm & Intentional',
        bio: `Dedicated to small daily rituals and deep conversations. Usually found with ${hobbiesList}.`,
      },
      {
        style: 'Playful & Creative',
        bio: `Equal parts focused maker and spontaneous explorer. Currently perfecting ${hobbies[0] || 'my craft'}.`,
      },
    ];
  }

  try {
    const prompt = `You are an expert profile coach for Lovbee, an authentic dating community where connections are formed through shared crafts and lifestyle rituals.
Rewrite this user's bio into 3 distinct styles:
Current Bio: "${currentBio || 'Looking to connect over shared hobbies'}"
Hobbies: ${hobbiesList}
Vibe: ${vibe || 'Slow mornings and focused craft'}

Output format:
Style: [Name]
Bio: [1-2 sentences, max 40 words, personal and engaging]
---`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const blocks = (response.text || '').split('---');
    const results: { style: string; bio: string }[] = [];

    for (const block of blocks) {
      const styleMatch = block.match(/Style:\s*(.+)/i);
      const bioMatch = block.match(/Bio:\s*([\s\S]+)/i);
      if (styleMatch && bioMatch) {
        results.push({
          style: styleMatch[1].trim(),
          bio: bioMatch[1].replace(/Style:.*/, '').trim(),
        });
      }
    }

    return results.length > 0
      ? results.slice(0, 3)
      : [
          {
            style: 'Warm & Authentic',
            bio: `Finding balance in daily craft and meaningful connections. Currently exploring ${hobbiesList}.`,
          },
        ];
  } catch (err) {
    console.warn('Gemini bio polish notice:', err);
    return [
      {
        style: 'Warm & Authentic',
        bio: `Finding balance in daily craft and meaningful connections. Currently exploring ${hobbiesList}.`,
      },
    ];
  }
}
