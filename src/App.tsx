import { collection, doc, getDoc, setDoc, query, where, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile, PublicUserProfile, UserPreferences, ConnectionRequest, MatchConnection, ChatMessage, SafetyReport, BlockEntry, ModeType } from './types';
import { HeaderNav } from './components/HeaderNav';
import { LandingPage } from './screens/LandingPage';
import { AuthModal } from './components/AuthModal';
import { ProfileSetup } from './screens/ProfileSetup';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { PreferencesScreen } from './screens/PreferencesScreen';
import { RequestsScreen } from './screens/RequestsScreen';
import { MatchesScreen } from './screens/MatchesScreen';
import { ChatScreen } from './screens/ChatScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SafetyScreen } from './screens/SafetyScreen';
import { ProfileViewModal } from './screens/ProfileViewModal';
import { calculateOSINTCompatibility, OSINTAnalysisResult } from './lib/gemini';
import { clearOAuthToken } from './lib/gmail';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUserAuthId, setCurrentUserAuthId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | undefined>(undefined);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('discover');

  // Discovery & Candidates (Synced from /public_profiles Firestore collection)
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(true);
  const [compatibilityCache, setCompatibilityCache] = useState<Record<string, OSINTAnalysisResult>>({});
  const [inspectedCandidate, setInspectedCandidate] = useState<UserProfile | null>(null);

  // Connection Requests & Matches - Real-time synced with Firestore
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [matches, setMatches] = useState<MatchConnection[]>([]);
  const [activeChatMatch, setActiveChatMatch] = useState<MatchConnection | null>(null);

  // Moderation & Safety - Real-time synced with Firestore
  const [blockedUsers, setBlockedUsers] = useState<BlockEntry[]>([]);
  const [reports, setReports] = useState<SafetyReport[]>([]);

  // Preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    ageMin: 18,
    ageMax: 35,
    modes: ['friendship', 'dating'],
    preferredGenders: ['Female'],
    countries: ['Norway', 'United Kingdom', 'United States', 'Germany', 'Canada', 'Sweden'],
    languages: ['English'],
    interests: ['Architecture', 'Ambient Music', 'Philosophy', 'Creative Coding', 'Specialty Coffee'],
    minCompatibilityScore: 70,
  });

  // Track Firebase Auth state (Production mode: only real authenticated accounts)
  useEffect(() => {
    setIsAuthLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserAuthId(user.uid);
        setCurrentUserEmail(user.email || undefined);
        await loadUserProfile(user.uid, user.email || undefined);
      } else {
        clearOAuthToken();
        setCurrentUserAuthId(null);
        setUserProfile(null);
        setIsEditingProfile(false);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load User Profile and Preferences from Firestore
  const loadUserProfile = async (uid: string, email?: string) => {
    try {
      setAuthError(null);
      const docRef = doc(db, 'profiles', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUserProfile({
          ...data,
          isMinor: data.age < 18,
        });
      } else {
        // New user needs profile setup
        setIsEditingProfile(true);
      }

      // Load user preferences from Firestore if exist
      const prefSnap = await getDoc(doc(db, 'preferences', uid));
      if (prefSnap.exists()) {
        setPreferences(prefSnap.data() as UserPreferences);
      }
    } catch (e: any) {
      console.warn('Firestore load profile error:', e);
      setAuthError(e?.message || 'Could not load profile. Please verify connection.');
    }
  };

  // Real-time Firestore sync for Requests (Received & Sent)
  useEffect(() => {
    if (!currentUserAuthId) return;

    // Inbound requests: toUserId == currentUserAuthId
    const receivedQuery = query(
      collection(db, 'requests'),
      where('toUserId', '==', currentUserAuthId)
    );
    const unsubReceived = onSnapshot(receivedQuery, (snapshot) => {
      const list: ConnectionRequest[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setReceivedRequests(list);
    });

    // Outbound requests: fromUserId == currentUserAuthId
    const sentQuery = query(
      collection(db, 'requests'),
      where('fromUserId', '==', currentUserAuthId)
    );
    const unsubSent = onSnapshot(sentQuery, (snapshot) => {
      const list: ConnectionRequest[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setSentRequests(list);
    });

    // Matches: participantIds contains currentUserAuthId
    const matchesQuery = query(
      collection(db, 'matches'),
      where('participantIds', 'array-contains', currentUserAuthId)
    );
    const unsubMatches = onSnapshot(matchesQuery, (snapshot) => {
      const list: MatchConnection[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setMatches(list);
    });

    // Blocks: userId == currentUserAuthId
    const blocksQuery = query(
      collection(db, 'blocks'),
      where('userId', '==', currentUserAuthId)
    );
    const unsubBlocks = onSnapshot(blocksQuery, (snapshot) => {
      const list: BlockEntry[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setBlockedUsers(list);
    });

    // Reports: reporterId == currentUserAuthId
    const reportsQuery = query(
      collection(db, 'reports'),
      where('reporterId', '==', currentUserAuthId)
    );
    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      const list: SafetyReport[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setReports(list);
    });

    return () => {
      unsubReceived();
      unsubSent();
      unsubMatches();
      unsubBlocks();
      unsubReports();
    };
  }, [currentUserAuthId]);

  // Sync Public Profiles from Firestore `/public_profiles` (sanitized projections without private email)
  // Restricts discovery strictly by age separation (minors see minors, adults see adults)
  useEffect(() => {
    if (!currentUserAuthId || !userProfile) return;
    setIsDiscoveryLoading(true);

    const isMinor = userProfile.age < 18;
    const publicProfilesQuery = query(
      collection(db, 'public_profiles'),
      where('isMinor', '==', isMinor)
    );

    const unsubPublicProfiles = onSnapshot(
      publicProfilesQuery,
      (snapshot) => {
        const liveList: UserProfile[] = [];
        snapshot.forEach((d) => {
          liveList.push(d.data() as UserProfile);
        });
        
        // Production mode: Only authentic registered profiles from Firestore
        setCandidates(liveList);
        setIsDiscoveryLoading(false);
      },
      (error) => {
        console.warn('Public profiles listener notice:', error);
        setCandidates([]);
        setIsDiscoveryLoading(false);
      }
    );

    return () => unsubPublicProfiles();
  }, [currentUserAuthId, userProfile?.age]);

  // Compute Gemini compatibility analyses for discovery pool
  useEffect(() => {
    if (!userProfile || candidates.length === 0) return;

    let isMounted = true;
    const computeCompats = async () => {
      const newCache = { ...compatibilityCache };
      for (const candidate of candidates) {
        if (!newCache[candidate.id]) {
          const result = await calculateOSINTCompatibility(userProfile, candidate);
          if (isMounted) {
            newCache[candidate.id] = result;
            setCompatibilityCache({ ...newCache });
          }
        }
      }
    };

    computeCompats();
    return () => {
      isMounted = false;
    };
  }, [userProfile, candidates]);

  // Save profile to Firestore with dual private and sanitized public projection
  const handleSaveProfile = async (newProfile: UserProfile) => {
    const isMinor = newProfile.age < 18;
    const profileWithMinor: UserProfile = {
      ...newProfile,
      isMinor,
    };
    setUserProfile(profileWithMinor);
    setIsEditingProfile(false);

    try {
      // 1. Private full profile in /profiles/{userId}
      await setDoc(doc(db, 'profiles', profileWithMinor.id), profileWithMinor);

      // 2. Public sanitized profile projection in /public_profiles/{userId} (strips private email, includes isMinor)
      const publicProjection: PublicUserProfile = {
        id: profileWithMinor.id,
        alias: profileWithMinor.alias,
        avatarSeed: profileWithMinor.avatarSeed,
        age: profileWithMinor.age,
        isMinor,
        gender: profileWithMinor.gender,
        country: profileWithMinor.country,
        heightCm: profileWithMinor.heightCm,
        languages: profileWithMinor.languages,
        interests: profileWithMinor.interests,
        activeMode: profileWithMinor.activeMode,
        allowedModes: profileWithMinor.allowedModes,
        osintFootprint: profileWithMinor.osintFootprint,
        bio: profileWithMinor.bio,
        lookingFor: profileWithMinor.lookingFor,
        createdAt: profileWithMinor.createdAt,
        updatedAt: profileWithMinor.updatedAt,
      };
      await setDoc(doc(db, 'public_profiles', profileWithMinor.id), publicProjection);
    } catch (err: any) {
      console.warn('Firestore save profile error:', err);
    }
  };

  // Toggle Friendship / Dating mode with strict backend age rules
  const handleToggleMode = async (newMode: ModeType) => {
    if (!userProfile) return;
    if (newMode === 'dating' && userProfile.age < 18) {
      alert('Dating mode requires age 18+. Users aged 16–17 are strictly limited to Friendship.');
      return;
    }
    const updated: UserProfile = {
      ...userProfile,
      activeMode: newMode,
      updatedAt: Date.now(),
    };
    await handleSaveProfile(updated);
  };

  // Save preferences to Firestore
  const handleSavePreferences = async (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    if (userProfile) {
      try {
        await setDoc(doc(db, 'preferences', userProfile.id), newPrefs);
      } catch (err) {
        console.warn('Firestore preferences write error:', err);
      }
    }
  };

  /**
   * Sending a Connection Request (Friendship or Chat/Dating)
   * Enforced in Firebase: Dating requires age >= 18 and no active dating lock
   */
  const handleSendRequest = async (
    candidate: UserProfile,
    type: 'friend' | 'chat',
    note?: string
  ) => {
    if (!userProfile) return;

    // Strict Age separation: Minors (16-17) can ONLY connect with minors in friendship mode
    if (userProfile.age < 18) {
      if (candidate.age >= 18 || type !== 'friend') {
        alert('Minor/Adult connections are strictly prohibited. Users aged 16–17 can only connect with peers in Friendship mode.');
        return;
      }
    } else {
      if (candidate.age < 18) {
        alert('Adult/Minor connections are strictly prohibited.');
        return;
      }
    }

    // Strict Age rule check: 16-17 users cannot send or receive dating requests
    if (type === 'chat' && (userProfile.age < 18 || candidate.age < 18)) {
      alert('Users aged 16–17 are strictly restricted to Friendship mode.');
      return;
    }

    const compat = compatibilityCache[candidate.id];
    if (!compat) { alert('Compatibility estimate is still loading. Please try again.'); return; }

    const newReq: ConnectionRequest = {
      id: 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      fromUserId: userProfile.id,
      fromUserAlias: userProfile.alias,
      fromUserAvatar: userProfile.avatarSeed,
      fromUserGender: userProfile.gender,
      fromUserAge: userProfile.age,
      fromUserCountry: userProfile.country,
      toUserId: candidate.id,
      toUserAlias: candidate.alias,
      type,
      mode: type === 'friend' ? 'friendship' : 'dating',
      note,
      compatibilityScore: compat.compatibilityScore,
      sharedInterests: candidate.interests.filter((i) => userProfile.interests.includes(i)),
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Immediate Firestore persistence
    try {
      await setDoc(doc(db, 'requests', newReq.id), newReq);
    } catch (err: any) {
      console.warn('Firestore request write error:', err);
      alert('Could not submit request: ' + (err?.message || 'Check connection'));
      return;
    }

  };

  /**
   * Recipient accepts connection request using Firestore Transaction
   * - Enforces dating exclusivity lock in transaction
   * - Verifies request exists and is pending
   * - Creates mutual match in /matches/{matchId} with requestId
   * - Sets initial message in /matches/{matchId}/messages
   * - Updates request status to 'accepted'
   */
  const handleAcceptRequest = async (req: ConnectionRequest) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Authentication session expired. Please sign in again.');
      const response = await fetch('/api/connections/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId: req.id }),
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json() as { matchId: string };
      if (req.mode === 'dating') {
        setUserProfile((current) => current ? {
          ...current,
          hasActiveDatingConnection: true,
          activeDatingConnectionId: result.matchId,
        } : current);
      }
    } catch (err: any) {
      console.warn('Accept connection error:', err);
      alert('Accept connection failed: ' + (err?.message || 'Please retry.'));
    }
  };

  /**
   * Recipient declines connection request
   */
  const handleDeclineRequest = async (req: ConnectionRequest) => {
    try {
      await updateDoc(doc(db, 'requests', req.id), {
        status: 'declined',
        updatedAt: Date.now(),
      });
    } catch (err) {
      setReceivedRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: 'declined' } : r))
      );
    }
  };

  /**
   * Sender cancels their outbound request
   */
  const handleCancelSentRequest = async (req: ConnectionRequest) => {
    try {
      await deleteDoc(doc(db, 'requests', req.id));
    } catch (err) {
      setSentRequests((prev) => prev.filter((r) => r.id !== req.id));
    }
  };

  /**
   * End a Match / Connection (releases dating exclusivity lock in transaction)
   */
  const handleEndMatch = async (match: MatchConnection) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Authentication session expired. Please sign in again.');
      const response = await fetch('/api/connections/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matchId: match.id }),
      });
      if (!response.ok) throw new Error(await response.text());
      if (activeChatMatch?.id === match.id) setActiveChatMatch(null);
      if (match.type === 'dating') {
        setUserProfile((current) => current ? {
          ...current,
          hasActiveDatingConnection: false,
          activeDatingConnectionId: undefined,
        } : current);
      }
    } catch (err: any) {
      console.warn('End connection error:', err);
      alert('Could not end connection: ' + (err?.message || 'Please retry.'));
    }
  };

  /**
   * Blocking a user persists to Firestore `blocks` collection
   */
  const handleBlockUser = async (candidate: UserProfile | { id: string; alias: string }) => {
    const entry: BlockEntry = {
      id: 'block-' + Date.now(),
      userId: userProfile?.id || 'me',
      blockedUserId: candidate.id,
      blockedUserAlias: candidate.alias,
      timestamp: Date.now(),
    };

    try {
      await setDoc(doc(db, 'blocks', entry.id), entry);
    } catch (err) {
      console.warn('Firestore block error:', err);
    }

    setBlockedUsers((prev) => [...prev, entry]);
    setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
    if (inspectedCandidate?.id === candidate.id) {
      setInspectedCandidate(null);
    }
  };

  const handleUnblockUser = async (blockId: string) => {
    try {
      await deleteDoc(doc(db, 'blocks', blockId));
    } catch (err) {
      console.warn('Firestore unblock error:', err);
    }
    setBlockedUsers((prev) => prev.filter((b) => b.id !== blockId));
  };

  /**
   * Reporting a user persists to Firestore `reports` collection
   */
  const handleReportUser = async (
    target: UserProfile | { id: string; alias: string },
    category?: any,
    reason?: string
  ) => {
    const rep: SafetyReport = {
      id: 'rep-' + Date.now(),
      reporterId: userProfile?.id || 'me',
      reportedUserId: target.id,
      reportedUserAlias: target.alias,
      category: category || 'other',
      reason: reason || 'Flagged for moderation review',
      timestamp: Date.now(),
      status: 'pending_review',
    };

    try {
      await setDoc(doc(db, 'reports', rep.id), rep);
    } catch (err) {
      console.warn('Firestore report write error:', err);
    }

    setReports((prev) => [...prev, rep]);
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    clearOAuthToken();
    setUserProfile(null);
    setCurrentUserAuthId(null);
    setActiveTab('discover');
  };

  // State: Initial Auth Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-[#2B2B2B]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2B2B2B] mb-3" />
        <h2 className="text-base font-serif font-medium">Connecting to Relato...</h2>
        <p className="text-xs text-[#8A8177] mt-1 font-mono">Verifying secure Firebase session</p>
      </div>
    );
  }

  // State: Unauthenticated Landing Page
  if (!userProfile && !isEditingProfile) {
    return (
      <div className="font-['Plus_Jakarta_Sans',sans-serif]">
        <LandingPage
          onStartSignUp={() => {
            setAuthMode('signup');
            setIsAuthModalOpen(true);
          }}
          onStartLogin={() => {
            setAuthMode('login');
            setIsAuthModalOpen(true);
          }}
        />

        {isAuthModalOpen && (
          <AuthModal
            initialMode={authMode}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={(uid, email) => {
              setIsAuthModalOpen(false);
              setCurrentUserAuthId(uid);
              setCurrentUserEmail(email);
              loadUserProfile(uid, email);
            }}
          />
        )}
      </div>
    );
  }

  // State: Profile Setup / Onboarding
  if (isEditingProfile) {
    return (
      <ProfileSetup
        userId={currentUserAuthId || 'usr-anonymous'}
        userEmail={currentUserEmail}
        initialProfile={userProfile}
        onComplete={(newProf) => {
          handleSaveProfile(newProf);
          setActiveTab('discover');
        }}
      />
    );
  }

  // Exclude blocked users from discovery
  const visibleCandidates = candidates.filter(
    (c) => !blockedUsers.some((b) => b.blockedUserId === c.id)
  );

  const pendingRequestsCount = receivedRequests.filter((r) => r.status === 'pending').length;
  const unreadMatchesCount = matches.filter((m) => m.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2B2B2B] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col selection:bg-[#E8C2B9] selection:text-[#2B2B2B]">
      
      {/* Universal Navigation Header */}
      <HeaderNav
        currentTab={activeChatMatch ? 'chat' : activeTab}
        onSelectTab={(tab) => {
          setActiveChatMatch(null);
          setActiveTab(tab);
        }}
        userProfile={userProfile}
        pendingRequestsCount={pendingRequestsCount}
        unreadMatchesCount={unreadMatchesCount}
        onToggleMode={handleToggleMode}
      />

      {/* Main Screen Body */}
      <main className="flex-1">
        {authError && (
          <div className="max-w-4xl mx-auto mt-4 px-4">
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          </div>
        )}

        {activeChatMatch ? (
          /* REAL-TIME CHAT SCREEN */
          <ChatScreen
            currentUser={userProfile!}
            match={activeChatMatch}
            onBack={() => setActiveChatMatch(null)}
            onEndMatch={handleEndMatch}
            onReportUser={(id, alias) => handleReportUser({ id, alias })}
            onBlockUser={(id, alias) => handleBlockUser({ id, alias })}
          />
        ) : activeTab === 'discover' ? (
          /* DISCOVERY FEED SCREEN */
          <DiscoverScreen
            currentUser={userProfile!}
            preferences={preferences}
            allCandidates={visibleCandidates}
            sentRequests={sentRequests}
            onSendRequest={handleSendRequest}
            onViewCandidateProfile={(c) => setInspectedCandidate(c)}
            onBlockUser={handleBlockUser}
            onReportUser={handleReportUser}
            onOpenPreferences={() => setActiveTab('preferences')}
            compatibilityMap={compatibilityCache}
            isLoading={isDiscoveryLoading}
            error={authError}
            onRefreshDiscovery={() => {
              setCandidates([...candidates.sort(() => Math.random() - 0.5)]);
            }}
          />
        ) : activeTab === 'preferences' ? (
          /* PREFERENCES SCREEN */
          <PreferencesScreen
            currentUser={userProfile!}
            preferences={preferences}
            onSavePreferences={handleSavePreferences}
          />
        ) : activeTab === 'requests' ? (
          /* REQUESTS SCREEN (Mutual Acceptance Required) */
          <RequestsScreen
            currentUser={userProfile!}
            receivedRequests={receivedRequests}
            sentRequests={sentRequests}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            onCancelSentRequest={handleCancelSentRequest}
            onViewUserProfile={(id) => {
              const found = candidates.find((c) => c.id === id);
              if (found) setInspectedCandidate(found);
            }}
            onStartChatWithMatch={(matchId) => {
              const m = matches.find((match) => match.id === matchId);
              if (m) setActiveChatMatch(m);
            }}
          />
        ) : activeTab === 'matches' ? (
          /* MATCHES SCREEN */
          <MatchesScreen
            currentUser={userProfile!}
            matches={matches}
            onOpenChat={(match) => setActiveChatMatch(match)}
            onEndMatch={handleEndMatch}
          />
        ) : activeTab === 'profile' ? (
          /* PROFILE SCREEN */
          <ProfileScreen
            userProfile={userProfile!}
            onEditProfile={() => setIsEditingProfile(true)}
            onSignOut={handleSignOut}
            onOpenSafety={() => setActiveTab('safety')}
          />
        ) : activeTab === 'safety' ? (
          /* SAFETY & PRIVACY SCREEN */
          <SafetyScreen
            currentUser={userProfile!}
            onUpdatePrivacy={(priv) => {
              if (userProfile) {
                const updated = { ...userProfile, privacy: priv };
                handleSaveProfile(updated);
              }
            }}
            blockedUsers={blockedUsers}
            reports={reports}
            onUnblockUser={handleUnblockUser}
            onSubmitReport={(targetId, alias, category, reason) =>
              handleReportUser({ id: targetId, alias }, category, reason)
            }
          />
        ) : null}
      </main>

      {/* Inspect Profile Modal */}
      {inspectedCandidate && userProfile && (
        <ProfileViewModal
          candidate={inspectedCandidate}
          currentUser={userProfile}
          compatibility={compatibilityCache[inspectedCandidate.id]}
          onClose={() => setInspectedCandidate(null)}
          onSendRequest={handleSendRequest}
          onBlockUser={handleBlockUser}
          onReportUser={handleReportUser}
          isPendingRequest={sentRequests.some(
            (r) => r.toUserId === inspectedCandidate.id && r.status === 'pending'
          )}
          hasDatingLock={
            userProfile.activeMode === 'dating' && !!userProfile.hasActiveDatingConnection
          }
        />
      )}

    </div>
  );
}
