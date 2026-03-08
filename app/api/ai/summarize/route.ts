import { NextResponse } from 'next/server'
import { GoogleGenAI } from "@google/genai";

// Localized prompts for different counties and languages
const getPrompt = (county: string, language: string, reports: any[]) => {
  const reportsText = reports.map(r => 
    `- ${r.category?.replace(/_/g, ' ')}: ${r.description?.substring(0, 100)}... (${r.area})`
  ).join('\n')

  const basePrompt = `You are a friendly community safety advisor. Based on these recent scam reports from ${county}:`

  const safetyMessage = `
Please provide a brief, friendly summary that:
1. Summarizes the main scam patterns in ${county}
2. Urges vigilance WITHOUT causing fear or provocation
3. Encourages reporting to authorities
4. Uses a warm, supportive tone

Keep it concise (2-3 paragraphs max).`

  const languageContext = {
    'English': `${basePrompt}\n${reportsText}\n${safetyMessage}`,
    'Swahili': `${basePrompt}\n${reportsText}\n${safetyMessage}\n\nTafadhali andika jibu la Kiswahili na kuchanganya na English ambapo inaonekana natural.`,
    'Sheng': `${basePrompt}\n${reportsText}\n${safetyMessage}\n\nUse local Nairobi/area Sheng slang naturally mixed with English. For Mombasa, use very minimal sheng as it's mostly Swahili-influenced. Be friendly and relatable.`
  }

  return languageContext[language as keyof typeof languageContext] || languageContext['English']
}

export async function POST(req: Request) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not found in environment variables')
    return NextResponse.json(
      { error: 'AI service not configured. Check API key.' },
      { status: 500 }
    )
  }

  try {
    const { reports, county, language } = await req.json()

    if (!reports || reports.length === 0) {
      return NextResponse.json(
        { error: 'No reports provided' },
        { status: 400 }
      )
    }

    const prompt = getPrompt(county, language, reports)
    
    console.log('Calling Gemini API for county:', county, 'language:', language)
    console.log('Report count:', reports.length)

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })

    const text = response.text

    if (!text) {
      console.error('No summary in response from SDK')
      return NextResponse.json(
        { error: 'No summary generated from API' },
        { status: 500 }
      )
    }

    console.log('Summary generated successfully via GoogleGenAI SDK')
    return NextResponse.json({ summary: text })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: `Server error: ${(error as any).message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
