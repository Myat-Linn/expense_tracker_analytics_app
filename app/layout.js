import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "FinTrack — Expense Tracker & Analytics",
  description: "Track your income and expenses, visualize spending trends, manage budgets, and stay on top of your finances with powerful analytics.",
  keywords: "expense tracker, budget, analytics, finance, money management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
