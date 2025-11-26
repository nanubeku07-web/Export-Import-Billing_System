Deployment checklist — minimal

1) Secrets & environment
- Set a secure `SECRET_KEY` (do not keep the development key).
- Use environment variables for configuration; e.g. `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=0`, `DATABASE_URL`, `ALLOWED_HOSTS`.

2) Django settings
- In `backend/backend_project/settings.py`, set `DEBUG = False` and configure `ALLOWED_HOSTS`.
- Configure `DATABASES` for production (Postgres/MySQL); do not use SQLite for production.

3) Static files
- Build the React frontend: `npm run build` in `frontend/`.
- Copy `frontend/build/` contents into the server static directory, or configure your CI/CD to place assets into a CDN or static host.
- Run `python manage.py collectstatic --noinput`.
- Serve static files with nginx or a CDN; do not serve static from Django in production.

4) Application server
- Use a WSGI server like Gunicorn or uWSGI behind nginx.
- Configure process manager (systemd) and monitor logs.

5) Security
- Use HTTPS (TLS) and redirect HTTP to HTTPS.
- Harden CORS to only allow your frontend origin(s).
- Configure proper session/cookie security flags.

6) Backups and monitoring
- Schedule DB backups and test restores.
- Add monitoring and alerts for errors and resource usage.

7) Optional improvements
- Add unit tests and CI to run them on PRs.
- Add automated build + deployment pipeline (GitHub Actions, etc.).

Commands (example)
```powershell
# Build frontend
cd frontend
npm ci
npm run build
# Copy build to backend static
Copy-Item -Path build\* -Destination ..\backend\static -Recurse -Force
# Activate venv and collectstatic
cd ..\backend
.\venv\Scripts\Activate
python manage.py collectstatic --noinput
# Run migrations and start app with Gunicorn (example)
python manage.py migrate
gunicorn backend_project.wsgi:application --bind 0.0.0.0:8000
```
