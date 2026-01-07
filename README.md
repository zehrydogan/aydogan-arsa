# 🏠 Real Estate Marketplace

Modern, yuksek performansli ve olceklenebilir emlak pazaryeri platformu.

## 🚀 Teknoloji Yigini

### Backend
- **Framework:** NestJS with TypeScript
- **Database:** PostgreSQL 15+ with PostGIS extension
- **ORM:** Prisma ORM
- **Caching:** Redis
- **Authentication:** JWT with refresh tokens
- **File Storage:** Cloudinary/AWS S3
- **Real-time:** WebSockets (Socket.IO)

### Frontend
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **State Management:** Zustand + React Query
- **Maps:** Leaflet with clustering
- **Forms:** React Hook Form + Zod validation

## 📁 Proje Yapisi

```
real-estate-marketplace/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── prisma/         # Database service
│   │   └── common/         # Shared utilities
│   └── prisma/             # Database schema & migrations
├── frontend/               # Next.js Frontend
│   ├── app/               # App Router pages
│   ├── components/        # Reusable components
│   └── lib/              # Utilities & configurations
└── docker-compose.yml     # Development environment
```

## 🛠️ Kurulum

### On Gereksinimler
- Node.js 18+
- Docker & Docker Compose
- Git

### Hizli Baslangic

1. **Projeyi klonlayin:**
   ```bash
   git clone <repository-url>
   cd real-estate-marketplace
   ```

2. **Ortam degiskenlerini ayarlayin:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Docker ile servisleri baslatin:**
   ```bash
   docker-compose up -d
   ```

4. **Veritabanini hazirlayin:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run seed
   ```

5. **Backend'i baslatin:**
   ```bash
   cd backend
   npm run start:dev
   ```

6. **Frontend'i baslatin:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. **Uygulamayi acin:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## 🚀 Production Deployment

### Production Ortami Hazirlama

1. **Production ortam degiskenlerini olusturun:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **.env.production dosyasini duzenleyin:**
   - Guvenli sifreler olusturun
   - JWT secret keyleri generate edin: `openssl rand -base64 64`
   - Cloudinary bilgilerinizi ekleyin
   - Domain adresinizi ayarlayin

3. **Production containerlarini baslatın:**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

4. **Veritabanini migrate edin:**
   ```bash
   docker exec emlak-backend-prod npx prisma migrate deploy
   docker exec emlak-backend-prod npm run seed
   ```

5. **Servisleri kontrol edin:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs -f
   ```

### Production Servisleri
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Nginx Reverse Proxy: http://localhost:80

### Guvenlik Onerileri
- Tum sifreleri guclu ve benzersiz yapin
- SSL sertifikasi kullanin (Let's Encrypt)
- Firewall kurallarini yapilandirin
- Duzenli yedekleme yapin
- Log monitoring kurun

## 📋 Gelistirme Gorevleri

Gelistirme gorevleri `.kiro/specs/real-estate-marketplace/tasks.md` dosyasinda detaylandirilmistir.

### Tamamlanan Gorevler
- ✅ **Gorev 1-18:** Tum core moduller tamamlandi
- ✅ Authentication & Authorization
- ✅ Property Management
- ✅ Geographic Search
- ✅ Messaging System
- ✅ User Preferences
- ✅ Frontend Implementation
- ✅ Admin Dashboard
- ✅ Production Deployment

## 🧪 Test Etme

```bash
# Backend testleri
cd backend
npm test

# Frontend testleri
cd frontend
npm test

# Property-based testler
npm run test:property
```

## 📚 API Dokumantasyonu

Backend calistirildiginda Swagger dokumantasyonu su adreste erisilebilir:
- http://localhost:3001/api/docs

## 🎯 Ozellikler

### Kullanici Ozellikleri
- ✅ Kullanici kayit ve giris (JWT authentication)
- ✅ Rol bazli yetkilendirme (Admin, Owner, User)
- ✅ Profil yonetimi
- ✅ Favori ilanlar
- ✅ Kayitli aramalar

### Ilan Ozellikleri
- ✅ Ilan olusturma, duzenleme, silme
- ✅ Coklu fotograf yukleme
- ✅ Gelismis arama ve filtreleme
- ✅ Harita uzerinde gosterim
- ✅ Konum bazli arama

### Mesajlasma
- ✅ Ilan sahipleriyle iletisim
- ✅ Mesaj gecmisi
- ✅ Real-time mesajlasma (WebSocket)
- ✅ Bildirimler

### Admin Paneli
- ✅ Kullanici yonetimi
- ✅ Ilan onaylama/reddetme
- ✅ Lokasyon yonetimi
- ✅ Sistem istatistikleri

## 🤝 Katkida Bulunma

1. Feature branch olusturun
2. Degisikliklerinizi commit edin
3. Pull request acin
4. Code review surecini takip edin

## 📄 Lisans

Bu proje MIT lisansi altinda lisanslanmistir.

## 🆘 Destek

Sorulariniz icin:
- GitHub Issues
- Proje dokumantasyonu
- Gelistirici ekibi