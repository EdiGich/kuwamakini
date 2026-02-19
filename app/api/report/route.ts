import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { type, area, description, incident_date } = body

        if (!description || description.trim().length === 0) {
            return NextResponse.json(
                { error: "Description is required"},
                { status: 400 }
            )
        }

        // Basic length protection
        if (description.length > 2000) {
            return NextResponse.json(
                {error: "Description is too long"},
                { status: 400}
            )
         }

         const {error} = await supabase
         .from('scam_reports')
         .insert([
            {
                type: type || 'other',
                area,
                description,
                incident_date
            }
         ])

         if (error) {
            return NextResponse.json(
                {error: error.message },
                {status: 500}
            )
         }
         return NextResponse.json({
            message: "Report submitted for moderation"
         })
    } catch (err) {
        return NextResponse.json(
            { error: "Invalid request"},
            { status: 400}
        )
    }

}