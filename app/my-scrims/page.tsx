"use client"; 

import { useEffect, useState } from 'react'; 
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; 
import { Header } from "@/components/header"; 
import ScrimsGrid from "@/components/scrims-grid";
import apiClient from '@/lib/apiClient';
import { MyScrimResponse } from '@/lib/types'; // <-- 1. IMPORTAR NUEVO TIPO

export default function MyScrimsPage() {
  const auth = useAuth(); 
  const router = useRouter();
  
  // --- 2. CAMBIAR EL TIPO DE ESTADO ---
  const [myScrimsData, setMyScrimsData] = useState<MyScrimResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proteger la ruta
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/login');
    }
  }, [auth.loading, auth.isAuthenticated, router]); 

  // Cargar datos
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const fetchMyScrims = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // --- 3. LA LLAMADA AHORA DEVUELVE EL NUEVO DTO ---
        const response = await apiClient.get<MyScrimResponse[]>('/scrims/my-scrims');
        
        setMyScrimsData(response.data); // <-- Guardar los nuevos datos
      } catch (err) {
        setError('No se pudieron cargar tus scrims.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyScrims();
  }, [auth.isAuthenticated]);

  if (auth.loading || !auth.isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 md:p-8">
        
        <h1 className="text-3xl font-bold mb-6">Mis Scrims</h1>
        <p className="text-muted-foreground mb-6">
          Aquí aparecen los Scrims que organizaste y aquellos a los que te postulaste.
        </p>
        
        {/* --- 4. PASAR LOS NUEVOS DATOS A SCRIMSGRID --- */}
        <ScrimsGrid 
          myScrimsData={myScrimsData} // <-- Prop nueva
          loading={loading} 
          error={error} 
          emptyMessage="Aún no tienes scrims."
        />
        
      </main>
    </div>
  );
}