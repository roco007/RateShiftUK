# RateShift UK – AI Mortgage Intelligence

> AI Agent monitoring UK fixed-rate mortgage expirations and Bank of England interest rates to recommend optimal remortgaging windows.

## Overview

RateShift UK helps UK homeowners and independent mortgage brokers navigate rate volatility. Our AI agent continuously tracks Bank of England rate forecasts, early repayment penalty structures, and lender criteria to alert users at the precise financial sweet spot to lock in new mortgage deals.

## Features (MVP)

1. **Client Mortgage Vault** – Upload and manage mortgage deal details (Rate, ERC schedule, Expiry date, Balance)
2. **Automated ERC Break-Even Calculator** – Mathematical model showing exact net savings/loss of switching early
3. **BoE Rate Drop Tracking & Recommendation Engine** – Live rate monitoring with visual charts
4. **AI Email Draft Generator** – One-click creation of personalized client update emails with savings figures
5. **Broker Back-Book Alerts** – Automated notifications at 180, 120, 90, 60, and 30 days before deal expiration
6. **Client-facing PDF Report Generator** – Professional reports with AI-generated summaries
7. **Google Sign-In** – Secure authentication with Google OAuth + demo mode
8. **Multi-Provider AI** – Choose between OpenAI GPT, Google Gemini, or Mock mode
9. **Settings Dashboard** – Manage API keys, AI provider, and preferences

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| PDF | jsPDF |
| Icons | Lucide React |
| Auth | Google Identity Services (OAuth 2.0) |
| AI | OpenAI GPT-4o-mini / Google Gemini 2.0 Flash / Mock |
| State | React Context + localStorage |
| Toast | react-hot-toast |

## Architecture

```
src/
├── App.tsx                       # Main app with auth routing & providers
├── main.tsx                      # Entry point
├── index.css                     # Tailwind imports
├── vite-env.d.ts                 # TypeScript env declarations
├── types/
│   └── index.ts                  # All TypeScript interfaces
├── data/
│   └── seed.ts                   # Realistic seeded data (8 clients, 8 mortgages)
├── context/
│   ├── AppContext.tsx             # Global app state with persistence
│   ├── AuthContext.tsx            # Google OAuth + demo auth
│   └── SettingsContext.tsx        # API keys & preferences
├── services/
│   ├── calculator.ts             # ERC break-even math engine
│   └── ai.ts                     # AI providers (OpenAI, Gemini, Mock)
└── components/
    ├── Layout.tsx                # Sidebar navigation + header
    ├── LoginPage.tsx             # Google OAuth + demo login
    ├── ErrorBoundary.tsx         # Production error handling
    ├── Dashboard.tsx             # Overview with stats, rates, alerts
    ├── ClientVault.tsx           # Client CRUD + mortgage management
    ├── BreakEvenCalculator.tsx   # Interactive break-even analysis
    ├── RateTracker.tsx           # BoE rate tracking visualizations
    ├── EmailGenerator.tsx        # AI-powered email drafting
    ├── Alerts.tsx                # Alert management system
    ├── Reports.tsx               # PDF report generation
    └── SettingsPage.tsx          # API keys, provider, preferences
```

## Authentication

RateShift UK supports two authentication methods:

### Google Sign-In (Production)
Uses Google Identity Services (OAuth 2.0) for secure authentication. Requires a Google Cloud project with OAuth credentials configured.

### Demo Mode
One-click demo login as "Mark Thompson" (Independent Mortgage Broker) with full access to all features using seeded data.

## AI Providers

The app supports three AI providers, configurable in Settings:

| Provider | Model | Best For |
|----------|-------|----------|
| **Mock** | Templates | Development, no API key needed |
| **OpenAI** | GPT-4o-mini | High-quality email generation |
| **Google Gemini** | Gemini 2.0 Flash | Cost-effective, fast responses |

All AI features work in Mock mode without any API keys. Keys are stored locally in the browser and never sent to our servers.

## Data Model

### Client
- id, name, email, phone, address, createdAt

### Mortgage
- id, clientId, lender, product, fixedRate, startDate, endDate, termYears
- balance, monthlyPayment, ercSchedule[], type, status

### RateSnapshot
- date, boeBaseRate, avg2yrFixed, avg5yrFixed, avgSVR

### Alert
- id, clientId, mortgageId, type, title, message, date, status, daysUntilExpiry, potentialSavings

### EmailDraft
- id, clientId, mortgageId, subject, body, status, createdAt, savingsAmount

## Local Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rateshift-uk

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth Client ID. If absent, only demo login is available. |
| `VITE_OPENAI_API_KEY` | No | OpenAI API key. If absent, OpenAI provider unavailable. |
| `VITE_OPENAI_MODEL` | No | OpenAI model (default: `gpt-4o-mini`) |
| `VITE_GEMINI_API_KEY` | No | Google Gemini API key. If absent, Gemini provider unavailable. |
| `VITE_GEMINI_MODEL` | No | Gemini model (default: `gemini-2.0-flash`) |

```bash
# .env
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefg.apps.googleusercontent.com
VITE_OPENAI_API_KEY=sk-your-key-here
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_GEMINI_API_KEY=AIza-your-key-here
VITE_GEMINI_MODEL=gemini-2.0-flash
```

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Select **Web application**
6. Add your domain to **Authorized JavaScript origins** (e.g., `http://localhost:5173`)
7. Copy the Client ID to your `.env` file

## Running

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## AI Integration Architecture

The AI layer uses a **provider interface pattern** for flexibility:

```typescript
interface AIProvider {
  generateClientEmail(...): Promise<{ subject: string; body: string }>;
  generateReportSummary(...): Promise<string>;
}
```

### Providers

- **MockAIProvider**: Generates realistic, context-aware responses without API calls
- **OpenAIProvider**: Uses GPT-4o-mini via OpenAI API
- **GeminiProvider**: Uses Gemini 2.0 Flash via Google Generative Language API

Users can switch providers at any time in Settings. The active provider is shown in the header badge.

### AI Workflows

1. **Document Parsing** (future): Extract terms, ERC schedules, and rates from client offer PDFs
2. **Financial Decision Agent**: Calculate mathematical crossover point (ERC cost vs. current best-available rate vs. projected SVR penalty)
3. **Personalized Outreach Generation**: AI drafts hyper-personalized client re-engagement emails with exact potential savings figures

## Break-Even Calculator Logic

The calculator determines whether early mortgage switching is financially beneficial:

1. **ERC Calculation**: Based on remaining months and the lender's ERC schedule bands
2. **Monthly Payment Comparison**: Current fixed rate payment vs. best available market rate
3. **Break-Even Point**: Months until cumulative savings exceed the ERC + product fee
4. **Net Saving**: Total saving over the remaining term after all costs
5. **Recommendation**: `switch-now` | `wait` | `stay` with plain-English explanation

## Production Readiness

- ✅ Error boundaries with user-friendly error pages
- ✅ Toast notifications for all user actions
- ✅ Loading states throughout the application
- ✅ Form validation with error messages
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Secure input handling (password fields, key masking)
- ✅ localStorage persistence with graceful fallbacks
- ✅ TypeScript strict mode
- ✅ Accessible UI (ARIA labels, keyboard navigation)

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in the Vercel dashboard under Project Settings > Environment Variables.

### Netlify

```bash
npm run build
# Deploy the dist/ directory
```

### Environment Variables in Production

Set all `VITE_*` variables in your hosting platform's environment variables dashboard.

## Future Enhancements

1. **Supabase Backend** – Migrate from localStorage to PostgreSQL for production persistence
2. **Open Banking Integration** – Verify mortgage monthly payments automatically via UK Open Banking APIs
3. **Product Sourcing Sync** – Automated API sync with Twenty7Tec / Mortgage Brain systems
4. **Client Portal** – Self-service dashboard for homeowners to view their own analysis
5. **Rate Forecasting** – ML-based BoE rate predictions using historical data
6. **Document OCR** – Parse lender offer PDFs to auto-populate mortgage details
7. **Multi-Broker Support** – Team features with role-based access control
8. **Email Sending** – Integrate SendGrid/Postmark for actual email delivery
9. **Webhook Alerts** – Real-time rate change notifications via push/SMS

## License

Proprietary – RateShift UK © 2025
