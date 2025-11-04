"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { Scrim, Postulacion, EstadisticaRequest } from "@/lib/types";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// ---- NUEVO: tipo local alineado al back (sin usuarioId) ----
type FormStatRow = Omit<EstadisticaRequest, "usuarioId">;

// Helper para mensajes de error consistentes
const getErrMsg = (err: any) =>
  err?.response?.data?.message ??
  err?.response?.data?.error ??
  err?.message ??
  "Error";

export default function StatsPage() {
  const router = useRouter();
  const params = useParams();
  const auth = useAuth();

  const id = params.id as string;

  const [scrim, setScrim] = useState<Scrim | null>(null);
  const [participants, setParticipants] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Mapa: usuarioId -> stats
  const [statsMap, setStatsMap] = useState<Record<string, FormStatRow>>({});

  useEffect(() => {
    if (!id || !auth.isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) Scrim
        const scrimRes = await apiClient.get<Scrim>(`/scrims/${id}`);

        // Seguridad: dueño + estado FINALIZADO (el back lo requiere)
        if (scrimRes.data.organizadorId !== auth.user?.id) {
          toast.error("Acceso denegado", { description: "No eres el organizador." });
          router.push(`/scrim/${id}`);
          return;
        }
        if (scrimRes.data.estado !== "FINALIZADO") {
          toast.error("Solo se puede cargar estadísticas de scrims finalizados.");
          router.push(`/scrim/${id}`);
          return;
        }

        setScrim(scrimRes.data);

        // 2) Participantes (organizador ve todas las postulaciones)
        const postRes = await apiClient.get<Postulacion[]>(`/scrims/${id}/postulaciones`);
        const accepted = postRes.data.filter((p) => p.estado === "ACEPTADA");

        setParticipants(accepted);

        // 3) Inicializar formulario
        const initial: Record<string, FormStatRow> = {};
        for (const p of accepted) {
          initial[p.usuarioId] = {
            mvp: false,
            kills: 0,
            deaths: 0,
            assists: 0,
            observaciones: "",
          };
        }
        setStatsMap(initial);
      } catch (err) {
        toast.error(getErrMsg(err) || "Error al cargar los datos.");
        router.push(`/scrim/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, auth.isAuthenticated, auth.user?.id, router]);

  // ---- Handlers ----
  const setNumber = (val: string) => {
    const n = Number(val);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const handleStatChange = (
    userId: string,
    field: keyof FormStatRow,
    value: string | number | boolean
  ) => {
    setStatsMap((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value as any,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const statsList: EstadisticaRequest[] = Object.entries(statsMap).map(
      ([usuarioId, stats]) => ({
        usuarioId,
        mvp: !!stats.mvp,
        kills: Number(stats.kills) || 0,
        deaths: Number(stats.deaths) || 0,
        assists: Number(stats.assists) || 0,
        observaciones: stats.observaciones ?? "",
      })
    );

    if (statsList.length === 0) {
      toast.error("No hay estadísticas para enviar.");
      return;
    }

    try {
      await apiClient.post(`/scrims/${id}/estadisticas`, statsList);
      toast.success("¡Estadísticas guardadas exitosamente!");
      router.push(`/scrim/${id}`);
    } catch (err: any) {
      toast.error(getErrMsg(err) || "Error al guardar estadísticas.");
    }
  };

  if (loading || !scrim) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          Cargando formulario...
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Cargar Estadísticas</CardTitle>
            <CardDescription>
              Registra los resultados para el scrim de {scrim.juego} (ID: {scrim.id}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No hubo jugadores aceptados.
                        </TableCell>
                      </TableRow>
                    )}
                    {participants.map((p) => (
                      <TableRow key={p.usuarioId}>
                        <TableCell className="font-medium">
                          {p.username || p.usuarioId}
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="w-[100px]"
                            value={statsMap[p.usuarioId]?.kills ?? 0}
                            onChange={(e) =>
                              handleStatChange(p.usuarioId, "kills", setNumber(e.target.value))
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="w-[100px]"
                            value={statsMap[p.usuarioId]?.deaths ?? 0}
                            onChange={(e) =>
                              handleStatChange(p.usuarioId, "deaths", setNumber(e.target.value))
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="w-[100px]"
                            value={statsMap[p.usuarioId]?.assists ?? 0}
                            onChange={(e) =>
                              handleStatChange(p.usuarioId, "assists", setNumber(e.target.value))
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Checkbox
                            checked={!!statsMap[p.usuarioId]?.mvp}
                            onCheckedChange={(v) =>
                              handleStatChange(p.usuarioId, "mvp", !!v)
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Textarea
                            placeholder="Notas / highlights del jugador..."
                            value={statsMap[p.usuarioId]?.observaciones ?? ""}
                            onChange={(e) =>
                              handleStatChange(p.usuarioId, "observaciones", e.target.value)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button type="submit" className="mt-6">
                Guardar Estadísticas
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
