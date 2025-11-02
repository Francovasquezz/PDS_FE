"use client"; 

import { useState } from "react"; 
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; 
import { CalendarIcon, GlobeIcon, ShieldIcon } from "lucide-react"; 
import apiClient from "@/lib/apiClient"; 
import { Scrim, MyScrimResponse } from "@/lib/types"; // <-- 1. Importar MyScrimResponse
import { useAuth } from "@/context/AuthContext"; 
import { toast } from "sonner"; 

// --- 2. ACTUALIZAR PROPS ---
interface ScrimsGridProps {
  scrims?: Scrim[]; // Para el dashboard
  myScrimsData?: MyScrimResponse[]; // Para "Mis Scrims"
  loading: boolean;
  error: string | null;
  emptyMessage?: string; 
}

export default function ScrimsGrid({ scrims, myScrimsData, loading, error, emptyMessage }: ScrimsGridProps) {
  const auth = useAuth(); 
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [appliedScrims, setAppliedScrims] = useState<Set<string>>(new Set()); 

  const handlePostular = async (scrim: Scrim) => {
    // (Esta función no cambia)
    if (auth.user?.id === scrim.organizadorId) {
      toast.error("No puedes postularte a tu propio Scrim.");
      return;
    }
    setApplyingTo(scrim.id);
    const body = { rolDeseado: "Jugador", latenciaReportada: 50 };
    try {
      await apiClient.post(`/scrims/${scrim.id}/postulaciones`, body);
      toast.success(`¡Postulación enviada para el Scrim de ${scrim.juego}!`);
      setAppliedScrims(prev => new Set(prev).add(scrim.id));
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Error al postularse. Intenta de nuevo.");
      }
      console.error(err);
    } finally {
      setApplyingTo(null);
    }
  };

  // --- 3. LÓGICA DE RENDERIZADO (MANEJAR AMBOS TIPOS DE LISTA) ---
  if (loading) {
    return <div className="text-center">Cargando scrims...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  // Determinar qué lista usar
  const itemsToRender = myScrimsData ? myScrimsData : scrims;

  if (!itemsToRender || itemsToRender.length === 0) {
    return <div className="text-center">{emptyMessage || "No se encontraron scrims."}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {itemsToRender.map((item) => {
        // --- 4. EXTRAER DATOS ---
        const scrim: Scrim = (item as MyScrimResponse).scrim ? (item as MyScrimResponse).scrim : (item as Scrim);
        const postulationState = (item as MyScrimResponse).postulationState || null;
        
        // Lógica de botones (no cambia)
        const isOwner = auth.user?.id === scrim.organizadorId;
        const isSearching = scrim.estado === 'BUSCANDO';
        const isApplying = applyingTo === scrim.id;
        const hasApplied = appliedScrims.has(scrim.id) || postulationState === 'PENDIENTE' || postulationState === 'ACEPTADA';

        let buttonText = "Postularse";
        let buttonDisabled = false;

        if (isOwner) {
          // No seteamos texto, se reemplaza por el botón de Administrar
        } else if (hasApplied) {
          buttonText = postulationState ? `Estado: ${postulationState}` : "¡Postulado!";
          buttonDisabled = true;
        } else if (isApplying) {
          buttonText = "Postulando...";
          buttonDisabled = true;
        } else if (!isSearching) {
          buttonText = "Cerrado";
          buttonDisabled = true;
        }
        
        return (
          <Card key={scrim.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                {isOwner ? (
                  <CardTitle>{scrim.juego} - {scrim.formato.replace('FORMATO_', '')}</CardTitle>
                ) : (
                  <Link href={`/scrim/${scrim.id}`} className="hover:underline">
                    <CardTitle>{scrim.juego} - {scrim.formato.replace('FORMATO_', '')}</CardTitle>
                  </Link>
                )}
                
                {/* --- 5. MOSTRAR EL BADGE CORRECTO --- */}
                {postulationState ? (
                  // Si estamos en "Mis Scrims", mostramos el estado de la postulación
                  <Badge
                    variant={postulationState === 'ACEPTADA' ? 'default' : (postulationState === 'RECHAZADA' ? 'destructive' : 'secondary')}
                    className={postulationState === 'ACEPTADA' ? 'bg-green-600' : ''}
                  >
                    {postulationState}
                  </Badge>
                ) : (
                  // Si estamos en el Dashboard general, mostramos el estado del Scrim
                  <Badge 
                    variant={scrim.estado === 'BUSCANDO' ? 'default' : 'secondary'}
                    className={scrim.estado === 'BUSCANDO' ? 'bg-green-600' : ''}
                  >
                    {scrim.estado}
                  </Badge>
                )}
                {/* --- FIN DEL CAMBIO DE BADGE --- */}
                
              </div>
              <CardDescription>ID: {scrim.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* (Contenido de la card sin cambios) */}
              <div className="flex items-center gap-2">
                <ShieldIcon className="w-4 h-4" />
                <span>Rango: {scrim.rangoMin} - {scrim.rangoMax}</span>
              </div>
              <div className="flex items-center gap-2">
                <GlobeIcon className="w-4 h-4" />
                <span>Región: {scrim.region}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{new Date(scrim.fechaHora).toLocaleString('es-AR')}</span>
              </div>
            </CardContent>
            
            <CardFooter>
              {isOwner ? (
                // Si soy el dueño, muestro un link para "Administrar"
                <Button asChild className="w-full">
                  <Link href={`/scrim/${scrim.id}`}>Administrar Scrim</Link>
                </Button>
              ) : (
                // Si no soy el dueño, muestro el botón "Postularse"
                <Button 
                  className="w-full" 
                  disabled={buttonDisabled}
                  onClick={() => handlePostular(scrim)}
                >
                  {buttonText}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}