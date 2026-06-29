import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { NextResponse } from "next/server";

// Retry helper with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
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

    let generatedDescription;

    // Try Gemini first
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey && geminiApiKey !== "your_gemini_api_key_here") {
      try {
        console.log("Attempting Gemini API...");
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        generatedDescription = await retryWithBackoff(async () => {
          const result = await model.generateContent(prompt);
          return result.response.text();
        });
        
        console.log("Successfully generated with Gemini, length:", generatedDescription.length);
        return NextResponse.json({ description: generatedDescription, source: "gemini" });
      } catch (geminiError) {
        console.error("Gemini API failed:", geminiError.message);
        // Fall through to OpenAI
      }
    }

    // Fallback to OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey && openaiApiKey !== "your_openai_api_key_here") {
      try {
        console.log("Falling back to OpenAI API...");
        const openai = new OpenAI({ apiKey: openaiApiKey });
        
        generatedDescription = await retryWithBackoff(async () => {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an expert e-commerce copywriter specializing in SEO-optimized product descriptions that convert visitors into buyers."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
          });
          return completion.choices[0].message.content;
        });
        
        console.log("Successfully generated with OpenAI, length:", generatedDescription.length);
        return NextResponse.json({ description: generatedDescription, source: "openai" });
      } catch (openaiError) {
        console.error("OpenAI API failed:", openaiError.message);
      }
    }

    // If both failed
    return NextResponse.json(
      { error: "Both AI services are unavailable. Please check your API keys and network connection." },
      { status: 500 }
    );

  } catch (error) {
    console.error("AI generation error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { error: error.message || "Failed to generate description" },
      { status: 500 }
    );
  }
}
