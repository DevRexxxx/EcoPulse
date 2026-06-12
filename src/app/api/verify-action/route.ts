import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { base64Image, actionType } = await request.json();

    if (!base64Image || !actionType) {
      return NextResponse.json({ error: 'Missing base64Image or actionType' }, { status: 400 });
    }

    const visionPrompt = `You are a strict visual auditor for EcoPulse. The user claims to have performed: "${actionType}".
Analyze the image and determine if the action is genuinely proven.
CRITICAL: Return ONLY a valid JSON object. No markdown, no backticks. Format:
{"action_verified": true/false, "confidence_score": 0.0-1.0, "co2_delta_kg": 0.0, "eco_points": 0, "raw_visual_description": "1 short sentence exactly describing what objects/context you see."}`;

    const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKeysStr = process.env.GEMINI_API_KEYS || '';
    const API_KEYS = geminiKeysStr.split(',').filter(Boolean);

    let visionResult: any = null;
    let lastError: Error | null = null;

    // STEP 1: Groq Vision Processing
    if (groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.2-11b-vision-preview',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: visionPrompt },
                  { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageData}` } }
                ]
              }
            ],
            temperature: 0.1,
            max_tokens: 1024,
            response_format: { type: 'json_object' }
          })
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) {
            let clean = text.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            visionResult = JSON.parse(clean);
          }
        } else {
          const errBody = await groqRes.text();
          console.error("Groq vision failure:", errBody);
          lastError = new Error(`Groq API error ${groqRes.status}: ${errBody}`);
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    // Security Fix: Throw if vision AI fails entirely instead of simulating success.
    if (!visionResult) {
       console.error("Vision AI failed or returned invalid response.", lastError);
       return NextResponse.json({ error: 'AI Verification Service Unavailable.' }, { status: 503 });
    }

    // STEP 2: Gemini Text Generation
    let terminalLog = String(visionResult.raw_visual_description || `Action ${visionResult.action_verified ? 'verified' : 'rejected'} based on visual evidence.`);
    
    const textPrompt = `You are a robotic terminal analyzer for EcoPulse. An AI vision model analyzed a "${actionType}" claim.
Status: ${visionResult.action_verified ? 'VERIFIED' : 'REJECTED'}.
Visual evidence detected: "${visionResult.raw_visual_description}".
Generate a detailed, multi-sentence robotic-sounding terminal analysis (3-4 sentences) explaining exactly what was detected to justify the conclusion. Return ONLY the plain text log, no markdown.`;

    let geminiSuccess = false;
    for (const apiKey of API_KEYS) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: textPrompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 200 }
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const generatedLog = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedLog) {
            terminalLog = generatedLog.trim();
            geminiSuccess = true;
            break; // Success
          }
        }
      } catch (e) {
        // Silently fail and use fallback log
      }
    }
    
    if (!geminiSuccess) {
      console.warn("Gemini Text Generation failed, using raw description fallback.");
    }

    return NextResponse.json({
      action_verified: Boolean(visionResult.action_verified),
      confidence_score: Math.min(1, Math.max(0, Number(visionResult.confidence_score) || 0)),
      co2_delta_kg: Math.max(0, Number(visionResult.co2_delta_kg) || 0),
      eco_points: Math.max(0, Math.min(100, Math.round(Number(visionResult.eco_points) || 0))),
      terminal_log: terminalLog,
    });

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
