// components/blog/BlogCard.jsx
import Image from 'next/image'
import Link from 'next/link'
import { Eye, ArrowRight } from 'lucide-react'
import { formatDate, formatViews } from '@/lib/blog'

export default function BlogCard({ post }) {
  const href = post.substackUrl || `/blog/${post.slug}`
  const isExternal = !!post.substackUrl

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail with badge */}
      <Link
        href={href}
        target={isExternal ? '_blank' : '_self'}
        className="relative block aspect-[16/11] overflow-hidden bg-zinc-100"
      >
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-4 left-4 bg-zinc-900 text-white text-[10px] font-semibold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full">
          {post.category}
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <Link href={href} target={isExternal ? '_blank' : '_self'}>
          <h3 className="text-zinc-900 font-bold text-xl leading-snug mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
            {post.title}
          </h3>
        </Link>

        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 mb-3">
          {post.excerpt}
        </p>

        {/* Views — right aligned, own line
        <div className="flex justify-end mb-3">
          <span className="flex items-center gap-1 text-zinc-500 text-xs">
            <Eye size={13} />
            {formatViews(post.views) || 0} Views
          </span>
        </div> */}

        {/* Divider */}
        <div className="border-t border-zinc-200 mb-4" />

        {/* Footer: author · date  |  Read More */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <p className="text-zinc-600 text-sm">
            <span className="font-medium text-zinc-800">{post.author.name}</span>
            <span className="text-zinc-400"> · {formatDate(post.date)}</span>
          </p>

          <Link
            href={href}
            target={isExternal ? '_blank' : '_self'}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all shrink-0"
          >
            Read More <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}