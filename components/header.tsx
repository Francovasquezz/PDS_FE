"use client"; 

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; 
import { ShieldIcon, SwordsIcon } from "lucide-react"; // Asegúrate de tener lucide-react (pnpm install lucide-react)
import { useAuth } from "@/context/AuthContext"; // <-- 1. Importamos el hook de autenticación

export function Header() {
  const auth = useAuth(); // <-- 2. Usamos el hook para obtener los datos del usuario

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
          href="/my-scrims" 
          className="text-sm font-medium hover:underline"
          prefetch={false}
        >
          Mis Scrims
        </Link>
        
        {/* --- 3. ¡LA LÓGICA ESTÁ AQUÍ! --- */}
        {/* Esto comprueba si el usuario está autenticado Y si su rol es 'ADMIN'.
          Tu backend define este rol en UserRole.java
          y se guarda en tu users.json
        */}
        {auth.user?.rol === 'ADMIN' && (
          <Link
            href="/moderation" 
            className="flex items-center gap-2 text-sm font-medium hover:underline text-yellow-500"
            prefetch={false}
          >
            <ShieldIcon className="h-4 w-4" />
            Moderación
          </Link>
        )}
        {/* --- FIN DE LA LÓGICA --- */}
        
      </nav>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>
              {auth.user?.username?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{auth.user?.username || 'Mi Cuenta'}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/profile">Perfil</Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
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