// components/blog/BlogHero.jsx
import Image from 'next/image'
import Link from 'next/link'
import { formatDate, formatViews } from '@/lib/blog'
import { Eye, Clock, ArrowRight } from 'lucide-react'

export default function BlogHero({ post }) {
  if (!post) return null

  return (
    <div className="relative w-full rounded-2xl overflow-hidden min-h-[380px] md:min-h-[420px] bg-zinc-900 group">
      {/* Background image */}
      <Image
        src={post.image}
        alt={post.title}
        fill
        className="object-cover opacity-50 group-hover:opacity-40 transition-opacity duration-500"
        priority
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/70 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 max-w-2xl">
        {/* Featured badge */}
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-green-400 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Featured
        </span>

        {/* Category */}
        <span className="inline-block text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1 mb-3 w-fit">
          {post.category}
        </span>

        {/* Title */}
        <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-3">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-zinc-300 text-sm leading-relaxed mb-5 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="text-zinc-300 text-xs font-medium">{post.author.name}</span>
          </div>
          <span className="text-zinc-500 text-xs">{formatDate(post.date)}</span>
          <span className="flex items-center gap-1 text-zinc-400 text-xs">
            <Clock size={11} />
            {post.readTime}
          </span>
          <span className="flex items-center gap-1 text-zinc-400 text-xs">
            <Eye size={11} />
            {formatViews(post.views)}
          </span>
        </div>

        {/* CTA */}
        <Link
          href={post.substackUrl || `/blog/${post.slug}`}
          target={post.substackUrl ? '_blank' : '_self'}
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black text-sm font-semibold px-5 py-2.5 rounded-full w-fit transition-all duration-200 hover:gap-3"
        >
          Read More <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}