import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Deepgram API key is not configured" },
        { status: 500 },
      );
    }

    // Test the Deepgram API with a minimal request
    try {
      const response = await fetch(
        "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${apiKey}`,
          },
          body: JSON.stringify({
            text: "API test successful",
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Deepgram API error (${response.status}): ${errorText}`,
        );
      }

      return NextResponse.json({
        success: true,
        message: "Deepgram API is configured correctly and working",
      });
    } catch (apiError) {
      return NextResponse.json(
        {
          success: false,
          error: `Deepgram API test failed: ${
            apiError instanceof Error ? apiError.message : String(apiError)
          }`,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error checking Deepgram API key:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check Deepgram API key" },
      { status: 500 },
    );
  }
}
