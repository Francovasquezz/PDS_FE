// app/page.tsx

"use client"; 

import { useEffect, useState } from 'react'; // <-- 1. Importar useState
import { useRouter } from 'next/navigation'; 
import { useAuth } from '@/context/AuthContext'; 
import { Header } from "@/components/header"; 
import FiltersBar from "@/components/filters-bar"; 
import ScrimsGrid from "@/components/scrims-grid"; 

// Definimos un tipo para los filtros
export interface ScrimFilters {
  juego?: string;
  region?: string;
  rangoMin?: string;
}

export default function Home() {
  const auth = useAuth(); 
  const router = useRouter();
  
  // --- 2. Añadir estado para los filtros ---
  const [filters, setFilters] = useState<ScrimFilters>({});

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/login');
    }
  }, [auth.loading, auth.isAuthenticated, router]); 

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
        <h1 className="text-3xl font-bold mb-6">Scrims Disponibles</h1>
        
        {/* --- 3. Pasar la función setFilters al componente --- */}
        <FiltersBar onSearch={setFilters} />
        
        {/* --- 4. Pasar los filtros actuales a la grilla --- */}
        <ScrimsGrid filters={filters} />
        
      </main>
    </div>
  );
}