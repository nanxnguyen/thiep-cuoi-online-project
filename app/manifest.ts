import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MỘC Wedding",
    short_name: "MỘC",
    description: "Tạo thiệp cưới online đẹp, miễn phí.",
    start_url: "/",
    display: "browser",
    lang: "vi",
    background_color: "#f8f4ee",
    theme_color: "#a3161c",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
