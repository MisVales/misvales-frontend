# Evidencia de verificación de Etapa 10

Fecha: 2026-08-01. Ambiente: Windows local. Perfil funcional: público y sin sesión. Revisión de
código validada: `7da0509e7f6b0032df015430228b616fd77528dc`. Backend: no disponible.

## Herramientas

| Elemento    | Requerido | Ejecutado                                            |
| ----------- | --------- | ---------------------------------------------------- |
| Node.js     | 24.15.0   | 24.18.0; diferencia bloqueante para candidato exacto |
| npm         | 11.19.0   | 11.16.0; diferencia bloqueante para candidato exacto |
| Angular     | 22.1.0    | 22.1.0 desde lockfile                                |
| Angular CLI | 22.1.2    | 22.1.2 desde lockfile                                |

## Comandos y resultados

| Comando                      | Resultado final                                                   |
| ---------------------------- | ----------------------------------------------------------------- |
| `npm run format:check`       | Código 1; 19 archivos de Etapa 3 requieren formato                |
| `npm run lint`               | Código 1; 157 errores pertenecientes a Etapa 3                    |
| `npm run audit:release`      | Código 0; guía 237, OpenAPI 237, frontend 104, CSRF transversal 1 |
| `npm run audit:dependencies` | Código 0; cero vulnerabilidades de producción                     |
| `npm run test:coverage`      | Código 0; 20 archivos y 66 pruebas                                |
| `npm run verify`             | Código 1; se detiene en `format:check`                            |
| `npm run build:production`   | Código 0 en dos compilaciones consecutivas                        |
| `npm run artifact:hash`      | Código 0; hash idéntico en ambas compilaciones                    |
| E2E público dirigido         | Código 0; 14 casos aprobados                                      |
| `npm run e2e`                | Código 1; 14 aprobados y Etapa 3 bloqueada por credenciales E2E   |
| `git diff --check`           | Código 0                                                          |

El gate autoritativo no está verde. No se formatearon ni refactorizaron los archivos de Etapa 3
desde Etapa 10. Su E2E dejó de contener credenciales fijas y ahora falla cerrado con
`STAGE_3_E2E_ENV_REQUIRED` hasta recibir variables efímeras y un ambiente controlado.

## Cobertura

| Métrica    | Resultado | Umbral |
| ---------- | --------: | -----: |
| Sentencias |   94.10 % |   80 % |
| Ramas      |   87.70 % |   80 % |
| Funciones  |   94.80 % |   80 % |
| Líneas     |   95.89 % |   80 % |

Resultado: 20 archivos y 66 pruebas unitarias aprobadas.

## Build y rendimiento diagnóstico

- Bundle inicial: 165.92 kB raw y 41.58 kB estimados transferidos.
- Mayor chunk lazy observado: 167.89 kB raw.
- Budget configurado: warning 750 kB y error 1 MB para el bundle inicial.
- Artefacto: 62 archivos de contenido, 691,049 bytes, más el manifiesto.
- SHA-256 de contenido:
  `ca0a0e0c81cbdff380f28d098e4700a099c6501e9935d3c2da3acdfe25a69dde`.
- Reproducibilidad local: mismo hash en dos builds consecutivos.
- Source maps: cero.
- Archivos `.env`, llaves o certificados: cero.
- Coincidencias de hosts locales, credenciales sintéticas o private keys en el artefacto: cero.

Estas mediciones no sustituyen la línea base de rendimiento con datos representativos ni su
aprobación por Alberto.

## E2E y accesibilidad local

- 14 casos Playwright públicos aprobados contra configuración `production`.
- El caso autenticado de Etapa 3 falla cerrado sin `MISVALES_E2E_EMAIL`,
  `MISVALES_E2E_PASSWORD` y `MISVALES_E2E_MFA_CODE`; no se omitió ni se simuló.
- Seis viewports verificados: 1440×900, 1280×720, 1024×768, 768×1024, 390×844 y 360×800.
- Sin desbordamiento horizontal en el acceso público.
- Orden de teclado verificado para correo, contraseña, experiencia y acción principal habilitada.
- Ruta profunda pública, estados controlados y redirección sin sesión verificados.
- Cliente final confirmado sin ruta Angular.
- Sin errores de consola, `pageerror` o requests fallidos inesperados en los casos nuevos.

No se ejecutó un motor completo de accesibilidad que clasifique hallazgos WCAG `critical` o
`serious`; tampoco se probaron flujos autenticados. FE29.01 permanece bloqueado.

## Seguridad de dependencias

`npm audit` sobre todo el árbol reportó tres vulnerabilidades moderadas y una alta en herramientas
de desarrollo: `@angular/cli`, `@hono/node-server`, `@modelcontextprotocol/sdk` y
`brace-expansion`. `npm audit --omit=dev --audit-level=high` reportó cero vulnerabilidades de
producción. El HEAD ya no contiene credenciales literales en el E2E de Etapa 3, pero las expuestas
en un commit remoto previo requieren rotación por su propietario. No se reescribió historia.

## Evidencia no disponible

- Siete perfiles autenticados y separación real por sucursal/asignación.
- Los 17 flujos E2E funcionales.
- Pruebas contra una versión identificada del backend.
- Workers, scheduler, Storage privado y correo de prueba.
- Carga, memoria y red lenta con volumen representativo.
- Aprobación o rechazo de Alberto.
- Entrega y despliegue por Azael.
- Smoke test posterior y decisión de aceptación o rollback.

Por estas ausencias, el hash corresponde a un build diagnóstico y no a una versión candidata.
