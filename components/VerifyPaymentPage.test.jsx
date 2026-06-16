// components/VerifyPaymentPage.test.jsx
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'
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

vi.mock('@/hooks/useGAEvent', () => ({
  useGAEvent: vi.fn(),
}))

vi.mock('@/store/features/cartSlice', () => ({
  clearCart: vi.fn(() => ({ type: 'cart/clearCart' })),
}))

vi.mock('axios', () => ({
  default: { post: vi.fn() },
}))

vi.mock('lib/utils', () => ({
  formatAmount: (amount) => `₦${Number(amount).toLocaleString()}`,
}))

vi.mock('@/components/Loading', () => ({
  default: () => <div data-testid="loading">Loading...</div>,
}))

vi.mock('@/components/FeedbackForm', () => ({
  default: () => <div data-testid="feedback-form" />,
}))

vi.mock('@/components/TextSlider', () => ({
  default: () => <div data-testid="text-slider" />,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('jspdf', () => ({
  default: vi.fn(),
}))

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}))

// ─── IMPORTS AFTER MOCKS ──────────────────────────────────────────────────────

import { useSearchParams, useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { useGAEvent } from '@/hooks/useGAEvent'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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
  deliveryType: 'Standard',
  total: 24000,
  subTotal: 25000,
  discount: 2000,
  deliveryFee: 1000,
  cartItems: [
    { _id: 'prod_1', name: 'Product 1', price: 15000, quantity: 1, image: '/img1.jpg' },
    { _id: 'prod_2', name: 'Product 2', price: 10000, quantity: 1, image: '/img2.jpg' },
  ],
}

// ─── SETUP HELPERS ────────────────────────────────────────────────────────────

const mockDispatchFn = vi.fn()
const mockRouterPush = vi.fn()
const mockTrackEvent = vi.fn()

/**
 * Sets up all the common mocks before each test.
 * Pass overrides to customize per test.
 */
function setupMocks({
  paystackRef = null,
  flutterwaveRef = null,
  flutterwaveStatus = null,
  axiosResponse = { data: { verified: true, orderData: mockOrderDetails } },
  selectorUser = null,
  selectorCartItems = [],
} = {}) {
  const getMock = vi.fn((key) => {
    if (key === 'reference') return paystackRef
    if (key === 'transaction_id') return flutterwaveRef
    if (key === 'status') return flutterwaveStatus
    return null
  })

  vi.mocked(useSearchParams).mockReturnValue({ get: getMock })
  vi.mocked(useRouter).mockReturnValue({ push: mockRouterPush })
  vi.mocked(useDispatch).mockReturnValue(mockDispatchFn)
  vi.mocked(useSelector).mockImplementation((selector) => {
    const str = selector.toString()
    if (str.includes('cart')) return selectorCartItems
    if (str.includes('auth')) return selectorUser
    return null
  })
  vi.mocked(useGAEvent).mockReturnValue({ trackEvent: mockTrackEvent })
  vi.mocked(axios.post).mockResolvedValue(axiosResponse)
}

// ─── TESTS ────────────────────────────────────────────────────────────────────

describe('VerifyPaymentPage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Loading State ────────────────────────────────────────────────────────

  describe('Loading State', () => {
    test('shows loading component while verifying payment', async () => {
      setupMocks({ paystackRef: 'ref_123' })

      // Delay axios so loading state is visible
      vi.mocked(axios.post).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          data: { verified: true, orderData: mockOrderDetails }
        }), 100))
      )

      render(<VerifyPaymentPage />)
      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })
  })

  // ── No Reference ─────────────────────────────────────────────────────────

  describe('No Payment Reference', () => {
    test('shows error when no reference is in URL', async () => {
      setupMocks() // no paystackRef or flutterwaveRef

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByText(/No payment reference found/i)).toBeInTheDocument()
      })
    })

    test('does not call verify-payment API when no reference', async () => {
      setupMocks()

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(axios.post).not.toHaveBeenCalled()
      })
    })
  })

  // ── Paystack Flow ─────────────────────────────────────────────────────────

  describe('Paystack Payment Flow', () => {
    test('calls verify-payment with paystack provider and reference', async () => {
      setupMocks({ paystackRef: 'paystack_ref_456' })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/verify-payment', {
          reference: 'paystack_ref_456',
          provider: 'paystack',
        })
      })
    })

    test('shows order confirmed on successful paystack verification', async () => {
      setupMocks({ paystackRef: 'paystack_ref_456' })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByText(/Order Confirmed/i)).toBeInTheDocument()
      })
    })

    test('shows customer name after successful verification', async () => {
      setupMocks({ paystackRef: 'paystack_ref_456' })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByText(/Hello John/i)).toBeInTheDocument()
      })
    })

    test('shows paystack as payment provider', async () => {
      setupMocks({ paystackRef: 'paystack_ref_456' })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        // "Paid via:" label is unique — use it to scope the assertion
        expect(screen.getByText(/Paid via:/i)).toBeInTheDocument()
        // Multiple elements contain "paystack" — assert at least one exists
        const paystackElements = screen.getAllByText(/paystack/i)
        expect(paystackElements.length).toBeGreaterThan(0)
      })
    })

    test('shows payment reference on success page', async () => {
      setupMocks({ paystackRef: 'paystack_ref_456' })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        // Multiple elements show the reference — assert at least one exists
        const refElements = screen.getAllByText(/ref_abc123/i)
        expect(refElements.length).toBeGreaterThan(0)
      })
    })
  })

  // ── Flutterwave Flow ──────────────────────────────────────────────────────

  describe('Flutterwave Payment Flow', () => {
    test('calls verify-payment with flutterwave provider when transaction_id is present', async () => {
      setupMocks({
        flutterwaveRef: 'fw_txn_789',
        flutterwaveStatus: 'successful',
      })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/verify-payment', {
          reference: 'fw_txn_789',
          provider: 'flutterwave',
        })
      })
    })

    test('also accepts "completed" as a valid flutterwave status', async () => {
      setupMocks({
        flutterwaveRef: 'fw_txn_completed',
        flutterwaveStatus: 'completed',
      })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/verify-payment', {
          reference: 'fw_txn_completed',
          provider: 'flutterwave',
        })
      })
    })

    test('shows error when flutterwave status is "failed" without calling API', async () => {
      setupMocks({
        flutterwaveRef: 'fw_txn_fail',
        flutterwaveStatus: 'failed',
      })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByText(/Payment was not successful/i)).toBeInTheDocument()
      })

      expect(axios.post).not.toHaveBeenCalled()
    })

    test('shows error when flutterwave status is "cancelled"', async () => {
      setupMocks({
        flutterwaveRef: 'fw_txn_cancel',
        flutterwaveStatus: 'cancelled',
      })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByText(/Payment was not successful/i)).toBeInTheDocument()
      })
    })
  })

  // ── API Verification Logic ────────────────────────────────────────────────

  describe('API Verification Logic', () => {
    test('shows error when API returns verified: false', async () => {
      setupMocks({
        paystackRef: 'ref_unverified',
        axiosResponse: { data: { verified: false } },
      })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByText(/Payment verification failed/i)).toBeInTheDocument()
      })
    })

    test('shows error message from API response on network error', async () => {
      setupMocks({ paystackRef: 'ref_network_err' })
      vi.mocked(axios.post).mockRejectedValue({
        response: { data: { message: 'Server unavailable' } },
      })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByText(/Server unavailable/i)).toBeInTheDocument()
      })
    })

    test('shows fallback error message when no API error message', async () => {
      setupMocks({ paystackRef: 'ref_generic_err' })
      vi.mocked(axios.post).mockRejectedValue(new Error('Network Error'))

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByText(/couldn't verify your payment/i)).toBeInTheDocument()
      })
    })

    test('does not call API twice on re-render (hasVerified ref guard)', async () => {
      setupMocks({ paystackRef: 'ref_once' })

      const { rerender } = render(<VerifyPaymentPage />)
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))

      rerender(<VerifyPaymentPage />)
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1)) // still 1
    })
  })

  // ── Cart & LocalStorage Cleanup ───────────────────────────────────────────

  describe('Post-verification Cleanup', () => {
    test('dispatches clearCart after successful verification', async () => {
      setupMocks({
        paystackRef: 'ref_clear',
        selectorCartItems: [{ _id: 'prod_1', quantity: 1 }],
      })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(mockDispatchFn).toHaveBeenCalledWith({ type: 'cart/clearCart' })
      })
    })

    test('clears all checkout localStorage keys after verification', async () => {
      setupMocks({ paystackRef: 'ref_localstorage' })

      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        const removedKeys = removeItemSpy.mock.calls.map(([key]) => key)
        expect(removedKeys).toContain('cart')
        expect(removedKeys).toContain('checkoutEmail')
        expect(removedKeys).toContain('checkoutFirstName')
        expect(removedKeys).toContain('checkoutAddress')
        expect(removedKeys).toContain('checkoutPhone')
        expect(removedKeys).toContain('checkoutaddPhone')
        expect(removedKeys).toContain('checkoutRegion')
        expect(removedKeys).toContain('checkoutCity')
        expect(removedKeys).toContain('checkoutDeliveryType')
      })

      removeItemSpy.mockRestore()
    })
  })

  // ── Success UI ────────────────────────────────────────────────────────────

  describe('Success UI', () => {
    test('renders all cart items from order', async () => {
      setupMocks({ paystackRef: 'ref_items' })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument()
        expect(screen.getByText('Product 2')).toBeInTheDocument()
      })
    })

    test('renders order totals correctly', async () => {
      setupMocks({ paystackRef: 'ref_totals' })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByText(/Sub Total/i)).toBeInTheDocument()
        expect(screen.getByText(/Delivery Fees/i)).toBeInTheDocument()
        expect(screen.getByText(/Discount/i)).toBeInTheDocument()
      })
    })

    test('renders Download Receipt button', async () => {
      setupMocks({ paystackRef: 'ref_pdf' })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download Receipt/i })).toBeInTheDocument()
      })
    })

    test('renders Continue Shopping link', async () => {
      setupMocks({ paystackRef: 'ref_link' })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Continue Shopping/i })).toBeInTheDocument()
      })
    })
  })

  // ── Error UI ──────────────────────────────────────────────────────────────

  describe('Error UI', () => {
    test('shows Try Again and Back to Home buttons on error', async () => {
      setupMocks({
        paystackRef: 'ref_err_ui',
        axiosResponse: { data: { verified: false } },
      })

      render(<VerifyPaymentPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Back to Home/i })).toBeInTheDocument()
      })
    })

    test('Try Again button navigates to /cart', async () => {
      setupMocks({
        paystackRef: 'ref_try_again',
        axiosResponse: { data: { verified: false } },
      })

      render(<VerifyPaymentPage />)

      await waitFor(() => screen.getByRole('button', { name: /Try Again/i }))
      await userEvent.click(screen.getByRole('button', { name: /Try Again/i }))

      expect(mockRouterPush).toHaveBeenCalledWith('/cart')
    })

    test('Back to Home button navigates to /', async () => {
      setupMocks({
        paystackRef: 'ref_home',
        axiosResponse: { data: { verified: false } },
      })

      render(<VerifyPaymentPage />)

      await waitFor(() => screen.getByRole('button', { name: /Back to Home/i }))
      await userEvent.click(screen.getByRole('button', { name: /Back to Home/i }))

      expect(mockRouterPush).toHaveBeenCalledWith('/')
    })
  })

  // ── PDF Receipt ───────────────────────────────────────────────────────────

  describe('PDF Receipt Generation', () => {
    test('calls jsPDF and saves receipt when Download Receipt is clicked', async () => {
      setupMocks({ paystackRef: 'ref_pdf_gen' })

      const mockSave = vi.fn()
      const mockDocInstance = {
        internal: { pageSize: { width: 210, height: 297 } },
        // GState must be a constructor that can be called with `new`
        GState: vi.fn(function(opts) { return opts }),
        setGState: vi.fn(),
        setFontSize: vi.fn(),
        setTextColor: vi.fn(),
        text: vi.fn(),
        setFont: vi.fn(),
        addImage: vi.fn(),
        setDrawColor: vi.fn(),
        setLineWidth: vi.fn(),
        line: vi.fn(),
        setFillColor: vi.fn(),
        roundedRect: vi.fn(),
        lastAutoTable: { finalY: 100 },
        save: mockSave,
      }

      // Use mockImplementation with a proper constructor function
      vi.mocked(jsPDF).mockImplementation(function() {
        return mockDocInstance
      })

      render(<VerifyPaymentPage />)

      await waitFor(() => screen.getByRole('button', { name: /Download Receipt/i }))
      await userEvent.click(screen.getByRole('button', { name: /Download Receipt/i }))

      expect(mockSave).toHaveBeenCalledWith(`FIL-Receipt-${mockOrderDetails.paymentReference}.pdf`)
    })
  })

})