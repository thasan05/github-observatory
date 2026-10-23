import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitHub Observatory — The pulse of open source',
  description: 'An independently maintained observatory of GitHub repository search counts and open-source ecosystem signals.',
  applicationName: 'GitHub Observatory',
  openGraph: {
    title: 'GitHub Observatory',
    description: 'The pulse of open source, observed over time.',
    type: 'website',
  },
};
export const viewport: Viewport = { themeColor: '#070b0a', colorScheme: 'dark' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
