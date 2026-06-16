import cartReducer, { addToCart, removeFromCart, updateQuantity, clearCart } from '@/store/features/cartSlice'

describe('cartReducer', () => {
  const initialState = {
    items: [],
  }

  test('adds item to empty cart', () => {
    const newItem = { _id: '1', color: 'red', quantity: 1, price: 5000 }
    const state = cartReducer(initialState, addToCart(newItem))
    expect(state.items).toHaveLength(1)
    expect(state.items[0]).toEqual(newItem)
  })

  test('increases quantity for existing item with same id and color', () => {
    const initialStateWithItem = {
      items: [{ _id: '1', color: 'red', quantity: 1, price: 5000 }]
    }
    const newItem = { _id: '1', color: 'red', quantity: 1, price: 5000 }
    const state = cartReducer(initialStateWithItem, addToCart(newItem))
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(2)
  })

  test('adds new item when same id but different color', () => {
    const initialStateWithItem = {
      items: [{ _id: '1', color: 'red', quantity: 1, price: 5000 }]
    }
    const newItem = { _id: '1', color: 'blue', quantity: 1, price: 5000 }
    const state = cartReducer(initialStateWithItem, addToCart(newItem))
    expect(state.items).toHaveLength(2)
    expect(state.items.find(item => item.color === 'red')).toBeDefined()
    expect(state.items.find(item => item.color === 'blue')).toBeDefined()
  })

  test('removes item from cart', () => {
    const initialStateWithItem = {
      items: [{ _id: '1', color: 'red', quantity: 1, price: 5000 }]
    }
    const state = cartReducer(initialStateWithItem, removeFromCart({ _id: '1', color: 'red' }))
    expect(state.items).toHaveLength(0)
  })

  test('updates quantity of existing item', () => {
    const initialStateWithItem = {
      items: [{ _id: '1', color: 'red', quantity: 1, price: 5000 }]
    }
    const state = cartReducer(initialStateWithItem, updateQuantity({ _id: '1', color: 'red', quantity: 3 }))
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(3)
  })

  test('clears cart', () => {
    const initialStateWithItems = {
      items: [
        { _id: '1', color: 'red', quantity: 1, price: 5000 },
        { _id: '2', color: 'blue', quantity: 2, price: 3000 }
      ]
    }
    const state = cartReducer(initialStateWithItems, clearCart())
    expect(state.items).toHaveLength(0)
  })
})