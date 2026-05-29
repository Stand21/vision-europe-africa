# 🌍 Vision Europe Africa — Premium Immigration Platform

> **Your Gateway to Europe.** — A full-stack immigration platform for African students and workers seeking legal pathways to Germany 🇩🇪 and Portugal 🇵🇹.

---

## 🏗️ Architecture Overview

```
vision-europe-africa/
├── frontend/          # Next.js 14 + TypeScript + TailwindCSS + Framer Motion
├── backend/           # Node.js Express API + PostgreSQL + Telegram Bot
├── docker/            # Docker Compose + Nginx config
└── README.md
```

---

## ✨ Features

### Frontend
- 🎨 Animated loading screen & glassmorphism UI
- 🌐 4-language support: French, English, Portuguese, German
- 🏠 Premium landing page with hero, stats, destinations, testimonials, FAQ
- 👤 Profile selection: Student | Worker | Visitor
- 📋 Smart multi-step forms with file upload & e-signature
- 🔐 Secure admin dashboard with charts, filters, pagination, CSV export
- 📱 Fully responsive — mobile, tablet, desktop

### Backend
- 🚀 Express REST API with JWT authentication
- 🛡️ Enterprise security: helmet, CORS, rate limiting, input validation, XSS protection
- 🤖 Real-time Telegram Bot notifications with inline approve/reject buttons
- 📁 Secure file upload with type & size validation
- 🗄️ PostgreSQL with migrations & activity logging
- 📊 Dashboard statistics API with charts data

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### 1. Clone & Setup

```bash
git clone https://github.com/your-org/vision-europe-africa.git
cd vision-europe-africa
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and Telegram token
npm install
npm run migrate   # Run database migrations
npm run dev       # Start dev server on port 5000
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev       # Start dev server on port 3000
```

### 4. Access
- **Website:** http://localhost:3000
- **Apply:** http://localhost:3000/apply
- **Admin:** http://localhost:3000/admin
  - Default login: `admin@visioneuropeafrica.com` / `Admin@2025`
  - **⚠️ Change this password immediately in production!**

---

## 🐳 Docker Deployment

### Full Stack with Docker Compose

```bash
# From project root
cp backend/.env.example .env
# Edit .env with your real credentials

docker-compose -f docker/docker-compose.yml up -d --build
```

This starts:
- PostgreSQL (port 5432)
- Backend API (port 5000)
- Next.js Frontend (port 3000)
- Nginx reverse proxy (ports 80/443)

### Check Status
```bash
docker-compose -f docker/docker-compose.yml ps
docker-compose -f docker/docker-compose.yml logs -f backend
```

---

## 🖥️ VPS Deployment (Ubuntu 22.04)

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### 2. Configure PostgreSQL

```bash
sudo -u postgres psql
CREATE USER vea_user WITH PASSWORD 'your_strong_password';
CREATE DATABASE vision_europe_africa OWNER vea_user;
GRANT ALL PRIVILEGES ON DATABASE vision_europe_africa TO vea_user;
\q
```

### 3. Deploy Backend

```bash
cd /var/www/vea/backend
npm ci --only=production
cp .env.example .env
nano .env  # Fill in all values

# Run migrations
node src/migrations/run.js

# Start with PM2
pm2 start src/index.js --name vea-backend
pm2 save
pm2 startup
```

### 4. Deploy Frontend

```bash
cd /var/www/vea/frontend
npm ci
nano .env.local  # Set NEXT_PUBLIC_API_URL

npm run build
pm2 start npm --name vea-frontend -- start
pm2 save
```

### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/visioneuropeafrica.com
server {
    listen 80;
    server_name visioneuropeafrica.com www.visioneuropeafrica.com;

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }

    location /uploads/ {
        alias /var/www/vea/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/visioneuropeafrica.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Enable HTTPS with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d visioneuropeafrica.com -d www.visioneuropeafrica.com
```

---

## 🏠 Hostinger Deployment

### Option A: Hostinger VPS (Recommended)
Follow the VPS guide above. Hostinger VPS supports Ubuntu 22.04 and all required tools.

### Option B: Hostinger Shared Hosting (Frontend Only)
1. Build: `npm run build && npm run export`
2. Upload `/out` contents via FTP to `public_html/`
3. For API: use a separate VPS or cloud function (Railway, Render, etc.)

---

## 🤖 Telegram Bot Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create a new bot: `/newbot`
3. Copy your bot token to `TELEGRAM_BOT_TOKEN` in `.env`
4. Create an admin group and add your bot to it
5. Get the group chat ID:
   ```bash
   curl "https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates"
   # Look for "chat":{"id":-100XXXXXXXXXX}
   ```
6. Set `TELEGRAM_CHAT_ID=-100XXXXXXXXXX` in `.env`
7. Every new application will send a notification with Approve/Reject buttons

---

## 🔐 Security Checklist

- [ ] Change default admin password immediately
- [ ] Set strong `JWT_SECRET` (minimum 32 random characters)
- [ ] Configure `ALLOWED_ORIGINS` to your domain only
- [ ] Enable `DB_SSL=true` for production database
- [ ] Set up Nginx with SSL (Let's Encrypt)
- [ ] Configure firewall: allow only ports 80, 443, 22
- [ ] Regular database backups
- [ ] Monitor logs: `pm2 logs vea-backend`

---

## 📡 API Documentation

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Submit application (multipart/form-data) |
| GET | `/api/applications/:id` | Check application status |
| GET | `/api/destinations` | Get available destinations |
| GET | `/api/testimonials` | Get testimonials |
| GET | `/health` | Health check |

### Admin Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/applications` | List applications (with filters) |
| PATCH | `/api/admin/applications/:id/status` | Update application status |
| DELETE | `/api/admin/applications/:id` | Delete application (superadmin) |
| GET | `/api/admin/stats` | Dashboard statistics |

### Application Submission (POST /api/applications)

```
Content-Type: multipart/form-data

Required:
- fullName, email, phone, whatsapp, profile, destination

Student extras:
- educationLevel, targetDegree, field, country, city, budget, idNumber, motivationLetter, signature

Worker extras:
- profession, experience, workHours, expectedSalary, budget, idNumber, signature

Visitor extras:
- category, destination, duration, purpose, budget

Files (optional, max 5):
- documents[] (PDF, JPG, PNG — max 10MB each)
```

---

## 🛠️ Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=https://api.visioneuropeafrica.com/api
NEXT_PUBLIC_APP_NAME=Vision Europe Africa
```

### Backend (`.env`)
See `backend/.env.example` for all required variables.

---

## 📊 Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@visioneuropeafrica.com` |
| Password | `Admin@2025` |
| Role | `superadmin` |

**⚠️ Change these credentials immediately after first login!**

---

## 🤝 Support

- Email: contact@visioneuropeafrica.com
- Telegram: @VisionEuropeAfrica

---

## 📄 License

© 2025 Vision Europe Africa. All rights reserved.
