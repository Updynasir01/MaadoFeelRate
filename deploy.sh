#!/bin/bash

# MaadoFeelRate Deployment Script
# Run this script on a fresh Ubuntu 22.04 server

set -e  # Exit on error

echo "🚀 Starting MaadoFeelRate Deployment..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js (LTS version)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version

# Install MongoDB
echo "📦 Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org

# Start and enable MongoDB
systemctl start mongod
systemctl enable mongod

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install PM2 (Process Manager)
echo "📦 Installing PM2..."
npm install -g pm2

# Install Git
echo "📦 Installing Git..."
apt install -y git

# Install Certbot for SSL
echo "📦 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Configure Firewall
echo "🔥 Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "✅ Basic setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Upload your application files to /var/www/maadofeelrate"
echo "2. cd /var/www/maadofeelrate/backend && npm install"
echo "3. Create backend/.env file with your configuration"
echo "4. cd /var/www/maadofeelrate/frontend && npm install"
echo "5. Create frontend/.env.production with REACT_APP_API_URL"
echo "6. npm run build (in frontend directory)"
echo "7. pm2 start backend/server.js --name maadofeelrate-api"
echo "8. Configure Nginx (see DEPLOYMENT.md)"
echo "9. Setup SSL with: certbot --nginx -d yourdomain.com"

