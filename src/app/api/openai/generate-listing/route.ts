import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const {
      propertyType,
      bedrooms,
      bathrooms,
      squareFeet,
      features,
      sellingPoints,
      targetBuyer,
      tone,
      askingPrice,
      hoaFees,
    } = await req.json();

    // Construct the prompt
    const systemPrompt = `You are a top-performing real estate copywriter who creates compelling property listings. Your listings are detailed, engaging, and designed to showcase properties in their best light. You know that bullet points make content more scannable and help highlight key features effectively.`;

    const userPrompt = `
      Write a ${tone} property description for a ${propertyType} targeting ${targetBuyer}.
      
      Property details:
      ${bedrooms ? `- Bedrooms: ${bedrooms}` : ""}
      ${bathrooms ? `- Bathrooms: ${bathrooms}` : ""}
      ${squareFeet ? `- Square Feet: ${squareFeet}` : ""}
      ${askingPrice ? `- Asking Price: ${askingPrice}` : ""}
      ${hoaFees ? `- HOA Fees: ${hoaFees}` : ""}
      
      Must include:
      - 1 emotional hook (e.g., "Picture yourself...")
      - A section with 3-5 bullet points highlighting key features from: ${features}
      - A section with 3-5 bullet points showcasing unique selling points from: ${sellingPoints}
      - 1 urgency driver (e.g., "Rare opportunity")
      - If HOA fees are provided, mention what amenities or services they cover
      - If asking price is provided, include value proposition
      
      Format requirements:
      - Start with 1-2 engaging paragraphs
      - Include a "Key Features" section with bullet points
      - Include a "Why You'll Love This Home" section with bullet points
      - End with 1-2 compelling paragraphs including the urgency driver
      - Total length should be 300-400 words
      
      Avoid clichés like "turnkey" or "perfect for entertaining."
      Make the bullet points concise, specific, and benefit-oriented.
    `;

    // Generate three variations
    const variations = [];

    for (let i = 0; i < 3; i++) {
      const temperature = 0.7 + i * 0.1; // Slightly increase temperature for each variation

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: temperature,
            max_tokens: 800, // Increased token limit for longer content
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      variations.push(data.choices[0].message.content.trim());
    }

    return NextResponse.json({ variations });
  } catch (error) {
    console.error("Error generating listing:", error);
    return NextResponse.json(
      { error: "Failed to generate listing" },
      { status: 500 }
    );
  }
}
