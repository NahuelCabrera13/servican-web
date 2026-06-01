import RegistroForm from "./RegistroForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Registro de alumno | SERVICAN",
  description: "Crear cuenta de alumno en la plataforma SERVICAN.",
};

export default function RegistroPage() {
  return <RegistroForm />;
}