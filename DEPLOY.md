Copy-paste từng khối theo thứ tự. Lần đầu làm hết từ 0, lần sau chỉ cần khối 4.

## 0. Cài đặt (lần đầu)

```bash
npm install -g netlify-cli
npx supabase --version # cần Docker đang chạy nếu dùng Supabase local
```

## 1. Login (lần đầu, mở browser xác nhận)

```bash
netlify login
npx supabase login
```

## 2. Link project (lần đầu)

```bash
netlify link --id 714fc7f0-f21c-4957-8ba3-15127ab51f25
npx supabase link --project-ref iehmucsshklgjmxqyggp
```

## 3. Đẩy env + migration + Edge (khi đổi env, DB, function)

```bash
# Env local -> Netlify (chạy lại sau mỗi lần sửa .env.local)
netlify env:import .env.local

# Sửa 1 biến lẻ
netlify env:set TEN_BIEN gia-tri

# Migration DB -> remote Supabase
npx supabase db push --db-url "postgresql://postgres:<MAT-KHAU-DB-DA-ENCODE>@db.iehmucsshklgjmxqyggp.supabase.co:5432/postgres"

# Edge Function + secret
npx supabase secrets set EDGE_SHARED_SECRET="<giá-trị-trong-.env.local>"
npx supabase functions deploy public-write
```

## 4. Deploy production (mỗi lần release)

```bash
npm test && npx tsc --noEmit && git diff --check
git add -A && git commit -m "<nội-dung>" && git push origin main
netlify deploy --prod --build
```

### 4b. Vercel (song song với Netlify, team ray-team3)

```bash
npx -y vercel@latest login
npx -y vercel@latest link --yes --scope ray-team3 --project thiep-cuoi-online-project
# Đẩy env lần đầu (Production); NEXT_PUBLIC_SITE_URL=https://thiep-cuoi-online-project.vercel.app
printf '%s' "<giá-trị>" | npx -y vercel@latest env add TEN_BIEN production --scope ray-team3 --force
npx -y vercel@latest --prod --yes
```
Production: `https://thiep-cuoi-online-project.vercel.app`. Cron giữ ấm vẫn dùng GitHub Actions (Vercel free chỉ cho cron 1 lần/ngày). File `.vercelignore` loại `node_modules/.cache`-kiểu rác (`.codegraph`, `qa-evidence`, `supabase/.temp`) khỏi upload.

### 4c. Cloudflare Workers (song song, free)

Chuẩn bị 1 lần: `wrangler.jsonc` (đã có trong repo), đăng ký workers.dev subdomain ở dashboard, rồi:
```bash
npx -y wrangler@latest login
npm run build # sinh .open-next/worker.js (build sạch: rm -rf .open-next dist trước)
./node_modules/.bin/opennextjs-cloudflare deploy # hoặc: npx wrangler deploy
```
Env: `vars` public nằm sẵn trong `wrangler.jsonc`; secret set tay:
```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put EDGE_SHARED_SECRET
npx wrangler secret put RATE_LIMIT_HMAC_SECRET
```
Lưu ý:
- Build Cloudflare snapshot toàn bộ env shell vào `.open-next/cloudflare/next-env.mjs` — build xong kiểm tra không lọt token lạ (`grep -o "VERCEL_[A-Z_]*" ...` phải trống). `.env` thừa và dòng lạ trong `.env.local` phải xóa trước build.
- `NEXT_PUBLIC_*` nướng vào build: luôn build với `NEXT_PUBLIC_SITE_URL=https://taothiepcuoi.raystudio.com.vn npm run build` rồi `npx wrangler deploy` (domain chính thức, đặt trong `wrangler.jsonc`).
- Có thể connect GitHub trong dashboard để auto-deploy (Build command `npm run build`, Deploy command `npx wrangler deploy`); env vẫn phải set tay ở Settings → Variables.

## 5. Verify sau deploy

```bash
B="https://taothiepcuoi.raystudio.com.vn"
curl -s -o /dev/null -w "home %{http_code}\n" "$B/"
curl -s -o /dev/null -w "invite %{http_code}\n" "$B/invite/ho6my9vg"
curl -s -o /dev/null -w "api-docs %{http_code}\n" "$B/api/docs"
# Link khách dùng ?g=<token> lấy từ Studio tab Khách (không còn ?to=Tên):
# mở tay "$B/invite/<slug>?g=<token>" ở tab ẩn danh: phong bì ghi đúng tên hộ.
```

## 6. Rollback

```bash
# Netlify: vào dashboard deploy cũ -> Publish, hoặc CLI:
netlify deploy --prod --alias rollback-check # kiểm tra trước
# Supabase: chưa có down-migration, sửa bằng migration mới rồi db push lại
```

## Ghi nhớ

- Đổi `NEXT_PUBLIC_*` phải deploy lại mới có tác dụng (nướng vào build).
- Không bao giờ commit `.env.local` (đã ignore).
- Secret lộ thì xoay ngay: Dashboard Supabase → API Keys → New secret key, rồi cập nhật `.env.local` + `netlify env:set` + `supabase secrets set`.
