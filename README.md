TradeTrack — Export/Import Invoicing Demo

This repository contains a Django REST backend (`backend/`) and a React frontend (`frontend/`). The frontend is built with Create React App and integrated into the Django project for local production preview.

Quick local build & run (development)

1. Start backend dev server

```powershell
cd backend
.\venv\Scripts\Activate
python manage.py runserver 127.0.0.1:8000
```

2. Start frontend dev server (optional for development)

```powershell
cd frontend
npm install
npm start
```

Open the frontend at the `Local:` URL printed by `npm start` (commonly `http://localhost:3000`). The Django API is at `http://127.0.0.1:8000/api/`.

Build and integrate frontend into Django (production preview)

```powershell
cd frontend
npm install
npm run build
# copy build into backend static (script/manual)
# from repo root (PowerShell):
New-Item -ItemType Directory -Path backend\static -Force
Copy-Item -Path frontend\build\* -Destination backend\static -Recurse -Force

cd backend
.\venv\Scripts\Activate
python manage.py collectstatic --noinput
python manage.py runserver 127.0.0.1:8000
```

Then open `http://127.0.0.1:8000/` to view the integrated SPA.

Files of interest
- `backend/` — Django project and app `shop`
- `frontend/` — React app
- `backend/reports/` — generated JSON/CSV reports created by `backend/scripts/generate_sales_report.py`

If you need a deployment checklist or automated scripts, see `DEPLOYMENT.md`.
