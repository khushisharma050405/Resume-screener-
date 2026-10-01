import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "ResumeIQ — AI Resume Screener, ATS Checker & Job Matcher for Candidates",
  description: "Upload your resume, calculate your instant ATS score, discover which jobs across all industries you are most suitable for, and get actionable suggestions on what to add to get hired.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#F4EBDD] text-[#1E2D2D] selection:bg-[#2D8A8A]/20 selection:text-[#1E2D2D]">
        {children}
      </body>
    </html>
  );
}
