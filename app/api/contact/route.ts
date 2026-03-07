import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"
import { checkContactRateLimit } from "@/app/lib/rate-limit"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { name, email, message } = body

    // Get IP address from request headers
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("remote_addr") || "unknown"
    if (!checkContactRateLimit(ip as string)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 2 reviews per 12 hours." },
        { status: 429 }
      )
    }

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }
    if (message.length > 3000) {
      return NextResponse.json(
        {error : "Message must be under 3000 characters"},
        { status: 400}
      )
    }

    const { error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name,
          email,
          message
        }
      ])

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json(
        { error: "Failed to submit message" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Contact API error:", error)

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    )
  }
}