// Public Google OAuth client ID — safe to ship to the browser
// (the secret never leaves the Google Console).
//
// Override at build time with VITE_GOOGLE_CLIENT_ID if you need to swap envs.
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '439526392797-9542slverdtc78br5q46s3etj84rvb0a.apps.googleusercontent.com'
