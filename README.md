# Drive Box 📦

A cloud file storage web application that lets users organise files into directories, track storage usage, and manage uploads — all through a clean, browser-based interface.

> **Project status:** v1.0.0 — actively developed. See the [Changelog](./CHANGELOG.md) for release history.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Database Scripts](#database-scripts)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

- **Authentication** — Secure local username/email + password authentication via Passport.js, with bcrypt password hashing and session persistence.
- **Directory Management** — Create, rename, and delete nested directories. Deletion soft-deletes all contained files and cascades through the full directory subtree.
- **File Management** — Upload, rename, and soft-delete files within any directory. Original file names are preserved alongside sanitised storage names.
- **Storage Quotas** — Each user has a configurable storage quota (default 32 MB). Storage usage is tracked in real time and enforced on upload.
- **Cloud Storage** — Files are stored in Supabase Storage, keeping the database lean and binaries out of the server.
- **Session Management** — Sessions are persisted to PostgreSQL via `connect-pg-simple`, surviving server restarts.

---

## Tech Stack

| Layer        | Technology                   |
| ------------ | ---------------------------- |
| Runtime      | Node.js (ESM)                |
| Framework    | Express 5                    |
| Templating   | EJS                          |
| Styling      | Tailwind CSS 4               |
| ORM          | Prisma 7                     |
| Database     | PostgreSQL                   |
| File Storage | Supabase Storage             |
| Auth         | Passport.js (Local Strategy) |
| Validation   | express-validator            |
| File Uploads | Multer                       |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **PostgreSQL** database (local or hosted)
- **Supabase** project with a storage bucket

### Installation

```bash
git clone https://github.com/TonyFred-code/drive-box.git
cd drive-box
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable                    | Description                                     |
| --------------------------- | ----------------------------------------------- |
| `DATABASE_URL`              | PostgreSQL connection string                    |
| `PORT`                      | Port the server listens on (default `3000`)     |
| `SESSION_SECRET`            | Secret key used to sign session cookies         |
| `SUPABASE_URL`              | Your Supabase project URL                       |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only)    |
| `SUPABASE_STORAGE_BUCKET`   | Name of the Supabase storage bucket for uploads |

### Database Setup

Run Prisma migrations to create the schema:

```bash
npx prisma migrate deploy
```

Generate the Prisma client:

```bash
npx prisma generate
```

_(Optional)_ Seed development users:

```bash
node db/scripts/seed-users.js
```

### Running the App

**Development** (with auto-restart via nodemon):

```bash
nodemon server.js
```

**Build CSS** (Tailwind — watch mode):

```bash
npm run css:watch
```

**Production**:

```bash
npm run css:build
npm start
```

---

## Project Structure

```
drive-box/
├── app.js                  # Express app setup (middleware, routes, passport)
├── server.js               # HTTP server entry point
├── prisma/
│   └── schema.prisma       # Database schema (User, Directory, File, Session)
├── generated/prisma/       # Auto-generated Prisma client
├── db/
│   ├── user.js             # User DB queries
│   ├── directory.js        # Directory DB queries
│   ├── file.js             # File DB queries
│   └── scripts/            # One-off maintenance scripts
├── controller/             # Route handler logic
├── routes/                 # Express routers
├── middleware/             # Auth guards, error handlers
├── validator/              # express-validator rule chains
├── views/                  # EJS templates
├── public/                 # Static assets (CSS, client JS)
├── config/                 # Passport strategy, session config
├── constants/              # Shared error codes and enums
└── lib/                    # Shared utilities
```

---

## Database Scripts

Utility scripts in `db/scripts/` can be run directly with Node:

| Script                            | Purpose                                             |
| --------------------------------- | --------------------------------------------------- |
| `seed-users.js`                   | Create sample users for local development           |
| `remove-seed-users.js`            | Remove seeded users                                 |
| `backfill-root-directory.js`      | Backfill root directories for existing users        |
| `reconcile-user-storage-usage.js` | Recalculate and correct storage usage for all users |

```bash
node db/scripts/<script-name>.js
```

---

## Roadmap

The following features are planned for future releases:

- **Directory Sharing** — Share directories with other users via invite links or direct user access grants, with configurable permission levels (view / edit).

- **File Upload Drag & Drop** - Drag and drop files into the browser to upload them.

---

## License

[MIT](./LICENSE)
