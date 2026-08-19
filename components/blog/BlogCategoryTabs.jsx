// components/blog/BlogCategoryTabs.jsx
'use client'

const CATEGORIES = [
  { label: 'All Posts', value: 'all' },
  { label: 'Power Banks', value: 'power-banks' },
  { label: 'Wearables', value: 'wearables' },
  { label: 'Charging 101', value: 'charging-101' },
  { label: 'Save Life', value: 'save-life' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Reviews', value: 'reviews' },
]

export default function BlogCategoryTabs({ active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`
            shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
            ${
              active === cat.value
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
            }
          `}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}