/**
 * Utility function to convert text to speech using Deepgram API
 * Returns audio data and handles error cases
 */
export async function textToSpeech(text: string): Promise<{
  success: boolean;
  audioUrl?: string;
  error?: string;
}> {
  try {
    // Limit text to 2000 characters as per Deepgram's limit
    const limitedText = text.substring(0, 2000);

    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      throw new Error("Deepgram API key is missing");
    }

    // Updated URL format with model query parameter
    const response = await fetch(
      "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({
          text: limitedText,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepgram API error (${response.status}): ${errorText}`);
    }

    // Get the audio data as blob
    const audioBlob = await response.blob();

    // Create a URL for the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      success: true,
      audioUrl,
    };
  } catch (error) {
    console.error("Text-to-speech conversion failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Server-side function to convert text to speech using Deepgram API
 * Used in API routes
 */
export async function serverTextToSpeech(text: string): Promise<Buffer | null> {
  try {
    // Limit text to 2000 characters as per Deepgram's limit
    const limitedText = text.substring(0, 2000);

    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      throw new Error("Deepgram API key is missing");
    }

    // Updated URL format with model query parameter
    const response = await fetch(
      "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({
          text: limitedText,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepgram API error (${response.status}): ${errorText}`);
    }

    // Get the audio data as array buffer
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Server text-to-speech conversion failed:", error);
    return null;
  }
}
