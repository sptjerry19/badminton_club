"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types";

interface PlayerSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  players: User[];
}

export function PlayerSelect({
  label,
  value,
  onChange,
  players,
}: PlayerSelectProps) {
  const selectedName = players.find((u) => u.id === value)?.name;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value || null} onValueChange={(v) => onChange(v ?? "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn cầu thủ">
            {selectedName}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {players.length === 0 ? (
            <SelectItem value="__empty__" disabled>
              Không còn cầu thủ khả dụng
            </SelectItem>
          ) : (
            players.map((u) => (
              <SelectItem key={u.id} value={u.id} label={u.name}>
                {u.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
