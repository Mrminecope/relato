import { Compass, Users, Heart, MessageSquare, Bell, Shield, SlidersHorizontal, Lock, CheckCircle2 } from 'lucide-react';
import { RelatoLogo } from './RelatoLogo';
import { AvatarBadge } from './AvatarBadge';
import { UserProfile, ModeType } from '../types';

interface HeaderNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userProfile: UserProfile | null;
  pendingRequestsCount: number;
  unreadMatchesCount: number;
  onToggleMode: (newMode: ModeType) => void;
}

export function HeaderNav({
  currentTab,
  onSelectTab,
  userProfile,
  pendingRequestsCount,
  unreadMatchesCount,
  onToggleMode,
}: HeaderNavProps) {
  if (!userProfile) return null;

  const isDatingAllowed = userProfile.allowedModes.includes('dating');

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#ECE7E1] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSelectTab('discover')}
            className="flex items-center gap-2 text-left cursor-pointer group focus:outline-hidden"
          >
            <RelatoLogo className="h-8" textClassName="text-2xl font-semibold tracking-tight text-[#222]" />
          </button>

          {/* Mode Switcher pill */}
          <div className="hidden sm:flex items-center bg-[#EDE8E1] p-1 rounded-full border border-[#DFD8CE]">
            <button
              onClick={() => onToggleMode('friendship')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                userProfile.activeMode === 'friendship'
                  ? 'bg-white text-[#2B2B2B] shadow-xs'
                  : 'text-[#6E675F] hover:text-[#2B2B2B]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Friendship</span>
            </button>

            {isDatingAllowed ? (
              <button
                onClick={() => onToggleMode('dating')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  userProfile.activeMode === 'dating'
                    ? 'bg-[#2B2B2B] text-white shadow-xs'
                    : 'text-[#6E675F] hover:text-[#2B2B2B]'
                }`}
                title={userProfile.hasActiveDatingConnection ? "Active dating connection in place" : "Switch to Dating mode"}
              >
                <Heart className={`w-3.5 h-3.5 ${userProfile.activeMode === 'dating' ? 'fill-current text-[#E8C2B9]' : ''}`} />
                <span>Dating</span>
                {userProfile.hasActiveDatingConnection && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8C2B9] ml-0.5" />
                )}
              </button>
            ) : (
              <div
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#9B938A] cursor-not-allowed select-none opacity-80"
                title="Dating mode requires age 18+. Users aged 16-17 are Friendship mode only."
              >
                <Lock className="w-3 h-3" />
                <span>Dating (18+)</span>
              </div>
            )}
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onSelectTab('discover')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'discover'
                ? 'text-[#2B2B2B] bg-[#EFEAE3]'
                : 'text-[#6C655C] hover:text-[#2B2B2B] hover:bg-[#F2ECE5]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Discover</span>
          </button>

          <button
            onClick={() => onSelectTab('requests')}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'requests'
                ? 'text-[#2B2B2B] bg-[#EFEAE3]'
                : 'text-[#6C655C] hover:text-[#2B2B2B] hover:bg-[#F2ECE5]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-semibold bg-[#2B2B2B] text-white">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('matches')}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'matches'
                ? 'text-[#2B2B2B] bg-[#EFEAE3]'
                : 'text-[#6C655C] hover:text-[#2B2B2B] hover:bg-[#F2ECE5]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Connections</span>
            {unreadMatchesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#D4A396]" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('preferences')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'preferences'
                ? 'text-[#2B2B2B] bg-[#EFEAE3]'
                : 'text-[#6C655C] hover:text-[#2B2B2B] hover:bg-[#F2ECE5]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Preferences</span>
          </button>
        </nav>

        {/* Right action / user profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('safety')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#726B63] hover:text-[#2B2B2B] hover:bg-[#EFEAE3] transition-colors cursor-pointer"
            title="Privacy & Safety Center"
          >
            <Shield className="w-3.5 h-3.5 text-[#8A8177]" />
            <span>Safety & Trust</span>
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              currentTab === 'profile'
                ? 'bg-white border-[#2B2B2B]/40 shadow-xs'
                : 'bg-transparent border-[#DFD8CE] hover:border-[#BDB5AB]'
            }`}
          >
            <AvatarBadge seed={userProfile.avatarSeed} size="sm" />
            <div className="text-left hidden lg:block">
              <div className="text-xs font-medium text-[#2B2B2B] leading-none">{userProfile.alias}</div>
              <div className="text-[10px] text-[#8A8177] capitalize leading-tight mt-0.5">{userProfile.activeMode}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile subnavigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-[#ECE7E1] bg-[#FAF8F5] px-2 py-2">
        <button
          onClick={() => onSelectTab('discover')}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-xs ${
            currentTab === 'discover' ? 'text-[#2B2B2B] font-semibold' : 'text-[#7D766D]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Discover</span>
        </button>
        <button
          onClick={() => onSelectTab('requests')}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 text-xs ${
            currentTab === 'requests' ? 'text-[#2B2B2B] font-semibold' : 'text-[#7D766D]'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span>Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-[#2B2B2B]" />
          )}
        </button>
        <button
          onClick={() => onSelectTab('matches')}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 text-xs ${
            currentTab === 'matches' ? 'text-[#2B2B2B] font-semibold' : 'text-[#7D766D]'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Matches</span>
          {unreadMatchesCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-[#D4A396]" />
          )}
        </button>
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-xs ${
            currentTab === 'profile' ? 'text-[#2B2B2B] font-semibold' : 'text-[#7D766D]'
          }`}
        >
          <AvatarBadge seed={userProfile.avatarSeed} size="sm" className="w-5 h-5 text-[8px]" />
          <span>Profile</span>
        </button>
      </div>
    </header>
  );
}
