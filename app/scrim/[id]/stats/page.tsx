"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/apiClient';
import { User, EstadisticaRequest } from '@/lib/types'; 
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2Icon } from 'lucide-react';

// Estado local para cada fila de estadística
type StatRow = Omit<EstadisticaRequest, 'usuarioId'> & {
  usuarioId: string; 
  username: string; 
};

export default function StatsPage() {
  const router = useRouter();
  const params = useParams();
  const auth = useAuth();
  const id = params.id as string;

  const [participantes, setParticipantes] = useState<User[]>([]);
  const [stats, setStats] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!id || !auth.isAuthenticated) return;

    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<User[]>(`/scrims/${id}/participants`);
        
        const allParticipants = res.data;
        setParticipantes(allParticipants);

        setStats(allParticipants.map(p => ({
          usuarioId: p.id,
          username: p.username,
          mvp: false,
          kills: 0,
          deaths: 0,
          assists: 0,
          observaciones: '', // Inicializado como string vacío
        })));

      } catch (err) {
        console.error(err);
        toast.error('No se pudieron cargar los participantes.');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [id, auth.isAuthenticated, auth.loading, router]);

  const handleStatChange = (
    usuarioId: string, 
    field: keyof Omit<StatRow, 'usuarioId' | 'username'>, 
    value: string | number | boolean
  ) => {
    setStats(prevStats =>
      prevStats.map(stat =>
        stat.usuarioId === usuarioId ? { ...stat, [field]: value } : stat
      )
    );
  };

  const handleMvpChange = (usuarioId: string, checked: boolean) => {
    setStats(prevStats =>
      prevStats.map(stat => ({
        ...stat,
        mvp: stat.usuarioId === usuarioId ? checked : (checked ? false : stat.mvp),
      }))
    );
  };
  
  const removeParticipant = (usuarioId: string) => {
     setStats(prevStats => prevStats.filter(stat => stat.usuarioId !== usuarioId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stats.length === 0) {
      toast.error("No hay estadísticas para enviar.");
      return;
    }
    
    setIsSubmitting(true);

    const payload: EstadisticaRequest[] = stats.map(({ username, ...rest }) => rest);

    try {
      await apiClient.post(`/scrims/${id}/estadisticas`, payload);
      toast.success("¡Estadísticas guardadas!");
      router.push(`/scrim/${id}`); 
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error al guardar estadísticas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || auth.loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">Cargando participantes...</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle>Cargar Estadísticas</CardTitle>
            <CardDescription>
              Ingresa los resultados para los jugadores que participaron en el Scrim. 
              Si alguien fue suplente o no jugó, puedes eliminarlo de la lista.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jugador</TableHead>
                      <TableHead>Kills</TableHead>
                      <TableHead>Deaths</TableHead>
                      <TableHead>Assists</TableHead>
                      <TableHead>MVP</TableHead>
                      <TableHead>Observaciones</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.map((stat) => (
                      <TableRow key={stat.usuarioId}>
                        <TableCell className="font-medium">{stat.username}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={stat.kills}
                            onChange={(e) => handleStatChange(stat.usuarioId, 'kills', parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={stat.deaths}
                            onChange={(e) => handleStatChange(stat.usuarioId, 'deaths', parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={stat.assists}
                            onChange={(e) => handleStatChange(stat.usuarioId, 'assists', parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={stat.mvp}
                            onCheckedChange={(checked) => handleMvpChange(stat.usuarioId, !!checked)}
                          />
                        </TableCell>
                        <TableCell>
                          {/* --- AQUÍ ESTÁ EL ARREGLO --- */}
                          {/* Añadimos '?? ""' para manejar el tipo 'null' o 'undefined' */}
                          <Textarea
                            value={stat.observaciones ?? ''} 
                            onChange={(e) => handleStatChange(stat.usuarioId, 'observaciones', e.target.value)}
                            placeholder="Comentarios..."
                            className="min-w-[150px]"
                          />
                        </TableCell>
                        <TableCell>
                           <Button 
                             type="button" 
                             variant="ghost" 
                             size="icon" 
                             onClick={() => removeParticipant(stat.usuarioId)}
                             aria-label="Eliminar fila"
                           >
                             <Trash2Icon className="w-4 h-4 text-red-500" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button type="submit" disabled={isSubmitting || stats.length === 0} className="w-full">
                {isSubmitting ? "Guardando..." : "Guardar Estadísticas"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

