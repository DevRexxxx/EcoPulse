// This file exists solely to prevent Next.js from throwing build errors.
// Next.js static exports (output: 'export') allow static GET route handlers.
// The actual AI verification is handled entirely client-side via Groq/Gemini.

export const dynamic = 'force-static';

export async function GET() {
  return Response.json({
    status: 'deprecated',
    message: 'Verification is now handled completely client-side. See AIVerificationModal.tsx'
  });
}
