# FE30 — Compatibilidad, entrega y smoke test

Fecha de corte: 2026-08-01.

## Matriz frontend-backend

| Elemento                    | Evidencia actual                                                           | Estado                                               |
| --------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| Revisión de código validada | `7da0509e7f6b0032df015430228b616fd77528dc`                                 | Build diagnóstico; no es candidato aprobado          |
| Versión backend compatible  | No entregada ni desplegada en esta tarea                                   | `BLOQUEADO_AMBIENTE`                                 |
| Guía API                    | SHA-256 `32825A5816E6FBD9FC9E977E80B1EB8BE3CED97AFE664040DF127DB1A04417EC` | 237 operaciones                                      |
| OpenAPI                     | SHA-256 `1AFB8CD4BC337C216E32EADCEED0F66ECB490C54A31DA7CA7E42538750DDC483` | 237 operaciones; coincide con la guía en método/ruta |
| Base URL                    | `/api/v1` y `/sanctum/csrf-cookie` de mismo origen                         | Verificación estática aprobada                       |
| Sesión                      | Sanctum y MFA implementados; contexto falla cerrado                        | `BLOQUEADO_CONTRATO`                                 |
| CSRF                        | Renovación única probada unitariamente                                     | `IMPLEMENTADO`                                       |
| Resources                   | Varios marcadores o estructuras pendientes                                 | `BLOQUEADO_CONTRATO`                                 |
| Jobs asíncronos             | Sin worker ni ambiente integrado                                           | `BLOQUEADO_AMBIENTE`                                 |
| Storage privado             | Sin ambiente integrado                                                     | `BLOQUEADO_AMBIENTE`                                 |
| Zona horaria                | `America/Monterrey` en los tres ambientes Angular                          | Verificación estática aprobada                       |

El build diagnóstico local produjo 62 archivos de contenido con SHA-256
`ca0a0e0c81cbdff380f28d098e4700a099c6501e9935d3c2da3acdfe25a69dde`. El mismo hash se obtuvo en
dos compilaciones consecutivas, pero no se considera candidato porque el gate global falla y no
existe aprobación de QA.

## Entrega segura de la SPA

- El contenido publicable es el directorio `dist/misvales/browser` producido por
  `npm run build:production` desde el commit aprobado y su lockfile.
- El servidor debe servir `index.html` como fallback únicamente para rutas de la SPA que no
  correspondan a archivos estáticos existentes.
- `/api/v1/**` y `/sanctum/**` no deben usar el fallback de Angular y deben conservar mismo origen.
- No se recompila en producción y no se modifica manualmente `dist/`.
- El artefacto debe conservar su `artifact-manifest.sha256` sin cambios después de la aprobación.
- La caché pública no debe almacenar respuestas API, HTML autenticado, archivos privados,
  notificaciones, reportes ni auditoría.
- CSP, HSTS, `X-Content-Type-Options`, política de referrer y permisos del navegador son controles
  del servidor que Azael debe aplicar conforme al procedimiento aprobado; este repositorio no
  inventa sus valores productivos.

## Smoke test posterior al despliegue

1. Confirmar HTTPS y hash exacto del artefacto aprobado.
2. Abrir `/acceso` y una ruta profunda pública sin `404` del servidor.
3. Obtener CSRF e iniciar sesión con una cuenta sintética autorizada.
4. Completar MFA y validar `auth/context`, perfil, alcance y layout.
5. Ejecutar una lectura autorizada y una escritura controlada.
6. Verificar una URL no autorizada y una descarga privada.
7. Cerrar sesión y comprobar que rutas protegidas y estado anterior quedan inaccesibles.
8. Confirmar ausencia de errores inesperados, hosts incorrectos y datos sensibles en telemetría.

Este smoke test no se ejecutó: no hubo despliegue, artefacto aprobado ni ambiente compatible.

## Rollback

Se solicita rollback cuando falle autenticación, autorización, rutas profundas, API, seguridad,
archivos privados o un flujo crítico. La ejecución corresponde a Azael. No se generó ni aprobó un
candidato para entregar.
