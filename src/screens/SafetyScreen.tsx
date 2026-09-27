import { useState } from 'react';
import { UserProfile, SafetyReport, BlockEntry } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Bell,
  Mail,
  UserX,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { sendRelatoGmailNotification, authorizeWithGoogleWorkspace, getCachedOAuthToken } from '../lib/gmail';

interface SafetyScreenProps {
  currentUser: UserProfile;
  onUpdatePrivacy: (privacy: UserProfile['privacy']) => void;
  blockedUsers: BlockEntry[];
  reports: SafetyReport[];
  onUnblockUser: (blockId: string) => void;
  onSubmitReport: (reportedUserId: string, alias: string, category: any, reason: string) => void;
  userAccessToken?: string;
  onAuthorizeGmail?: () => void;
}

export function SafetyScreen({
  currentUser,
  onUpdatePrivacy,
  blockedUsers,
  reports,
  onUnblockUser,
  onSubmitReport,
  userAccessToken,
}: SafetyScreenProps) {
  const [privacy, setPrivacy] = useState(currentUser.privacy);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Manual report state
  const [targetAlias, setTargetAlias] = useState('');
  const [reportCategory, setReportCategory] = useState<'harassment' | 'impersonation' | 'underage_dating' | 'spam' | 'other'>('harassment');
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const toggleOption = (key: keyof UserProfile['privacy']) => {
    const updated = {
      ...privacy,
      [key]: !privacy[key],
    };
    setPrivacy(updated);
    onUpdatePrivacy(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleManualReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAlias || !reportReason) return;
    onSubmitReport('manual-target-' + Date.now(), targetAlias, reportCategory, reportReason);
    setTargetAlias('');
    setReportReason('');
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), 3000);
  };

  const handleAuthorizeGoogleAccount = async () => {
    setIsAuthorizing(true);
    setTestEmailStatus('Requesting Google Workspace OAuth authorization for Gmail...');
    try {
      const { accessToken } = await authorizeWithGoogleWorkspace();
      if (accessToken) {
        setTestEmailStatus('Google Workspace account authorized with Gmail sending permissions!');
      } else {
        setTestEmailStatus('Authorization succeeded with user credentials.');
      }
    } catch (err: any) {
      setTestEmailStatus(`OAuth Error: ${err?.message || 'Could not complete authorization'}`);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleTestGmailNotification = async () => {
    if (!currentUser.email) {
      setTestEmailStatus('Please ensure an email address is associated with your account.');
      return;
    }

    const token = userAccessToken || getCachedOAuthToken();
    if (!token) {
      setTestEmailStatus('No active Google OAuth token found. Click "Authorize Google Workspace Account" above first.');
      return;
    }

    setTestEmailStatus('Dispatching verified test digest via Google Workspace Gmail API...');
    const result = await sendRelatoGmailNotification(
      token,
      currentUser.email,
      'Relato • Mutual Consent Security Confirmation',
      `<div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:24px;background:#FAF8F5;border:1px solid #EBE5DF;border-radius:14px;color:#2B2B2B;">
        <h2 style="font-weight:600;margin-top:0;">Relato Safety Confirmation</h2>
        <p style="font-size:14px;line-height:1.6;color:#554E46;">This is an authorized confirmation confirming your Google Workspace Gmail account is securely linked to Relato.</p>
        <div style="background:#F2EDE7;padding:12px 16px;border-radius:8px;font-size:13px;margin:16px 0;">
          <strong>Anonymous Profile:</strong> ${currentUser.alias} (${currentUser.gender}, ${currentUser.age} yrs)<br>
          <strong>Status:</strong> Reciprocal acceptance enforcement active
        </div>
        <p style="font-size:12px;color:#8A8177;">You will receive real-time notifications whenever another member requests or accepts a connection.</p>
      </div>`
    );

    if (result.success) {
      setTestEmailStatus(`Email successfully sent to ${currentUser.email} via Gmail REST API!`);
    } else {
      setTestEmailStatus(`Gmail notification error: ${result.error || 'Failed to dispatch'}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#EBE4DC] mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8A8177]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Trust, Privacy & Safeguard Controls</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#2B2B2B] mt-1">
          Safety & Privacy Center
        </h1>
        <p className="text-xs text-[#7B736B] mt-1">
          Configure how your public OSINT footprint appears to others, manage blocks, reports, and OAuth Gmail notifications.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Core Safeguards & Age Boundaries Info */}
        <section className="bg-white rounded-2xl border border-[#EBE4DC] p-6 shadow-2xs">
          <h2 className="text-base font-semibold text-[#2B2B2B] mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#8C8379]" />
            <span>Built-in Platform Safeguards & Firestore Security</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#59524A] mt-3">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC]">
              <strong className="text-[#2B2B2B] block mb-1 font-medium">Age Rules (16–17 & 18+):</strong>
              Members aged 16–17 are strictly limited to Friendship mode. The Dating feature is code-locked and verified by Firestore rules.
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC]">
              <strong className="text-[#2B2B2B] block mb-1 font-medium">Single Dating Connection Lock:</strong>
              Once a dating request is mutually accepted, both members cannot send or accept further dating invitations until they choose to end the match.
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC]">
              <strong className="text-[#2B2B2B] block mb-1 font-medium">Mutual Acceptance Gate:</strong>
              Zero unsolicited chats. Direct messaging strictly requires reciprocal approval from the recipient.
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC]">
              <strong className="text-[#2B2B2B] block mb-1 font-medium">Anonymous Identity Shield:</strong>
              Your true legal name and email address are never exposed to peers. All discovery uses anonymous aliases and aesthetic seeds.
            </div>
          </div>
        </section>

        {/* Privacy Toggles & Google Workspace OAuth Gmail */}
        <section className="bg-white rounded-2xl border border-[#EBE4DC] p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#2B2B2B]">Profile Privacy & Gmail Notifications</h2>
              <p className="text-xs text-[#7B736B]">Configure OAuth Gmail alerts and metric visibility</p>
            </div>
            {savedSuccess && (
              <span className="text-xs font-mono text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Updated!
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC]">
              <div>
                <div className="text-xs font-medium text-[#2B2B2B]">Obfuscate Exact Age</div>
                <div className="text-[11px] text-[#787067]">
                  Display your age as a bracket (e.g. 20–24) instead of exact number in discovery
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleOption('hideExactAge')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  privacy.hideExactAge ? 'bg-[#2B2B2B]' : 'bg-[#D6CDC2]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy.hideExactAge ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC]">
              <div>
                <div className="text-xs font-medium text-[#2B2B2B]">Hide Exact Height</div>
                <div className="text-[11px] text-[#787067]">
                  Keep height metric completely private from candidate cards
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleOption('hideExactHeight')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  privacy.hideExactHeight ? 'bg-[#2B2B2B]' : 'bg-[#D6CDC2]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy.hideExactHeight ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC]">
              <div>
                <div className="text-xs font-medium text-[#2B2B2B]">
                  Send Connection Notifications via Google Workspace Gmail
                </div>
                <div className="text-[11px] text-[#787067]">
                  Receive email updates via your authorized Gmail account when requests are received or accepted
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleOption('notifyViaGmail')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  privacy.notifyViaGmail ? 'bg-[#2B2B2B]' : 'bg-[#D6CDC2]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy.notifyViaGmail ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* OAuth Gmail Action controls */}
          <div className="mt-5 p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-[#2B2B2B]">Google Workspace OAuth Authentication</div>
                <div className="text-[11px] text-[#787067]">
                  Authorize your Gmail account to send and receive verified notifications
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAuthorizeGoogleAccount}
                  disabled={isAuthorizing}
                  className="text-xs font-medium text-[#2B2B2B] bg-white hover:bg-[#F2ECE5] border border-[#DDD5CB] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isAuthorizing ? 'Authorizing...' : 'Authorize Gmail Access'}
                </button>
                <button
                  type="button"
                  onClick={handleTestGmailNotification}
                  className="text-xs font-medium text-white bg-[#2B2B2B] hover:bg-[#1A1A1A] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  Send Test Digest
                </button>
              </div>
            </div>

            {testEmailStatus && (
              <p className="text-[11px] font-mono text-[#554E46] bg-white p-2.5 rounded-lg border border-[#E2DBD2]">
                {testEmailStatus}
              </p>
            )}
          </div>
        </section>

        {/* Report Misconduct Section */}
        <section className="bg-white rounded-2xl border border-[#EBE4DC] p-6 shadow-2xs">
          <h2 className="text-base font-semibold text-[#2B2B2B] mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#8C8379]" />
            <span>Submit a Trust or Safety Report</span>
          </h2>
          <p className="text-xs text-[#7B736B] mb-4">
            Reports are immediately stored in the Firestore reports collection and queued for safety moderation.
          </p>

          <form onSubmit={handleManualReportSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#575048] mb-1">
                  Reported User Alias
                </label>
                <input
                  type="text"
                  required
                  value={targetAlias}
                  onChange={(e) => setTargetAlias(e.target.value)}
                  placeholder="e.g. Aura Echo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D1C7] text-xs bg-[#FAF8F5] focus:outline-hidden focus:border-[#2B2B2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#575048] mb-1">Reason Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D1C7] text-xs bg-[#FAF8F5] focus:outline-hidden cursor-pointer"
                >
                  <option value="harassment">Unwanted Harassment / Disrespect</option>
                  <option value="underage_dating">Age Restriction Circumvention (16-17 in Dating)</option>
                  <option value="impersonation">Identity Fabrication / Misleading Signals</option>
                  <option value="spam">Spam / Unsolicited Promotion</option>
                  <option value="other">Other Safety Concern</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#575048] mb-1">Incident Details</label>
              <textarea
                rows={2}
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe what occurred with specific context..."
                className="w-full p-3 rounded-xl border border-[#D9D1C7] text-xs bg-[#FAF8F5] focus:outline-hidden focus:border-[#2B2B2B]"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              {reportSuccess ? (
                <span className="text-xs text-emerald-800 font-mono">Report logged to Firestore moderation. Thank you.</span>
              ) : <span />}
              <button
                type="submit"
                className="bg-[#2B2B2B] hover:bg-[#111] text-white px-5 py-2 rounded-xl text-xs font-medium cursor-pointer"
              >
                Submit Confidential Report
              </button>
            </div>
          </form>

          {reports.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#EDE7DF]">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#8A8177] mb-2.5">
                Your Logged Reports ({reports.length})
              </h3>
              <div className="space-y-2">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-[#2B2B2B]">{rep.reportedUserAlias}</span>
                      <span className="text-[#7A726A] ml-2 text-[11px] capitalize">Category: {rep.category.replace('_', ' ')}</span>
                      <p className="text-[#554E46] text-[11px] mt-0.5 line-clamp-1 italic">"{rep.reason}"</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-medium">
                      {rep.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Blocked Users List */}
        <section className="bg-white rounded-2xl border border-[#EBE4DC] p-6 shadow-2xs">
          <h2 className="text-base font-semibold text-[#2B2B2B] mb-1 flex items-center gap-2">
            <UserX className="w-4 h-4 text-[#8C8379]" />
            <span>Blocked Profiles ({blockedUsers.length})</span>
          </h2>
          <p className="text-xs text-[#7B736B] mb-4">
            Blocked accounts are stored in Firestore and excluded from discovery feeds and communication.
          </p>

          {blockedUsers.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] text-center text-xs text-[#8A8177]">
              No members are currently blocked.
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE5DC] text-xs"
                >
                  <span className="font-medium text-[#2B2B2B]">{b.blockedUserAlias}</span>
                  <button
                    onClick={() => onUnblockUser(b.id)}
                    className="text-xs text-[#7A726A] hover:text-[#2B2B2B] underline cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
