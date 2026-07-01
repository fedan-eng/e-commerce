import { NextResponse } from "next/server";

const TIMEOUT_MS = 30000;
const MAX_WORDS = 120;
const MIN_WORDS = 80;

function getSeoKeywords(category) {
  const cleanCategory = category.trim();

  if (["Power Bank", "Chargers"].includes(cleanCategory)) {
    return `fast charging in Nigeria, USB-C, ${cleanCategory}, affordable, reliable`;
  }
  if (cleanCategory === "Wearables") {
    return `long battery life, waterproof, smart features, ${cleanCategory}, affordable, reliable`;
  }
  if (cleanCategory === "Extensions") {
    return `safe power backup, surge protection, multiple outlets, ${cleanCategory}, affordable, reliable`;
  }
  if (cleanCategory === "Lifestyle") {
    return `modern design, durable, Nigerian homes, ${cleanCategory}, affordable, reliable`;
  }
  return `${cleanCategory}, affordable, reliable, available in Nigeria`;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function trimToWordLimit(text, maxWords) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  const trimmed = words.slice(0, maxWords).join(" ");
  const lastPeriod = trimmed.lastIndexOf(".");
  if (lastPeriod > trimmed.length * 0.7) return trimmed.slice(0, lastPeriod + 1);
  return trimmed + "...";
}

function cleanDescription(raw) {
  // 1. Remove reasoning blocks
  raw = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // 2. Remove markdown formatting
  raw = raw
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^[-•]\s+/gm, "")
    .replace(/`([^`]*)`/g, "$1");

  // 3. Remove labels
  raw = raw.replace(/^Paragraph\s*\d+\s*:\s*/gim, "");
  raw = raw.replace(/^Count:.*$/gim, "");
  raw = raw.replace(/=>.*$/gim, "");

  // 4. ✅ REMOVE word-count tokens like "the2", "power6", "10,000mAh5"
  //    Pattern: word immediately followed by digits (no space)
  raw = raw.replace(/\b([A-Za-z][A-Za-z'‑-]*|[\d,\.]+[A-Za-z]+)\d+\b/g, "");

  // 5. ✅ REMOVE stray numbered tokens like " 27 " between words
  raw = raw.replace(/\s+\d+\s+/g, " ");

  // 6. Filter meta-talk lines
  const metaPatterns = [
    /^(okay|alright|sure|let me|here (is|are))/i,
    /^(note:|output:|result:|description:)/i,
    /^paragraph/i,
    /^~?\d+\s*words/i,
    /^count:/i,
    /^word count/i,
    /^total/i,
  ];

  const lines = raw.split("\n").filter((line) => {
    const t = line.trim();
    if (!t) return true;
    return !metaPatterns.some((p) => p.test(t));
  });

  let cleaned = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  // 7. ✅ STRIP surrounding quotes (both straight and curly)
  cleaned = cleaned.replace(/^["“”'']+|["“”'']+$/g, "").trim();

  // 8. ✅ EXTRACT only the first clean paragraph block
  //    This kills any counting text that follows the description
  const blocks = cleaned.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  
  //    Return the FIRST substantial block (the actual description)
  //    Word-counting garbage usually appears as a separate block
  const firstBlock = blocks.find((b) => b.length > 50 && !/\w+\d+\s/.test(b));
  
  return firstBlock || blocks[0] || cleaned;
}

export async function POST(request) {
  try {
    const { name, category, price, features, existingDescription } = await request.json();

    if (!name || !category) {
      return NextResponse.json(
        { error: "Product name and category are required" },
        { status: 400 }
      );
    }

    const featuresText = features?.length ? `Key features: ${features.join(", ")}.` : "";
    const seoKeywords = getSeoKeywords(category);

    const prompt = existingDescription
      ? `You are an e-commerce SEO copywriter. Rewrite this product description in ${MIN_WORDS}-${MAX_WORDS} words. Plain text only, no labels, no markdown, no thinking.

Include these keywords naturally: ${seoKeywords}.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Current description:
${existingDescription}

Output ONLY the rewritten description. Do NOT wrap it in quotes. Do NOT count words. Do NOT explain anything.`
      : `You are an e-commerce SEO copywriter. Write a product description in ${MIN_WORDS}-${MAX_WORDS} words. Plain text only, no labels, no markdown, no thinking.

Include these keywords naturally: ${seoKeywords}.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Output ONLY the description. Do NOT wrap it in quotes. Do NOT count words. Do NOT explain anything.`;

    const res = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      },
      TIMEOUT_MS
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || `HTTP ${res.status}`);
    }

    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      throw new Error("Empty response from Gemini");
    }

    let description = cleanDescription(rawContent);

    if (description.split(/\s+/).length > MAX_WORDS) {
      description = trimToWordLimit(description, MAX_WORDS);
    }

    if (!description || description.length < 20) {
      throw new Error("Generated description was empty after cleaning.");
    }

    return NextResponse.json({
      description,
      source: "gemini",
      model: "gemini-2.0-flash",
      wordCount: description.split(/\s+/).length,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate description" },
      { status: 500 }
    );
  }
}