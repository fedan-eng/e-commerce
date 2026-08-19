// components/blog/BlogCard.jsx
import Image from 'next/image'
import Link from 'next/link'
import { Eye, ArrowRight } from 'lucide-react'
import { formatDate, formatViews } from '@/lib/blog'

export default function BlogCard({ post }) {
  const href = post.substackUrl || `/blog/${post.slug}`
  const isExternal = !!post.substackUrl

  return (
    <div className="group flex flex-col">
      {/* Thumbnail with badge */}
      <Link
        href={href}
        target={isExternal ? '_blank' : '_self'}
        className="relative block aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100"
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
      <div className="flex flex-col flex-1 pt-5">
        <Link href={href} target={isExternal ? '_blank' : '_self'}>
          <h3 className="text-zinc-900 font-bold text-lg md:text-xl leading-snug mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt + views row */}
        <div className="relative mb-5">
          <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 pr-20">
            {post.excerpt}
          </p>
          <span className="absolute bottom-0 right-0 flex items-center gap-1 text-zinc-500 text-xs">
            <Eye size={12} /> {formatViews(post.views)} Views
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <p className="text-zinc-700 text-sm">
            <span className="font-medium">{post.author.name}</span>
            <span className="text-zinc-400"> · {formatDate(post.date)}</span>
          </p>

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