import express from 'express';
import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';

const app=express();
app.use(express.json({limit:'256kb'}));

const adminApp=getApps().length?getApps()[0]!:initializeApp({credential:cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!))});
const adminAuth=getAuth(adminApp);
const db=getFirestore(adminApp);
const secret=(n:string)=>{const v=process.env[n];if(!v)throw new Error('Missing server secret: '+n);return v;};
async function requireUid(req:express.Request){const h=req.header('Authorization');if(!h?.startsWith('Bearer '))throw new Error('Missing Firebase ID token');return (await adminAuth.verifyIdToken(h.slice(7))).uid;}
async function profile(uid:string){const s=await db.doc('profiles/'+uid).get();if(!s.exists)throw new Error('Profile not found');return s.data()!;}
function enforce(mode:string,a:any,b:any){
 if(a.age<16||b.age<16)throw new Error('Relato requires age 16+');
 if(a.age<18||b.age<18){if(a.age>=18||b.age>=18||mode!=='friendship')throw new Error('Adult/minor connections are prohibited');}
 if(mode==='dating'&&(a.age<18||b.age<18))throw new Error('Dating requires both participants to be 18+');
}
app.post('/api/gemini/compatibility',async(req,res)=>{
 try{
  const meId=await requireUid(req),me=await profile(meId),candidateId=String(req.body?.candidateUser?.id||'');
  if(!candidateId||candidateId===meId)throw new Error('Invalid candidate');
  const other=await profile(candidateId);
  enforce(String(req.body?.candidateUser?.mode||other.activeMode||'friendship'),me,other);
  if(me.osintFootprint?.consentGranted!==true||other.osintFootprint?.consentGranted!==true)throw new Error('Explicit OSINT consent required');
  const ai=new GoogleGenAI({apiKey:secret('GEMINI_API_KEY')});
  const out=await ai.models.generateContent({model:process.env.GEMINI_MODEL||'gemini-3.5-flash',contents:'Compatibility estimate only. Never claim identity, authenticity, trustworthiness, or verification. Use only explicitly consented public signals. Return JSON. A='+JSON.stringify(me)+' B='+JSON.stringify(other),config:{tools:[{googleSearch:{}}],responseMimeType:'application/json'}});
  const x=JSON.parse(out.text||'{}'),score=Math.max(0,Math.min(100,Number(x.compatibilityScore)||0));
  res.json({compatibilityScore:score,matchGrade:score>=90?'Resonant':score>=80?'Harmonic':score>=70?'Complementary':'Curious',deepAnalysis:x.deepAnalysis||'Compatibility estimate based on consented public signals.',sharedAesthetics:Array.isArray(x.sharedAesthetics)?x.sharedAesthetics.slice(0,5):[],suggestedConversationStarters:Array.isArray(x.suggestedConversationStarters)?x.suggestedConversationStarters.slice(0,3):[],osintInsights:{intellectualResonance:x.osintInsights?.intellectualResonance||'Not available',culturalAffinity:x.osintInsights?.culturalAffinity||'Not available',lifestylePacing:x.osintInsights?.lifestylePacing||'Not available',trustRating:'Compatibility estimate only; identity/authenticity not verified.'}});
 }catch(e:any){res.status(400).send(e?.message||'Compatibility unavailable');}
});
app.post('/api/gemini/osint-synthesis',async(req,res)=>{
 try{
  const id=await requireUid(req),me=await profile(id);if(me.osintFootprint?.consentGranted!==true)throw new Error('Explicit OSINT consent required');
  const ai=new GoogleGenAI({apiKey:secret('GEMINI_API_KEY')});
  const out=await ai.models.generateContent({model:process.env.GEMINI_MODEL||'gemini-3.5-flash',contents:'Create a public-source summary only. Never call the person verified or authentic. Alias='+String(req.body?.alias||'')+' Topics='+JSON.stringify(req.body?.topics||[])+' Books='+JSON.stringify(req.body?.books||[])+' Handles='+String(req.body?.publicHandles||'')});
  res.json({summary:out.text?.trim()||'No public-source summary available.'});
 }catch(e:any){res.status(400).send(e?.message||'OSINT synthesis unavailable');}
});
app.post('/api/connections/accept',async(req,res)=>{
 try{
  const actor=await requireUid(req),requestId=String(req.body?.requestId||'');if(!requestId)throw new Error('requestId required');
  const result=await db.runTransaction(async tx=>{
   const rr=db.doc('requests/'+requestId),rs=await tx.get(rr);if(!rs.exists)throw new Error('Request not found');
   const r=rs.data()!;if(r.toUserId!==actor||r.status!=='pending')throw new Error('Request cannot be accepted');
   const ar=db.doc('profiles/'+r.fromUserId),br=db.doc('profiles/'+r.toUserId),as=await tx.get(ar),bs=await tx.get(br);if(!as.exists||!bs.exists)throw new Error('Participant profile missing');
   const a=as.data()!,b=bs.data()!;enforce(r.mode,a,b);
   const matchId='match-'+crypto.randomUUID(),mr=db.doc('matches/'+matchId);
   if(r.mode==='dating'){
    const la=db.doc('dating_locks/'+r.fromUserId),lb=db.doc('dating_locks/'+r.toUserId),las=await tx.get(la),lbs=await tx.get(lb);
    if((las.exists&&las.data()?.status==='active')||(lbs.exists&&lbs.data()?.status==='active'))throw new Error('One participant already has an active dating connection');
    tx.set(la,{userId:r.fromUserId,partnerId:r.toUserId,matchId,status:'active',createdAt:FieldValue.serverTimestamp()});
    tx.set(lb,{userId:r.toUserId,partnerId:r.fromUserId,matchId,status:'active',createdAt:FieldValue.serverTimestamp()});
   }
   tx.update(rr,{status:'accepted',updatedAt:FieldValue.serverTimestamp()});
   tx.set(mr,{requestId,participantIds:[r.fromUserId,r.toUserId],participants:{[r.fromUserId]:{alias:a.alias,avatarSeed:a.avatarSeed,age:a.age,gender:a.gender,mode:r.mode,country:a.country},[r.toUserId]:{alias:b.alias,avatarSeed:b.avatarSeed,age:b.age,gender:b.gender,mode:r.mode,country:b.country}},type:r.mode,status:'active',compatibilityScore:Number(r.compatibilityScore)||0,sharedInterests:Array.isArray(r.sharedInterests)?r.sharedInterests:[],createdAt:FieldValue.serverTimestamp()});
   return matchId;
  });
  res.json({matchId:result});
 }catch(e:any){res.status(400).send(e?.message||'Accept failed');}
});
app.post('/api/connections/end',async(req,res)=>{
 try{
  const actor=await requireUid(req),matchId=String(req.body?.matchId||'');
  await db.runTransaction(async tx=>{
   const mr=db.doc('matches/'+matchId),ms=await tx.get(mr);if(!ms.exists)throw new Error('Match not found');
   const m=ms.data()!;if(!m.participantIds?.includes(actor))throw new Error('Not a participant');tx.update(mr,{status:'ended',endedAt:FieldValue.serverTimestamp()});
   if(m.type==='dating')for(const id of m.participantIds){const lr=db.doc('dating_locks/'+id),ls=await tx.get(lr);if(ls.exists&&ls.data()?.matchId===matchId)tx.delete(lr);}
  });
  res.json({ok:true});
 }catch(e:any){res.status(400).send(e?.message||'End failed');}
});
app.post('/api/gmail/send',async(req,res)=>{
 try{
  const actor=await requireUid(req),owner=await profile(actor),to=String(req.body?.recipientEmail||''),subject=String(req.body?.subject||''),html=String(req.body?.bodyHtml||'');
  if(!to||!subject||!html)throw new Error('Invalid email payload');
  if(owner.age<18)throw new Error('External email is unavailable for minors');
  const q=await db.collection('profiles').where('email','==',to).limit(1).get();if(q.empty)throw new Error('Recipient not found');
  const recipient=q.docs[0].data()!;if(recipient.age<18)throw new Error('External email is unavailable for minors');
  if(recipient.privacy?.allowEmailConnectionRequests!==true)throw new Error('Recipient has not enabled email connection requests');
  await new Resend(secret('RESEND_API_KEY')).emails.send({from:secret('RELATO_FROM_EMAIL'),to,subject,html});
  res.json({success:true});
 }catch(e:any){res.status(400).send(e?.message||'Email send failed');}
});
app.get('/health',(_,res)=>res.json({ok:true}));
export default app;