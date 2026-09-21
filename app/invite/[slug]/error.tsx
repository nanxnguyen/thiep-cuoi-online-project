"use client";

// Shown when the backend cannot be reached (or answers with an error): the guest gets a plain explanation and a retry.
export default function InviteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="section" style={{ textAlign: "center", paddingBlock: "20vh" }}>
      <p className="eyebrow">Chưa mở được thiệp</p>
      <h1 style={{ margin: "20px 0", fontSize: "clamp(32px, 6vw, 52px)" }}>
        Đường truyền đang trục trặc,
        <br />
        <em>bạn thử lại nhé.</em>
      </h1>
      <p className="lede" style={{ margin: "0 auto" }}>
        Thiệp vẫn còn nguyên. Kiểm tra kết nối mạng rồi bấm thử lại.
      </p>
      <div className="actions" style={{ justifyContent: "center" }}>
        <button type="button" className="button-primary" onClick={reset}>
          Thử lại
        </button>
      </div>
    </main>
  );
}
