# PuzzleShare

Jigsaw puzzle rental & exchange platform for Ukraine.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Prisma ORM + PostgreSQL
- Tailwind CSS + shadcn/ui
- Auth.js v5 (Credentials provider)
- next-intl (uk/en)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. Clone the repository:

```bash
git clone https://github.com/dimagre/puzzle.git
cd puzzle
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
- `DATABASE_URL` — your PostgreSQL connection string
- `AUTH_SECRET` — generate with `openssl rand -base64 32`

4. Apply database migrations and seed sample data:

```bash
npx prisma migrate dev
npm run prisma:seed
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `npm run prisma:seed` — Populate the database with sample users, categories, puzzles, and orders
