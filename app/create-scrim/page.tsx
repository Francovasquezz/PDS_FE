"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // El que acabamos de instalar
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Este tipo de dato se basa en tu ScrimCreateRequest.java
type ScrimFormData = {
  juego: string;
  formato: string;
  region: string;
  rangoMin: string;
  rangoMax: string;
  latenciaMax: number;
  fechaHora: string; // El input "datetime-local" nos da el formato ISO correcto
  duracion: number;
  modalidad: string;
  descripcion: string;
  cupo: number;
  matchmakingStrategyType: string;
};

export default function CreateScrimPage() {
  const auth = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<ScrimFormData>({
    juego: "Valorant", // Valores por defecto
    formato: "FORMATO_5V5",
    region: "LATAM",
    rangoMin: "Oro",
    rangoMax: "Platino",
    latenciaMax: 100,
    fechaHora: "",
    duracion: 60,
    modalidad: "RANKED",
    descripcion: "",
    cupo: 10,
    matchmakingStrategyType: "BY_MMR",
  });
  const [error, setError] = useState<string | null>(null);

  // Proteger la ruta
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push("/login");
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  // Manejador genérico para todos los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  // Manejador para los Select
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar fecha futura (simple)
    if (new Date(formData.fechaHora) <= new Date()) {
      setError("La fecha y hora deben ser en el futuro.");
      return;
    }

    try {
      // Llamamos al endpoint POST /api/scrims
      await apiClient.post("/scrims", formData);
      // Si sale bien, redirigimos al dashboard
      router.push("/");
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detalles) {
        // Errores de validación del backend
        const detalles = err.response.data.detalles;
        const primerError = Object.values(detalles)[0];
        setError(`Error de validación: ${primerError}`);
      } else {
        setError("Ocurrió un error al crear el scrim.");
      }
    }
  };

  if (auth.loading || !auth.isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 md:p-8 flex justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Crear un Nuevo Scrim</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fila 1: Juego, Formato, Región */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="juego">Juego</Label>
                  <Select name="juego" value={formData.juego} onValueChange={(v) => handleSelectChange("juego", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Valorant">Valorant</SelectItem>
                      <SelectItem value="League of Legends">League of Legends</SelectItem>
                      <SelectItem value="CS2">CS2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formato">Formato</Label>
                  <Select name="formato" value={formData.formato} onValueChange={(v) => handleSelectChange("formato", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FORMATO_1V1">1 vs 1</SelectItem>
                      <SelectItem value="FORMATO_3V3">3 vs 3</SelectItem>
                      <SelectItem value="FORMATO_5V5">5 vs 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Región</Label>
                  <Select name="region" value={formData.region} onValueChange={(v) => handleSelectChange("region", v)}>
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

              {/* Fila 2: Rangos y Latencia */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rangoMin">Rango Mínimo</Label>
                  <Input name="rangoMin" value={formData.rangoMin} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rangoMax">Rango Máximo</Label>
                  <Input name="rangoMax" value={formData.rangoMax} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latenciaMax">Latencia Máxima (ms)</Label>
                  <Input name="latenciaMax" type="number" value={formData.latenciaMax} onChange={handleChange} />
                </div>
              </div>

              {/* Fila 3: Fecha, Duración, Cupo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaHora">Fecha y Hora</Label>
                  {/* Este input es clave, devuelve el formato ISO que LocalDateTime espera */}
                  <Input name="fechaHora" type="datetime-local" value={formData.fechaHora} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duracion">Duración (minutos)</Label>
                  <Input name="duracion" type="number" value={formData.duracion} onChange={handleChange} />
                </div>
                
                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                <div className="space-y-2">
                  {/* 1. Label cambiado */}
                  <Label htmlFor="cupo">Cupos adicionales</Label>
                  <Input 
                    name="cupo" 
                    type="number" 
                    value={formData.cupo} 
                    onChange={handleChange} 
                    placeholder="Ej: 1 (para 1v1), 9 (para 5v5)"
                  />
                  {/* 2. Texto de ayuda añadido */}
                  <p className="text-sm text-muted-foreground">
                    No te incluyas a ti (el organizador) en esta cuenta.
                  </p>
                </div>
                {/* --- FIN DE LA MODIFICACIÓN --- */}
                
              </div>
              
              {/* Fila 4: Modalidad y Estrategia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modalidad">Modalidad</Label>
                  <Select name="modalidad" value={formData.modalidad} onValueChange={(v) => handleSelectChange("modalidad", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RANKED">Ranked</SelectItem>
                      <SelectItem value="CASUAL">Casual</SelectItem>
                      <SelectItem value="PRACTICA">Práctica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="matchmakingStrategyType">Estrategia Matchmaking</Label>
                  <Select name="matchmakingStrategyType" value={formData.matchmakingStrategyType} onValueChange={(v) => handleSelectChange("matchmakingStrategyType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BY_MMR">Por Rango (MMR)</SelectItem>
                      {/* --- CORRECCIÓN DEL TYPO --- */}
                      <SelectItem value="BY_LATENCY">Por Latencia</SelectItem> 
                      {/* --- FIN DE LA CORRECCIÓN --- */}
                      <SelectItem value="BY_HISTORY">Por Historial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fila 5: Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción (opcional)</Label>
                <Textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Añade reglas o detalles extra..." />
              </div>

              {/* Error y Botón de Envío */}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <Button type="submit" className="w-full md:w-auto">Publicar Scrim</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

