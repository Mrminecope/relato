import { auth } from './firebase';

async function authorized(path:string, init:RequestInit={}) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Authentication session expired. Please sign in again.');
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(path, {...init, headers});
}

export async function authorizeWithGoogleWorkspace():Promise<{authorizationUrl:string}> {
  const r = await authorized('/api/gmail/oauth/start');
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{authorizationUrl:string}>;
}

export function clearOAuthToken():void {}

export async function sendRelatoGmailNotification(
  requestId:string
):Promise<{success:boolean;error?:string}> {
  const r = await authorized('/api/gmail/notify-request',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({requestId}),
  });
  if(!r.ok) return {success:false,error:await r.text()};
  return r.json();
}

export function generateConnectionInviteHtml(fromAlias:string,toAlias:string,mode:'friendship'|'dating',score:number,sharedInterests:string[]) {
  const e=(v:string)=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
  return '<div style="font-family:Arial,sans-serif;padding:32px;background:#FAF8F5;color:#2B2B2B"><h1>relato</h1><h2>New '+(mode==='dating'?'Dating':'Friendship')+' Connection Request</h2><p>Hello <strong>'+e(toAlias)+'</strong>,</p><p>Profile <strong>'+e(fromAlias)+'</strong> requested a connection. Compatibility is an estimate, not identity verification.</p><p>Shared public intersections: '+sharedInterests.map(e).join(', ')+'</p><p>Review and accept inside Relato.</p></div>';
}