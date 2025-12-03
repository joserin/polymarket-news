# polymarket

Proyecto frontend con Astro + React/TSX para integrar funcionalidades de síntesis y narración relacionadas con comentarios generados. Este repositorio contiene la UI, rutas API ligeras y utilidades para generar/sintetizar audio a partir de comentarios.

**Estado:** en desarrollo

**Estructura clave del proyecto**

- `public/` : archivos estáticos (favicon, assets públicos).
- `src/` : código fuente del sitio y la API.
	- `src/components/` : componentes React/TSX como `BaseApp.tsx`, `MainDisplay.tsx`, `Sidebar.tsx`, `Footer.tsx`.
	- `src/pages/` : páginas Astro; incluye `index.astro` y `src/pages/api/` con endpoints serverless (`narrate.ts`, `polymarket.ts`, `synthesize.ts`).
	- `src/sevices/polymarketService.ts` : cliente/servicio para interactuar con la API externa de Polymarket (nota: la carpeta está nombrada `sevices` en el repo).
	- `src/assets/` y `audio_cache/` : recursos estáticos y caché de audio.
- `generated_comments/` : archivos de texto con comentarios generados (ej.: `516719.txt`).

Revisa los archivos y carpetas citados para ubicar rápidamente los puntos de extensión.

Requisitos

- Node.js LTS (por ejemplo v18+).
- npm (o yarn/pnpm) para instalar dependencias.
- Variables de entorno: crea un `.env` en la raíz con las claves que use tu integración (por ejemplo claves de síntesis TTS, API keys). El proyecto incluye `env.d.ts` para tipos TypeScript.

Instalación y ejecución (PowerShell / Windows)

```powershell
npm install
npm run dev
```

- `npm run dev` — inicia el servidor de desarrollo (Astro) y expone las rutas API localmente.
- `npm run build` — construye para producción.
- `npm run preview` — previsualiza la build.

Endpoints API importantes

- `GET/POST /api/narrate` — lógica para generar narraciones (ver `src/pages/api/narrate.ts`).
- `POST /api/synthesize` — endpoint para síntesis de audio (ver `src/pages/api/synthesize.ts`).
- `GET /api/polymarket` — integración con Polymarket (ver `src/pages/api/polymarket.ts`).

Notas de desarrollo

- El servicio principal de integración se encuentra en `src/sevices/polymarketService.ts`.
- Los comentarios generados se guardan en `generated_comments/`; puedes inspeccionarlos para pruebas locales.
- `audio_cache/` contiene audios generados y puede limpiarse si necesitas liberar espacio.

Cómo contribuir

- Crea una rama por feature: `git checkout -b feature/mi-cambio`.
- Haz commits pequeños y descriptivos.
- Abre un pull request y describe el cambio y cómo probarlo.

Preguntas frecuentes rápidas

- ¿Dónde cambiar las credenciales TTS/API? — Añade/edita `.env` y reinicia el servidor de desarrollo.
- ¿Por qué `sevices` en vez de `services`? — Es el nombre presente en el repo; considera renombrarlo si quieres consistencia.

Contacto y siguientes pasos

- Si quieres que adapte el `README` con comandos concretos del `package.json` o ejemplos de uso de los endpoints, dime y lo incluyo.