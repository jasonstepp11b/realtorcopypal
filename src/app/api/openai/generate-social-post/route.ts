import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const {
      propertyAddress,
      listingPrice,
      propertyType,
      bedrooms,
      bathrooms,
      squareFeet,
      hasOpenHouse,
      openHouseDetails,
      keyFeatures,
      neighborhoodHighlights,
      callToAction,
      listingAgent,
      platform,
      targetAudience,
      hashtags,
      tone,
    } = await req.json();

    // Construct the prompt
    const systemPrompt = `You are a top-performing real estate social media manager who creates engaging, platform-optimized property listings. You understand the best practices and character limits for different social media platforms, and know how to create content that drives engagement and leads.`;

    const userPrompt = `
      Create a ${tone} social media post for ${platform} about a ${propertyType} listing.
      
      Property details:
      ${propertyAddress ? `- Address: ${propertyAddress}` : ""}
      ${listingPrice ? `- Price: ${listingPrice}` : ""}
      ${bedrooms ? `- Bedrooms: ${bedrooms}` : ""}
      ${bathrooms ? `- Bathrooms: ${bathrooms}` : ""}
      ${squareFeet ? `- Square Feet: ${squareFeet}` : ""}
      ${listingAgent ? `- Listed by: ${listingAgent}` : ""}
      
      Additional details to incorporate (if provided):
      ${keyFeatures ? `- Key Features: ${keyFeatures}` : ""}
      ${
        hasOpenHouse && openHouseDetails
          ? `- Open House: ${openHouseDetails}`
          : ""
      }
      ${
        neighborhoodHighlights
          ? `- Area Highlights: ${neighborhoodHighlights}`
          : ""
      }
      ${targetAudience ? `- Target Audience: ${targetAudience}` : ""}
      
      Platform-specific requirements:
      - Instagram: Focus on visual appeal, use emojis strategically, max 2200 characters
      - Facebook: More detailed, conversational tone, include property highlights
      - Twitter: Concise, impactful, max 280 characters
      - LinkedIn: Professional tone, focus on investment potential
      - Pinterest: Visual description, lifestyle focus
      
      Must include:
      1. An attention-grabbing opening
      2. Key property features
      3. The call to action: "${callToAction}"
      4. Relevant hashtags: ${hashtags || "#RealEstate #[City]RealEstate"}
      
      Format requirements:
      - Use appropriate line breaks and emojis for readability
      - Include price and basic specs (beds/baths) near the beginning
      - End with call to action and hashtags
      - Match the tone and length to the platform
      - If open house is scheduled, highlight it prominently
      
      Additional guidelines:
      - Make it scannable and engaging
      - Include numbers and stats when possible
      - Use emojis relevant to property features
      - Incorporate location benefits
      - If targeting specific buyers, use appropriate language
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
            model: "gpt-4",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: temperature,
            max_tokens: 800,
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
    console.error("Error generating social media post:", error);
    return NextResponse.json(
      { error: "Failed to generate social media post" },
      { status: 500 }
    );
  }
}
