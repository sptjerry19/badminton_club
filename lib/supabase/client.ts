import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { fetchWithLoading } from "./fetch-with-loading";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export function createBrowserClient() {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: { fetch: fetchWithLoading },
  });
}

export const supabase = createBrowserClient();
