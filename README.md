# URL Shortener Dashboard

A full-stack URL shortener with a FastAPI backend and a React + Vite frontend.

The app lets you:

- shorten long URLs
- create a custom alias
- add an optional expiry time in minutes
- redirect short links through the backend
- view total click stats for a short code
- use a polished animated dashboard UI with interactive glow effects

## Project Structure

This repository is split into two sibling folders:

```text
URL_shortner/
|- backend/
|  |- main.py
|  |- database.py
|  |- cache.py
|  |- rate_limiter.py
|  |- utils.py
|  |- requirements.txt
|  `- render.yaml
`- frontend/
   |- src/
   |- public/
   |- package.json
   `- README.md
```

## Tech Stack

### Frontend

- React 19
- Vite
- Custom UI components
- `three`
- `@react-three/fiber`

### Backend

- FastAPI
- Supabase
- Upstash Redis
- Uvicorn

## Features

### URL creation

- Submit a long URL and get back a short link
- Optionally provide a custom alias
- Optionally provide an expiry time in minutes
- Alias length is limited to 10 characters to match the backend constraint

### Redirect flow

- Visiting a short code redirects to the original URL
- Cached links are checked before the database
- Expired links are rejected

### Analytics

- Clicks are logged on redirect
- The dashboard can fetch and display total clicks for a short code

### Frontend UX

- Animated silk background
- Border glow interaction on the main card and form inputs
- Inline validation for alias conflicts and request failures
- Custom expiry stepper controls

## API Endpoints

### `POST /shorten`

Creates a short URL.

Query parameters:

- `original_url` required
- `custom_code` optional
- `expiry_minutes` optional

Example:

```http
POST /shorten?original_url=https://example.com&custom_code=demo1&expiry_minutes=30
```

Example success response:

```json
{
  "short_url": "http://127.0.0.1:8000/demo1",
  "expires_at": "2026-03-30T10:15:00.000000"
}
```

### `GET /{code}`

Redirects the visitor to the original URL if the short code exists and has not expired.

### `GET /stats/{code}`

Returns click stats for a short code.

Example response:

```json
{
  "total_clicks": 3,
  "data": []
}
```

## Environment Variables

Create a `.env` file inside `backend/` with these keys:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
BASE_URL=http://127.0.0.1:8000
```

Do not commit real secrets.

For the frontend, create a `.env` file inside `frontend/` when working locally:

```env
VITE_API_URL=http://127.0.0.1:8000
```

The React app reads the backend base URL from `import.meta.env.VITE_API_URL`.

## Local Development

### 1. Start the backend

Open a terminal in `backend/`.

Create and activate a virtual environment if needed, then install dependencies:

```powershell
pip install -r requirements.txt
```

Run the API:

```powershell
uvicorn main:app --reload
```

The backend runs on:

```text
http://127.0.0.1:8000
```

### 2. Start the frontend

Open a second terminal in `frontend/`.

Install dependencies:

```powershell
npm install
```

Run the Vite dev server:

```powershell
npm run dev
```

The frontend usually runs on:

```text
http://localhost:5173
```

Make sure `VITE_API_URL` points to the backend you want to use.

## Available Frontend Scripts

```powershell
npm run dev
npm run build
npm run preview
npm run lint
```

## Deployment Notes

The backend includes a `render.yaml` file for Render deployment.

Current Render service settings:

- runtime: Python
- build command: `pip install -r requirements.txt`
- start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

If you deploy the backend, update `BASE_URL` so generated short links point to the deployed API instead of localhost.

### Vercel frontend deployment

If you deploy the frontend to Vercel:

1. Import the `frontend/` project into Vercel.
2. Set the build command to:

```text
npm run build
```

3. Set the output directory to:

```text
dist
```

4. Add this environment variable in Vercel:

```text
VITE_API_URL=https://your-backend-domain.com
```

Use your deployed FastAPI backend URL for `VITE_API_URL`.

## Known Notes

- The frontend build currently works, but the bundle is larger because of the `three` background.
- Alias conflicts and validation issues are shown inline in the dashboard UI.
- If you change backend serialization or database constraints, restart the backend server so the frontend hits the latest code.

## Recommended Workflow

1. Start the backend first.
2. Start the frontend.
3. Enter a long URL.
4. Optionally add a custom alias and expiry time.
5. Create the short URL.
6. Use the generated short link and inspect stats from the dashboard.
