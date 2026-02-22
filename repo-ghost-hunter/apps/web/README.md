# Repo Ghost Hunter - Web App

Next.js frontend application for Repo Ghost Hunter.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Chart.js** (via react-chartjs-2)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── repo/[id]/         # Repository details page
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── charts/           # Chart components
│   ├── layout/           # Layout components (Sidebar, Header, etc.)
│   └── tables/           # Table components
├── services/             # Service layer
│   ├── api/              # API client services
│   └── github/           # GitHub integration services
└── public/               # Static assets
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```
