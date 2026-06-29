import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { name, category, price, features, existingDescription } = await request.json();

    if (!name || !category) {
      return NextResponse.json(
        { error: "Product name and category are required" },
        { status: 400 }
      );
    }

    const featuresList = features || [];
    const featuresText = featuresList.length > 0 
      ? `Key features: ${featuresList.join(", ")}.` 
      : "";

    const prompt = existingDescription
      ? `Improve this product description to make it more SEO-optimized, engaging, and professional. Keep the core information but enhance the language, structure, and appeal.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Current description:
${existingDescription}

Generate an improved, SEO-optimized product description that:
- Is compelling and persuasive
- Uses natural keywords for SEO
- Highlights key benefits
- Has clear structure with paragraphs
- Is professional yet engaging
- Maintains accurate product information`
      : `Generate a compelling, SEO-optimized product description for this product.

Product: ${name}
Category: ${category}
Price: ₦${price}
${featuresText}

Generate a professional product description that:
- Is compelling and persuasive
- Uses natural keywords for SEO
- Highlights key benefits and features
- Has clear structure with paragraphs
- Is professional yet engaging
- Appeals to potential customers
- Is approximately 150-250 words`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const generatedDescription = result.response.text();

    return NextResponse.json({ description: generatedDescription });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate description" },
      { status: 500 }
    );
  }
}
