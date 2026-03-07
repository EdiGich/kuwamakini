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
            Analyze this Kenyan scam: "${rawReport.description}"
            Reported Area: "${rawReport.area || "Unknown"}"

            Instructions:
            1. Rephrase for public safety (professional tone, no personal names/phones).
            2. Choose one category from: [${categories.join(", ")}].
            3. Standardize the County and Area. If not found, use "Unknown".
            4. Assign Risk Level (1-5).

            Return strictly as JSON:
            {
              "clean_description": "...",
              "scam_category": "...",
              "county": "...",
              "specific_area": "...",
              "risk_level": 3
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
    if (!aiOutput.clean_description || !aiOutput.scam_category) {
      throw new Error("AI response missing required fields: clean_description or scam_category");
    }

    // 4. Atomic Transaction: Insert Processed -> Update Original
    const { error: insertError } = await (await supabase)
      .from("processed_reports")
      .insert({
        original_id: rawReport.id,
        clean_description: aiOutput.clean_description,
        scam_category: aiOutput.scam_category,
        county: aiOutput.county || "Unknown",
        specific_area: aiOutput.specific_area || rawReport.area || "Unknown",
        original_incident_date: rawReport.incident_date,
        original_created_at: rawReport.created_at,
        processing_method: 'ai',
        // risk_level: aiOutput.risk_level,
        risk_level: Number(aiOutput.risk_level) || 3,
        moderated_by: adminId
      });

    if (insertError) throw insertError;

    // Mark as approved in original table
    await (await supabase)
      .from("scam_reports")
      .update({ status: 'approved', is_approved: true })
      .eq('id', reportId);

    return NextResponse.json({ 
      success: true, 
      result: {
        clean_description: aiOutput.clean_description,
        scam_category: aiOutput.scam_category,
        county: aiOutput.county || "Unknown",
        specific_area: aiOutput.specific_area || rawReport.area || "Unknown",
        risk_level: Math.min(5, Math.max(1, aiOutput.risk_level || 3)),
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