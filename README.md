# Relato

Privacy-first social discovery built around consent, boundaries, and public-source context.

Relato is an open-source social connection project that combines anonymous profiles, interest-based discovery, consented OSINT context, AI-assisted compatibility estimates, and safety controls.

## Core principles

- **Consent first:** OSINT evaluates only lawful public sources and explicitly consented public identities or handles.
- **Privacy by projection:** public discovery should expose only approved public fields. Private email addresses, privacy settings, and dating-lock state stay private.
- **AI is not identity proof:** Gemini can provide compatibility or conversation context, but its output is an estimate, not identity, authenticity, trust, or verification.
- **Age safety:** ages 16–17 are friendship-only. Dating is limited to people aged 18+ and adult/minor connections are prohibited.
- **Mutual consent:** a connection request must be accepted before private chat begins.
- **Gmail opt-in:** external email communication requires recipient opt-in; minors stay inside Relato.

## Project structure

```
.
├── docs/                  # GitHub Pages project site
├── src/
│   ├── components/        # Existing Relato UI components
│   ├── data/              # Static option lists and development data
│   ├── lib/               # Firebase, Gemini, Gmail, and OSINT integrations
│   ├── screens/           # Relato application screens
│   └── App.tsx            # Application shell and state orchestration
├── firestore.rules        # Firestore authorization rules
└── package.json
```

## Local development

Requirements:

- Node.js
- A Firebase project with Authentication and Firestore enabled
- The Firebase configuration used by the application

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The current application is configured for Vite development on port 3000.

## Firebase

Relato uses Firebase Authentication and Cloud Firestore.

The Firestore rules are intended to enforce:

- owner-only private profile access
- restricted public profile projections
- immutable request participants/type/mode
- sender-only request cancellation
- recipient-only accept/decline
- participant-only active-match chat access
- owner-only blocks/reports where appropriate
- no client writes to dating locks or match lifecycle records in the hardened architecture

Before production deployment, publish and test `firestore.rules` with the Firebase Emulator Suite or your Firebase project.

## Gemini

Gemini should be configured as a server-side capability.

Do **not** expose a Gemini API key through a browser environment variable such as:

```text
VITE_GEMINI_API_KEY
```

The security-hardened architecture moves Gemini requests behind authenticated server routes and uses the server-side `GEMINI_API_KEY` secret.

## Gmail

Relato supports Gmail communication as an optional integration.

The production flow should:

1. use secure Google Workspace OAuth
2. keep OAuth refresh/access credentials server-side
3. require explicit recipient permission for external connection-request emails
4. keep minor communication inside Relato
5. never reveal a private recipient email address through public discovery

## OSINT boundaries

Supported OSINT work is limited to lawful public information and approved APIs.

Relato must not:

- access private accounts
- bypass platform restrictions
- scrape walled or restricted sources
- silently identify a non-consenting person
- automatically contact a person discovered through OSINT

Every result should be labeled as one of:

- **Verified public source**
- **Self-declared**
- **Unavailable**

A compatibility estimate must never be described as identity or authenticity verification.

## Development data

Demo or mock discovery data belongs in development/demo mode only.

Production discovery should come from persisted Firestore data and should not silently fall back to fabricated profiles or compatibility scores.

## Security hardening

The repository includes a security-hardening change set focused on Firestore authorization, trusted connection lifecycle operations, Gemini server-side access, Gmail consent, and OSINT provenance.

Before treating the project as production-ready, run the full type-check/build pipeline and verify Firebase rules with integration tests.

## GitHub Pages

The project site is published from `docs/` through GitHub Actions.

Expected project-site URL:

**https://mrminecope.github.io/relato/**

GitHub Pages deployment uses the standard Pages artifact/deploy actions and runs from the `main` branch.

## Contributing

Issues and pull requests are welcome.

For security-sensitive reports, avoid publishing exploitable details in a public issue. Contact the repository owner privately first.

## License

Relato is released under the MIT License. See [LICENSE](LICENSE).
