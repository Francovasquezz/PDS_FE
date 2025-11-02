"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // <-- 1. Importar Link
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/apiClient';
import { LoginResponse } from '@/lib/types';
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input"; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; 
import { Label } from "@/components/ui/label"; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  // ... (el resto de la función handleSubmit sin cambios) ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email, 
        password,
      });

      const { token, user } = response.data;
      auth.login(token, user); 
      
    } catch (err) {
      setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa a tu cuenta de eScrims.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          {/* ... (el CardContent con los inputs de email y password sin cambios) ... */}
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit" className="w-full">Ingresar</Button>
            
            {/* --- 2. MODIFICACIÓN AQUÍ --- */}
            <div className="mt-4 text-center text-sm">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="underline text-primary">
                Regístrate aquí
              </Link>
            </div>
            {/* --- FIN DE LA MODIFICACIÓN --- */}

          </CardFooter>
        </form>
      </Card>
    </div>
  );
}