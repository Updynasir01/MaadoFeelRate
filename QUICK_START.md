# Quick Start Deployment Guide

## 🚀 Fastest Way to Deploy MaadoFeelRate

### Prerequisites Check
- [ ] Digital Ocean or AWS account
- [ ] Domain name (optional)
- [ ] SSH access to server

---

## Step-by-Step (15 minutes)

### 1. Create Server (5 min)

**Digital Ocean:**
- Create Ubuntu 22.04 Droplet (2GB RAM minimum)
- Note your server IP

**AWS:**
- Launch Ubuntu 22.04 EC2 instance (t2.small)
- Configure security groups (ports 22, 80, 443)
- Note your instance IP

### 2. Connect to Server

```bash
ssh root@YOUR_SERVER_IP
# or for AWS:
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP
```

### 3. Run Deployment Script

```bash
# Upload deploy.sh to server, then:
chmod +x deploy.sh
./deploy.sh
```

### 4. Upload Application Files

**Option A: Using SCP (from your local machine)**
```bash
scp -r . root@YOUR_SERVER_IP:/var/www/maadofeelrate
```

**Option B: Using Git**
```bash
cd /var/www/maadofeelrate
git clone YOUR_REPO_URL .
```

### 5. Setup Backend (2 min)

```bash
cd /var/www/maadofeelrate/backend
npm install --production

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/maadofeelrate
NODE_ENV=production
EOF

# Start with PM2
pm2 start server.js --name maadofeelrate-api
pm2 save
pm2 startup  # Follow instructions
```

### 6. Setup Frontend (2 min)

```bash
cd /var/www/maadofeelrate/frontend
npm install

# Create production env
cat > .env.production << EOF
REACT_APP_API_URL=http://YOUR_SERVER_IP/api
EOF

# Build
npm run build
```

### 7. Configure Nginx (2 min)

```bash
# Copy example config
cp /var/www/maadofeelrate/nginx.conf.example /etc/nginx/sites-available/maadofeelrate

# Edit and update YOUR_DOMAIN_OR_IP
nano /etc/nginx/sites-available/maadofeelrate

# Enable site
ln -s /etc/nginx/sites-available/maadofeelrate /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 8. Test Your Deployment

1. Visit: `http://YOUR_SERVER_IP`
2. Submit test feedback
3. Test admin: `http://YOUR_SERVER_IP/login` (admin / admin123)

### 9. Setup SSL (Optional but Recommended)

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🎉 Done!

Your MaadoFeelRate application is now live!

### Useful Commands

```bash
# View logs
pm2 logs maadofeelrate-api

# Restart backend
pm2 restart maadofeelrate-api

# Update application
cd /var/www/maadofeelrate
git pull  # or upload new files
cd frontend && npm run build
pm2 restart maadofeelrate-api
```

---

## Troubleshooting

**Can't access the site?**
- Check firewall: `ufw status`
- Check Nginx: `systemctl status nginx`
- Check backend: `pm2 logs maadofeelrate-api`

**Backend not starting?**
- Check MongoDB: `systemctl status mongod`
- Check logs: `pm2 logs maadofeelrate-api`

**Frontend shows blank page?**
- Verify build exists: `ls /var/www/maadofeelrate/frontend/build`
- Check Nginx config: `nginx -t`
- Check Nginx error log: `tail -f /var/log/nginx/error.log`

