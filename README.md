
# eScrims TPO - Frontend (Panel Web)

Este proyecto es el frontend del TPO de Proceso de Desarrollo de Software (PDS). Es un panel web construido con **Next.js** y **TypeScript** diseñado para consumir la [API del backend de eScrims (Java/Spring Boot)](https://www.google.com/search?q=https://github.com/kevinalajarin/tpo_pds).

El panel permite a los usuarios registrarse, autenticarse, buscar scrims, crear nuevos scrims y (para administradores) moderar el contenido de la plataforma.

## 🚀 Tecnologías Utilizadas

  * **Framework:** [Next.js](https://nextjs.org/) (React)
  * **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
  * **Gestor de Paquetes:** [pnpm](https://pnpm.io/)
  * **UI (Componentes):** [shadcn/ui](https://ui.shadcn.com/)
  * **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
  * **Llamadas a API:** [Axios](https://axios-http.com/)

-----

## 📋 Requisitos Previos

Para ejecutar este proyecto, necesitarás:

1.  **Node.js:** (Versión 18.x o superior)
2.  **pnpm:** (`npm install -g pnpm`)
3.  **Backend de eScrims Corriendo:** El [servidor de Spring Boot](https://www.google.com/search?q=https://github.com/kevinalajarin/tpo_pds) **DEBE** estar ejecutándose localmente en `http://localhost:8080`.

-----

## ⚙️ Instalación

Sigue estos pasos para configurar el proyecto localmente:

1.  **Clona el repositorio** (o asegúrate de tener los archivos).
2.  **Instala las dependencias** usando `pnpm`:
    ```bash
    pnpm install
    ```
3.  **Instala los componentes de `shadcn/ui`** que podrías necesitar (si no lo hiciste antes):
    ```bash
    pnpm dlx shadcn-ui@latest add button
    pnpm dlx shadcn-ui@latest add label
    pnpm dlx shadcn-ui@latest add input
    pnpm dlx shadcn-ui@latest add card
    pnpm dlx shadcn-ui@latest add avatar badge button card checkbox dropdown-menu input label select sonner table textarea
    ```
    (Esto instalará todos los componentes que usamos en el proyecto: avatar, badge, button, card, checkbox, dropdown-menu, input, label, select, sonner (para notificaciones), table y textarea).
4.  **Instala los íconos**:
    ```bash
    pnpm install lucide-react
    ```

-----

## ▶️ Ejecución

Para iniciar el servidor de desarrollo:

1.  Asegúrate de que el **backend de Java esté corriendo** en `localhost:8080`.
2.  Ejecuta el siguiente comando para iniciar el frontend:
    ```bash
    pnpm run dev
    ```
    o
    ```bash
    npm run dev
    ```
3.  Abre tu navegador y ve a **`http://localhost:3000`**.

-----

## 🔌 Conexión con el Backend (CORS)

Este frontend está configurado para hacer peticiones a `http://localhost:8080/api` (ver `lib/apiClient.ts`).

Para que el navegador permita esta conexión, es **fundamental** que el backend de Spring Boot tenga la configuración de CORS correcta.

Asegúrate de que tu archivo `WebConfig.java` en el proyecto de backend incluya el `addCorsMappings`:

```java
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
```