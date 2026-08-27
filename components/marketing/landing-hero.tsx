import Link from "next/link";
import { Bot, Globe, LayoutDashboard, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: LayoutDashboard,
    title: "Gestión del Negocio",
    description:
      "Inventario, órdenes, clientes y analíticas en un panel unificado.",
  },
  {
    icon: Globe,
    title: "Catálogo Público",
    description:
      "Comparte una vitrina en línea con tus clientes — sin configuración extra.",
  },
  {
    icon: Bot,
    title: "Copiloto IA",
    description:
      "Obtén insights inteligentes, redacta mensajes y automatiza tareas rutinarias.",
  },
];

export function LandingHero() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Store className="size-5" />
            MERCADEO
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" render={<Link href="/catalog/demo" />}>
              Ver Catálogo
            </Button>
            <Button variant="outline" render={<Link href="/login" />}>
              Iniciar Sesión
            </Button>
            <Button render={<Link href="/register" />}>Comenzar</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Administra tu negocio.
            <br />
            <span className="text-muted-foreground">Vende online. Piensa más inteligente.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            MERCADEO es tu plataforma todo-en-uno para la gestión de tu negocio, un catálogo
            público de productos y un copiloto IA que te ayuda a crecer.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" render={<Link href="/register" />}>
              Comenzar Gratis
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/dashboard" />}>
              Abrir Panel
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="size-8 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} MERCADEO. Hecho con Next.js y Supabase.
      </footer>
    </div>
  );
}
