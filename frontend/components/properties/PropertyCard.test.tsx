import { render, screen, fireEvent } from '@testing-library/react'
import { PropertyCard } from './PropertyCard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockProperty = {
    id: 'property-123',
    title: 'Lüks Daire',
    description: 'Merkezi konumda lüks daire',
    type: 'APARTMENT' as const,
    status: 'PUBLISHED' as const,
    price: 500000,
    area: 120,
    rooms: 3,
    bathrooms: 2,
    floor: 5,
    totalFloors: 10,
    buildYear: 2020,
    latitude: 41.0082,
    longitude: 28.9784,
    address: 'Test Mahallesi, Test Sokak No:1',
    images: [
        {
            id: 'img-1',
            url: 'https://example.com/image1.jpg',
            order: 0,
            propertyId: 'property-123',
            createdAt: new Date(),
        },
    ],
    city: {
        id: 'city-1',
        name: 'İstanbul',
        slug: 'istanbul',
    },
    district: {
        id: 'district-1',
        name: 'Kadıköy',
        slug: 'kadikoy',
    },
    owner: {
        id: 'owner-1',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet@example.com',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
}

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe('PropertyCard', () => {
    it('should render property information correctly', () => {
        render(<PropertyCard property={mockProperty} />, { wrapper: createWrapper() })

        expect(screen.getByText('Lüks Daire')).toBeInTheDocument()
        expect(screen.getByText('500.000 ₺')).toBeInTheDocument()
        expect(screen.getByText('120 m²')).toBeInTheDocument()
        expect(screen.getByText('3+1')).toBeInTheDocument()
        expect(screen.getByText(/Kadıköy/)).toBeInTheDocument()
    })

    it('should display property image', () => {
        render(<PropertyCard property={mockProperty} />, { wrapper: createWrapper() })

        const image = screen.getByRole('img')
        expect(image).toHaveAttribute('src', expect.stringContaining('image1.jpg'))
    })

    it('should show placeholder when no images', () => {
        const propertyWithoutImages = {
            ...mockProperty,
            images: [],
        }

        render(<PropertyCard property={propertyWithoutImages} />, { wrapper: createWrapper() })

        expect(screen.getByText(/Görsel Yok/i)).toBeInTheDocument()
    })

    it('should format price correctly', () => {
        const expensiveProperty = {
            ...mockProperty,
            price: 1500000,
        }

        render(<PropertyCard property={expensiveProperty} />, { wrapper: createWrapper() })

        expect(screen.getByText('1.500.000 ₺')).toBeInTheDocument()
    })

    it('should display property type badge', () => {
        render(<PropertyCard property={mockProperty} />, { wrapper: createWrapper() })

        expect(screen.getByText('Daire')).toBeInTheDocument()
    })

    it('should handle favorite button click', () => {
        render(<PropertyCard property={mockProperty} />, { wrapper: createWrapper() })

        const favoriteButton = screen.getByRole('button', { name: /favori/i })
        fireEvent.click(favoriteButton)

        // Button should be clickable
        expect(favoriteButton).toBeInTheDocument()
    })

    it('should navigate to property detail on card click', () => {
        const { container } = render(<PropertyCard property={mockProperty} />, {
            wrapper: createWrapper(),
        })

        const card = container.querySelector('a')
        expect(card).toHaveAttribute('href', '/properties/property-123')
    })

    it('should display location information', () => {
        render(<PropertyCard property={mockProperty} />, { wrapper: createWrapper() })

        expect(screen.getByText(/Kadıköy/)).toBeInTheDocument()
        expect(screen.getByText(/İstanbul/)).toBeInTheDocument()
    })

    it('should show property features', () => {
        render(<PropertyCard property={mockProperty} />, { wrapper: createWrapper() })

        expect(screen.getByText('120 m²')).toBeInTheDocument()
        expect(screen.getByText('3+1')).toBeInTheDocument()
        expect(screen.getByText('5. Kat')).toBeInTheDocument()
    })
})
