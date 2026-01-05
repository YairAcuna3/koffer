import type { Metadata } from "next";
import "./globals.css";
import Providers from "./components/Providers";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Koffer - Gestión de Proyectos",
  description: "Tu maletín de proyectos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
