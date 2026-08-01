# Etapa 9 — reportes, notificaciones y auditoría

## Estado

Implementación parcial y cerrada por defecto. Los 11 contratos HTTP publicados están integrados en
servicios sin `any`, pero `GUIA-ENDPOINTS-API.md` conserva marcadores para las definiciones, filas,
ejecuciones, notificaciones y eventos auditados.

Las rutas lazy existen para las experiencias autorizadas y requieren capacidades publicadas por
`auth/context`. Las páginas muestran un estado accesible de contrato pendiente y no ejecutan
consultas cuyos resultados no puedan validarse.

## Integración HTTP

`ReportingApiService` cubre siete endpoints:

- Catálogo y definición de reportes.
- Ejecución síncrona con filtros dinámicos recibidos por una futura definición tipada.
- Creación asíncrona con `Idempotency-Key` entregada por el intento lógico.
- Historial, detalle y resultados de ejecuciones.

`NotificationsApiService` cubre dos endpoints:

- Bandeja personal con estados cerrados `UNREAD` y `READ`.
- Marcado individual como leído con body vacío.

`AuditApiService` cubre dos endpoints:

- Lista de eventos con filtros técnicos inequívocos y sin parámetro `page` inventado.
- Detalle inmutable por identificador opaco.

Los catálogos pendientes de auditoría no forman parte del DTO de filtros. No se construyen deep
links desde texto, códigos o payloads de notificación.

## Bloqueos preservados

- Faltan `ReportDefinitionResource`, `ReportRunResource` y el esquema de resultados.
- No están cerrados códigos, filtros, columnas, estados, sincronía ni formatos de exportación.
- Falta `NotificationResource`, el contador no leído y el destino tipado.
- Faltan los Resources de auditoría, catálogos y política central de redacción.
- El contrato solo publica `security.audit.global.read`; no existe una capacidad de auditoría de
  sucursal que permita habilitar al gerente de sucursal sin inventar permisos.
- El checkout no contiene las dependencias funcionales FE03–FE24 necesarias para destinos y
  descarga privada.
- La guía no publica paginación de catálogo/notificaciones ni `page` de auditoría.

No se inventan reportes, resultados, archivos, notificaciones, eventos, totales, relaciones o
destinos.
