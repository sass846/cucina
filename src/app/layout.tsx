import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Lora, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import SignUpPage from "./signup/page";
import LoginPage from "./login/page";
import CreateProfilePage from "./create-profile/page";
import Navbar from "@/components/layout/Navbar";
import CreatePost from "@/components/post/CreatePost";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Cucina",
  description: "Your culinary community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lora.variable} ${nunitoSans.variable} antialiased`}
      >
        <AuthProvider>
          <div className="flex min-h-screen">
            <Navbar/>
            <main className="flex-grow">
              {children}
            </main>
          </div>
          
        </AuthProvider>
      </body>
    </html>
  );
}
