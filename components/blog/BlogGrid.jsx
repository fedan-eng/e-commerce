// components/blog/BlogGrid.jsx
import BlogCard from './BlogCard'

export default function BlogGrid({ posts, total }) {
  if (!posts.length) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <p className="text-lg font-medium">No posts in this category yet.</p>
        <p className="text-sm mt-1">Check back soon — we&apos;re cooking something.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-zinc-900 text-xl font-bold">Latest from the shelf</h2>
        <span className="text-zinc-400 text-xs">{total} Posts · Updated Weekly</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}