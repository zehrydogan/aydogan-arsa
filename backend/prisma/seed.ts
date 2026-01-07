import { PrismaClient, UserRole, LocationType, PropertyStatus, PropertyCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Veritabanı seed işlemi başlatılıyor...');

    const hashedPassword = await bcrypt.hash('owner123', 10);

    // Arsa sahibi kullanıcı
    const owner = await prisma.user.upsert({
        where: { email: 'info@aydoganarsa.com' },
        update: {},
        create: {
            email: 'info@aydoganarsa.com',
            password: hashedPassword,
            firstName: 'Aydoğan',
            lastName: 'Arsa',
            phone: '+90 532 XXX XX XX',
            role: UserRole.OWNER,
        },
    });
    console.log('✅ Arsa sahibi oluşturuldu:', owner.email);

    // Admin kullanıcı
    const admin = await prisma.user.upsert({
        where: { email: 'admin@aydoganarsa.com' },
        update: {},
        create: {
            email: 'admin@aydoganarsa.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'Kullanıcı',
            role: UserRole.ADMIN,
        },
    });
    console.log('✅ Admin kullanıcı oluşturuldu:', admin.email);

    // İller - Çalıştığımız bölgeler
    const bilecik = await prisma.location.upsert({
        where: { id: 'bilecik' },
        update: {},
        create: { id: 'bilecik', name: 'Bilecik', type: LocationType.CITY },
    });

    const kutahya = await prisma.location.upsert({
        where: { id: 'kutahya' },
        update: {},
        create: { id: 'kutahya', name: 'Kütahya', type: LocationType.CITY },
    });

    const edirne = await prisma.location.upsert({
        where: { id: 'edirne' },
        update: {},
        create: { id: 'edirne', name: 'Edirne', type: LocationType.CITY },
    });

    const afyon = await prisma.location.upsert({
        where: { id: 'afyon' },
        update: {},
        create: { id: 'afyon', name: 'Afyonkarahisar', type: LocationType.CITY },
    });

    const konya = await prisma.location.upsert({
        where: { id: 'konya' },
        update: {},
        create: { id: 'konya', name: 'Konya', type: LocationType.CITY },
    });

    const ankara = await prisma.location.upsert({
        where: { id: 'ankara' },
        update: {},
        create: { id: 'ankara', name: 'Ankara', type: LocationType.CITY },
    });

    // İlçeler
    const bozuyuk = await prisma.location.upsert({
        where: { id: 'bozuyuk' },
        update: {},
        create: { id: 'bozuyuk', name: 'Bozüyük', type: LocationType.DISTRICT, parentId: bilecik.id },
    });

    const sogut = await prisma.location.upsert({
        where: { id: 'sogut' },
        update: {},
        create: { id: 'sogut', name: 'Söğüt', type: LocationType.DISTRICT, parentId: bilecik.id },
    });

    const simav = await prisma.location.upsert({
        where: { id: 'simav' },
        update: {},
        create: { id: 'simav', name: 'Simav', type: LocationType.DISTRICT, parentId: kutahya.id },
    });

    const kesan = await prisma.location.upsert({
        where: { id: 'kesan' },
        update: {},
        create: { id: 'kesan', name: 'Keşan', type: LocationType.DISTRICT, parentId: edirne.id },
    });

    const emirdag = await prisma.location.upsert({
        where: { id: 'emirdag' },
        update: {},
        create: { id: 'emirdag', name: 'Emirdağ', type: LocationType.DISTRICT, parentId: afyon.id },
    });

    const beysehir = await prisma.location.upsert({
        where: { id: 'beysehir' },
        update: {},
        create: { id: 'beysehir', name: 'Beyşehir', type: LocationType.DISTRICT, parentId: konya.id },
    });

    const nallihan = await prisma.location.upsert({
        where: { id: 'nallihan' },
        update: {},
        create: { id: 'nallihan', name: 'Nallıhan', type: LocationType.DISTRICT, parentId: ankara.id },
    });

    console.log('✅ Konum hiyerarşisi oluşturuldu');

    // Arsa özellikleri
    const features = [
        { name: 'Elektrik', category: 'altyapi', icon: '⚡' },
        { name: 'Sanayi Elektriği', category: 'altyapi', icon: '🏭' },
        { name: 'Su', category: 'altyapi', icon: '💧' },
        { name: 'Telefon', category: 'altyapi', icon: '📞' },
        { name: 'Doğalgaz', category: 'altyapi', icon: '🔥' },
        { name: 'Kanalizasyon', category: 'altyapi', icon: '🚰' },
        { name: 'Arıtma', category: 'altyapi', icon: '♻️' },
        { name: 'Sondaj & Kuyu', category: 'altyapi', icon: '🕳️' },
        { name: 'Zemin Etüdü', category: 'altyapi', icon: '📋' },
        { name: 'Yolu Açılmış', category: 'altyapi', icon: '🛣️' },
        { name: 'Ana Yola Yakın', category: 'konum', icon: '🛤️' },
        { name: 'Denize Sıfır', category: 'konum', icon: '🏖️' },
        { name: 'Denize Yakın', category: 'konum', icon: '🌊' },
        { name: 'Havaalanına Yakın', category: 'konum', icon: '✈️' },
        { name: 'Toplu Ulaşıma Yakın', category: 'konum', icon: '🚌' },
        { name: 'İfrazlı', category: 'genel', icon: '📐' },
        { name: 'Parselli', category: 'genel', icon: '🗺️' },
        { name: 'Projeli', category: 'genel', icon: '📝' },
        { name: 'Köşe Parsel', category: 'genel', icon: '📍' },
        { name: 'Şehir Manzarası', category: 'manzara', icon: '🏙️' },
        { name: 'Deniz Manzarası', category: 'manzara', icon: '🌅' },
        { name: 'Doğa Manzarası', category: 'manzara', icon: '🌲' },
        { name: 'Göl Manzarası', category: 'manzara', icon: '🏞️' },
    ];

    for (const feature of features) {
        await prisma.feature.upsert({
            where: { name: feature.name },
            update: {},
            create: feature,
        });
    }
    console.log('✅ Arsa özellikleri oluşturuldu');

    await prisma.property.deleteMany({});
    console.log('✅ Mevcut ilanlar silindi');

    // Örnek arsa ilanları
    const properties = [
        {
            title: 'BİLECİK BOZÜYÜK MERKEZ YANI 2 KM MESAFEDE 4800 M2 TEK TAPU TARLA',
            description: `Bilecik Bozüyük ilçesi Günyarık köyü Köydere Mevkiinde bulunan parsel 1168 arazi 4800 m2 dikdörtgen şeklindedir. Yapımına başlanan Bursa Eskişehir Kuzey Marmara Otoyolu Günyarık köyünden geçmesi planlanmaktadır.

Bozüyük Söğüt yolu üzeri Bilter hayvan çiftliği önünden geçen yol ile ulaşım sağlanmaktadır.
Bilter Hayvan Çiftliğine 800m çaprazda ve Eczacıbaşı Fabrikalarının 2 km üst kısmında bulunmaktadır.

Ekim için uygun ve verimlidir. Bozüyük yerleşim alanına 2,5 km mesafededir. Tam bir yatırım fırsatıdır.`,
            price: 660000,
            currency: 'TRY',
            latitude: 39.9012,
            longitude: 30.0456,
            address: 'Günyarık Köyü, Bozüyük, Bilecik',
            locationId: bozuyuk.id,
            category: PropertyCategory.TARLA,
            status: PropertyStatus.PUBLISHED,
            details: {
                area: 4800,
                metrekareFiyati: 138,
                adaNo: '0',
                parselNo: '1168',
                tapuDurumu: 'Müstakil Tapulu',
                imarDurumu: 'Tarla',
                elektrik: false,
                su: true,
                zeminEtudu: true,
                yoluAcilmis: true,
                anaYolaYakin: true,
                manzara: ['Doğa'],
                krediyeUygun: true,
                tapikas: false,
            },
        },
        {
            title: 'KÜTAHYA SİMAV\'DA 5.000 M2 VERİMLİ TARLA',
            description: `Kütahya Simav ilçesinde 5.000 m2 verimli tarla satılıktır.

Sulama imkanı mevcut, traktör girebilir durumda. Buğday, arpa veya ayçiçeği ekimine uygun.

Simav merkeze 8 km mesafede. Yatırım veya tarım amaçlı ideal.`,
            price: 750000,
            currency: 'TRY',
            latitude: 39.0845,
            longitude: 28.9789,
            address: 'Simav, Kütahya',
            locationId: simav.id,
            category: PropertyCategory.TARLA,
            status: PropertyStatus.PUBLISHED,
            details: {
                area: 5000,
                metrekareFiyati: 150,
                tapuDurumu: 'Müstakil Tapulu',
                imarDurumu: 'Tarım Arazisi',
                su: true,
                yoluAcilmis: true,
                manzara: ['Doğa'],
                krediyeUygun: true,
            },
        },
        {
            title: 'EDİRNE KEŞAN\'DA 3.200 M2 ZEYTİNLİK',
            description: `Edirne Keşan ilçesinde 3.200 m2 zeytinlik satılıktır.

80 adet verimli zeytin ağacı bulunmaktadır. Yıllık ortalama 1.5 ton zeytin hasadı.

Sulama imkanı mevcuttur. Traktör girebilir durumda yolu açıktır.`,
            price: 1850000,
            currency: 'TRY',
            latitude: 40.8512,
            longitude: 26.6356,
            address: 'Keşan, Edirne',
            locationId: kesan.id,
            category: PropertyCategory.ZEYTINLIK,
            status: PropertyStatus.PUBLISHED,
            details: {
                area: 3200,
                metrekareFiyati: 578,
                tapuDurumu: 'Müstakil Tapulu',
                imarDurumu: 'Tarım Arazisi',
                su: true,
                yoluAcilmis: true,
                manzara: ['Doğa'],
                krediyeUygun: true,
            },
        },
        {
            title: 'AFYONKARAHİSAR EMİRDAĞ\'DA 10.000 M2 TARLA',
            description: `Afyonkarahisar Emirdağ ilçesinde 10.000 m2 geniş tarla satılıktır.

Düz arazi, tarıma elverişli toprak yapısı. Sulama kanalına yakın.

Emirdağ merkeze 5 km, ana yola 500 metre mesafede.`,
            price: 1200000,
            currency: 'TRY',
            latitude: 39.0156,
            longitude: 31.1523,
            address: 'Emirdağ, Afyonkarahisar',
            locationId: emirdag.id,
            category: PropertyCategory.TARLA,
            status: PropertyStatus.PUBLISHED,
            details: {
                area: 10000,
                metrekareFiyati: 120,
                tapuDurumu: 'Müstakil Tapulu',
                imarDurumu: 'Tarım Arazisi',
                su: true,
                yoluAcilmis: true,
                anaYolaYakin: true,
                manzara: ['Doğa'],
                krediyeUygun: true,
            },
        },
        {
            title: 'KONYA BEYŞEHİR GÖL MANZARALI 2.500 M2 ARSA',
            description: `Konya Beyşehir'de muhteşem göl manzaralı 2.500 m2 arsa satılıktır.

Beyşehir Gölü'ne kuş uçuşu 1 km mesafede. Yazlık veya bağ evi yapımına uygun.

Elektrik ve su yakın mesafede. Stabilize yolu mevcut.`,
            price: 2200000,
            currency: 'TRY',
            latitude: 37.6789,
            longitude: 31.7234,
            address: 'Beyşehir, Konya',
            locationId: beysehir.id,
            category: PropertyCategory.BAHCE,
            status: PropertyStatus.PUBLISHED,
            details: {
                area: 2500,
                metrekareFiyati: 880,
                tapuDurumu: 'Müstakil Tapulu',
                imarDurumu: 'Tarım Arazisi',
                yoluAcilmis: true,
                manzara: ['Göl', 'Doğa'],
                krediyeUygun: true,
            },
        },
        {
            title: 'ANKARA NALLIHAN\'DA 8.000 M2 TARLA',
            description: `Ankara Nallıhan ilçesinde 8.000 m2 tarla satılıktır.

Verimli toprak yapısı, sulama imkanı mevcut. Tarım veya hayvancılık için ideal.

Nallıhan merkeze 10 km, Ankara-Eskişehir yoluna 3 km mesafede.`,
            price: 1600000,
            currency: 'TRY',
            latitude: 40.1856,
            longitude: 31.3512,
            address: 'Nallıhan, Ankara',
            locationId: nallihan.id,
            category: PropertyCategory.TARLA,
            status: PropertyStatus.PUBLISHED,
            details: {
                area: 8000,
                metrekareFiyati: 200,
                tapuDurumu: 'Müstakil Tapulu',
                imarDurumu: 'Tarım Arazisi',
                su: true,
                yoluAcilmis: true,
                anaYolaYakin: true,
                manzara: ['Doğa'],
                krediyeUygun: true,
            },
        },
        {
            title: 'BİLECİK SÖĞÜT\'TE 3.000 M2 İMARLI ARSA',
            description: `Bilecik Söğüt ilçe merkezinde 3.000 m2 imarlı arsa satılıktır.

Konut imarlı, 2 kat izinli. Altyapısı tamamlanmış, elektrik ve su mevcut.

Söğüt merkeze 1 km, okul ve hastaneye yakın konumda.`,
            price: 4500000,
            currency: 'TRY',
            latitude: 40.0234,
            longitude: 30.1845,
            address: 'Söğüt, Bilecik',
            locationId: sogut.id,
            category: PropertyCategory.KONUT,
            status: PropertyStatus.PUBLISHED,
            details: {
                area: 3000,
                metrekareFiyati: 1500,
                tapuDurumu: 'Kat Mülkiyetli',
                imarDurumu: 'Konut İmarlı',
                gabari: '6.50m',
                kaks: '0.60',
                elektrik: true,
                su: true,
                kanalizasyon: true,
                yoluAcilmis: true,
                topluUlasimaYakin: true,
                manzara: ['Şehir'],
                krediyeUygun: true,
            },
        },
        {
            title: 'KÜTAHYA SİMAV\'DA SANAYİ ARSASI 5.000 M2',
            description: `Kütahya Simav'da sanayi imarlı 5.000 m2 arsa satılıktır.

Sanayi imarlı, fabrika veya depo yapımına uygun. 3 fazlı elektrik çekilebilir.

Ana yola cepheli, tır giriş çıkışına uygun. Simav OSB'ye 3 km mesafede.`,
            price: 3500000,
            currency: 'TRY',
            latitude: 39.0912,
            longitude: 28.9856,
            address: 'Simav, Kütahya',
            locationId: simav.id,
            category: PropertyCategory.SANAYI,
            status: PropertyStatus.PUBLISHED,
            details: {
                area: 5000,
                metrekareFiyati: 700,
                tapuDurumu: 'Kat Mülkiyetli',
                imarDurumu: 'Sanayi İmarlı',
                elektrik: true,
                sanayiElektrigi: true,
                su: true,
                yoluAcilmis: true,
                anaYolaYakin: true,
                krediyeUygun: true,
            },
        },
    ];

    for (const propertyData of properties) {
        await prisma.property.create({
            data: {
                title: propertyData.title,
                description: propertyData.description,
                price: propertyData.price,
                currency: propertyData.currency,
                latitude: propertyData.latitude,
                longitude: propertyData.longitude,
                address: propertyData.address,
                category: propertyData.category,
                status: propertyData.status,
                details: propertyData.details,
                ownerId: owner.id,
                locationId: propertyData.locationId,
                publishedAt: new Date(),
            },
        });
        console.log(`✅ İlan oluşturuldu: ${propertyData.title.substring(0, 50)}...`);
    }

    console.log('🎉 Veritabanı seed işlemi başarıyla tamamlandı!');
}

main()
    .catch((e) => {
        console.error('❌ Seed işlemi sırasında hata:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
