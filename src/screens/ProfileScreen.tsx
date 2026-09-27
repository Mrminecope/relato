import { useState } from 'react';
import { UserProfile, ModeType } from '../types';
import { AvatarBadge } from '../components/AvatarBadge';
import { RelatoLogo } from '../components/RelatoLogo';
import {
  User,
  ShieldCheck,
  Heart,
  Users,
  Terminal,
  BookOpen,
  Music,
  ExternalLink,
  Edit3,
  Lock,
  LogOut,
  Sparkles,
  Settings,
  Mail
} from 'lucide-react';

interface ProfileScreenProps {
  userProfile: UserProfile;
  onEditProfile: () => void;
  onSignOut: () => void;
  onOpenSafety: () => void;
}

export function ProfileScreen({
  userProfile,
  onEditProfile,
  onSignOut,
  onOpenSafety,
}: ProfileScreenProps) {
  const isMinor = userProfile.age < 18;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-6 border-b border-[#EBE4DC] mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8A8177]">
            <User className="w-3.5 h-3.5" />
            <span>Anonymous Dossier</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#2B2B2B] mt-1">
            My Public Persona
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEditProfile}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#DDD5CB] text-xs font-medium text-[#2B2B2B] hover:bg-[#FAF8F5] transition-colors cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5CB] text-xs font-medium text-[#736B63] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Profile Card Summary */}
        <div className="bg-white rounded-3xl border border-[#EBE4DC] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <AvatarBadge seed={userProfile.avatarSeed} size="xl" />

            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-serif font-medium text-[#2B2B2B]">
                  {userProfile.alias}
                </h2>
                <span title="Verified Anonymous Identity">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </span>
              </div>

              <p className="text-xs text-[#7A726A] mt-1">
                {userProfile.privacy.hideExactAge ? 'Verified Age Bracket' : `${userProfile.age} years old`} &bull;{' '}
                {userProfile.gender} &bull; {userProfile.country}
                {userProfile.heightCm && !userProfile.privacy.hideExactHeight
                  ? ` &bull; ${userProfile.heightCm} cm`
                  : ''}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#F2EDE7] text-[#554E46]">
                  {userProfile.activeMode === 'dating' ? (
                    <>
                      <Heart className="w-3 h-3 text-[#C68B7D]" />
                      <span>Active in Dating Mode</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-3 h-3 text-[#696159]" />
                      <span>Active in Friendship Mode</span>
                    </>
                  )}
                </span>

                {userProfile.hasActiveDatingConnection && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-[#FAF0ED] text-[#7A3F33] border border-[#ECCDC3]">
                    <Lock className="w-3 h-3" />
                    <span>Single Dating Lock Active</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio & Seeking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#F0EAE2]">
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ECE5DC]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8177] block mb-1">
                Your Bio
              </span>
              <p className="text-xs text-[#524B43] leading-relaxed italic">
                "{userProfile.bio}"
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ECE5DC]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8177] block mb-1">
                Seeking on Relato
              </span>
              <p className="text-xs text-[#524B43] leading-relaxed">
                {userProfile.lookingFor}
              </p>
            </div>
          </div>
        </div>

        {/* OSINT Footprint */}
        <div className="bg-white rounded-3xl border border-[#EBE4DC] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8A8177]">
              <Terminal className="w-4 h-4" />
              <span>Public OSINT Footprint & Gemini Synthesis</span>
            </div>
          </div>

          {userProfile.osintFootprint?.osintSummary && (
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE5DC]">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8C8379] mb-1">
                <Sparkles className="w-3 h-3 text-[#C68B7D]" />
                <span>AI Fingerprint Synopsis:</span>
              </div>
              <p className="text-xs text-[#4F4840] leading-relaxed">
                {userProfile.osintFootprint.osintSummary}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {userProfile.osintFootprint?.favoriteBooksAuthors && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC]">
                <BookOpen className="w-4 h-4 text-[#8C8379] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-mono text-[11px] text-[#2B2B2B] block mb-0.5">
                    Literature & Thinkers
                  </span>
                  <span className="text-[#655E55]">
                    {userProfile.osintFootprint.favoriteBooksAuthors.join(', ')}
                  </span>
                </div>
              </div>
            )}

            {userProfile.osintFootprint?.musicAesthetics && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC]">
                <Music className="w-4 h-4 text-[#8C8379] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-mono text-[11px] text-[#2B2B2B] block mb-0.5">
                    Music & Aesthetic Sound
                  </span>
                  <span className="text-[#655E55]">
                    {userProfile.osintFootprint.musicAesthetics.join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interests */}
          <div className="pt-2">
            <span className="text-xs font-mono text-[#8C8379] block mb-2 uppercase">
              Declared Passions ({userProfile.interests.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {userProfile.interests.map((interest) => (
                <span
                  key={interest}
                  className="text-xs bg-[#F2EDE7] text-[#474037] px-3 py-1 rounded-lg font-mono"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Safety & Settings Shortcut */}
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4DC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <div className="text-xs font-medium text-[#2B2B2B]">Privacy & Safety Controls</div>
              <div className="text-[11px] text-[#7A726A]">
                Manage age obfuscation, Gmail digests, and blocked members
              </div>
            </div>
          </div>
          <button
            onClick={onOpenSafety}
            className="text-xs font-medium text-[#2B2B2B] underline decoration-[#DDD5CB] cursor-pointer"
          >
            Configure
          </button>
        </div>

      </div>
    </div>
  );
}
