// app/api/admin/products/generate-description/route.js
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

    const prompt = existingDescription
      ? `Improve this product description to be more SEO-optimized, engaging, and professional.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Current description:
${existingDescription}

Return only the improved description, no preamble.`
      : `Generate a compelling, SEO-optimized product description.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Return only the description (150-250 words), no preamble.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-8b-instruct:free", // free tier
        messages: [
          {
            role: "system",
            content: "You are an expert e-commerce copywriter. Write SEO-optimized product descriptions that convert. Return only the description text, nothing else.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "OpenRouter request failed");
    }

    const data = await res.json();
    const description = data.choices[0].message.content.trim();

    return NextResponse.json({ description, source: "openrouter" });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate description" },
      { status: 500 }
    );
  }
}