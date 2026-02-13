# cold0

A self-hosted cold email sender built with SvelteKit. Manage contact lists, create email templates with dynamic variables, and send personalized bulk emails. Easy to setup and free to fork.

## Features

- **Contact Lists** — Currently supporting CSV imports; Import contacts via CSV and map the fields; you can later add-on contacts manually trough UI
- **Email Templates** — Create reusable templates with variables like `{{firstName}}`, `{{company}}`, `{{industry}}`, format them using html tags, etc.
- **Bulk Sending** — Select contacts, pick a template, and send personalized emails
- **Per-user SMTP** — Each user configures their own SMTP credentials (encrypted at rest)
- **Authentication** — Email/password auth with email verification via Better Auth

## Tech Stack

- **Frontend**: SvelteKit & Tailwind CSS + DaisyUI
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Better Auth
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- PostgreSQL database
- SMTP server for sending verification and outbound emails

### 1. Clone and install

```bash
git clone https://github.com/your-username/cold0.git
cd cold0
bun install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random secret for session signing (min 32 chars) |
| `BETTER_AUTH_URL` | Your app's base URL (e.g. `http://localhost:5173`) |
| `ENCRYPTION_KEY` | Random secret for encrypting stored SMTP passwords (min 32 chars) |

These are used for sending verification emails upon registration
| `SYSTEM_SMTP_HOST` | SMTP host for system emails (verification, password reset) |
| `SYSTEM_SMTP_PORT` | SMTP port (default: `465`) |
| `SYSTEM_SMTP_EMAIL` | System sender email address |
| `SYSTEM_SMTP_PASSWORD` | System SMTP password |

To generate random secrets:

```bash
openssl rand -base64 32
```

### 3. Set up the database

```bash
bunx prisma migrate dev
bunx prisma generate
```

### 4. Start the dev server

```bash
bun dev
```

Open [http://localhost:5173](http://localhost:5173).

### 5. Create your account

1. Register at `/register`
2. Check your email for the verification link
3. Verify and log in
4. Go to **Settings** and configure your SMTP credentials for sending emails

## Deployment

The app can be deployed anywhere that runs Node.js/Bun — VPS with Coolify, Docker, Vercel, etc.

Make sure to:
- Set `BETTER_AUTH_URL` to your production domain
- Use strong, unique values for `BETTER_AUTH_SECRET` and `ENCRYPTION_KEY`
- Use SSL/TLS for your PostgreSQL connection in production

## License

MIT
