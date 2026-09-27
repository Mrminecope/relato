import { useState, useMemo } from 'react';
import { UserProfile, UserPreferences, ConnectionRequest } from '../types';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { OSINTAnalysisResult } from '../lib/gemini';
import { Search, SlidersHorizontal, RefreshCw, Sparkles, Filter, ShieldCheck, Heart, Users, MapPin, Loader2, AlertCircle } from 'lucide-react';

interface DiscoverScreenProps {
  currentUser: UserProfile;
  preferences: UserPreferences;
  allCandidates: UserProfile[];
  sentRequests: ConnectionRequest[];
  onSendRequest: (candidate: UserProfile, type: 'friend' | 'chat', note?: string) => void;
  onViewCandidateProfile: (candidate: UserProfile) => void;
  onBlockUser: (candidate: UserProfile) => void;
  onReportUser: (candidate: UserProfile) => void;
  onOpenPreferences: () => void;
  compatibilityMap: Record<string, OSINTAnalysisResult>;
  onRefreshDiscovery: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function DiscoverScreen({
  currentUser,
  preferences,
  allCandidates,
  sentRequests,
  onSendRequest,
  onViewCandidateProfile,
  onBlockUser,
  onReportUser,
  onOpenPreferences,
  compatibilityMap,
  onRefreshDiscovery,
  isLoading = false,
  error = null,
}: DiscoverScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'friendship' | 'dating'>('all');
  const [sortBy, setSortBy] = useState<'resonance' | 'recent' | 'age'>('resonance');

  // Opposite gender target rule: Male searches Female, Female searches Male
  const requiredTargetGender = currentUser.gender === 'Male' ? 'Female' : 'Male';

  // Filter candidates according to user preferences, active mode, strict gender, and country
  const filteredCandidates = useMemo(() => {
    return allCandidates.filter((candidate) => {
      // 1. Don't show self
      if (candidate.id === currentUser.id) return false;

      // 2. Strict Gender Rule: Opposite gender discovery
      if (candidate.gender !== requiredTargetGender) {
        return false;
      }

      // 3. Strict Age boundaries:
      // Candidate age must be within user preferences
      if (candidate.age < preferences.ageMin || candidate.age > preferences.ageMax) {
        return false;
      }

      // 4. Strict Age separation rule: Prevent adult/minor connections
      if (currentUser.age < 18 && candidate.age >= 18) return false;
      if (currentUser.age >= 18 && candidate.age < 18) return false;

      // 5. Age rule: If current user is minor (16-17), they can ONLY see and request Friendship
      if (currentUser.age < 18) {
        if (candidate.activeMode === 'dating') return false;
      }

      // 6. If candidate is 16-17, candidate can ONLY be in friendship mode
      if (candidate.age < 18 && candidate.activeMode === 'dating') {
        return false;
      }

      // 6. Filter by connection mode button
      if (filterMode !== 'all' && candidate.activeMode !== filterMode) {
        return false;
      }

      // 7. Country preference filter: strict filtering when user has selected countries
      if (preferences.countries && preferences.countries.length > 0) {
        if (!preferences.countries.includes(candidate.country)) {
          return false;
        }
      }

      // 8. Compatibility Score threshold
      const score = compatibilityMap[candidate.id]?.compatibilityScore;
      if (score === undefined) return false;
      if (preferences.minCompatibilityScore && score < preferences.minCompatibilityScore) {
        return false;
      }

      // 9. Keyword search query across alias, interests, bio, or OSINT keywords
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAlias = candidate.alias.toLowerCase().includes(q);
        const matchesBio = candidate.bio.toLowerCase().includes(q);
        const matchesInterest = candidate.interests.some((i) => i.toLowerCase().includes(q));
        const matchesCountry = candidate.country.toLowerCase().includes(q);
        const matchesOSINT = candidate.osintFootprint?.favoriteBooksAuthors?.some((b) =>
          b.toLowerCase().includes(q)
        );
        if (!matchesAlias && !matchesBio && !matchesInterest && !matchesCountry && !matchesOSINT) {
          return false;
        }
      }

      return true;
    });
  }, [allCandidates, currentUser, preferences, filterMode, searchQuery, requiredTargetGender, compatibilityMap]);

  // Sort candidates
  const sortedCandidates = useMemo(() => {
    return [...filteredCandidates].sort((a, b) => {
      if (sortBy === 'resonance') {
        const scoreA = compatibilityMap[a.id]?.compatibilityScore ?? -1;
        const scoreB = compatibilityMap[b.id]?.compatibilityScore ?? -1;
        return scoreB - scoreA;
      }
      if (sortBy === 'age') {
        return a.age - b.age;
      }
      return b.updatedAt - a.updatedAt;
    });
  }, [filteredCandidates, sortBy, compatibilityMap]);

  const hasDatingLock = currentUser.activeMode === 'dating' && !!currentUser.hasActiveDatingConnection;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Search & Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8A8177]">
            <Sparkles className="w-3.5 h-3.5 text-[#C68B7D]" />
            <span>OSINT Discovery Feed &bull; Mode: {currentUser.activeMode.toUpperCase()} &bull; Target: {requiredTargetGender}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#2B2B2B] mt-1">
            Resonant Connections Nearby & Abroad
          </h1>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshDiscovery}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DDD5CB] text-xs font-medium text-[#5E564E] hover:text-[#2B2B2B] hover:bg-[#FAF8F5] transition-colors cursor-pointer shadow-2xs"
            title="Recalculate Gemini compatibility and discover fresh profiles"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate Feed</span>
          </button>

          <button
            onClick={onOpenPreferences}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2B2B2B] text-white text-xs font-medium hover:bg-[#1A1A1A] transition-colors cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* Dating Lock Alert (if applicable) */}
      {hasDatingLock && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FAF0ED] border border-[#E9CEC4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-[#C68B7D] shrink-0" />
            <div className="text-xs text-[#7A3F33]">
              <strong className="font-semibold block text-sm">Active Dating Connection in Progress</strong>
              You are currently engaged in a mutual dating match. In alignment with Relato's intentional connection ethics, you cannot send new dating chat requests until this connection is closed.
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Criteria Summary Bar */}
      <div className="mb-6 px-4 py-2.5 bg-[#FAF8F5] border border-[#ECE5DC] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#6F675F]">
        <div className="flex items-center gap-3">
          <span>Gender Search: <strong className="text-[#2B2B2B]">{requiredTargetGender}</strong></span>
          <span>&bull;</span>
          <span>Age: <strong className="text-[#2B2B2B]">{preferences.ageMin}–{preferences.ageMax} yrs</strong></span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#8C8379]" />
            Countries: <strong className="text-[#2B2B2B]">{preferences.countries.length > 0 ? preferences.countries.join(', ') : 'All Global'}</strong>
          </span>
        </div>
        <button
          onClick={onOpenPreferences}
          className="text-[#2B2B2B] underline decoration-[#CCC4BA] hover:text-black cursor-pointer font-medium"
        >
          Modify Filters
        </button>
      </div>

      {/* Filters & Search Inputs */}
      <div className="bg-white rounded-2xl border border-[#EBE4DC] p-4 sm:p-5 mb-8 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#9C948B] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by aesthetic, author, interest (e.g. Calvino, Ambient, Architecture)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#DDD5CB] text-xs bg-[#FAF8F5] text-[#2B2B2B] focus:outline-hidden focus:border-[#2B2B2B]"
            />
          </div>

          {/* Mode Pill Filter */}
          <div className="flex items-center gap-1 bg-[#F2EDE7] p-1 rounded-xl w-full sm:w-auto shrink-0">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-[#2B2B2B] shadow-2xs'
                  : 'text-[#6F675E] hover:text-[#2B2B2B]'
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setFilterMode('friendship')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterMode === 'friendship'
                  ? 'bg-white text-[#2B2B2B] shadow-2xs'
                  : 'text-[#6F675E] hover:text-[#2B2B2B]'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Friends</span>
            </button>
            {currentUser.age >= 18 && (
              <button
                onClick={() => setFilterMode('dating')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filterMode === 'dating'
                    ? 'bg-white text-[#2B2B2B] shadow-2xs'
                    : 'text-[#6F675E] hover:text-[#2B2B2B]'
                }`}
              >
                <Heart className="w-3 h-3 text-[#C68B7D]" />
                <span>Dating</span>
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-[#DDD5CB] text-xs bg-[#FAF8F5] text-[#554E46] focus:outline-hidden cursor-pointer w-full sm:w-auto"
          >
            <option value="resonance">Sort: Highest Resonance</option>
            <option value="recent">Sort: Recently Active</option>
            <option value="age">Sort: Age Ascending</option>
          </select>
        </div>

        {/* Quick Interest Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-mono text-[#999] shrink-0">Tags:</span>
          {['Ambient Music', 'Architecture', 'Typography', 'Open Source', 'Philosophy', 'Astronomy'].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(searchQuery === tag ? '' : tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono shrink-0 transition-colors cursor-pointer ${
                  searchQuery === tag
                    ? 'bg-[#2B2B2B] text-white'
                    : 'bg-[#F2EDE7] text-[#5C554D] hover:bg-[#EAE3DA]'
                }`}
              >
                {tag}
              </button>
            )
          )}
        </div>
      </div>

      {/* Candidates Grid & States */}
      {isLoading ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-[#EAE3DA] p-8 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2B2B2B] mb-3" />
          <h3 className="text-base font-serif text-[#2B2B2B]">Synchronizing Public Registry Profiles</h3>
          <p className="text-xs text-[#8A8177] mt-1 font-mono">Evaluating lawful OSINT signals in Firestore</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-red-200 p-8 flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
          <h3 className="text-base font-serif text-[#2B2B2B]">Connection Notice</h3>
          <p className="text-xs text-[#8A8177] mt-1 max-w-sm">{error}</p>
          <button
            onClick={onRefreshDiscovery}
            className="mt-4 px-4 py-2 bg-[#2B2B2B] text-white text-xs font-medium rounded-xl cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : allCandidates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE3DA] p-8">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#DDD5CB] flex items-center justify-center mx-auto mb-4 text-[#7A7269]">
            <Users className="w-5 h-5 text-[#8A8177]" />
          </div>
          <h3 className="text-lg font-serif text-[#2B2B2B]">No Registered Members Yet</h3>
          <p className="text-xs text-[#7B736B] max-w-md mx-auto mt-2 leading-relaxed">
            Relato operates strictly with authentic registered profiles. As more members publish their public footprints, compatible profiles will appear here automatically.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={onOpenPreferences}
              className="px-5 py-2.5 rounded-full bg-[#EDE7DF] hover:bg-[#E2DAD0] text-xs font-medium text-[#2B2B2B] cursor-pointer"
            >
              Review Preferences
            </button>
            <button
              onClick={onRefreshDiscovery}
              className="px-5 py-2.5 rounded-full bg-[#2B2B2B] hover:bg-[#111] text-white text-xs font-medium cursor-pointer"
            >
              Refresh Registry
            </button>
          </div>
        </div>
      ) : sortedCandidates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE3DA] p-8">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#DDD5CB] flex items-center justify-center mx-auto mb-4 text-[#7A7269]">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-serif text-[#2B2B2B]">No Matching Profiles Found</h3>
          <p className="text-xs text-[#7B736B] max-w-md mx-auto mt-2 leading-relaxed">
            Searching for <strong>{requiredTargetGender}</strong> profiles ({preferences.ageMin}–{preferences.ageMax} yrs) in {preferences.countries.length > 0 ? preferences.countries.join(', ') : 'all countries'}. Try expanding your age bracket or geographic filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterMode('all');
            }}
            className="mt-5 px-5 py-2 rounded-full bg-[#EDE7DF] hover:bg-[#E2DAD0] text-xs font-medium text-[#2B2B2B] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCandidates.map((candidate) => {
            const compat = compatibilityMap[candidate.id];
            if (!compat) return null;

            const isPending = sentRequests.some(
              (r) => r.toUserId === candidate.id && r.status === 'pending'
            );

            return (
              <DiscoveryCard
                key={candidate.id}
                candidate={candidate}
                currentUser={currentUser}
                compatibility={compat}
                onSendRequest={onSendRequest}
                onViewCandidateProfile={onViewCandidateProfile}
                onBlockUser={onBlockUser}
                onReportUser={onReportUser}
                isPendingRequest={isPending}
                hasDatingLock={hasDatingLock}
              />
            );
          })}
        </div>
      )}

    </div>
  );
}
