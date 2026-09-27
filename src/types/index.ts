export type ModeType = 'friendship' | 'dating';
export type GenderType = 'Male' | 'Female';

// Full Private Profile stored in /profiles/{userId} (includes private email, notifications, full config)
export interface UserProfile {
  id: string; // Firebase Auth UID
  alias: string; // Anonymous handle, e.g. "Solitary Wanderer", "Aura Echo"
  email?: string; // Stored ONLY in private profile, NEVER in public projection
  avatarSeed: string;
  age: number; // 16-17 = friendship only; 18+ = friendship & dating
  isMinor?: boolean; // Derived from age < 18 for backend security filtering
  gender: GenderType;
  country: string;
  heightCm?: number;
  languages: string[];
  interests: string[];
  activeMode: ModeType;
  allowedModes: ModeType[];
  
  // OSINT public digital footprint & research profile (user consented public presence)
  osintFootprint?: {
    publicGithub?: string;
    publicScholar?: string;
    publicBlogTopics?: string[];
    publicSubredditsOrForums?: string[];
    favoriteBooksAuthors?: string[];
    musicAesthetics?: string[];
    verifiedPublicSignals?: string[];
    osintSummary?: string;
    consentGranted?: boolean; // Explicit user consent for OSINT verification & public display
  };
  
  bio: string;
  lookingFor: string;
  hasActiveDatingConnection?: boolean;
  activeDatingConnectionId?: string;
  
  createdAt: number;
  updatedAt: number;
  isOnline?: boolean;
  privacy: {
    hideExactAge?: boolean;
    hideExactHeight?: boolean;
    notifyViaGmail?: boolean;
  };
}

// Sanitized Public Profile projection in /public_profiles/{userId}
export type PublicUserProfile = Omit<UserProfile, 'email'>;

export interface UserPreferences {
  ageMin: number;
  ageMax: number;
  modes: ModeType[];
  preferredGenders: GenderType[];
  countries: string[];
  languages: string[];
  interests: string[];
  minCompatibilityScore?: number;
}

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  fromUserAlias: string;
  fromUserAvatar: string;
  fromUserGender: GenderType;
  fromUserAge: number;
  fromUserCountry: string;
  toUserId: string;
  toUserAlias: string;
  type: 'friend' | 'chat';
  mode: ModeType;
  note?: string;
  compatibilityScore: number;
  sharedInterests: string[];
  osintHighlights?: string[];
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: number;
  updatedAt: number;
}

export interface MatchConnection {
  id: string;
  requestId?: string; // Originating accepted connection request id
  participantIds: string[];
  participants: {
    [userId: string]: {
      alias: string;
      avatarSeed: string;
      age: number;
      gender: GenderType;
      mode: ModeType;
      country: string;
    };
  };
  type: ModeType;
  status: 'active' | 'archived' | 'ended';
  compatibilityScore: number;
  sharedInterests: string[];
  lastMessageText?: string;
  lastMessageTimestamp?: number;
  createdAt: number;
  endedAt?: number;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  senderAlias: string;
  text: string;
  timestamp: number;
  readBy?: string[];
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reportedUserAlias: string;
  category: 'harassment' | 'impersonation' | 'underage_dating' | 'spam' | 'other';
  reason: string;
  timestamp: number;
  status: 'pending_review' | 'resolved';
}

export interface BlockEntry {
  id: string;
  userId: string;
  blockedUserId: string;
  blockedUserAlias: string;
  timestamp: number;
}
