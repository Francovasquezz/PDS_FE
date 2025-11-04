"use client"; 

import { useState } from "react"; 
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; 
import { CalendarIcon, GlobeIcon, ShieldIcon, CalendarPlusIcon } from "lucide-react"; 
import apiClient from "@/lib/apiClient"; 
import { Scrim, MyScrimResponse } from "@/lib/types";
import { useAuth } from "@/context/AuthContext"; 
import { toast } from "sonner"; 
import { cn } from "@/lib/utils"; // <-- 1. Importar 'cn' para clases condicionales

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ScrimsGridProps {
  scrims?: Scrim[]; 
  myScrimsData?: MyScrimResponse[];
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

  if (loading) {
    return <div className="text-center">Cargando scrims...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const itemsToRender = myScrimsData ? myScrimsData : scrims;

  if (!itemsToRender || itemsToRender.length === 0) {
    return <div className="text-center">{emptyMessage || "No se encontraron scrims."}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {itemsToRender.map((item) => {
        
        // --- 2. LÓGICA DE DATOS Y ESTADO (REFACTORIZADA) ---
        const scrim: Scrim = (item as MyScrimResponse).scrim ? (item as MyScrimResponse).scrim : (item as Scrim);
const postulationState =
  (item as MyScrimResponse).postulacionState ??
  (item as MyScrimResponse).postulationState ??
  null;

        
        const isOwner = auth.user?.id === scrim.organizadorId;
        const isMyScrimsPage = !!myScrimsData;
        const isCancelled = scrim.estado === 'CANCELADO'; // <-- ¡NUESTRA VARIABLE CLAVE!

        // --- Lógica de Badge ---
        let badge: React.ReactNode;
        if (isCancelled) {
            badge = <Badge variant="destructive">CANCELADO</Badge>;
        } else if (isMyScrimsPage && postulationState) {
            badge = <Badge
                      variant={postulationState === 'ACEPTADA' ? 'default' : (postulationState === 'RECHAZADA' ? 'destructive' : 'secondary')}
                      className={postulationState === 'ACEPTADA' ? 'bg-green-600' : ''}
                    >
                      {postulationState}
                    </Badge>;
        } else {
            badge = <Badge 
                      variant={scrim.estado === 'BUSCANDO' ? 'default' : 'secondary'}
                      className={scrim.estado === 'BUSCANDO' ? 'bg-green-600' : ''}
                    >
                      {scrim.estado}
                    </Badge>;
        }

        // --- Lógica de Footer ---
        let footer: React.ReactNode;
        if (isCancelled) {
            // 1. Scrim está CANCELADO
            footer = <Button variant="destructive" disabled className="w-full">Scrim Cancelado</Button>;
        } else if (isOwner) {
            // 2. Soy el Organizador (y no está cancelado)
            footer = <Button asChild className="w-full"><Link href={`/scrim/${scrim.id}`}>Administrar Scrim</Link></Button>;
        } else if (isMyScrimsPage) {
            // 3. Estoy en "Mis Scrims" (no soy dueño, no cancelado)
            footer = (
                <>
                    <Button asChild className="flex-1" variant="secondary"><Link href={`/scrim/${scrim.id}`}>Ver Detalle</Link></Button>
                    {(postulationState === 'ACEPTADA' || scrim.estado === 'CONFIRMADO') && (
                        <Button asChild variant="outline" size="icon" title="Añadir al Calendario">
                            <a href={`${API_BASE_URL}/scrims/${scrim.id}/calendar`} download><CalendarPlusIcon className="w-4 h-4" /></a>
                        </Button>
                    )}
                </>
            );
        } else {
            // 4. Estoy en el Dashboard general (no dueño, no cancelado)
            const isApplying = applyingTo === scrim.id;
            const hasApplied = appliedScrims.has(scrim.id);
            const isSearching = scrim.estado === 'BUSCANDO';
            footer = (
                <Button 
                  className="w-full" 
                  disabled={isApplying || hasApplied || !isSearching}
                  onClick={() => handlePostular(scrim)}
                >
                  {isApplying ? "Postulando..." : (hasApplied ? "¡Postulado!" : "Postularse")}
                </Button>
            );
        }

        return (
          // --- 3. APLICAR CLASES CONDICIONALES A LA TARJETA ---
          <Card key={scrim.id} className={cn(isCancelled && "border-destructive/50 opacity-60")}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <Link href={`/scrim/${scrim.id}`} className="hover:underline">
                  <CardTitle>{scrim.juego} - {scrim.formato.replace('FORMATO_', '')}</CardTitle>
                </Link>
                {badge}
              </div>
              <CardDescription>ID: {scrim.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
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
            
            <CardFooter className="flex gap-2">
              {footer}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}