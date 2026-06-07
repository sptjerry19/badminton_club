# ShuttlePro — Badminton Club Manager

Web app quản lý câu lạc bộ cầu lông: chọn avatar kiểu Netflix, admin quản lý giải/sân/thành viên, member xem lịch đấu và công nợ.

**Stack:** Next.js 14 · Tailwind v4 · shadcn/ui · Supabase · Zustand · Vercel

---

## Yêu cầu

- Node.js 18+
- Tài khoản [Supabase](https://supabase.com)
- Tài khoản [Vercel](https://vercel.com)
- Repo trên GitHub (khuyến nghị cho deploy tự động)

---

## Chạy local

```bash
git clone <repo-url>
cd badminton-club-init
npm install
```

Tạo file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-or-publishable-key>
```

> Lấy giá trị tại **Supabase → Project Settings → API**  
> (`Project URL` và `anon` / `publishable` key).

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) → chọn avatar để vào app.

---

## Thiết lập Supabase (bắt buộc trước khi deploy)

### 1. Tạo project Supabase

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Ghi lại **Project URL** và **API key**

### 2. Chạy migration

**Cách A — Supabase CLI (khuyến nghị):**

```bash
npx supabase login
npx supabase link --project-ref <project-ref>   # chỉ ID, VD: gdnhcytvizwpreqbasrb
npx supabase db push
```

Nếu schema đã có sẵn (lỗi `type "user_role" already exists`):

```bash
npx supabase migration repair --status applied 20250606000000
npx supabase db push
```

**Cách B — SQL Editor:**  
Paste lần lượt nội dung các file trong `supabase/migrations/` vào **SQL Editor** và chạy.

### 3. RLS policies

App dùng **anon key** từ browser (không Supabase Auth). Migration `20250606000001_rls_policies.sql` phải được chạy — nếu không, trang chọn avatar sẽ trống dù DB có data.

### 4. Realtime (tùy chọn)

Migration init đã bật Realtime cho `matches` và `team_requests`. Kiểm tra tại **Database → Replication** nếu cần.

### 5. Seed thành viên

Migration init có seed demo, hoặc thêm user qua **Table Editor → users** hoặc màn **Admin → Thành viên** sau khi deploy.

---

## Deploy lên Vercel

### Bước 1: Push code lên GitHub

```bash
git add .
git commit -m "Prepare for Vercel deploy"
git push origin main
```

> Không commit `.env.local` — file này đã nằm trong `.gitignore`.

### Bước 2: Import project trên Vercel

1. Đăng nhập [vercel.com](https://vercel.com)
2. **Add New… → Project**
3. **Import** repository GitHub `badminton-club-init`
4. Framework Preset: **Next.js** (tự nhận diện)
5. Build Command: `npm run build` (mặc định)
6. Output Directory: `.next` (mặc định)
7. **Chưa bấm Deploy** — cấu hình Environment Variables trước

### Bước 3: Environment Variables

Trong mục **Environment Variables**, thêm:

| Name | Value | Environment |
|------|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key từ Supabase | Production, Preview, Development |

Hoặc dùng tên thay thế (code hỗ trợ cả hai):

| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cùng giá trị anon key |

### Bước 4: Deploy

1. Bấm **Deploy**
2. Đợi build (~1–3 phút)
3. Vercel cấp URL dạng `https://badminton-club-init.vercel.app`

### Bước 5: Kiểm tra sau deploy

- [ ] Trang `/` hiển thị grid avatar (không báo "Chưa có thành viên")
- [ ] Chọn **Admin** → vào `/admin`
- [ ] Chọn member → vào `/app`
- [ ] Tạo giải / sắp trận hoạt động

---

## Deploy bằng Vercel CLI (tùy chọn)

```bash
npm i -g vercel
vercel login
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
vercel --prod
```

---

## Cấu trúc routes chính

| Route | Mô tả |
|-------|--------|
| `/` | Chọn avatar (public) |
| `/admin/*` | Khu vực admin |
| `/app/*` | Khu vực thành viên |

Chi tiết spec: [`Agents.md`](./Agents.md)

---

## Scripts

```bash
npm run dev      # Development
npm run build    # Production build (Vercel chạy lệnh này)
npm run start    # Chạy bản build local
npm run lint     # ESLint
```

---

## Troubleshooting

### Avatar trống sau deploy

- Kiểm tra env vars trên Vercel (đúng project Supabase, không có khoảng trắng thừa)
- Redeploy sau khi sửa env: **Deployments → ⋯ → Redeploy**
- Chạy migration RLS: `20250606000001_rls_policies.sql`

### Build fail trên Vercel

- Chạy `npm run build` local trước để xem lỗi
- Đảm bảo Node 18+ (Vercel → Settings → Node.js Version)

### `db push` báo type/table đã tồn tại

```bash
npx supabase migration repair --status applied 20250606000000
npx supabase db push
```

---

## Tài liệu thêm

- [Next.js Deploying](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel + Next.js](https://vercel.com/docs/frameworks/nextjs)
- [Supabase + Vercel](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
