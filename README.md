# SIT725 Group 7 — Campus Marketplace

A web-based marketplace built for university students to buy and sell second-hand items (textbooks, electronics, furniture, etc.) within their own campus community — addressing trust and verification gaps found in general marketplaces like Facebook Marketplace or Gumtree.

Built as part of the SIT725 unit project (Deakin University).

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcrypt
- **File uploads**: Multer
- **Architecture**: MVC (Model-View-Controller)
- **Frontend**: HTML, CSS, vanilla JavaScript

## Team & Roles

### Sprint 1

| Member | Focus | Feature(s) |
|---|---|---|
| Aditya | Express/MongoDB setup, User & Listing models, Registration API | FR-01 |
| Jayadhwaj | Login API, Create Listing API, integration testing | FR-02, FR-04 |
| Sony | GitHub repo setup, image upload middleware, Get All Listings API, dynamic homepage rendering | FR-04, FR-05 |
| Krushal | Homepage UI layout, Create Listing form | FR-04, FR-05 |
| Tanvi | Frontend setup, Registration form, Login page | FR-01, FR-02 |
| Surya | Logout functionality, authentication/listing/UI testing | FR-03 |

### Sprint 2

| Member | Focus | Feature(s) |
|---|---|---|
| Aditya | Delete Listings | FR-10 |
| Jayadhwaj | Contact Seller, Administrator Management | FR-12, FR-15 |
| Sony | Search Listings by Keyword, Mark Item as Sold | FR-06, FR-13 |
| Krushal | My Listings Dashboard | FR-11 |
| Tanvi | Filter Listings, View Item Details Page | FR-07, FR-08 |
| Surya | Edit Listings, Report Listing | FR-09, FR-14 |

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally, via Docker, or a MongoDB Atlas cluster
- npm

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/sonyrich/SIT725_G7_Campus_Marketplace.git
   cd SIT725_G7_Campus_Marketplace/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template and fill in your own values:
   ```bash
   cp .env.example .env
   ```
   See [Environment Variables](#environment-variables) below for what each value means.

4. Start the server:
   ```bash
   npm run dev    # with nodemon (auto-restart on changes)
   # or
   npm start      # plain node
   ```

5. The API will be available at `http://localhost:3000` (or whatever `PORT` you set).

### Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on. Defaults to `3000` if unset. Note: macOS AirPlay Receiver uses port `5000` by default, which can cause `EADDRINUSE` conflicts. |
| `MONGO_URI` | MongoDB connection string. Use `mongodb://localhost:27017/campus-marketplace` for local/Docker standalone Mongo, or your Atlas connection string (with `retryWrites=true&w=majority`) for cloud. |
| `JWT_SECRET` | Secret used to sign JWTs. Generate your own with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `1d`). |

**Note on Docker**: if your backend also runs inside a Docker container (e.g. via `docker-compose`), replace `localhost` in `MONGO_URI` with your MongoDB service name instead (e.g. `mongodb://mongo:27017/campus-marketplace`), since `localhost` inside a container refers to that container itself, not other containers on the same host.

## Project Structure (MVC)

```
campus-marketplace/
├── docs/                                  # API contracts, sprint guides, test plans
├── backend/
│   ├── config/
│   │   └── db.js                          # MongoDB connection setup
│   ├── models/                            # MODEL — Mongoose schemas
│   │   ├── Users.js
│   │   └── listing.js
│   ├── controllers/                       # CONTROLLER — business logic
│   │   ├── authController.js
│   │   └── listingController.js
│   ├── routes/                            # Route definitions
│   │   ├── authRoutes.js
│   │   └── listingRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js              # JWT verification
│   │   ├── upload.js                      # Multer image upload config
│   │   └── errorHandler.js                # Centralized error handling
│   ├── uploads/                            # Stored listing images (gitignored)
│   ├── .env.example                        # Environment variable template
│   ├── server.js                           # App entry point
│   └── package.json
└── frontend/public/                        # VIEW
    ├── index.html                          # Marketplace homepage
    ├── create-listing.html
    ├── register.html
    ├── login.html
    ├── css/style.css
    └── js/
        ├── auth.js                         # Login/register/logout logic
        ├── listings.js                     # Fetches & renders listings dynamically
        └── createListing.js
```

## API Endpoints

### Sprint 1

| Method | Route | Auth Required | Body | Response |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | `fullName, email, password, studentId?` | `201 { success, data: { token, user } }` |
| POST | `/api/auth/login` | No | `email, password` | `200 { success, data: { token, user } }` |
| POST | `/api/auth/logout` | Yes | — | `200 { success, message }` |
| POST | `/api/listings` | Yes | multipart: `title, description, price, category, condition, image` | `201 { success, data: listing }` |
| GET | `/api/listings` | No | Query: `?category=&search=` | `200 { success, data: [listings] }` |

### Sprint 2 (planned)

| Feature | Route (planned) | Owner |
|---|---|---|
| FR-06 Search Listings by Keyword | `GET /api/listings?search=` | Sony |
| FR-07 Filter Listings | `GET /api/listings?category=&condition=` | Tanvi |
| FR-08 View Item Details | `GET /api/listings/:id` | Tanvi |
| FR-09 Edit Listings | `PUT /api/listings/:id` | Surya |
| FR-10 Delete Listings | `DELETE /api/listings/:id` | Aditya |
| FR-11 My Listings Dashboard | `GET /api/listings/mine` | Krushal |
| FR-12 Contact Seller | `POST /api/listings/:id/contact` | Jayadhwaj |
| FR-13 Mark Item as Sold | `PATCH /api/listings/:id/status` | Sony |
| FR-14 Report Listing | `POST /api/listings/:id/report` | Surya |
| FR-15 Administrator Management | `GET/PUT /api/admin/*` | Jayadhwaj |

**Error format**: `{ success: false, message: "..." }`

**Auth details**: passwords hashed with bcrypt (10 salt rounds); JWT signed with `JWT_SECRET`, sent as `Authorization: Bearer <token>` header.

## Data Models

**User**
```
fullName, email (unique), password (hashed), studentId, role (user/admin), timestamps
```

**Listing**
```
title, description, price, category, condition (New/Like New/Good/Fair/Poor),
status (available/sold, default: available), imageUrl, seller (ref: User), timestamps
```

## Git Workflow

- `main` is a **protected branch** — no direct commits.
- One feature = one branch, named `feature/<name>-<short-description>` (e.g. `feature/sony-image-upload-middleware`).
- Every branch requires a pull request with **at least one approving review** before merging to `main`.
- Keep commits scoped to a single concern; use conventional prefixes where relevant (`fix:`, `chore:`, `docs:`, or `FR-XX:` for feature-requirement work tied to the SRS).

## Testing

Manual and automated testing covers:
- Auth flows (register, login, logout, token expiry)
- Listing flows (create, fetch, image upload validation)
- UI responsiveness across viewport sizes (375px, 768px, 1440px)
- Cross-browser checks (Chrome, Firefox, Safari, Edge)

## License

Academic project for SIT725, Deakin University. Not licensed for external distribution.
