# Etapa 7 — puntos, riesgo y morosidad

## Estado

Implementación parcial y cerrada por defecto. Los 27 contratos HTTP publicados están representados
por servicios tipados sin `any`, pero los Resources de respuesta continúan sin campos, tipos,
nulabilidad, capacidades ni catálogos completos en `GUIA-ENDPOINTS-API.md`.

Las rutas lazy de las experiencias administrativa, operativa y móvil existen únicamente para
sesiones con una capacidad documentada. Las pantallas muestran un estado accesible de contrato
pendiente y no solicitan ni presentan datos que no puedan validarse.

## Integración HTTP

`PointsApiService` cubre 14 endpoints:

- Saldo y movimientos propios.
- Saldo y movimientos por distribuidora.
- Evaluación de puntos por relación.
- Periodo operativo vigente.
- Canjes propios, bandeja y detalle.
- Autorización y rechazo con el cuerpo publicado.
- Ejecuciones, detalle y elementos.

`RiskApiService` cubre 13 endpoints:

- Perfiles, evaluaciones, secuencia y alertas de riesgo.
- Detalle y revisión de alerta.
- Aplicación de morosidad con el cuerpo publicado.
- Preparación, bandeja, detalle, aprobación y rechazo de retiro.

Los filtros ambiguos `type`, `status` y `delinquency_status` no forman parte de los DTO de consulta.
No se envía `status={}` ni se inventa `page` donde la guía no lo publica.

## Bloqueos preservados

- No existe contrato publicado para crear o completar un canje.
- La secuencia de riesgo conserva una respuesta de fuente pendiente.
- El contrato actual de reautenticación del checkout devuelve `authorization_token`, mientras esta
  etapa exige `reauthentication_token`; ninguna UI los trata como equivalentes.
- Faltan FE03–FE19 y los Resources reales necesarios para cerrar DTO, mapeadores, fachadas,
  formularios, tablas y E2E funcionales.
- `openapi.yaml` exige `Idempotency-Key` en algunas mutaciones que la guía y la especificación de la
  etapa no documentan de la misma forma. Los servicios siguen la prioridad de fuentes de la Etapa 7
  y no agregan el header.

No se calculan puntos, equivalencias, reservas, riesgo, saldo vencido ni morosidad en Angular.
