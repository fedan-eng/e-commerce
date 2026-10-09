import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog';

// Helper to match badge colors exactly to the design based on category name
const getCategoryStyle = (category = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('buying guide')) return 'bg-[#00E575] text-[#0A321B]'; // Bright Green
  if (cat.includes('fans')) return 'bg-[#B0DDFF] text-[#0A321B]'; // Light Blue
  if (cat.includes('charging')) return 'bg-[#FFCD4D] text-[#0A321B]'; // Yellow
  if (cat.includes('quick fix')) return 'bg-[#E3DDFF] text-[#0A321B]'; // Light Purple
  return 'bg-gray-200 text-gray-800'; // Fallback
};

// Helper for safe fallbacks since data structure might vary slightly
const getPostData = (post) => ({
  url: `/blog/${post.slug || post.id}`,
  title: post.title || 'Untitled Post',
  excerpt: post.excerpt || post.summary || post.description || '',
  image: post.coverImage || post.image || 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
  category: post.category || 'Article',
  readTime: post.readingTime || post.readTime || '5 min read',
});

export default async function FeaturedBlog() {
  const posts = await getBlogPosts();

  // Changed to 4 to match the 1 Featured + 3 List layout in the screenshot
  const latest = posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  if (!latest || latest.length === 0) return null;

  const featuredPost = getPostData(latest[0]);
  const listPosts = latest.slice(1).map(getPostData);

  return (
    <section className="w-full bg-[#F6FAF7] py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <h2 className="text-[32px] sm:text-[40px] leading-tight font-bold text-[#0A321B] tracking-tight">
            Charge smarter.
          </h2>
          <p className="text-gray-500 mt-2 text-[15px] sm:text-base">
            Buying guides, quick fixes and honest answers from the FIL team.
          </p>
        </div>

        {/* Asymmetrical Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 xl:gap-16">
          
          {/* Left Column: Featured Post */}
          <div className="flex flex-col group">
            <Link href={featuredPost.url} className="block overflow-hidden rounded-[28px] md:rounded-[32px] mb-6">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            
            <div className="flex items-center gap-3 mb-3.5">
              <span className={`px-3 py-1 text-[11px] font-bold rounded-full tracking-wide ${getCategoryStyle(featuredPost.category)}`}>
                {featuredPost.category}
              </span>
              <span className="text-[13px] text-gray-500 font-medium">
                {featuredPost.readTime}
              </span>
            </div>

            <Link href={featuredPost.url}>
              <h3 className="text-[22px] md:text-[26px] font-bold text-[#0A321B] leading-snug mb-3 hover:text-[#0A321B]/70 transition-colors">
                {featuredPost.title}
              </h3>
            </Link>
            
            <p className="text-[15px] text-gray-500 leading-relaxed max-w-lg line-clamp-3">
              {featuredPost.excerpt}
            </p>
          </div>

          {/* Right Column: List of 3 Posts */}
          <div className="flex flex-col">
            {listPosts.map((post, index) => (
              <div 
                key={index} 
                className={`flex gap-5 sm:gap-6 py-6 sm:py-8 group ${
                  index !== 0 ? 'border-t border-black/5' : 'pt-0 lg:pt-0'
                } ${index === listPosts.length - 1 ? 'border-b border-black/5' : ''}`}
              >
                
                {/* Thumbnail Image */}
                <Link href={post.url} className="shrink-0 overflow-hidden rounded-[20px] md:rounded-[24px] w-[110px] h-[110px] sm:w-[140px] sm:h-[140px]">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Content */}
                <div className="flex flex-col flex-1 justify-center py-1">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wide whitespace-nowrap ${getCategoryStyle(post.category)}`}>
                      {post.category}
                    </span>
                    <span className="text-[12px] text-gray-500 font-medium whitespace-nowrap">
                      {post.readTime}
                    </span>
                  </div>

                  <Link href={post.url}>
                    <h3 className="text-[16px] sm:text-[18px] font-bold text-[#0A321B] leading-tight mb-2 hover:text-[#0A321B]/70 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-[13px] sm:text-[14px] text-gray-500 leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}