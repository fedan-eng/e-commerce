import { render, screen } from '@testing-library/react'
import ProductCard from '@/components/ProductCard'
import { vi } from 'vitest'

// Mock the Next.js Image and Link components
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img src={props.src || '/placeholder.png'} alt={props.alt} {...props} />,
}))
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }) => (
    <a href={href || '#'} {...props}>
      {children}
    </a>
  ),
}))

// Mock the utility function
vi.mock('@/lib/utils', () => ({
  formatAmount: (amount) => `₦${amount.toLocaleString()}`,
}))

// Mock the child components
vi.mock('@/components/AddToCart', () => ({
  __esModule: true,
  default: ({ className, product, ...props }) => (
    <button className={className} data-testid="add-to-cart-button" {...props}>
      Add to Cart
    </button>
  ),
}))
vi.mock('@/components/WishlistButton', () => ({
  __esModule: true,
  default: ({ className, product, ...props }) => (
    <button className={className} data-testid="wishlist-button" {...props}>
      Wishlist
    </button>
  ),
}))

describe('ProductCard', () => {
  const mockProduct = {
    _id: '1',
    name: 'Wireless Headphones',
    image: '/headphones.jpg',
    price: 25000,
    originalPrice: 30000,
    category: 'Electronics',
    averageRating: 4.5,
    ratingCount: 128,
    availability: true,
    tag: '',
  }

  test('renders product name and price', () => {
    render(<ProductCard
      productName={mockProduct.name}
      productImage={mockProduct.image}
      productPrice={mockProduct.price}
      originalPrice={mockProduct.originalPrice}
      productCategory={mockProduct.category}
      product={mockProduct}
      productAverageRating={mockProduct.averageRating}
      productRatingCount={mockProduct.ratingCount}
    />)

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
    expect(screen.getByText('₦25,000')).toBeInTheDocument() // formatAmount(25000)
    expect(screen.getByText('₦30,000')).toBeInTheDocument() // formatAmount(30000)
  })

  test('renders product rating', () => {
    render(<ProductCard
      productName={mockProduct.name}
      productImage={mockProduct.image}
      productPrice={mockProduct.price}
      originalPrice={mockProduct.originalPrice}
      productCategory={mockProduct.category}
      product={mockProduct}
      productAverageRating={mockProduct.averageRating}
      productRatingCount={mockProduct.ratingCount}
    />)

    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(128)')).toBeInTheDocument()
  })

  test('handles product with no original price', () => {
    const productNoOriginalPrice = { ...mockProduct, originalPrice: 0 }

    render(<ProductCard
      productName={mockProduct.name}
      productImage={mockProduct.image}
      productPrice={mockProduct.price}
      originalPrice={productNoOriginalPrice.originalPrice}
      productCategory={mockProduct.category}
      product={productNoOriginalPrice}
      productAverageRating={mockProduct.averageRating}
      productRatingCount={mockProduct.ratingCount}
    />)

    // Should not show the original price (line-through) when it's 0
    expect(screen.getByText('₦25,000')).toBeInTheDocument()
    // The original price element might not be in the document at all
  })

  test('renders add to cart button', () => {
    render(<ProductCard
      productName={mockProduct.name}
      productImage={mockProduct.image}
      productPrice={mockProduct.price}
      originalPrice={mockProduct.originalPrice}
      productCategory={mockProduct.category}
      product={mockProduct}
      productAverageRating={mockProduct.averageRating}
      productRatingCount={mockProduct.ratingCount}
    />)

    expect(screen.getByTestId('add-to-cart-button')).toBeInTheDocument()
  })

  test('renders wishlist button', () => {
    render(<ProductCard
      productName={mockProduct.name}
      productImage={mockProduct.image}
      productPrice={mockProduct.price}
      originalPrice={mockProduct.originalPrice}
      productCategory={mockProduct.category}
      product={mockProduct}
      productAverageRating={mockProduct.averageRating}
      productRatingCount={mockProduct.ratingCount}
    />)

    expect(screen.getByTestId('wishlist-button')).toBeInTheDocument()
  })
})