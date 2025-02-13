import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Processor",
  description: "Extract Text From Pdf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
