import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'block',
  preload: true,
})

export const metadata = {
  title: 'Keuanganku',
  description: 'Manajemen keuangan pribadi',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
      </head>
      <body className={font.className} style={{ margin: 0, background: '#0D0F1A' }}>
        {children}
      </body>
    </html>
  )
}
