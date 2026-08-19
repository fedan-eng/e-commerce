// app/blog/BlogPageClient.jsx
'use client'

import { useState, useMemo } from 'react'
import BlogHero from '@/components/blog/BlogHero'
import BlogCategoryTabs from '@/components/blog/BlogCategoryTabs'
import BlogGrid from '@/components/blog/BlogGrid'
import BlogNewsletter from '@/components/blog/BlogNewsletter'

export default function BlogPageClient({ featured, posts, total }) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return posts
    return posts.filter((p) => p.categoryTag === activeCategory)
  }, [activeCategory, posts])

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Page header */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 leading-tight">
          Tech <span className="text-green-500">Gist</span> That{' '}
          <span className="text-green-500">Actually Helps.</span>
        </h1>
        <p className="text-zinc-500 mt-3 text-sm leading-relaxed">
          Skip the confusing specs and marketing hype. Discover honest reviews, buying guides,
          charging tips, and everyday gadget advice from the people who work with tech every single
          day.
        </p>
      </div>

      {/* Featured post */}
      <BlogHero post={featured} />

      {/* Category tabs */}
      <BlogCategoryTabs active={activeCategory} onChange={setActiveCategory} />

      {/* Post grid */}
      <BlogGrid posts={filtered} total={total} />

      {/* Newsletter */}
      <BlogNewsletter />
    </main>
  )
}