import BlogCard from '@/components/blog/BlogCard'
import { getBlogPosts } from '@/lib/blog'

export default async function FeaturedBlog() {
  const posts = await getBlogPosts()

  const latest = posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)

  if (!latest || latest.length === 0) return null

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Section Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-8 md:mb-10 tracking-tight">
        Featured Blogs and Updates
      </h2>

      {/* 3-column grid reusing BlogCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {latest.map((post) => (
          <BlogCard key={post.slug || post.id} post={post} />
        ))}
      </div>
    </section>
  )
}