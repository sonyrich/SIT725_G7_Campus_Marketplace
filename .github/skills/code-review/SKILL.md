---
name: code-review
description: Review-focused checklist for Campus Marketplace pull requests. Use this skill when reviewing pull requests before approval — it verifies listing ownership checks, auth middleware coverage, password/token handling, API response shape, and input validation.
---

# Campus Marketplace — PR Review Checklist

Apply these checks to any pull request touching `backend/` or `frontend/public/js`. Flag violations with severity as noted; everything else is left to normal code-quality judgment.

## High severity — block approval if violated

- **Listing ownership**: any handler that edits, deletes, or marks a listing as sold must check that the listing's `seller` matches the authenticated user's ID before mutating it. A PR that lets any authenticated user modify another user's listing must not be approved.
- **Auth coverage**: routes for create listing, edit listing, delete listing, mark as sold, my listings, contact seller, and report listing must be behind `authMiddleware` (or equivalent JWT verification). A route handling these actions without auth middleware is a blocking issue.
- **Credential handling**: passwords must be hashed with bcrypt before storage and must never appear in logs, API responses, or error messages. JWT secrets must come from environment variables (`.env`), never hardcoded.
- **No plaintext secrets**: `.env` values, API keys, or DB connection strings must not be committed in code or config files.

## Medium severity — request changes

- **Response shape consistency**: success responses should follow `{success: true, data: ...}` and errors `{success: false, message: ...}`, matching the existing Sprint 1 endpoints. Flag new endpoints that deviate without reason.
- **Server-side validation**: listing and user input (required fields, price as a positive number, valid category/condition enum values) must be validated server-side, not just client-side.
- **Error handling**: failed DB calls or invalid input should return a handled error response, not throw an unhandled exception that could crash the server.
- **MVC boundaries**: database queries belong in models, request/response logic in controllers, not mixed directly into route files.

## Low severity — style/consistency

- **Naming and structure**: new files should follow the existing folder convention (`backend/models`, `backend/controllers`, `backend/routes`, `backend/middleware`, `frontend/public/js`) rather than introducing new top-level structure.
- **Image uploads**: file upload logic should reuse the shared `upload.js` middleware rather than duplicating multer setup in a controller.
- **Search/filter behavior**: search should handle the "no results found" case explicitly rather than silently returning an empty array with no indication to the frontend.

## Out of scope for v1 — do not flag as missing features

The following are intentionally excluded from this version of the product and should not be raised as gaps or missing functionality in review:

- On-platform payment processing (buying/selling is coordinated off-platform after "contact seller").
- In-app messaging or chat beyond a basic contact-seller enquiry mechanism.
- Any feature not covered by this list of in-scope functions: user registration, login, logout, create listing, edit listing, delete listing, browse listings, search listings, filter listings, view item details, my listings (view/manage own listings), contact seller, mark item as sold, report listing, and administrator review/removal of reported listings.

If the full SRS is added to the repo (e.g. `docs/SRS.md`), update this section to reference it directly instead of restating the list here, so the two stay in sync.
