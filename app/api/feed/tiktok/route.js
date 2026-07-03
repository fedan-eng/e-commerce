import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

// XML escape helper
function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Strip HTML tags and trim
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

// Generate description with fallback
function getDescription(product) {
  const desc = stripHtml(product.description);
  if (desc && desc.length >= 10) {
    return desc.substring(0, 5000); // Limit to 5000 chars
  }
  return `${product.name} - ${product.category} available at Filstore Nigeria`;
}

// Map Filstore categories to Google Product Category taxonomy
function getGoogleProductCategory(category) {
  const categoryMap = {
    "Power Bank": "Electronics > Electronics Accessories > Power Banks",
    "Wearables": "Electronics > Wearable Technology",
    "Chargers": "Electronics > Electronics Accessories > Chargers",
    "Lifestyle": "Apparel & Accessories",
  };
  return categoryMap[category] || "Electronics";
}

export async function GET(req) {
  try {
    await connectDB();

    // Fetch all products (no limit for feed generation)
    const products =	await Product.find({}).lean();

    const baseUrl = "https://filstore.com.ng";
    const brand = "Filstore";
    const currency = "NGN";

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Filstore Product Feed</title>
    <link>${baseUrl}</link>
    <description>Product feed for Filstore Nigeria</description>
`;

    for (const product of products) {
      // Skip products without main image
      if (!product.image) continue;

      const productId = product._id.toString();
      const productUrl = `${baseUrl}/products/${productId}`;
      const availability = product.availability ? "in stock" : "out of stock";
      
      // Handle pricing with sale price logic
      let priceElement = "";
      let salePriceElement = "";
      
      if (product.originalPrice && product.originalPrice > product.price) {
        // Has discount: price = original, sale_price = current
        priceElement = `    <g:price>${product.originalPrice} ${currency}</g:price>\n`;
        salePriceElement = `    <g:sale_price>${product.price} ${currency}</g:sale_price>\n`;
      } else {
        // No discount: price = current
        priceElement = `    <g:price>${product.price} ${currency}</g:price>\n`;
      }

      // Additional images (up to 10)
      const additionalImages = (product.secondaryImages || [])
        .slice(0, 10)
        .map(img => `    <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join("\n");

      xml += `    <item>
      <g:id>${escapeXml(productId)}</g:id>
      <title>${escapeXml(product.name)}</title>
      <description>${escapeXml(getDescription(product))}</description>
      <link>${escapeXml(productUrl)}</link>
      <g:image_link>${escapeXml(product.image)}</g:image_link>
${additionalImages ? additionalImages + "\n" : ""}${priceElement}${salePriceElement}      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:product_type>${escapeXml(product.category || "")}</g:product_type>
      <g:google_product_category>${escapeXml(getGoogleProductCategory(product.category))}</g:google_product_category>
      <g:mpn>${escapeXml(productId)}</g:mpn>
    </item>
`;
    }

    xml += `  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error("Error generating TikTok feed:", error);
    
    // Return valid but empty feed on error to avoid aggressive retries
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Filstore Product Feed</title>
    <link>https://filstore.com.ng</link>
    <description>Product feed for Filstore Nigeria - Temporarily unavailable</description>
  </channel>
</rss>`;

    return new Response(errorXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
}
