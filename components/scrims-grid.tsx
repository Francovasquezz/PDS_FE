import { Shield, Globe, Calendar } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ScrimCard {
  id: number
  title: string
  rank: string
  region: string
  time: string
  status: string
}

const SCRIMS: ScrimCard[] = [
  {
    id: 1,
    title: "Práctica 5v5 de Valorant",
    rank: "Diamante - Ascendente",
    region: "LATAM",
    time: "Hoy - 22:00 hs",
    status: "BUSCANDO",
  },
  {
    id: 2,
    title: "Clasificatorio League of Legends",
    rank: "Platino - Diamante",
    region: "NA",
    time: "Hoy - 20:30 hs",
    status: "BUSCANDO",
  },
  {
    id: 3,
    title: "Preparación CS2 Pro",
    rank: "Global Elite - Supremo",
    region: "EUW",
    time: "Mañana - 19:00 hs",
    status: "BUSCANDO",
  },
  {
    id: 4,
    title: "Scrim Casual Valorant",
    rank: "Oro - Platino",
    region: "LATAM",
    time: "Hoy - 21:00 hs",
    status: "BUSCANDO",
  },
  {
    id: 5,
    title: "Torneo Amistoso LoL",
    rank: "Diamante - Master",
    region: "NA",
    time: "Hoy - 23:00 hs",
    status: "BUSCANDO",
  },
  {
    id: 6,
    title: "Entrenamiento CS2 Principiante",
    rank: "Plata - Oro",
    region: "LATAM",
    time: "Mañana - 18:00 hs",
    status: "BUSCANDO",
  },
]

export default function ScrimsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SCRIMS.map((scrim) => (
        <Card
          key={scrim.id}
          className="bg-card border-border hover:border-primary transition-colors duration-300 overflow-hidden"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-lg font-bold text-foreground">{scrim.title}</CardTitle>
              <Badge className="bg-primary text-primary-foreground whitespace-nowrap">{scrim.status}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Shield size={18} className="text-primary flex-shrink-0" />
              <span>Rango: {scrim.rank}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Globe size={18} className="text-primary flex-shrink-0" />
              <span>Región: {scrim.region}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Calendar size={18} className="text-primary flex-shrink-0" />
              <span>{scrim.time}</span>
            </div>
          </CardContent>

          <CardFooter className="pt-4">
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-opacity-90 transition-all">
              Postularse
            </button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
