# FE28.01 — Inventario de integración

Fecha de corte: 2026-08-01.

Este inventario describe el checkout actual. No representa una aprobación de QA ni un ambiente
desplegado.

## Resumen contractual

| Clasificación                                           | Operaciones |
| ------------------------------------------------------- | ----------: |
| Publicadas en `GUIA-ENDPOINTS-API.md`                   |         237 |
| Publicadas en `openapi.yaml`                            |         237 |
| Coincidencia de método y ruta entre ambas fuentes       |         237 |
| Consumidas por servicios Angular                        |         104 |
| Consumida transversalmente para CSRF fuera de `/api/v1` |           1 |
| Publicadas sin consumidor Angular                       |         133 |

`npm run audit:release` obtiene estos valores desde el código y falla si una operación Angular no
existe en la guía o si guía y OpenAPI dejan de coincidir. Las 133 operaciones sin consumidor no se
clasifican automáticamente como frontend, backend exclusivo o fuera de alcance: faltan las
implementaciones y fuentes de cierre de las Etapas 4–6 y 8, por lo que asignarles una justificación
definitiva sería inventarla.

## Inventario por etapa

| Etapa | Submódulos                                            | Rutas Angular                                                                                                                              | Experiencia y perfiles                                      | Entrada y servicios                                                             | Endpoints consumidos | Estados y pruebas                                                  | Estado               | Bloqueo                                                                                             |
| ----- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------: | ------------------------------------------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------- |
| 1     | FE00–FE03                                             | `/`, `/403`, `/404`, `/sin-conexion`, `/error`, shells protegidos                                                                          | Pública y tres layouts; siete roles por contexto            | Guards, interceptores, `CsrfService`, `LogoutService`, `ContextContractGateway` |       2 API más CSRF | Unitarias de infraestructura y smoke público                       | `BLOQUEADO_CONTRATO` | `auth/context` solo publica `data.result` como marcador; el gateway falla cerrado                   |
| 2     | Acceso, seguridad de cuenta y organización existentes | `/acceso/**`, `/administrativa/mi-cuenta/**`, `/administrativa/cuentas/**`, `/administrativa/organizacion/**`                              | Administrativa; seguridad propia también en tableta y móvil | Auth, account-security, accounts y organization                                 |                   41 | Unitarias, componentes y smoke público; sin E2E autenticado        | `BLOQUEADO_CONTRATO` | Sin Resource real de contexto no puede establecerse una sesión productiva                           |
| 3     | Configuraciones y catálogos                           | `/administrativa/{configuraciones,categorias,productos,periodos-canje}/**`                                                                 | Administrativa; administrador y gerente general             | Cuatro servicios de configuración y catálogos                                   |                   25 | E2E autenticado bloqueado; sin unitarias; formato y lint fallan    | `IMPLEMENTADO`       | Sin API/cuentas/dataset; 18 archivos fuera de formato y 157 errores de lint                         |
| 4     | Archivos y alta de distribuidoras                     | Sin rutas                                                                                                                                  | No verificable                                              | Feature ausente                                                                 |                    0 | Sin pruebas                                                        | `BLOQUEADO_CONTRATO` | Implementación y ambiente de Storage no presentes                                                   |
| 5     | Clientes, crédito y vales                             | Sin rutas                                                                                                                                  | No verificable                                              | Feature ausente                                                                 |                    0 | Sin pruebas                                                        | `BLOQUEADO_CONTRATO` | Implementación y datos controlados no presentes                                                     |
| 6     | Relaciones, pagos y conciliación                      | Sin rutas                                                                                                                                  | No verificable                                              | Feature ausente                                                                 |                    0 | Sin pruebas                                                        | `BLOQUEADO_CONTRATO` | Implementación, workers y datos financieros de prueba no presentes                                  |
| 7     | FE21–FE22                                             | `/administrativa/{puntos,canjes,riesgo,morosidad}/**`, `/operativa/{riesgo,morosidad}/**`, `/movil/{puntos,canjes}/**`                     | Administrativa, tableta y distribuidora según capacidades   | Pantallas de frontera contractual; `PointsApiService`, `RiskApiService`         |                   27 | Unitarias de los 27 contratos; sin UI funcional ni E2E autenticado | `BLOQUEADO_CONTRATO` | Resources, catálogos y reautenticación incompatibles                                                |
| 8     | FE23–FE24                                             | Sin rutas                                                                                                                                  | Administrativa, tableta y móvil no verificables             | Feature `mobility` ausente                                                      |                    0 | Sin pruebas                                                        | `BLOQUEADO_CONTRATO` | 28 endpoints considerados por la etapa; tres no implementados y varios Resources/`items` pendientes |
| 9     | FE25–FE27                                             | `/administrativa/{reportes,notificaciones,auditoria}/**`, `/operativa/{reportes,notificaciones}/**`, `/movil/{reportes,notificaciones}/**` | Tres experiencias según capacidades; auditoría solo global  | Pantallas de frontera contractual; tres servicios API                           |                   11 | Unitarias de los 11 contratos; sin UI funcional ni E2E autenticado | `BLOQUEADO_CONTRATO` | Resources, catálogos, resultados, destinos y permisos incompletos                                   |

## Operaciones integradas

| Dominio            | Servicio                                                                                    | Operaciones | Clasificación                                                  |
| ------------------ | ------------------------------------------------------------------------------------------- | ----------: | -------------------------------------------------------------- |
| Acceso y seguridad | `AuthApiService`, `AccountSecurityApiService`, `AccountsApiService`, `LogoutService`        |          27 | Integradas por feature; sesión completa bloqueada por contexto |
| Organización M02   | `OrganizationApiService`                                                                    |          14 | Integradas por feature                                         |
| Configuraciones    | `ConfigurationsService`, `CategoriesService`, `ProductsService`, `RedemptionPeriodsService` |          25 | Integradas por feature; sin verificación de ambiente           |
| Puntos             | `PointsApiService`                                                                          |          14 | Integradas como frontera de contrato                           |
| Riesgo y morosidad | `RiskApiService`                                                                            |          13 | Integradas como frontera de contrato                           |
| Reportes           | `ReportingApiService`                                                                       |           7 | Integradas como frontera de contrato                           |
| Notificaciones     | `NotificationsApiService`                                                                   |           2 | Integradas como frontera de contrato                           |
| Auditoría          | `AuditApiService`                                                                           |           2 | Integradas como frontera de contrato                           |
| CSRF               | `CsrfService`                                                                               |           1 | Consumida transversalmente mediante `/sanctum/csrf-cookie`     |

No se encontraron llamadas Angular a métodos o rutas ausentes de la guía. Esto verifica método y
ruta, pero no equivale a una prueba de contrato contra una API desplegada.
