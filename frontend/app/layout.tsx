import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import clsx from "clsx"
import { Suspense } from "react"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-context"
import { LanguageProvider } from "@/components/language/language-provider"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={clsx(`${GeistSans.variable} ${GeistMono.variable} antialiased`)}>
      <body className="bg-background text-foreground">
        <LanguageProvider>
          <AuthProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </AuthProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
