"use client"; // <-- 1. Añadir "use client"

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; //
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; //
import { ShieldIcon, SwordsIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // <-- 2. Importar useAuth

export function Header() {
  const auth = useAuth(); // <-- 3. Usar el contexto

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b">
      <Link href="/" className="flex items-center gap-2" prefetch={false}>
        <SwordsIcon className="h-6 w-6" />
        <span className="text-lg font-bold">eScrims</span>
      </Link>
      <nav className="flex items-center gap-6">
        <Link
          href="/"
          className="text-sm font-medium hover:underline"
          prefetch={false}
        >
          Buscar Scrims
        </Link>
        <Link
          href="/my-scrims" // Necesitarás crear esta página
          className="text-sm font-medium hover:underline"
          prefetch={false}
        >
          Mis Scrims
        </Link>
        
        {/* --- 4. Lógica de Admin --- */}
        {auth.user?.rol === 'ADMIN' && (
          <Link
            href="/moderation" // Necesitarás crear esta página
            className="flex items-center gap-2 text-sm font-medium hover:underline text-yellow-500"
            prefetch={false}
          >
            <ShieldIcon className="h-4 w-4" />
            Moderación
          </Link>
        )}
        
      </nav>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>
              {/* Muestra iniciales del usuario */}
              {auth.user?.username?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{auth.user?.username || 'Mi Cuenta'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/profile">Perfil</Link> {/* Necesitarás crear esta página */}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          
          {/* --- 5. Lógica de Logout --- */}
          <DropdownMenuItem 
            onSelect={() => auth.logout()} 
            className="text-red-500 cursor-pointer"
          >
            Cerrar Sesión
          </DropdownMenuItem>
          
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}