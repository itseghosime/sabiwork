import {
  ArrowRight,
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Hammer,
  House,
  LayoutGrid,
  List,
  LockKeyhole,
  MapPin,
  Menu,
  Paintbrush,
  Search,
  Scissors,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Wrench,
  X,
  Zap,
} from "lucide-react";
const icons = {
  arrow: ArrowRight,
  back: ArrowLeft,
  badge: BadgeCheck,
  check: Check,
  chevron: ChevronDown,
  next: ChevronRight,
  help: CircleHelp,
  hammer: Hammer,
  home: House,
  grid: LayoutGrid,
  list: List,
  lock: LockKeyhole,
  pin: MapPin,
  menu: Menu,
  paintbrush: Paintbrush,
  search: Search,
  scissors: Scissors,
  shield: ShieldCheck,
  filters: SlidersHorizontal,
  sparkles: Sparkles,
  star: Star,
  wrench: Wrench,
  x: X,
  zap: Zap,
};
export type IconName = keyof typeof icons;
export function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const Component = icons[name];
  return (
    <Component
      aria-hidden="true"
      size={size}
      strokeWidth={1.7}
      className={className}
    />
  );
}
