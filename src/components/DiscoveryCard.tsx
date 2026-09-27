import { useState } from 'react';
import { UserProfile, ModeType } from '../types';
import { AvatarBadge } from '../components/AvatarBadge';
import { OSINTAnalysisResult } from '../lib/gemini';
import {
  Sparkles,
  Users,
  Heart,
  Globe,
  Lock,
  Send,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Music,
  Terminal,
  MessageCircle,
  Flag,
  Ban,
  CheckCircle2,
  Info
} from 'lucide-react';

interface DiscoveryCardProps {
  candidate: UserProfile;
  currentUser: UserProfile;
  compatibility: OSINTAnalysisResult;
  onSendRequest: (candidate: UserProfile, type: 'friend' | 'chat', note?: string) => void;
  onViewCandidateProfile: (candidate: UserProfile) => void;
  onBlockUser: (candidate: UserProfile) => void;
  onReportUser: (candidate: UserProfile) => void;
  isPendingRequest: boolean;
  hasDatingLock: boolean; // Current user already has an active dating connection
}

export function DiscoveryCard({
  candidate,
  currentUser,
  compatibility,
  onSendRequest,
  onViewCandidateProfile,
  onBlockUser,
  onReportUser,
  isPendingRequest,
  hasDatingLock,
}: DiscoveryCardProps) {
  const [expandedOSINT, setExpandedOSINT] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [requestType, setRequestType] = useState<'friend' | 'chat'>('friend');
  const [introNote, setIntroNote] = useState('');
  const [hasConsented, setHasConsented] = useState(false);

  const isDatingMode = currentUser.activeMode === 'dating';
  const sharedInterests = candidate.interests.filter((i) => currentUser.interests.includes(i));
  const isMinor = currentUser.age < 18 || candidate.age < 18;

  const handleOpenRequest = (type: 'friend' | 'chat') => {
    setRequestType(type);
    setIntroNote('');
    setHasConsented(false);
    setShowNoteModal(true);
  };

  const handleConfirmSend = () => {
    if (!hasConsented) return;
    setShowNoteModal(false);
    onSendRequest(candidate, requestType, introNote.trim() || undefined);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EBE4DC] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
      
      {/* Top Banner: Score & Verification */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F2] border border-[#EADBD4] text-xs font-mono font-medium text-[#4A3B37]">
          <Sparkles className="w-3.5 h-3.5 text-[#C68B7D]" />
          <span>OSINT Resonance: {compatibility.compatibilityScore}%</span>
          <span className="text-[#888]">&bull; {compatibility.matchGrade}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#7F776E]">
          {candidate.isOnline ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
              Active
            </span>
          ) : (
            <span className="text-[11px] font-mono text-[#9C948B]">Recent Signal</span>
          )}
        </div>
      </div>

      {/* Main Profile Header */}
      <div className="flex items-start gap-4 mb-4">
        <button
          onClick={() => onViewCandidateProfile(candidate)}
          className="cursor-pointer group-hover:scale-102 transition-transform"
        >
          <AvatarBadge seed={candidate.avatarSeed} size="lg" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              onClick={() => onViewCandidateProfile(candidate)}
              className="text-lg font-serif font-semibold text-[#2B2B2B] hover:text-[#555] cursor-pointer truncate"
            >
              {candidate.alias}
            </h3>
            {candidate.osintFootprint?.verifiedPublicSignals && (
              <span title="Verified public cryptographic or academic signals">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </span>
            )}
          </div>

          <p className="text-xs text-[#7A7269] mt-0.5">
            {candidate.age} yrs &bull; {candidate.gender} &bull; {candidate.country}
            {candidate.heightCm && !candidate.privacy.hideExactHeight ? ` &bull; ${candidate.heightCm} cm` : ''}
          </p>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 rounded-md text-[10px] uppercase font-mono font-medium bg-[#F2EDE7] text-[#696159]">
            {candidate.activeMode === 'dating' ? (
              <>
                <Heart className="w-2.5 h-2.5 text-[#C68B7D]" />
                <span>Seeking Dating</span>
              </>
            ) : (
              <>
                <Users className="w-2.5 h-2.5 text-[#696159]" />
                <span>Seeking Friendship</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bio / Quote */}
      <blockquote className="text-xs italic text-[#59524A] bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EDE7DF] mb-4 leading-relaxed line-clamp-3">
        "{candidate.bio}"
      </blockquote>

      {/* Gemini AI Synthesis highlight */}
      <div className="mb-4 p-3 rounded-xl bg-[#FAF8F5]/80 border border-[#E9E2D8] text-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8C8379] uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3 text-[#C68B7D]" />
          <span>Gemini Compatibility Synthesis</span>
        </div>
        <p className="text-xs text-[#4F4840] leading-relaxed">
          {compatibility.deepAnalysis}
        </p>
      </div>

      {/* Shared Interests */}
      <div className="mb-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[#8A8177] mb-1.5">
          Shared Intersections ({sharedInterests.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {candidate.interests.slice(0, 5).map((interest) => {
            const isShared = currentUser.interests.includes(interest);
            return (
              <span
                key={interest}
                className={`text-[11px] px-2 py-0.5 rounded-md font-mono transition-colors ${
                  isShared
                    ? 'bg-[#2B2B2B] text-white font-medium shadow-2xs'
                    : 'bg-[#EFEAE2] text-[#554E46]'
                }`}
              >
                {interest} {isShared && '✓'}
              </span>
            );
          })}
        </div>
      </div>

      {/* OSINT Footprint Accordion Toggle */}
      <div className="border-t border-[#EFEAE2] pt-3 mb-4">
        <button
          onClick={() => setExpandedOSINT(!expandedOSINT)}
          className="w-full flex items-center justify-between text-xs text-[#6B635A] hover:text-[#2B2B2B] font-mono cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#9C948B]" />
            Consented Public OSINT Vectors
          </span>
          {expandedOSINT ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expandedOSINT && (
          <div className="mt-3 space-y-2.5 text-xs text-[#524B43] bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE3DA]">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#EAE3DA]">
              <span className="text-[10px] font-mono text-[#8C8379] uppercase">Data Provenance</span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                Lawful Public Sources Only
              </span>
            </div>

            {candidate.osintFootprint?.osintSummary && (
              <div>
                <span className="font-semibold text-[#2B2B2B] block text-[11px] font-mono mb-0.5">
                  OSINT Briefing:
                </span>
                <p className="text-xs text-[#554F47]">{candidate.osintFootprint.osintSummary}</p>
              </div>
            )}

            {candidate.osintFootprint?.publicGithub && (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-[#8C8379] shrink-0" />
                  <span className="font-mono text-[11px] text-[#2B2B2B]">Open Source:</span>
                  <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#DDD5CB] text-[#333]">
                    @{candidate.osintFootprint.publicGithub}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                  Verified Public
                </span>
              </div>
            )}

            {candidate.osintFootprint?.favoriteBooksAuthors && candidate.osintFootprint.favoriteBooksAuthors.length > 0 && (
              <div className="pt-1">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#8C8379] shrink-0" />
                    <span className="font-mono text-[11px] font-medium text-[#2B2B2B]">Literature & Indices:</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#7D756C] bg-white px-1.5 py-0.2 rounded border border-[#DDD5CB]">
                    Bibliographic Corpus
                  </span>
                </div>
                <span className="text-[#655D54] block pl-5">{candidate.osintFootprint.favoriteBooksAuthors.join(', ')}</span>
              </div>
            )}

            {candidate.osintFootprint?.musicAesthetics && candidate.osintFootprint.musicAesthetics.length > 0 && (
              <div className="pt-1">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#8C8379] shrink-0" />
                    <span className="font-mono text-[11px] font-medium text-[#2B2B2B]">Music Aesthetics:</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#7D756C] bg-white px-1.5 py-0.2 rounded border border-[#DDD5CB]">
                    Self-Declared Signal
                  </span>
                </div>
                <span className="text-[#655D54] block pl-5">{candidate.osintFootprint.musicAesthetics.join(', ')}</span>
              </div>
            )}

            {/* Suggested conversation opener */}
            {compatibility.suggestedConversationStarters?.[0] && (
              <div className="mt-2 pt-2 border-t border-[#E8E1D7] text-[11px] italic text-[#635C53]">
                <strong className="not-italic font-mono text-[#8C8379] block mb-0.5">Gemini Conversation Spark:</strong>
                "{compatibility.suggestedConversationStarters[0]}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons: Request Friend vs Request Chat */}
      <div className="pt-2 flex flex-col gap-2">
        {isPendingRequest ? (
          <div className="w-full text-center py-2.5 px-3 rounded-xl bg-[#F0EAE1] text-xs font-mono text-[#6E675E] border border-[#DDD5CB]">
            Request Pending Mutual Acceptance
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {/* Button 1: Request Friend */}
            <button
              onClick={() => handleOpenRequest('friend')}
              className="flex items-center justify-center gap-1.5 bg-[#EDE7DF] hover:bg-[#E2DAD0] text-[#2B2B2B] text-xs font-medium py-2.5 px-3 rounded-xl transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-[#5C554D]" />
              <span>Request Friend</span>
            </button>

            {/* Button 2: Request Chat (Dating mode or direct conversational invitation) */}
            {isMinor ? (
              <button
                disabled
                title="Dating is disabled for users aged 16-17"
                className="flex items-center justify-center gap-1 bg-[#F4EFEB] text-[#9E968D] text-xs font-medium py-2.5 px-3 rounded-xl cursor-not-allowed opacity-60"
              >
                <Lock className="w-3 h-3" />
                <span>Friend Only</span>
              </button>
            ) : hasDatingLock ? (
              <button
                disabled
                title="You have an active dating connection. On Relato, you cannot send another dating request until your current connection ends."
                className="flex items-center justify-center gap-1 bg-[#F4EFEB] text-[#9E968D] text-xs font-medium py-2.5 px-3 rounded-xl cursor-not-allowed opacity-70"
              >
                <Lock className="w-3 h-3 text-[#B08D85]" />
                <span title="Dating Locked">Single Partner Lock</span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenRequest('chat')}
                className="flex items-center justify-center gap-1.5 bg-[#2B2B2B] hover:bg-[#1A1A1A] text-white text-xs font-medium py-2.5 px-3 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-[#E8C2B9]" />
                <span>Request Chat</span>
              </button>
            )}
          </div>
        )}

        {/* Safety & Moderation triggers */}
        <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-[#9C948B]">
          <button
            onClick={() => onViewCandidateProfile(candidate)}
            className="hover:text-[#2B2B2B] transition-colors cursor-pointer"
          >
            Inspect Full Profile
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onReportUser(candidate)}
              className="hover:text-red-700 transition-colors cursor-pointer"
              title="Report Profile"
            >
              <Flag className="w-3 h-3" />
            </button>
            <button
              onClick={() => onBlockUser(candidate)}
              className="hover:text-red-700 transition-colors cursor-pointer"
              title="Block Profile"
            >
              <Ban className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Note / Intro Modal before sending request */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#EAE3DA] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <AvatarBadge seed={candidate.avatarSeed} size="md" />
              <div>
                <h4 className="text-base font-medium text-[#2B2B2B]">
                  Send {requestType === 'friend' ? 'Friend Request' : 'Chat & Dating Request'}
                </h4>
                <p className="text-xs text-[#7B736B]">
                  To <span className="font-semibold">{candidate.alias}</span> &bull; Mutual acceptance required
                </p>
              </div>
            </div>

            {requestType === 'chat' && (
              <div className="mb-4 p-3 rounded-xl bg-[#FAF0ED] border border-[#ECCDC3] text-xs text-[#8A4A3B]">
                <strong className="block font-semibold mb-0.5">Dating Rule Notice:</strong>
                If {candidate.alias} accepts your chat request, your Dating status will lock to this single connection until either party ends the match.
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-medium text-[#554E46] mb-1">
                Optional Resonant Note / Question
              </label>
              <textarea
                rows={3}
                value={introNote}
                onChange={(e) => setIntroNote(e.target.value)}
                placeholder={`e.g. "${compatibility.suggestedConversationStarters?.[0] || 'I resonated with your note on architecture...'}"`}
                className="w-full p-3 rounded-xl border border-[#D9D1C7] text-xs text-[#2B2B2B] bg-[#FAF8F5] focus:outline-hidden focus:border-[#2B2B2B]"
              />
            </div>

            {/* Direct Contact Mutual Consent Gate */}
            <div className="mb-5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9]">
              <label className="flex items-start gap-2.5 cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                  className="mt-0.5 rounded border-[#C8C0B5] text-[#2B2B2B] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[11px] text-[#5A534B] leading-tight select-none">
                  <strong>Consent to Direct Contact Terms:</strong> I acknowledge that private messaging requires explicit recipient acceptance. I will not attempt unconsented out-of-band communication or harassment.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#655D54] hover:bg-[#F2ECE5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!hasConsented}
                onClick={handleConfirmSend}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-medium shadow-xs transition-all ${
                  hasConsented
                    ? 'bg-[#2B2B2B] hover:bg-[#111] text-white cursor-pointer'
                    : 'bg-[#DDD5CB] text-[#8C847B] cursor-not-allowed opacity-70'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Request</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
