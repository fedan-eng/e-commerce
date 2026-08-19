// lib/blog.js
// Fetches posts from Substack RSS with local JSON fallback for dev/demo

import Parser from 'rss-parser'

const SUBSTACK_URL = process.env.SUBSTACK_URL // e.g. https://yourpublication.substack.com/feed

const CATEGORY_MAP = {
  'power bank': 'Power Banks',
  'charger': 'Charging 101',
  'charging': 'Charging 101',
  'earbuds': 'Accessories',
  'earpods': 'Accessories',
  'accessories': 'Accessories',
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
}

function guessCategory(title = '', content = '') {
  const text = `${title} ${content}`.toLowerCase()
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (text.includes(keyword)) return category
  }
  return "Buyer's Guide"
}

function extractImageFromContent(content = '') {
  const match = content.match(/<img[^>]+src="([^">]+)"/)
  return match ? match[1] : null
}

function slugify(title = '') {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function formatSubstackPost(item, index) {
  const category = guessCategory(item.title, item.contentSnippet)
  return {
    id: item.guid || String(index + 1),
    slug: slugify(item.title),
    title: item.title,
    excerpt: item.contentSnippet?.slice(0, 160) + '...' || '',
    category,
    categoryTag: CATEGORY_TAG_MAP[category] || 'buyers-guide',
    image:
      item.enclosure?.url ||
      extractImageFromContent(item['content:encoded'] || item.content || '') ||
      `https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80`,
    author: {
      name: item.creator || item.author || 'Filstore Team',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.creator || 'F')}&background=22c55e&color=fff`,
    },
    date: item.isoDate || item.pubDate || new Date().toISOString(),
    readTime: `${Math.max(3, Math.ceil((item.contentSnippet?.length || 300) / 200))} min read`,
    views: Math.floor(Math.random() * 5000) + 500, // Substack doesn't expose views via RSS
    featured: index === 0,
    substackUrl: item.link, // Link back to actual Substack post
  }
}

export async function getBlogPosts() {
  // Use local demo data if no Substack URL configured
  if (!SUBSTACK_URL) {
    const { default: posts } = await import('@/data/blog.json')
    return posts
  }

  try {
    const parser = new Parser({
      customFields: {
        item: ['content:encoded', 'enclosure'],
      },
    })

    const feed = await parser.parseURL(SUBSTACK_URL)
    return feed.items.map(formatSubstackPost)
  } catch (err) {
    console.error('[Blog] Failed to fetch Substack feed, falling back to demo data:', err)
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
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`
  return String(views)
}