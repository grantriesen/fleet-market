import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { prompt, siteId } = await request.json();

    if (!prompt || !siteId) {
      return NextResponse.json({ error: 'Missing prompt or siteId' }, { status: 400 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', err);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Strip any accidental markdown fences
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let copy: Record<string, string>;
    try {
      copy = JSON.parse(clean);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', clean);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({ copy });
  } catch (error: any) {
    console.error('Generate copy error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
