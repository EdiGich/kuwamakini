import { NextResponse } from "next/server"
import { createClient } from "@/app/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { reportId, adminId, cleanDescription, scamCategory, county, specificArea, riskLevel } = await req.json()
    const supabase = createClient()

    // 1. Fetch raw report
    const { data: rawReport, error: fetchError } = await (await supabase)
      .from("scam_reports")
      .select("*")
      .eq("id", reportId)
      .single()

    if (fetchError || !rawReport) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    // 2. Validate required fields
    if (!cleanDescription || !scamCategory) {
      return NextResponse.json(
        { error: "Missing required fields: cleanDescription and scamCategory" },
        { status: 400 }
      )
    }

    // 3. Insert into processed_reports
    const { error: insertError } = await (await supabase)
      .from("processed_reports")
      .insert({
        original_id: rawReport.id,
        clean_description: cleanDescription,
        scam_category: scamCategory,
        county: county || "Unknown",
        specific_area: specificArea || rawReport.area || "Unknown",
        original_incident_date: rawReport.incident_date,
        original_created_at: rawReport.created_at,
        processing_method: 'manual',
        risk_level: Math.min(5, Math.max(1, riskLevel || 3)),
        moderated_by: adminId
      })

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json(
        { error: "Failed to save processed report", details: insertError.message },
        { status: 500 }
      )
    }

    // 4. Mark as approved in original table
    await (await supabase)
      .from("scam_reports")
      .update({ status: 'approved', is_approved: true })
      .eq('id', reportId)

    return NextResponse.json({
      success: true,
      result: {
        clean_description: cleanDescription,
        scam_category: scamCategory,
        county: county || "Unknown",
        specific_area: specificArea || rawReport.area || "Unknown",
        risk_level: Math.min(5, Math.max(1, riskLevel || 3)),
        original_type: rawReport.type
      }
    })
  } catch (error: any) {
    console.error("Manual approval error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: errorMessage || "Failed to process manual approval" },
      { status: 500 }
    )
  }
}
