/* eslint-disable @typescript-eslint/no-explicit-any */
// Utility functions for debugging MongoDB chat history issues

// Log detailed information about the chat history update process
export function logChatHistoryDebug(
  prefix: string,
  data: any,
  options?: { detailed?: boolean },
) {
  console.log(`${prefix} Debug info:`, {
    timestamp: new Date().toISOString(),
    chatHistoryLength: data?.updatedChatHistory?.length || 0,
    dbUpdateSuccess: !!data?.updatedChatHistory,
    ...data?.debug,
  });

  if (options?.detailed && data?.updatedChatHistory) {
    console.log(
      `${prefix} Last 2 messages:`,
      data.updatedChatHistory.slice(-2).map((msg: any) => ({
        sender: msg.sender,
        text: msg.text?.substring(0, 20) + "...",
        timestamp: msg.timestamp,
      })),
    );
  }
}

// Log MongoDB connection issues
export function logMongoConnectionIssue(error: Error) {
  console.error("MongoDB Connection Issue:", {
    errorName: error.name,
    errorMessage: error.message,
    errorStack: error.stack,
    timestamp: new Date().toISOString(),
  });
}
