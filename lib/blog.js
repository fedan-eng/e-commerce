// lib/blog.js
// Fetches posts from Substack RSS with local JSON fallback for dev/demo

import Parser from 'rss-parser'

const SUBSTACK_URL = process.env.SUBSTACK_URL // e.g. https://filstore.substack.com/feed

const CATEGORY_MAP = {
  'power bank': 'Power Banks',
  'charger': 'Charging 101',
  'charging': 'Charging 101',
  'usb-c': 'Charging 101',
  'usb c': 'Charging 101',
  'earbuds': 'Accessories',
  'earpods': 'Accessories',
  'accessories': 'Accessories',
  'wearable': 'Wearables',
  'review': 'Reviews',
  'save': 'Save Life',
}

const CATEGORY_TAG_MAP = {
  'Power Banks': 'power-banks',
  'Charging 101': 'charging-101',
  'Accessories': 'accessories',
  'Reviews': 'reviews',
  'Save Life': 'save-life',
  "Buyer's Guide": 'buyers-guide',
  'Wearables': 'wearables',
}

function guessCategory(title = '', content = '') {
  const text = `${title} ${content}`.toLowerCase()
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (text.includes(keyword)) return category
  }
  return "Buyer's Guide"
}

function extractImageFromContent(content = '') {
  // Substack serves images via their CDN — grab the first one
  const substackMatch = content.match(/https:\/\/substackcdn\.com\/image\/fetch\/[^"'\s]+/)
  if (substackMatch) return substackMatch[0]

  // Fallback: any img src
  const imgTag = content.match(/<img[^>]+src="([^">]+)"/)
  return imgTag ? imgTag[1] : null
}

function slugify(title = '') {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatSubstackPost(item, index) {
  const rawContent = item.contentEncoded || item.content || ''
  const category = guessCategory(item.title, item.contentSnippet || rawContent)

  const rawExcerpt = item.description || item.contentSnippet || stripHtml(rawContent)
  const excerpt =
    rawExcerpt.length > 160 ? rawExcerpt.slice(0, 157).trimEnd() + '...' : rawExcerpt

  const wordCount = stripHtml(rawContent).split(/\s+/).length
  const readTime = `${Math.max(2, Math.ceil(wordCount / 200))} min read`

  // Priority: enclosure (Substack cover image) → first image in content body → fallback
  const image =
    item.enclosure?.url ||
    extractImageFromContent(rawContent) ||
    `https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80`

  return {
    id: item.guid || String(index + 1),
    slug: slugify(item.title),
    title: item.title,
    excerpt,
    category,
    categoryTag: CATEGORY_TAG_MAP[category] || 'buyers-guide',
    image,
    author: {
      name: item.creator || item['dc:creator'] || 'Filstore',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        item.creator || 'F'
      )}&background=22c55e&color=fff`,
    },
    date: item.isoDate || item.pubDate || new Date().toISOString(),
    readTime,
    views: 0,
    featured: index === 0,
    substackUrl: item.link,
  }
}

export async function getBlogPosts() {
  if (!SUBSTACK_URL) {
    const { default: posts } = await import('@/data/blog.json')
    return posts
  }

  try {
    const parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'contentEncoded'],
          ['dc:creator', 'creator'],
          ['enclosure', 'enclosure', { keepArray: false }],
        ],
      },
    })

    const feed = await parser.parseURL(SUBSTACK_URL)

    if (!feed.items?.length) {
      throw new Error('Empty feed')
    }

    return feed.items.map(formatSubstackPost)
  } catch (err) {
    console.error('[Blog] Failed to fetch Substack feed, falling back to demo data:', err.message)
    const { default: posts } = await import('@/data/blog.json')
    return posts
  }
}

export async function getBlogPost(slug) {
  const posts = await getBlogPosts()
  return posts.find((p) => p.slug === slug) || null
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatViews(views) {
  if (!views) return null
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`
  return String(views)
}