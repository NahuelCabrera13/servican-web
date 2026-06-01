import "./globals.css";
import AuthAccessMenu from "@/components/AuthAccessMenu";

export const metadata = {
  metadataBase: new URL("https://servican-web.vercel.app"),
  title: "SERVICAN | Formación y trabajo canino en Uruguay",
  description:
    "SERVICAN es una empresa de formación y trabajo canino en Uruguay. Cursos, entrenamiento, servicios K9 y capacitación especializada.",
  icons: {
    icon: "/logo-servican.jpeg",
    shortcut: "/logo-servican.jpeg",
    apple: "/logo-servican.jpeg",
  },
  openGraph: {
    title: "SERVICAN | Formación y trabajo canino en Uruguay",
    description:
      "Formación, entrenamiento y trabajo canino profesional en Uruguay.",
    url: "https://servican-web.vercel.app",
    siteName: "SERVICAN",
    images: [
      {
        url: "/logo-servican.jpeg",
        width: 800,
        height: 800,
        alt: "Logo SERVICAN",
      },
    ],
    locale: "es_UY",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthAccessMenu />
        {children}
      </body>
    </html>
  );
}