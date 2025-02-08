import { Inter } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HumanGen",
  description: "Generate human-like data",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} font-[family-name:var(--font-poppins)] vsc-initialized`}
      >
        <Navbar />
        <div className="h-20"></div>
        {/* <AnimatedBackground /> */}
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
