// components/filters-bar.tsx

"use client"; // <-- 1. Convertir a componente de cliente

import { useState } from "react"; // <-- 2. Importar useState
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Asumo que ya lo instalaste
import { ScrimFilters } from "@/app/page"; // <-- 3. Importar el tipo de dato

// 4. Definir el tipo de las props que recibirá
interface FiltersBarProps {
  onSearch: (filters: ScrimFilters) => void;
}

export default function FiltersBar({ onSearch }: FiltersBarProps) {
  // 5. Estado local para cada filtro
  const [juego, setJuego] = useState("");
  const [region, setRegion] = useState("");
  const [rangoMin, setRangoMin] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 6. Llama a la función del padre (app/page.tsx) con los filtros
    onSearch({
      juego: juego || undefined, // Enviar undefined si está vacío
      region: region || undefined,
      rangoMin: rangoMin || undefined,
    });
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4 mb-6">
      <Select value={juego} onValueChange={setJuego}>
        <SelectTrigger className="w-full md:w-auto">
          <SelectValue placeholder="Juego" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Valorant">Valorant</SelectItem>
          <SelectItem value="League of Legends">League of Legends</SelectItem>
          <SelectItem value="CS2">CS2</SelectItem>
        </SelectContent>
      </Select>
      <Select value={region} onValueChange={setRegion}>
        <SelectTrigger className="w-full md:w-auto">
          <SelectValue placeholder="Región" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="LATAM">LATAM</SelectItem>
          <SelectItem value="NA">NA</SelectItem>
          <SelectItem value="EUW">EUW</SelectItem>
          <SelectItem value="SA">SA (Brasil)</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Rango Mínimo"
        className="w-full md:w-auto"
        value={rangoMin}
        onChange={(e) => setRangoMin(e.target.value)}
      />
      
      {/* 7. El botón ahora es de tipo "submit" */}
      <Button type="submit">Buscar</Button> 
    </form>
  );
}