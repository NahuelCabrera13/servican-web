import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://servican-web.vercel.app"),
  title: "SERVICAN | Cursos Profesionales para Guías Caninos",
  description:
    "SERVICAN ofrece cursos pagos de adiestramiento, manejo canino y especialización K9. Formación clara, seria y progresiva para guías caninos.",
  keywords: [
    "SERVICAN",
    "cursos caninos",
    "adiestramiento canino",
    "guías caninos",
    "K9",
    "perros detectores",
    "curso K9",
    "formación canina",
    "Uruguay",
  ],
  authors: [{ name: "SERVICAN" }],
  openGraph: {
    title: "SERVICAN | Cursos Profesionales para Guías Caninos",
    description:
      "Cursos pagos de adiestramiento, manejo canino y especialización K9. Nuestro olfato nos define.",
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
  icons: {
    icon: "/logo-servican.jpeg",
    shortcut: "/logo-servican.jpeg",
    apple: "/logo-servican.jpeg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}