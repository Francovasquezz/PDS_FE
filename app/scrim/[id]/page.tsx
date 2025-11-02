"use client";

import { useState, useEffect, useMemo } from "react"; // *** CAMBIO: agrego useMemo
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { Scrim, Postulacion } from "@/lib/types";
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
  XIcon, PlayIcon, StopCircleIcon, ClockIcon, ThumbsDownIcon
} from "lucide-react";

export default function ScrimDetailPage() {
  const router = useRouter();
  const params = useParams();
  const auth = useAuth();
  
  const id = params.id as string;

  const [scrim, setScrim] = useState<Scrim | null>(null);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);
  
  const [feedbackTarget, setFeedbackTarget] = useState<string>("");
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // --- VARIABLES DERIVADAS ---
  const isOwner = auth.user?.id === scrim?.organizadorId;

  // *** CAMBIO: calcular myPostulacion matcheando por usuario logueado,
  // en lugar de agarrar postulaciones[0]
const myPostulacion = useMemo(() => {
  if (isOwner) return null;
  if (!auth.user?.id && !auth.user?.username) return null;

  // 1. Intentar machear por usuarioId <-> auth.user.id (caso ideal)
  let mine = postulaciones.find(p => p.usuarioId === auth.user?.id);

  // 2. Si eso no funcionó (IDs distintos entre front/back), fallback por username
  if (!mine && auth.user?.username) {
    mine = postulaciones.find(p => p.username === auth.user?.username);
  }

  return mine || null;
}, [isOwner, postulaciones, auth.user]);

const hasConfirmed = myPostulacion?.estado === "ACEPTADA";

  // --- 1. FUNCIÓN PARA CARGAR TODOS LOS DATOS ---
  const fetchScrimData = async () => {
    if (!id || !auth.isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const scrimResponse = await apiClient.get<Scrim>(`/scrims/${id}`);
      setScrim(scrimResponse.data);

      // Siempre pedimos postulaciones; backend decide qué devolver
      const postResponse = await apiClient.get<Postulacion[]>(`/scrims/${id}/postulaciones`);
      setPostulaciones(postResponse.data);
      
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el Scrim.");
      toast.error("Error al cargar datos del Scrim.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar la página
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


  // --- 2. HANDLERS ---
  const handleAccept = async (postulacionId: string) => { 
    try {
      await apiClient.post(`/scrims/${id}/postulaciones/${postulacionId}/aceptar`);
      toast.success("Postulante aceptado.");
      setPostulaciones(prev => prev.map(p => p.id === postulacionId ? { ...p, estado: 'ACEPTADA' } : p));
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
      setScrim((prev) => prev ? { ...prev, estado: 'EN_JUEGO' } : prev);
    } catch (err: any) { toast.error(err.response?.data?.error || "Error al iniciar scrim."); }
  };

  const handleFinish = async () => { 
     try {
      await apiClient.post(`/scrims/${id}/finalizar`);
      toast.success("Scrim finalizado. Ya puedes cargar estadísticas.");
      setScrim((prev) => prev ? { ...prev, estado: 'FINALIZADO' } : prev);
    } catch (err: any) { toast.error(err.response?.data?.error || "Error al finalizar scrim."); }
  };

  const handleConfirm = async () => { 
    setIsConfirming(true);
    try {
      await apiClient.post(`/scrims/${id}/confirmaciones`);
      toast.success("¡Asistencia confirmada!");
      // *** CAMBIO: en lugar de pisar todo el array con [myPostulacion ...]
      // actualizamos SOLO mi postulación en el estado global
      setPostulaciones(prev => prev.map(p => {
        if (p.usuarioId === auth.user?.id) {
          return { ...p, estado: "ACEPTADA" };
        }
        return p;
      }));
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

  // --- 3. RENDERIZADO ---
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        
        {/* --- SECCIÓN 1: Detalles del Scrim --- */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl">{scrim.juego} - {scrim.formato.replace('FORMATO_', '')}</CardTitle>
              <Badge 
                variant={scrim.estado === 'BUSCANDO' ? 'default' : 'secondary'}
                className={`text-lg ${scrim.estado === 'BUSCANDO' ? 'bg-green-600' : ''}`}
              >
                {scrim.estado}
              </Badge>
            </div>
            <CardDescription>{scrim.descripcion || "Sin descripción."}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </CardContent>
        </Card>

        {/* --- SECCIÓN 2: Panel del Organizador --- */}
        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Panel del Organizador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Botones de Iniciar/Finalizar */}
              <div className="flex gap-4">
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
                  <Button variant="outline" disabled>Cargar Estadísticas (Próximamente)</Button>
                )}
              </div>
              
              {/* Tabla de Postulantes */}
              {scrim.estado === 'BUSCANDO' && (
                <div>
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

        {/* --- SECCIÓN 3: Paneles del Jugador --- */}
        
        {/* 3.1: Estado de la postulación */}
        {!isOwner && myPostulacion && (
          <Card>
            <CardHeader>
              <CardTitle>Estado de tu Postulación</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              {myPostulacion.estado === 'PENDIENTE' && (
                <>
                  <ClockIcon className="w-10 h-10 text-yellow-500" />
                  <span className="text-lg">
                    Tu postulación está <strong>PENDIENTE</strong>. El organizador la está revisando.
                  </span>
                </>
              )}
              {myPostulacion.estado === 'RECHAZADA' && (
                <>
                  <ThumbsDownIcon className="w-10 h-10 text-red-500" />
                  <span className="text-lg">
                    Tu postulación fue <strong>RECHAZADA</strong>.
                  </span>
                </>
              )}
              {myPostulacion.estado === 'ACEPTADA' && (
                <>
                  <CheckIcon className="w-10 h-10 text-green-500" />
                  <span className="text-lg">
                    ¡Has sido <strong>ACEPTADO</strong>!
                  </span>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* 3.2: Botón de Confirmar asistencia */}
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
        
        {/* 3.3: Formulario de Feedback */}
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
                        <SelectItem value="" disabled>No hay otros jugadores para evaluar.</SelectItem>
                      )}
                      {otherParticipants.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.username}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feedbackRating">Rating (1-5)</Label>
                  <Select
                    value={String(feedbackRating)}
                    onValueChange={(v) => setFeedbackRating(Number(v))}
                  >
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
