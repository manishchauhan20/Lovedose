# Love Proposal Backend

Express + TypeScript API for the frontend in `../Frantend`.

## Features

- Matches the full frontend proposal payload shape, including publish plan and customer details
- MongoDB persistence through Mongoose
- REST endpoints for create, list, fetch, update, delete
- Zod validation for request bodies
- Easy to replace with a database later

## Run

```bash
npm install
npm run dev
```

Server starts on `http://localhost:4000` by default.

## Endpoints

- `GET /health`
- `GET /api`
- `GET /api/templates`
- `GET /api/templates?relationshipType=GF`
- `GET /api/templates/:id`
- `GET /api/proposals`
- `GET /api/proposals/:id`
- `POST /api/proposals`
- `PUT /api/proposals/:id`
- `DELETE /api/proposals/:id`

## Payload

`POST /api/proposals` and `PUT /api/proposals/:id` accept:

```json
{
  "boyName": "Aryan",
  "girlName": "Meera",
  "message": "You are my favorite person.",
  "relationshipType": "GF",
  "howWeMet": "We met in college.",
  "firstMeetingDate": "2024-01-14",
  "nickname": "jaan",
  "whyILoveYou": "You make every day lighter.",
  "futureDreams": "Travel, home, life together.",
  "heroImage": "data:image/jpeg;base64,...",
  "heroImageCaption": "Our favorite memory",
  "gallery": [
    {
      "id": "gallery-1",
      "image": "data:image/jpeg;base64,...",
      "caption": "Our first coffee"
    }
  ],
  "voiceNote": "data:audio/webm;base64,...",
  "publishDurationId": "1m",
  "publishDurationLabel": "1 Month",
  "publishHours": 720,
  "publishPrice": 999,
  "allTemplateAccess": true,
  "purchasedTemplateIds": ["gf-rose-glass", "gf-midnight-bloom"],
  "publishExpiresAt": "2026-04-01T10:00:00.000Z",
  "customerDetails": {
    "fullName": "Aryan Sharma",
    "email": "aryan@example.com",
    "phone": "+91-9999999999",
    "occasion": "Proposal night",
    "notes": "Keep it premium",
    "password": "secret123"
  }
}
```
