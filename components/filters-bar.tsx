"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function FiltersBar() {
  const [game, setGame] = useState("")
  const [region, setRegion] = useState("")
  const [minRank, setMinRank] = useState("")
  const [maxRank, setMaxRank] = useState("")

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Game Select */}
        <Select value={game} onValueChange={setGame}>
          <SelectTrigger className="bg-input border-border text-foreground">
            <SelectValue placeholder="Juego" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="valorant">Valorant</SelectItem>
            <SelectItem value="lol">League of Legends</SelectItem>
            <SelectItem value="cs2">CS2</SelectItem>
          </SelectContent>
        </Select>

        {/* Region Select */}
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="bg-input border-border text-foreground">
            <SelectValue placeholder="Región" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="latam">LATAM</SelectItem>
            <SelectItem value="na">NA</SelectItem>
            <SelectItem value="euw">EUW</SelectItem>
          </SelectContent>
        </Select>

        {/* Min Rank Input */}
        <Input
          placeholder="Rango Mínimo"
          value={minRank}
          onChange={(e) => setMinRank(e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
        />

        {/* Max Rank Input */}
        <Input
          placeholder="Rango Máximo"
          value={maxRank}
          onChange={(e) => setMaxRank(e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
        />

        {/* Search Button */}
        <button className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-opacity-80 transition-all">
          Buscar
        </button>
      </div>
    </div>
  )
}
