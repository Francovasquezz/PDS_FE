"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { Feedback, ModerationStateUpdate } from "@/lib/types";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card"; // <-- ¡AQUÍ ESTÁ LA LÍNEA QUE FALTABA!

export default function ModerationPage() {
  const auth = useAuth();
  const router = useRouter();
  const [pendingFeedback, setPendingFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 1. LÓGICA DE SEGURIDAD Y CARGA DE DATOS ---
  useEffect(() => {
    // Proteger la ruta a nivel de cliente
    if (!auth.loading) {
      if (!auth.isAuthenticated || auth.user?.rol !== 'ADMIN') {
        toast.error("Acceso Denegado", { description: "No tienes permisos para ver esta página." });
        router.push('/'); // Redirigir si no es admin
        return;
      }
    }

    // Si es Admin, cargar los datos
    if (auth.isAuthenticated && auth.user?.rol === 'ADMIN') {
      const fetchPendingFeedback = async () => {
        try {
          setLoading(true);
          // Llamamos al endpoint del FeedbackController
          const response = await apiClient.get<Feedback[]>("/admin/feedback/pending");
          setPendingFeedback(response.data);
        } catch (err) {
          console.error(err);
          setError("No se pudo cargar el feedback pendiente.");
          toast.error("Error", { description: "No se pudo cargar el feedback pendiente." });
        } finally {
          setLoading(false);
        }
      };

      fetchPendingFeedback();
    }
  }, [auth.loading, auth.isAuthenticated, auth.user, router]);

  // --- 2. LÓGICA DE ACCIONES (APROBAR / RECHAZAR) ---
  const handleModerate = async (feedbackId: string, newState: ModerationStateUpdate) => {
    try {
      // Llamamos al endpoint de moderación
      await apiClient.post(`/admin/feedback/${feedbackId}/moderate`, { newState });

      // Actualizar la UI: quitar el item de la lista
      setPendingFeedback((prevList) =>
        prevList.filter((feedback) => feedback.id !== feedbackId)
      );
      
      toast.success(`Feedback ${newState === 'APROBADO' ? 'aprobado' : 'rechazado'} con éxito.`);

    } catch (err) {
      console.error(err);
      toast.error("Error al moderar", { description: "No se pudo completar la acción." });
    }
  };

  // --- 3. RENDERIZADO ---
  if (auth.loading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }
  
  // Si no es admin (doble chequeo)
  if (auth.user?.rol !== 'ADMIN') {
     return <div className="flex items-center justify-center min-h-screen">Acceso Denegado.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Panel de Moderación</h1>
        <p className="text-muted-foreground mb-6">
          Feedback de usuarios pendiente de revisión.
        </p>

        {error && <p className="text-red-500">{error}</p>}
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comentario</TableHead>
                  <TableHead>Usuario Reportado (ID)</TableHead>
                  <TableHead>Reportado Por (ID)</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingFeedback.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      ¡Excelente! No hay feedback pendiente por moderar.
                    </TableCell>
                  </TableRow>
                )}
                {pendingFeedback.map((fb) => (
                  <TableRow key={fb.id}>
                    <TableCell className="font-medium">{fb.rating} ★</TableCell>
                    <TableCell className="max-w-xs truncate">{fb.comment}</TableCell>
                    <TableCell className="font-mono text-xs">{fb.targetUserId}</TableCell>
                    <TableCell className="font-mono text-xs">{fb.reviewerId}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-500 hover:text-green-400"
                        onClick={() => handleModerate(fb.id, 'APROBADO')}
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleModerate(fb.id, 'RECHAZADO')}
                      >
                        Rechazar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}