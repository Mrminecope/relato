import { GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export async function authorizeWithGoogleWorkspace(): Promise<{ userCredential: UserCredential }> {
  return { userCredential: await signInWithPopup(auth, googleProvider) };
}

export function clearOAuthToken(): void {}

export async function sendRelatoGmailNotification(recipientEmail:string, subject:string, bodyHtml:string){
  const r = await fetch('/api/gmail/send', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipientEmail,subject,bodyHtml})});
  if(!r.ok) return {success:false,error:await r.text()};
  return r.json();
}

export function generateConnectionInviteHtml(fromAlias:string,toAlias:string,mode:'friendship'|'dating',score:number,sharedInterests:string[]){
  const e=(v:string)=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
  return '<div style="font-family:Arial,sans-serif;padding:32px;background:#FAF8F5;color:#2B2B2B"><h1>relato</h1><h2>New '+(mode==='dating'?'Dating':'Friendship')+' Connection Request</h2><p>Hello <strong>'+e(toAlias)+'</strong>,</p><p>Profile <strong>'+e(fromAlias)+'</strong> requested a connection. Compatibility is an estimate, not identity verification.</p><p>Shared public intersections: '+sharedInterests.map(e).join(', ')+'</p><p>Review and accept inside Relato.</p></div>';
}