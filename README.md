# N A Pharma

An integrated pharmacy and prescription management system built with the MERN stack.

## Project structure

```
N A Pharmacy/
├── backend/        Express + MongoDB REST API  (port 5000)
├── na-pharma/      React + Vite frontend       (port 5173)
└── package.json    Root — dev orchestration
```

---

## Quick start

### 1. Install dependencies

```bash
# From the project root — installs both backend and frontend packages
npm run install:all
```

Or install each workspace manually:

```bash
npm install --prefix backend
npm install --prefix na-pharma
```

### 2. Configure environment variables

Copy and fill in the backend env file:

```bash
# backend/.env
NODE_ENV=development
PORT=5000
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<random secret>
COOKIE_SECRET=<random secret>
CLIENT_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# SSLCommerz — get credentials from https://sandbox.sslcommerz.com
SSLCOMMERZ_STORE_ID=<your store id>
SSLCOMMERZ_STORE_PASSWORD=<your store password>
SSLCOMMERZ_IS_LIVE=false
```

### 3. Start both servers with one command

```bash
npm run dev:all
```

This starts:
- **API** — `http://localhost:5000` (nodemon, auto-restarts on changes)
- **WEB** — `http://localhost:5173` (Vite HMR)

Both servers run in the same terminal with colour-coded prefixes (`[API]` in cyan, `[WEB]` in magenta). Either server crashing will stop both.

### Individual servers

```bash
npm run dev:backend    # API only
npm run dev:frontend   # frontend only
```

### Production build (frontend)

```bash
npm run build          # outputs to na-pharma/dist/
```

---

## Payment integration (SSLCommerz)

Online payments (bKash, Nagad, card) are processed through SSLCommerz.

| Env var | Description |
|---|---|
| `SSLCOMMERZ_STORE_ID` | Merchant store ID from the SSLCommerz dashboard |
| `SSLCOMMERZ_STORE_PASSWORD` | Merchant store password |
| `SSLCOMMERZ_IS_LIVE` | `false` for sandbox, `true` for production |
| `FRONTEND_URL` | Base URL the gateway redirects back to after payment |

Sandbox credentials: [sandbox.sslcommerz.com](https://sandbox.sslcommerz.com)

Payment callback routes (backend):

| Route | Trigger |
|---|---|
| `POST /api/payments/initiate` | Frontend calls this to start a session |
| `POST /api/payments/success` | SSLCommerz redirects here on success |
| `POST /api/payments/fail` | SSLCommerz redirects here on failure |
| `POST /api/payments/cancel` | SSLCommerz redirects here on cancel |
| `POST /api/payments/ipn` | SSLCommerz async server-to-server notification |

---

## Seeding

```bash
npm run seed:admin       --prefix backend
npm run seed:pharmacist  --prefix backend
```
