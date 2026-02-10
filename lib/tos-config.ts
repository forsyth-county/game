// Terms of Service Notification Configuration
// Set this flag to false to completely disable the TOS notification feature
// When disabled, no notification will appear and no related code will run
export const ENABLE_TOS_NOTIFICATION = false;

// Configuration for the Terms of Service notification
export const TOS_CONFIG = {
  // localStorage key to track if user has accepted TOS
  STORAGE_KEY: 'tos_accepted',
  
  // URL for the Terms of Service page
  TOS_URL: 'https://forsyth-county.github.io/portal/terms',
  
  // Message displayed in the notification
  MESSAGE: 'Hey there and welcome! Please read our terms of service before continuing on this website.',
  
  // Link text for the TOS hyperlink
  LINK_TEXT: 'terms of service'
} as const;
