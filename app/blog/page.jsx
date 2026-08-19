// app/blog/page.jsx
import { getBlogPosts } from '@/lib/blog'
import BlogPageClient from './BlogPageClient'

export const metadata = {
  title: 'Tech Gist That Actually Helps | Filstore Blog',
  description:
    'Honest reviews, buying guides, charging tips, and everyday gadget advice from the people who work with tech every single day.',
  openGraph: {
    title: 'Tech Gist That Actually Helps | Filstore Blog',
    description: 'Skip the confusing specs and marketing hype. Discover honest reviews and buying guides.',
    url: 'https://filstore.com.ng/blog',
    siteName: 'Filstore',
    type: 'website',
  },
}

export const revalidate = 3600 // ISR: revalidate Substack feed every 1 hour

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const featured = posts.find((p) => p.featured) || posts[0]
  const rest = posts.filter((p) => p.id !== featured?.id)

  return <BlogPageClient featured={featured} posts={rest} total={posts.length} />
}