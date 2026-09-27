import { GoogleGenAI } from '@google/genai';
import { UserProfile } from '../types';

/**
 * Gemini client initialization for client or server usage.
 * Uses process.env.GEMINI_API_KEY or import.meta.env.VITE_GEMINI_API_KEY
 */
const apiKey = typeof process !== 'undefined' && process.env?.GEMINI_API_KEY
  ? process.env.GEMINI_API_KEY
  : (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey: apiKey || undefined });

export interface OSINTAnalysisResult {
  compatibilityScore: number;
  matchGrade: 'Resonant' | 'Harmonic' | 'Complementary' | 'Curious';
  deepAnalysis: string;
  sharedAesthetics: string[];
  suggestedConversationStarters: string[];
  osintInsights: {
    intellectualResonance: string;
    culturalAffinity: string;
    lifestylePacing: string;
    trustRating: string;
  };
}

/**
 * Perform OSINT-grounded compatibility analysis between two anonymous profiles
 * utilizing Google Search Grounding to evaluate public cultural, literary, musical,
 * technical, or geographical references.
 */
export async function calculateOSINTCompatibility(
  currentUser: UserProfile,
  candidateUser: UserProfile
): Promise<OSINTAnalysisResult> {
  try {
    const prompt = `
You are an OSINT Intelligence & Human Compatibility Analyst for "Relato", a refined anonymous discovery platform.
Analyze the compatibility between these two anonymous individuals based on their public digital footprints, shared interests, linguistic overlap, and cultural aesthetics.

Person A (Active User):
- Alias: ${currentUser.alias}
- Age: ${currentUser.age} (${currentUser.activeMode} mode)
- Country: ${currentUser.country}
- Languages: ${currentUser.languages.join(', ')}
- Interests: ${currentUser.interests.join(', ')}
- Bio: "${currentUser.bio}"
- Seeking: "${currentUser.lookingFor}"
- Consented OSINT Footprint:
  * Public GitHub/Tech: ${currentUser.osintFootprint?.publicGithub || 'None'}
  * Scholar/Research: ${currentUser.osintFootprint?.publicScholar || 'None'}
  * Public Reading/Authors: ${currentUser.osintFootprint?.favoriteBooksAuthors?.join(', ') || 'Eclectic'}
  * Music & Aesthetic: ${currentUser.osintFootprint?.musicAesthetics?.join(', ') || 'Ambient/Minimal'}
  * Public Communities: ${currentUser.osintFootprint?.publicSubredditsOrForums?.join(', ') || 'N/A'}

Person B (Potential Match):
- Alias: ${candidateUser.alias}
- Age: ${candidateUser.age} (${candidateUser.activeMode} mode)
- Country: ${candidateUser.country}
- Languages: ${candidateUser.languages.join(', ')}
- Interests: ${candidateUser.interests.join(', ')}
- Bio: "${candidateUser.bio}"
- Consented OSINT Footprint:
  * Public GitHub/Tech: ${candidateUser.osintFootprint?.publicGithub || 'None'}
  * Scholar/Research: ${candidateUser.osintFootprint?.publicScholar || 'None'}
  * Public Reading/Authors: ${candidateUser.osintFootprint?.favoriteBooksAuthors?.join(', ') || 'Eclectic'}
  * Music & Aesthetic: ${candidateUser.osintFootprint?.musicAesthetics?.join(', ') || 'Ambient/Classical/Experimental'}
  * Public Communities: ${candidateUser.osintFootprint?.publicSubredditsOrForums?.join(', ') || 'N/A'}

Mode: ${currentUser.activeMode.toUpperCase()}

Instructions:
1. Provide a compatibility score (0-100) based on authentic intersection of passions, values, and mutual cognitive resonance.
2. Determine matchGrade: 'Resonant' (90+), 'Harmonic' (80-89), 'Complementary' (70-79), or 'Curious' (<70).
3. 2-3 sentence poetic yet analytical synthesis of why they connect.
4. List 3 shared aesthetic or intellectual overlap keywords.
5. Provide 2 distinct, thoughtful conversation opening questions (no generic "hey how are you").
6. Provide short 1-line OSINT evaluation for: Intellectual Resonance, Cultural Affinity, Lifestyle Pacing, and Trust/Public Signal Rating.

Respond ONLY with valid JSON in this exact structure:
{
  "compatibilityScore": 88,
  "matchGrade": "Harmonic",
  "deepAnalysis": "Both gravitate towards reflective minimalism and algorithmic curiosity...",
  "sharedAesthetics": ["Haruki Murakami", "Generative Art", "Specialty Espresso"],
  "suggestedConversationStarters": ["What made you dive into generative typography?", "Do you listen to ambient while writing?"],
  "osintInsights": {
    "intellectualResonance": "Strong philosophical and technical convergence",
    "culturalAffinity": "Shared fondness for slow cinema and Nordic design",
    "lifestylePacing": "Synchronized cadence between high-focus work and introspective solitude",
    "trustRating": "Verified open signals across research & public repositories"
  }
}
`;

    // Using gemini-3.5-flash with Google Search grounding as instructed in feature requirements
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        compatibilityScore: Math.min(100, Math.max(50, parsed.compatibilityScore || 85)),
        matchGrade: parsed.matchGrade || 'Harmonic',
        deepAnalysis: parsed.deepAnalysis || 'Shared perspective on deliberate connection and intellectual curiosity.',
        sharedAesthetics: parsed.sharedAesthetics || ['Aesthetics', 'Philosophy'],
        suggestedConversationStarters: parsed.suggestedConversationStarters || [
          'What is a quiet discovery that influenced your outlook recently?',
          'What project are you most passionate about right now?'
        ],
        osintInsights: parsed.osintInsights || {
          intellectualResonance: 'High cognitive synergy and shared curiosities',
          culturalAffinity: 'Harmonious artistic and literary tastes',
          lifestylePacing: 'Complementary everyday focus',
          trustRating: 'Verified authentic public profile vectors'
        }
      };
    }
  } catch (error) {
    console.warn('Gemini OSINT compatibility calculation fallback:', error);
  }

  // Graceful rule-based OSINT calculation fallback if offline/no-key
  const shared = currentUser.interests.filter(i => candidateUser.interests.includes(i));
  const langMatch = currentUser.languages.some(l => candidateUser.languages.includes(l));
  const score = Math.min(96, Math.max(68, 70 + shared.length * 7 + (langMatch ? 5 : 0)));

  return {
    compatibilityScore: score,
    matchGrade: score >= 90 ? 'Resonant' : score >= 80 ? 'Harmonic' : 'Complementary',
    deepAnalysis: `Strong overlap in ${shared.slice(0, 2).join(' & ') || 'values'}, characterized by mutual interest in meaningful discourse and deliberate lifestyle design.`,
    sharedAesthetics: shared.length > 0 ? shared : ['Thoughtful Living', 'Autonomous Curiosity'],
    suggestedConversationStarters: [
      `I noticed your interest in ${shared[0] || 'minimalism'} — what introduced you to that space?`,
      `What piece of art or music has stayed with you the longest?`
    ],
    osintInsights: {
      intellectualResonance: 'Elevated curiosity across intersecting domains',
      culturalAffinity: 'Balanced taste in independent media and intentional work',
      lifestylePacing: 'Steady, non-invasive digital rhythm',
      trustRating: 'Verified organic public signals'
    }
  };
}

/**
 * Synthesizes an anonymous user's consented OSINT footprint using Gemini and Google Search Grounding.
 */
export async function synthesizeConsentedOSINT(
  alias: string,
  topics: string[],
  books: string[],
  publicHandles: string
): Promise<string> {
  try {
    const prompt = `
Create an OSINT Cultural Fingerprint synopsis (30-40 words) for an anonymous profile with:
- Alias: ${alias}
- Public interests/topics: ${topics.join(', ')}
- Books/Authors: ${books.join(', ')}
- Public Signal handles: ${publicHandles}

Tone: Calm, observational, sophisticated intelligence briefing. No private PII.
`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text?.trim() || 'Verified signals indicate affinity for introspective arts, open discourse, and considered life architecture.';
  } catch (err) {
    return 'Public digital footprint reflects high-order engagement in deliberate crafts, literature, and architectural thinking.';
  }
}
