# Milan Khanal — Full-Stack Portfolio & Birthday Platform

A production-grade, multi-system platform featuring a personal portfolio, a comprehensive admin panel, and a dynamic birthday event management site.

## 🚀 Features

- **Main Portfolio**: Dynamic CMS-driven content, SEO-optimized blog, project gallery, and interactive experience timeline.
- **Admin Panel**: Secure dashboard for managing every aspect of the site (Profile, Blog, Projects, Skills, Testimonials, Settings).
- **Birthday Site**: Subdomain-aware (`birthday.*`) event page with countdown, Milan's message, interactive RSVP (Room Party vs Restaurant), and a public wishes wall.
- **Infrastructure**: Fully containerized with Docker, PostgreSQL, Redis caching, Celery background tasks (email/reminders), and Nginx reverse proxy.

## 🛠️ Tech Stack

- **Backend**: Python 3.12, FastAPI (Async), SQLAlchemy 2.0, Alembic, Pydantic v2.
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, TanStack Query v5.
- **Data**: PostgreSQL (Database), Redis (Caching & Task Queue).
- **Ops**: Docker, Celery, Nginx.

## 🏁 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.12 (for local backend development)

### Quick Start (Docker)

1. **Clone the repository**
2. **Setup environment variables**
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env` (Create one if missing)
3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```
4. **Seed the database**
   ```bash
   docker exec -it portfolio_api python seed.py
   ```

The application will be available at:
- Portfolio: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Birthday: `http://birthday.localhost:3000` (Requires local DNS setup or middleware handle)

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

```bash
# Run backend tests
cd backend
pytest
```

## 📜 Project Structure

```text
├── backend/            # FastAPI Application
├── frontend/           # Next.js 14 Application
├── nginx/              # Nginx Configuration
├── docker-compose.yml  # Container Orchestration
└── README.md           # This file
```

## 👤 Author

**Milan Khanal**
- GitHub: [@milankhanal](https://github.com/milankhanal)
- Email: [hello@khanalmilan.com.np](mailto:hello@khanalmilan.com.np)

## 📄 License

MIT
