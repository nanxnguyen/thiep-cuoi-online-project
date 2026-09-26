"use client";

import { useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Lõi single-thread của @ffmpeg/core — không cần SharedArrayBuffer/COOP-COEP (khác bản -mt), nên không
// phải bật header cách ly nguồn gốc cho cả site (sẽ phá Google Maps embed và 2 host ảnh QR đang dùng).
// Tải từ CDN lúc chạy (không bundle vào build của MỘC) — chỉ khi người dùng thật sự mở trang này và bấm
// nén, xem spec mục 6.7 và /quyen-rieng-tu.
const CORE_VERSION = "0.12.10";
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;
const MAX_INPUT_BYTES = 200 * 1024 * 1024; // 200 MB — đề xuất ban đầu, xem spec mục 9.4

const LEVELS = {
  cao: { label: "Chất lượng cao (ít nén)", crf: "20" },
  vua: { label: "Cân bằng", crf: "28" },
  nho: { label: "Dung lượng nhỏ nhất", crf: "35" },
} as const;
type LevelId = keyof typeof LEVELS;

const fmtMb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export function VideoCompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<LevelId>("vua");
  const [phase, setPhase] = useState<"idle" | "loading-core" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  function pickFile(f: File) {
    setError("");
    setResult(null);
    if (f.size > MAX_INPUT_BYTES) {
      setError(`Video nặng hơn ${fmtMb(MAX_INPUT_BYTES)}. Hãy chọn video ngắn hoặc nhẹ hơn.`);
      return;
    }
    setFile(f);
  }

  async function getFfmpeg(): Promise<FFmpeg> {
    if (ffmpegRef.current) return ffmpegRef.current;
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: p }) => setProgress(Math.max(0, Math.min(100, Math.round(p * 100)))));
    setPhase("loading-core");
    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
    ]);
    // classWorkerURL trỏ tới bản sao tĩnh trong public/ffmpeg-worker/ (worker.js + const.js + errors.js,
    // copy nguyên văn từ node_modules/@ffmpeg/ffmpeg/dist/esm, hiện @ 0.12.15) thay vì để @ffmpeg/ffmpeg tự
    // new Worker(new URL("./worker.js", import.meta.url)) mặc định — Turbopack cố bundle worker.js đó và vỡ
    // ở chỗ worker.js tự import(_coreURL) động bên trong ("Cannot find module as expression is too dynamic").
    // Dùng classWorkerURL (một chuỗi runtime, không phải literal) khiến Turbopack bỏ qua, không cố phân
    // tích tĩnh file worker. Nếu nâng cấp @ffmpeg/ffmpeg, phải chép lại 3 file này.
    // Phải là URL tuyệt đối kèm origin: @ffmpeg/ffmpeg tự bọc classWorkerURL trong
    // `new URL(classWorkerURL, import.meta.url)`, mà import.meta.url trong chunk Turbopack không phải
    // origin trang thật (ra `file:///ffmpeg-worker/worker.js`) — URL tuyệt đối thì bỏ qua base đó.
    await ffmpeg.load({ coreURL, wasmURL, classWorkerURL: `${window.location.origin}/ffmpeg-worker/worker.js` });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }

  async function run() {
    if (!file) return;
    setError("");
    setProgress(0);
    setResult(null);
    try {
      const ffmpeg = await getFfmpeg();
      setPhase("running");
      const ext = file.name.match(/\.[^.]+$/)?.[0] ?? ".mp4";
      const inputName = `input${ext}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(["-i", inputName, "-vcodec", "libx264", "-crf", LEVELS[level].crf, "-preset", "veryfast", "-acodec", "aac", "output.mp4"]);
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: "video/mp4" });
      setResult({ url: URL.createObjectURL(blob), size: blob.size });
      setPhase("done");
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      setError(`Không nén được video này (${detail}). Hãy thử một video khác hoặc định dạng mp4/mov phổ biến.`);
      setPhase("idle");
    }
  }

  const busy = phase === "loading-core" || phase === "running";

  // No design source for this tool (CC Nen Video is missing from design/): same language as CC Nen Anh.
  return (
    <>
      <label className="tool-drop">
        <strong>{file ? file.name : "Chọn video cưới"}</strong>
        <span>{file ? `Dung lượng gốc: ${fmtMb(file.size)}` : "MP4, MOV — xử lý ngay trên máy, video dài có thể mất vài phút"}</span>
        <input
          type="file"
          accept="video/*"
          className="tool-sr"
          onChange={(e) => {
            const picked = e.target.files?.[0];
            e.target.value = "";
            if (picked) pickFile(picked);
          }}
        />
      </label>
      <div className="tool-segment" role="group" aria-label="Mức nén">
        {Object.entries(LEVELS).map(([value, l]) => (
          <button key={value} type="button" aria-pressed={level === value} onClick={() => setLevel(value as LevelId)}>
            {l.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="tool-error" role="alert">
          {error}
        </p>
      )}
      <button type="button" className="button-primary tool-cta" onClick={run} disabled={!file || busy}>
        {phase === "loading-core" ? "Đang tải công cụ nén…" : phase === "running" ? `Đang nén… ${progress}%` : "Nén video"}
      </button>
      {busy && <progress className="tool-progress" value={phase === "running" ? progress : undefined} max={100} />}
      {result && (
        <div className="tool-video">
          <video src={result.url} controls />
          <p className="tool-shots__size">
            <span>{fmtMb(file!.size)}</span>
            <b>→ {fmtMb(result.size)}</b>
          </p>
          <a className="tool-dark-pill" href={result.url} download="video-da-nen.mp4">
            Tải video đã nén
          </a>
        </div>
      )}
    </>
  );
}
