// components/scrims-grid.tsx

"use client"; 

import { useState, useEffect } from "react"; 
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; 
import { CalendarIcon, GlobeIcon, ShieldIcon } from "lucide-react"; 
import apiClient from "@/lib/apiClient"; 
import { Scrim } from "@/lib/types"; 
import { ScrimFilters } from "@/app/page"; // <-- 1. Importar el tipo

// 2. Definir el tipo de las props que recibirá
interface ScrimsGridProps {
  filters: ScrimFilters;
}

export default function ScrimsGrid({ filters }: ScrimsGridProps) {
  const [scrims, setScrims] = useState<Scrim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Este useEffect AHORA DEPENDE DE LOS FILTROS
  useEffect(() => {
    const fetchScrims = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 4. Lógica para decidir a qué endpoint llamar
        const hasFilters = Object.values(filters).some(val => val); // Revisa si hay algún filtro
        let response;

        if (hasFilters) {
          // Llama al endpoint de búsqueda (confirmado por tu Swagger)
          response = await apiClient.get<Scrim[]>('/scrims/search', {
            params: filters, // Axios se encarga de armar la query string
          });
        } else {
          // Llama al endpoint general
          response = await apiClient.get<Scrim[]>('/scrims'); 
        }
        
        setScrims(response.data);
      } catch (err) {
        setError('No se pudieron cargar los scrims.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScrims();
  }, [filters]); // <-- 5. Se ejecuta cada vez que 'filters' cambia

  if (loading) {
    return <div className="text-center">Cargando scrims...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (scrims.length === 0) {
    return <div className="text-center">No se encontraron scrims con esos filtros.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scrims.map((scrim) => (
        <Card key={scrim.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{scrim.juego} - {scrim.formato.replace('FORMATO_', '')}</CardTitle>
              <Badge 
                variant={scrim.estado === 'BUSCANDO' ? 'default' : 'secondary'}
                className={scrim.estado === 'BUSCANDO' ? 'bg-green-600' : ''}
              >
                {scrim.estado}
              </Badge>
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
          <CardFooter>
            <Button className="w-full" disabled={scrim.estado !== 'BUSCANDO'}>
              Postularse
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}