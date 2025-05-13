/* eslint-disable @typescript-eslint/no-explicit-any */
import { JobApplication } from "@/models/job-application";
import { getMongoConnectionStatus } from "./mongodb-debug";

/**
 * Helper to safely update MongoDB document with retry mechanism
 * @param applicationId Application ID to update
 * @param updateObj MongoDB update object
 * @param options Options including retry count and logging
 * @returns Updated document or null if failed
 */
export async function safeMongoUpdate(
  applicationId: string,
  updateObj: any,
  options = { retries: 1, logPrefix: "[MongoDB]" },
): Promise<any> {
  try {
    console.log(
      `${options.logPrefix} Attempting MongoDB update with retries:`,
      options.retries,
    );

    const result = await JobApplication.findByIdAndUpdate(
      applicationId,
      updateObj,
      { new: true },
    );

    if (!result) {
      console.error(`${options.logPrefix} Update returned null result`, {
        applicationId,
      });
      return null;
    }

    // Verify the update by checking connection status and result
    const connectionStatus = getMongoConnectionStatus();
    console.log(
      `${options.logPrefix} Connection status after update:`,
      connectionStatus,
    );
    console.log(`${options.logPrefix} Update successful, document returned`);

    return result;
  } catch (error: any) {
    console.error(`${options.logPrefix} Error during MongoDB update:`, {
      errorName: error.name,
      errorMessage: error.message,
      applicationId,
    });

    if (options.retries > 0) {
      console.log(`${options.logPrefix} Retrying update...`);
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 500));
      return safeMongoUpdate(applicationId, updateObj, {
        ...options,
        retries: options.retries - 1,
      });
    }

    throw error;
  }
}
