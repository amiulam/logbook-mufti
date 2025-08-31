import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Logbook App - Tool Management System",
  description: "Professional event management and tool tracking application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen w-full bg-white/70 dark:bg-black/10">
            {/* Light mode background */}
            <div
              className="absolute inset-0 -z-10 block dark:hidden"
              style={{
                background: "#ffffff",
                backgroundImage: `
                  radial-gradient(
                    circle at top center,
                    rgba(70, 130, 180, 0.5),
                    transparent 70%
                  )
                `,
                filter: "blur(80px)",
                backgroundRepeat: "no-repeat",
              }}
            />
            {/* Dark mode background */}
            <div
              className="absolute inset-0 -z-10 hidden dark:block"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99, 102, 241, 0.25), transparent 70%), #000000",
              }}
            />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
