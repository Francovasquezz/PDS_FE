import Header from "@/components/header"
import ScrimsGrid from "@/components/scrims-grid"
import FiltersBar from "@/components/filters-bar"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-foreground">Scrims Disponibles</h1>
            <button className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-opacity-90 transition-all">
              Crear Scrim
            </button>
          </div>

          <FiltersBar />
          <ScrimsGrid />
        </div>
      </main>
    </div>
  )
}
