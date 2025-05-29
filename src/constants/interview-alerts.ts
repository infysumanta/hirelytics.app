export const INTERVIEW_ALERTS = {
  CAMERA_OFF: 'Please turn on your camera to continue with the interview',
  MICROPHONE_OFF: 'Please turn on your microphone to continue with the interview',
  TAB_SWITCH: 'Please stay on this tab during the interview',
  WINDOW_SWITCH: 'Please keep this window focused during the interview',
} as const;

export const DEVICE_CHECK_STATES = {
  CAMERA_ENABLED: 'camera_enabled',
  MIC_ENABLED: 'mic_enabled',
  TAB_FOCUSED: 'tab_focused',
  WINDOW_FOCUSED: 'window_focused',
} as const;
