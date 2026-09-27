import { useState, useRef, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MatchConnection, ChatMessage, UserProfile } from '../types';
import { AvatarBadge } from '../components/AvatarBadge';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Lock,
  Flag,
  Ban,
  Shield,
  Heart,
  Users,
  LogOut,
  Info
} from 'lucide-react';

interface ChatScreenProps {
  currentUser: UserProfile;
  match: MatchConnection;
  onBack: () => void;
  onEndMatch: (match: MatchConnection) => void;
  onReportUser: (reportedId: string, alias: string) => void;
  onBlockUser: (blockedId: string, alias: string) => void;
}

export function ChatScreen({
  currentUser,
  match,
  onBack,
  onEndMatch,
  onReportUser,
  onBlockUser,
}: ChatScreenProps) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const partnerId = match.participantIds.find((id) => id !== currentUser.id) || match.participantIds[0];
  const partner = match.participants[partnerId] || {
    alias: 'Kindred Mind',
    avatarSeed: 'partner-seed',
    age: 25,
    gender: 'Female',
    mode: match.type,
    country: 'Global'
  };

  const isDating = match.type === 'dating';

  // Real-time Firestore snapshot listener for messages in this match
  useEffect(() => {
    const messagesRef = collection(db, 'matches', match.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        setMessages(msgs);
      },
      (error) => {
        console.warn('Real-time messages listener fallback:', error);
      }
    );

    return () => unsubscribe();
  }, [match.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageData = {
      matchId: match.id,
      senderId: currentUser.id,
      senderAlias: currentUser.alias,
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    setInputText('');

    // Write to Firestore subcollection in real time
    try {
      const messagesRef = collection(db, 'matches', match.id, 'messages');
      await addDoc(messagesRef, messageData);
    } catch (err) {
      console.warn('Firestore message dispatch fallback:', err);
      // Fallback local append
      setMessages((prev) => [...prev, { id: 'msg-' + Date.now(), ...messageData }]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Chat Room Top Navigation */}
      <div className="bg-white rounded-2xl border border-[#ECE5DC] px-5 py-3.5 mb-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-[#F2ECE5] text-[#736B63] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <AvatarBadge seed={partner.avatarSeed} size="md" />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#2B2B2B]">{partner.alias}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF2EE] text-[#554742] border border-[#EADBD4]">
                <Sparkles className="w-2.5 h-2.5 text-[#C68B7D]" />
                {match.compatibilityScore}% Resonance
              </span>
            </div>
            <p className="text-[11px] text-[#7A726A]">
              {partner.age} yrs &bull; {partner.country} &bull; {partner.gender} &bull;{' '}
              <span className="capitalize">{match.type} Connection</span>
            </p>
          </div>
        </div>

        {/* Safety & End controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onReportUser(partnerId, partner.alias)}
            className="p-2 text-xs text-[#8A8177] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Report this user"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onBlockUser(partnerId, partner.alias)}
            className="p-2 text-xs text-[#8A8177] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Block this user"
          >
            <Ban className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onEndMatch(match)}
            className="flex items-center gap-1 text-xs text-[#8A8177] hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            title={isDating ? "End connection to unlock new dating invites" : "End connection"}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End Connection</span>
          </button>
        </div>
      </div>

      {/* Safety & Confidentiality Notice */}
      <div className="px-4 py-2 mb-3 bg-[#FAF8F5] border border-[#EBE4DC] rounded-xl flex items-center justify-between text-[11px] text-[#7A726A]">
        <div className="flex items-center gap-2">
          <Lock className="w-3 h-3 text-[#9C948B]" />
          <span>Mutual consent verified. Real-time messages persisted on Firestore.</span>
        </div>
        {isDating && (
          <span className="text-[#A26D62] font-medium hidden sm:inline">
            Dating Single Partner Lock Active
          </span>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 bg-white rounded-2xl border border-[#ECE5DC] p-5 overflow-y-auto space-y-4 shadow-2xs">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <AvatarBadge seed={partner.avatarSeed} size="lg" className="mx-auto mb-3" />
            <h4 className="text-base font-serif text-[#2B2B2B]">
              Connection Opened with {partner.alias}
            </h4>
            <p className="text-xs text-[#7B736B] max-w-sm mx-auto mt-1">
              Mutual acceptance completed. You may now exchange secure real-time messages.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] sm:max-w-md px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-[#2B2B2B] text-white rounded-br-xs shadow-xs'
                      : 'bg-[#F2ECE5] text-[#2B2B2B] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] font-mono text-[#9C948B]">
                  <span>{isMe ? 'You' : msg.senderAlias}</span>
                  <span>&bull;</span>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${partner.alias}...`}
          className="flex-1 bg-white border border-[#DDD5CB] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#2B2B2B] placeholder:text-[#9C948B] focus:outline-hidden focus:border-[#2B2B2B] shadow-2xs"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-[#2B2B2B] hover:bg-[#1A1A1A] disabled:opacity-40 text-white p-3.5 rounded-2xl transition-all shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
