# Sokrates.chat

En sokratisk anamnesetjeneste bygget med Next.js, Firebase og OpenAI Assistants API.

## Innhold
- [Komme i gang](#komme-i-gang)
- [Miljøvariabler](#miljøvariabler)
- [Kjøring lokalt](#kjøring-lokalt)
- [Deploy](#deploy)
- [Mappestruktur](#mappestruktur)
- [API-ruter](#api-ruter)
- [Testing](#testing)
- [Overvåking](#overvåking)

## Komme i gang
1. Klon repoet: `git clone <url>`
2. `cd sokrates.chat` og kjør `npm install`
3. Kopier `.env.example` til `.env.local` og fyll inn nøklene dine.

## Miljøvariabler
- `OPENAI_API_KEY`
- `ASSISTANT_ID`
- `NEXT_PUBLIC_FIREBASE_...`
- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `ADMIN_API_KEY`
- (Valgfritt) `SENTRY_DSN`

## Kjøring lokalt
```bash
npm run dev
# Åpne http://localhost:3000
```

## Deploy
Push til ` main `. GitHub Actions bygger, tester og deployer til Vercel.

## Mappestruktur

Se seksjon 1 i dette dokumentet for detaljert oversikt.

## API-ruter

- ` POST /api/validateClinicCode `

- ` POST /api/registerClinicCode `

- ` POST /api/chat `

- ` POST /api/saveSummary `

- ` POST /api/saveRating `

- ` POST /api/deleteSession `

## Testing

Kjør ` npm ` test for å kjøre Jest-­tester under ` /tests `.

## Overvåking

Sentry med DSN definert i ` SENTRY_DSN `. Se ` /sentry.*.config.js `.

