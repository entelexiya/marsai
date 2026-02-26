import './globals.css'

export const metadata = {
  title: 'MarsAI — Onboard Science Selection',
  description: 'AI-powered adaptive data transmission from Mars rovers to Earth. Only the most critical data flies home.',
  keywords: ['Mars', 'AI', 'space', 'data transmission', 'NASA', 'rover', 'machine learning'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
