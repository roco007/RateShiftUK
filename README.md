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

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| PDF | jsPDF |
| Icons | Lucide React |
| AI | OpenAI GPT-4o-mini (with mock fallback) |
| State | React Context + localStorage |

## Architecture

```
src/
├── App.tsx                    # Main app with view routing
├── main.tsx                   # Entry point
├── index.css                  # Tailwind imports
├── vite-env.d.ts              # TypeScript env declarations
├── types/
│   └── index.ts               # All TypeScript interfaces
├── data/
│   └── seed.ts                # Realistic seeded data (8 clients, 8 mortgages)
├── context/
│   └── AppContext.tsx          # Global state management with persistence
├── services/
│   ├── calculator.ts          # ERC break-even math engine
│   ├── ai.ts                  # AI provider interface (OpenAI + Mock)
│   └── rates.ts               # Rate data utilities
└── components/
    ├── Layout.tsx             # Sidebar navigation + header
    ├── Dashboard.tsx          # Overview with stats, rates, alerts
    ├── ClientVault.tsx        # Client CRUD + mortgage management
    ├── BreakEvenCalculator.tsx # Interactive break-even analysis with charts
    ├── RateTracker.tsx        # BoE rate tracking with visualizations
    ├── EmailGenerator.tsx     # AI-powered email drafting
    ├── Alerts.tsx             # Alert management system
    └── Reports.tsx            # PDF report generation
```

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
| `VITE_OPENAI_API_KEY` | No | OpenAI API key. If absent, AI features use realistic mock responses. |
| `VITE_OPENAI_MODEL` | No | Model to use (default: `gpt-4o-mini`) |

```bash
# .env.example
VITE_OPENAI_API_KEY=sk-your-key-here
VITE_OPENAI_MODEL=gpt-4o-mini
```

## Running

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## AI Integration

The AI layer uses a **provider interface pattern** for flexibility:

- **MockAIProvider**: Generates realistic, context-aware responses without API calls. Always available.
- **OpenAIProvider**: Uses GPT-4o-mini for production-quality email generation and report summaries.

When no API key is provided, the app automatically uses mock mode (indicated by a badge in the UI). All AI-generated content is clearly marked.

### AI Workflows

1. **Document Parsing** (future): Extract terms, ERC schedules, and rates from client offer PDFs
2. **Financial Decision Agent**: Calculate mathematical crossover point (ERC cost vs. current best-available rate vs. projected SVR penalty)
3. **Personalized Outreach Generation**: GPT-4o-mini drafts hyper-personalized client re-engagement emails with exact potential savings figures

## Break-Even Calculator Logic

The calculator determines whether early mortgage switching is financially beneficial:

1. **ERC Calculation**: Based on remaining months and the lender's ERC schedule bands
2. **Monthly Payment Comparison**: Current fixed rate payment vs. best available market rate
3. **Break-Even Point**: Months until cumulative savings exceed the ERC + product fee
4. **Net Saving**: Total saving over the remaining term after all costs
5. **Recommendation**: `switch-now` | `wait` | `stay` with plain-English explanation

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Deploy the dist/ directory
```

### Environment Variables in Production

Set `VITE_OPENAI_API_KEY` in your hosting platform's environment variables dashboard.

## Testing

```bash
# Run tests (when configured)
npm test

# Type checking
npx tsc --noEmit
```

## Future Enhancements

1. **Open Banking Integration** – Verify mortgage monthly payments automatically via UK Open Banking APIs
2. **Product Sourcing Sync** – Automated API sync with Twenty7Tec / Mortgage Brain systems
3. **Client Portal** – Self-service dashboard for homeowners to view their own analysis
4. **Rate Forecasting** – ML-based BoE rate predictions using historical data
5. **Document OCR** – Parse lender offer PDFs to auto-populate mortgage details
6. **Multi-Broker Support** – Team features with role-based access control
7. **Supabase Backend** – Migrate from localStorage to PostgreSQL for production persistence

## License

Proprietary – RateShift UK © 2025
