-- Allow multiple homestay votes per voter (one vote per homestay)

ALTER TABLE hue_homestay_votes
  DROP CONSTRAINT IF EXISTS hue_homestay_votes_voter_name_key;

ALTER TABLE hue_homestay_votes
  ADD CONSTRAINT hue_homestay_votes_voter_homestay_key
  UNIQUE (voter_name, homestay_slug);
