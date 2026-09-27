import { UserProfile } from '../types';

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

async function post(path: string, body: unknown) {
  const r = await fetch(path, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export function calculateOSINTCompatibility(currentUser: UserProfile, candidateUser: UserProfile): Promise<OSINTAnalysisResult> {
  return post('/api/gemini/compatibility', {
    candidateUser: {
      id: candidateUser.id,
      alias: candidateUser.alias,
      age: candidateUser.age,
      country: candidateUser.country,
      languages: candidateUser.languages,
      interests: candidateUser.interests,
      bio: candidateUser.bio,
      lookingFor: candidateUser.lookingFor,
      osintFootprint: candidateUser.osintFootprint,
    }
  });
}

export async function synthesizeConsentedOSINT(alias:string, topics:string[], books:string[], publicHandles:string):Promise<string>{
  const data = await post('/api/gemini/osint-synthesis', {alias,topics,books,publicHandles}) as {summary:string};
  return data.summary;
}