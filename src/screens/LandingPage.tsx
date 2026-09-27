import { useState } from 'react';
import { ArrowRight, ShieldCheck, Search, Users, Heart, Lock, Sparkles, CheckCircle2, ChevronRight, Globe, Fingerprint } from 'lucide-react';
import { RelatoLogo } from '../components/RelatoLogo';

interface LandingPageProps {
  onStartSignUp: () => void;
  onStartLogin: () => void;
}

export function LandingPage({ onStartSignUp, onStartLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2B2B2B] flex flex-col justify-between selection:bg-[#E8C2B9] selection:text-[#2B2B2B]">
      
      {/* Top Navigation */}
      <nav className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-7 flex items-center justify-between">
        <RelatoLogo className="h-9" textClassName="text-2xl font-semibold tracking-tight" />
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={onStartLogin}
            className="text-sm font-medium text-[#575048] hover:text-[#2B2B2B] transition-colors px-3 py-1.5 cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onStartSignUp}
            className="text-sm font-medium bg-[#2B2B2B] hover:bg-[#1A1A1A] text-[#FAF8F5] px-5 py-2.5 rounded-full transition-all shadow-xs cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 pt-12 pb-24 text-center">
        
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEAE2] border border-[#DFD8CE] text-xs font-medium text-[#655E55] mb-8">
          <Sparkles className="w-3.5 h-3.5 text-[#C68B7D]" />
          <span>Intentional connection through open intelligence & mutual consent</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-['Playfair_Display',serif] font-normal tracking-tight text-[#222] leading-[1.12] mb-6">
          Find people who think <br className="hidden sm:block" />
          in the same <span className="italic text-[#786F66]">frequencies.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#6B635B] font-light leading-relaxed mb-10">
          Relato replaces shallow swiping with an anonymous, OSINT-inspired discovery system.
          Explore verified public footprints, intellectual aesthetics, and mutual compatibility powered by Gemini.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <button
            onClick={onStartSignUp}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2B2B2B] hover:bg-[#1A1A1A] text-white px-8 py-3.5 rounded-full text-base font-medium shadow-md transition-transform active:scale-[0.98] cursor-pointer"
          >
            <span>Create Anonymous Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onStartLogin}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-[#F2ECE5] text-[#3E3832] border border-[#D8D0C5] px-7 py-3.5 rounded-full text-base font-medium transition-colors cursor-pointer"
          >
            <span>Sign In to Account</span>
          </button>
        </div>

        {/* Visual Preview / Dual Mode Mockup */}
        <div className="relative max-w-4xl mx-auto rounded-3xl bg-white border border-[#EBE4DC] p-6 sm:p-10 shadow-xl overflow-hidden text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Left: Philosophy & Rules */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#9C948B] font-mono">
                System Principles
              </div>
              <h2 className="text-2xl sm:text-3xl font-['Playfair_Display',serif] text-[#242424] leading-snug">
                Private by design. <br />
                Grounded in open resonance.
              </h2>
              
              <ul className="space-y-4 text-sm text-[#5C554D]">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-[#F2EDE7] flex items-center justify-center text-[#2B2B2B] shrink-0">
                    <Fingerprint className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-[#2B2B2B] font-medium">Anonymous Identity:</strong> Choose an alias and aesthetic avatar. Your real personal email and identifiers are strictly protected.
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-[#F2EDE7] flex items-center justify-center text-[#2B2B2B] shrink-0">
                    <ShieldCheck className="w-3 h-3 text-[#2B2B2B]" />
                  </div>
                  <div>
                    <strong className="text-[#2B2B2B] font-medium">Strict Age Boundaries:</strong> Members aged 16–17 are limited exclusively to Friendship. Dating requires age 18+, enforced in Firebase.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-[#F2EDE7] flex items-center justify-center text-[#2B2B2B] shrink-0">
                    <Heart className="w-3 h-3 text-[#D4A396]" />
                  </div>
                  <div>
                    <strong className="text-[#2B2B2B] font-medium">Server-Enforced Dating Lock:</strong> In Dating mode, once an invitation is mutually accepted, users cannot request another partner until the connection ends.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-[#F2EDE7] flex items-center justify-center text-[#2B2B2B] shrink-0">
                    <Lock className="w-3 h-3 text-[#2B2B2B]" />
                  </div>
                  <div>
                    <strong className="text-[#2B2B2B] font-medium">Mutual Acceptance Messaging:</strong> No unsolicited chats. Private real-time messaging unlocks only when both individuals accept.
                  </div>
                </li>
              </ul>
            </div>

            {/* Right: Interactive Card Preview */}
            <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E6DFD6] space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8177] bg-white px-2.5 py-1 rounded-md border border-[#E5DDD4]">
                  OSINT Analysis 94%
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#2B2B2B] font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Now
                </span>
              </div>

              <div className="flex items-center gap-3.5 pt-2">
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#E8C2B9] to-[#6B705C] flex items-center justify-center text-white font-mono text-base font-bold shadow-xs">
                  LV
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#2B2B2B]">Lyra Vance</h3>
                  <p className="text-xs text-[#7A726A]">24 &bull; Female &bull; Norway &bull; Architecture & Ambient Sound</p>
                </div>
              </div>

              <div className="text-xs text-[#625B53] italic bg-white p-3 rounded-xl border border-[#EDE7DF] leading-relaxed">
                "Designing quiet physical spaces by daylight, reading phenomenology by dusk. Looking for thoughtful correspondence."
              </div>

              <div className="pt-2">
                <div className="text-[11px] font-medium uppercase tracking-wider text-[#857C74] mb-1.5">
                  Consented OSINT Vectors
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Juhani Pallasmaa', 'Brian Eno', 'Open Architecture Archive', 'GPG Verified'].map((tag) => (
                    <span key={tag} className="text-[11px] bg-[#EFEAE2] text-[#47413B] px-2 py-0.5 rounded-md font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#EBE4DC] flex gap-2">
                <button
                  onClick={onStartSignUp}
                  className="flex-1 bg-[#2B2B2B] hover:bg-[#111] text-white text-xs font-medium py-2.5 rounded-xl text-center transition-colors cursor-pointer"
                >
                  Request Friend
                </button>
                <button
                  onClick={onStartSignUp}
                  className="flex-1 bg-[#EDE8E1] hover:bg-[#E4DED5] text-[#2B2B2B] text-xs font-medium py-2.5 rounded-xl text-center transition-colors cursor-pointer"
                >
                  Request Chat
                </button>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Feature Pillars */}
      <section className="bg-white border-y border-[#ECE7E1] py-18">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-['Playfair_Display',serif] text-[#222]">
              Engineered for Depth, Not Dopamine
            </h2>
            <p className="text-sm text-[#736B63] mt-3">
              How Relato leverages lawful OSINT, Firebase, and Gemini to cultivate authentic human resonance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#FAF8F5] border border-[#EBE4DB] hover:border-[#D4C8BA] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E2DAD0] flex items-center justify-center text-[#2B2B2B] mb-5">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#242424] mb-2">Lawful OSINT Discovery</h3>
              <p className="text-sm text-[#675F57] leading-relaxed">
                Matches are synthesized using only consented, publicly accessible intellectual vectors — favorite literary works, technical archives, musical preferences, and public discourse topics.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#FAF8F5] border border-[#EBE4DB] hover:border-[#D4C8BA] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E2DAD0] flex items-center justify-center text-[#2B2B2B] mb-5">
                <Sparkles className="w-5 h-5 text-[#C68B7D]" />
              </div>
              <h3 className="text-lg font-semibold text-[#242424] mb-2">Gemini 3.5 Grounding</h3>
              <p className="text-sm text-[#675F57] leading-relaxed">
                Gemini with Google Search Grounding evaluates cultural contexts, generates deep compatibility scores, and provides intelligent, nuanced conversation openers without superficial metrics.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#FAF8F5] border border-[#EBE4DB] hover:border-[#D4C8BA] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E2DAD0] flex items-center justify-center text-[#2B2B2B] mb-5">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-lg font-semibold text-[#242424] mb-2">Mutual Acceptance & Safety</h3>
              <p className="text-sm text-[#675F57] leading-relaxed">
                Zero unsolicited spam. Direct messaging requires reciprocal approval. Dating mode enforces single-connection exclusivity with integrated report and block capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FAF8F5] py-12 border-t border-[#ECE7E1]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <RelatoLogo className="h-7" textClassName="text-xl" />
          <div className="text-xs text-[#8C8379] text-center sm:text-right">
            &copy; 2026 Relato &bull; Calm Discovery &bull; Ages 16–17 Friendship only &bull; Ages 18+ Dating & Friendship
          </div>
        </div>
      </footer>

    </div>
  );
}
