import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return createClient<Database>(supabaseUrl, supabaseKey);
}
