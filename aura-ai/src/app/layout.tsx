import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/lib/queries/ReactQueryProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "sonner";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});



const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura AI",
  description: "Your AI-Powered Ambient Soundscape",
};

/**
 * Root Application Layout.
 * Configures global providers (Theme, Query, Toast) and font optimization.
 * Enforces dark mode preference and global styling injection.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position="top-center"
              richColors
              toastOptions={{
                style: {
                  padding: '20px',
                  minWidth: '400px',
                  fontSize: '22px',
                  borderRadius: '12px',
                },
                className: 'font-sans shadow-2xl border-2',
                descriptionClassName: 'text-muted-foreground text-sm mt-1',
              }}
            />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}