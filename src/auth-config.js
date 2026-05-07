export const authConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
};

// For Vite deploys, you can also provide VITE_AUTH_KEY as the anon key.
// In Next.js, prefix public values with NEXT_PUBLIC_ so they are exposed to the browser.
