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
  raw = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  raw = raw
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^[-•]\s+/gm, "")
    .replace(/`([^`]*)`/g, "$1");
  raw = raw.replace(/^Paragraph\s*\d+\s*:\s*/gim, "");
  raw = raw.replace(/^Count:.*$/gim, "");
  raw = raw.replace(/=>.*$/gim, "");

  const metaPatterns = [
    /^(okay|alright|sure|let me|here (is|are))/i,
    /^(note:|output:|result:|description:)/i,
    /^paragraph/i, /^~?\d+\s*words/i,
  ];

  const lines = raw.split("\n").filter((line) => {
    const t = line.trim();
    if (!t) return true;
    return !metaPatterns.some((p) => p.test(t));
  });

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
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

Output ONLY the rewritten description.`
      : `You are an e-commerce SEO copywriter. Write a product description in ${MIN_WORDS}-${MAX_WORDS} words. Plain text only, no labels, no markdown, no thinking.

Include these keywords naturally: ${seoKeywords}.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Output ONLY the description.`;

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