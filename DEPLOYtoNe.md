# Tự deploy MỘC Wedding

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

## 5. Verify sau deploy

```bash
B="https://moc-wedding.netlify.app"
curl -s -o /dev/null -w "home %{http_code}\n" "$B/"
curl -s -o /dev/null -w "invite %{http_code}\n" "$B/invite/ho6my9vg?to=Khach"
curl -s -o /dev/null -w "api-docs %{http_code}\n" "$B/api/docs"
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
