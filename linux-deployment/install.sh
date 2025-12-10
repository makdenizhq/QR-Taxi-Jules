#!/bin/bash

# Renkler
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}=== Taxi App Kurulum Sihirbazı Başlıyor ===${NC}"

# 1. Update ve Gerekli Paketlerin Kurulumu
echo -e "${GREEN}[1/5] Sistem güncelleniyor ve gerekli paketler kuruluyor...${NC}"
apt-get update
apt-get install -y nginx curl git build-essential

# 2. Node.js Kurulumu (v20)
echo -e "${GREEN}[2/5] Node.js (v20) kuruluyor...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. Proje Dosyalarının Kopyalanması (Bu script proje kök dizininde çalışmalı)
APP_DIR="/var/www/taxi-app"
echo -e "${GREEN}[3/5] Proje dosyaları $APP_DIR dizinine taşınıyor...${NC}"

mkdir -p $APP_DIR
cp -r ../server $APP_DIR/
cp -r ../client $APP_DIR/

# 4. Bağımlılıkların Yüklenmesi ve Build
echo -e "${GREEN}[4/5] Uygulama derleniyor...${NC}"

# Backend
cd $APP_DIR/server
npm install

# Frontend
cd $APP_DIR/client
npm install
# Production build için Backend URL'ini /api olarak ayarlıyoruz (Nginx proxy yapacak)
echo "VITE_API_URL=" > .env.production
npm run build

# 5. Servislerin Ayarlanması
echo -e "${GREEN}[5/5] Servisler (Systemd ve Nginx) ayarlanıyor...${NC}"

# Systemd Service
cp ../linux-deployment/taxi-app.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable taxi-app
systemctl restart taxi-app

# Nginx Config
cp ../linux-deployment/taxi-app.nginx /etc/nginx/sites-available/taxi-app
ln -sf /etc/nginx/sites-available/taxi-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default # Default site'ı kaldır
nginx -t && systemctl restart nginx

echo -e "${GREEN}=== Kurulum Başarıyla Tamamlandı! ===${NC}"
echo "Sunucu IP adresinize tarayıcıdan girerek test edebilirsiniz."
