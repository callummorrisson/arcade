import "@/styles/themes/default.theme.scss"; // todo, setting for theme picking, component for loading theme
import "@/styles/global.scss";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "./_layout/header/header";
import Footer from "./_layout/footer/footer";

import styles from "./layout.module.scss";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Arcade",
  description: "Not sure what this is for yet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${styles["body"]}`}
      >
        <header className={styles["header"]}>
          <Header />
        </header>
        <div className={styles["content"]}>{children}</div>
        <footer className={styles["footer"]}>
          <Footer />
        </footer>
      </body>
    </html>
  );
}
