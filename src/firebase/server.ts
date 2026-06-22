
import { initializeApp, getApps, App } from 'firebase-admin/app';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export async function initializeServerApp(): Promise<App> {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
  // for authentication, which is automatically set in the App Hosting environment.
  const app = initializeApp();
  
  return app;
}
