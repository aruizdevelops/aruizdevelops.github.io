import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'Bluebonnet Tech | Web & Mobile Development Portfolio',
  description:
    'Bluebonnet Tech is the portfolio of Allen Ruiz, a UI/UX, web, and mobile developer building polished, business-ready digital products.',
  openGraph: {
    title: 'Bluebonnet Tech | Web & Mobile Development Portfolio',
    description:
      'UI/UX, web, and mobile development by Allen Ruiz. Polished digital products built for real businesses.',
    type: 'website',
    url: 'https://aruizdevelops.github.io',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript defaultMode="dark" />
        <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
      </body>
    </html>
  );
}
