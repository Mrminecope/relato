import { UserProfile, UserPreferences } from '../types';

export const INITIAL_DISCOVERY_POOL: UserProfile[] = [
  {
    id: 'candidate-lyra-01',
    alias: 'Lyra Vance',
    avatarSeed: 'lyra-indigo',
    age: 24,
    gender: 'Female',
    country: 'Norway',
    heightCm: 172,
    languages: ['English', 'Norwegian', 'German'],
    interests: ['Architecture', 'Ambient Music', 'Specialty Coffee', 'Nordic Cinema', 'Philosophy'],
    activeMode: 'dating',
    allowedModes: ['friendship', 'dating'],
    bio: 'Designing quiet physical spaces by daylight, reading phenomenology by dusk. Looking for thoughtful correspondence and stillness.',
    lookingFor: 'A deliberate mind who appreciates unhurried conversations and Sunday gallery wanderings.',
    osintFootprint: {
      publicGithub: 'lyra-arch-systems',
      publicScholar: 'Atmospheric Phenomenology in Urban Design',
      publicBlogTopics: ['Brutalist Restoration', 'Quiet Acoustics', 'Subtle Typography'],
      publicSubredditsOrForums: ['r/architecture', 'r/ambientmusic', 'r/analog'],
      favoriteBooksAuthors: ['Juhani Pallasmaa', 'Italo Calvino', 'Virginia Woolf'],
      musicAesthetics: ['Brian Eno', 'Nils Frahm', 'Grouper', 'Stars of the Lid'],
      verifiedPublicSignals: ['Open Archive Contributor', 'Architectural Index Verified', 'OSINT Geo-Anchor Oslo'],
      osintSummary: 'Public vector demonstrates deep engagement with sensory architectural literature, Scandinavian modernism, and curated ambient cataloguing.'
    },
    hasActiveDatingConnection: false,
    createdAt: Date.now() - 86400000 * 12,
    updatedAt: Date.now() - 3600000 * 4,
    isOnline: true,
    privacy: {
      hideExactAge: false,
      hideExactHeight: false,
      notifyViaGmail: true
    }
  },
  {
    id: 'candidate-elias-02',
    alias: 'Elias Thorne',
    avatarSeed: 'elias-slate',
    age: 27,
    gender: 'Male',
    country: 'United Kingdom',
    heightCm: 184,
    languages: ['English', 'French'],
    interests: ['Typography', 'Open Source', 'Specialty Coffee', 'Black & White Film', 'Cybernetics'],
    activeMode: 'dating',
    allowedModes: ['friendship', 'dating'],
    bio: 'Typesetter and cryptographic protocol researcher. Believer in durable software, 35mm grain, and well-brewed pour-overs.',
    lookingFor: 'An intellectual partner with equal curiosity for obscure books and quiet train journeys.',
    osintFootprint: {
      publicGithub: 'ethorne-protocols',
      publicScholar: 'Self-Sovereign Identity and Graph Topology',
      publicBlogTopics: ['Digital Privacy', 'Metal Movable Type', 'Monochrome Photography'],
      publicSubredditsOrForums: ['r/typeography', 'r/rust', 'r/darkroom'],
      favoriteBooksAuthors: ['Norbert Wiener', 'W.G. Sebald', 'Ted Chiang'],
      musicAesthetics: ['Ryuichi Sakamoto', 'Max Richter', 'Jon Hopkins'],
      verifiedPublicSignals: ['GPG Public Key 0x4E7A1', 'Open PGP Verified', 'GitHub Arctic Code Vault'],
      osintSummary: 'Strong public research footprint in distributed protocols and historical typographic printing guilds with high cryptographic trust markers.'
    },
    hasActiveDatingConnection: false,
    createdAt: Date.now() - 86400000 * 19,
    updatedAt: Date.now() - 3600000 * 2,
    isOnline: true,
    privacy: {
      hideExactAge: false,
      hideExactHeight: false,
      notifyViaGmail: true
    }
  },
  {
    id: 'candidate-kora-03',
    alias: 'Kora S.',
    avatarSeed: 'kora-blush',
    age: 17, // 16-17 Rule: Friendship only!
    gender: 'Female',
    country: 'Canada',
    languages: ['English', 'Japanese'],
    interests: ['Creative Coding', 'Astronomy', 'Generative Art', 'Ceramics', 'Philosophy'],
    activeMode: 'friendship',
    allowedModes: ['friendship'], // Under 18 constraint strictly enforced
    bio: 'High school senior building creative canvas shaders and mapping lunar craters through amateur telemetry telescopes.',
    lookingFor: 'Friendship with fellow makers and night sky observers who like collaborating on weird internet projects.',
    osintFootprint: {
      publicGithub: 'kora-glsl',
      publicScholar: 'Youth Astrophysics Society Observer',
      publicBlogTopics: ['GLSL Fragment Shaders', 'Lunar Maria Classification'],
      publicSubredditsOrForums: ['r/creativecoding', 'r/telescopes', 'r/generative'],
      favoriteBooksAuthors: ['Carl Sagan', 'Ursula K. Le Guin'],
      musicAesthetics: ['Kikagaku Moyo', 'Ichiko Aoba', 'Hiroshi Yoshimura'],
      verifiedPublicSignals: ['Creative Commons License Holder', 'AAVSO Observer ID Verified'],
      osintSummary: 'Public footprints corroborate active open-source shader contributions and amateur lunar variable star monitoring.'
    },
    hasActiveDatingConnection: false,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000 * 6,
    isOnline: false,
    privacy: {
      hideExactAge: true,
      notifyViaGmail: true
    }
  },
  {
    id: 'candidate-sorin-04',
    alias: 'Sorin Miller',
    avatarSeed: 'sorin-emerald',
    age: 29,
    gender: 'Male',
    country: 'Germany',
    heightCm: 180,
    languages: ['German', 'English'],
    interests: ['Gardening', 'Modular Synths', 'Philosophy', 'Bouldering', 'Architecture'],
    activeMode: 'friendship',
    allowedModes: ['friendship', 'dating'],
    bio: 'Botanical research assistant by morning, Eurorack modular patcher by night. Searching for calm conversations about ecology & systems.',
    lookingFor: 'Thoughtful friends for exchange of field recordings, rare seed varieties, and philosophical essays.',
    osintFootprint: {
      publicGithub: 'sorin-modular-dsp',
      publicScholar: 'Alpine Flora Adaptation in Sub-Zero Microclimates',
      publicBlogTopics: ['Analog Synthesis Logic', 'Urban Permaculture'],
      publicSubredditsOrForums: ['r/modular', 'r/botany'],
      favoriteBooksAuthors: ['Robin Wall Kimmerer', 'Gilles Clément', 'Byung-Chul Han'],
      musicAesthetics: ['Suzanne Ciani', 'Alva Noto', 'Biosphere'],
      verifiedPublicSignals: ['Botanical Garden Herbarium Contributor', 'ModularGrid Verified'],
      osintSummary: 'Organic web trails verify contributions to European plant biodiversity repositories and analog synthesizer circuitry repositories.'
    },
    hasActiveDatingConnection: false,
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 3600000 * 10,
    isOnline: true,
    privacy: {
      hideExactAge: false,
      hideExactHeight: false,
      notifyViaGmail: true
    }
  },
  {
    id: 'candidate-maya-05',
    alias: 'Maya Chen',
    avatarSeed: 'maya-rose',
    age: 25,
    gender: 'Female',
    country: 'United States',
    heightCm: 168,
    languages: ['English', 'Mandarin'],
    interests: ['Typography', 'Nordic Cinema', 'Culinary Chemistry', 'Philosophy', 'Creative Coding'],
    activeMode: 'dating',
    allowedModes: ['friendship', 'dating'],
    bio: 'Independent book curator and sourdough fermentation researcher. Searching for someone gentle who notices subtle details.',
    lookingFor: 'An authentic connection rooted in warmth, creative dialogue, and shared slow dinners.',
    osintFootprint: {
      publicGithub: 'mayachen-press',
      publicScholar: 'Historical Analysis of Movable Types in East Asia',
      publicBlogTopics: ['Fermentation Micro-Ecology', 'Independent Bookshops', 'Cinema Verite'],
      publicSubredditsOrForums: ['r/breadit', 'r/criterion', 'r/bookcollecting'],
      favoriteBooksAuthors: ['Yasunari Kawabata', 'Annie Ernaux', 'John Berger'],
      musicAesthetics: ['Hania Rani', 'Floating Points', 'Cigarettes After Sex'],
      verifiedPublicSignals: ['Independent Press Council Member', 'Goodreads Public Curator'],
      osintSummary: 'Public web footprint documents curation of literary anthologies and culinary research presentations with verified editorial citations.'
    },
    hasActiveDatingConnection: false,
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 3600000 * 1,
    isOnline: true,
    privacy: {
      hideExactAge: false,
      hideExactHeight: false,
      notifyViaGmail: true
    }
  },
  {
    id: 'candidate-julian-06',
    alias: 'Julian Frost',
    avatarSeed: 'julian-warm',
    age: 16, // 16-17 Rule: Friendship only!
    gender: 'Male',
    country: 'Sweden',
    languages: ['Swedish', 'English'],
    interests: ['Astronomy', 'Philosophy', 'Open Source', 'Ambient Music'],
    activeMode: 'friendship',
    allowedModes: ['friendship'], // Under 18 constraint
    bio: 'Junior coder passionate about Linux kernel optimizations and Nordic folklore. Looking for peer friends to discuss code and history.',
    lookingFor: 'Peers around my age (16–17) for shared learning and collaborative projects.',
    osintFootprint: {
      publicGithub: 'jfrost-arch',
      publicBlogTopics: ['Kernel Scheduling', 'Scandinavian Oral Histories'],
      publicSubredditsOrForums: ['r/linux', 'r/archlinux'],
      favoriteBooksAuthors: ['Tove Jansson', 'Richard Feynman'],
      musicAesthetics: ['Carbon Based Lifeforms', 'Solar Fields'],
      verifiedPublicSignals: ['Arch Linux AUR Maintainer', 'FOSS Enthusiast'],
      osintSummary: 'Verified public packaging repositories on AUR and active participation in amateur astronomy forums.'
    },
    hasActiveDatingConnection: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000 * 5,
    isOnline: false,
    privacy: {
      hideExactAge: true,
      notifyViaGmail: true
    }
  }
];

export const AVAILABLE_INTERESTS = [
  'Architecture',
  'Ambient Music',
  'Typography',
  'Specialty Coffee',
  'Creative Coding',
  'Nordic Cinema',
  'Philosophy',
  'Astronomy',
  'Modular Synths',
  'Culinary Chemistry',
  'Gardening',
  'Analog Photography',
  'Independent Press',
  'Open Source',
  'Ceramics',
  'Bouldering',
  'Slow Travel',
  'Acoustic Design'
];

export const AVAILABLE_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Mandarin',
  'Norwegian',
  'Swedish',
  'Italian',
  'Portuguese'
];

export const AVAILABLE_COUNTRIES = [
  'Norway',
  'United Kingdom',
  'United States',
  'Germany',
  'Canada',
  'Sweden',
  'Japan',
  'France',
  'Netherlands',
  'Switzerland'
];
