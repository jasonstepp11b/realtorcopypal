import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { saveProjectContent } from "@/lib/supabase/supabaseUtils";
import { createServerActionClientFromCookies } from "@/lib/supabase/server";
import { cookies } from "next/headers";

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
      // Project ID
      projectId,
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
        
        Timing between emails: ${timingDescription}
        
        Initial contact context: ${
          initialContactContext || "[Context not provided]"
        }
        
        Sequence goals: ${data.sequenceGoals || "[Goals not provided]"}
        
        Value proposition: ${data.valueProposition || "[Not provided]"}
        
        ${
          propertyDetails
            ? `Property details: ${propertyDetails}`
            : "[No property details provided]"
        }
        
        ${callToAction ? `Call to action: ${callToAction}` : ""}
        ${companyInfo ? `Company/Brokerage information: ${companyInfo}` : ""}
        ${agentName ? `Agent name: ${agentName}` : ""}
        ${agentTitle ? `Agent title: ${agentTitle}` : ""}
        
        Format requirements:
        - Create ${numEmails} distinct emails that build upon each other
        - Each email should have a unique subject line that starts with the provided prefix
        - Each email should be 150-250 words
        - Start each email with "Email #X: " followed by a brief description of its purpose
        - Include a professional signature with agent name, title, and brokerage information if provided
        - Ensure the emails comply with real estate regulations by including appropriate disclaimers
        - Each email should have a clear call to action that advances the prospect through the sales funnel
        - The sequence should gradually increase urgency while maintaining professionalism
      `;
    } else if (emailType === "transactional") {
      systemPrompt += ` You specialize in creating clear, concise transactional emails that convey important information while maintaining a professional tone. You understand the importance of clarity and completeness in real estate transaction communications.`;

      // Get transaction type display name
      let transactionTypeDisplay = "";
      if (transactionType === "other" && data.customTransactionType) {
        transactionTypeDisplay = data.customTransactionType;
      } else {
        transactionTypeDisplay = getTransactionTypeDisplay(
          transactionType || "offer-accepted"
        );
      }

      userPrompt = `
        Write a ${tone} transactional email for ${transactionTypeDisplay} targeting ${targetAudience}.
        
        Email subject: ${subject}
        
        Client name: ${data.clientName || "[Client name not provided]"}
        
        ${
          propertyDetails
            ? `Property details: ${propertyDetails}`
            : "[No property details provided]"
        }
        
        ${
          data.transactionDetails
            ? `Transaction details: ${data.transactionDetails}`
            : "[No transaction details provided]"
        }
        
        ${
          data.deadlineDate
            ? `Deadline/Important date: ${data.deadlineDate}`
            : ""
        }
        
        ${
          data.requiredAction
            ? `Required action: ${data.requiredAction}`
            : "[No required action specified]"
        }
        
        ${
          appointmentDetails ? `Appointment details: ${appointmentDetails}` : ""
        }
        
        ${openHouseDetails ? `Open house details: ${openHouseDetails}` : ""}
        
        ${callToAction ? `Call to action: ${callToAction}` : ""}
        ${companyInfo ? `Company/Brokerage information: ${companyInfo}` : ""}
        ${agentName ? `Agent name: ${agentName}` : ""}
        ${agentTitle ? `Agent title: ${agentTitle}` : ""}
        
        Format requirements:
        - Start with a clear, professional greeting
        - Clearly state the purpose of the email in the first paragraph
        - Use bullet points to highlight key information, dates, or required actions
        - Include all relevant details about the transaction, property, or appointment
        - End with clear next steps and/or call to action
        - Include a professional signature with agent name, title, and brokerage information if provided
        - Ensure the email complies with real estate regulations by including appropriate disclaimers
        - Total length should be 200-300 words
      `;
    }

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
            max_tokens: 1500, // Increased for follow-up sequences
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const result = await response.json();
      variations.push(result.choices[0].message.content.trim());
    }

    // If projectId is provided, save the content to the project
    if (projectId) {
      try {
        // Get the user ID from the session
        const supabase = createServerActionClientFromCookies();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.id) {
          // Create metadata object - remove large content fields to keep metadata manageable
          const metadata = {
            emailType,
            subject,
            targetAudience,
            tone,
            broadcastPurpose,
            transactionType,
            // Include other relevant fields but exclude large text content
          };

          // Save each variation to the project
          for (let i = 0; i < variations.length; i++) {
            await saveProjectContent(
              projectId,
              session.user.id,
              "email-campaign",
              variations[i],
              { ...metadata, variation: i + 1 }
            );
          }
        }
      } catch (saveError) {
        console.error("Error saving to project:", saveError);
        // Continue even if saving fails
      }
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

function getBroadcastPurposeDisplay(purpose: string): string {
  const purposeMap: Record<string, string> = {
    "new-listing": "New Listing Announcement",
    "open-house": "Open House Invitation",
    "just-sold": "Just Sold Announcement",
    "price-reduction": "Price Reduction Notification",
    "market-update": "Market Update",
    neighborhood: "Neighborhood Newsletter",
    "home-tips": "Seasonal Home Tips",
    "client-event": "Client Appreciation Event",
    holiday: "Holiday/Seasonal Greeting",
    newsletter: "Newsletter",
    promotion: "Promotion",
  };

  return purposeMap[purpose] || purpose;
}

function getSequenceTypeDisplay(sequenceType: string): string {
  const sequenceTypeMap: Record<string, string> = {
    "market-report": "Market Report Sequence",
    "buyer-nurture": "Buyer Nurturing Sequence",
    "seller-nurture": "Seller Nurturing Sequence",
    "listing-expired": "Expired Listing Sequence",
    "past-client": "Past Client Re-engagement",
    "open-house-follow-up": "Open House Follow-up",
  };

  return sequenceTypeMap[sequenceType] || sequenceType;
}

function getTimingDescription(timing: string): string {
  const timingMap: Record<string, string> = {
    "3-5-7": "Day 1, Day 3, Day 7",
    "2-4-6": "Day 2, Day 4, Day 6",
    weekly: "Once per week for 3 weeks",
    biweekly: "Every two weeks for 6 weeks",
    monthly: "Once per month for 3 months",
  };

  return timingMap[timing] || timing;
}

function getTransactionTypeDisplay(transactionType: string): string {
  const transactionTypeMap: Record<string, string> = {
    "offer-accepted": "Offer Accepted",
    "inspection-scheduled": "Inspection Scheduled",
    "inspection-results": "Inspection Results",
    "closing-scheduled": "Closing Scheduled",
    "closing-confirmation": "Closing Confirmation",
    "showing-scheduled": "Showing Scheduled",
    "showing-feedback": "Showing Feedback",
    "listing-agreement": "Listing Agreement",
    "price-adjustment": "Price Adjustment",
    "contract-update": "Contract Update",
  };

  return transactionTypeMap[transactionType] || transactionType;
}
