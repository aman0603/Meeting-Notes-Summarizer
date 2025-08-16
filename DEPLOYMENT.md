# Meeting Notes App Deployment Guide

## Deployment Options

### 1. Quick Deploy with Vercel + Railway (Recommended)

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# In frontend directory
cd frontend
vercel

# Follow prompts:
# - Link to Git repository
# - Build command: npm run build
# - Output directory: dist
```

#### Backend (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# In backend directory
cd backend
railway login
railway init
railway up

# Set environment variables in Railway dashboard:
# GEMINI_API_KEY=your_key
# EMAIL_USER=your_email
# EMAIL_PASSWORD=your_app_password
```

### 2. Docker Deployment

#### Create Docker files

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy project files
COPY pyproject.toml uv.lock ./
COPY . .

# Install dependencies
RUN uv sync --frozen

# Expose port
EXPOSE 8000

# Run application
CMD ["uv", "run", "python", "main.py"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASSWORD=${EMAIL_PASSWORD}
    volumes:
      - ./backend:/app
  
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

#### Deploy with Docker
```bash
# Create .env file
echo "GEMINI_API_KEY=your_key" > .env
echo "EMAIL_USER=your_email" >> .env
echo "EMAIL_PASSWORD=your_password" >> .env

# Build and run
docker-compose up --build -d
```

### 3. Cloud Platform Deployment

#### AWS (using Elastic Beanstalk)

**Backend:**
```bash
# Install EB CLI
pip install awsebcli

# Initialize
cd backend
eb init meeting-notes-backend
eb create production

# Deploy
eb deploy
```

**Frontend (S3 + CloudFront):**
```bash
# Build
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Configure CloudFront distribution
```

#### Google Cloud Platform

**Backend (Cloud Run):**
```bash
# Build and deploy
cd backend
gcloud run deploy meeting-notes-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Frontend (Firebase Hosting):**
```bash
# Install Firebase CLI
npm install -g firebase-tools

cd frontend
firebase init hosting
npm run build
firebase deploy
```

#### Heroku

**Backend:**
```bash
# Create Heroku app
cd backend
heroku create meeting-notes-backend

# Set environment variables
heroku config:set GEMINI_API_KEY=your_key
heroku config:set EMAIL_USER=your_email
heroku config:set EMAIL_PASSWORD=your_password

# Deploy
git push heroku main
```

**Frontend (Netlify):**
```bash
# Install Netlify CLI
npm install -g netlify-cli

cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### 4. VPS Deployment (DigitalOcean, Linode, etc.)

#### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python and uv
sudo apt install python3 python3-pip -y
pip3 install uv

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2
```

#### Backend Setup
```bash
# Clone and setup backend
git clone your-repo
cd meeting-notes-app/backend
uv sync

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'meeting-notes-backend',
    script: 'uv',
    args: 'run python main.py',
    cwd: '/path/to/backend',
    env: {
      GEMINI_API_KEY: 'your_key',
      EMAIL_USER: 'your_email',
      EMAIL_PASSWORD: 'your_password'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

#### Frontend Setup
```bash
# Build frontend
cd ../frontend
npm install
npm run build

# Copy to Nginx
sudo cp -r dist/* /var/www/html/
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/meeting-notes
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/meeting-notes /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Environment Variables Setup

Create production environment files:

**Backend (.env):**
```env
GEMINI_API_KEY=your_actual_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://your-backend-domain.com
```

### 6. SSL/HTTPS Setup

#### Using Certbot (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. Database Setup (Optional)

If you want to add data persistence:

#### PostgreSQL Setup
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Create database
sudo -u postgres createdb meeting_notes

# Add to requirements
cd backend
uv add psycopg2-binary sqlalchemy
```

### 8. Monitoring and Logging

#### Setup PM2 monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs meeting-notes-backend

# Setup log rotation
pm2 install pm2-logrotate
```

#### Nginx logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### 9. Backup Strategy

#### Automated backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backups/meeting-notes-$DATE.tar.gz /path/to/app
find /backups -name "meeting-notes-*.tar.gz" -mtime +7 -delete
```

### 10. Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set up firewall (ufw)
- [ ] Regular security updates
- [ ] Environment variables properly secured
- [ ] API rate limiting enabled
- [ ] Regular backups configured
- [ ] Monitor logs for suspicious activity

## Quick Production Checklist

1. **Environment Variables**: Set all required API keys
2. **CORS**: Update allowed origins for production
3. **Build**: Create optimized production builds
4. **SSL**: Configure HTTPS certificates
5. **Monitoring**: Set up logging and health checks
6. **Backups**: Configure automated backups
7. **Domain**: Point domain to your deployment
8. **Testing**: Test all functionality in production

## Recommended Production Stack

**For Small Scale:**
- Vercel (Frontend) + Railway (Backend)
- Cost: ~$10-20/month

**For Medium Scale:**
- DigitalOcean Droplet ($12/month)
- Nginx + PM2 + Node.js + Python

**For Large Scale:**
- AWS/GCP with auto-scaling
- Container orchestration (Kubernetes)
- CDN for static assets
- Database clustering

Choose the deployment method that best fits your needs and budget!