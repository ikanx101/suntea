import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Toko Santi Irawati",
  description: "Manajemen produk, pesanan, invoice, dan keuangan Toko Santi Irawati",
  icons: {
    icon: "/logo.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${baloo.variable} ${nunito.variable} font-body antialiased bg-cream text-hotpink-900`}>
        {children}
      </body>
    </html>
  );
}
