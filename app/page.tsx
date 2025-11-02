"use client"; 

import { useEffect, useState } from 'react'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; 
import { Header } from "@/components/header"; 
import FiltersBar from "@/components/filters-bar"; 
import ScrimsGrid from "@/components/scrims-grid";
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/apiClient'; // <-- 1. Importar apiClient
import { Scrim } from '@/lib/types'; // <-- 2. Importar Scrim

export interface ScrimFilters {
  juego?: string;
  region?: string;
  rangoMin?: string;
  formato?: string;
}

export default function Home() {
  const auth = useAuth(); 
  const router = useRouter();
  
  const [filters, setFilters] = useState<ScrimFilters>({});
  
  // --- 3. AÑADIR ESTADOS DE DATOS ---
  const [scrims, setScrims] = useState<Scrim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/login');
    }
  }, [auth.loading, auth.isAuthenticated, router]); 

  // --- 4. AÑADIR LÓGICA DE CARGA (la que movimos de ScrimsGrid) ---
  useEffect(() => {
    if (!auth.isAuthenticated) return; // No buscar si no estoy logueado

    const fetchScrims = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const hasFilters = Object.values(filters).some(val => val);
        const response = await apiClient.get<Scrim[]>('/scrims', { 
            params: hasFilters ? filters : undefined 
        });
        
        setScrims(response.data);
      } catch (err) {
        setError('No se pudieron cargar los scrims.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScrims();
  }, [filters, auth.isAuthenticated]); // Depende de filters y auth
  // --- FIN DE LÓGICA DE CARGA ---

  if (auth.loading || !auth.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    ); 
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 md:p-8">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Scrims Disponibles</h1>
          <Button asChild>
            <Link href="/create-scrim">Crear Scrim</Link>
          </Button>
        </div>
        
        <FiltersBar onSearch={setFilters} />
        
        {/* --- 5. PASAR PROPS A SCRIMSGRID --- */}
        <ScrimsGrid 
          scrims={scrims} 
          loading={loading} 
          error={error} 
          emptyMessage="No se encontraron scrims con esos filtros."
        />
        
      </main>
    </div>
  );
}