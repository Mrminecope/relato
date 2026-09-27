import { useState } from 'react';
import { UserProfile, ModeType } from '../types';
import { AvatarBadge } from '../components/AvatarBadge';
import { OSINTAnalysisResult } from '../lib/gemini';
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Globe,
  Heart,
  Users,
  BookOpen,
  Music,
  Terminal,
  ExternalLink,
  MessageCircle,
  Flag,
  Ban,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface ProfileViewModalProps {
  candidate: UserProfile;
  currentUser: UserProfile;
  compatibility?: OSINTAnalysisResult;
  onClose: () => void;
  onSendRequest: (candidate: UserProfile, type: 'friend' | 'chat', note?: string) => void;
  onBlockUser: (candidate: UserProfile) => void;
  onReportUser: (candidate: UserProfile) => void;
  isPendingRequest: boolean;
  hasDatingLock: boolean;
}

export function ProfileViewModal({
  candidate,
  currentUser,
  compatibility,
  onClose,
  onSendRequest,
  onBlockUser,
  onReportUser,
  isPendingRequest,
  hasDatingLock,
}: ProfileViewModalProps) {
  const [requestNote, setRequestNote] = useState('');
  const [showRequestInput, setShowRequestInput] = useState(false);
  const [selectedType, setSelectedType] = useState<'friend' | 'chat'>('friend');
  const [hasConsented, setHasConsented] = useState(false);

  const sharedInterests = candidate.interests.filter((i) => currentUser.interests.includes(i));
  const isMinor = currentUser.age < 18 || candidate.age < 18;

  const handleSend = () => {
    if (!hasConsented) return;
    onSendRequest(candidate, selectedType, requestNote.trim() || undefined);
    setShowRequestInput(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#EAE3DA] shadow-2xl p-6 sm:p-9 my-8 animate-in fade-in zoom-in-95">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE2] mb-6">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-[#736B62] hover:text-[#2B2B2B] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Discovery</span>
          </button>

          <div className="flex items-center gap-3 text-xs text-[#8C8379]">
            <button
              onClick={() => onReportUser(candidate)}
              className="hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
            <span>&bull;</span>
            <button
              onClick={() => onBlockUser(candidate)}
              className="hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Block</span>
            </button>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
          <AvatarBadge seed={candidate.avatarSeed} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-serif text-[#2B2B2B]">{candidate.alias}</h2>
              {candidate.osintFootprint?.verifiedPublicSignals && (
                <span title="Public-source status">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </span>
              )}
            </div>

            <p className="text-xs text-[#7A726A] mt-1">
              {candidate.age} years old &bull; {candidate.gender} &bull; Based in {candidate.country}
              {candidate.heightCm ? ` &bull; ${candidate.heightCm} cm` : ''}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F2EDE7] text-[#554E46]">
                {candidate.activeMode === 'dating' ? (
                  <>
                    <Heart className="w-3 h-3 text-[#C68B7D]" />
                    <span>Dating Mode</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3 text-[#696159]" />
                    <span>Friendship Mode</span>
                  </>
                )}
              </span>

              {compatibility && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[#FAF2EE] text-[#4A3B37] border border-[#EADBD4]">
                  <Sparkles className="w-3 h-3 text-[#C68B7D]" />
                  <span>Resonance {compatibility.compatibilityScore}% &bull; {compatibility.matchGrade}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio & Intention */}
        <div className="space-y-4 mb-6">
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ECE5DC]">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#8A8177] mb-1.5">
              Reflective Bio
            </h4>
            <p className="text-xs text-[#4F4840] leading-relaxed italic">
              "{candidate.bio}"
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ECE5DC]">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#8A8177] mb-1.5">
              What I Am Seeking On Relato
            </h4>
            <p className="text-xs text-[#4F4840] leading-relaxed">
              {candidate.lookingFor}
            </p>
          </div>
        </div>

        {/* Gemini AI OSINT Deep Synthesis */}
        {compatibility && (
          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D7] shadow-2xs mb-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#2B2B2B]">
              <Sparkles className="w-4 h-4 text-[#C68B7D]" />
              <span>Gemini Grounded OSINT Analysis</span>
            </div>
            
            <p className="text-xs text-[#524B43] leading-relaxed">
              {compatibility.deepAnalysis}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F2ECE5] text-[11px]">
              <div>
                <span className="font-mono text-[#8C8379] block">Intellectual Resonance:</span>
                <span className="text-[#3B352F]">{compatibility.osintInsights.intellectualResonance}</span>
              </div>
              <div>
                <span className="font-mono text-[#8C8379] block">Cultural Affinity:</span>
                <span className="text-[#3B352F]">{compatibility.osintInsights.culturalAffinity}</span>
              </div>
              <div>
                <span className="font-mono text-[#8C8379] block">Lifestyle Pacing:</span>
                <span className="text-[#3B352F]">{compatibility.osintInsights.lifestylePacing}</span>
              </div>
              <div>
                <span className="font-mono text-[#8C8379] block">Public Source Status:</span>
                <span className="text-[#3B352F]">{compatibility.osintInsights.trustRating}</span>
              </div>
            </div>
          </div>
        )}

        {/* Public OSINT Digital Footprint */}
        <div className="bg-[#FAF8F5] rounded-2xl border border-[#ECE5DC] p-5 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#8A8177]">
              <Terminal className="w-3.5 h-3.5" />
              <span>Public Consented OSINT Vectors</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              Lawful Public Registry Status
            </span>
          </div>

          {candidate.osintFootprint?.osintSummary && (
            <p className="text-xs text-[#554E46] leading-relaxed">
              {candidate.osintFootprint.osintSummary}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            {candidate.osintFootprint?.favoriteBooksAuthors && (
              <div className="flex items-start gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#8C8379] shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[11px] text-[#2B2B2B]">Literature / Index:</span>
                    <span className="text-[9px] font-mono bg-white px-1 rounded border border-[#DDD5CB] text-[#7A726A]">Bibliographic</span>
                  </div>
                  <span className="text-[#655D54]">{candidate.osintFootprint.favoriteBooksAuthors.join(', ')}</span>
                </div>
              </div>
            )}

            {candidate.osintFootprint?.musicAesthetics && (
              <div className="flex items-start gap-2">
                <Music className="w-3.5 h-3.5 text-[#8C8379] shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[11px] text-[#2B2B2B]">Music Aesthetics:</span>
                    <span className="text-[9px] font-mono bg-white px-1 rounded border border-[#DDD5CB] text-[#7A726A]">Self-Declared</span>
                  </div>
                  <span className="text-[#655D54]">{candidate.osintFootprint.musicAesthetics.join(', ')}</span>
                </div>
              </div>
            )}

            {candidate.osintFootprint?.publicGithub && (
              <div className="flex items-start gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-[#8C8379] shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[11px] text-[#2B2B2B]">Public Repository:</span>
                    <span className="text-[9px] font-mono bg-emerald-50 text-emerald-800 px-1 rounded border border-emerald-200">Public Source Match</span>
                  </div>
                  <span className="font-mono text-xs text-[#444]">@{candidate.osintFootprint.publicGithub}</span>
                </div>
              </div>
            )}
          </div>

          {candidate.osintFootprint?.verifiedPublicSignals && (
            <div className="pt-2 border-t border-[#EAE3DA] flex flex-wrap gap-1.5">
              {candidate.osintFootprint.verifiedPublicSignals.map((signal) => (
                <span key={signal} className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#DFD7CE] text-[#554E46]">
                  {signal}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Interests & Languages */}
        <div className="space-y-4 mb-8">
          <div>
            <span className="text-xs font-mono text-[#8C8379] block mb-1.5 uppercase">All Declared Passions</span>
            <div className="flex flex-wrap gap-1.5">
              {candidate.interests.map((interest) => {
                const isShared = currentUser.interests.includes(interest);
                return (
                  <span
                    key={interest}
                    className={`text-xs px-2.5 py-1 rounded-lg font-mono ${
                      isShared
                        ? 'bg-[#2B2B2B] text-white font-medium'
                        : 'bg-[#EDE7DF] text-[#5C554D]'
                    }`}
                  >
                    {interest} {isShared && '✓'}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-mono text-[#8C8379] block mb-1.5 uppercase">Languages</span>
            <div className="flex flex-wrap gap-1.5">
              {candidate.languages.map((l) => (
                <span key={l} className="text-xs bg-white border border-[#DDD5CB] text-[#4F4840] px-2.5 py-0.5 rounded-md">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        {showRequestInput ? (
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD5CB] space-y-3">
            <h4 className="text-xs font-semibold text-[#2B2B2B]">
              Send {selectedType === 'friend' ? 'Friend Request' : 'Chat & Dating Request'}
            </h4>
            <textarea
              rows={2}
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              placeholder="Introduce your perspective or share a shared topic..."
              className="w-full p-3 rounded-xl border border-[#D9D1C7] text-xs bg-white text-[#2B2B2B] focus:outline-hidden"
            />

            {/* Direct Contact Consent Gate */}
            <div className="p-3 rounded-xl bg-white border border-[#E4DCD2]">
              <label className="flex items-start gap-2.5 cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                  className="mt-0.5 rounded border-[#C8C0B5] text-[#2B2B2B] focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] text-[#5A534B] leading-tight select-none">
                  <strong>Consent to Mutual Discovery Terms:</strong> I acknowledge that private direct communication requires reciprocal acceptance. I will abide by Relato's single-connection boundaries.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestInput(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#6F675E] hover:bg-[#EAE3D9] cursor-pointer"
              >
                Back
              </button>
              <button
                disabled={!hasConsented}
                onClick={handleSend}
                className={`px-6 py-2 rounded-xl text-xs font-medium transition-all ${
                  hasConsented
                    ? 'bg-[#2B2B2B] hover:bg-[#111] text-white cursor-pointer'
                    : 'bg-[#DDD5CB] text-[#8C847B] cursor-not-allowed opacity-70'
                }`}
              >
                Confirm & Send
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedType('friend');
                setShowRequestInput(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#EDE7DF] hover:bg-[#E2DAD0] text-[#2B2B2B] text-xs font-medium py-3 rounded-2xl transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#554E46]" />
              <span>Request Friend</span>
            </button>

            {isMinor ? (
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#F2ECE5] text-[#9E968D] text-xs font-medium py-3 rounded-2xl cursor-not-allowed opacity-60"
              >
                <Lock className="w-4 h-4" />
                <span>Friend Only (Under 18)</span>
              </button>
            ) : hasDatingLock ? (
              <button
                disabled
                title="Active dating connection currently in progress"
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#F2ECE5] text-[#9E968D] text-xs font-medium py-3 rounded-2xl cursor-not-allowed opacity-60"
              >
                <Lock className="w-4 h-4 text-[#B08D85]" />
                <span>Single Dating Lock</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedType('chat');
                  setShowRequestInput(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#2B2B2B] hover:bg-[#1A1A1A] text-white text-xs font-medium py-3 rounded-2xl transition-all shadow-xs cursor-pointer"
              >
                <Heart className="w-4 h-4 text-[#E8C2B9]" />
                <span>Request Chat</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
