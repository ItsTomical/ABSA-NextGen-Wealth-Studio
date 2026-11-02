Student: Thomas Yardley
Student Number: 2709983
Module: DIGA4015A
Assignment: 3 - Exam - ABSA NextGen Wealth Studio

# ABSA NextGen Wealth Studio

A financial planning web application built for ABSA, targeting young South African professionals in their first five years of working life.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Demo Login

- Email: any valid email format (e.g. `name@email.com`)
- Password: anything (e.g. `1`)

## Tech Stack

- React 19 with React Router v7
- Vite
- Recharts for data visualisation
- Custom CSS with design tokens (no UI framework)

## Features

- **Dashboard** — Live money snapshot with SARS PAYE/UIF calculations, categorised expense breakdown, goals progress, and health score
- **Strategy Tracks** — Four distinct 5-year financial tracks (First Property Path, Balanced Lifestyle, Aggressive Global Investor, Debt Destroyer) with milestone tracking
- **Simulation Lab** — Three interactive studios: Property vs. Renting, Luxury Car vs. Invest, and Local vs. Offshore Allocation
- **Learn** — Glossary of SA financial terms with personalised context

## Notes

- User profile and progress are persisted to `localStorage` — data survives page refreshes
- All tax calculations use the 2026/2027 SARS brackets
- No external UI kit — all styles are custom CSS
