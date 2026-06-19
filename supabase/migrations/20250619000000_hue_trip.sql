-- Hue trip planner: homestay voting + member management

CREATE TYPE hue_member_role AS ENUM (
  'truongdoan',
  'thuquy',
  'phonhay',
  'haucan',
  'thanhvien'
);

CREATE TABLE hue_homestays (
  slug text PRIMARY KEY,
  title text NOT NULL,
  image_url text,
  price_per_person int,
  capacity int,
  description text,
  booking_url text,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE hue_homestay_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homestay_slug text NOT NULL REFERENCES hue_homestays (slug) ON DELETE CASCADE,
  voter_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (voter_name)
);

CREATE TABLE hue_trip_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role hue_member_role NOT NULL DEFAULT 'thanhvien',
  ready boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX hue_homestay_votes_slug_idx ON hue_homestay_votes (homestay_slug);
CREATE INDEX hue_trip_members_sort_idx ON hue_trip_members (sort_order);

INSERT INTO hue_homestays (slug, title, image_url, price_per_person, capacity, description, booking_url, sort_order)
VALUES
  (
    'othuys-house',
    'OThuy''s House in Hue',
    'https://cf.bstatic.com/xdata/images/hotel/max1024x768/847472946.jpg?k=e5c10052e0590a2c0e0d1e2173004422420587f29dfad9e2e3c07f9b1fbe0b62&o=',
    302000,
    11,
    'Nơi đây còn có phòng tắm riêng với vòi xịt/chậu rửa vệ sinh ở tất cả các căn, cùng đồ vệ sinh cá nhân miễn phí, máy sấy tóc và dép đi trong phòng.',
    'https://www.booking.com/hotel/vn/othuys-house-in-hue.vi.html',
    1
  ),
  (
    'thuong-apartment-1',
    'Thương Apartment 1',
    'https://cf.bstatic.com/xdata/images/hotel/max1024x768/725164598.jpg?k=8f2b54dbcc5903a4104e34f144096f1093f9af89a566a366dcc93fda8fd2085c&o=',
    460000,
    10,
    'Căn hộ dịch vụ tiện lợi với chi phí rẻ nhất danh sách. Phòng ốc trang trí hiện đại, sạch sẽ và rất gần các quán bún bò Bà Gái ăn sáng.',
    'https://www.booking.com/hotel/vn/thuong-apartment-1.vi.html',
    2
  ),
  (
    'thuong-apartment',
    'Thương Apartment',
    'https://cf.bstatic.com/xdata/images/hotel/max1024x768/632018193.jpg?k=6f6d3d55887c2e8a8765393094bec71de1cdeba0619ae3e98a5d9ca6f9ca126a&o=',
    460000,
    10,
    'Không gian căn hộ rộng thoáng hơn, có phòng khách chung sinh hoạt tiện lợi cho nhóm 10 người cùng uống trà hay ăn bánh ép Huế nói chuyện buổi tối.',
    'https://www.booking.com/hotel/vn/em-apartment-thanh-pho-hue.vi.html',
    3
  ),
  (
    'nera-home',
    'Nera Home, An apartment',
    'https://cf.bstatic.com/xdata/images/hotel/max1024x768/604152681.jpg?k=f9ca209bb62aabce98e5e8b67ae009d6f2fa1b32cce51e81ae4955c5cf74a7e6&o=',
    367000,
    10,
    'Căn hộ thiết kế hiện đại, tọa lạc trong khu chung cư cao cấp. Vị trí an ninh tốt, gần trung tâm và đầy đủ đồ dùng làm bếp cơ bản.',
    'https://www.booking.com/hotel/vn/nera-home-an-apartment-hue.vi.html',
    4
  ),
  (
    'co-do-homestay',
    'Cố Đô Homestay',
    'https://cf.bstatic.com/xdata/images/hotel/max1024x768/706462114.jpg?k=44981fae8ea54e3adc8a7c9b298c5be5ce26b86d2a5f8126f9318c7cb5e48de6&o=',
    370000,
    10,
    'Cực kỳ xinh xắn, thiết kế sang trọng bắt mắt và đầy đủ góc sống ảo cho cả đoàn.',
    'https://www.booking.com/hotel/vn/co-do-homestay-thanh-pho-hue2.vi.html',
    5
  ),
  (
    'hien-apartment',
    'Hiền Apartment',
    'https://cf.bstatic.com/xdata/images/hotel/max1024x768/873759857.jpg?k=230999644739071184e0ad55701f5f90411fe483ae35b3ba0d34372f70c2efc1&o=',
    420000,
    10,
    'Căn hộ ấm cúng có vị trí trung tâm vô cùng đắc địa, thuận tiện di chuyển đến bến xe, phố đi bộ Nguyễn Đình Chiểu và các quán ăn hến đập đá.',
    'https://www.booking.com/hotel/vn/hien-apartment.vi.html',
    6
  );

INSERT INTO hue_trip_members (name, role, ready, sort_order)
VALUES
  ('Phạm Duy Linh', 'truongdoan', true, 1),
  ('Lê Phương Thảo', 'thuquy', true, 2),
  ('Nguyễn Quỳnh Chi', 'phonhay', true, 3),
  ('Đỗ Thị Ngọc Anh', 'thanhvien', true, 4),
  ('Nguyễn Quang Nhật', 'haucan', true, 5),
  ('Vũ Lê Cử', 'haucan', true, 6),
  ('Trịnh Ngọc Khuê', 'thanhvien', true, 7),
  ('Khánh Loan', 'thanhvien', true, 8),
  ('Thanh Nhàn', 'thanhvien', false, 9),
  ('Nguyễn Hoàng Bảo Ngân', 'thanhvien', false, 10),
  ('Phan Trà My', 'thanhvien', false, 11),
  ('HT Đạt', 'thanhvien', false, 12),
  ('Người nhà Chi Ng', 'thanhvien', true, 13),
  ('Phạm Kim Chi', 'thanhvien', true, 14),
  ('Hoàng Yến', 'thanhvien', true, 15);

ALTER TABLE hue_homestays ENABLE ROW LEVEL SECURITY;
ALTER TABLE hue_homestay_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hue_trip_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_hue_homestays" ON hue_homestays FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_hue_homestay_votes" ON hue_homestay_votes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_hue_trip_members" ON hue_trip_members FOR ALL TO anon USING (true) WITH CHECK (true);
