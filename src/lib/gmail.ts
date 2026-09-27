import { GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export interface OAuthSession {
  accessToken?: string;
  email?: string;
  displayName?: string;
}

// SECURE IN-MEMORY STORAGE: Never persist raw access tokens in localStorage
let inMemoryOAuthToken: string | null = null;
let tokenExpiresAt: number = 0;

export function getCachedOAuthToken(): string | null {
  if (inMemoryOAuthToken && Date.now() < tokenExpiresAt) {
    return inMemoryOAuthToken;
  }
  return null;
}

export function setCachedOAuthToken(token: string, expiresInSeconds: number = 3600) {
  inMemoryOAuthToken = token;
  tokenExpiresAt = Date.now() + (expiresInSeconds - 60) * 1000;
}

export function clearOAuthToken() {
  inMemoryOAuthToken = null;
  tokenExpiresAt = 0;
  // Clean up any legacy localStorage entry if it existed
  localStorage.removeItem('relato_oauth_access_token');
}

/**
 * Authorize or re-authorize Google Workspace account with Gmail scopes securely in-memory
 */
export async function authorizeWithGoogleWorkspace(): Promise<{ userCredential: UserCredential; accessToken?: string }> {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;
  if (token) {
    setCachedOAuthToken(token, 3600);
  }
  return { userCredential: result, accessToken: token };
}

/**
 * Send an email via the authorized user's Gmail account using Google Workspace Gmail REST API
 */
export async function sendRelatoGmailNotification(
  accessToken: string | null,
  recipientEmail: string,
  subject: string,
  bodyHtml: string
): Promise<{ success: boolean; error?: string }> {
  const token = accessToken || getCachedOAuthToken();
  if (!token) {
    return {
      success: false,
      error: 'Gmail authorization token is not present in session. Please click "Authorize Gmail Access" to grant permission for this session.'
    };
  }

  try {
    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
    const messageParts = [
      `To: ${recipientEmail}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      bodyHtml
    ];
    const rawMessage = messageParts.join('\r\n');

    // Base64url encode RFC 2822 message
    const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Gmail API response failed:', errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send email via Gmail API:', error);
    return { success: false, error: error?.message || 'Network error while contacting Gmail API' };
  }
}

export function generateConnectionInviteHtml(
  fromAlias: string,
  toAlias: string,
  mode: 'friendship' | 'dating',
  score: number,
  sharedInterests: string[]
): string {
  const isDating = mode === 'dating';
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #FAF8F5; border: 1px solid #EBE5DF; border-radius: 16px; overflow: hidden; color: #2B2B2B;">
      <div style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #F0ECE7; background: #FFFFFF;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 500; letter-spacing: -0.5px; color: #2B2B2B;">relato</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #8F8881; text-transform: uppercase; letter-spacing: 1px;">Mutual Resonance Notification</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; color: #2B2B2B;">New ${isDating ? 'Dating Connection Request' : 'Friendship Request'}</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #524E4A;">
          Hello <strong>${toAlias}</strong>,
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #524E4A;">
          Anonymous profile <strong>${fromAlias}</strong> discovered your profile in <strong>${isDating ? 'Dating' : 'Friendship'}</strong> mode and has requested a connection with an evaluated OSINT resonance score of <strong>${score}%</strong>.
        </p>
        <div style="background: #F3EFEA; border-radius: 12px; padding: 18px 20px; margin: 24px 0;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; color: #7F776F; font-weight: 600; margin-bottom: 8px;">Shared Public Intersections</div>
          <div style="font-size: 14px; color: #2B2B2B; font-weight: 500;">
            ${sharedInterests.map(i => `<span style="display: inline-block; background: #FFFFFF; border: 1px solid #E2DCD5; border-radius: 6px; padding: 4px 10px; margin: 3px 4px 3px 0;">${i}</span>`).join('')}
          </div>
        </div>
        <p style="font-size: 14px; line-height: 1.5; color: #6F6963;">
          Notice: In Relato, connections strictly require <strong>explicit recipient acceptance</strong>. Private messaging cannot begin until you review and accept their request in your Requests dashboard.
        </p>
      </div>
      <div style="padding: 20px 32px; background: #F7F4EF; border-top: 1px solid #ECE7E0; text-align: center; font-size: 12px; color: #9A938B;">
        Relato &bull; Calm, private, OSINT-grounded discovery.<br>
        16–17 Friendship only &bull; 18+ Dating & Friendship &bull; Mutual consent required.
      </div>
    </div>
  `;
}
