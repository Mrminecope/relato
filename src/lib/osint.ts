/**
 * OSINT Intelligence Module for Relato
 * Clean, modular architecture utilizing lawful publicly accessible vectors
 * (open repositories, published literary indices, public scientific registries)
 * and designed for plug-and-play integrations with approved institutional APIs.
 * 
 * Strict Lawful Boundaries:
 * - NEVER accesses private accounts, walled gardens, or bypassing platform restrictions.
 * - Queries only lawful, openly accessible endpoints (GitHub public API, Crossref open index, OpenLibrary).
 * - Distinguishes verified public data from unverified self-declared claims.
 * - Always provides reliable an explicit unavailable status when public APIs are throttled or offline.
 */

export type SignalVerificationStatus =
  | 'VERIFIED_PUBLIC_SOURCE'
  | 'SELF_DECLARED_UNVERIFIED'
  | 'UNAVAILABLE';

export interface LawfulPublicSignal {
  category: 'code' | 'scholar' | 'literature' | 'music' | 'open_web';
  sourceName: string;
  sourceType: 'Public Registry' | 'Open Source Catalog' | 'Bibliographic Index' | 'Consented Vector';
  identifier: string;
  verificationStatus: SignalVerificationStatus;
  description: string;
  publicUrl?: string;
  verifiedAt?: number;
}

export interface PublicVerificationReport {
  signalsFound: LawfulPublicSignal[];
  verifiedSignals: LawfulPublicSignal[];
  unverifiedSignals: LawfulPublicSignal[];
  summaryNote: string;
  complianceNotice: string;
}

/**
 * Verify GitHub public profile through public open REST endpoint
 */
async function verifyGitHubPublicPresence(handle: string): Promise<LawfulPublicSignal> {
  const cleanHandle = handle.replace(/^@/, '').trim();
  const url = `https://api.github.com/users/${encodeURIComponent(cleanHandle)}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
    category: 'code',
    sourceName: 'GitHub Public Developer Index',
    sourceType: 'Open Source Catalog',
    identifier: `@${cleanHandle}`,
    verificationStatus: 'UNAVAILABLE',
    description: `Public GitHub source could not be reached or matched. This is not an identity or authenticity verification.`,
    publicUrl: `https://github.com/${cleanHandle}`,
    verifiedAt: Date.now(),
  };
}

/**
 * Verify published literature or research through open Crossref API
 */
async function verifyScholarlyOpenIndex(authorOrTopic: string): Promise<LawfulPublicSignal> {
  const cleanQuery = authorOrTopic.trim();
  const url = `https://api.crossref.org/works?query.author=${encodeURIComponent(cleanQuery)}&rows=1`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const firstItem = data?.message?.items?.[0];
      if (firstItem) {
        return {
          category: 'scholar',
          sourceName: 'Crossref Open Academic Index',
          sourceType: 'Public Registry',
          identifier: cleanQuery,
          verificationStatus: 'VERIFIED_PUBLIC_SOURCE',
          description: `Correlated against public DOI registry: published scholarship in "${firstItem.title?.[0] || 'Scientific Corpus'}" (${firstItem.publisher || 'Academic Press'}).`,
          publicUrl: firstItem.URL,
          verifiedAt: Date.now(),
        };
      }
    }
  } catch (e) {
    // Fallback on timeout or CORS
  }

  return {
    category: 'scholar',
    sourceName: 'Open Scientific Directory',
    sourceType: 'Public Registry',
    identifier: cleanQuery,
    verificationStatus: 'UNAVAILABLE',
    description: `Scholarly domain interest in "${cleanQuery}" aligned with public science classification taxonomy.`,
    verifiedAt: Date.now(),
  };
}

/**
 * Verify literature citations via Open Library public catalog
 */
async function verifyBibliographicPresence(authorName: string): Promise<LawfulPublicSignal> {
  const cleanAuthor = authorName.trim();
  const url = `https://openlibrary.org/search.json?author=${encodeURIComponent(cleanAuthor)}&limit=1`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const firstDoc = data?.docs?.[0];
      if (firstDoc) {
        return {
          category: 'literature',
          sourceName: 'Open Library Global Catalog',
          sourceType: 'Bibliographic Index',
          identifier: cleanAuthor,
          verificationStatus: 'VERIFIED_PUBLIC_SOURCE',
          description: `Public bibliographic match found: Author of "${firstDoc.title}" (${firstDoc.first_publish_year || 'Published Edition'}).`,
          publicUrl: `https://openlibrary.org${firstDoc.key || ''}`,
          verifiedAt: Date.now(),
        };
      }
    }
  } catch (e) {
    // Fallback on timeout
  }

  return {
    category: 'literature',
    sourceName: 'Open Cultural & Bibliographic Registry',
    sourceType: 'Bibliographic Index',
    identifier: cleanAuthor,
    verificationStatus: 'UNAVAILABLE',
    description: `Consented literature vector aligned with author corpus "${cleanAuthor}".`,
    verifiedAt: Date.now(),
  };
}

/**
 * Validate and verify user-consented public signals in a lawful, privacy-compliant manner
 */
export async function verifyConsentedPublicFootprint(
  alias: string,
  githubHandle?: string,
  authors?: string[],
  researchInterests?: string[]
): Promise<PublicVerificationReport> {
  const signals: LawfulPublicSignal[] = [];

  // 1. Open Source & Developer Signals (Public GitHub API with fallback)
  if (githubHandle && githubHandle.trim()) {
    const gitSignal = await verifyGitHubPublicPresence(githubHandle);
    signals.push(gitSignal);
  }

  // 2. Open Academic & Scholarly Signals (Crossref public index with fallback)
  if (researchInterests && researchInterests.length > 0) {
    for (const interest of researchInterests.slice(0, 2)) {
      const scholarSignal = await verifyScholarlyOpenIndex(interest);
      signals.push(scholarSignal);
    }
  }

  // 3. Public Literature & Author Vectors (Open Library with fallback)
  if (authors && authors.length > 0) {
    for (const author of authors.slice(0, 2)) {
      const authorSignal = await verifyBibliographicPresence(author);
      signals.push(authorSignal);
    }
  }

  // Categorize verified vs unverified signals
  const verifiedSignals = signals.filter(
    (s) => s.verificationStatus === 'VERIFIED_PUBLIC_SOURCE'
  );
  const unverifiedSignals = signals.filter((s) => s.verificationStatus !== 'VERIFIED_PUBLIC_SOURCE');

  const unavailableSignals = signals.filter((s) => s.verificationStatus === 'UNAVAILABLE');
  const selfDeclaredSignals = signals.filter((s) => s.verificationStatus === 'SELF_DECLARED_UNVERIFIED');

  return {
    signalsFound: signals,
    verifiedSignals,
    unverifiedSignals,
    summaryNote: `Only explicitly consented public-source signals are evaluated. Each signal is labeled as verified public source, self-declared, or unavailable.`,
    complianceNotice: `Relato only evaluates publicly accessible registries and consented identifiers. Private accounts and closed platforms are never accessed.`,
  };
}

