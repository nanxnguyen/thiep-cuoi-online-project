import { CircleCheck, Gift, Heart, Images, MapPin, Smartphone, type LucideIcon } from "lucide-react";

// Line icons for the feature tiles (lucide, tree-shaken). Decorative: the tile title carries the meaning.
const icons: Record<string, LucideIcon> = {
  phone: Smartphone,
  pin: MapPin,
  image: Images,
  heart: Heart,
  gift: Gift,
  check: CircleCheck,
};

export function Icon({ name }: { name: string }) {
  const Glyph = icons[name] ?? Heart;
  return <Glyph size={22} strokeWidth={1.7} aria-hidden="true" focusable="false" />;
}
