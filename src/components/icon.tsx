import {
  ArrowRight,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Hammer,
  House,
  LayoutGrid,
  LayoutDashboard,
  List,
  LockKeyhole,
  MapPin,
  Menu,
  GraduationCap,
  ClipboardList,
  Paintbrush,
  Search,
  Settings,
  Scissors,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Wrench,
  WalletCards,
  UserRound,
  X,
  Zap,
} from "lucide-react";
const icons = {
  arrow: ArrowRight,
  back: ArrowLeft,
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  badge: BadgeCheck,
  check: Check,
  chevron: ChevronDown,
  next: ChevronRight,
  help: CircleHelp,
  hammer: Hammer,
  home: House,
  grid: LayoutGrid,
  dashboard: LayoutDashboard,
  graduation: GraduationCap,
  clipboard: ClipboardList,
  list: List,
  lock: LockKeyhole,
  pin: MapPin,
  menu: Menu,
  paintbrush: Paintbrush,
  search: Search,
  settings: Settings,
  scissors: Scissors,
  shield: ShieldCheck,
  filters: SlidersHorizontal,
  sparkles: Sparkles,
  star: Star,
  wrench: Wrench,
  wallet: WalletCards,
  user: UserRound,
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
