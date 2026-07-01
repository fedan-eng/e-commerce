import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, category, price, features, existingDescription } = await request.json();

    if (!name || !category) {
      return NextResponse.json(
        { error: "Product name and category are required" },
        { status: 400 }
      );
    }

    const featuresText = features?.length
      ? `Key features: ${features.join(", ")}.`
      : "";

    const systemPrompt = `You are an e-commerce SEO copywriter. Output ONLY a concise product description. No thinking, no labels, no markdown, no filler. Just the description.`;

    const userPrompt = existingDescription
      ? `Rewrite this product description. Keep it concise (80-120 words), SEO-optimized, and easy to read.

Include these keywords naturally: fast charging in Nigeria, USB-C, ${category}, affordable, reliable.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Current description:
${existingDescription}

Output ONLY the rewritten description. No labels, no thinking, no extra text.`
      : `Write a concise product description (80-120 words). Make it SEO-optimized and easy to read.

Include these keywords naturally: fast charging in Nigeria, USB-C, ${category}, affordable, reliable.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Output ONLY the description. No labels, no thinking, no extra text.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "OpenRouter request failed");
    }

    const data = await res.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error("Invalid API response: no content returned");
    }
    
    let raw = data.choices[0].message.content.trim();

    // Strip markdown
    raw = raw
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/^#+\s+/gm, "")
      .replace(/^[-•]\s+/gm, "")
      .replace(/`([^`]*)`/g, "$1");

    // Remove reasoning/planning lines — anything that looks like internal thought
    const reasoningPatterns = [
      /^(okay|alright|sure|let me|i (need|will|should|must|have to)|we need|we must|we (can|should)|let's|now,|so,|first,|next,|then,|finally,|note:|output:|result:|here (is|are)|paragraph \d|hook:|benefit:|specs:|compat)/i,
      /^\d+\.\s/,           // numbered list lines
      /^-{2,}/,             // separator lines
      /word count:/i,
      /structure:/i,
      /aim for/i,
    ];

    const lines = raw.split("\n");
    const cleaned = lines.filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return true; // keep blank lines (paragraph breaks)
      return !reasoningPatterns.some(p => p.test(trimmed));
    });

    // Collapse multiple blank lines, trim
    const description = cleaned
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return NextResponse.json({ description, source: "openrouter" });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate description" },
      { status: 500 }
    );
  }
}