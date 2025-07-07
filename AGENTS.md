
# 🧠 Sokrates – OpenAI Agent-integrasjon

Denne filen dokumenterer hvordan OpenAI Assistant API er integrert i prosjektet, hvordan agenten fungerer, og hvordan koden kan utvides eller tilpasses. Formålet er å gi veiledning til utviklere (og AI-agenter) som skal forstå eller jobbe videre med systemet.

---

## 📌 Formål

Agenten brukes for å lede pasienten gjennom en sokratisk samtale og samle inn en strukturert medisinsk anamneseskjema. Chatten mellom pasienten og agenten resulterer i et JSON-objekt som senere vurderes av en lege.

---

## ⚙️ Teknisk oppsett

### 🔑 API-nøkler

Alle nøkkelverdier defineres i `.env.local` (ikke sjekk inn sensitivt). Eksempel:

```env
OPENAI_API_KEY="sk-..."
ASSISTANT_ID="asst-..."
```

---

## 🧠 Brukt API: OpenAI Assistants API

- **Modell:** GPT-4
- **Assistant ID:** definert i `.env.local`
- **Metode:** `chat.completions.create({ assistant_id, messages, response_format: ... })`
- **Svarformat:** `response_format = { type: 'json', schema: { ... } }`

---

## 🧾 JSON-schema (for anamnesesvar)

OpenAI-agenten genererer strukturert JSON som ser slik ut:

```json
{
  "hovedplage": "string",
  "tidligereSykdommer": "string",
  "medisinering": "string",
  "allergier": "string",
  "familiehistorie": "string",
  "sosialLivsstil": "string",
  "ros": "string",
  "pasientMål": "string",
  "friOppsummering": "string"
}
```

Dette schemaet sendes inn som en del av `response_format.schema` i API-kallet og validerer at agenten returnerer korrekt struktur.

---

## 📂 Relevant filstruktur

| Fil | Formål |
|-----|--------|
| `pages/api/chat.ts` | Kaller OpenAI Assistant API og returnerer strømmende respons |
| `components/ChatWindow.tsx` | UI-komponenten som viser meldinger og sender brukerinput |
| `lib/firebase.ts` | Klientinitialisering av Firebase |
| `pages/chat.tsx` | Starter ny sesjon, logger pasient inn anonymt, og bruker ChatWindow |
| `pages/api/startSession.ts` | Starter en ny pasientsesjon og knytter den til lege |
| `pages/api/saveSummary.ts` | Lagrer oppsummeringen (JSON-svar) i Firestore |

---

## 🔐 Autentisering

- Pasienter logger inn anonymt via Firebase (`signInAnonymously`)
- Hver forespørsel til `/api/chat` inkluderer en Bearer-token fra Firebase
- Token verifiseres i API før kall til OpenAI skjer

---

## 🔁 Prompt-logikk

```ts
const systemPrompt = isEdit
  ? { role: 'system', content: 'Oppdater det forrige JSON-objektet basert på brukerens redigering.' }
  : { role: 'system', content: 'Still sokratiske spørsmål for å fylle ut JSON-schemaet.' }
```

Brukes til å styre samtaletonen – ved redigering gis agenten instruks om å endre eksisterende JSON, ellers starter den en sokratisk dialog.

---

## 🧪 Testing

For testformål:

- Du kan simulere samtale med `/api/chat` med ferdig `messages`-array.
- Sjekk at resultatet returneres som en gyldig JSON som matcher schema.
- Test gjerne med curl eller Postman med Firebase-token som header.

---

## 💡 Videre arbeid

- Legge til støtte for flere språk i systemprompt
- Validering av output i frontend
- Prompt-tuning basert på medisinsk domene
- Logging av prompts/respons for læring (må være GDPR-sikret)

---

## 🧩 Eksempel på API-kall

```ts
const stream = await openai.chat.completions.create(
  {
    assistant_id: process.env.ASSISTANT_ID!,
    messages: [systemPrompt, ...messages],
    response_format: {
      type: 'json',
      schema: <json-skjema>,
    },
    stream: true,
  },
  { responseType: 'stream' }
)
```

---

## 👤 Ansvarlig utvikler

- Hovedkontakt: @damoun.nassehi
- OpenAI-agent ble satt opp og finjustert i mai/juni 2025.
