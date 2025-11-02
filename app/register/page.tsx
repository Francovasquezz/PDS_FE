"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; // El que acabamos de instalar
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Este tipo de dato se basa en tu RegisterRequest.java y el Swagger
type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  juegoPreferido: string;
  regionPreferida: string;
  rangoMinPreferido: string;
  rangoMaxPreferido: string;
  canalesPreferidos: string[]; // Array de strings
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    juegoPreferido: "Valorant", // Valor por defecto
    regionPreferida: "LATAM",  // Valor por defecto
    rangoMinPreferido: "Oro",
    rangoMaxPreferido: "Diamante",
    canalesPreferidos: ["EMAIL"], // EMAIL por defecto
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Manejador genérico para inputs de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador para los Select
  const handleSelectChange = (name: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador para los Checkbox de canales
  const handleChannelChange = (channel: "EMAIL" | "PUSH", checked: boolean) => {
    setFormData((prev) => {
      const currentChannels = prev.canalesPreferidos;
      if (checked) {
        // Añadir canal si no está
        return { ...prev, canalesPreferidos: [...new Set([...currentChannels, channel])] };
      } else {
        // Quitar canal
        return { ...prev, canalesPreferidos: currentChannels.filter((c) => c !== channel) };
      }
    });
  };

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      // Llamamos al endpoint POST /api/auth/register [cite: image_9545bf.png]
      await apiClient.post("/auth/register", formData);
      
      toast.success("¡Registro exitoso!", {
        description: "Tu cuenta fue creada. Por favor, revisa tu email para verificarla.",
      });
      // Redirigimos al login
      router.push("/login");

    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        // Mostrar error del backend (ej. "El email ya está en uso")
        setError(err.response.data.error);
        toast.error("Error en el registro", { description: err.response.data.error });
      } else {
        setError("Ocurrió un error al registrar la cuenta.");
        toast.error("Ocurrió un error al registrar la cuenta.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Crear una Cuenta</CardTitle>
          <CardDescription>
            Completa tus datos para unirte a eScrims.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- DATOS DE CUENTA --- */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Datos de Cuenta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input name="username" value={formData.username} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input name="password" type="password" value={formData.password} onChange={handleChange} required minLength={8} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>
            </div>

            {/* --- PREFERENCIAS --- */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-lg font-medium">Preferencias (Opcional)</h3>
              <p className="text-sm text-muted-foreground">
                Esto nos ayudará a encontrar scrims para ti.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="juegoPreferido">Juego Preferido</Label>
                  <Select name="juegoPreferido" value={formData.juegoPreferido} onValueChange={(v) => handleSelectChange("juegoPreferido", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Valorant">Valorant</SelectItem>
                      <SelectItem value="League of Legends">League of Legends</SelectItem>
                      <SelectItem value="CS2">CS2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regionPreferida">Región Preferida</Label>
                  <Select name="regionPreferida" value={formData.regionPreferida} onValueChange={(v) => handleSelectChange("regionPreferida", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LATAM">LATAM</SelectItem>
                      <SelectItem value="NA">NA</SelectItem>
                      <SelectItem value="EUW">EUW</SelectItem>
                      <SelectItem value="SA">SA (Brasil)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="rangoMinPreferido">Rango Mínimo</Label>
                  <Input name="rangoMinPreferido" value={formData.rangoMinPreferido} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rangoMaxPreferido">Rango Máximo</Label>
                  <Input name="rangoMaxPreferido" value={formData.rangoMaxPreferido} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* --- CANALES DE NOTIFICACIÓN --- */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Label>Canales de Notificación</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="channel-email" 
                    checked={formData.canalesPreferidos.includes("EMAIL")}
                    onCheckedChange={(checked) => handleChannelChange("EMAIL", !!checked)}
                  />
                  <Label htmlFor="channel-email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="channel-push" 
                    checked={formData.canalesPreferidos.includes("PUSH")}
                    onCheckedChange={(checked) => handleChannelChange("PUSH", !!checked)}
                  />
                  <Label htmlFor="channel-push">Notificaciones Push (Móvil)</Label>
                </div>
              </div>
            </div>

            {/* Error y Botón de Envío */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <Button type="submit" className="w-full">Crear Cuenta</Button>

             <div className="mt-4 text-center text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="underline text-primary">
                Inicia sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}