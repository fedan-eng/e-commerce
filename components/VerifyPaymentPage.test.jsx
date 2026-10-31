// components/VerifyPaymentPage.test.jsx
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// ─── ALL vi.mock() CALLS MUST BE AT THE TOP ───────────────────────────────────

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}))

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}))

vi.mock('@/hooks/useMetaPixelEvent', () => ({
  useMetaPixelEvent: () => ({ trackPurchase: mockMetaPurchase }),
}))

vi.mock('@/hooks/useTikTokEvent', () => ({
  useTikTokEvent: () => ({ trackPurchase: mockTikTokPurchase }),
}))

vi.mock('@/store/features/cartSlice', () => ({
  removePurchased: vi.fn((items) => ({ type: 'cart/removePurchased', payload: items })),
}))

vi.mock('axios', () => ({
  default: { post: vi.fn() },
}))

vi.mock('@/lib/utils', () => ({
  formatAmount: (amount) => `₦${Number(amount).toLocaleString()}`,
}))

vi.mock('@/components/Loading', () => ({
  default: () => <div data-testid="loading">Loading...</div>,
}))

vi.mock('@/components/FeedbackForm', () => ({
  default: () => <div data-testid="feedback-form" />,
}))

vi.mock('./ProductImage', () => ({
  ProductImage: ({ alt }) => <img alt={alt} />,
}))

vi.mock('./checkout/receiptPdf', () => ({
  downloadReceipt: vi.fn(() => Promise.resolve()),
}))

vi.mock('./checkout/SaveAccountCard', () => ({
  default: () => <div data-testid="save-account" />,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
}))

// ─── IMPORTS AFTER MOCKS ──────────────────────────────────────────────────────

import { useSearchParams, useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { removePurchased } from '@/store/features/cartSlice'
import { downloadReceipt } from './checkout/receiptPdf'
import VerifyPaymentPage from './VerifyPaymentPage.jsx'

// ─── TEST DATA ────────────────────────────────────────────────────────────────

const mockOrderDetails = {
  _id: 'order_123',
  paymentReference: 'ref_abc123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '08012345678',
  address: '123 Test Street',
  city: 'Lagos',
  region: { name: 'Lagos' },
  deliveryType: 'Regular',
  total: 24000,
  subTotal: 25000,
  discount: 2000,
  promoCode: 'WELCOME10',
  deliveryFee: 1000,
  cartItems: [
    { _id: 'prod_1', name: 'Product 1', price: 15000, quantity: 1, image: '/img1.jpg' },
    { _id: 'prod_2', name: 'Product 2', price: 10000, quantity: 1, image: '/img2.jpg' },
  ],
}

// ─── SETUP HELPERS ────────────────────────────────────────────────────────────

const mockDispatchFn = vi.fn()
const mockRouterPush = vi.fn()
const mockMetaPurchase = vi.fn()
const mockTikTokPurchase = vi.fn()

function setupMocks({
  paystackRef = null,
  axiosResponse = { data: { verified: true, orderData: mockOrderDetails } },
  isAuthenticated = false,
} = {}) {
  vi.mocked(useSearchParams).mockReturnValue({ get: (key) => (key === 'reference' ? paystackRef : null) })
  vi.mocked(useRouter).mockReturnValue({ push: mockRouterPush })
  vi.mocked(useDispatch).mockReturnValue(mockDispatchFn)
  vi.mocked(useSelector).mockImplementation((selector) => selector({ auth: { isAuthenticated } }))

  if (axiosResponse instanceof Error) vi.mocked(axios.post).mockRejectedValue(axiosResponse)
  else vi.mocked(axios.post).mockResolvedValue(axiosResponse)
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

// ─── TESTS ────────────────────────────────────────────────────────────────────

describe('VerifyPaymentPage', () => {
  describe('Verification', () => {
    test('shows loading while verifying payment', () => {
      setupMocks({ paystackRef: 'ref_abc123' })
      vi.mocked(axios.post).mockReturnValue(new Promise(() => {}))
      render(<VerifyPaymentPage />)
      expect(screen.getByTestId('loading')).toBeInTheDocument()
      expect(screen.getByText(/Confirming your payment/i)).toBeInTheDocument()
    })

    test('shows an error and skips the API when there is no reference', async () => {
      setupMocks()
      render(<VerifyPaymentPage />)
      await waitFor(() => expect(screen.getByText(/No payment reference found/i)).toBeInTheDocument())
      expect(axios.post).not.toHaveBeenCalled()
    })

    test('calls verify-payment with the paystack reference', async () => {
      setupMocks({ paystackRef: 'ref_abc123' })
      render(<VerifyPaymentPage />)
      await waitFor(() =>
        expect(axios.post).toHaveBeenCalledWith('/api/verify-payment', { reference: 'ref_abc123', provider: 'paystack' })
      )
    })

    test('verifies only once across re-renders', async () => {
      setupMocks({ paystackRef: 'ref_abc123' })
      const { rerender } = render(<VerifyPaymentPage />)
      rerender(<VerifyPaymentPage />)
      await waitFor(() => screen.getByText(/Thank you, John/i))
      expect(axios.post).toHaveBeenCalledTimes(1)
    })

    test('shows the API message when verified is false', async () => {
      setupMocks({ paystackRef: 'ref', axiosResponse: { data: { verified: false } } })
      render(<VerifyPaymentPage />)
      await waitFor(() => expect(screen.getByText(/Payment verification failed/i)).toBeInTheDocument())
    })

    test('shows the server message on a request error', async () => {
      const err = Object.assign(new Error('x'), { response: { data: { message: 'Server unavailable' } } })
      setupMocks({ paystackRef: 'ref', axiosResponse: err })
      render(<VerifyPaymentPage />)
      await waitFor(() => expect(screen.getByText(/Server unavailable/i)).toBeInTheDocument())
    })

    test('falls back to a generic message', async () => {
      setupMocks({ paystackRef: 'ref', axiosResponse: new Error('network') })
      render(<VerifyPaymentPage />)
      await waitFor(() => expect(screen.getByText(/couldn't verify your payment/i)).toBeInTheDocument())
    })
  })

  describe('After a successful payment', () => {
    test('removes only the purchased items from the cart', async () => {
      setupMocks({ paystackRef: 'ref_abc123' })
      render(<VerifyPaymentPage />)
      await waitFor(() => expect(removePurchased).toHaveBeenCalledWith(mockOrderDetails.cartItems))
      expect(mockDispatchFn).toHaveBeenCalledWith({ type: 'cart/removePurchased', payload: mockOrderDetails.cartItems })
    })

    test('clears old checkout keys from localStorage', async () => {
      localStorage.setItem('checkoutEmail', 'x')
      localStorage.setItem('checkoutCity', 'y')
      setupMocks({ paystackRef: 'ref_abc123' })
      render(<VerifyPaymentPage />)
      await waitFor(() => screen.getByText(/Thank you, John/i))
      expect(localStorage.getItem('checkoutEmail')).toBeNull()
      expect(localStorage.getItem('checkoutCity')).toBeNull()
    })

    test('fires Meta and TikTok purchase events', async () => {
      setupMocks({ paystackRef: 'ref_abc123' })
      render(<VerifyPaymentPage />)
      await waitFor(() => expect(mockMetaPurchase).toHaveBeenCalledWith(mockOrderDetails, mockOrderDetails.cartItems))
      expect(mockTikTokPurchase).toHaveBeenCalledWith(mockOrderDetails.cartItems, 24000, 'ref_abc123')
    })

    test('shows the order: thanks, reference, items and totals', async () => {
      setupMocks({ paystackRef: 'ref_abc123' })
      render(<VerifyPaymentPage />)
      await waitFor(() => screen.getByText(/Thank you, John/i))
      expect(screen.getByText('#ref_abc123')).toBeInTheDocument()
      expect(screen.getByText('Product 1')).toBeInTheDocument()
      expect(screen.getByText('Product 2')).toBeInTheDocument()
      expect(screen.getByText(/Discount \(WELCOME10\)/)).toBeInTheDocument()
      expect(screen.getByText('₦24,000')).toBeInTheDocument()
      expect(screen.getByText(/Paid via Paystack/i)).toBeInTheDocument()
    })

    test('offers guests an account, and sends them to tracking by order id', async () => {
      setupMocks({ paystackRef: 'ref_abc123' })
      render(<VerifyPaymentPage />)
      await waitFor(() => screen.getByText(/Thank you, John/i))
      expect(screen.getByTestId('save-account')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Track order/i })).toHaveAttribute('href', '/contact?order=order_123#track')
    })

    test('signed-in shoppers track in My orders and get no account offer', async () => {
      setupMocks({ paystackRef: 'ref_abc123', isAuthenticated: true })
      render(<VerifyPaymentPage />)
      await waitFor(() => screen.getByText(/Thank you, John/i))
      expect(screen.queryByTestId('save-account')).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Track order/i })).toHaveAttribute('href', '/profile?tab=My%20Orders')
    })

    test('renders Continue Shopping link', async () => {
      setupMocks({ paystackRef: 'ref_abc123' })
      render(<VerifyPaymentPage />)
      await waitFor(() => expect(screen.getByRole('link', { name: /Continue Shopping/i })).toBeInTheDocument())
    })

    test('downloads the receipt', async () => {
      setupMocks({ paystackRef: 'ref_abc123' })
      render(<VerifyPaymentPage />)
      await waitFor(() => screen.getByRole('button', { name: /Download Receipt/i }))
      await userEvent.click(screen.getByRole('button', { name: /Download Receipt/i }))
      expect(downloadReceipt).toHaveBeenCalledWith(mockOrderDetails, 'paystack')
    })
  })

  describe('Error state buttons', () => {
    test('Try Again goes to the cart and Back to Home goes home', async () => {
      setupMocks({ paystackRef: 'ref', axiosResponse: { data: { verified: false } } })
      render(<VerifyPaymentPage />)
      await waitFor(() => screen.getByRole('button', { name: /Try Again/i }))
      await userEvent.click(screen.getByRole('button', { name: /Try Again/i }))
      expect(mockRouterPush).toHaveBeenCalledWith('/cart')
      await userEvent.click(screen.getByRole('button', { name: /Back to Home/i }))
      expect(mockRouterPush).toHaveBeenCalledWith('/')
    })
  })
})
