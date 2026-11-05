// app/blog/page.jsx
import { getBlogPosts } from '@/lib/blog'
import BlogPageClient from './BlogPageClient'
import { SITE_URL } from '@/lib/seo'

export const metadata = {
  title: 'Tech Gist That Actually Helps | Filstore Blog',
  description:
    'Honest reviews, buying guides, charging tips, and everyday gadget advice from the people who work with tech every single day.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Tech Gist That Actually Helps | Filstore Blog',
    description: 'Skip the confusing specs and marketing hype. Discover honest reviews and buying guides.',
    url: `${SITE_URL}/blog`,
    siteName: 'Filstore',
    type: 'website',
  },
}

export const revalidate = 300 // ISR: revalidate Substack feed every 5 minutes

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const featured = posts.find((p) => p.featured) || posts[0]
  const rest = posts.filter((p) => p.id !== featured?.id)

  return <BlogPageClient featured={featured} posts={rest} total={posts.length} />
}