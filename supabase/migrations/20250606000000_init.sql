-- Badminton Club Manager — initial schema + seed
-- Run: npx supabase db push  OR paste in Supabase SQL Editor

CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE tournament_format AS ENUM ('singles', 'doubles', 'mixed');
CREATE TYPE tournament_status AS ENUM ('upcoming', 'ongoing', 'finished');
CREATE TYPE member_status AS ENUM ('confirmed', 'pending', 'withdrew');
CREATE TYPE match_status AS ENUM ('scheduled', 'ongoing', 'finished');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE payment_status AS ENUM ('unpaid', 'partial', 'paid');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text,
  avatar_emoji text,
  role user_role NOT NULL DEFAULT 'member',
  level text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  courts_count int,
  price_per_hour decimal,
  notes text
);

CREATE TABLE tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  venue_id uuid REFERENCES venues(id) ON DELETE SET NULL,
  date date,
  format tournament_format,
  prize_description text,
  status tournament_status NOT NULL DEFAULT 'upcoming',
  fee_per_person decimal,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE tournament_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at timestamptz NOT NULL DEFAULT now(),
  status member_status NOT NULL DEFAULT 'pending',
  UNIQUE (tournament_id, user_id)
);

CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round text,
  team1_player1_id uuid REFERENCES users(id) ON DELETE SET NULL,
  team1_player2_id uuid REFERENCES users(id) ON DELETE SET NULL,
  team2_player1_id uuid REFERENCES users(id) ON DELETE SET NULL,
  team2_player2_id uuid REFERENCES users(id) ON DELETE SET NULL,
  team1_score int DEFAULT 0,
  team2_score int DEFAULT 0,
  status match_status NOT NULL DEFAULT 'scheduled',
  played_at timestamptz,
  notes text
);

CREATE TABLE team_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status request_status NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluated_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tournament_id uuid REFERENCES tournaments(id) ON DELETE SET NULL,
  score int CHECK (score >= 1 AND score <= 5),
  comment text,
  criteria jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tournament_id uuid REFERENCES tournaments(id) ON DELETE SET NULL,
  amount decimal NOT NULL DEFAULT 0,
  paid_amount decimal NOT NULL DEFAULT 0,
  description text,
  due_date date,
  status payment_status NOT NULL DEFAULT 'unpaid',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE team_requests;

CREATE INDEX idx_tournament_members_user ON tournament_members(user_id);
CREATE INDEX idx_tournament_members_tournament ON tournament_members(tournament_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_team_requests_tournament ON team_requests(tournament_id);
CREATE INDEX idx_team_requests_partner ON team_requests(partner_id);
CREATE INDEX idx_payments_user ON payments(user_id);

-- Seed demo users (avatar login)
INSERT INTO users (name, avatar_emoji, role, level) VALUES
  ('Admin Club', '👑', 'admin', 'A'),
  ('Minh Anh', '🏸', 'member', 'A'),
  ('Hoàng Long', '💪', 'member', 'B'),
  ('Thu Hà', '⭐', 'member', 'B'),
  ('Quốc Bảo', '🎯', 'member', 'C'),
  ('Lan Chi', '🌸', 'member', 'C');
