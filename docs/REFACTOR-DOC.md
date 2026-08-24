# Arquitectura frontend de MisVales

## Resultado

MisVales es una sola aplicación Angular con una autenticación, una API y tres experiencias visuales autenticadas. Desktop, tablet y mobile no duplican páginas ni reglas de negocio: seleccionan un shell distinto y proyectan dentro de él las mismas features autorizadas.

Las URLs, guards, permisos, servicios HTTP, DTOs y contratos del backend se conservaron. Laravel continúa siendo la autoridad definitiva de autorización.

## Scaffolding final

```text
src/app/
├── core/
│   ├── api/                    # Configuración y clientes transversales de API
│   ├── auth/                   # Login, MFA, recuperación y facade de autenticación
│   ├── authorization/          # Filtrado de capacidades de navegación
│   ├── guards/
│   ├── interceptors/
│   ├── session/
│   ├── config/experience/      # Política desktop/tablet/mobile
│   ├── error-handling/
│   ├── observability/
│   └── realtime/
├── shared/
│   ├── components/
│   │   ├── alerts/
│   │   ├── badges/
│   │   ├── brand/
│   │   ├── inputs/
│   │   ├── loading/
│   │   ├── media/
│   │   ├── navigation/
│   │   └── status/
│   ├── dialogs/
│   ├── directives/
│   ├── forms/
│   ├── pipes/
│   ├── types/
│   └── utils/
├── layouts/
│   ├── auth/
│   ├── desktop/
│   │   ├── desktop-layout.ts
│   │   ├── sidebar/
│   │   ├── header/
│   │   └── navigation/
│   ├── tablet/
│   │   ├── tablet-layout.ts
│   │   ├── header/
│   │   └── navigation/
│   └── mobile/
│       ├── mobile-layout.ts
│       ├── bottom-navigation/
│       └── header/
├── features/
│   ├── dashboard/
│   ├── applications/
│   ├── verifications/
│   ├── distributors/
│   ├── clients/
│   ├── credit/
│   ├── vouchers/
│   ├── counter/
│   ├── relations/
│   ├── payments/
│   ├── reconciliation/
│   ├── points/
│   ├── delinquency/
│   ├── mobility/
│   ├── reports/
│   ├── notifications/
│   ├── audit/
│   └── ...                    # Organización, seguridad y catálogos reales
├── app.routes.ts
├── app.config.ts
└── app.component.ts
```

No se agregaron módulos vacíos ni componentes de demostración para imitar el árbol. Las carpetas adicionales de features representan funcionalidad real que ya existía y que no debe mezclarse artificialmente con otro dominio.

## Responsabilidades

| Capa       | Responsabilidad                                                      | No debe contener                                     |
| ---------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| `core`     | Singletons, sesión, API, autorización e infraestructura transversal  | Páginas de negocio o estilos de un dispositivo       |
| `shared`   | Componentes, formularios, diálogos, tipos y utilidades reutilizables | Requests propios de una feature o reglas financieras |
| `layouts`  | Estructura, header y navegación de cada experiencia                  | Copias de páginas, DTOs o endpoints                  |
| `features` | Páginas y lógica del dominio real                                    | Resolución global del dispositivo o sesión           |

## Resolución de layouts

`core/config/experience/experience-layout.loader.ts` selecciona directamente:

- `desktop`: gerencia general, gerencia de sucursal, administración y caja.
- `tablet`: coordinación y verificación.
- `mobile`: distribuidora.

La política de experiencia decide presentación, no autorización. Los guards del router y Laravel siguen validando el acceso.

## Navegación compartida

`shared/utils/navigation/navigation.config.ts` conserva un solo árbol declarativo de módulos. `core/authorization/navigation.permissions.ts` aplica roles y capacidades efectivas. Desktop, tablet, mobile y dashboard consumen esa misma fuente; ninguno mantiene un menú paralelo.

El sidebar y header de escritorio son propios de `layouts/desktop`. Tablet y mobile separan sus headers y navegaciones táctiles en componentes del layout. Identidad, estados, badges, inputs, evidencias y diálogos permanecen en `shared`.

## Componentes reutilizados

- Inputs y selector personalizado: `shared/components/inputs/refactor-input` y `shared/components/inputs/refactor-select`.
- Badge semántico: `shared/components/badges/semantic-status-badge`.
- Animaciones y vista previa de evidencias: `shared/components/media/attachment-animation` y `attachment-preview-modal`.
- Presentación de verificación: `features/verifications/presentation`.
- Presentación ejecutiva: `features/dashboard/presentation`.
- `/compos` importa las mismas clases anteriores; sus fixtures ilustrativos permanecen aislados en `features/compos/fixtures` y no son consumidos por rutas productivas.

La aplicación real ya consume los componentes recuperados en puntos compatibles con sus contratos:

- El directorio de usuarios usa `refactor-select` para estado, rol y sucursal, alimentado por los roles y sucursales que entregan los servicios existentes.
- La visita física usa `verification-decision-group` y `verification-observation-panel` sobre la misma facade, señales, validación y acción de finalización existentes.
- El dashboard usa `gg-metric-summary-item` únicamente con conteos derivados de la sesión y navegación autorizada; no muestra cifras ilustrativas de las referencias.
- Inputs, errores, badges, direcciones y previews compartidos continúan consumidos por autenticación, solicitudes, caja, pagos, organización y otros features reales.

## Componentes movidos

- Los componentes recuperados de archivos, verificación y gerencia salieron de `src/refactor` y quedaron clasificados por responsabilidad bajo `src/app`.
- Los iconos y animaciones estáticas quedaron en `public/iconos`; la imagen demostrativa del catálogo quedó en `public/images`.
- Los wrappers visuales exclusivos del catálogo quedaron bajo `features/compos/showcases` y no contienen permisos, servicios HTTP ni reglas del dominio.

## Rutas modificadas

- `/compos` se conserva como ruta lazy exclusiva de desarrollo y ahora carga componentes desde `src/app`.
- `/organizacion/asignaciones` permanece como compatibilidad y redirige a `/organizacion/sucursales`.
- `/organizacion/sucursales/:id` reúne mapa, información de la sucursal, personal y transferencias autorizadas. La administración de estado se conserva en `/organizacion/sucursales/:id/configuracion` y mantiene sus guards.
- Las URLs existentes de solicitudes y verificaciones permanecen disponibles para enlaces internos y flujos autorizados; el sidebar las consolida visualmente como `Organización > Distribuidoras` y `Visitas asignadas` para el rol verificador.

## Cambios de frontend que afectan comportamiento

| Archivo                                        | Antes                                                                                                       | Después                                                                                                                                    | Motivo e impacto                                                                        | Compatibilidad y prueba                                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `layouts/desktop/desktop-layout.*`             | El shell usaba `ng-content` para una ruta hija.                                                             | Usa `RouterOutlet`.                                                                                                                        | Permite que Angular renderice el feature autorizado dentro del shell.                   | Conserva URL, guards y servicios; build y pruebas de rutas exitosos.                               |
| `layouts/tablet/tablet-layout.ts`              | El shell usaba `ng-content`.                                                                                | Usa `RouterOutlet` y conserva navegación táctil filtrada.                                                                                  | Corrige contenido vacío sin cambiar capacidades.                                        | Política de roles y pruebas de experiencia exitosas.                                               |
| `layouts/mobile/mobile-layout.ts`              | El shell usaba `ng-content`.                                                                                | Usa `RouterOutlet` y conserva bottom navigation filtrada.                                                                                  | Corrige contenido vacío manteniendo safe areas.                                         | Política de roles y pruebas de experiencia exitosas.                                               |
| `shared/components/media/attachment-animation` | Los JSON dependían de una carpeta temporal compilada.                                                       | Se cargan desde assets públicos del mismo origen con caché.                                                                                | Elimina la dependencia de `src/refactor`.                                               | Mantiene tipos y fallback; build exitoso.                                                          |
| `features/admin/pages/user-list`               | Los tres filtros usaban `select` nativo.                                                                    | Usan el selector accesible personalizado con opciones y tonos semánticos.                                                                  | Unifica la interacción visual sin alterar parámetros, debounce ni recarga.              | Conserva `state`, `role_id`, `branch_id` y sus permisos; pruebas del componente exitosas.          |
| `features/verifications/pages/realizar-visita` | Resultado y observaciones se capturaban con controles locales.                                              | Usan componentes recuperados conectados a las mismas señales.                                                                              | Integra la nueva presentación sin reemplazar la facade ni el flujo de confirmación.     | Conserva payload, validación, `lock_version` y endpoint; pruebas del feature exitosas.             |
| `features/dashboard/dashboard`                 | El resumen de sesión se mostraba únicamente en texto y accesos.                                             | Reutiliza el resumen visual ejecutivo con conteos derivados de roles y navegación efectiva.                                                | Lleva el lenguaje visual a producción sin inventar estadísticas.                        | No agrega requests, permisos ni datos mock; build exitoso.                                         |
| `shared/utils/navigation/navigation.config.ts` | Solicitudes y verificaciones formaban un grupo separado, y asignaciones aparecía como página independiente. | Distribuidoras vive dentro de Organización; los estados del expediente se consultan en la misma bandeja y Sucursales absorbe asignaciones. | Reduce duplicidad conceptual sin ampliar capacidades.                                   | Conserva rutas internas, guards y permisos efectivos; el verificador mantiene su bandeja asignada. |
| `features/organization/pages/branches-list`    | Tabla con código y menú de acciones.                                                                        | Tarjetas completas clicables, nombre, estado, personal y mapa cuando existen coordenadas reales.                                           | Hace reconocible cada sede y convierte toda la tarjeta en acceso al espacio de trabajo. | No inventa ubicaciones; sin coordenadas muestra `Ubicación pendiente`.                             |
| `features/organization/pages/assignments`      | Página independiente seleccionada desde una tabla.                                                          | Espacio de trabajo por sucursal con información, personal y transferencias existentes.                                                     | Reúne contexto y tareas sin duplicar endpoints.                                         | Acciones continúan ocultas y protegidas por sus permisos originales.                               |
| `features/applications/pages/listado`          | Solicitudes era una sección aislada con selector nativo de estado.                                          | La bandeja se presenta como Distribuidoras y ofrece estados de ciclo de vida más un selector personalizado.                                | La revisión es un estado del expediente, no otra sección de navegación.                 | Filtros envían los mismos códigos de estado y no agregan transiciones.                             |

## Auditoría de recuperación funcional

Se comparó el árbol actual contra `HEAD` antes de recuperar código:

- 359 rutas de archivo aparecen eliminadas por la reorganización; 228 son movimientos con contenido idéntico.
- De 255 archivos TypeScript eliminados, todos los símbolos ejecutables continúan presentes salvo `AdminLayoutComponent` y `ExperienceLayoutComponent`, sustituidos por los shells finales.
- Los 71 paths de rutas anteriores siguen presentes; `/compos` es el único path adicional y solo existe fuera de producción.
- Los siete roles anteriores siguen presentes.
- No falta ningún permiso funcional detectado; la comparación incluye guards y configuración declarativa.
- Los 177 patrones de endpoint anteriores siguen presentes. Los patrones adicionales corresponden a funcionalidad posterior ya existente, no al refactor visual.

Esta revisión evita restaurar copias antiguas sobre código vigente y permite recuperar solo responsabilidades realmente ausentes.

## Cambios de backend realizados

- La lectura y el detalle de sucursales exponen de forma aditiva `lat` y `lng`, tomados de `address_latitude` y `address_longitude` ya existentes. No hay migraciones ni coordenadas calculadas o ilustrativas.

## Endpoints agregados o ajustados

- No se agregaron endpoints. `GET /api/v1/branches` y el detalle de sucursal incluyen opcionalmente `lat` y `lng`; requests, autorización y campos previos permanecen iguales.

## Features reorganizadas

- Autenticación salió de `features` y quedó en `core/auth` porque es infraestructura compartida por toda la SPA.
- Clientes, distribuidoras, vales, auditoría, riesgo y verificaciones adoptaron nombres de dominio consistentes en inglés sin cambiar sus URLs públicas.
- `relaciones-pagos` se separó en `relations`, `payments` y `reconciliation`; `/relaciones-pagos/*` permanece compatible.
- Caja quedó en `counter`; líneas e incrementos quedaron en `credit`.
- Reportes usan `features/reports/data-access/reports-api.service.ts`; el centro de operación consume ese servicio sin duplicar endpoints.
- Movilidad organizacional, notificaciones y auditoría tienen features propias.

## Limpieza

- Se retiraron `admin-layout` y el wrapper visual `experience-layout` después de trasladar su resolución a `core/config/experience`.
- Se eliminaron los archivos y dependencias de compilación de `src/refactor`; los assets válidos se movieron a `public`.
- `shared/ui`, `core/components`, `core/forms`, `core/services`, `core/models` y `core/mappers` dejaron de ser ubicaciones activas; su código se clasificó por responsabilidad.
- El root Angular se normalizó a `app.component.ts`, `app.component.html`, `app.component.css` y `app.component.spec.ts`.

## Compatibilidad y validación

- No hubo migraciones ni cambios de reglas de negocio.
- Se preservaron URLs, requests y campos previos. La respuesta de sucursales solo agregó las coordenadas opcionales requeridas por el mapa.
- Se preservaron Angular standalone, lazy loading, signals y guards existentes.
- `npm run build`: exitoso. Permanece el warning del bundle inicial (520.27 kB frente al umbral de 500 kB) y el warning CommonJS previo de Lottie.
- Suite frontend completa: 100 archivos y 289 pruebas exitosas.
- La revisión visual autenticada continúa dependiendo de una sesión válida; no se omitió autenticación para simularla.
