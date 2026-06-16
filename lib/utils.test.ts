import { formatAmount } from '@/lib/utils'

describe('formatAmount', () => {
  test('formats naira amount correctly', () => {
    expect(formatAmount(5000)).toBe('₦5,000')
  })

  test('formats naira amount with decimals', () => {
    expect(formatAmount(5000.50)).toBe('₦5,000.5')
  })

  test('formats zero amount', () => {
    expect(formatAmount(0)).toBe('₦0')
  })

  test('formats large amount', () => {
    expect(formatAmount(1000000)).toBe('₦1,000,000')
  })
})