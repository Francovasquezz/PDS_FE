"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { User } from "@/lib/types"; // Usamos el tipo User que ya teníamos

// Tipos basados en tus DTOs (ProfileUpdateRequest.java y PreferencesUpdateRequest.java)
type ProfileFormData = {
  username: string;
  region: string;
  rangoPorJuego: Record<string, string>;
  rolesPreferidos: string[];
};

type PreferencesFormData = {
  canalesNotificacion: string[];
  alertasScrim: boolean;
  alertasPostulacion: boolean;
  recordatoriosActivos: boolean;
  busquedaJuegoPorDefecto: string;
  busquedaRegionPorDefecto: string;
  busquedaRangoMinPorDefecto: string;
  busquedaRangoMaxPorDefecto: string;
};

// Tipo para el usuario completo que viene de /api/users/me
interface FullUser extends User {
  preferencias: PreferencesFormData;
  rangoPorJuego: Record<string, string>;
  rolesPreferidos: string[];
  region: string;
}

export default function ProfilePage() {
  const auth = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Estados para los dos formularios
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: "",
    region: "",
    rangoPorJuego: {},
    rolesPreferidos: [],
  });
  const [prefsForm, setPrefsForm] = useState<PreferencesFormData>({
    canalesNotificacion: ["EMAIL"],
    alertasScrim: true,
    alertasPostulacion: true,
    recordatoriosActivos: true,
    busquedaJuegoPorDefecto: "",
    busquedaRegionPorDefecto: "",
    busquedaRangoMinPorDefecto: "",
    busquedaRangoMaxPorDefecto: "",
  });

  // Cargar datos del usuario al montar la página
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push("/login");
      return;
    }
    if (auth.isAuthenticated) {
      const fetchUserData = async () => {
        try {
          // 1. LLAMAMOS A GET /api/users/me
          const response = await apiClient.get<FullUser>("/users/me");
          const user = response.data;
          
          // Seteamos los datos en los formularios
          setProfileForm({
            username: user.username || "",
            region: user.region || "",
            rangoPorJuego: user.rangoPorJuego || {},
            rolesPreferidos: user.rolesPreferidos || [],
          });
          setPrefsForm(user.preferencias);
          setLoading(false);
        } catch (error) {
          console.error(error);
          toast.error("No se pudo cargar tu perfil.");
        }
      };
      fetchUserData();
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  // Manejadores para el formulario de Perfil
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  // TODO: Para rangos y roles (Map/List) se necesitaría una UI más compleja.
  // Por ahora, solo actualizamos username y region.
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 2. LLAMAMOS A PUT /api/users/me/profile
      await apiClient.put("/users/me/profile", {
         username: profileForm.username,
         region: profileForm.region,
         // Dejamos los rangos y roles como estaban (o se necesitaría un parser)
         rangoPorJuego: profileForm.rangoPorJuego,
         rolesPreferidos: profileForm.rolesPreferidos,
      });
      toast.success("Perfil actualizado exitosamente.");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al actualizar el perfil.");
    }
  };

  // Manejadores para el formulario de Preferencias
  const handlePrefsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrefsForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handlePrefsCheckbox = (name: keyof PreferencesFormData, checked: boolean) => {
    setPrefsForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePrefsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 3. LLAMAMOS A PUT /api/users/me/preferences
      await apiClient.put("/users/me/preferences", prefsForm);
      toast.success("Preferencias actualizadas exitosamente.");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al actualizar preferencias.");
    }
  };


  if (auth.loading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 md:p-8 flex justify-center">
        <div className="w-full max-w-4xl space-y-8">
          
          {/* --- FORMULARIO 1: PERFIL --- */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil Público</CardTitle>
              <CardDescription>
                Cómo te verán los demás en la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input name="username" value={profileForm.username} onChange={handleProfileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Tu Región Principal</Label>
                  <Input name="region" value={profileForm.region} onChange={handleProfileChange} />
                </div>
                {/* Nota: Los campos de Rango y Roles son complejos (Map/List) */}
                <div className="text-sm text-muted-foreground">
                  (La edición de rangos y roles se añadirá próximamente)
                </div>
                <Button type="submit">Actualizar Perfil</Button>
              </form>
            </CardContent>
          </Card>

          {/* --- FORMULARIO 2: PREFERENCIAS --- */}
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Búsqueda y Notificación</CardTitle>
              <CardDescription>
                Configura las alertas y tus búsquedas por defecto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePrefsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="busquedaJuegoPorDefecto">Juego por Defecto</Label>
                    <Input name="busquedaJuegoPorDefecto" value={prefsForm.busquedaJuegoPorDefecto} onChange={handlePrefsChange} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="busquedaRegionPorDefecto">Región por Defecto</Label>
                    <Input name="busquedaRegionPorDefecto" value={prefsForm.busquedaRegionPorDefecto} onChange={handlePrefsChange} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="busquedaRangoMinPorDefecto">Rango Mín. por Defecto</Label>
                    <Input name="busquedaRangoMinPorDefecto" value={prefsForm.busquedaRangoMinPorDefecto} onChange={handlePrefsChange} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="busquedaRangoMaxPorDefecto">Rango Máx. por Defecto</Label>
                    <Input name="busquedaRangoMaxPorDefecto" value={prefsForm.busquedaRangoMaxPorDefecto} onChange={handlePrefsChange} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Alertas de Notificación</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="alertasScrim" 
                        checked={prefsForm.alertasScrim} 
                        onCheckedChange={(c) => handlePrefsCheckbox('alertasScrim', !!c)} />
                      <Label htmlFor="alertasScrim">Alertas de nuevos Scrims</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                      <Checkbox id="alertasPostulacion" 
                        checked={prefsForm.alertasPostulacion} 
                        onCheckedChange={(c) => handlePrefsCheckbox('alertasPostulacion', !!c)} />
                      <Label htmlFor="alertasPostulacion">Alertas de Postulaciones</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                      <Checkbox id="recordatoriosActivos" 
                        checked={prefsForm.recordatoriosActivos} 
                        onCheckedChange={(c) => handlePrefsCheckbox('recordatoriosActivos', !!c)} />
                      <Label htmlFor="recordatoriosActivos">Recordatorios de Scrims</Label>
                    </div>
                  </div>
                </div>
                
                <Button type="submit">Actualizar Preferencias</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}