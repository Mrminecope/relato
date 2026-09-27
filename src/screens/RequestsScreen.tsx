import { useState } from 'react';
import { ConnectionRequest, UserProfile } from '../types';
import { AvatarBadge } from '../components/AvatarBadge';
import {
  Bell,
  Check,
  X,
  Sparkles,
  Users,
  Heart,
  MessageSquare,
  Lock,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface RequestsScreenProps {
  currentUser: UserProfile;
  receivedRequests: ConnectionRequest[];
  sentRequests: ConnectionRequest[];
  onAcceptRequest: (request: ConnectionRequest) => void;
  onDeclineRequest: (request: ConnectionRequest) => void;
  onCancelSentRequest: (request: ConnectionRequest) => void;
  onViewUserProfile: (userId: string) => void;
  onStartChatWithMatch: (matchId: string) => void;
}

export function RequestsScreen({
  currentUser,
  receivedRequests,
  sentRequests,
  onAcceptRequest,
  onDeclineRequest,
  onCancelSentRequest,
  onViewUserProfile,
  onStartChatWithMatch,
}: RequestsScreenProps) {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  const pendingReceived = receivedRequests.filter((r) => r.status === 'pending');
  const pendingSent = sentRequests.filter((r) => r.status === 'pending');
  const resolvedReceived = receivedRequests.filter((r) => r.status !== 'pending');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EBE4DC] mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8A8177]">
            <Bell className="w-3.5 h-3.5 text-[#C68B7D]" />
            <span>Mutual Acceptance Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#2B2B2B] mt-1">
            Connection Requests
          </h1>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[#EDE7DF] p-1 rounded-full border border-[#DCD3C7]">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'received'
                ? 'bg-white text-[#2B2B2B] shadow-2xs font-semibold'
                : 'text-[#6F675E] hover:text-[#2B2B2B]'
            }`}
          >
            <span>Received</span>
            {pendingReceived.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#2B2B2B] text-white text-[10px] flex items-center justify-center">
                {pendingReceived.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'sent'
                ? 'bg-white text-[#2B2B2B] shadow-2xs font-semibold'
                : 'text-[#6F675E] hover:text-[#2B2B2B]'
            }`}
          >
            <span>Sent Requests</span>
            {pendingSent.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#8A8177] text-white text-[10px] flex items-center justify-center">
                {pendingSent.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Protocol Explanation Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-white border border-[#E8E1D7] flex items-start gap-3.5 shadow-2xs">
        <Lock className="w-4 h-4 text-[#8C8379] shrink-0 mt-0.5" />
        <div className="text-xs text-[#5C554D] leading-relaxed">
          <strong className="text-[#2B2B2B] font-medium block">Mutual Consent Requirement:</strong>
          Relato strictly forbids unsolicited direct messages. A private chat unlocks only after the recipient reviews the profile and explicitly accepts the invitation. For Dating connections, acceptance locks both parties into that single active connection.
        </div>
      </div>

      {activeTab === 'received' ? (
        /* RECEIVED TAB */
        <div className="space-y-6">
          {pendingReceived.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#EAE3DA] p-8">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#DDD5CB] flex items-center justify-center mx-auto mb-3 text-[#7A7269]">
                <Bell className="w-5 h-5 text-[#9C948B]" />
              </div>
              <h3 className="text-base font-serif text-[#2B2B2B]">No Pending Inbound Requests</h3>
              <p className="text-xs text-[#7B736B] max-w-sm mx-auto mt-1">
                When another member requests a friendship or dating connection with you, their verified dossier will appear here for your review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReceived.map((req) => {
                const isDating = req.mode === 'dating' || req.type === 'chat';
                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-[#EBE4DC] p-5 shadow-xs hover:border-[#D9CFBF] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-start gap-3.5">
                        <AvatarBadge seed={req.fromUserAvatar} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-medium text-[#2B2B2B]">{req.fromUserAlias}</h4>
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#FAF4F0] text-[#554742] border border-[#EADBD4]">
                              <Sparkles className="w-3 h-3 text-[#C68B7D]" />
                              {req.compatibilityScore}% Resonance
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#7A726A] mt-0.5">
                            <span className="capitalize">{req.mode} Request</span>
                            <span>&bull;</span>
                            <span>{req.fromUserGender || 'Anonymous'}</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {req.note && (
                            <p className="text-xs italic text-[#4A433B] bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EDE7DF] mt-2 max-w-md">
                              "{req.note}"
                            </p>
                          )}

                          {req.sharedInterests.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {req.sharedInterests.map((interest) => (
                                <span
                                  key={interest}
                                  className="text-[10px] font-mono bg-[#EFEAE2] text-[#4F473F] px-2 py-0.5 rounded"
                                >
                                  {interest}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Accept / Decline actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onDeclineRequest(req)}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-medium text-[#7A7269] hover:bg-[#F2EDE7] hover:text-[#2B2B2B] transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>

                        <button
                          onClick={() => onAcceptRequest(req)}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-medium bg-[#2B2B2B] hover:bg-[#1A1A1A] text-white transition-all shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Connection</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Past Resolved Requests */}
          {resolvedReceived.length > 0 && (
            <div className="pt-6 border-t border-[#EAE3DA]">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#8A8177] mb-3">
                Resolved Requests
              </h3>
              <div className="space-y-2 opacity-80">
                {resolvedReceived.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-[#FAF8F5] rounded-xl border border-[#ECE5DC] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <AvatarBadge seed={req.fromUserAvatar} size="sm" />
                      <span className="font-medium text-[#2B2B2B]">{req.fromUserAlias}</span>
                      <span className="text-[#7A726A]">({req.mode})</span>
                    </div>
                    <span
                      className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                        req.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SENT TAB */
        <div className="space-y-4">
          {pendingSent.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#EAE3DA] p-8">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#DDD5CB] flex items-center justify-center mx-auto mb-3 text-[#7A7269]">
                <Bell className="w-5 h-5 text-[#9C948B]" />
              </div>
              <h3 className="text-base font-serif text-[#2B2B2B]">No Outbound Pending Requests</h3>
              <p className="text-xs text-[#7B736B] max-w-sm mx-auto mt-1">
                Explore the discovery feed to find compatible peers and send connection invites.
              </p>
            </div>
          ) : (
            pendingSent.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-[#EBE4DC] p-5 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <AvatarBadge seed={req.toUserId} size="md" />
                  <div>
                    <h4 className="text-sm font-medium text-[#2B2B2B]">
                      Request to <span className="font-semibold">{req.toUserAlias}</span>
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#7A726A] mt-0.5">
                      <span className="capitalize">{req.mode} invitation</span>
                      <span>&bull;</span>
                      <span>Awaiting their mutual acceptance</span>
                    </div>
                    {req.note && (
                      <p className="text-xs italic text-[#554E46] mt-1.5">"{req.note}"</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onCancelSentRequest(req)}
                  className="px-3.5 py-1.5 text-xs text-[#8A8177] hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel Request
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
