import { AuthProvider } from "@/lib/contexts/SupabaseAuthContext";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { Inter, Poppins } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export default function TestFirebaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div
          className={`${inter.variable} ${poppins.variable} font-sans min-h-screen bg-gray-50`}
        >
          {children}
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}
