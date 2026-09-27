import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Riwaaya Seller Portal | Partner Dashboard",
  description: "Professional vendor management dashboard for Riwaaya Threads luxury couture.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/assets/riwaaya_logo.png", type: "image/png" }
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className={`${outfit.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
