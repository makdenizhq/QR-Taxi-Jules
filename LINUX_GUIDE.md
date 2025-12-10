# Linux Sunucu Kurulum Rehberi

Bu rehber, projenizi sıfırdan bir Linux (Ubuntu/Debian) sunucusuna kurmak için adım adım talimatlar içerir.

## Gereksinimler

*   Bir adet Linux Sunucu (VPS). (Örn: DigitalOcean, AWS, Hetzner, Google Cloud vb.)
*   Sunucuya `root` erişimi (SSH).
*   (Opsiyonel) Bir domain adı. (Eğer domain yoksa IP adresi üzerinden çalışır).

## Adım Adım Kurulum

### 1. Sunucuya Bağlanın
Terminalinizi açın ve sunucunuza SSH ile bağlanın:
```bash
ssh root@SUNUCU_IP_ADRESI
```

### 2. Proje Dosyalarını Sunucuya Yükleyin
En kolay yöntem projeyi Github'dan çekmektir. Eğer Github kullanmıyorsanız dosyaları `scp` ile de atabilirsiniz.

**Github Yöntemi:**
```bash
# Git yüklü değilse yükleyin
apt-get update && apt-get install git -y

# Projeyi klonlayın (Kendi reponuzun adresiyle değiştirin)
git clone https://github.com/kullanici/taxi-app.git
cd taxi-app
```

### 3. Otomatik Kurulum Scriptini Çalıştırın
Hazırladığımız script, Node.js, Nginx kurulumunu yapacak, uygulamayı derleyecek ve servisleri başlatacaktır.

```bash
cd linux-deployment
chmod +x install.sh
./install.sh
```

Bu işlem birkaç dakika sürebilir. "Kurulum Başarıyla Tamamlandı!" mesajını görene kadar bekleyin.

---

## Kurulum Sonrası & Domain Ayarları

### Erişim Adresi
Kurulum bittiğinde, tarayıcınıza sunucunuzun IP adresini yazarak uygulamaya girebilirsiniz:
`http://SUNUCU_IP_ADRESI`

### QR Kodlar Hangi Adrese Gidecek?
QR kodlarınızın şu formatta olması gerekir:

*   **Müşteri (Durak 1):** `http://SUNUCU_IP_ADRESI/?standId=stand_1`
*   **Müşteri (Durak 2):** `http://SUNUCU_IP_ADRESI/?standId=stand_2`
*   **Şoför Ekranı:** `http://SUNUCU_IP_ADRESI/driver`

### Domain Kullanmak İsterseniz (Örn: taksicagir.com)

1.  Domain sağlayıcınızdan (GoDaddy, Namecheap vb.) bir **A Kaydı (A Record)** oluşturun ve sunucunuzun IP adresine yönlendirin.
2.  Sunucuda `/etc/nginx/sites-available/taxi-app` dosyasını açın:
    ```bash
    nano /etc/nginx/sites-available/taxi-app
    ```
3.  `server_name _;` satırını `server_name taksicagir.com;` olarak değiştirin.
4.  Nginx'i yeniden başlatın:
    ```bash
    systemctl restart nginx
    ```

### SSL (HTTPS) Kurulumu (Önerilir)
Kamera ve GPS izinleri için tarayıcılar genellikle HTTPS zorunlu tutar. Domain aldıktan sonra ücretsiz SSL kurmak için:

```bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d taksicagir.com
```

Artık adresiniz `https://taksicagir.com` olacaktır.
