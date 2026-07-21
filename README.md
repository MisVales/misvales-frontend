# MisVales Frontend

Entorno inicial de desarrollo de MisVales con Angular 22 y Tailwind CSS.

## Ejecutar

```powershell
npm ci
npm run dev
```

La aplicación queda disponible en `http://localhost:4200` y utiliza `proxy.conf.json` para
redirigir `/api` y `/sanctum` al backend local en `http://localhost:8000`.

## Validar

```powershell
npm run check
```

También están disponibles `npm run lint`, `npm run test`, `npm run format:check` y `npm run build`.

El proyecto está configurado únicamente para desarrollo. No contiene configuración de despliegue
ni funcionalidades de negocio.
