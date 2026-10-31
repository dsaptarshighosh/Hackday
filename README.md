# Living Lens

Living Lens is a wildlife field monitoring prototype for reviewing forest areas, analyzing field media, and managing nearby community alerts. The app includes a dashboard, forest management tools, live media analysis, a citizen portal, and a demonstration wildlife risk model.

> **Prototype notice:** Risk scores and alerts are experimental demonstrations, not validated forecasts or official emergency warnings. Follow guidance from local authorities.

## Features

- Browse and manage forest locations, with sample locations across India.
- Review simulated sensor activity and analyze audio or video with Gemini.
- View demonstration wildlife behavior risk estimates from the bundled Zoo Sentinel model.
- Register citizen contacts and display alerts based on a selected forest and radius.
- Optionally send alert emails through Resend.

## Run locally

The application is in [`Project2.0`](Project2.0/).

Requirements: Node.js and npm.

```powershell
cd Project2.0
npm install
Copy-Item .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app can run without API credentials, but Gemini media analysis and email delivery require configuration described below.

## Configuration

Set these values in `Project2.0/.env` as needed:

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Enables Gemini-powered media analysis. |
| `RESEND_API_KEY` | Enables server-side alert email delivery through Resend. |
| `RESEND_FROM_EMAIL` | Verified sender address used for alert emails. |
| `APP_URL` | Optional hosted app URL for deployment integrations. |

Keep secrets in the server environment. Do not commit `.env`; use `.env.example` as the template.

## Build and type check

Run these commands from `Project2.0`:

```powershell
npm run build
npm run lint
```

## Demo model data

The Zoo Sentinel model is bundled under `Project2.0/model2`. Its synthetic training data and regeneration instructions are documented in [`Project2.0/data/README.md`](Project2.0/data/README.md). The model output is for demonstration only and is not a validated hazard forecast.
