// components/blog/BlogHero.jsx
import Image from 'next/image'
import Link from 'next/link'
import { formatDate, formatViews } from '@/lib/blog'

export default function BlogHero({ post }) {
  if (!post) return null

  return (
    <div className="relative w-full rounded-2xl overflow-hidden flex flex-col md:flex-row bg-zinc-900">

      {/* ── LEFT / TOP: image panel ── */}
      <div className="relative w-full md:w-[55%] h-[260px] sm:h-[300px] md:h-auto md:min-h-[420px] flex-shrink-0">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        {/* Buyer's Guide badge — bottom-left of image */}
        <div className="absolute bottom-4 left-4">
          <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-white border border-white/40 rounded-full px-3 py-1 bg-black/30 backdrop-blur-sm">
            {post.category ?? "Buyer's Guide"}
          </span>
        </div>
      </div>

      {/* ── RIGHT / BOTTOM: content panel ── */}
      <div className="flex flex-col bg-zinc-900 w-full md:w-[45%] p-5 md:p-8 md:justify-between">

        {/* Featured badge */}
        <div className="flex items-center gap-1.5 mb-3 md:mb-4">
          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-green-400">
            Featured
          </span>
        </div>

        {/* Title */}
        <h1 className="text-white text-[1.45rem] md:text-[1.65rem] font-bold leading-snug mb-3">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-zinc-400 text-sm leading-relaxed mb-5 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Author + meta row */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {/* Avatar circle with initials */}
          <div className="w-7 h-7 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-white leading-none">
              {post.author.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </span>
          </div>
          <span className="text-zinc-300 text-xs font-medium">
            {post.author.name}
          </span>
          <span className="text-zinc-600 text-xs">·</span>
          <span className="text-zinc-500 text-xs">{formatDate(post.date)}</span>
          <span className="text-zinc-600 text-xs">·</span>
          <span className="text-zinc-500 text-xs">{post.readTime}</span>
          <span className="text-zinc-600 text-xs">·</span>
          <span className="text-zinc-500 text-xs">{formatViews(post.views)}</span>
        </div>

        {/* CTA */}
        <div>
          <Link
            href={post.substackUrl || `/blog/${post.slug}`}
            target={post.substackUrl ? '_blank' : '_self'}
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black text-sm font-semibold px-5 py-2.5 rounded-full transition-colors duration-200"
          >
            Read More
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}