// Built-in background music the couple can pick in the Studio instead of uploading a file. The files live in
// public/music; content.music.url stores the site-relative path, which contentSchema accepts only for these files.
export type LibraryTrack = { id: string; title: string; artist: string; url: string };

export const MUSIC_LIBRARY: readonly LibraryTrack[] = [
  { id: "em-dong-y-i-do", title: "Em Đồng Ý (I Do)", artist: "Đức Phúc x 911", url: "/music/em-dong-y-i-do.mp3" },
  { id: "ngay-dau-tien", title: "Ngày Đầu Tiên", artist: "Đức Phúc", url: "/music/ngay-dau-tien.mp3" },
  { id: "hon-ca-yeu-pro-house", title: "Hơn Cả Yêu (Pro House)", artist: "", url: "/music/hon-ca-yeu-pro-house.mp3" },
];

export const isLibraryMusicUrl = (url: string): boolean => MUSIC_LIBRARY.some((t) => t.url === url);
