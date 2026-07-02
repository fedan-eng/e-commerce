import { NextResponse } from "next/server";

const TIMEOUT_MS = 30000;
const MAX_WORDS = 120;
const MIN_WORDS = 80;

// Groq free tier: 14,400 requests/day — https://console.groq.com/keys
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

// ─── SEO KEYWORDS ─────────────────────────────────────────────────────────────
function getSeoKeywords(category) {
  const c = category.trim();
  if (["Power Bank", "Chargers"].includes(c)) {
    return `fast charging in Nigeria, USB-C, ${c}, affordable, reliable`;
  }
  if (c === "Wearables") {
    return `long battery life, waterproof, smart features, ${c}, affordable, reliable`;
  }
  if (c === "Extensions") {
    return `safe power backup, surge protection, multiple outlets, ${c}, affordable, reliable`;
  }
  if (c === "Lifestyle") {
    return `modern design, durable, Nigerian homes, ${c}, affordable, reliable`;
  }
  return `${c}, affordable, reliable, available in Nigeria`;
}

// ─── TIMEOUT FETCH ────────────────────────────────────────────────────────────
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── GROQ WITH FALLBACK ───────────────────────────────────────────────────────
async function callGroq(systemPrompt, userPrompt) {
  const errors = [];

  for (const model of GROQ_MODELS) {
    try {
      console.log(`🔄 Trying Groq model: ${model}`);

      const res = await fetchWithTimeout(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 400,
            temperature: 0.7,
          }),
        },
        TIMEOUT_MS
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        const reason = data.error?.message || `HTTP ${res.status}`;
        console.warn(`⚠️ ${model} failed: ${reason.slice(0, 120)}`);
        errors.push({ model, reason });
        continue;
      }

      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        errors.push({ model, reason: "Empty content" });
        continue;
      }

      console.log(`✅ Success with Groq: ${model}`);
      return { content, model };
    } catch (err) {
      console.warn(`⚠️ ${model} error: ${err.message}`);
      errors.push({ model, reason: err.message });
    }
  }

  return null; // signal to use local fallback — never throw
}

// ─── LOCAL FALLBACK (ALWAYS WORKS, NO API) ────────────────────────────────────
function generateLocalDescription({ name, category, price, features }) {
  const c = category.trim();
  const featureList = features?.length ? features : [];

  const featureSentence = featureList.length
    ? `Built with ${featureList.slice(0, 3).join(", ").toLowerCase()}, it delivers dependable performance every single day.`
    : `Engineered for dependable performance every single day.`;

  const categoryLines = {
    "Power Bank": `Enjoy fast charging in Nigeria with USB-C support, keeping your phone, tablet, and accessories powered through long days and unexpected outages.`,
    "Chargers": `With fast charging in Nigeria and USB-C compatibility, it powers up your devices quickly and safely at home, in the office, or on the road.`,
    "Wearables": `With long battery life and smart features, it keeps up with your lifestyle from morning workouts to late-night notifications.`,
    "Extensions": `With surge protection and multiple outlets, it safely powers all your devices in Nigerian homes and offices.`,
    "Lifestyle": `With a modern, durable design, it fits perfectly into Nigerian homes and everyday routines.`,
  };

  const midLine =
    categoryLines[c] ||
    `Designed to make everyday life easier, it delivers quality you can count on.`;

  return `Looking for an affordable, reliable ${c.toLowerCase()} that actually delivers? The ${name} is built for exactly that. ${midLine} ${featureSentence} At just ₦${price}, the ${name} offers outstanding value — a smart choice for anyone in Nigeria who wants quality without overpaying. Perfect for daily use, travel, and as a dependable backup you can trust.`;
}

// ─── CLEANER ──────────────────────────────────────────────────────────────────
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
    /^paragraph/i, /^~?\d+\s*words/i, /^count:/i,
    /^word count/i, /^total/i,
  ];

  const lines = raw.split("\n").filter((line) => {
    const t = line.trim();
    if (!t) return true;
    return !metaPatterns.some((p) => p.test(t));
  });

  let cleaned = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  cleaned = cleaned.replace(/^["“”'']+|["“”'']+$/g, "").trim();

  const blocks = cleaned.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const firstBlock = blocks.find((b) => b.length > 50);
  return firstBlock || cleaned;
}

function trimToWordLimit(text, maxWords) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  const trimmed = words.slice(0, maxWords).join(" ");
  const lastPeriod = trimmed.lastIndexOf(".");
  if (lastPeriod > trimmed.length * 0.7) return trimmed.slice(0, lastPeriod + 1);
  return trimmed + "...";
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { name, category, price, features, existingDescription } =
      await request.json();

    if (!name || !category) {
      return NextResponse.json(
        { error: "Product name and category are required" },
        { status: 400 }
      );
    }

    const featuresText = features?.length
      ? `Key features: ${features.join(", ")}.`
      : "";
    const seoKeywords = getSeoKeywords(category);

    const systemPrompt = `You are an e-commerce SEO copywriter. Output ONLY the product description as plain text. No quotes around it, no labels, no markdown, no word counts, no explanations.`;

    const userPrompt = existingDescription
      ? `Rewrite this product description in ${MIN_WORDS}-${MAX_WORDS} words. SEO-optimized, easy to read.

Include these keywords naturally: ${seoKeywords}.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Current description:
${existingDescription}

Output ONLY the rewritten description.`
      : `Write a product description in ${MIN_WORDS}-${MAX_WORDS} words. SEO-optimized, easy to read.

Include these keywords naturally: ${seoKeywords}.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Output ONLY the description.`;

    // LAYER 1: Groq
    const result = await callGroq(systemPrompt, userPrompt);

    let description;
    let source;
    let usedModel;

    if (result) {
      description = cleanDescription(result.content);
      source = "groq";
      usedModel = result.model;
    }

    // LAYER 2: Local fallback — guaranteed to work
    if (!description || description.length < 20) {
      console.warn("🛟 Using local fallback generator");
      description = generateLocalDescription({ name, category, price, features });
      source = "local-fallback";
      usedModel = "template";
    }

    if (description.split(/\s+/).length > MAX_WORDS) {
      description = trimToWordLimit(description, MAX_WORDS);
    }

    return NextResponse.json({
      description,
      source,
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