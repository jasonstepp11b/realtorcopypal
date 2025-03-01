import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      emailType,
      subject,
      targetAudience,
      tone,
      // Broadcast specific
      broadcastPurpose,
      newsletterTopic,
      promotionDetails,
      eventDetails,
      marketUpdateInfo,
      // New realtor-specific fields for broadcast emails
      propertyAddress,
      propertyPrice,
      propertyType,
      propertyHighlights,
      openHouseDate,
      openHouseTime,
      specialInstructions,
      salePrice,
      daysOnMarket,
      saleHighlights,
      previousPrice,
      newPrice,
      neighborhoodName,
      neighborhoodHighlights,
      season,
      tipsTopic,
      tipsContent,
      eventName,
      eventDate,
      eventTime,
      eventLocation,
      holidayOccasion,
      holidayMessage,
      // Follow-up specific
      followUpSequence,
      initialContactContext,
      daysSinceLastContact,
      previousInteractionSummary,
      // Transactional specific
      transactionType,
      userName,
      propertyDetails,
      appointmentDetails,
      openHouseDetails,
      // Common customization
      callToAction,
      companyInfo,
      agentName,
      agentTitle,
      includeTestimonial,
      testimonialText,
    } = data;

    // Construct the system prompt based on email type
    let systemPrompt = `You are a top-performing real estate email copywriter who creates compelling, personalized, and effective email content. Your emails are engaging, professional, and designed to drive action. You understand the real estate market and the specific challenges and opportunities that real estate agents face. You know how to craft messages that resonate with different types of real estate clients including buyers, sellers, past clients, and prospects.`;

    // Construct the user prompt based on email type
    let userPrompt = "";

    if (emailType === "broadcast") {
      systemPrompt += ` You specialize in creating broadcast emails that engage large audiences while still feeling personal and relevant. Your emails incorporate real estate terminology and best practices.`;

      // Determine broadcast purpose display name and fields
      let purposeSpecificContent = "";

      switch (broadcastPurpose) {
        case "new-listing":
          purposeSpecificContent = `
          Property details:
          - Address: ${propertyAddress || "[Address not provided]"}
          - Price: ${propertyPrice || "[Price not provided]"}
          - Type: ${propertyType || "[Type not provided]"}
          - Highlights: ${propertyHighlights || "[Highlights not provided]"}
          `;
          break;

        case "open-house":
          purposeSpecificContent = `
          Open House details:
          - Property Address: ${propertyAddress || "[Address not provided]"}
          - Date: ${openHouseDate || "[Date not provided]"}
          - Time: ${openHouseTime || "[Time not provided]"}
          - Property Highlights: ${
            propertyHighlights || "[Highlights not provided]"
          }
          ${
            specialInstructions
              ? `- Special Instructions: ${specialInstructions}`
              : ""
          }
          `;
          break;

        case "just-sold":
          purposeSpecificContent = `
          Just Sold details:
          - Property Address: ${propertyAddress || "[Address not provided]"}
          - Sale Price: ${salePrice || "[Price information not provided]"}
          - Days on Market: ${daysOnMarket || "[Days on market not provided]"}
          - Sale Highlights: ${
            saleHighlights || "[Sale highlights not provided]"
          }
          `;
          break;

        case "price-reduction":
          purposeSpecificContent = `
          Price Reduction details:
          - Property Address: ${propertyAddress || "[Address not provided]"}
          - Previous Price: ${previousPrice || "[Previous price not provided]"}
          - New Price: ${newPrice || "[New price not provided]"}
          - Property Highlights: ${
            propertyHighlights || "[Highlights not provided]"
          }
          `;
          break;

        case "market-update":
          purposeSpecificContent = `
          Market Update Information: ${
            marketUpdateInfo || "[Market information not provided]"
          }
          `;
          break;

        case "neighborhood":
          purposeSpecificContent = `
          Neighborhood Newsletter details:
          - Neighborhood/Area: ${
            neighborhoodName || "[Neighborhood name not provided]"
          }
          - Highlights & Updates: ${
            neighborhoodHighlights || "[Neighborhood highlights not provided]"
          }
          `;
          break;

        case "home-tips":
          purposeSpecificContent = `
          Seasonal Home Tips:
          - Season/Occasion: ${season || "[Season not specified]"}
          - Tips Topic: ${tipsTopic || "[Topic not provided]"}
          - Tips Content: ${tipsContent || "[Content not provided]"}
          `;
          break;

        case "client-event":
          purposeSpecificContent = `
          Client Appreciation Event:
          - Event Name: ${eventName || "[Event name not provided]"}
          - Date: ${eventDate || "[Date not provided]"}
          - Time: ${eventTime || "[Time not provided]"}
          - Location: ${eventLocation || "[Location not provided]"}
          - Event Details: ${eventDetails || "[Details not provided]"}
          `;
          break;

        case "holiday":
          purposeSpecificContent = `
          Holiday/Seasonal Greeting:
          - Occasion: ${holidayOccasion || "[Occasion not specified]"}
          - Message: ${holidayMessage || "[Message not provided]"}
          `;
          break;

        // Fallbacks for the original options
        case "newsletter":
          purposeSpecificContent = `Newsletter topic: ${
            newsletterTopic || "[Topic not provided]"
          }`;
          break;

        case "promotion":
          purposeSpecificContent = `Promotion details: ${
            promotionDetails || "[Details not provided]"
          }`;
          break;
      }

      // Get display name for broadcast purpose
      const broadcastPurposeDisplay =
        getBroadcastPurposeDisplay(broadcastPurpose);

      userPrompt = `
        Write a ${tone} broadcast email for real estate ${broadcastPurposeDisplay} targeting ${targetAudience}.
        
        Email subject: ${subject}
        
        ${purposeSpecificContent}
        
        ${callToAction ? `Call to action: ${callToAction}` : ""}
        ${companyInfo ? `Company/Brokerage information: ${companyInfo}` : ""}
        ${agentName ? `Agent name: ${agentName}` : ""}
        ${agentTitle ? `Agent title: ${agentTitle}` : ""}
        ${
          includeTestimonial
            ? `Include this testimonial: "${testimonialText}"`
            : ""
        }
        
        Format requirements:
        - Start with a compelling greeting and opening paragraph
        - Include 2-3 paragraphs of valuable content that resonates with real estate clients
        - Use bullet points where appropriate to highlight key information
        - End with a clear call to action
        - Include a professional signature with agent name, title, and brokerage information if provided
        - Ensure the email complies with real estate regulations by including appropriate disclaimers
        - Total length should be 250-350 words
      `;
    } else if (emailType === "follow-up") {
      systemPrompt += ` You specialize in creating follow-up email sequences that maintain interest and gently guide prospects toward a decision. You understand the real estate sales cycle and the importance of consistent follow-up.`;

      // Get the number of emails to generate (default to 3 if not specified)
      const numEmails = parseInt(data.numberOfEmails || "3", 10);

      // Get sequence type display name
      let sequenceTypeDisplay = "";
      if (data.followUpSequenceType === "other" && data.customSequenceType) {
        sequenceTypeDisplay = data.customSequenceType;
      } else {
        sequenceTypeDisplay = getSequenceTypeDisplay(
          data.followUpSequenceType || "market-report"
        );
      }

      // Get the timing between emails
      let timingDescription = "";
      if (data.emailFrequency === "custom" && data.customEmailFrequency) {
        timingDescription = data.customEmailFrequency;
      } else {
        timingDescription = getTimingDescription(
          data.emailFrequency || "3-5-7"
        );
      }

      userPrompt = `
        Create a complete ${tone} follow-up email sequence (${numEmails} emails) for ${sequenceTypeDisplay} targeting ${targetAudience}.
        
        Subject line prefix: ${subject}
        
        Sequence timing: ${timingDescription}
        
        Initial contact context: ${
          initialContactContext || "No initial context provided"
        }
        
        Sequence goals: ${data.sequenceGoals || "No specific goals provided"}
        
        Value proposition: ${
          data.valueProposition || "No value proposition provided"
        }
        
        ${callToAction ? `Primary call to action: ${callToAction}` : ""}
        ${companyInfo ? `Company/Brokerage information: ${companyInfo}` : ""}
        ${agentName ? `Agent name: ${agentName}` : ""}
        ${agentTitle ? `Agent title: ${agentTitle}` : ""}
        ${
          includeTestimonial
            ? `Include this testimonial: "${testimonialText}"`
            : ""
        }
        
        Format requirements:
        - Create ${numEmails} separate follow-up emails that form a cohesive sequence
        - Each email should be clearly labeled as "EMAIL #1", "EMAIL #2", etc. at the beginning
        - Each email should have a unique subject line suggestion, based on the prefix provided
        - Start the first email with establishing context and value
        - Each subsequent email should build upon the previous ones
        - Increase the sense of urgency slightly with each email
        - Include natural transitions between emails that reference the timing (e.g., "I sent you an email a few days ago...")
        - Each email should be 150-250 words
        - Include a professional signature for each email
        - Ensure each email complies with real estate regulations
        
        IMPORTANT: Create all ${numEmails} emails in a single response, separated clearly.
      `;
    } else if (emailType === "transactional") {
      systemPrompt += ` You specialize in creating transactional emails that deliver important information while maintaining a personal touch and encouraging further engagement. You understand the legal and practical requirements of real estate transactions.`;

      userPrompt = `
        Write a ${tone} transactional email for a real estate ${transactionType} notification.
        
        Email subject: ${subject}
        
        Target audience: ${targetAudience}
        ${userName ? `Recipient name: ${userName}` : ""}
        ${
          transactionType === "welcome"
            ? `Company/service information: ${companyInfo}`
            : ""
        }
        ${
          transactionType === "open-house"
            ? `Open house details: ${openHouseDetails}`
            : ""
        }
        ${
          transactionType === "listing-alert"
            ? `Property details: ${propertyDetails}`
            : ""
        }
        ${
          transactionType === "appointment"
            ? `Appointment details: ${appointmentDetails}`
            : ""
        }
        
        ${callToAction ? `Call to action: ${callToAction}` : ""}
        ${agentName ? `Agent name: ${agentName}` : ""}
        ${agentTitle ? `Agent title: ${agentTitle}` : ""}
        ${
          includeTestimonial
            ? `Include this testimonial: "${testimonialText}"`
            : ""
        }
        
        Format requirements:
        - Start with a personalized greeting (use [First Name] if no specific name provided)
        - Clearly communicate the key information in the first paragraph
        - Include any necessary details in a clean, scannable format
        - Suggest a relevant next step or action
        - Include a professional signature with agent name, title, and brokerage information if provided
        - Include any necessary real estate disclaimers or legal notices
        - Total length should be 150-250 words
      `;
    }

    // Generate three variations for broadcast and transactional, but only one for follow-up (since it already has multiple emails)
    const variations = [];
    const numVariations = emailType === "follow-up" ? 1 : 3;

    for (let i = 0; i < numVariations; i++) {
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
            max_tokens: emailType === "follow-up" ? 1600 : 800, // Increase token limit for follow-up sequences
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const result = await response.json();
      variations.push(result.choices[0].message.content.trim());
    }

    return NextResponse.json({ variations });
  } catch (error) {
    console.error("Error generating email:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}

// Helper function to get a display name for broadcast purpose
function getBroadcastPurposeDisplay(purpose: string): string {
  const purposeMap: Record<string, string> = {
    "new-listing": "New Listing Announcement",
    "open-house": "Open House Invitation",
    "just-sold": "Just Sold Announcement",
    "price-reduction": "Price Reduction Alert",
    "market-update": "Market Update",
    neighborhood: "Neighborhood Newsletter",
    "home-tips": "Seasonal Home Tips",
    "client-event": "Client Appreciation Event",
    holiday: "Holiday/Seasonal Greeting",
    newsletter: "Newsletter",
    promotion: "Promotion/Special Offer",
    event: "Event Announcement",
  };

  return purposeMap[purpose] || purpose;
}

// Helper function to get a display name for follow-up sequence type
function getSequenceTypeDisplay(sequenceType: string): string {
  const sequenceMap: Record<string, string> = {
    "market-report": "Market Report Opt-in Follow-ups",
    "open-house": "Open House Attendee Follow-ups",
    "property-interest": "Property Interest Follow-ups",
    "buyer-consultation": "Buyer Consultation Follow-ups",
    "listing-presentation": "Listing Presentation Follow-ups",
  };

  return sequenceMap[sequenceType] || sequenceType;
}

// Helper function to get a description of the timing between emails
function getTimingDescription(timing: string): string {
  const timingMap: Record<string, string> = {
    "3-5-7":
      "3 days after initial contact, then 5 days later, then 7 days later",
    "7-14-21":
      "7 days after initial contact, then 14 days later, then 21 days later",
    "2-3-4":
      "2 days after initial contact, then 3 days later, then 4 days later",
    "5-10-15":
      "5 days after initial contact, then 10 days later, then 15 days later",
  };

  return timingMap[timing] || timing;
}
