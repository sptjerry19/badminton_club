import { NextRequest, NextResponse } from "next/server";

import { getHueSupabase } from "@/lib/hue/supabase";
import type { HueMemberRole } from "@/lib/hue/types";

const VALID_ROLES: HueMemberRole[] = [
  "truongdoan",
  "thuquy",
  "phonhay",
  "haucan",
  "thanhvien",
];

export async function GET() {
  const supabase = getHueSupabase();
  const { data, error } = await supabase
    .from("hue_trip_members")
    .select("id, name, role, ready, sort_order, created_at")
    .order("sort_order")
    .order("created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const readyCount = (data ?? []).filter((m) => m.ready).length;

  return NextResponse.json({
    members: data ?? [],
    stats: { total: data?.length ?? 0, ready: readyCount },
  });
}

type CreateMemberBody = {
  name?: string;
  role?: HueMemberRole;
  ready?: boolean;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateMemberBody;
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "name là bắt buộc" }, { status: 400 });
  }

  const role = body.role ?? "thanhvien";
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "role không hợp lệ" }, { status: 400 });
  }

  const supabase = getHueSupabase();

  const { data: lastMember } = await supabase
    .from("hue_trip_members")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (lastMember?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("hue_trip_members")
    .insert({
      name,
      role,
      ready: body.ready ?? false,
      sort_order: sortOrder,
    })
    .select("id, name, role, ready, sort_order, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ member: data }, { status: 201 });
}
