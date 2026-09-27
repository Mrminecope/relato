export type ModeType='friendship'|'dating';
export type GenderType='Male'|'Female';
export interface UserProfile{
 id:string; alias:string; email?:string; avatarSeed:string; age:number; isMinor?:boolean; gender:GenderType; country:string; heightCm?:number;
 languages:string[]; interests:string[]; activeMode:ModeType; allowedModes:ModeType[];
 osintFootprint?:{publicGithub?:string;publicScholar?:string;publicBlogTopics?:string[];publicSubredditsOrForums?:string[];favoriteBooksAuthors?:string[];musicAesthetics?:string[];verifiedPublicSignals?:string[];osintSummary?:string;consentGranted?:boolean};
 bio:string; lookingFor:string; hasActiveDatingConnection?:boolean; activeDatingConnectionId?:string; createdAt:number; updatedAt:number; isOnline?:boolean;
 privacy:{hideExactAge?:boolean;hideExactHeight?:boolean;notifyViaGmail?:boolean;allowEmailConnectionRequests?:boolean};
}
export interface PublicUserProfile{
 id:string;alias:string;avatarSeed:string;age:number;isMinor:boolean;gender:GenderType;country:string;heightCm?:number;languages:string[];interests:string[];activeMode:ModeType;allowedModes:ModeType[];osintFootprint?:UserProfile['osintFootprint'];bio:string;lookingFor:string;createdAt:number;updatedAt:number;
}
export interface UserPreferences{ageMin:number;ageMax:number;modes:ModeType[];preferredGenders:GenderType[];countries:string[];languages:string[];interests:string[];minCompatibilityScore?:number}
export interface ConnectionRequest{id:string;fromUserId:string;fromUserAlias:string;fromUserAvatar:string;fromUserGender:GenderType;fromUserAge:number;fromUserCountry:string;toUserId:string;toUserAlias:string;type:'friend'|'chat';mode:ModeType;note?:string;compatibilityScore:number;sharedInterests:string[];osintHighlights?:string[];status:'pending'|'accepted'|'declined'|'cancelled';createdAt:number;updatedAt:number}
export interface MatchConnection{id:string;requestId?:string;participantIds:string[];participants:{[userId:string]:{alias:string;avatarSeed:string;age:number;gender:GenderType;mode:ModeType;country:string}};type:ModeType;status:'active'|'archived'|'ended';compatibilityScore:number;sharedInterests:string[];lastMessageText?:string;lastMessageTimestamp?:number;createdAt:number;endedAt?:number}
export interface ChatMessage{id:string;matchId:string;senderId:string;senderAlias:string;text:string;timestamp:number;readBy?:string[]}
export interface SafetyReport{id:string;reporterId:string;reportedUserId:string;reportedUserAlias:string;category:'harassment'|'impersonation'|'underage_dating'|'spam'|'other';reason:string;timestamp:number;status:'pending_review'|'resolved'}
export interface BlockEntry{id:string;userId:string;blockedUserId:string;blockedUserAlias:string;timestamp:number}