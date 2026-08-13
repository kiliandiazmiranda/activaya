// Layout raíz de Next.js: define metadatos, fuentes y estructura global.
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import PwaInstaller from '@/components/PwaInstaller';
import NotificationManager from '@/components/NotificationManager';

export const metadata: Metadata = {
  title: 'ActivaYA',
  description: 'Tu asistente personal para pausas activas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F0FFF0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <PwaInstaller />
        <NotificationManager />
      </body>
    </html>
  );
}
