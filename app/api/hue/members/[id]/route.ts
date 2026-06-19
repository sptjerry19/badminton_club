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

type UpdateMemberBody = {
  name?: string;
  role?: HueMemberRole;
  ready?: boolean;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = (await request.json()) as UpdateMemberBody;
  const updates: UpdateMemberBody = {};

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "name không được rỗng" }, { status: 400 });
    }
    updates.name = name;
  }

  if (body.role !== undefined) {
    if (!VALID_ROLES.includes(body.role)) {
      return NextResponse.json({ error: "role không hợp lệ" }, { status: 400 });
    }
    updates.role = body.role;
  }

  if (body.ready !== undefined) {
    updates.ready = Boolean(body.ready);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Không có trường nào để cập nhật" }, { status: 400 });
  }

  const supabase = getHueSupabase();
  const { data, error } = await supabase
    .from("hue_trip_members")
    .update(updates)
    .eq("id", params.id)
    .select("id, name, role, ready, sort_order, created_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Thành viên không tồn tại" }, { status: 404 });
  }

  return NextResponse.json({ member: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = getHueSupabase();
  const { data, error } = await supabase
    .from("hue_trip_members")
    .delete()
    .eq("id", params.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Thành viên không tồn tại" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
