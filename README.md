# SIT725 Group 7 — Campus Marketplace

A web-based marketplace built for university students to buy and sell second-hand items (textbooks, electronics, furniture, etc.) within their own campus community — addressing trust and verification gaps found in general marketplaces like Facebook Marketplace or Gumtree.

Built as part of the SIT725 unit project (Deakin University).

- **Repository:** https://github.com/sonyrich/SIT725_G7_Campus_Marketplace
- **Trello board:** https://trello.com/b/Ik4vhXeZ/sit725-campus-marketplace

## Contents

- [Tech Stack](#tech-stack)
- [Quick Start (any computer)](#quick-start-any-computer)
  - [Option A — Docker (easiest)](#option-a--docker-easiest)
  - [Option B — Node.js + MongoDB](#option-b--nodejs--mongodb)
- [Demo Accounts](#demo-accounts)
- [Environment Variables](#environment-variables)
- [npm Scripts](#npm-scripts)
- [Troubleshooting](#troubleshooting)
- [Project Structure (MVC)](#project-structure-mvc)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Testing](#testing)
- [Team & Roles](#team--roles)
- [Git Workflow](#git-workflow)

## Tech Stack

- **Backend**: Node.js (20+), Express 5
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcrypt
- **File uploads**: Multer
- **Architecture**: MVC (Model-View-Controller)
- **Frontend**: HTML, CSS, vanilla JavaScript (served by the same Express server)
- **Testing**: Mocha, Chai, Supertest, mongodb-memory-server, GitHub Actions
- **Containerisation**: Docker + Docker Compose (optional)

## Quick Start (any computer)

The whole app (API **and** website) runs from a single Express server on **http://localhost:3000**. Nothing in the code is tied to one machine — every setting has a sensible default and can be overridden in `backend/.env`.

### Option A — Docker (easiest)

Requires only [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS, Windows or Linux). No Node.js or MongoDB install needed.

```bash
git clone https://github.com/sonyrich/SIT725_G7_Campus_Marketplace.git
cd SIT725_G7_Campus_Marketplace

docker compose up --build            # starts MongoDB + the app
```

In a **second terminal** (optional, but recommended) load the demo data:

```bash
docker compose exec app npm run seed
```

Open **http://localhost:3000**. Stop everything with `Ctrl + C` then `docker compose down`
(add `-v` to also delete the database).

> Port 3000 busy? Run `APP_PORT=8080 docker compose up --build` and open http://localhost:8080.

### Option B — Node.js + MongoDB

**Prerequisites**

- [Node.js 20 or newer](https://nodejs.org/) (`node -v` to check; an `.nvmrc` is included for `nvm use`)
- MongoDB — any **one** of:
  - Docker: `docker compose up -d mongo` (starts only the database from this repo's compose file)
  - macOS (Homebrew): `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`
  - Windows / Linux: install [MongoDB Community Server](https://www.mongodb.com/try/download/community) and start the service
  - Cloud: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (put its connection string in `MONGO_URI`)

**Steps**

```bash
# 1. Clone
git clone https://github.com/sonyrich/SIT725_G7_Campus_Marketplace.git
cd SIT725_G7_Campus_Marketplace

# 2. Install backend dependencies
npm run setup                 # same as: cd backend && npm install

# 3. (Recommended) create your .env from the template
cp backend/.env.example backend/.env         # macOS / Linux
copy backend\.env.example backend\.env       # Windows (Command Prompt)

# 4. Load demo accounts and listings (optional)
npm run seed

# 5. Start the app
npm start                     # or: npm run dev  (auto-restarts on file changes)
```

Open **http://localhost:3000**.

All commands can be run from the **project root** (shown above) or from inside `backend/` — both work.

## Demo Accounts

After running the seed script (`npm run seed`, or `docker compose exec app npm run seed`):

| Email | Password | Role | Notes |
|---|---|---|---|
| `alex.demo@campus.test` | `Password123!` | user | Owns 4 listings (1 already sold) |
| `priya.demo@campus.test` | `Password123!` | user | Owns 5 listings |
| `admin.demo@campus.test` | `Password123!` | admin | Can use the `/api/admin` endpoints |

The seed script is safe to re-run — it only resets these demo accounts and their listings. You can also create your own account on the **Sign up** page.

## Environment Variables

Defined in `backend/.env` (copy from `backend/.env.example`). **All are optional for local development.**

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on. Avoid `5000` on macOS (used by AirPlay Receiver). |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/campus-marketplace` | MongoDB connection string. Uses `127.0.0.1` rather than `localhost` to avoid IPv6 (`::1`) connection failures on newer Node versions. Use your Atlas string for cloud. |
| `JWT_SECRET` | random per start (dev only) | Secret used to sign JWTs. If unset in development a temporary secret is generated (you'll be logged out whenever the server restarts). **Required** when `NODE_ENV=production`. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `1d` | How long a login token is valid (e.g. `1h`, `7d`). |

**Docker note:** inside Docker Compose the app connects to MongoDB using the service name (`mongodb://mongo:27017/...`), because `localhost` inside a container refers to the container itself. This is already configured in `docker-compose.yml`.

## npm Scripts

Run from the project root (or the same names from inside `backend/`):

| Command | What it does |
|---|---|
| `npm run setup` | Installs backend dependencies |
| `npm start` | Starts the server (API + website) |
| `npm run dev` | Starts the server with nodemon (auto-restart) |
| `npm run seed` | Creates demo accounts and listings |
| `npm test` | Runs the automated API tests (in-memory MongoDB) |

## Troubleshooting

| Problem | Fix |
|---|---|
| `MongoDB connection failed ... ECONNREFUSED 127.0.0.1:27017` | MongoDB isn't running. Start it (`docker compose up -d mongo`, `brew services start mongodb-community`, or the Windows *MongoDB Server* service), or point `MONGO_URI` at Atlas. |
| `Port 3000 is already in use` | Set another port in `backend/.env`, e.g. `PORT=3001`. |
| Logged out after restarting the server | Set a fixed `JWT_SECRET` in `backend/.env`. |
| Old page styles after pulling changes | Hard refresh the browser (`Cmd + Shift + R` / `Ctrl + F5`). |
| `docker: command not found` | Install Docker Desktop, or use Option B. |

## Project Structure (MVC)

```
SIT725_G7_Campus_Marketplace/
├── Dockerfile                     # Image for the app (API + frontend)
├── docker-compose.yml             # App + MongoDB, one command
├── package.json                   # Root convenience scripts (setup/start/seed)
├── backend/
│   ├── app.js                     # Express app: middleware, routes, static files
│   ├── server.js                  # Entry point: connects DB, starts listening
│   ├── config/
│   │   ├── env.js                 # Loads .env, provides cross-platform defaults
│   │   └── db.js                  # MongoDB connection
│   ├── models/                    # MODEL — Mongoose schemas
│   │   ├── Users.js
│   │   ├── listing.js
│   │   └── report.js
│   ├── controllers/               # CONTROLLER — business logic
│   │   ├── authController.js
│   │   ├── listingController.js
│   │   ├── reportController.js
│   │   └── adminController.js
│   ├── routes/                    # Route definitions
│   │   ├── authRoutes.js
│   │   ├── listingRoutes.js
│   │   ├── reportRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── adminMiddleware.js     # Admin-only guard
│   │   ├── upload.js              # Multer image upload config
│   │   └── errorHandler.js        # Centralised error handling
│   ├── scripts/
│   │   └── seed.js                # Demo data
│   ├── test/                      # Mocha + Chai + Supertest API tests
│   ├── uploads/                   # Stored listing images (gitignored)
│   └── .env.example               # Environment variable template
└── frontend/public/               # VIEW — static HTML/CSS/JS
    ├── index.html                 # Marketplace homepage
    ├── create-listing.html
    ├── my-listings.html           # FR-11 My Listings dashboard
    ├── edit-listing.html
    ├── report-listing.html
    ├── register.html
    ├── login.html
    ├── css/style.css
    └── js/
```

## API Endpoints

All responses use `{ success: true, data }` on success and `{ success: false, message }` on error. Protected routes need the header `Authorization: Bearer <token>`.

| Method | Route | Auth | Feature | Owner |
|---|---|---|---|---|
| GET | `/api/health` | No | Health check | Krushal |
| POST | `/api/auth/register` | No | FR-01 Register — body `fullName, email, password, studentId` | Aditya / Krushal |
| POST | `/api/auth/login` | No | FR-02 Login — body `email, password` | Jayadhwaj |
| GET | `/api/listings` | No | FR-05 Browse, FR-06 Search — query `?category=&search=` | Sony |
| GET | `/api/listings/mine` | Yes | FR-11 My Listings — the user's own listings (available **and** sold) + `stats`. Optional `?status=available\|sold` | Krushal |
| GET | `/api/listings/:id` | No | FR-08 View details | Surya / Tanvi |
| POST | `/api/listings` | Yes | FR-04 Create — multipart `title, description, price, category, condition, image` | Jayadhwaj / Sony |
| PUT | `/api/listings/:id` | Yes (owner) | FR-09 Edit | Surya |
| PATCH | `/api/listings/:id/status` | Yes (owner) | FR-13 Mark as sold | Sony |
| GET | `/api/listings/:id/contact` | Yes | FR-12 Contact seller | Jayadhwaj |
| POST | `/api/reports` | Yes | FR-14 Report — body `listingId, reason, details?` | Surya |
| GET | `/api/admin/listings` | Admin | FR-15 Review all listings | Jayadhwaj |
| DELETE | `/api/admin/listings/:id` | Admin | FR-15 Remove a listing | Jayadhwaj |

Logout (FR-03) is handled client-side by clearing the stored token.

**Example — FR-11 My Listings response**

```json
{
  "success": true,
  "count": 4,
  "stats": { "total": 4, "available": 3, "sold": 1, "availableValue": 113, "soldValue": 15 },
  "data": [ { "_id": "...", "title": "Intro to Algorithms (4th ed.)", "status": "available", "price": 45, "...": "..." } ]
}
```

**Auth details**: passwords hashed with bcrypt (10 salt rounds); JWT signed with `JWT_SECRET`.

## Data Models

**User**
```
fullName, email (unique), password (hashed), studentID, role (user/admin), timestamps
```

**Listing**
```
title, description, price, category, condition (New/Like New/Good/Fair/Poor),
status (available/sold, default: available), imageUrl, seller (ref: User), timestamps
```

**Report**
```
listing (ref: Listing), reporter (ref: User), reason (inappropriate/suspicious/scam/other),
details, status (pending/reviewed/dismissed), timestamps
```

## Testing

### Automated API tests

29 automated tests (Mocha + Chai + Supertest) cover the app, auth, listings and FR-11 My Listings endpoints — including ownership checks (403), auth checks (401), validation (400) and the dashboard stats.

```bash
npm test              # from the project root or backend/
```

- Tests run against a **throwaway in-memory MongoDB** (`mongodb-memory-server`), so nothing needs to be installed or running and your real data is never touched. The first run downloads a MongoDB binary (~100 MB), so it takes a little longer.
- To use an existing MongoDB instead, set `MONGO_URI_TEST` to a database whose name contains `test` (the suite refuses any other name, because it wipes the database):
  `MONGO_URI_TEST=mongodb://127.0.0.1:27017/campus-marketplace-test npm test`
- Set `TEST_VERBOSE=1` to see server error logs during tests.
- GitHub Actions (`.github/workflows/tests.yml`) runs the suite on Node 20 and 22 for every pull request to `main`.

| File | Covers |
|---|---|
| `backend/test/app.test.js` | Health check, JSON 404 for unknown API routes, static pages served |
| `backend/test/auth.test.js` | FR-01 register (hashing, duplicates, validation), FR-02 login |
| `backend/test/listings.test.js` | FR-04 create, FR-05/06 browse & search, FR-08 get by id, FR-09 edit (owner only), FR-13 mark sold (owner only) |
| `backend/test/myListings.test.js` | FR-11 My Listings: auth, ownership, sorting, stats, status filter, validation |

### Manual testing

- Auth flows (register, login, logout, token expiry)
- Listing flows (create, edit, mark as sold, image upload validation)
- UI responsiveness across viewport sizes (375px, 768px, 1440px)
- Cross-browser checks (Chrome, Firefox, Safari, Edge)

## Team & Roles

### Sprint 1

| Member | Focus | Feature(s) |
|---|---|---|
| Aditya | Express/MongoDB setup, User & Listing models, Registration API | FR-01 |
| Jayadhwaj | Login API, Create Listing API, integration testing | FR-02, FR-04 |
| Sony | GitHub repo setup, image upload middleware, Get All Listings API, dynamic homepage rendering | FR-04, FR-05 |
| Krushal | Homepage UI layout, Create Listing form, Registration API/frontend fix | FR-04, FR-05, FR-01 |
| Tanvi | Frontend setup, Registration form, Login page | FR-01, FR-02 |
| Surya | Logout functionality, authentication/listing/UI testing | FR-03 |

### Sprint 2

| Member | Focus | Feature(s) |
|---|---|---|
| Aditya | Delete Listings, Sprint 2 integration testing, documentation | FR-10 |
| Jayadhwaj | Contact Seller, Administrator Management | FR-12, FR-15 |
| Sony | Search Listings by Keyword, Mark Item as Sold, deployment check | FR-06, FR-13 |
| Krushal | My Listings Dashboard, UI bug fixes & responsive layout, button/navigation standardisation, CSS transitions, cross-device UI testing, portable setup (Docker, seed data) | FR-11 |
| Tanvi | Filter Listings, View Item Details Page, CSS polish | FR-07, FR-08 |
| Surya | Edit Listings, Report Listing, end-to-end testing | FR-09, FR-14 |

## Git Workflow

- `main` is a **protected branch** — no direct commits.
- One feature = one branch, named `feature/<name>-<short-description>` (e.g. `feature/sony-image-upload-middleware`).
- Every branch requires a pull request with **at least one approving review** before merging to `main`.
- Keep commits scoped to a single concern; use conventional prefixes where relevant (`fix:`, `chore:`, `docs:`, `test:`, or `FR-XX:` for feature-requirement work tied to the SRS).

## License

Academic project for SIT725, Deakin University. Not licensed for external distribution.
