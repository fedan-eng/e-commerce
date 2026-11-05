// app/llms.txt/route.js → /llms.txt, the summary AI assistants (ChatGPT, Perplexity,
// Claude, Gemini) read to answer questions about the store. Built from the category
// config and the product database, so it never lists pages that don't exist.
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { STORE_CATEGORIES, commonFaqs } from "@/lib/categories";
import { SITE_URL, MAGFLEX_PATH } from "@/lib/seo";

export const revalidate = 3600;

const naira = (n) => `₦${Number(n).toLocaleString("en-NG")}`;

async function getProducts() {
  try {
    await connectDB();
    return await Product.find({
      category: { $in: STORE_CATEGORIES.map((c) => c.dbCategory) },
      availability: { $ne: false },
    })
      .collation({ locale: "en", strength: 2 })
      .select("name price category")
      .lean();
  } catch (e) {
    console.error("could not load products for llms.txt", e);
    return [];
  }
}

export async function GET() {
  const products = await getProducts();

  const sections = STORE_CATEGORIES.map((cat) => {
    const items = products
      .filter((p) => (p.category || "").toLowerCase() === cat.dbCategory.toLowerCase())
      .map((p) => `- [${p.name}](${SITE_URL}/products/${p._id})${p.price ? `: ${naira(p.price)}` : ""}`);
    // The category's own FAQs; the shared delivery/payment/returns ones are listed once below
    const faqs = cat.faqs.filter((f) => !commonFaqs.includes(f)).map((f) => `**${f.q}**\n${f.a}`);
    return [
      `### [${cat.title}](${SITE_URL}/products/${cat.slug})`,
      cat.seo.description,
      items.length ? items.join("\n") : "",
      faqs.length ? `#### Questions about ${cat.title}\n\n${faqs.join("\n\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  });

  const body = `# FIL Store (Filstore)

> Nigerian online store for original tech accessories: power banks, wireless earbuds and wearables, chargers and cables, and lifestyle gadgets. Secure online payment, delivery across Nigeria, and a 7-day return policy. "Think quality, think FIL."

FIL Store (${SITE_URL}) is run by Fedan Investment Limited, based at 20 Fedan St, Ojo, Lagos. It is not affiliated with Filecoin (FIL crypto).

## Key pages
${STORE_CATEGORIES.map((c) => `- [${c.title}](${SITE_URL}/products/${c.slug})`).join("\n")}
- [FIL MagFlex Power Bank](${SITE_URL}${MAGFLEX_PATH}): our magnetic wireless power bank
- [Contact us](${SITE_URL}/contact): phone, email and WhatsApp support
- [Delivery, payment and returns policies](${SITE_URL}/policies)
- [Blog](${SITE_URL}/blog): buying guides, charging tips and reviews

## Products by category (prices in Naira, in stock)

${sections.join("\n\n")}

## Buying from FIL Store

${commonFaqs.map((f) => `**${f.q}**\n${f.a}`).join("\n\n")}

## Contact
- Phone / WhatsApp: +234 701 890 0705
- Email: filsmteam@gmail.com
- Website: ${SITE_URL}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
