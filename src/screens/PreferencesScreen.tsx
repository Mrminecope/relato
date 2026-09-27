import { useState } from 'react';
import { UserPreferences, ModeType, GenderType, UserProfile } from '../types';
import { AVAILABLE_INTERESTS, AVAILABLE_COUNTRIES, AVAILABLE_LANGUAGES } from '../data/mockProfiles';
import { SlidersHorizontal, Save, RotateCcw, ShieldCheck, Lock } from 'lucide-react';

interface PreferencesScreenProps {
  currentUser: UserProfile;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
}

export function PreferencesScreen({ currentUser, preferences, onSavePreferences }: PreferencesScreenProps) {
  const isMinor = currentUser.age < 18;

  const [ageMin, setAgeMin] = useState(isMinor ? 16 : Math.max(18, preferences.ageMin || 18));
  const [ageMax, setAgeMax] = useState(isMinor ? 17 : Math.max(18, preferences.ageMax || 35));
  const [selectedModes, setSelectedModes] = useState<ModeType[]>(
    isMinor ? ['friendship'] : preferences.modes
  );
  
  // Opposite gender discovery target
  const targetGender: GenderType = currentUser.gender === 'Male' ? 'Female' : 'Male';

  const [selectedCountries, setSelectedCountries] = useState<string[]>(preferences.countries);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(preferences.languages);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(preferences.interests);
  const [minScore, setMinScore] = useState(preferences.minCompatibilityScore || 70);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleMode = (mode: ModeType) => {
    if (isMinor && mode === 'dating') return; // Strict age boundary
    if (selectedModes.includes(mode)) {
      if (selectedModes.length > 1) {
        setSelectedModes(selectedModes.filter((m) => m !== mode));
      }
    } else {
      setSelectedModes([...selectedModes, mode]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== country));
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const handleSave = () => {
    const updated: UserPreferences = {
      ageMin: isMinor ? 16 : Math.max(18, ageMin),
      ageMax: isMinor ? 17 : Math.max(18, ageMax),
      modes: isMinor ? ['friendship'] : selectedModes,
      preferredGenders: [targetGender],
      countries: selectedCountries,
      languages: selectedLanguages,
      interests: selectedInterests,
      minCompatibilityScore: minScore,
    };
    onSavePreferences(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#EBE4DC] mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8A8177]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Discovery Radar Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#292929] mt-1">
            Matching & Affinity Preferences
          </h1>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#2B2B2B] hover:bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{savedSuccess ? 'Saved Preferences!' : 'Save Criteria'}</span>
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Gender Matching Rule Notification */}
        <section className="bg-white rounded-2xl border border-[#EBE4DC] p-6 shadow-2xs">
          <h2 className="text-base font-medium text-[#2B2B2B] mb-1">Target Matching Gender</h2>
          <p className="text-xs text-[#7B736B] mb-3">
            In Relato, gender discovery automatically pairs complementary opposites.
          </p>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] flex items-center justify-between">
            <span className="text-xs text-[#554E46]">
              Your Profile: <strong className="text-[#2B2B2B]">{currentUser.gender}</strong> &bull; Radar set to search: <strong className="text-[#2B2B2B]">{targetGender}</strong>
            </span>
            <span className="text-[11px] font-mono bg-[#EFEAE2] text-[#47413B] px-2.5 py-1 rounded-md">
              Target: {targetGender} Only
            </span>
          </div>
        </section>

        {/* Discovery Modes */}
        <section className="bg-white rounded-2xl border border-[#EBE4DC] p-6 shadow-2xs">
          <h2 className="text-base font-medium text-[#2B2B2B] mb-1">Target Connection Modes</h2>
          <p className="text-xs text-[#7B736B] mb-4">
            Filter potential matches based on whether they are seeking Friendship or Dating.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => toggleMode('friendship')}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                selectedModes.includes('friendship')
                  ? 'border-[#2B2B2B] bg-[#FAF8F5] ring-1 ring-[#2B2B2B]'
                  : 'border-[#DFD7CE] hover:border-[#B5ADA1]'
              }`}
            >
              <div className="text-sm font-semibold text-[#2B2B2B]">Friendship Discovery</div>
              <div className="text-xs text-[#6F675F] mt-1">
                Collaborative makers, readers, and philosophical interlocutors.
              </div>
            </button>

            <button
              type="button"
              disabled={isMinor}
              onClick={() => toggleMode('dating')}
              className={`p-4 rounded-xl border text-left transition-all ${
                isMinor
                  ? 'border-[#ECE5DC] bg-[#F7F4F0] opacity-50 cursor-not-allowed'
                  : selectedModes.includes('dating')
                  ? 'border-[#2B2B2B] bg-[#FAF8F5] ring-1 ring-[#2B2B2B] cursor-pointer'
                  : 'border-[#DFD7CE] hover:border-[#B5ADA1] cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#2B2B2B]">Dating Discovery</span>
                {isMinor && <Lock className="w-3.5 h-3.5 text-[#9C948B]" />}
              </div>
              <div className="text-xs text-[#6F675F] mt-1">
                {isMinor
                  ? 'Requires age 18+. Disabled for safety protocols.'
                  : 'Intentional romantic alignment (single active connection lock applied).'}
              </div>
            </button>
          </div>
        </section>

        {/* Age Range Slider */}
        <section className="bg-white rounded-2xl border border-[#EBE4DC] p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-medium text-[#2B2B2B]">Target Age Span</h2>
              <p className="text-xs text-[#7B736B]">
                Discover profiles within your preferred generational bracket.
              </p>
            </div>
            <div className="text-sm font-mono font-semibold text-[#2B2B2B] bg-[#FAF8F5] px-3 py-1 rounded-lg border border-[#E5DED5]">
              {ageMin} &ndash; {ageMax} yrs
            </div>
          </div>

          {isMinor ? (
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] text-xs text-[#6F675F]">
              <strong className="text-[#2B2B2B] block mb-0.5">Underage Safety Protocol:</strong>
              Users aged 16–17 are strictly limited to connecting with peers in the 16–17 age span in Friendship mode. Adult connections are locked out.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#8C8379] mb-1">Minimum Age ({ageMin})</label>
                <input
                  type="range"
                  min={18}
                  max={60}
                  value={ageMin}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val <= ageMax) setAgeMin(val);
                  }}
                  className="w-full accent-[#2B2B2B] cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#8C8379] mb-1">Maximum Age ({ageMax})</label>
                <input
                  type="range"
                  min={18}
                  max={75}
                  value={ageMax}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= ageMin) setAgeMax(val);
                  }}
                  className="w-full accent-[#2B2B2B] cursor-pointer"
                />
              </div>
            </div>
          )}
        </section>

        {/* Minimum Gemini Compatibility Score */}
        <section className="bg-white rounded-2xl border border-[#EBE4DC] p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-medium text-[#2B2B2B]">Minimum Resonance Threshold</h2>
              <p className="text-xs text-[#7B736B]">
                Only highlight candidate profiles evaluated by Gemini with at least this score.
              </p>
            </div>
            <div className="text-sm font-mono font-semibold text-[#2B2B2B] bg-[#FAF8F5] px-3 py-1 rounded-lg border border-[#E5DED5]">
              {minScore}%+
            </div>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            step={5}
            value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value))}
            className="w-full accent-[#2B2B2B] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-[#999] mt-2">
            <span>50% (Open / Eclectic)</span>
            <span>75% (Harmonic)</span>
            <span>90% (Deep Resonance Only)</span>
          </div>
        </section>

        {/* Countries & Geography Filter */}
        <section className="bg-white rounded-2xl border border-[#EBE4DC] p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-medium text-[#2B2B2B]">Geographic Regions (Countries)</h2>
            <button
              onClick={() => setSelectedCountries([])}
              className="text-xs text-[#8A8177] hover:text-[#2B2B2B] underline cursor-pointer"
            >
              Clear filter (All countries)
            </button>
          </div>
          <p className="text-xs text-[#7B736B] mb-4">
            {selectedCountries.length === 0
              ? 'Currently searching candidates across all global countries.'
              : `Restricted to candidates residing in: ${selectedCountries.join(', ')}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_COUNTRIES.map((country) => {
              const active = selectedCountries.includes(country);
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => toggleCountry(country)}
                  className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#2B2B2B] text-white border-[#2B2B2B] font-medium shadow-2xs'
                      : 'bg-white border-[#DFD7CD] text-[#554E46] hover:border-[#B5ADA1]'
                  }`}
                >
                  {country} {active && '✓'}
                </button>
              );
            })}
          </div>
        </section>

        {/* Interests Filtering */}
        <section className="bg-white rounded-2xl border border-[#EBE4DC] p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-medium text-[#2B2B2B]">Priority Topics & Aesthetics</h2>
            <button
              onClick={() => setSelectedInterests([])}
              className="text-xs text-[#8A8177] hover:text-[#2B2B2B] underline cursor-pointer"
            >
              Reset filter
            </button>
          </div>
          <p className="text-xs text-[#7B736B] mb-4">
            Highlight profiles that publish verified signals in these domains.
          </p>
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
        </section>

      </div>
    </div>
  );
}
