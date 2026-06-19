import { NextRequest, NextResponse } from "next/server";

import { getHueSupabase } from "@/lib/hue/supabase";

type VoteBody = {
  voterName?: string;
  homestaySlug?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as VoteBody;
  const voterName = body.voterName?.trim();
  const homestaySlug = body.homestaySlug?.trim();

  if (!voterName || !homestaySlug) {
    return NextResponse.json(
      { error: "voterName và homestaySlug là bắt buộc" },
      { status: 400 },
    );
  }

  const supabase = getHueSupabase();

  const { data: homestay, error: homestayError } = await supabase
    .from("hue_homestays")
    .select("slug")
    .eq("slug", homestaySlug)
    .maybeSingle();

  if (homestayError) {
    return NextResponse.json({ error: homestayError.message }, { status: 500 });
  }
  if (!homestay) {
    return NextResponse.json({ error: "Homestay không tồn tại" }, { status: 404 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("hue_homestay_votes")
    .select("id")
    .eq("voter_name", voterName)
    .eq("homestay_slug", homestaySlug)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing) {
    const { error } = await supabase
      .from("hue_homestay_votes")
      .delete()
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ voted: false, homestaySlug });
  }

  const { data, error } = await supabase
    .from("hue_homestay_votes")
    .insert({ voter_name: voterName, homestay_slug: homestaySlug })
    .select("id, homestay_slug, voter_name, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ voted: true, vote: data });
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json()) as VoteBody;
  const voterName = body.voterName?.trim();
  const homestaySlug = body.homestaySlug?.trim();

  if (!voterName) {
    return NextResponse.json({ error: "voterName là bắt buộc" }, { status: 400 });
  }

  const supabase = getHueSupabase();
  let query = supabase.from("hue_homestay_votes").delete().eq("voter_name", voterName);

  if (homestaySlug) {
    query = query.eq("homestay_slug", homestaySlug);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
