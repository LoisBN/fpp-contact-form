import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are configured
export function getConfigStatus(): {
  isConfigured: boolean;
  missingVars: string[];
  hints: string[];
} {
  const missingVars: string[] = [];
  const hints: string[] = [];

  if (!supabaseUrl) {
    missingVars.push("VITE_SUPABASE_URL");
    hints.push("Add your Supabase project URL (found in Project Settings → API)");
  }

  if (!supabaseAnonKey) {
    missingVars.push("VITE_SUPABASE_ANON_KEY");
    hints.push("Add your Supabase anon/public key (found in Project Settings → API)");
  }

  return {
    isConfigured: missingVars.length === 0,
    missingVars,
    hints,
  };
}

// Create client only if configured (avoids runtime errors)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Test the actual connection to Supabase
export async function testConnection(): Promise<{
  success: boolean;
  error?: string;
  hint?: string;
}> {
  if (!supabase) {
    return {
      success: false,
      error: "Supabase client not initialized",
      hint: "Configure your environment variables first",
    };
  }

  try {
    // Try to query the contacts table to verify it exists
    const { error } = await supabase.from("contacts").select("id").limit(1);

    if (error) {
      // Parse common Supabase errors with helpful messages
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        return {
          success: false,
          error: "Table 'contacts' not found",
          hint: "Create a 'contacts' table in your Supabase dashboard with columns: id, name, email, message, created_at",
        };
      }

      if (error.message.includes("JWT")) {
        return {
          success: false,
          error: "Invalid API key",
          hint: "Double-check your VITE_SUPABASE_ANON_KEY - it should be the 'anon public' key",
        };
      }

      if (error.code === "PGRST301") {
        return {
          success: false,
          error: "Row Level Security (RLS) blocking access",
          hint: "Either disable RLS on the contacts table or add a policy allowing inserts",
        };
      }

      return {
        success: false,
        error: error.message,
        hint: "Check your Supabase dashboard for more details",
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      hint: "Check if your Supabase URL is correct and the project is active",
    };
  }
}

// Insert a contact with detailed error handling
export async function insertContact(data: {
  name: string;
  email: string;
  message: string;
}): Promise<{
  success: boolean;
  error?: string;
  hint?: string;
}> {
  if (!supabase) {
    return {
      success: false,
      error: "Supabase not configured",
      hint: "Set up your environment variables in .env file",
    };
  }

  try {
    const { error } = await supabase.from("contacts").insert([data]);

    if (error) {
      if (error.code === "42501" || error.message.includes("RLS")) {
        return {
          success: false,
          error: "Permission denied by Row Level Security",
          hint: "Add an INSERT policy to your contacts table: CREATE POLICY \"Allow inserts\" ON contacts FOR INSERT WITH CHECK (true);",
        };
      }

      if (error.code === "23505") {
        return {
          success: false,
          error: "Duplicate entry",
          hint: "This email may already be registered",
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save contact",
    };
  }
}
