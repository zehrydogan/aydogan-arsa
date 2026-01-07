import { PrismaClient, UserRole, LocationType, PropertyStatus, PropertyCategory, ContactStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Veritabanı seed işlemi başlatılıyor...');

    // Mevcut verileri temizle
    await prisma.message.deleteMany({});
    await prisma.conversationParticipant.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.contactRequest.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.savedSearch.deleteMany({});
    await prisma.propertyFeature.deleteMany({});
    await prisma.propertyImage.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.feature.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Mevcut veriler temizlendi');

    const hashedPassword = await bcrypt.hash('123456', 10);

    // Kullanıcılar
    const admin = await prisma.user.create({
        data: {
            email: 'admin@aydoganarsa.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'Kullanıcı',
            phone: '+90 532 111 11 11',
            role: UserRole.ADMIN,
        },
    });

    const owner1 = await prisma.user.create({
        data: {
            email: 'info@aydoganarsa.com',
            password: hashedPassword,
            firstName: 'Aydoğan',
            lastName: 'Arsa',
            phone: '+90 532 222 22 22',
            role: UserRole.OWNER,
        },
    });

    const owner2 = await prisma.user.create({
        data: {
            email: 'mehmet@emlak.com',
            password: hashedPassword,
            firstName: 'Mehmet',
            lastName: 'Yılmaz',
            phone: '+90 532 333 33 33',
            role: UserRole.OWNER,
        },
    });

    const visitor1 = await prisma.user.create({
        data: {
            email: 'ahmet@gmail.com',
            password: hashedPassword,
            firstName: 'Ahmet',
            lastName: 'Demir',
            phone: '+90 532 444 44 44',
            role: UserRole.VISITOR,
        },
    });

    const visitor2 = await prisma.user.create({
        data: {
            email: 'ayse@gmail.com',
            password: hashedPassword,
            firstName: 'Ayşe',
            lastName: 'Kaya',
            phone: '+90 532 555 55 55',
            role: UserRole.VISITOR,
        },
    });

    const visitor3 = await prisma.user.create({
        data: {
            email: 'fatma@gmail.com',
            password: hashedPassword,
            firstName: 'Fatma',
            lastName: 'Özkan',
            phone: '+90 532 666 66 66',
            role: UserRole.VISITOR,
        },
    });

    console.log('✅ Kullanıcılar oluşturuldu');

    // İller - Türkiye'nin önemli illeri
    const istanbul = await prisma.location.create({
        data: { id: 'istanbul', name: 'İstanbul', type: LocationType.CITY },
    });

    const ankara = await prisma.location.create({
        data: { id: 'ankara', name: 'Ankara', type: LocationType.CITY },
    });

    const izmir = await prisma.location.create({
        data: { id: 'izmir', name: 'İzmir', type: LocationType.CITY },
    });

    const bilecik = await prisma.location.create({
        data: { id: 'bilecik', name: 'Bilecik', type: LocationType.CITY },
    });

    const kutahya = await prisma.location.create({
        data: { id: 'kutahya', name: 'Kütahya', type: LocationType.CITY },
    });

    const edirne = await prisma.location.create({
        data: { id: 'edirne', name: 'Edirne', type: LocationType.CITY },
    });

    const afyon = await prisma.location.create({
        data: { id: 'afyon', name: 'Afyonkarahisar', type: LocationType.CITY },
    });

    const konya = await prisma.location.create({
        data: { id: 'konya', name: 'Konya', type: LocationType.CITY },
    });

    const bursa = await prisma.location.create({
        data: { id: 'bursa', name: 'Bursa', type: LocationType.CITY },
    });

    const antalya = await prisma.location.create({
        data: { id: 'antalya', name: 'Antalya', type: LocationType.CITY },
    });