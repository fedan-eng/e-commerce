// components/blog/BlogCard.jsx
import Image from 'next/image'
import Link from 'next/link'
import { Eye, ArrowRight } from 'lucide-react'
import { formatDate, formatViews } from '@/lib/blog'

export default function BlogCard({ post }) {
  const href = post.substackUrl || `/blog/${post.slug}`
  const isExternal = !!post.substackUrl

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail with badge */}
      <Link
        href={href}
        target={isExternal ? '_blank' : '_self'}
        className="relative block aspect-[16/10] overflow-hidden bg-zinc-100"
      >
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-black/85 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
          {post.category}
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <Link href={href} target={isExternal ? '_blank' : '_self'}>
          <h3 className="text-zinc-900 font-bold text-lg md:text-xl leading-snug mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
            {post.title}
          </h3>
        </Link>

        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 mb-5">
          {post.excerpt}
        </p>

        {/* Footer: author · date  ·  views  ·  CTA */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <p className="text-zinc-700 text-sm truncate">
              <span className="font-medium">{post.author.name}</span>
              <span className="text-zinc-400"> · {formatDate(post.date)}</span>
            </p>
            <span className="flex items-center gap-1 text-zinc-400 text-xs shrink-0">
              <Eye size={12} />
              {formatViews(post.views)} Views
            </span>
          </div>

          <Link
            href={href}
            target={isExternal ? '_blank' : '_self'}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shrink-0"
          >
            Read More <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}