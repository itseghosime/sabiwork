import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const inter = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2",
      weight: "400",
    },
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2",
      weight: "500",
    },
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2",
      weight: "600",
    },
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2",
      weight: "700",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});
const jakarta = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2",
      weight: "600",
    },
    {
      path: "../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2",
      weight: "700",
    },
  ],
  variable: "--font-jakarta",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "SabiWork — Skilled hands. Trusted work.",
    template: "%s | SabiWork",
  },
  description:
    "Discover local artisans in Benin City. Browse trades, compare profiles and find skilled help for your next project.",
  icons: { icon: "/images/sabiwork-icon.png" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-NG"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jakarta.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
