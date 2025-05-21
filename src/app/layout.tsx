import './globals.css';
import { Poppins, Roboto } from 'next/font/google'
import Provider from './provider';

export const metadata = {
  title: 'Periskope - Supercharge your WhatsApp',
  description: 'Manage WhatsApp Groups and Chats at scale',
}

const roboto = Roboto({
  subsets: ['latin'],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: '--font-roboto'
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-poppins'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" >
      <body className={`${roboto.variable} ${poppins.variable} h-full  w-full`}>
        <Provider />
        {children}
      </body>
    </html>
  )
}
