"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { Scrim, Postulacion, EstadisticaResponse } from "@/lib/types"; // <-- IMPORTAR EstadisticaResponse
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CalendarIcon, GlobeIcon, ShieldIcon, UsersIcon, CheckIcon, 
  XIcon, PlayIcon, StopCircleIcon, ClockIcon, ThumbsDownIcon,
  CalendarPlusIcon, Trash2Icon, TrophyIcon // <-- IMPORTAR TrophyIcon
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';


export default function ScrimDetailPage() {
  const router = useRouter();
  const params = useParams();
  const auth = useAuth();
  
  const id = params.id as string;

  const [scrim, setScrim] = useState<Scrim | null>(null);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  // --- NUEVO ESTADO PARA STATS ---
  const [estadisticas, setEstadisticas] = useState<EstadisticaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);
  
  const [feedbackTarget, setFeedbackTarget] = useState<string>("");
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const isOwner = auth.user?.id === scrim?.organizadorId;
  const myPostulacion = !isOwner
    ? postulaciones.find(p => p.usuarioId === auth.user?.id) ?? null
    : null;

  const hasConfirmed = myPostulacion?.hasConfirmed || false; 

  // --- FUNCIÓN DE CARGA MODIFICADA ---
  const fetchScrimData = async () => {
    if (!id || !auth.isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      setEstadisticas([]); // Limpiar stats viejas

      // 1. Cargar Scrim
      const scrimResponse = await apiClient.get<Scrim>(`/scrims/${id}`);
      const scrimData = scrimResponse.data;
      setScrim(scrimData);
      
      // 2. Cargar Postulaciones
      // (Recordar que el backend ahora las filtra según el estado del scrim)
      const postResponse = await apiClient.get<Postulacion[]>(`/scrims/${id}/postulaciones`);
      setPostulaciones(postResponse.data);

      // 3. Si el Scrim está FINALIZADO, cargar Estadísticas
      if (scrimData.estado === 'FINALIZADO') {
        try {
          const statsResponse = await apiClient.get<EstadisticaResponse[]>(`/scrims/${id}/estadisticas`);
          setEstadisticas(statsResponse.data);
        } catch (statsErr: any) {
          // Si da 403 (aún no cargadas) o 404, no es un error crítico.
          if (statsErr.response?.status !== 404 && statsErr.response?.status !== 403) {
             console.error("Error al cargar estadísticas:", statsErr);
             toast.error("No se pudieron cargar las estadísticas.");
          }
          // Si no hay stats, simplemente `estadisticas` queda como array vacío
        }
      }
      
    } catch (err) { 
      console.error(err);
      setError("No se pudo cargar el Scrim.");
      toast.error("Error al cargar datos del Scrim.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos
  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        router.push("/login");
      } else {
        fetchScrimData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, auth.loading, auth.isAuthenticated, router]);

  
  // --- Handlers (sin cambios) ---
  const handleAccept = async (postulacionId: string) => { 
    try {
      await apiClient.post(`/scrims/${id}/postulaciones/${postulacionId}/aceptar`);
      toast.success("Postulante aceptado.");
      fetchScrimData(); // Recargar datos
    } catch (err: any) { toast.error(err.response?.data?.error || "Error al aceptar."); }
  };
  const handleReject = async (postulacionId: string) => { 
    try {
      await apiClient.post(`/scrims/${id}/postulaciones/${postulacionId}/rechazar`);
      toast.success("Postulante rechazado.");
      setPostulaciones(prev => prev.map(p => p.id === postulacionId ? { ...p, estado: 'RECHAZADA' } : p));
    } catch (err: any) { toast.error(err.response?.data?.error || "Error al rechazar."); }
  };
  const handleStart = async () => { 
    try {
      await apiClient.post(`/scrims/${id}/iniciar`);
      toast.success("¡Scrim iniciado!");
      if (scrim) setScrim({ ...scrim, estado: 'EN_JUEGO' });
    } catch (err: any) { toast.error(err.response?.data?.error || "Error al iniciar scrim."); }
  };
  const handleFinish = async () => { 
     try {
      await apiClient.post(`/scrims/${id}/finalizar`);
      toast.success("Scrim finalizado. Ya puedes cargar estadísticas.");
      fetchScrimData(); // Recargar para que aparezca el botón de stats
    } catch (err: any) { toast.error(err.response?.data?.error || "Error al finalizar scrim."); }
  };
  const handleCancel = async () => {
    // Reemplazamos window.confirm por un modal simple (o quitamos la confirmación)
    // Por simplicidad, quitamos la confirmación. 
    // Idealmente, aquí iría un <AlertDialog> de shadcn.
    /* if (!window.confirm("¿Estás seguro de que quieres cancelar este Scrim? Esta acción no se puede deshacer.")) {
      return;
    }
    */
    try {
      await apiClient.post(`/scrims/${id}/cancelar`);
      toast.success("Scrim cancelado exitosamente.");
      if (scrim) setScrim({ ...scrim, estado: 'CANCELADO' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al cancelar el scrim.");
    }
  };
  
  const handleConfirm = async () => { 
    setIsConfirming(true);
    try {
      await apiClient.post(`/scrims/${id}/confirmaciones`);
      toast.success("¡Asistencia confirmada!");
      // Actualizamos el estado local
      if (myPostulacion) {
          // Creamos una nueva lista de postulaciones actualizada
          setPostulaciones(prev => 
              prev.map(p => 
                  p.id === myPostulacion.id ? { ...p, hasConfirmed: true } : p
              )
          );
      }
      fetchScrimData(); // Recargar datos por si el Scrim cambia a CONFIRMADO
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al confirmar.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => { 
    e.preventDefault();
    if (!feedbackTarget) {
      toast.error("Debes seleccionar un jugador para evaluar.");
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      const body = { targetUserId: feedbackTarget, rating: feedbackRating, comment: feedbackComment };
      await apiClient.post(`/scrims/${id}/feedback`, body);
      toast.success("¡Feedback enviado! Gracias.");
      setFeedbackTarget("");
      setFeedbackRating(5);
      setFeedbackComment("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al enviar feedback.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // --- RENDERIZADO ---
  if (loading || auth.loading || !scrim) {
     return (
       <div className="flex flex-col min-h-screen">
         <Header />
         <main className="flex-1 flex items-center justify-center">Cargando...</main>
       </div>
     );
  }
  
  if (error) {
     return (
       <div className="flex flex-col min-h-screen">
         <Header />
         <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
           <h1 className="text-2xl text-red-500">{error}</h1>
         </main>
       </div>
     );
  }

  const otherParticipants = postulaciones
    .filter(p => p.estado === 'ACEPTADA' && p.usuarioId !== auth.user?.id)
    .map(p => ({ id: p.usuarioId, username: p.username || p.usuarioId }));
    
  const canCancel = scrim.estado === 'BUSCANDO' || scrim.estado === 'LOBBY_ARMADO' || scrim.estado === 'CONFIRMADO';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        
        {/* --- SECCIÓN 1: Detalles del Scrim (Sin cambios) --- */}
        <Card>
          {/* ... (código de detalles) ... */}
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl">{scrim.juego} - {scrim.formato.replace('FORMATO_', '')}</CardTitle>
              <Badge 
                variant={scrim.estado === 'BUSCANDO' ? 'default' : (scrim.estado === 'CANCELADO' ? 'destructive' : 'secondary')}
                className={`text-lg ${scrim.estado === 'BUSCANDO' ? 'bg-green-600' : ''}`}
              >
                {scrim.estado}
              </Badge>
            </div>
            <CardDescription>{scrim.descripcion || "Sin descripción."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <ShieldIcon className="w-5 h-5" />
                <span className="text-lg">Rango: {scrim.rangoMin} - {scrim.rangoMax}</span>
              </div>
              <div className="flex items-center gap-2">
                <GlobeIcon className="w-5 h-5" />
                <span className="text-lg">Región: {scrim.region}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <span className="text-lg">{new Date(scrim.fechaHora).toLocaleString('es-AR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                <span className="text-lg">Cupo: {scrim.cupo} jugadores</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button asChild variant="outline">
                <a href={`${API_BASE_URL}/scrims/${id}/calendar`} download>
                  <CalendarPlusIcon className="w-4 h-4 mr-2" />
                  Añadir al Calendario
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- SECCIÓN 2: Panel del Organizador (Modificado) --- */}
        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Panel del Organizador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Botones de Acción */}
              <div className="flex flex-wrap gap-4">
                {scrim.estado === 'CONFIRMADO' && (
                  <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700">
                    <PlayIcon className="w-4 h-4 mr-2" /> Iniciar Scrim
                  </Button>
                )}
                {scrim.estado === 'EN_JUEGO' && (
                  <Button onClick={handleFinish} variant="destructive">
                    <StopCircleIcon className="w-4 h-4 mr-2" /> Finalizar Scrim
                  </Button>
                )}
                {scrim.estado === 'FINALIZADO' && (
                  <Button asChild>
                    <Link href={`/scrim/${id}/stats`}>
                      {/* Si no hay stats, es "Cargar". Si hay, es "Editar". */}
                      {estadisticas.length === 0 ? "Cargar Estadísticas" : "Editar Estadísticas"}
                    </Link>
                  </Button>
                )}
                {canCancel && (
                  <Button onClick={handleCancel} variant="destructive" className="bg-red-700 hover:bg-red-800">
                    <Trash2Icon className="w-4 h-4 mr-2" /> Cancelar Scrim
                  </Button>
                )}
              </div>
              
              {/* Tabla de Postulantes */}
              {scrim.estado === 'BUSCANDO' && (
                <div>
                  {/* ... (código de la tabla) ... */}
                  <h3 className="text-lg font-medium mb-2">Postulantes</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Rol Deseado</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {postulaciones.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center">Aún no hay postulantes.</TableCell></TableRow>
                      )}
                      {postulaciones.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.username || p.usuarioId}</TableCell>
                          <TableCell>{p.rolDeseado}</TableCell>
                          <TableCell>
                            <Badge variant={p.estado === 'ACEPTADA' ? 'default' : (p.estado === 'RECHAZADA' ? 'destructive' : 'secondary')}>
                              {p.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="ghost" size="icon" 
                              className="text-green-500" 
                              disabled={p.estado !== 'PENDIENTE'}
                              onClick={() => handleAccept(p.id)}
                            >
                              <CheckIcon className="w-5 h-5" />
                            </Button>
                            <Button 
                              variant="ghost" size="icon" 
                              className="text-red-500"
                              disabled={p.estado !== 'PENDIENTE'}
                              onClick={() => handleReject(p.id)}
                            >
                              <XIcon className="w-5 h-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* --- SECCIÓN 3: Paneles del Jugador (CORREGIDOS) --- */}
        
        {/* 3.1: Muestra el estado de la postulación */}
        {!isOwner && myPostulacion && (scrim.estado !== 'FINALIZADO') && (
          <Card>
            <CardHeader>
              <CardTitle>Estado de tu Postulación</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              {myPostulacion.estado === 'PENDIENTE' && (
                <>
                  <ClockIcon className="w-10 h-10 text-yellow-500" />
                  <span className="text-lg">Tu postulación está **PENDIENTE**. El organizador la está revisando.</span>
                </>
              )}
              {myPostulacion.estado === 'RECHAZADA' && (
                <>
                  <ThumbsDownIcon className="w-10 h-10 text-red-500" />
                  <span className="text-lg">Tu postulación fue **RECHAZADA**.</span>
                </>
              )}
              {myPostulacion.estado === 'ACEPTADA' && (
                <>
                  <CheckIcon className="w-10 h-10 text-green-500" />
                  <span className="text-lg">¡Has sido **ACEPTADO**!</span>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* 3.2: Muestra el botón de Confirmar */}
        {!isOwner && myPostulacion && myPostulacion.estado === 'ACEPTADA' && scrim.estado === 'LOBBY_ARMADO' && (
            <Card>
              <CardHeader>
                  <CardTitle>¡Confirma tu participación!</CardTitle>
                  <CardDescription>
                  ¡Has sido aceptado y el lobby está lleno! Confirma tu asistencia para asegurar tu lugar.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  disabled={isConfirming || hasConfirmed}
                  onClick={handleConfirm}
                >
                  {isConfirming ? "Confirmando..." : (hasConfirmed ? "¡Confirmado!" : "Confirmar Asistencia")}
                </Button>
              </CardContent>
            </Card>
        )}
        
        {/* --- SECCIÓN 4: ESTADÍSTICAS (NUEVA) --- */}
        {/* Se muestra a TODOS si el scrim finalizó y hay stats */}
        {scrim.estado === 'FINALIZADO' && estadisticas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Finales</CardTitle>
              <CardDescription>Resultados de la partida cargados por el organizador.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jugador</TableHead>
                    <TableHead className="text-center">Kills</TableHead>
                    <TableHead className="text-center">Deaths</TableHead>
                    <TableHead className="text-center">Assists</TableHead>
                    <TableHead className="text-right">MVP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estadisticas.map(stat => (
                    <TableRow key={stat.id}>
                      <TableCell className="font-medium">{stat.username}</TableCell>
                      <TableCell className="text-center">{stat.kills}</TableCell>
                      <TableCell className="text-center">{stat.deaths}</TableCell>
                      <TableCell className="text-center">{stat.assists}</TableCell>
                      <TableCell className="text-right">
                        {stat.mvp && <TrophyIcon className="w-5 h-5 text-yellow-500 inline" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        
        {/* 3.3: Muestra el formulario de Feedback (Ahora SECCIÓN 5) */}
        {!isOwner && myPostulacion && myPostulacion.estado === 'ACEPTADA' && scrim.estado === 'FINALIZADO' && (
           <Card>
            <CardHeader>
              <CardTitle>Dejar Feedback</CardTitle>
              <CardDescription>
                El Scrim ha finalizado. Puedes dejar tu feedback sobre otros jugadores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedbackTarget">Jugador a evaluar</Label>
                  <Select value={feedbackTarget} onValueChange={setFeedbackTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un jugador..." />
                    </SelectTrigger>
                    <SelectContent>
                      {otherParticipants.length === 0 && (
                        /* Corregimos el crash del value="" */
                        <SelectItem value="no-players" disabled>No hay otros jugadores para evaluar.</SelectItem>
                      )}
                      {otherParticipants.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.username}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feedbackRating">Rating (1-5)</Label>
                   <Select value={String(feedbackRating)} onValueChange={(v) => setFeedbackRating(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 ★ (Excelente)</SelectItem>
                      <SelectItem value="4">4 ★ (Bueno)</SelectItem>
                      <SelectItem value="3">3 ★ (Regular)</SelectItem>
                      <SelectItem value="2">2 ★ (Malo)</SelectItem>
                      <SelectItem value="1">1 ★ (Pobre)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedbackComment">Comentario (opcional)</Label>
                  <Textarea 
                    id="feedbackComment"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Describe tu experiencia con este jugador..."
                  />
                </div>
                
                <Button type="submit" disabled={isSubmittingFeedback || !feedbackTarget}>
                  {isSubmittingFeedback ? "Enviando..." : "Enviar Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
}
