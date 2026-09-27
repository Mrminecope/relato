import { useState } from 'react';
import { MatchConnection, UserProfile } from '../types';
import { AvatarBadge } from '../components/AvatarBadge';
import {
  MessageSquare,
  Heart,
  Users,
  Lock,
  Sparkles,
  ChevronRight,
  Shield,
  Clock,
  LogOut,
  AlertTriangle
} from 'lucide-react';

interface MatchesScreenProps {
  currentUser: UserProfile;
  matches: MatchConnection[];
  onOpenChat: (match: MatchConnection) => void;
  onEndMatch: (match: MatchConnection) => void;
}

export function MatchesScreen({ currentUser, matches, onOpenChat, onEndMatch }: MatchesScreenProps) {
  const [confirmEndMatchId, setConfirmEndMatchId] = useState<string | null>(null);

  const activeMatches = matches.filter((m) => m.status === 'active');
  const pastMatches = matches.filter((m) => m.status !== 'active');

  const getPartner = (match: MatchConnection) => {
    const partnerId = match.participantIds.find((id) => id !== currentUser.id) || match.participantIds[0];
    return match.participants[partnerId] || {
      alias: 'Anonymous Connection',
      avatarSeed: 'partner-seed',
      age: 24,
      mode: match.type,
      country: 'Global'
    };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#EBE4DC] mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8A8177]">
          <MessageSquare className="w-3.5 h-3.5 text-[#C68B7D]" />
          <span>Private Encrypted Channels</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#2B2B2B] mt-1">
          Active Connections & Conversations
        </h1>
        <p className="text-xs text-[#7B736B] mt-1">
          Connections formed through mutual consent. You can converse privately or end any connection with one click.
        </p>
      </div>

      {activeMatches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE3DA] p-8 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#DDD5CB] flex items-center justify-center mx-auto mb-4 text-[#7A7269]">
            <Heart className="w-5 h-5 text-[#C68B7D]" />
          </div>
          <h3 className="text-lg font-serif text-[#2B2B2B]">No Active Connections Yet</h3>
          <p className="text-xs text-[#7B736B] max-w-md mx-auto mt-2 leading-relaxed">
            When you send or accept a connection request, your private mutual conversation room will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeMatches.map((match) => {
            const partner = getPartner(match);
            const isDating = match.type === 'dating';

            return (
              <div
                key={match.id}
                className="bg-white rounded-2xl border border-[#EAE3DA] p-5 shadow-xs hover:border-[#D5CABB] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Partner Details */}
                <div
                  onClick={() => onOpenChat(match)}
                  className="flex items-start gap-4 cursor-pointer flex-1"
                >
                  <AvatarBadge seed={partner.avatarSeed} size="lg" />
                  
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-medium text-[#2B2B2B] hover:text-[#555] transition-colors">
                        {partner.alias}
                      </h3>
                      
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAF2EE] text-[#554742] border border-[#EADBD4]">
                        <Sparkles className="w-3 h-3 text-[#C68B7D]" />
                        {match.compatibilityScore}% Resonance
                      </span>

                      {isDating && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#2B2B2B] text-white">
                          <Heart className="w-2.5 h-2.5 text-[#E8C2B9]" />
                          Dating Connection
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#7A726A] mt-0.5">
                      {partner.age} yrs &bull; {partner.gender} &bull; {partner.country}
                    </p>

                    <p className="text-xs text-[#524B43] mt-2 line-clamp-1 italic">
                      {match.lastMessageText || 'Mutual connection established. Start the conversation...'}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    onClick={() => setConfirmEndMatchId(match.id)}
                    className="p-2 text-xs text-[#8A8177] hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title={isDating ? "End connection (unlocks ability to date others)" : "End connection"}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenChat(match)}
                    className="flex items-center gap-2 bg-[#2B2B2B] hover:bg-[#1A1A1A] text-white px-5 py-2.5 rounded-xl text-xs font-medium transition-all shadow-2xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Chat</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Confirm End Modal */}
                {confirmEndMatchId === match.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#EAE3DA] shadow-2xl">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-semibold text-[#2B2B2B]">
                        End Connection with {partner.alias}?
                      </h4>
                      <p className="text-xs text-[#736B62] mt-1.5 leading-relaxed">
                        {isDating
                          ? 'Ending this connection will archive this conversation and immediately unlock your ability to send new dating requests on Relato.'
                          : 'This will archive the connection and remove access to direct messaging.'}
                      </p>

                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          onClick={() => setConfirmEndMatchId(null)}
                          className="px-4 py-2 rounded-xl text-xs font-medium text-[#655D54] hover:bg-[#F2ECE5] cursor-pointer"
                        >
                          Keep Connected
                        </button>
                        <button
                          onClick={() => {
                            setConfirmEndMatchId(null);
                            onEndMatch(match);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-medium cursor-pointer"
                        >
                          End Connection
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Past Ended Matches */}
      {pastMatches.length > 0 && (
        <div className="pt-10 border-t border-[#EAE3DA] mt-10">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#8A8177] mb-4">
            Concluded Connections Archive
          </h3>
          <div className="space-y-2 opacity-75">
            {pastMatches.map((m) => {
              const partner = getPartner(m);
              return (
                <div
                  key={m.id}
                  className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#ECE5DC] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <AvatarBadge seed={partner.avatarSeed} size="sm" />
                    <div>
                      <span className="font-medium text-[#2B2B2B]">{partner.alias}</span>
                      <span className="text-[#8C8379] ml-2">({m.type})</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#8C8379]">Archived</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
