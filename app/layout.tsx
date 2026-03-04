import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "I Used to Live Here Once",
  description: "A transmedial adaptation of the short story by Jean Rhys",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
