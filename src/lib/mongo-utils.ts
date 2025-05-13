/* eslint-disable @typescript-eslint/no-explicit-any */
import { JobApplication } from "@/models/job-application";

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
    const result = await JobApplication.findByIdAndUpdate(
      applicationId,
      updateObj,
      { new: true },
    );

    if (!result) {
      console.error(`${options.logPrefix} Update failed for application`, {
        applicationId,
      });
      return null;
    }

    return result;
  } catch (error: any) {
    console.error(`${options.logPrefix} Error during MongoDB update:`, {
      error: error.message,
      applicationId,
    });

    if (options.retries > 0) {
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
