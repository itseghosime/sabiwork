import { PublicShell } from "@/components/public-shell";
import "./public-redesign.css";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
