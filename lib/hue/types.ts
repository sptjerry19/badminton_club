export type HueMemberRole =
  | "truongdoan"
  | "thuquy"
  | "phonhay"
  | "haucan"
  | "thanhvien";

export type HueHomestay = {
  slug: string;
  title: string;
  image_url: string | null;
  price_per_person: number | null;
  capacity: number | null;
  description: string | null;
  booking_url: string | null;
  sort_order: number;
  vote_count: number;
  voters: string[];
};

export type HueTripMember = {
  id: string;
  name: string;
  role: HueMemberRole;
  ready: boolean;
  sort_order: number;
  created_at: string;
};

export type HueHomestayVote = {
  id: string;
  homestay_slug: string;
  voter_name: string;
  created_at: string;
};
