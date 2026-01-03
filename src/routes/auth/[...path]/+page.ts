/**
 * Auth page configuration
 *
 * Disable SSR for auth pages since they are client-side only forms.
 * This prevents issues with the auth client during server-side rendering.
 */

// Disable SSR - auth forms are entirely client-side
export const ssr = false;
