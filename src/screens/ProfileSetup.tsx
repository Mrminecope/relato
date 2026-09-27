import { useState } from 'react';
import { UserProfile, ModeType, GenderType } from '../types';
import { AVAILABLE_INTERESTS, AVAILABLE_LANGUAGES, AVAILABLE_COUNTRIES } from '../data/mockProfiles';
import { AvatarBadge } from '../components/AvatarBadge';
import { RelatoLogo } from '../components/RelatoLogo';
import { ShieldAlert, Sparkles, Check, Info, Lock, ShieldCheck } from 'lucide-react';
import { synthesizeConsentedOSINT } from '../lib/gemini';
import { verifyConsentedPublicFootprint } from '../lib/osint';

interface ProfileSetupProps {
  userId: string;
  userEmail?: string;
  initialProfile?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
}

export function ProfileSetup({ userId, userEmail, initialProfile, onComplete }: ProfileSetupProps) {
  const [alias, setAlias] = useState(initialProfile?.alias || 'Aura Echo');
  const [avatarSeed, setAvatarSeed] = useState(initialProfile?.avatarSeed || 'aura-rose');
  const [age, setAge] = useState<number>(initialProfile?.age || 23);
  // STRICT GENDER CHOICES: Male and Female
  const [gender, setGender] = useState<GenderType>(initialProfile?.gender || 'Female');
  const [country, setCountry] = useState(initialProfile?.country || 'Norway');
  const [heightCm, setHeightCm] = useState<number>(initialProfile?.heightCm || 170);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    initialProfile?.languages || ['English', 'Norwegian']
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialProfile?.interests || ['Architecture', 'Ambient Music', 'Specialty Coffee', 'Philosophy']
  );
  const [activeMode, setActiveMode] = useState<ModeType>(
    (initialProfile?.age || 23) < 18 ? 'friendship' : (initialProfile?.activeMode || 'dating')
  );
  const [bio, setBio] = useState(
    initialProfile?.bio ||
      'Looking for intentional conversations, quiet aesthetics, and mutual intellectual curiosity.'
  );
  const [lookingFor, setLookingFor] = useState(
    initialProfile?.lookingFor || 'A kindred spirit who appreciates slow discourse and shared ideas.'
  );

  // OSINT consented vectors
  const [publicGithub, setPublicGithub] = useState(initialProfile?.osintFootprint?.publicGithub || '');
  const [favoriteBooks, setFavoriteBooks] = useState<string>(
    initialProfile?.osintFootprint?.favoriteBooksAuthors?.join(', ') || 'Calvino, Juhani Pallasmaa'
  );
  const [musicAesthetics, setMusicAesthetics] = useState<string>(
    initialProfile?.osintFootprint?.musicAesthetics?.join(', ') || 'Ambient, Nils Frahm, Max Richter'
  );
  const [publicForumTopics, setPublicForumTopics] = useState<string>(
    initialProfile?.osintFootprint?.publicSubredditsOrForums?.join(', ') || 'r/architecture, r/analog'
  );

  // EXPLICIT OSINT CONSENT
  const [osintConsent, setOsintConsent] = useState(
    initialProfile?.osintFootprint?.consentGranted ?? true
  );

  const [generatingOSINT, setGeneratingOSINT] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // AGE RULES: 16–17 = Friendship only; 18+ = Friendship and Dating
  const isMinor = age < 18;
  const allowedModes: ModeType[] = isMinor ? ['friendship'] : ['friendship', 'dating'];

  // Handle Age change and auto-enforce rule
  const handleAgeChange = (newAge: number) => {
    const clamped = Math.max(16, Math.min(99, newAge || 16));
    setAge(clamped);
    if (clamped < 18 && activeMode === 'dating') {
      setActiveMode('friendship');
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length > 2) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      }
    } else {
      if (selectedInterests.length < 8) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleFinish = async () => {
    setGeneratingOSINT(true);
    let osintSummary = initialProfile?.osintFootprint?.osintSummary;

    const booksList = favoriteBooks.split(',').map((s) => s.trim()).filter(Boolean);

    let verifiedSignals: string[] = ['Consented Public Signal'];

    if (osintConsent) {
      // Verify lawful public footprint using OSINT module
      const osintReport = await verifyConsentedPublicFootprint(
        alias,
        publicGithub,
        booksList,
        selectedInterests.slice(0, 3)
      );
      verifiedSignals = osintReport.signalsFound.map((s) => `${s.sourceName} (${s.verificationStatus})`);
      if (verifiedSignals.length === 0) {
        verifiedSignals.push('Consented Public Vector');
      }

      // Synthesize public footprint with Gemini if needed
      if (!osintSummary) {
        osintSummary = await synthesizeConsentedOSINT(
          alias,
          selectedInterests,
          booksList,
          publicGithub || 'Open Research Enthusiast'
        );
      }
    } else {
      osintSummary = 'User chosen minimal footprint. Private verified member.';
    }

    const newProfile: UserProfile = {
      id: userId,
      email: userEmail,
      alias: alias.trim() || 'Anonymous Seeker',
      avatarSeed,
      age,
      isMinor,
      gender,
      country,
      heightCm,
      languages: selectedLanguages,
      interests: selectedInterests,
      activeMode: isMinor ? 'friendship' : activeMode,
      allowedModes,
      bio,
      lookingFor,
      osintFootprint: {
        publicGithub: publicGithub.trim() || undefined,
        favoriteBooksAuthors: booksList,
        musicAesthetics: musicAesthetics.split(',').map((s) => s.trim()).filter(Boolean),
        publicSubredditsOrForums: publicForumTopics.split(',').map((s) => s.trim()).filter(Boolean),
        verifiedPublicSignals: verifiedSignals,
        osintSummary,
        consentGranted: osintConsent,
      },
      hasActiveDatingConnection: initialProfile?.hasActiveDatingConnection || false,
      activeDatingConnectionId: initialProfile?.activeDatingConnectionId,
      createdAt: initialProfile?.createdAt || Date.now(),
      updatedAt: Date.now(),
      privacy: {
        hideExactAge: isMinor,
        hideExactHeight: false,
        notifyViaGmail: true,
      },
    };

    setGeneratingOSINT(false);
    onComplete(newProfile);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="bg-white max-w-2xl w-full rounded-3xl border border-[#EAE3D8] shadow-lg p-6 sm:p-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0EAE2] pb-6 mb-8">
          <RelatoLogo className="h-8" textClassName="text-2xl" />
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C8379]">
            <span className={step === 1 ? 'font-bold text-[#2B2B2B]' : ''}>1. Essentials</span>
            <span>&bull;</span>
            <span className={step === 2 ? 'font-bold text-[#2B2B2B]' : ''}>2. OSINT Vectors</span>
          </div>
        </div>

        {step === 1 ? (
          /* STEP 1: Basic Profile & Age Rule Enforcement */
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif text-[#2B2B2B]">Build Your Anonymous Presence</h2>
              <p className="text-xs text-[#7B736A] mt-1">
                Relato protects your personal identities. Choose an evocative handle and visual seed.
              </p>
            </div>

            {/* Avatar & Alias */}
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE8DF]">
              <AvatarBadge seed={avatarSeed} size="lg" />
              <div className="flex-1 space-y-2">
                <label className="block text-xs font-medium text-[#575048]">Anonymous Alias</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="e.g. Aura Echo, Kaelen Sol"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#D9D1C7] text-sm bg-white focus:outline-hidden focus:border-[#2B2B2B]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const seeds = ['aura-rose', 'sol-slate', 'vance-sage', 'echo-indigo', 'lunar-warm'];
                      const randomSeed = seeds[Math.floor(Math.random() * seeds.length)] + '-' + Math.floor(Math.random() * 100);
                      setAvatarSeed(randomSeed);
                    }}
                    className="px-3 py-2 text-xs font-mono text-[#5C554D] bg-[#EDE7DF] hover:bg-[#E2DAD0] rounded-xl cursor-pointer"
                  >
                    Randomize
                  </button>
                </div>
              </div>
            </div>

            {/* Age & Strict Rule Notification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#575048] mb-1">
                  Age (16–17 = Friendship only; 18+ = Friendship & Dating)
                </label>
                <input
                  type="number"
                  min={16}
                  max={99}
                  value={age}
                  onChange={(e) => handleAgeChange(parseInt(e.target.value) || 16)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D1C7] text-sm bg-white focus:outline-hidden focus:border-[#2B2B2B]"
                />
                <span className="text-[11px] text-[#8C8379] mt-1 block">
                  {age < 18 ? 'Age 16–17 detected: Friendship mode only' : 'Age 18+ detected: Eligible for both Friendship & Dating'}
                </span>
              </div>

              {/* Strict Two Choices: Male and Female */}
              <div>
                <label className="block text-xs font-medium text-[#575048] mb-1">Gender (Select one)</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setGender('Male')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center ${
                      gender === 'Male'
                        ? 'bg-[#2B2B2B] text-white border-[#2B2B2B] shadow-2xs'
                        : 'bg-white text-[#554E46] border-[#D9D1C7] hover:border-[#AAA]'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('Female')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center ${
                      gender === 'Female'
                        ? 'bg-[#2B2B2B] text-white border-[#2B2B2B] shadow-2xs'
                        : 'bg-white text-[#554E46] border-[#D9D1C7] hover:border-[#AAA]'
                    }`}
                  >
                    Female
                  </button>
                </div>
                <span className="text-[11px] text-[#8C8379] mt-1 block">
                  Discovery matches opposite gender automatically ({gender === 'Male' ? 'discovering Females' : 'discovering Males'}).
                </span>
              </div>
            </div>

            {/* Age Rule Visual Feedback */}
            {isMinor ? (
              <div className="p-3.5 rounded-xl bg-[#FAF0ED] border border-[#ECCDC3] flex items-start gap-3 text-xs text-[#8A4A3B]">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Safety Rule Enforced:</strong> Because your age is set to {age}, your account is restricted exclusively to <strong>Friendship</strong> mode. Dating mode is strictly locked until age 18.
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#F4F8F4] border border-[#D1E6D3] flex items-start gap-3 text-xs text-[#2F6636]">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Eligible for Both Modes:</strong> You may toggle between Friendship and Dating modes freely at any time.
                </div>
              </div>
            )}

            {/* Mode Selection */}
            <div>
              <label className="block text-xs font-medium text-[#575048] mb-2">Initial Active Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveMode('friendship')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    activeMode === 'friendship'
                      ? 'border-[#2B2B2B] bg-[#FAF8F5] ring-1 ring-[#2B2B2B]'
                      : 'border-[#E0D8CE] hover:border-[#C4BCB0]'
                  }`}
                >
                  <div className="text-xs font-semibold text-[#2B2B2B]">Friendship</div>
                  <div className="text-[11px] text-[#7C746B] mt-0.5">Explore intellectual and creative peers</div>
                </button>

                <button
                  type="button"
                  disabled={isMinor}
                  onClick={() => setActiveMode('dating')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isMinor
                      ? 'border-[#EBE4DC] bg-[#F7F4F0] opacity-50 cursor-not-allowed'
                      : activeMode === 'dating'
                      ? 'border-[#2B2B2B] bg-[#FAF8F5] ring-1 ring-[#2B2B2B] cursor-pointer'
                      : 'border-[#E0D8CE] hover:border-[#C4BCB0] cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2B2B2B]">Dating</span>
                    {isMinor && <Lock className="w-3.5 h-3.5 text-[#9C948B]" />}
                  </div>
                  <div className="text-[11px] text-[#7C746B] mt-0.5">
                    {isMinor ? 'Locked (18+ only)' : 'Intentional romantic alignment'}
                  </div>
                </button>
              </div>
            </div>

            {/* Country & Height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#575048] mb-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D1C7] text-sm bg-white focus:outline-hidden focus:border-[#2B2B2B]"
                >
                  {AVAILABLE_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#575048] mb-1">Height (cm)</label>
                <input
                  type="number"
                  min={120}
                  max={230}
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value) || 170)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D1C7] text-sm bg-white focus:outline-hidden focus:border-[#2B2B2B]"
                />
              </div>
            </div>

            {/* Bio & Looking For */}
            <div>
              <label className="block text-xs font-medium text-[#575048] mb-1">Reflective Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D1C7] text-sm bg-white focus:outline-hidden focus:border-[#2B2B2B]"
                placeholder="Share your daily rhythms, what you create, or how you think..."
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-[#2B2B2B] hover:bg-[#1A1A1A] text-white px-7 py-3 rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer"
              >
                Continue to OSINT & Interests &rarr;
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: OSINT Vectors, Consented Footprint & Interests */
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif text-[#2B2B2B]">Consented OSINT Footprint</h2>
              <p className="text-xs text-[#7B736A] mt-1">
                Relato discovers deep resonance using only publicly accessible cultural, literary, and technical vectors you explicitly consent to link.
              </p>
            </div>

            {/* Explicit Consent Banner */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4DCCE] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <strong className="text-[#2B2B2B] font-medium block mb-0.5">
                  Consent for Lawful Public Profile Evaluation
                </strong>
                <p className="text-[#655E55] mb-2 leading-relaxed">
                  I consent to Relato evaluating public indices (such as public repositories, published bibliographic references, and open interest signals) to calculate mutual resonance scores and conversational openers.
                </p>
                <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-[#2B2B2B]">
                  <input
                    type="checkbox"
                    checked={osintConsent}
                    onChange={(e) => setOsintConsent(e.target.checked)}
                    className="accent-[#2B2B2B] w-4 h-4 rounded"
                  />
                  <span>I authorize lawful public vector verification for my profile</span>
                </label>
              </div>
            </div>

            {/* Selected Interests */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#575048]">
                  Select 3 to 8 Resonant Interests
                </label>
                <span className="text-[11px] font-mono text-[#8C8379]">
                  {selectedInterests.length}/8 chosen
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_INTERESTS.map((interest) => {
                  const active = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#2B2B2B] border-[#2B2B2B] text-white font-medium shadow-2xs'
                          : 'bg-white border-[#DFD7CD] text-[#554E46] hover:border-[#B5ADA1]'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-xs font-medium text-[#575048] mb-2">Languages Spoken</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const active = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`text-xs px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#EFEAE2] border-[#2B2B2B] text-[#2B2B2B] font-medium'
                          : 'bg-white border-[#E2DBD2] text-[#696159]'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Public Literature & Authors */}
            <div>
              <label className="block text-xs font-medium text-[#575048] mb-1">
                Authors, Books, or Philosophy You Revisit
              </label>
              <input
                type="text"
                value={favoriteBooks}
                onChange={(e) => setFavoriteBooks(e.target.value)}
                placeholder="e.g. Italo Calvino, Ursula K. Le Guin, Juhani Pallasmaa"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D1C7] text-sm bg-white focus:outline-hidden focus:border-[#2B2B2B]"
              />
            </div>

            {/* Musical Aesthetics */}
            <div>
              <label className="block text-xs font-medium text-[#575048] mb-1">
                Music Aesthetics & Artists
              </label>
              <input
                type="text"
                value={musicAesthetics}
                onChange={(e) => setMusicAesthetics(e.target.value)}
                placeholder="e.g. Ambient, Ryuichi Sakamoto, Floating Points"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D1C7] text-sm bg-white focus:outline-hidden focus:border-[#2B2B2B]"
              />
            </div>

            {/* Optional Public Technical / Creative Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#575048] mb-1">
                  Public GitHub / Open Project Handle <span className="text-[#999]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={publicGithub}
                  onChange={(e) => setPublicGithub(e.target.value)}
                  placeholder="e.g. user-protocols"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D1C7] text-sm bg-white focus:outline-hidden focus:border-[#2B2B2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#575048] mb-1">
                  Public Forums & Subreddits <span className="text-[#999]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={publicForumTopics}
                  onChange={(e) => setPublicForumTopics(e.target.value)}
                  placeholder="e.g. r/architecture, r/analog, r/rust"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D1C7] text-sm bg-white focus:outline-hidden focus:border-[#2B2B2B]"
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-[#F0EAE2]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-full text-xs font-medium text-[#655E55] hover:bg-[#F2EDE7] transition-colors cursor-pointer"
              >
                &larr; Back to Essentials
              </button>

              <button
                type="button"
                disabled={generatingOSINT}
                onClick={handleFinish}
                className="flex items-center gap-2 bg-[#2B2B2B] hover:bg-[#1A1A1A] text-white px-8 py-3 rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E8C2B9]" />
                <span>{generatingOSINT ? 'Synthesizing with Gemini...' : 'Complete Profile & Enter Relato'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
