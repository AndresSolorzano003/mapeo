import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mapa de planta',
  description: 'Asigna nombres a las secciones del mapa y envíalo por WhatsApp',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
