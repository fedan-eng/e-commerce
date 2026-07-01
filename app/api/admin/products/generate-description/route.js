import { NextResponse } from "next/server";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const TIMEOUT_MS = 30000; // 30 seconds per model attempt
const MAX_WORDS = 120;
const MIN_WORDS = 80;

const MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "deepseek/deepseek-r1-0528:free",
];

// ─── SEO KEYWORDS GENERATOR ──────────────────────────────────────────────────
function getSeoKeywords(category) {
  const cleanCategory = category.trim();

  // 1. Power Banks & Chargers (High priority keywords)
  if (["Power Bank", "Chargers"].includes(cleanCategory)) {
    return `fast charging in Nigeria, USB-C, ${cleanCategory}, affordable, reliable`;
  }

  // 2. Wearables (Smartwatches, Fitness trackers)
  if (cleanCategory === "Wearables") {
    return `long battery life, waterproof, smart features, ${cleanCategory}, affordable, reliable`;
  }

  // 3. Extensions (Extension sockets, adapters)
  if (cleanCategory === "Extensions") {
    return `safe power backup, surge protection, multiple outlets, ${cleanCategory}, affordable, reliable`;
  }

  // 4. Lifestyle (General gadgets, lights, etc.)
  if (cleanCategory === "Lifestyle") {
    return `modern design, durable, Nigerian homes, ${cleanCategory}, affordable, reliable`;
  }

  // 5. Default Fallback (Catches typos or new categories)
  return `${cleanCategory}, affordable, reliable, available in Nigeria`;
}

// ─── TIMEOUT FETCH ────────────────────────────────────────────────────────────
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ─── MODEL FALLBACK ───────────────────────────────────────────────────────────
async function fetchWithFallback(systemPrompt, userPrompt) {
  const errors = [];

  for (const model of MODELS) {
    try {
      console.log(`🔄 Trying model: ${model}`);

      const res = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 500,
          }),
        },
        TIMEOUT_MS
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        const reason = data.error?.message || `HTTP ${res.status}`;
        console.warn(`⚠️ Model ${model} failed: ${reason}`);
        errors.push({ model, reason });
        continue;
      }

      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        console.warn(`⚠️ Model ${model} returned empty content`);
        errors.push({ model, reason: "Empty content" });
        continue;
      }

      console.log(`✅ Model used: ${model}`);
      return { data, model };
    } catch (err) {
      console.warn(`⚠️ Model ${model} error: ${err.message}`);
      errors.push({ model, reason: err.message });
    }
  }

  console.error("❌ All models failed:", errors);
  throw new Error(`All models failed. Last error: ${errors[errors.length - 1]?.reason ?? "Unknown"}`);
}

// ─── WORD TRIMMER ─────────────────────────────────────────────────────────────
function trimToWordLimit(text, maxWords) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();

  const trimmed = words.slice(0, maxWords).join(" ");
  const lastPeriod = trimmed.lastIndexOf(".");
  if (lastPeriod > trimmed.length * 0.7) {
    return trimmed.slice(0, lastPeriod + 1);
  }
  return trimmed + "...";
}

// ─── DESCRIPTION CLEANER ──────────────────────────────────────────────────────
function cleanDescription(raw) {
  // 1. Remove reasoning blocks
  raw = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // 2. Remove markdown
  raw = raw
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^[-•]\s+/gm, "")
    .replace(/`([^`]*)`/g, "$1");

  // 3. Remove labels and counts
  raw = raw.replace(/^Paragraph\s*\d+\s*:\s*/gim, "");
  raw = raw.replace(/^Count:.*$/gim, "");
  raw = raw.replace(/=>.*$/gim, "");
  raw = raw.replace(/\b\w+\(\d+\)/g, "");

  // 4. Filter meta-talk lines
  const metaPatterns = [
    /^(okay|alright|sure|let me|i (need|will|should|must|have to))/i,
    /^(we need|we must|we (can|should)|let's)/i,
    /^(now,|so,|first,|next,|then,|finally,)/i,
    /^(note:|output:|result:|analysis:|requirements:)/i,
    /^(here (is|are)|paragraph \d|para \d)/i,
    /^(hook:|benefit:|specs:|compat|structure:|product details)/i,
    /^(word count|total:|total words|aim for|count:)/i,
    /^\d+\.\s/, /^-{2,}/, /[\u2705\u2714]/,
    /\b(Good\.|Checked\.|Within range\.)\s*$/i,
    /^~?\d+\s*words/i, /^paragraph/i, /^total/i, /^rewritten/i,
  ];

  const lines = raw.split("\n");
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    return !metaPatterns.some((p) => p.test(trimmed));
  });

  const collapsed = filtered.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  
  const blocks = collapsed.split(/\n\s*\n/).map((b) => b.trim()).filter((b) => b.length > 40);
  
  return blocks.join("\n\n") || collapsed;
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
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

    // ✅ Get keywords based on your specific categories
    const seoKeywords = getSeoKeywords(category);

    const systemPrompt = `You are an e-commerce SEO copywriter. Output ONLY a concise product description. No thinking, no labels, no markdown, no filler. Just the description.`;

    const userPrompt = existingDescription
      ? `Rewrite this product description. Keep it concise (${MIN_WORDS}-${MAX_WORDS} words), SEO-optimized, and easy to read.

Include these keywords naturally: ${seoKeywords}.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Current description:
${existingDescription}

Output ONLY the rewritten description. No labels, no thinking, no extra text.`
      : `Write a concise product description (${MIN_WORDS}-${MAX_WORDS} words). Make it SEO-optimized and easy to read.

Include these keywords naturally: ${seoKeywords}.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Output ONLY the description. No labels, no thinking, no extra text.`;

    const { data, model: usedModel } = await fetchWithFallback(systemPrompt, userPrompt);

    if (!data.choices || !data.choices[0] || !data.choices[0].message?.content) {
      throw new Error("Invalid API response: no content returned");
    }

    let description = cleanDescription(data.choices[0].message.content);

    // Enforce word limit
    if (description.split(/\s+/).length > MAX_WORDS) {
      description = trimToWordLimit(description, MAX_WORDS);
    }

    if (!description || description.length < 20) {
      throw new Error("Generated description was empty after cleaning.");
    }

    return NextResponse.json({
      description,
      source: "openrouter",
      model: usedModel,
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