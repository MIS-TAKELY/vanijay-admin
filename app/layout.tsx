import './globals.css';
import { ThemeProvider } from "@/components/theme-provider";
import { ApolloWrapper } from '@/lib/apollo-wrapper';
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import AuthGate from "@/components/auth/AuthGate";
import { CommandPalette } from "@/components/layout/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Admin Panel',
  description: 'Admin Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ApolloWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthGate>
              {children}
            </AuthGate>
            <CommandPalette />
            <Toaster position="top-right" duration={2500} richColors closeButton />
          </ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
