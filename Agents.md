# Badminton Club Manager — Full-stack Web App

## Tổng quan dự án
Xây dựng một web app quản lý câu lạc bộ cầu lông, deploy trực tiếp trên Vercel, 
không yêu cầu đăng nhập bằng mật khẩu. Giao diện chọn avatar giống Netflix.

---

## Tech Stack yêu cầu
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS + shadcn/ui
- Database: Supabase (PostgreSQL + Realtime)
- State Management: Zustand
- Deploy: Vercel (zero-config)
- Auth: Custom avatar-based session (localStorage + Supabase)

---

## Kiến trúc hệ thống

### Authentication Flow (Kiểu Netflix)
- Truy cập trang web → Hiển thị danh sách avatar + tên thành viên
- Người dùng click vào avatar của mình → Vào thẳng app (không cần PIN/mật khẩu)
- Session lưu trong localStorage
- Admin có avatar riêng với role="admin" trong DB
- Không có form đăng ký — Admin tạo tài khoản thành viên

### Phân quyền
- Route /admin/* → Chỉ role="admin" được truy cập, redirect nếu không đủ quyền
- Route /app/* → Tất cả thành viên đã chọn avatar

---

## Database Schema (Supabase)

### Bảng users
- id (uuid, PK)
- name (text)
- avatar_url (text) — URL ảnh avatar
- avatar_emoji (text) — fallback emoji nếu không có ảnh
- role (enum: 'admin' | 'member')
- level (text) — xếp hạng kỹ năng: A/B/C hoặc tùy chỉnh
- created_at (timestamp)

### Bảng venues (sân thi đấu)
- id (uuid, PK)
- name (text)
- address (text)
- courts_count (int) — số sân
- price_per_hour (decimal)
- notes (text)

### Bảng tournaments (giải đấu)
- id (uuid, PK)
- name (text)
- venue_id (FK → venues)
- date (date)
- format (enum: 'singles' | 'doubles' | 'mixed')
- prize_description (text) — mô tả giải thưởng
- status (enum: 'upcoming' | 'ongoing' | 'finished')
- fee_per_person (decimal)
- created_by (FK → users)

### Bảng tournament_members (danh sách tham dự)
- id (uuid, PK)
- tournament_id (FK → tournaments)
- user_id (FK → users)
- registered_at (timestamp)
- status (enum: 'confirmed' | 'pending' | 'withdrew')

### Bảng matches (trận đấu)
- id (uuid, PK)
- tournament_id (FK → tournaments)
- round (text) — "Vòng 1", "Bán kết", "Chung kết"...
- team1_player1_id (FK → users)
- team1_player2_id (FK → users, nullable — singles)
- team2_player1_id (FK → users)
- team2_player2_id (FK → users, nullable)
- team1_score (int)
- team2_score (int)
- status (enum: 'scheduled' | 'ongoing' | 'finished')
- played_at (timestamp)
- notes (text)

### Bảng team_requests (yêu cầu ghép đôi)
- id (uuid, PK)
- tournament_id (FK → tournaments)
- requester_id (FK → users)
- partner_id (FK → users)
- status (enum: 'pending' | 'accepted' | 'rejected')
- message (text)
- created_at (timestamp)

### Bảng evaluations (đánh giá thành viên)
- id (uuid, PK)
- evaluator_id (FK → users) — admin
- evaluated_user_id (FK → users)
- tournament_id (FK → tournaments, nullable)
- score (int 1–5)
- comment (text)
- criteria (json) — {technique: 3, teamwork: 4, attitude: 5}
- created_at (timestamp)

### Bảng payments (công nợ & thanh toán)
- id (uuid, PK)
- user_id (FK → users)
- tournament_id (FK → tournaments, nullable)
- amount (decimal) — số tiền phát sinh
- paid_amount (decimal) — đã thanh toán
- description (text)
- due_date (date)
- status (enum: 'unpaid' | 'partial' | 'paid')
- created_at (timestamp)

---

## Danh sách màn hình & chức năng

### SHARED SCREENS

#### Screen: Trang chọn avatar (/)
- Hiển thị grid các avatar thành viên (kiểu Netflix)
- Click vào avatar → set session → redirect theo role
- Responsive: 3 cột mobile, 5-6 cột desktop
- Animation: hover scale, glow khi được chọn

---

### ADMIN SCREENS (/admin/*)

#### Screen: Admin Dashboard (/admin)
- Thống kê nhanh: Tổng thành viên, giải đang diễn ra, tổng nợ chưa thanh toán
- Danh sách giải đấu gần nhất (status badges)
- Shortcut buttons đến các tác vụ thường dùng

#### Screen: Quản lý sân thi đấu (/admin/venues)
- List tất cả sân với thông tin: tên, địa chỉ, số sân, giá/giờ
- CRUD: Thêm mới / Chỉnh sửa / Xóa sân
- Form fields: Tên sân, địa chỉ, số lượng sân con, giá thuê, ghi chú

#### Screen: Quản lý giải đấu (/admin/tournaments)
- List giải đấu, lọc theo status (upcoming/ongoing/finished)
- Tạo giải mới: tên, chọn sân, ngày, thể thức, mô tả giải thưởng, phí tham dự
- Click vào giải → xem chi tiết

#### Screen: Chi tiết giải đấu (/admin/tournaments/[id])
Gồm các tab:
- Tab "Thành viên": Xem/thêm/xóa người tham dự, confirm status
- Tab "Trận đấu": Xem lịch thi đấu, nhập kết quả (score team1 vs team2), thay đổi status trận
- Tab "Đội hình": Xem team_requests đang pending, duyệt/từ chối ghép đôi
- Tab "Giải thưởng": Mô tả giải thưởng, nhập người đoạt giải

#### Screen: Quản lý thành viên (/admin/members)
- List tất cả thành viên: avatar, tên, level, số giải đã tham gia
- Thêm thành viên mới: nhập tên, chọn avatar (emoji hoặc upload ảnh), set role
- Click vào thành viên → xem profile chi tiết

#### Screen: Đánh giá thành viên (/admin/evaluations)
- Chọn thành viên → Nhập đánh giá (điểm 1-5, tiêu chí, nhận xét)
- Xem lịch sử đánh giá của từng người
- Filter theo giải đấu

#### Screen: Quản lý tài chính (/admin/finance)
- Bảng tổng hợp: mỗi user 1 hàng, cột = tổng phát sinh / đã trả / còn nợ
- Click vào user → xem chi tiết từng khoản phí
- Nhập khoản phí mới (liên kết với giải hoặc độc lập)
- Ghi nhận thanh toán: nhập số tiền đã trả, tự động cập nhật status

---

### USER SCREENS (/app/*)

#### Screen: Trang chủ User (/app)
- Greeting với tên + avatar người dùng
- Upcoming matches của người này
- Số tiền còn nợ (nếu có — hiển thị nổi bật)
- Giải đang diễn ra

#### Screen: Giải đấu của tôi (/app/tournaments)
- Danh sách giải đấu mình tham dự
- Mỗi giải: tên, ngày, status, kết quả cá nhân (W/L record)
- Click vào → xem chi tiết

#### Screen: Chi tiết giải đấu — User view (/app/tournaments/[id])
- Thông tin giải: sân, ngày, thể thức, mô tả giải thưởng
- Lịch thi đấu + kết quả tất cả trận (không chỉ trận của mình)
- Bảng xếp hạng nếu có
- Tab "Đội của tôi": xem partner hiện tại

#### Screen: Ghép đôi / Chọn partner (/app/tournaments/[id]/team)
- Hiển thị danh sách thành viên tham dự giải này
- Mỗi người: avatar, tên, level, status (đã có partner / còn trống)
- Nút "Mời làm partner" → gửi team_request
- Xem lời mời đang chờ (từ người khác) → Accept / Decline
- Xem partner hiện tại của mình

#### Screen: Tài chính cá nhân (/app/finance)
- Tổng quan: tổng nợ / đã trả / còn lại
- List chi tiết từng khoản: mô tả, liên kết giải, số tiền, status
- Không có quyền tự chỉnh sửa — chỉ view

#### Screen: Profile của tôi (/app/profile)
- Avatar + tên
- Thống kê: số giải tham dự, W/L ratio
- Lịch sử đánh giá nhận được (chỉ xem điểm trung bình + nhận xét public)
- Không thể đổi tên/avatar — admin quản lý

---

## Yêu cầu UI/UX

### Design System
- Theme: Dark-first, với toggle light/dark
- Font: Geist (Next.js default) hoặc Inter
- Color accent: Xanh lá (giải đấu active) + Đỏ cam (cảnh báo nợ)
- Components: shadcn/ui cho forms, tables, dialogs
- Mobile-first responsive

### Avatar Selector (trang chọn nhân vật)
- Grid layout kiểu Netflix
- Hover: scale(1.08) + border glow
- Selected: checkmark overlay + ring highlight
- Loading skeleton khi fetch danh sách

### Realtime Updates
- Điểm số trận đấu cập nhật realtime (Supabase Realtime)
- Team request notification realtime

---

## Cấu trúc thư mục Next.js