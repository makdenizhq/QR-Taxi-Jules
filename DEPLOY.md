# Projeyi Dış Ortamda Çalıştırma Kılavuzu

Uygulamayı geliştirdiniz ve şimdi gerçek bir telefonda veya dış ortamda test etmek istiyorsunuz. Bunun için 3 temel yöntem vardır.

## Yöntem 1: Aynı WiFi Ağı Üzerinden (En Hızlısı)

Bilgisayarınız ve telefonunuz aynı WiFi ağına bağlıysa, bilgisayarınızın yerel IP adresini kullanarak uygulamaya erişebilirsiniz.

1.  **Bilgisayarınızın IP Adresini Bulun:**
    *   **Mac/Linux:** Terminalde `ifconfig` yazın. Genellikle `192.168.1.x` gibi bir adrestir.
    *   **Windows:** Komut satırında `ipconfig` yazın.

2.  **Backend Ayarını Yapın:**
    *   `client` klasörü içinde `.env.local` dosyası oluşturun (veya `.env`):
        ```bash
        VITE_API_URL=http://<BILGISAYAR_IP_ADRESI>:3001
        # Örnek: VITE_API_URL=http://192.168.1.35:3001
        ```

3.  **Uygulamayı Başlatın:**
    *   Client'ı şu komutla başlatın (Host'u açmak için `--host` önemlidir):
        ```bash
        cd client
        npm run dev -- --host
        ```
    *   Server'ı başlatın:
        ```bash
        cd server
        node index.js
        ```

4.  **Telefondan Erişim:**
    *   Telefonunuzun tarayıcısını açın.
    *   Adres çubuğuna: `http://<BILGISAYAR_IP_ADRESI>:5173` yazın.
    *   Örnek URL: `http://192.168.1.35:5173/?standId=stand_1`

---

## Yöntem 2: Ngrok ile İnternete Açma (Demo İçin En İyisi)

Ngrok, bilgisayarınızdaki portları geçici olarak dünyaya açmanızı sağlar. Aynı WiFi ağında olmanız gerekmez.

1.  [Ngrok](https://ngrok.com/) indirin ve kurun.
2.  İki ayrı terminal açın.

3.  **Backend'i Tünelleyin:**
    ```bash
    ngrok http 3001
    ```
    Size `https://random-name.ngrok-free.app` gibi bir URL verecek. Bu sizin yeni **Backend URL**'iniz.

4.  **Frontend'i Ayarlayın:**
    *   `client/.env.local` dosyasını düzenleyin:
        ```bash
        VITE_API_URL=https://<BACKEND_NGROK_URL>
        ```
    *   Client'ı yeniden başlatın.

5.  **Frontend'i Tünelleyin:**
    ```bash
    ngrok http 5173
    ```
    Size ikinci bir URL verecek. Bu **Frontend URL**'inizdir.

6.  **Kullanım:**
    *   QR Kod oluştururken Frontend Ngrok URL'ini kullanın.
    *   Telefondan bu URL'e girin.

---

## Yöntem 3: Bulut Sunucuya Yükleme (Kalıcı Çözüm)

Uygulamanın 7/24 çalışması için buluta yüklemeniz gerekir. Ücretsiz servisler kullanabilirsiniz.

### 1. Backend (Node.js) -> Render.com veya Railway.app
1.  Github projenizi bu servislere bağlayın.
2.  Root directory olarak `server` seçin.
3.  Build command: `npm install`
4.  Start command: `node index.js`
5.  Size bir URL verecekler (örn: `https://my-taxi-api.onrender.com`).

### 2. Frontend (React) -> Vercel veya Netlify
1.  Github projenizi bağlayın.
2.  Root directory olarak `client` seçin.
3.  Build command: `npm run build`
4.  Output directory: `dist`
5.  **Environment Variables** kısmına şunu ekleyin:
    *   `VITE_API_URL`: Backend'in URL'i (örn: `https://my-taxi-api.onrender.com`)
6.  Deploy!

Artık size verilen Vercel linkini QR kodlara basabilirsiniz.
