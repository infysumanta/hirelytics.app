"use client";

/**
 * Utility to manage interview session state persistence across page refreshes
 */
export const SessionStateManager = {
  /**
   * Save the current interview state to session storage
   */
  saveState: (
    applicationId: string,
    state: {
      isUserTurn: boolean;
      lastMsgId?: string;
      lastActivity?: number;
    },
  ) => {
    try {
      if (typeof sessionStorage !== "undefined") {
        const stateKey = `interview_state_${applicationId}`;
        sessionStorage.setItem(
          stateKey,
          JSON.stringify({
            ...state,
            lastActivity: Date.now(), // Add timestamp to track staleness
          }),
        );
        console.log("[Session State] Saved state:", state);
      }
    } catch (e) {
      console.error("[Session State] Error saving state:", e);
    }
  },

  /**
   * Load interview state from session storage
   */
  loadState: (applicationId: string) => {
    try {
      if (typeof sessionStorage !== "undefined") {
        const stateKey = `interview_state_${applicationId}`;
        const stateJson = sessionStorage.getItem(stateKey);

        if (stateJson) {
          const state = JSON.parse(stateJson);

          // Check if state is stale (older than 1 hour)
          const staleThreshold = 60 * 60 * 1000; // 1 hour
          const isStale =
            Date.now() - (state.lastActivity || 0) > staleThreshold;

          if (isStale) {
            console.log("[Session State] State is stale, clearing");
            sessionStorage.removeItem(stateKey);
            return null;
          }

          console.log("[Session State] Loaded state:", state);
          return state;
        }
      }
    } catch (e) {
      console.error("[Session State] Error loading state:", e);
    }

    return null;
  },

  /**
   * Clear interview state from session storage
   */
  clearState: (applicationId: string) => {
    try {
      if (typeof sessionStorage !== "undefined") {
        const stateKey = `interview_state_${applicationId}`;
        sessionStorage.removeItem(stateKey);
        console.log("[Session State] Cleared state");
      }
    } catch (e) {
      console.error("[Session State] Error clearing state:", e);
    }
  },
};
