import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ultra Swap Wizard',
  description: 'Jupiter Ultra Swap API Demo',
  icons: {
    icon: '/assets/logo-dark.svg',
    shortcut: '/assets/logo-dark.svg',
    apple: '/assets/logo-dark.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
