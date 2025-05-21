/**
 * Application configuration settings
 */

export const config = {
  /**
   * Controls whether user registration is enabled
   * This can be overridden by setting REGISTRATION_ENABLED environment variable
   */
  registrationEnabled: process.env.REGISTRATION_ENABLED === "true",
};
