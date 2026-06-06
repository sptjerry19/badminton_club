## Design System — Dark Premium (Linear/Vercel style)

### Font

- Primary: 'DM Sans' (Google Fonts) — weights 300/400/500/600
- Mono: 'DM Mono' — dùng cho score, số tiền, timestamps

### Color Tokens (CSS variables)

--bg: #0a0a0f         /* page background */
--bg1: #111118        /* section background */*  
*--bg2: #16161f        /* card background */
--bg3: #1c1c28        /* input, button secondary */
--bg4: #242435        /* hover state, avatar bg */
--border: #ffffff12   /* default border */
--border2: #ffffff1e  /* hover border */
--border3: #ffffff30  /* active/focus border */
--text: #f0f0f5       /* primary text */
--text2: #a0a0b8      /* secondary text */
--text3: #606078      /* muted / placeholder */
--accent: #7c6dfa     /* primary CTA (purple) */
--accent2: #a78bfa*  
*--accent3: #c4b5fd*  
*--green: #22d3a0      /* win / paid / online */
--red: #f87171        /* lose / debt / error */
--amber: #fbbf24      /* warning / pending */
--blue: #60a5fa       /* info / upcoming */

### Border radius

- 4px: pills nhỏ, badge
- 8px: buttons, inputs, small cards
- 12px: cards, tables, panels
- 16px: modal, section containers
- 50px: avatar, badge pill

### Animation principles

1. Staggered fade-up khi page load: mỗi section delay +50ms
  keyframe: {from: opacity:0, translateY(12px) → to: opacity:1, translateY(0)}
   duration: 400ms, easing: cubic-bezier(.4,0,.2,1)
2. Avatar hover: transform scale(1.08) + border-color accent
  spring easing: cubic-bezier(.34,1.56,.64,1) — tạo feel bouncy
3. Button press: translateY(-1px) on hover, scale(.97) on active
4. Card hover: translateY(-2px) + border-color thay đổi
5. Progress bar: animate width từ 0 → value, delay 300ms sau mount
  duration: 800ms, easing: cubic-bezier(.4,0,.2,1)
6. Skeleton loading: shimmer gradient animation
  background: linear-gradient(90deg, bg3 25%, bg4 50%, bg3 75%)
   background-size: 200% 100%, animation: 1.5s infinite
7. Live indicator: pulse animation trên dot xanh lá
  opacity 1 → 0.5 → 1, 2s ease-in-out infinite
8. Page transitions (Next.js): dùng Framer Motion
  - Layout: AnimatePresence + motion.div
  - Variant: {initial:{opacity:0,y:8}, animate:{opacity:1,y:0}, exit:{opacity:0,y:-8}}
  - Duration: 0.25s

### Component patterns

NAVBAR:

- Height: 56px, backdrop-filter: blur(12px), bg: rgba(10,10,15,0.8)
- Logo: icon vuông 28px (accent bg) + text 15px/600
- Active nav link: bg rgba(124,109,250,0.15), color accent3

AVATAR SELECTOR (Netflix style):

- Grid: repeat(auto-fill, minmax(100px,1fr)), gap 20px
- Avatar circle: 72px, border 2px solid border2
- Hover: spring scale(1.08) + border accent + glow box-shadow
- Selected: checkmark badge absolute bottom-right

STAT CARDS (dashboard):

- Grid 3 columns, gap 10px
- Value: 28px/600, letter-spacing -.02em
- Label: 12px, color text3
- Delta: 11px với màu green/red

MATCH CARD:

- Flex layout: team | score | team
- Score box: 36×36px, rounded 8px
- Win: bg rgba(34,211,160,0.12), color green
- Lose: bg rgba(255,255,255,0.05), color text3

TABLE:

- Header: 11px uppercase, letter-spacing .06em, color text3
- Row hover: bg rgba(255,255,255,0.02)
- Currency/numbers: font DM Mono

NOTIFICATIONS:

- Icon: 32×32px rounded 8px với colored bg (rgba + border)
- Timestamp: margin-left auto, 11px, text3

### Micro-interactions quan trọng

- Input focus: border-color accent + box-shadow 0 0 0 3px rgba(124,109,250,0.18)
- Toast notification: slide in từ top-right, auto dismiss 4s
- Team request accept/decline: button transform + fade out row
- Score input: số tự highlight khi click, up/down arrow keys
- Finance row: hover reveal nút "Ghi nhận thanh toán"



