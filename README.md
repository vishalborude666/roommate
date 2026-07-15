# RooMatch — Rent & Flatmate Finder

A full MERN stack platform where owners list rooms and tenants get AI-ranked
compatibility matches, chat in real time once interest is accepted, and get
notified by email on key events.

**Stack:** React (Vite + Tailwind) · Node.js/Express · MongoDB (Mongoose) ·
Socket.io · Claude API (compatibility scoring) · Nodemailer

---

## 1. Project structure

```
roomatch/
├── backend/
│   ├── config/db.js
│   ├── models/            User, Listing, TenantProfile, Interest, Message, CompatibilityScore
│   ├── middleware/         auth (JWT + role guard), errorHandler
│   ├── controllers/        auth, listing, tenant, interest, chat, admin
│   ├── routes/
│   ├── services/           compatibilityService.js (LLM + rule-based fallback), emailService.js
│   ├── sockets/chatSocket.js
│   ├── utils/generateToken.js, seedAdmin.js
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/      Navbar, ListingCard, ScoreRing, ProtectedRoute
    │   ├── pages/            Landing, Login, Register, OwnerDashboard, PostListing,
    │   │                      TenantProfile, BrowseListings, Chats, AdminDashboard
    │   └── hooks/useChatSocket.js
    └── .env.example
```

---

## 2. Setup guide (run locally in VS Code)

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) **or** a free MongoDB Atlas cluster
- An Anthropic API key (optional but recommended — the app works without one via the rule-based fallback)
- A Gmail account with an **App Password** for sending emails (optional — emails are skipped gracefully if not configured)

### Step 1 — Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your local or Atlas connection string
- `JWT_SECRET` — any long random string
- `ANTHROPIC_API_KEY` — from console.anthropic.com (leave blank to always use the rule-based fallback)
- `EMAIL_USER` / `EMAIL_PASS` — Gmail address + App Password (Google Account → Security → App passwords)

```bash
npm run dev
```

The API starts on `http://localhost:5000`. Check `http://localhost:5000/api/health`.

Optional — create an admin user:
```bash
npm run seed:admin
```
Creates `admin@roomatch.app` / `Admin@123` (override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars).

### Step 2 — Frontend

Open a **second terminal**:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173`. Register as a **tenant** or **owner** to explore.

### Step 3 — Try the flow
1. Register as an **owner** → Post a room.
2. Register as a **tenant** (new browser/incognito) → fill in preferences under "Edit preferences" → Browse rooms (listings are ranked by AI compatibility score) → Express interest.
3. Back in the owner account → Accept the interest request.
4. Both accounts → Chats tab → real-time messaging via Socket.io.
5. Log in as admin (seeded above) → `/admin` for platform stats, user management, and listing moderation.

---

## 3. Database schema (MongoDB / Mongoose)

| Collection | Key fields | Notes |
|---|---|---|
| **User** | name, email (unique), password (hashed), role (`tenant`\|`owner`\|`admin`), phone, isActive | bcrypt hashing via pre-save hook |
| **Listing** | owner (ref User), title, location, rent, availableFrom, roomType, furnishing, description, amenities[], photos[], status (`active`\|`filled`) | text index on title/location for search |
| **TenantProfile** | tenant (ref User, unique), preferredLocations[], budgetMin, budgetMax, moveInDate, roomTypePreference, lifestyle {foodPreference, smoking, pets, workSchedule}, bio | one profile per tenant |
| **CompatibilityScore** | tenant (ref User), listing (ref Listing), score (0–100), explanation, source (`llm`\|`rule-based`) | unique index on (tenant, listing) — **cached, not recomputed on every request** |
| **Interest** | tenant (ref User), owner (ref User), listing (ref Listing), compatibilityScore, status (`pending`\|`accepted`\|`declined`) | unique index on (tenant, listing) prevents duplicate requests |
| **Message** | interest (ref Interest), sender (ref User), text, readBy[] | persisted chat history, indexed by (interest, createdAt) |

**Relationships:** `User (owner) 1—N Listing`, `User (tenant) 1—1 TenantProfile`, `(User tenant, Listing) 1—1 CompatibilityScore`, `(User tenant, User owner, Listing) 1—1 Interest`, `Interest 1—N Message`.

---

## 4. API reference

Base URL: `http://localhost:5000/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/auth/register` | Public | `{ name, email, password, role, phone }` |
| POST | `/auth/login` | Public | `{ email, password }` |
| GET | `/auth/me` | Private | — |

### Listings
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/listings` | Owner | Create listing |
| GET | `/listings/mine` | Owner | Own listings |
| PUT | `/listings/:id` | Owner | Update; invalidates cached scores for that listing |
| PATCH | `/listings/:id/fill` | Owner | Marks filled, hidden from browse |
| GET | `/listings/browse?location=&minRent=&maxRent=&roomType=` | Tenant | Filtered + ranked by compatibility score |
| GET | `/listings/:id` | Private | Single listing |

### Tenant profile
| Method | Route | Access |
|---|---|---|
| PUT | `/tenant/profile` | Tenant — upserts profile, invalidates that tenant's cached scores |
| GET | `/tenant/profile` | Tenant |

### Interests
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/interests/listing/:listingId` | Tenant | Computes/reuses compatibility score, creates request, sends owner email (hot-lead email if score ≥ `HIGH_SCORE_THRESHOLD`, default 80) |
| PATCH | `/interests/:id/respond` | Owner | `{ decision: "accepted" \| "declined" }` — emails tenant |
| GET | `/interests/tenant` | Tenant | My sent interests |
| GET | `/interests/owner` | Owner | Interests received |

### Chat
| Method | Route | Access |
|---|---|---|
| GET | `/chat/conversations` | Private — accepted conversations for logged-in user |
| GET | `/chat/:interestId/messages` | Private — history (only participants, only if accepted) |

**Socket.io events** (connect with `auth: { token }`):
- `join_conversation` `{ interestId }` → ack `{ ok }`
- `send_message` `{ interestId, text }` → persists + broadcasts `new_message` to the room, ack `{ ok, message }`
- `typing` `{ interestId }` → broadcasts `user_typing`

### Admin
| Method | Route |
|---|---|
| GET | `/admin/stats` |
| GET | `/admin/users` |
| PATCH | `/admin/users/:id/status` `{ isActive }` |
| GET | `/admin/listings` |
| DELETE | `/admin/listings/:id` |

---

## 5. LLM compatibility scoring — prompt & example I/O

**Prompt template** (`backend/services/compatibilityService.js`):

```
Given this room listing: {listing JSON} and this tenant profile: {profile JSON},
compute a compatibility score from 0 to 100 based on budget and location match
(also factor in room type and move-in date proximity if relevant). Return ONLY
valid JSON with no markdown formatting, no code fences, and no preamble, in
exactly this shape: { "score": number, "explanation": string }.
```

**Example input:**
```json
{
  "listing": { "title": "Sunny 1BHK near IT park", "location": "Kothrud, Pune", "rent": 14000, "roomType": "1BHK", "furnishing": "semi-furnished" },
  "profile": { "preferredLocations": ["Kothrud", "Baner"], "budgetMin": 10000, "budgetMax": 15000, "roomTypePreference": "1BHK" }
}
```

**Example output:**
```json
{ "score": 87, "explanation": "Rent fits comfortably within budget and the location matches a preferred area, with a strong room-type match." }
```

**Fallback (rule-based), used automatically if the Claude API call fails, times out (15s), or returns malformed JSON:**
- Budget overlap: 60 pts (full if rent within range, partial within a 20% tolerance band)
- Location match: 30 pts (substring match against preferred locations)
- Room type match: 10 pts

Every score is stored in `CompatibilityScore` with a `source` field (`llm` or `rule-based`) so the UI can show an "est." badge when the fallback was used, and so scores are never recomputed on every request — only when the listing or tenant profile changes.

---

## 6. System design notes

- **Compatibility scoring** is decoupled into a service that always writes to `CompatibilityScore` (upsert by tenant+listing), so browsing is fast and LLM calls happen once per pair, not per page view. Editing a listing or tenant profile deletes the relevant cached scores so they're recomputed next time they're needed.
- **LLM fallback** is a pure function (`ruleBasedScore`) with transparent weighted rules, so the app degrades predictably instead of failing when the LLM is down or unconfigured.
- **Chat** uses Socket.io rooms keyed by `interest:<id>`, gated to `accepted` interests and validated on both `join_conversation` and `send_message` so only the two participants can read or write. Messages are persisted before being broadcast, so REST history (`/chat/:id/messages`) and live delivery never disagree.
- **Notifications** are fire-and-forget (failures are logged, never block the request) via a small Nodemailer wrapper with three templates: hot-lead interest, standard interest, and accept/decline decision.
- **Auth** is JWT-based with a role-guard middleware (`tenant` / `owner` / `admin`) reused across REST and Socket.io.

---

## 7. Deploying

- **Backend:** Render / Railway — set the same env vars as `.env.example`, point `MONGO_URI` at Atlas.
- **Frontend:** Vercel — set `VITE_API_URL` / `VITE_SOCKET_URL` to your deployed backend URL, run `npm run build`.
- **CORS:** set `CLIENT_URL` on the backend to your deployed frontend origin.
