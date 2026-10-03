import Image from "next/image";
import type { PostImage } from "@/lib/blog";

// One photo from public/. The parent decides the crop (aspect-ratio + overflow in blog.css); `focus` keeps faces in frame.
export function PostPhoto({ image, sizes, priority = false }: { image: PostImage; sizes: string; priority?: boolean }) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.w}
      height={image.h}
      sizes={sizes}
      priority={priority}
      style={image.focus ? { objectPosition: image.focus } : undefined}
    />
  );
}
