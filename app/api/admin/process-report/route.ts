import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

// Initializing the new unified client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { reportId, adminId } = await req.json();
    const supabase = createClient();

    // 1. Fetch raw report
    const { data: rawReport, error: fetchError } = await (await supabase)
      .from("scam_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (fetchError || !rawReport) throw new Error("Report not found");

    // 2. Define the System Lexicon for Gemini
    const categories = [
      "MOBILE_MONEY_FRAUD", 
      "EMPLOYMENT_SCAM",    
      "REAL_ESTATE_RENTAL", 
      "ONLINE_SHOPPING",  
      "STREET_CON",         
      "SOCIAL_ENGINEERING",
      "OTHER"
    ];

    // 3. Generate Content using the new SDK syntax
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use the most cost-effective model for structured tasks
      contents: [{
        role: "user",
        parts: [{
          text: `
            Analyze this Kenyan scam report: "${rawReport.description}"
            Reported Area: "${rawReport.area || "Unknown"}"

            Instructions:
            1. First, assess the QUALITY of this report:
               - LEGITIMATE: Real scam report with coherent, verifiable details
               - GIBBERISH: Incoherent, random text, nonsensical, or incomprehensible
               - EXAGGERATED/FALSE: Claims that are clearly false, obviously fabricated, or wildly exaggerated

            2. If LEGITIMATE, then:
               - Rephrase for public safety (professional tone, no personal names/phones).
               - Choose one category from: [${categories.join(", ")}].
               - Standardize the County and Area. If not found, use "Unknown".
               - Assign Risk Level (1-5).
            
            3. If GIBBERISH or EXAGGERATED/FALSE:
               - Still provide a clean_description (cleaned-up version of input).
               - Still classify a category (best effort).
               - Set risk_level to 1.

            Return strictly as JSON:
            {
              "report_quality": "LEGITIMATE" | "GIBBERISH" | "EXAGGERATED/FALSE",
              "clean_description": "...",
              "scam_category": "...",
              "county": "...",
              "specific_area": "...",
              "risk_level": 1-5
            }
          `
        }]
      }]
    });

    if (!response.text) throw new Error("AI response text is empty");
    
    // Strip markdown code blocks from response
    const cleanedText = response.text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^```/g, "")
      .trim();
    
    let aiOutput;
    try {
      aiOutput = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error("Failed to parse AI response. Raw text:", response.text);
      console.error("Cleaned text:", cleanedText);
      throw new Error(`Invalid JSON from AI: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
    }
    
    // Validate required fields
    if (!aiOutput.clean_description || !aiOutput.scam_category || !aiOutput.report_quality) {
      throw new Error("AI response missing required fields: clean_description, scam_category, or report_quality");
    }

    // Validate report_quality is one of the expected values
    if (!['LEGITIMATE', 'GIBBERISH', 'EXAGGERATED/FALSE'].includes(aiOutput.report_quality)) {
      throw new Error(`Invalid report_quality value: ${aiOutput.report_quality}`);
    }

    // 4. Return AI analysis results (don't insert/approve yet - let frontend decide)
    // The frontend will handle approval or rejection based on report_quality

    return NextResponse.json({ 
      success: true, 
      result: {
        clean_description: aiOutput.clean_description,
        scam_category: aiOutput.scam_category,
        county: aiOutput.county || "Unknown",
        specific_area: aiOutput.specific_area || rawReport.area || "Unknown",
        risk_level: Math.min(5, Math.max(1, aiOutput.risk_level || 3)),
        report_quality: aiOutput.report_quality,
        pii_removed: aiOutput.pii_removed || [],
        key_tactics: aiOutput.key_tactics || [],
        original_type: rawReport.type
      }
    });

  } catch (error: any) {
    console.error("Process report error:", error);
    console.error("Full error JSON:", JSON.stringify(error, null, 2));
const errorMessage =
    error instanceof Error ? error.message : JSON.stringify(error);


    // const errorMessage = error instanceof Error ? error.message : String(error);
    // console.error("Process report error:", errorMessage);
    
    if (errorMessage.includes('429')) {
      console.error("QUOTA EXHAUSTED: Consider switching to gemini-1.5-flash-lite or waiting 60s.");
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage || "Failed to process report with AI"
    }, { status: 500 });
  }
}