import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Metadata, Viewport } from "next";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Meu App",
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
}

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, "w-full overflow-x-hidden")}
    >
      <body className="min-h-screen">
        <ThemeProvider>
          <SiteHeader />
          <div>
            {children}
          </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
