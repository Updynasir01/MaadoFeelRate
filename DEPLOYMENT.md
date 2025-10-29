# MaadoFeelRate - Deployment Guide

Complete guide to deploy MaadoFeelRate on Digital Ocean or AWS.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Option 1: Digital Ocean Deployment](#option-1-digital-ocean-deployment)
- [Option 2: AWS EC2 Deployment](#option-2-aws-ec2-deployment)
- [Domain Setup](#domain-setup)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Post-Deployment](#post-deployment)

---

## Prerequisites

Before deploying, ensure you have:
- A Digital Ocean account (or AWS account)
- A domain name (optional but recommended)
- Basic knowledge of Linux commands
- SSH key pair for server access

---

## Option 1: Digital Ocean Deployment

### Step 1: Create a Droplet

1. Log in to Digital Ocean
2. Click **"Create" > "Droplets"**
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic, Regular Intel (2GB RAM minimum, 4GB recommended)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH keys (recommended) or password
4. Click **"Create Droplet"**

### Step 2: Connect to Your Server

```bash
ssh root@YOUR_SERVER_IP
```

### Step 3: Initial Server Setup

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js (LTS version)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org

# Start and enable MongoDB
systemctl start mongod
systemctl enable mongod

# Install Nginx
apt install -y nginx

# Install PM2 (Process Manager)
npm install -g pm2

# Install Git
apt install -y git
```

### Step 4: Clone and Setup Application

```bash
# Create application directory
mkdir -p /var/www/maadofeelrate
cd /var/www/maadofeelrate

# Clone your repository (replace with your repo URL)
git clone YOUR_REPOSITORY_URL .

# Or upload files using SCP from your local machine:
# scp -r . root@YOUR_SERVER_IP:/var/www/maadofeelrate
```

### Step 5: Configure Backend

```bash
cd /var/www/maadofeelrate/backend

# Install dependencies
npm install --production

# Create environment file
nano .env
```

Add the following to `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/maadofeelrate
NODE_ENV=production
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 6: Configure Frontend

```bash
cd /var/www/maadofeelrate/frontend

# Install dependencies
npm install

# Create environment file
nano .env.production
```

Add:
```env
REACT_APP_API_URL=http://YOUR_SERVER_IP:5000/api
```

Or if using domain:
```env
REACT_APP_API_URL=https://yourdomain.com/api
```

Build the frontend:
```bash
npm run build
```

This creates a `build` folder with production-ready files.

### Step 7: Start Backend with PM2

```bash
cd /var/www/maadofeelrate/backend

# Start the server
pm2 start server.js --name maadofeelrate-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown
```

### Step 8: Configure Nginx

```bash
nano /etc/nginx/sites-available/maadofeelrate
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # Replace with your domain when ready

    # Frontend (React build)
    location / {
        root /var/www/maadofeelrate/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
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

Enable the site:
```bash
ln -s /etc/nginx/sites-available/maadofeelrate /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default config
nginx -t  # Test configuration
systemctl restart nginx
```

### Step 9: Configure Firewall

```bash
# Allow SSH
ufw allow OpenSSH

# Allow HTTP and HTTPS
ufw allow 'Nginx Full'

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## Option 2: AWS EC2 Deployment

### Step 1: Create EC2 Instance

1. Log in to AWS Console
2. Go to **EC2 > Instances > Launch Instance**
3. Configure:
   - **Name**: maadofeelrate-server
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: t2.small (2GB RAM, minimum)
   - **Key Pair**: Create or select existing
   - **Network Settings**: 
     - Allow SSH (port 22)
     - Allow HTTP (port 80)
     - Allow HTTPS (port 443)
4. Click **"Launch Instance"**

### Step 2: Connect to EC2 Instance

```bash
# Download your key pair file and set permissions
chmod 400 your-key-pair.pem

# Connect to instance
ssh -i your-key-pair.pem ubuntu@YOUR_EC2_IP_ADDRESS
```

### Step 3-9: Follow Steps 3-9 from Digital Ocean

All subsequent steps are identical to Digital Ocean deployment.

**Note**: On AWS, your user might be `ubuntu` instead of `root`. Use `sudo` when needed:

```bash
sudo apt update
sudo apt install -y nodejs
# etc.
```

---

## Domain Setup

### Digital Ocean DNS Configuration

1. Go to **Networking > Domains**
2. Add your domain
3. Add DNS Records:
   - **A Record**: `@` → `YOUR_SERVER_IP`
   - **A Record**: `www` → `YOUR_SERVER_IP`

### AWS Route 53 Configuration

1. Go to **Route 53 > Hosted Zones**
2. Create hosted zone for your domain
3. Add A Records pointing to your EC2 instance IP

### Update Nginx Configuration

Edit Nginx config with your domain:
```bash
nano /etc/nginx/sites-available/maadofeelrate
```

Update `server_name`:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

Restart Nginx:
```bash
systemctl restart nginx
```

### Update Frontend Environment

Update `/var/www/maadofeelrate/frontend/.env.production`:
```env
REACT_APP_API_URL=https://yourdomain.com/api
```

Rebuild frontend:
```bash
cd /var/www/maadofeelrate/frontend
npm run build
```

---

## SSL/HTTPS Setup

### Using Certbot (Let's Encrypt - Free SSL)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)
```

Certbot will automatically:
- Obtain SSL certificate
- Configure Nginx
- Setup auto-renewal

### Auto-Renewal Test

```bash
# Test renewal
certbot renew --dry-run
```

---

## Post-Deployment

### Verify Everything Works

1. **Test Frontend**: Visit `http://YOUR_SERVER_IP` or `https://yourdomain.com`
2. **Test Backend**: Visit `http://YOUR_SERVER_IP/api/health` or `https://yourdomain.com/api/health`
3. **Test Feedback Submission**: Submit test feedback from the customer page
4. **Test Admin Login**: Log in to admin dashboard

### Useful Commands

```bash
# Check PM2 status
pm2 status

# View PM2 logs
pm2 logs maadofeelrate-api

# Restart backend
pm2 restart maadofeelrate-api

# Check Nginx status
systemctl status nginx

# View Nginx logs
tail -f /var/log/nginx/error.log

# Check MongoDB status
systemctl status mongod

# Access MongoDB
mongo
# or for newer versions:
mongosh
```

### Updating the Application

```bash
cd /var/www/feelrate

# Pull latest changes (if using Git)
git pull origin main

# Or upload new files via SCP

# Rebuild frontend if changed
cd frontend
npm install
npm run build

# Restart backend if changed
cd ../backend
npm install
pm2 restart feelrate-api
```

### Backup MongoDB

```bash
# Create backup
mongodump --db maadofeelrate --out /backup/maadofeelrate-$(date +%Y%m%d)

# Restore backup
mongorestore --db maadofeelrate /backup/maadofeelrate-YYYYMMDD/maadofeelrate
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs maadofeelrate-api

# Check if port 5000 is in use
netstat -tulpn | grep 5000

# Check MongoDB connection
systemctl status mongod
```

### Frontend Not Loading

```bash
# Check Nginx configuration
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Verify build folder exists
ls -la /var/www/maadofeelrate/frontend/build
```

### MongoDB Issues

```bash
# Start MongoDB
systemctl start mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

---

## Security Recommendations

1. **Keep System Updated**:
   ```bash
   apt update && apt upgrade -y
   ```

2. **Firewall Configuration**: Only allow necessary ports

3. **Regular Backups**: Setup automated MongoDB backups

4. **Environment Variables**: Never commit `.env` files to Git

5. **SSH Security**: Disable password authentication, use SSH keys only

6. **MongoDB Security**: Enable authentication (optional but recommended)

---

## Quick Start Script

Save this as `deploy.sh` and run it:

```bash
#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Install Nginx and PM2
apt install -y nginx git
npm install -g pm2

echo "✅ Basic setup complete!"
echo "Now:"
echo "1. Upload your application files"
echo "2. Configure .env files"
echo "3. Build frontend (npm run build)"
echo "4. Start backend with PM2"
echo "5. Configure Nginx"
```

---

## Support

For issues or questions:
- Check application logs: `pm2 logs feelrate-api`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Verify MongoDB: `systemctl status mongod`

---

**Congratulations! Your MaadoFeelRate application is now deployed and ready to use! 🎉**

