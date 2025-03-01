import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "RealtorCopyPal - AI Marketing Copy for Real Estate Agents",
  description:
    "Generate high-quality marketing copy for your real estate listings, social media posts, and email campaigns with minimal input.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <div className="flex-1 w-full">
                <main className="w-full p-4 md:p-6 lg:p-8">{children}</main>
              </div>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
