#!/bin/bash

OUTPUT_FILE="taxi-app-release.tar.gz"

echo "Paket oluşturuluyor: $OUTPUT_FILE ..."

# Gereksiz dosyaları hariç tutarak tüm projeyi sıkıştır
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    --exclude='client/dist' \
    --exclude='client/node_modules' \
    --exclude='server/node_modules' \
    --exclude='__pycache__' \
    --exclude='*.log' \
    -czf $OUTPUT_FILE .

echo "✅ Paket başarıyla oluşturuldu!"
echo ""
echo "--- Sunucuya Yükleme ve Kurulum Adımları ---"
echo "1. Dosyayı sunucuya gönderin:"
echo "   scp $OUTPUT_FILE root@SUNUCU_IP_ADRESI:/root/"
echo ""
echo "2. Sunucuya bağlanın ve kurulumu başlatın:"
echo "   ssh root@SUNUCU_IP_ADRESI"
echo "   mkdir -p taxi-app && tar -xzf $OUTPUT_FILE -C taxi-app"
echo "   cd taxi-app/linux-deployment"
echo "   chmod +x install.sh"
echo "   ./install.sh"
echo "---------------------------------------------"
