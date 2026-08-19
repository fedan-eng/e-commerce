// components/blog/BlogCard.jsx
import Image from 'next/image'
import Link from 'next/link'
import { Eye, Clock, ArrowRight } from 'lucide-react'
import { formatDate, formatViews } from '@/lib/blog'

const CATEGORY_COLORS = {
  'Power Banks': 'bg-green-100 text-green-700',
  'Charging 101': 'bg-blue-100 text-blue-700',
  'Accessories': 'bg-purple-100 text-purple-700',
  'Reviews': 'bg-amber-100 text-amber-700',
  'Save Life': 'bg-red-100 text-red-700',
  "Buyer's Guide": 'bg-zinc-100 text-zinc-700',
  'Wearables': 'bg-pink-100 text-pink-700',
}

export default function BlogCard({ post }) {
  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-zinc-100 text-zinc-700'
  const href = post.substackUrl || `/blog/${post.slug}`
  const isExternal = !!post.substackUrl

  return (
    <div className="group flex flex-col rounded-xl overflow-hidden border border-zinc-100 bg-white hover:shadow-md transition-shadow duration-300">
      {/* Thumbnail */}
      <Link href={href} target={isExternal ? '_blank' : '_self'} className="relative block aspect-[16/9] overflow-hidden bg-zinc-100">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className={`absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${categoryColor}`}>
          {post.category}
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <Link href={href} target={isExternal ? '_blank' : '_self'}>
          <h3 className="text-zinc-900 font-semibold text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-green-600 transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-4 flex-1">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={22}
              height={22}
              className="rounded-full"
            />
            <div>
              <p className="text-zinc-700 text-[11px] font-medium leading-none">{post.author.name}</p>
              <p className="text-zinc-400 text-[10px] mt-0.5">{formatDate(post.date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-zinc-400 text-[10px]">
              <Clock size={10} /> {post.readTime}
            </span>
            <span className="flex items-center gap-1 text-zinc-400 text-[10px]">
              <Eye size={10} /> {formatViews(post.views)}
            </span>
            <Link
              href={href}
              target={isExternal ? '_blank' : '_self'}
              className="flex items-center gap-1 bg-green-500 hover:bg-green-400 text-black text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all"
            >
              Read <ArrowRight size={9} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}