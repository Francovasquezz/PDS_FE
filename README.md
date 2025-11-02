eScrims TPO - Frontend (Panel Web)
Este proyecto es el frontend del TPO de Proceso de Desarrollo de Software (PDS). Es un panel web construido con Next.js y TypeScript diseñado para consumir la API del backend de eScrims (Java/Spring Boot).

El panel permite a los usuarios registrarse, autenticarse, buscar scrims, crear nuevos scrims y (para administradores) moderar el contenido de la plataforma.

🚀 Tecnologías Utilizadas
Framework: Next.js (React)

Lenguaje: TypeScript

Gestor de Paquetes: pnpm

UI (Componentes): shadcn/ui

Estilos: Tailwind CSS

Llamadas a API: Axios

📋 Requisitos Previos
Para ejecutar este proyecto, necesitarás:

Node.js: (Versión 18.x o superior)

pnpm: (npm install -g pnpm)

Backend de eScrims Corriendo: El servidor de Spring Boot DEBE estar ejecutándose localmente en http://localhost:8080.

⚙️ Instalación
Sigue estos pasos para configurar el proyecto localmente:

Clona el repositorio (o asegúrate de tener los archivos).

Instala las dependencias usando pnpm:

pnpm install

Instala los componentes de shadcn/ui que podrías necesitar (si no lo hiciste antes):
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add label
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add card

pnpm install lucide-react

▶️ Ejecución
Para iniciar el servidor de desarrollo:

Asegúrate de que el backend de Java esté corriendo en localhost:8080.

Ejecuta el siguiente comando para iniciar el frontend:

pnpm run dev
o

npm run dev

Abre tu navegador y ve a http://localhost:3000.


🔌 Conexión con el Backend (CORS)
Este frontend está configurado para hacer peticiones a http://localhost:8080/api (ver lib/apiClient.ts).

Para que el navegador permita esta conexión, es fundamental que el backend de Spring Boot tenga la configuración de CORS correcta.

Asegúrate de que tu archivo WebConfig.java en el proyecto de backend incluya el addCorsMappings:

// En el proyecto de Spring Boot (TPO_PDS)
// src/main/java/com/scrim_pds/config/WebConfig.java

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // ... (tu AuthUserArgumentResolver) ...

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Permite CORS para todas las rutas /api
                .allowedOrigins("http://localhost:3000") // Permite peticiones desde tu frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}