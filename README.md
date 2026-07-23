# Interview Prep Hub

## Overview

Interview Prep Hub is a collaborative web application for organizing interview preparation content around structured topics. The platform lets users create and share notes, practice problems, study resources, and daily progress updates in one place.

## Problem it solves

Many interview preparation groups rely on scattered notes, links, and updates across chats or documents. This project centralizes that workflow so learners can:

- keep study material organized by topic
- share useful resources with teammates
- track problems and progress over time
- manage content visibility through role-based access

## Key features

- User registration and sign-in with credentials
- Topic-based knowledge base with parent and child topics
- Markdown-based notes for each topic
- Problem tracking for DSA-related topics, including title, platform, difficulty, and link
- Resource sharing for PDFs, images, cheat sheets, YouTube links, articles, and GitHub repositories
- Daily update posting with markdown support
- Admin tools for managing user roles and resetting passwords
- Role-based content visibility, including restricted-user handling
- Recent activity and daily updates feed on the home page

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth.js for authentication
- Tailwind CSS
- shadcn/ui components
- UploadThing for file uploads
- React Markdown editor via @uiw/react-md-editor

## Architecture overview

The application uses a Next.js App Router architecture with server-rendered pages and route handlers:

- Pages and layouts live under the app directory
- API routes handle authentication, notes, problems, resources, daily updates, and admin actions
- Prisma provides the database layer for topics, users, notes, problems, resources, and daily updates
- NextAuth credentials authentication is wired through the auth configuration
- UploadThing is used for secure file uploads associated with resources

## Folder structure

```text
app/                # Pages, layouts, and route handlers
components/        # Reusable UI and feature components
lib/               # Auth, Prisma, upload, and visibility helpers
prisma/            # Prisma schema, migrations, and seed logic
public/            # Static assets
``` 

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root.

## Environment variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="postgresql://username:password@host:5432/database"
AUTH_SECRET="your-auth-secret"
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

> Replace the placeholder values with your own configuration.

## Database setup

Run Prisma migrations to initialize the database schema:

```bash
npx prisma migrate dev
```

## Running locally

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## API endpoints

The project includes the following route handlers:

### Authentication
- `POST /api/register`
- `GET/POST /api/auth/[...nextauth]`

### Notes
- `POST /api/notes`
- `DELETE /api/notes/[id]`

### Problems
- `POST /api/problems`
- `PATCH /api/problems/[id]`
- `DELETE /api/problems/[id]`

### Resources
- `POST /api/resources`
- `DELETE /api/resources/[id]`
- `POST /api/uploadthing`

### Daily updates
- `POST /api/daily-updates`
- `DELETE /api/daily-updates/[id]`

### Admin
- `PATCH /api/admin/users/[id]`
- `POST /api/admin/users/[id]/reset-password`

## Screenshots

Screenshots are not currently included in the repository. Placeholder previews will be added here as the UI is finalized.

![Dashboard Preview](https://via.placeholder.com/1200x700?text=Interview+Prep+Hub+Dashboard)
![Topic Page Preview](https://via.placeholder.com/1200x700?text=Topic+Page)

## Future improvements

Possible future enhancements include:

- richer search and filtering for topics and content
- improved moderation and content approval flows
- analytics for study activity and progress
- support for additional content types and better file management
- improved mobile experience and accessibility refinements

## License

No license file has been added to the repository yet.
