import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type')
    const county = searchParams.get('county')
    const sort = searchParams.get('sort')

    let query = supabase 
    .from('processed_reports')
    .select('*')

    //filtering
    if (type) {
        query = query.eq('scam_category', type)
}

if (county) {
    query = query.eq('county', county)
}

    //Sorting
    if (sort == 'recent') {
        query = query.order('original_created_at', { ascending: false})
        } else {
            //Default sort
            query = query.order('original_created_at', { ascending: true})
        }

        const { data, error} = await query 

        if (error) {
            return NextResponse.json(
                {error: error.message },
                { status: 500}
            )
        }

        return NextResponse.json(data)
    }