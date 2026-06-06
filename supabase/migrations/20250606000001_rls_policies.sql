-- RLS policies for avatar-based auth (no Supabase Auth)
-- Safe to re-run: drops existing policies first.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- users
DROP POLICY IF EXISTS "anon_select_users" ON users;
DROP POLICY IF EXISTS "anon_insert_users" ON users;
DROP POLICY IF EXISTS "anon_update_users" ON users;
DROP POLICY IF EXISTS "anon_delete_users" ON users;
CREATE POLICY "anon_select_users" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_users" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_users" ON users FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_users" ON users FOR DELETE TO anon USING (true);

-- venues
DROP POLICY IF EXISTS "anon_all_venues" ON venues;
CREATE POLICY "anon_all_venues" ON venues FOR ALL TO anon USING (true) WITH CHECK (true);

-- tournaments
DROP POLICY IF EXISTS "anon_all_tournaments" ON tournaments;
CREATE POLICY "anon_all_tournaments" ON tournaments FOR ALL TO anon USING (true) WITH CHECK (true);

-- tournament_members
DROP POLICY IF EXISTS "anon_all_tournament_members" ON tournament_members;
CREATE POLICY "anon_all_tournament_members" ON tournament_members FOR ALL TO anon USING (true) WITH CHECK (true);

-- matches
DROP POLICY IF EXISTS "anon_all_matches" ON matches;
CREATE POLICY "anon_all_matches" ON matches FOR ALL TO anon USING (true) WITH CHECK (true);

-- team_requests
DROP POLICY IF EXISTS "anon_all_team_requests" ON team_requests;
CREATE POLICY "anon_all_team_requests" ON team_requests FOR ALL TO anon USING (true) WITH CHECK (true);

-- evaluations
DROP POLICY IF EXISTS "anon_all_evaluations" ON evaluations;
CREATE POLICY "anon_all_evaluations" ON evaluations FOR ALL TO anon USING (true) WITH CHECK (true);

-- payments
DROP POLICY IF EXISTS "anon_all_payments" ON payments;
CREATE POLICY "anon_all_payments" ON payments FOR ALL TO anon USING (true) WITH CHECK (true);
