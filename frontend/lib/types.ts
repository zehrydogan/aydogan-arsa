// User types
export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    phone?: string
    avatar?: string
    role: 'ADMIN' | 'OWNER' | 'VISITOR'
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// Auth types
export interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    firstName: string
    lastName: string
    email: string
    phone?: string
    password: string
    role: 'OWNER' | 'VISITOR'
}

// Property types - Arsa/Arazi için (Sahibinden formatı)
export interface Property {
    id: string
    title: string
    description: string
    price: string
    currency: string
    latitude: number
    longitude: number
    address: string
    details?: {
        // Temel Bilgiler
        area?: number               // m² cinsinden alan
        metrekareFiyati?: number    // m² fiyatı (TL/m²)

        // Tapu Bilgileri
        adaNo?: string              // Ada No
        parselNo?: string           // Parsel No
        paftaNo?: string            // Pafta No
        tapuDurumu?: string         // Tapu Durumu (Müstakil Tapulu, Hisseli, vb.)

        // İmar Bilgileri
        imarDurumu?: string         // İmar Durumu (Tarla, Konut, Ticari, vb.)
        gabari?: string             // Gabari
        kaks?: string               // Kaks (Emsal)
        taks?: string               // Taks

        // Altyapı Özellikleri
        elektrik?: boolean          // Elektrik
        sanayiElektrigi?: boolean   // Sanayi Elektriği
        su?: boolean                // Su
        telefon?: boolean           // Telefon
        dogalgaz?: boolean          // Doğalgaz
        kanalizasyon?: boolean      // Kanalizasyon
        aritma?: boolean            // Arıtma
        sondajKuyu?: boolean        // Sondaj & Kuyu
        zeminEtudu?: boolean        // Zemin Etüdü
        yoluAcilmis?: boolean       // Yolu Açılmış
        yoluAcilmamis?: boolean     // Yolu Açılmamış
        yoluYok?: boolean           // Yolu Yok

        // Konum Özellikleri
        anaYolaYakin?: boolean      // Ana Yola Yakın
        denizeSifir?: boolean       // Denize Sıfır
        denizeYakin?: boolean       // Denize Yakın
        havaalaninYakin?: boolean   // Havaalanına Yakın
        topluUlasimaYakin?: boolean // Toplu Ulaşıma Yakın

        // Genel Özellikler
        ifrazli?: boolean           // İfrazlı
        parselli?: boolean          // Parselli
        projeli?: boolean           // Projeli
        koseParsel?: boolean        // Köşe Parsel

        // Manzara
        manzara?: string[]          // Manzara (Şehir, Deniz, Doğa, Göl, Boğaz)

        // Diğer
        krediyeUygun?: boolean      // Krediye Uygunluk
        tapikas?: boolean           // Takas
    }
    category: 'IMARLIARSA' | 'TARLA' | 'BAHCE' | 'ZEYTINLIK' | 'BAGLIK' | 'SANAYI' | 'KONUT' | 'TICARI'
    status: 'DRAFT' | 'PUBLISHED' | 'SOLD' | 'INACTIVE'
    createdAt: string
    updatedAt: string
    publishedAt?: string
    images: PropertyImage[]
    location: Location
    owner: User
    features: PropertyFeature[]
}

export interface PropertyImage {
    id: string
    url: string
    alt?: string
    order: number
    createdAt: string
}

export interface Location {
    id: string
    name: string
    type: 'CITY' | 'DISTRICT' | 'NEIGHBORHOOD'
}

export interface Feature {
    id: string
    name: string
    category: string
    icon?: string
}

export interface PropertyFeature {
    feature: Feature
}

// Search types - Arsa/Arazi için
export interface SearchFilters {
    search?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    minArea?: string
    maxArea?: string
    imarDurumu?: string
    tapuDurumu?: string
    location?: string
    features?: string[]
    sortBy?: string
    sortOrder?: string
}

export interface SearchState {
    filters: SearchFilters
    results: Property[]
    loading: boolean
    total: number
    page: number
    totalPages: number
}

// Favorites types
export interface Favorite {
    userId: string
    propertyId: string
    createdAt: string
    property: Property
}

// Saved Search types
export interface SavedSearch {
    id: string
    name: string
    filters: SearchFilters
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
    data?: T
    message?: string
    error?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

// Contact types
export interface ContactRequest {
    id: string
    subject: string
    message: string
    visitorId?: string
    guestName?: string
    guestEmail?: string
    guestPhone?: string
    propertyId: string
    status: 'PENDING' | 'RESPONDED' | 'CLOSED'
    isRead: boolean
    createdAt: string
    property?: {
        id: string
        title: string
        owner: {
            id: string
            firstName: string
            lastName: string
            email: string
        }
    }
    visitor?: {
        id: string
        firstName: string
        lastName: string
        email: string
        phone?: string
    }
}

export interface CreateContactRequestDto {
    subject: string
    message: string
    propertyId: string
    guestName?: string
    guestEmail?: string
    guestPhone?: string
}

// Message types
export interface Message {
    id: string
    content: string
    senderId: string
    receiverId: string
    conversationId: string
    isRead: boolean
    createdAt: string
    sender: {
        id: string
        firstName: string
        lastName: string
        avatar?: string
    }
    receiver: {
        id: string
        firstName: string
        lastName: string
    }
}

export interface Conversation {
    id: string
    propertyId: string
    createdAt: string
    updatedAt: string
    participants: Array<{
        id: string
        userId: string
        joinedAt: string
        lastReadAt?: string
        user: {
            id: string
            firstName: string
            lastName: string
            avatar?: string
        }
    }>
    property: {
        id: string
        title: string
        images: Array<{ url: string }>
    }
    messages: Message[]
    _count: {
        messages: number
    }
}

export interface CreateConversationDto {
    propertyId: string
    participantId: string
    initialMessage: string
}

export interface CreateMessageDto {
    content: string
    receiverId: string
    conversationId: string
}