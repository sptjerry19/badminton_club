import { NextRequest, NextResponse } from "next/server";

import { getHueSupabase } from "@/lib/hue/supabase";
import type { HueHomestay } from "@/lib/hue/types";

export async function GET(request: NextRequest) {
  const voterName = request.nextUrl.searchParams.get("voterName")?.trim();

  const supabase = getHueSupabase();

  const [{ data: homestays, error: homestayError }, { data: votes, error: voteError }] =
    await Promise.all([
      supabase.from("hue_homestays").select("*").order("sort_order"),
      supabase.from("hue_homestay_votes").select("homestay_slug, voter_name"),
    ]);

  if (homestayError) {
    return NextResponse.json({ error: homestayError.message }, { status: 500 });
  }
  if (voteError) {
    return NextResponse.json({ error: voteError.message }, { status: 500 });
  }

  const voteMap = new Map<string, string[]>();
  for (const vote of votes ?? []) {
    const list = voteMap.get(vote.homestay_slug) ?? [];
    list.push(vote.voter_name);
    voteMap.set(vote.homestay_slug, list);
  }

  const result: HueHomestay[] = (homestays ?? []).map((h) => {
    const voters = voteMap.get(h.slug) ?? [];
    return {
      ...h,
      vote_count: voters.length,
      voters,
    };
  });

  let myVotes: string[] = [];
  if (voterName) {
    myVotes = (votes ?? [])
      .filter((v) => v.voter_name === voterName)
      .map((v) => v.homestay_slug);
  }

  return NextResponse.json({ homestays: result, myVotes });
}
