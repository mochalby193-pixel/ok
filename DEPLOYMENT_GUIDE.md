# 🚀 DEPLOYMENT GUIDE - LMS Application

Panduan lengkap untuk deployment aplikasi LMS ke production.

---

## 📋 Pre-Deployment Checklist

### Backend
- [ ] Update `.env` dengan credentials production
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET`
- [ ] Setup PostgreSQL production database
- [ ] Run database migrations (`schema.sql`)
- [ ] Test all API endpoints
- [ ] Setup CORS untuk production domain
- [ ] Enable rate limiting (optional)
- [ ] Setup logging (winston/morgan)

### Frontend
- [ ] Update `VITE_API_URL` ke production API
- [ ] Build production bundle (`npm run build`)
- [ ] Test production build locally
- [ ] Optimize images & assets
- [ ] Configure CDN (optional)

---

## 🖥️ Deployment Options

### Option 1: VPS (Ubuntu/Debian)

#### 1. Setup Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### 2. Setup PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database & user
CREATE DATABASE lms_db;
CREATE USER lms_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
\q

# Import schema
psql -U lms_user -d lms_db -f schema.sql
```

#### 3. Deploy Backend
```bash
# Clone/upload project
cd /var/www/
git clone <your-repo-url> lms
cd lms

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Start with PM2
pm2 start server.js --name lms-backend
pm2 save
pm2 startup
```

#### 4. Deploy Frontend
```bash
cd client

# Build production
npm install
npm run build

# Copy build to nginx
sudo cp -r dist/* /var/www/html/lms-frontend/
```

#### 5. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/lms
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name lms.yourdomain.com;

    root /var/www/html/lms-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com -d lms.yourdomain.com
```

---

### Option 2: Heroku

#### Backend
```bash
# Login to Heroku
heroku login

# Create app
heroku create lms-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku pg:psql < schema.sql
```

#### Frontend
```bash
# Build
cd client
npm run build

# Deploy to Netlify/Vercel (easier for static sites)
# Or use heroku-static-buildpack
```

---

### Option 3: Docker

#### Create Dockerfile (Backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: lms_db
      POSTGRES_USER: lms_user
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql

  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=db
      - DB_USER=lms_user
      - DB_PASSWORD=your_password
      - DB_NAME=lms_db
      - JWT_SECRET=your_secret
    depends_on:
      - db

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

```bash
# Run
docker-compose up -d
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
```env
# Use strong secrets
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 16)
```

### 2. Firewall
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. Rate Limiting (Express)
```bash
npm install express-rate-limit
```

```javascript
// server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Helmet (Security headers)
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 📊 Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs lms-backend
pm2 status
```

### Database Backup
```bash
# Backup
pg_dump -U lms_user lms_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U lms_user lms_db < backup.sql

# Automated daily backup (crontab)
0 2 * * * pg_dump -U lms_user lms_db > /backups/lms_$(date +\%Y\%m\%d).sql
```

---

## 🔄 CI/CD (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/lms
          git pull
          npm install --production
          pm2 restart lms-backend
```

---

## 📱 Post-Deployment

### 1. Health Check
```bash
# Test API
curl https://api.yourdomain.com/

# Test authentication
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.com","password":"admin123"}'
```

### 2. Performance Optimization
- Enable Gzip compression
- Setup CDN for static assets
- Add Redis for caching (optional)
- Database connection pooling (already configured)
- Image optimization

### 3. Monitoring Tools
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry
- **Analytics**: Google Analytics, Mixpanel
- **Logs**: Papertrail, Loggly

---

## 🆘 Troubleshooting

### Backend not starting
```bash
pm2 logs lms-backend --lines 50
```

### Database connection error
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U lms_user -d lms_db
```

### Frontend 404 errors
```bash
# Check Nginx config
sudo nginx -t

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 Support

For deployment issues:
1. Check logs: `pm2 logs`
2. Check PostgreSQL: `sudo systemctl status postgresql`
3. Check Nginx: `sudo nginx -t`

---

**Good luck with deployment! 🚀**
