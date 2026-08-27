import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = {
  title: "Configuración",
};

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Administra el perfil de tu negocio y las preferencias del catálogo.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Perfil del Negocio</CardTitle>
            <CardDescription>
              Esta información aparece en tu catálogo público.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Negocio</Label>
              <Input id="name" placeholder="Mi Negocio" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug de URL del Catálogo</Label>
              <Input id="slug" placeholder="mi-negocio" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo de Contacto</Label>
              <Input id="email" type="email" placeholder="hola@negocio.com" />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
