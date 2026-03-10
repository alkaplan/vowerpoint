import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VowerPoint - Presentation Editor',
  description: 'A web-based presentation editor',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
