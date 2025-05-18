import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { serverTextToSpeech } from "@/lib/deepgram-tts";

// Schema validation for request body
const ttsRequestSchema = z.object({
  text: z.string().max(2000), // Deepgram has a 2000 character limit
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const { text } = ttsRequestSchema.parse(body);

    // Convert text to speech
    const audioBuffer = await serverTextToSpeech(text);

    if (!audioBuffer) {
      return NextResponse.json(
        { error: "Failed to generate speech" },
        { status: 500 },
      );
    }

    // Return the audio data
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("Error in text-to-speech endpoint:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process request",
      },
      { status: 400 },
    );
  }
}
