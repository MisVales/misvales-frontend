# AGENTS.md

## Trabajo general

* Lee completamente el prompt antes de modificar código.
* Desarrolla únicamente el módulo, submódulo, pantalla, flujo, corrección o tarea solicitada.
* Sigue exactamente el orden indicado.
* Termina cada parte antes de avanzar a la siguiente.
* No adelantes módulos futuros.
* No agregues funcionalidades no solicitadas.
* No inventes reglas, estados, permisos, validaciones, cálculos, campos, pantallas ni flujos.
* No cambies nombres, estructuras, rutas, contratos o comportamientos definidos.
* No omitas requisitos aunque parezcan evidentes.
* Usa el prompt actual como especificación de la tarea.
* Revisa el código existente antes de implementar.
* Conserva compatibilidad con lo ya desarrollado, salvo que el prompt ordene modificarlo.
* Respeta los endpoints, payloads, responses, códigos de error y nombres de campos definidos por la API.
* Si detectas una contradicción entre el prompt, el contrato de API y el código existente, aplica el prompt únicamente dentro del alcance solicitado y repórtalo al final.
* Si falta una definición necesaria, no inventes una solución funcional. Repórtala como no especificada.
* Implementa el cambio completo, no únicamente una explicación.
* No presentes código parcial como terminado.
* No dejes `TODO`, `FIXME`, mocks permanentes, componentes vacíos, rutas incompletas ni respuestas simuladas.
* No refactorices áreas no relacionadas.
* No elimines código existente sin comprobar que dejó de ser necesario.
* Revisa el diff completo antes de terminar.

---

## Orden de ejecución

1. Lee el prompt completo.
2. Identifica el módulo, submódulo, layout y roles afectados.
3. Revisa la estructura existente del repositorio.
4. Revisa rutas, componentes, servicios, modelos, DTOs, guards, interceptores y pruebas relacionadas.
5. Identifica los endpoints, payloads y responses involucrados.
6. Identifica dependencias e impactos.
7. Implementa en el orden solicitado.
8. Agrega o actualiza pruebas.
9. Ejecuta formato, lint, type check, pruebas y compilación.
10. Corrige los errores encontrados.
11. Revisa el diff completo.
12. Entrega el reporte final.

---

## Aplicación frontend

MisVales se desarrolla como exactamente una aplicación web Angular.

La aplicación debe mantener:

* Un solo repositorio frontend.
* Un solo código base.
* Un solo inicio de sesión.
* Un solo manejo de sesión.
* Un solo despliegue frontend.
* Una sola conexión con la API Laravel.
* Servicios, modelos, componentes y utilidades compartidos cuando realmente sean reutilizables.
* Separación visual y de navegación mediante layouts adaptativos.

No deben crearse aplicaciones Angular independientes por rol, usuario o dispositivo.

---

## Experiencias y layouts

La misma aplicación contiene tres experiencias adaptativas.

### Layout administrativo de escritorio

Usuarios:

* Gerente general.
* Gerente de sucursal.
* Cajera.
* Administrador.

Uso:

* Administración.
* Autorizaciones.
* Caja.
* Conciliación.
* Configuraciones.
* Catálogos.
* Reportes.
* Auditoría.
* Consultas operativas.

Las interfaces de cajera y administrador deben conservar comportamiento responsivo.

### Layout operativo para tableta

Usuarios:

* Coordinador.
* Verificador.

Uso:

* Revisión de solicitudes.
* Seguimiento de distribuidoras.
* Visitas.
* Fotografías.
* Evidencias.
* Registro de diferencias.
* Validaciones.
* Preautorizaciones y autorizaciones permitidas.

Debe diseñarse para interacción táctil, lectura clara y captura operativa en tableta.

### Layout móvil para distribuidoras

Usuario:

* Distribuidora.

Uso:

* Línea de crédito.
* Clientes finales.
* Prevales.
* Vales digitales.
* Relaciones.
* Pagos.
* Puntos.
* Incrementos.
* Transferencias.
* Aclaraciones.
* Excedentes.
* Notificaciones.

Debe ser una experiencia específicamente adaptada para teléfono. No debe reutilizar sin adaptación la presentación administrativa.

### Restricción

El layout modifica presentación, navegación y organización visual.

El layout no concede permisos.

Laravel continúa siendo la autoridad para validar:

* Sesión.
* Rol.
* Permiso.
* Sucursal.
* Jerarquía.
* Propiedad.
* Estado del proceso.
* Acción solicitada.

---

## Alcance frontend

Desarrolla en Angular:

* Pantallas.
* Layouts.
* Navegación.
* Componentes.
* Formularios.
* Validaciones de interfaz.
* Servicios de API.
* DTOs.
* Modelos de vista.
* Mapeadores.
* Guards.
* Interceptores.
* Manejo de sesión.
* Manejo de autenticación y MFA.
* Estados de carga.
* Estados vacíos.
* Estados de error.
* Estados de éxito.
* Tablas.
* Filtros.
* Paginación.
* Búsquedas.
* Confirmaciones.
* Modales.
* Notificaciones visuales.
* Carga y descarga de archivos permitidos.
* Diseño responsivo.
* Accesibilidad.
* Pruebas frontend.
* Documentación técnica frontend.

---

## Fuera del alcance frontend

No desarrolles desde un módulo frontend:

* Reglas autoritativas de seguridad.
* Autorización definitiva.
* Cálculos financieros definitivos.
* Transiciones autoritativas de estado.
* Persistencia directa.
* Acceso directo a PostgreSQL.
* Acceso directo a Redis.
* Jobs de Laravel.
* Eventos o listeners backend.
* Migraciones.
* Endpoints.
* Procesos programados.
* Conciliación financiera autoritativa.
* Generación autoritativa de relaciones.
* Aplicación autoritativa de puntos.
* Aplicación o retiro de morosidad.
* Infraestructura.
* Droplets.
* Nginx.
* Cloudflare.
* Certificados.
* Firewalls.
* Despliegues.
* Observabilidad externa.
* Configuración de servidores.
* Aplicaciones Angular separadas por usuario o dispositivo.

El frontend presenta información, captura acciones y consume contratos. El backend valida y ejecuta las operaciones definitivas.

---

## Arquitectura frontend

Organiza el código en:

```text
src/app/
├── core/
├── layouts/
├── features/
└── shared/
```

La estructura concreta debe respetar primero la organización existente del repositorio.

No reorganices todo el proyecto sin instrucción expresa.

---

## Core

Usa `core` únicamente para elementos globales de la aplicación.

Puede contener:

* Configuración general.
* Cliente HTTP.
* Manejo global de sesión.
* Estado global de autenticación.
* Interceptores HTTP.
* Guards globales.
* Manejo centralizado de errores HTTP.
* Servicios globales.
* Inicialización de la aplicación.
* Modelos transversales de API.
* Utilidades de seguridad de interfaz.
* Manejo de contexto efectivo del usuario.
* Servicios de notificaciones globales.
* Servicios de reautenticación.
* Servicios de carga y descarga compartidos globalmente.

Reglas:

* No coloques funcionalidades específicas de un módulo en `core`.
* No conviertas todos los servicios en globales.
* No uses `core` como carpeta genérica.
* No dupliques servicios globales dentro de cada feature.
* No almacenes datos sensibles en servicios persistentes del navegador.

---

## Layouts

Usa `layouts` para las estructuras visuales principales.

Debe contemplar:

```text
layouts/
├── administrative/
├── tablet/
└── distributor-mobile/
```

Cada layout puede administrar:

* Encabezado.
* Navegación principal.
* Menús.
* Barras laterales.
* Contenedores.
* Navegación inferior móvil.
* Breadcrumbs.
* Espacios de contenido.
* Adaptación visual.
* Comportamiento responsivo.

Reglas:

* No dupliques una feature completa para cada layout.
* No coloques reglas de negocio dentro del layout.
* No concedas permisos desde el layout.
* No asumas que ocultar una opción impide su ejecución.
* No mezcles componentes exclusivos de una feature dentro del layout global.
* El layout debe seleccionarse con base en el contexto efectivo entregado por el backend.
* Un rol no reconocido o un contexto inválido debe producir una navegación segura y controlada.

---

## Features

Mantén cada funcionalidad dentro de su propia feature.

Ejemplos:

```text
features/
├── access/
├── organization/
├── configurations/
├── distributor-applications/
├── distributors/
├── clients/
├── credit-lines/
├── vouchers/
├── cashier/
├── relations/
├── payments/
├── reconciliation/
├── excesses/
├── points/
├── risk/
├── transfers/
├── reports/
├── notifications/
└── audit/
```

La estructura debe adaptarse a los módulos y etapas indicados en cada prompt.

Cada feature puede contener:

```text
feature/
├── pages/
├── components/
├── services/
├── models/
├── dto/
├── mappers/
├── validators/
├── guards/
├── routes/
├── state/
└── tests/
```

Reglas:

* Mantén la lógica del módulo dentro de su feature.
* No coloques lógica específica del módulo en `shared`.
* No crees dependencias circulares entre features.
* No permitas que una feature modifique directamente el estado interno de otra.
* Comparte información mediante contratos claros.
* Mantén rutas de la feature agrupadas.
* Mantén los servicios HTTP específicos dentro de la feature cuando no sean globales.
* No conviertas cada componente en un servicio o abstracción innecesaria.

---

## Shared

Usa `shared` únicamente para elementos reutilizables y sin conocimiento funcional específico.

Puede contener:

* Botones.
* Campos de formulario.
* Selectores genéricos.
* Tablas reutilizables.
* Paginación.
* Indicadores de carga.
* Estados vacíos.
* Mensajes de error.
* Modales genéricos.
* Confirmaciones.
* Componentes de archivo.
* Directivas.
* Pipes.
* Utilidades de presentación.
* Tipos genéricos.
* Componentes accesibles.

Reglas:

* No coloques reglas de MisVales en `shared`.
* No coloques permisos específicos en componentes compartidos.
* No coloques endpoints dentro de componentes compartidos.
* No conviertas `shared` en una carpeta de componentes sin clasificación.
* Un componente compartido debe recibir información mediante entradas tipadas.
* Un componente compartido debe emitir eventos tipados.
* No debe depender de una feature concreta.

---

## Componentes

* Mantén componentes pequeños y con una responsabilidad clara.
* Separa componentes de página y componentes de presentación cuando mejore la claridad.
* Evita componentes excesivamente grandes.
* Evita lógica compleja en templates.
* No realices solicitudes HTTP directamente desde templates.
* No realices múltiples responsabilidades dentro del mismo componente.
* No mezcles captura, consulta, autorización y presentación en un solo componente cuando puedan separarse.
* Usa entradas y salidas tipadas.
* Evita `any`.
* No accedas directamente al DOM salvo necesidad justificada.
* No dupliques componentes que solo cambian ligeramente.
* No abstraigas prematuramente componentes que aún no son reutilizables.
* Mantén estados de carga, error, vacío y éxito explícitos.
* Deshabilita acciones críticas mientras se procesan.
* No muestres éxito hasta recibir confirmación del backend.
* Impide envíos repetidos accidentales.
* Conserva la información capturada cuando un error recuperable permita reintentar.
* Limpia suscripciones, listeners y recursos.

---

## Templates

* Mantén templates declarativos.
* Evita expresiones complejas.
* Evita llamadas repetidas a métodos costosos desde el template.
* No coloques cálculos de negocio en HTML.
* No coloques condiciones autoritativas de seguridad en el template.
* No uses la visibilidad de un botón como protección.
* Mantén etiquetas y mensajes comprensibles.
* Usa semántica HTML adecuada.
* Mantén navegación por teclado.
* Asocia correctamente etiquetas con controles.
* Indica errores de validación de forma accesible.
* Mantén estados de foco visibles.
* Evita contenido desbordado en móvil o tableta.

---

## Formularios

Usa formularios reactivos cuando exista:

* Validación.
* Captura de varios campos.
* Formularios dinámicos.
* Carga de archivos.
* Secciones repetibles.
* Dependencias entre campos.
* Flujos de autorización.
* Confirmación de acciones.
* Edición de información.

Reglas:

* Define controles de forma explícita.
* Usa validadores tipados cuando la arquitectura lo permita.
* No dependas únicamente de la validación del navegador.
* Reproduce en interfaz únicamente validaciones de experiencia de usuario.
* El backend continúa siendo la autoridad final.
* No dupliques reglas financieras complejas en Angular.
* Muestra los errores de `error.fields` en los controles correspondientes.
* Conserva los mensajes generales del backend cuando no exista un campo específico.
* No reemplaces mensajes del backend por conclusiones inventadas.
* No envíes campos que no pertenezcan al contrato.
* No envíes cadenas vacías cuando el contrato requiera `null`, omisión u otro tipo.
* No conviertas automáticamente identificadores.
* No alteres precisión monetaria.
* No permitas doble envío.
* No limpies el formulario antes de recibir confirmación exitosa.
* Marca visualmente campos obligatorios.
* Mantén los campos deshabilitados fuera del payload cuando así lo requiera el contrato.
* Valida correctamente archivos antes de iniciar la carga.

---

## Tipado

* Evita `any`.
* Tipa requests.
* Tipa responses.
* Tipa errores.
* Tipa parámetros de ruta.
* Tipa filtros.
* Tipa eventos.
* Tipa formularios.
* Tipa estados.
* Tipa configuraciones.
* Tipa resultados paginados.
* Tipa archivos y metadatos.
* Tipa los códigos de error conocidos cuando resulte sostenible.
* Usa uniones o enums para conjuntos cerrados definidos por la API.
* No inventes variantes que no estén documentadas.
* No utilices el mismo tipo para estructuras con significados distintos.
* Separa DTOs de API y modelos de vista cuando sus estructuras difieran.
* Usa mapeadores explícitos cuando la interfaz necesite transformar datos.

---

## DTOs, modelos de vista y mapeadores

### DTOs

Los DTOs representan exactamente el contrato del backend.

Reglas:

* Conserva nombres de campos.
* Conserva nulabilidad.
* Conserva estructuras.
* Conserva tipos.
* Conserva formatos.
* Conserva paginación.
* Conserva códigos de error.
* No renombres propiedades por preferencia personal.
* No agregues campos ficticios al contrato.

### Modelos de vista

Los modelos de vista representan lo necesario para mostrar información en la interfaz.

Pueden:

* Combinar campos para presentación.
* Preparar etiquetas.
* Preparar formatos visuales.
* Determinar estados únicamente de presentación.
* Organizar información para tablas o tarjetas.

No pueden:

* Cambiar el significado del dato.
* Ejecutar reglas autoritativas.
* Recalcular resultados financieros definitivos.
* Inferir permisos no entregados por el backend.
* Inventar estados.

### Mapeadores

* Mantén transformaciones explícitas.
* Prueba los mapeadores.
* No ocultes reglas funcionales dentro de mapeadores.
* No conviertas errores de contrato en datos aparentemente válidos.
* Si falta información obligatoria, produce un estado controlado y reporta el problema.

---

## Integración con API

### Contrato OpenAPI de referencia

Usa `docs/openapi.yaml` como contrato OpenAPI de referencia para la integración frontend.

* Respeta exactamente los endpoints, métodos, parámetros, headers, payloads, responses y códigos definidos en ese archivo.
* No rehagas, reformatees ni reinterpretes `docs/openapi.yaml` al copiarlo desde el backend.
* Si el prompt actual contradice `docs/openapi.yaml`, limita cualquier cambio al alcance solicitado y reporta la contradicción al final.

La integración debe respetar exactamente:

* Método HTTP.
* Ruta.
* Parámetros de ruta.
* Query parameters.
* Headers.
* Payload.
* Nombres de campos.
* Tipos.
* Respuestas.
* Paginación.
* Códigos de estado.
* Códigos de error.
* Reglas de idempotencia.
* Reautenticación.
* Carga y descarga de archivos.

Reglas:

* Mantén el versionado `/api/v1`.
* No cambies endpoints desde frontend.
* No uses endpoints diferentes a los definidos.
* No compongas URLs manualmente en componentes.
* Centraliza la URL base en configuración.
* Usa servicios específicos por dominio funcional.
* No crees un único servicio HTTP gigante para toda la aplicación.
* No envíes campos adicionales.
* No renombres campos.
* No alteres estructuras del backend.
* No supongas que una respuesta siempre contiene datos completos.
* Valida la forma de la respuesta cuando sea necesario.
* Maneja respuestas sin contenido.
* Maneja paginación.
* Maneja filtros.
* Maneja errores de red.
* Maneja cancelaciones.
* Evita solicitudes duplicadas.
* No repitas automáticamente una operación mutativa sin confirmar que sea segura.
* Usa `Idempotency-Key` cuando el endpoint lo requiera.
* Conserva la misma clave de idempotencia durante el reintento de la misma operación.
* Genera una clave nueva para una operación nueva.
* No expongas claves de idempotencia como información de usuario.
* Envía tokens de reautenticación únicamente en el campo o header definido por el contrato.
* No registres tokens en consola.

---

## Manejo de errores de API

Contempla como mínimo:

* `401 AUTHENTICATION_REQUIRED`.
* `403 AUTH_SCOPE_DENIED`.
* `404 RESOURCE_NOT_FOUND`.
* `409 RESOURCE_VERSION_CONFLICT`.
* `422 VALIDATION_FAILED`.
* `429 RATE_LIMIT_EXCEEDED`.
* `500 INTERNAL_ERROR`.
* Errores de red.
* Tiempo de espera.
* Respuesta inválida.
* Error de archivo.
* Sesión revocada.
* Contexto inválido.

### 401

* Limpia únicamente el estado de sesión correspondiente.
* Evita ciclos infinitos de redirección.
* Redirige al acceso cuando corresponda.
* No muestres información sensible.
* No repitas automáticamente operaciones mutativas.

### 403

* Muestra que la acción no está permitida.
* No intentes evadir la restricción.
* No redirijas a una pantalla con mayor privilegio.
* Conserva el estado de sesión si continúa siendo válido.

### 404

* Muestra un estado de recurso no disponible.
* No reveles si el recurso existe fuera del alcance del usuario.
* Permite regresar a una ruta segura.

### 409

* Informa que el recurso cambió.
* Obliga a obtener nuevamente la información antes de reintentar.
* No sobrescribas automáticamente datos más recientes.
* No ocultes el conflicto.

### 422

* Relaciona `error.fields` con los controles correspondientes.
* Muestra el mensaje general cuando no exista correspondencia de campo.
* Conserva la captura del usuario.
* No cambies los mensajes para ocultar el motivo real.

### 429

* Impide intentos repetidos.
* Muestra un mensaje controlado.
* Respeta cualquier información temporal entregada por la API.
* No implemente bucles automáticos de reintento.

### 500

* Muestra un mensaje general.
* Conserva el `request_id` cuando sea útil para soporte.
* No muestres trazas.
* No muestres respuestas internas completas.
* No expongas detalles técnicos.

---

## Autenticación y sesión

* Usa el flujo de autenticación definido por la API.
* Usa sesión mediante cookies seguras administradas por el backend.
* No almacenes tokens de sesión en `localStorage`.
* No almacenes tokens de sesión en `sessionStorage`.
* No almacenes contraseñas.
* No almacenes secretos MFA.
* No registres credenciales en consola.
* No simules una sesión local.
* No concedas acceso únicamente porque exista un dato en almacenamiento local.
* Obtén el contexto efectivo mediante el endpoint correspondiente.
* Reconstruye navegación, layout y opciones desde el contexto efectivo.
* Maneja expiración y revocación.
* Maneja cierre de sesión.
* Maneja cierre de otras sesiones cuando corresponda.
* No mantengas datos sensibles después del cierre de sesión.
* Limpia cachés de usuario al cambiar de sesión.
* No reutilices información de un usuario anterior.

---

## Inicio de sesión

El inicio de sesión debe respetar el contrato de la API.

La aplicación enviada debe corresponder con la experiencia de acceso:

* `administrativa`.
* `tableta`.
* `distribuidora`.

Reglas:

* No crees formularios de acceso independientes con lógica duplicada.
* Puede variar la presentación, pero el flujo debe mantenerse centralizado.
* La validación de credenciales no representa por sí sola una sesión completa cuando se requiere MFA.
* Mantén el `mfa_token` únicamente durante el desafío correspondiente.
* Elimina el token temporal al completar, cancelar o expirar el flujo.
* No lo persistas en almacenamiento permanente.
* No permitas cambiar manualmente la aplicación para intentar acceder a otro layout.
* Después de completar MFA, consulta el contexto efectivo.
* El backend determina el rol y alcance real.
* Una aplicación solicitada incompatible debe manejarse mediante la respuesta del backend.

---

## MFA

Contempla los factores permitidos por el contrato:

* TOTP.
* Código de recuperación.
* Passkey o WebAuthn.

Reglas:

* Muestra únicamente factores permitidos por la respuesta.
* No inventes factores.
* No expongas secretos.
* No registres códigos.
* No conserves códigos de recuperación después de la visualización permitida.
* Indica cuando los códigos se muestran una sola vez.
* No captures datos WebAuthn manualmente.
* Usa las capacidades seguras del navegador.
* Maneja cancelación de WebAuthn.
* Maneja dispositivos no compatibles.
* Maneja desafíos expirados.
* No declares el factor configurado hasta que el backend lo confirme.
* No elimines el último factor sin respetar la respuesta y reglas del backend.
* Prueba los flujos exitosos y fallidos.

---

## Reautenticación

Las acciones sensibles pueden requerir reautenticación.

Reglas:

* Solicita el método definido por el flujo.
* Vincula la reautenticación con la acción, recurso, sucursal y parámetros correspondientes.
* No reutilices una autorización temporal para otra acción.
* No persistas el token.
* No lo registres.
* Envíalo únicamente donde lo indique el contrato.
* Invalida el estado local después de utilizarlo.
* Si el backend lo rechaza, solicita una nueva reautenticación.
* No reintentes automáticamente una operación sensible con un token rechazado.
* No omitas la reautenticación para simplificar desarrollo.

---

## Guards

Los guards pueden controlar:

* Existencia de sesión conocida.
* Inicialización del contexto.
* Selección del layout.
* Acceso de navegación según permisos declarados.
* Prevención de acceso a rutas incompatibles con el contexto.
* Protección de formularios con cambios sin guardar.

Los guards no sustituyen:

* Autorización backend.
* Validación de alcance.
* Validación de propiedad.
* Validación de estado.
* Separación de funciones.

Reglas:

* No confíes únicamente en el guard.
* No codifiques permisos dispersos en múltiples guards.
* Centraliza la interpretación del contexto.
* Evita redirecciones circulares.
* Mantén una ruta segura de fallback.
* Prueba usuarios sin contexto.
* Prueba contexto incompleto.
* Prueba acceso directo por URL.
* Prueba cambio de sesión.

---

## Interceptores

Los interceptores pueden administrar:

* Configuración común de solicitudes.
* Credenciales de sesión.
* CSRF.
* Identificador de correlación.
* Normalización de errores.
* Control de solicitudes concurrentes.
* Indicadores globales de carga cuando corresponda.

Reglas:

* No coloques reglas de negocio en interceptores.
* No modifiques payloads funcionales sin que el servicio lo solicite.
* No agregues headers sensibles a endpoints que no los requieren.
* No reintentes automáticamente operaciones mutativas.
* Evita interceptores con responsabilidades excesivas.
* Evita dependencias circulares.
* No ocultes errores.
* No conviertas respuestas fallidas en respuestas exitosas.
* No registres payloads sensibles.

---

## Estado

* Mantén el estado lo más local posible.
* Usa estado global únicamente cuando sea realmente transversal.
* No mantengas copias inconsistentes del mismo recurso.
* No uses almacenamiento del navegador como base de datos.
* No mantengas saldos o estados financieros como autoridad local.
* Actualiza la interfaz después de la confirmación del backend.
* Invalida o actualiza caché después de mutaciones.
* Evita solicitudes duplicadas.
* Evita efectos secundarios ocultos.
* Evita acoplar una feature con la implementación interna de otra.
* Mantén estados explícitos para carga, éxito, error y vacío.
* No conviertas errores en listas vacías.
* No muestres datos antiguos como actuales sin indicarlo.

---

## Navegación y rutas

* Agrupa rutas por feature.
* Usa carga diferida cuando la estructura existente lo permita.
* No expongas información sensible en URLs.
* No coloques documentos, tokens, CURP, datos bancarios ni comprobantes en parámetros de consulta.
* Usa identificadores únicamente cuando el contrato lo requiera.
* Valida parámetros antes de consumir servicios.
* Maneja identificadores inválidos.
* Maneja acceso directo por URL.
* Mantén breadcrumbs coherentes.
* Mantén rutas de retorno seguras.
* No dependas únicamente del historial del navegador.
* Evita rutas duplicadas para la misma operación.
* No crees rutas genéricas para modificar cualquier estado.
* Mantén una pantalla o acción explícita para cada transición.

---

## Diseño responsivo

La interfaz debe comprobarse como mínimo en:

* Escritorio.
* Tableta.
* Teléfono.

Reglas:

* No diseñes únicamente para una resolución fija.
* No ocultes contenido esencial por falta de espacio.
* No obligues a desplazamiento horizontal innecesario.
* Adapta tablas extensas mediante estrategias adecuadas.
* Mantén áreas táctiles suficientes.
* Mantén formularios utilizables con teclado virtual.
* Evita controles demasiado pequeños.
* Mantén acciones críticas visibles y distinguibles.
* No combines acciones destructivas con acciones principales.
* Mantén consistencia entre layouts sin forzar la misma composición visual.
* La experiencia móvil de distribuidora debe diseñarse específicamente para teléfono.
* La experiencia de tableta debe considerar uso táctil y captura de evidencias.

---

## Accesibilidad

* Usa HTML semántico.
* Mantén contraste legible.
* Mantén navegación por teclado.
* Mantén foco visible.
* Asocia etiquetas con controles.
* Describe iconos interactivos.
* No uses únicamente color para representar un estado.
* Anuncia errores importantes.
* Mantén orden lógico de tabulación.
* Permite cerrar modales con mecanismos accesibles.
* Devuelve el foco al elemento correspondiente al cerrar un modal.
* Evita animaciones que impidan la operación.
* Respeta preferencias de movimiento reducido cuando corresponda.
* Prueba formularios y navegación sin mouse.

---

## Archivos y evidencias

Cuando el módulo permita cargar archivos:

* Usa únicamente los endpoints definidos.
* Respeta cantidad máxima.
* Respeta tamaño máximo.
* Respeta extensiones.
* Respeta tipos MIME.
* Respeta propósitos de archivo.
* No inventes políticas no documentadas.
* Valida en interfaz para mejorar la experiencia.
* El backend continúa siendo la autoridad.
* No confíes únicamente en la extensión.
* No muestres rutas internas.
* No expongas URLs permanentes no autorizadas.
* No almacenes archivos en el navegador más tiempo del necesario.
* Libera vistas previas y recursos temporales.
* Maneja progreso cuando esté soportado.
* Maneja cancelación cuando esté soportada.
* Maneja errores individuales.
* No declares una carga terminada hasta recibir confirmación.
* No reutilices una intención de carga para otro archivo o propósito.
* No mezcles evidencias de registros distintos.
* No uses archivos reales en pruebas.

---

## Seguridad frontend

* Deniega navegación por defecto cuando el contexto sea inválido.
* Aplica mínimo privilegio en la presentación.
* No confíes en el frontend como autoridad.
* No uses la ocultación de botones como seguridad.
* No implementes permisos únicamente mediante rutas.
* No almacenes secretos.
* No almacenes contraseñas.
* No almacenes tokens sensibles.
* No registres payloads sensibles.
* No registres documentos.
* No registres datos bancarios.
* No registres CURP completa sin necesidad.
* No muestres información personal innecesaria.
* No incluyas datos sensibles en URLs.
* No uses HTML sin sanitización.
* Evita XSS.
* Respeta CSRF.
* No uses APIs inseguras del navegador sin justificación.
* No agregues bypasses.
* No agregues usuarios ocultos.
* No uses credenciales fijas.
* No desactives controles para facilitar desarrollo.
* No simules permisos de producción.
* No agregues banderas temporales que omitan autenticación.
* No uses datos personales reales en fixtures, mocks o capturas.
* No incluyas información sensible en mensajes de error.
* No muestres respuestas internas completas del backend.

---

## Reglas de negocio

Angular no es la autoridad de las reglas de negocio.

El frontend puede:

* Mostrar información calculada por el backend.
* Mostrar advertencias.
* Guiar al usuario.
* Validar formato.
* Deshabilitar temporalmente acciones para evitar doble envío.
* Presentar límites y estados recibidos.
* Mostrar confirmaciones.
* Preparar payloads.

El frontend no debe:

* Determinar saldos definitivos.
* Calcular relaciones definitivas.
* Recuperar línea.
* Aplicar recargos.
* Calcular puntos definitivos.
* Aplicar penalizaciones.
* Autorizar incrementos.
* Aplicar morosidad.
* Retirar morosidad.
* Conciliar pagos.
* Determinar permisos.
* Confirmar transferencias sin backend.
* Cambiar estados localmente como resultado final.
* Inferir que una operación está permitida porque el botón está visible.

Cuando sea necesario mostrar una simulación o estimación:

* Debe estar autorizada por el prompt o contrato.
* Debe identificarse claramente como estimación.
* No debe reemplazar el resultado del backend.
* No debe persistirse como resultado definitivo.

---

## Fechas, horas y dinero

* Conserva los formatos definidos por la API.
* No interpretes fechas sin zona horaria.
* Presenta fechas conforme a `America/Monterrey` cuando corresponda.
* No cambies la fecha enviada por el backend.
* No uses cadenas arbitrarias para operar fechas.
* No uses `number` como autoridad para cálculos monetarios definitivos.
* No recalcules montos financieros del backend.
* Formatea importes únicamente para presentación.
* Conserva precisión recibida.
* No elimines decimales significativos.
* No conviertas valores monetarios mediante operaciones de punto flotante para decidir una acción.
* No hardcodees fechas, porcentajes, montos, recargos, tolerancias o parámetros de puntos.
* Muestra la configuración y versión entregadas cuando la pantalla lo requiera.

---

## Estados de interfaz

Toda consulta debe contemplar:

* Estado inicial.
* Carga.
* Datos disponibles.
* Lista vacía.
* Error recuperable.
* Error no recuperable.
* Sin permiso.
* Recurso no encontrado.
* Sesión expirada.

Toda operación debe contemplar:

* Estado listo.
* Confirmación cuando corresponda.
* Envío en proceso.
* Acción deshabilitada durante el envío.
* Éxito confirmado.
* Error de validación.
* Conflicto.
* Error de red.
* Reintento controlado.
* Resultado parcial cuando el backend lo defina.

No uses una lista vacía para representar un error.

No uses un mensaje de éxito antes de recibir respuesta exitosa.

---

## Notificaciones visuales

* Usa mensajes específicos y comprensibles.
* Evita mensajes técnicos innecesarios.
* Conserva el mensaje del backend cuando sea relevante.
* No muestres información sensible.
* Distingue éxito, advertencia, error e información.
* No uses notificaciones temporales como único registro de una operación importante.
* Mantén visible el resultado cuando el usuario necesite consultarlo.
* Evita duplicar notificaciones por una misma respuesta.
* No conviertas advertencias en bloqueos no definidos.

---

## Pruebas frontend

Incluye según corresponda:

* Componentes.
* Páginas.
* Servicios.
* DTOs.
* Mapeadores.
* Validadores.
* Formularios.
* Guards.
* Interceptores.
* Navegación.
* Estados.
* Manejo de errores.
* Carga de archivos.
* Accesibilidad.
* Diseño responsivo.
* Regresión.
* Integración entre componentes de una feature.

### Casos mínimos

* Respuesta exitosa.
* Error de validación.
* Error de autenticación.
* Error de permiso.
* Recurso no encontrado.
* Conflicto de versión.
* Rate limit.
* Error interno.
* Error de red.
* Datos incompletos.
* Lista vacía.
* Acción repetida.
* Doble clic.
* Sesión expirada.
* Contexto inválido.
* Acceso directo por URL.
* Rol incompatible.
* Layout correspondiente.
* Formulario válido.
* Formulario inválido.
* Archivo inválido cuando corresponda.

### Reglas

* Mockea contratos de API de forma explícita.
* Usa exactamente las estructuras documentadas.
* No inventes respuestas convenientes.
* Prueba respuestas exitosas y fallidas.
* No uses visibilidad de botones como prueba de seguridad.
* Prueba que una acción deshabilitada no se envíe dos veces.
* Prueba errores por campo.
* Prueba estados vacíos.
* Prueba navegación segura.
* Prueba limpieza de sesión.
* Prueba que no se persistan tokens sensibles.
* Agrega una prueba de regresión por cada corrección.
* No modifiques pruebas para ocultar defectos.
* No elimines pruebas sin justificación.
* No uses pruebas no deterministas.
* No dependas del orden de ejecución.
* No uses temporizadores arbitrarios.
* No dejes pruebas deshabilitadas.
* No dejes `fit`, `fdescribe`, `xit`, `xdescribe` ni equivalentes.
* No afirmes que una prueba pasó si no la ejecutaste.

---

## Verificaciones

Ejecuta los comandos configurados en el repositorio.

Como mínimo, cuando existan:

1. Instalación de dependencias.
2. Formato.
3. Lint.
4. Type check.
5. Pruebas unitarias.
6. Pruebas de componentes.
7. Pruebas de integración frontend.
8. Build de producción.
9. Comprobación de rutas.
10. Comprobación de configuración de ambientes.

Reglas:

* Usa los scripts existentes en `package.json`.
* No inventes comandos como sustituto de scripts existentes.
* No ignores comandos fallidos.
* No declares éxito parcial como éxito total.
* No ocultes warnings relevantes.
* No reduzcas cobertura para aprobar.
* No desactives reglas.
* No uses flags que oculten errores.
* Reporta cualquier comando que no puedas ejecutar.
* Incluye resultados reales.
* No inventes resultados.
* No declares compilación exitosa sin ejecutar el build correspondiente.

---

## Rendimiento

* Evita solicitudes duplicadas.
* Evita renderizados innecesarios.
* Evita cálculos repetidos en templates.
* Evita listas completas sin paginación.
* Usa carga diferida cuando corresponda.
* Libera recursos.
* Cancela solicitudes obsoletas cuando sea seguro.
* No cargues módulos no necesarios para la ruta actual.
* Optimiza imágenes sin alterar evidencias.
* No descargues archivos antes de que el usuario lo solicite.
* No mantengas datos innecesarios en memoria.
* No agregues dependencias pesadas para resolver una función sencilla.
* Mide antes de realizar optimizaciones complejas.
* No sacrifiques claridad o seguridad por microoptimizaciones.

---

## Documentación

* Documenta servicios públicos.
* Documenta DTOs complejos.
* Documenta mapeadores no evidentes.
* Documenta decisiones técnicas.
* Documenta configuración.
* Documenta nuevas variables de ambiente.
* Actualiza `.env.example` cuando corresponda.
* Actualiza el README cuando cambie un procedimiento.
* Actualiza documentación de rutas frontend cuando corresponda.
* Registra los endpoints consumidos por la feature cuando el repositorio siga esa práctica.
* No documentes como terminado algo no implementado.
* No agregues reglas funcionales no solicitadas.
* No copies toda la documentación backend al frontend.
* Mantén la documentación enfocada en integración, presentación y operación del cliente Angular.

---

## Dependencias

Antes de agregar una dependencia:

* Confirma que sea necesaria.
* Confirma que Angular o el repositorio no resuelvan lo mismo.
* Revisa mantenimiento.
* Revisa compatibilidad.
* Revisa licencia.
* Revisa seguridad.
* Revisa impacto en el bundle.
* Evita paquetes abandonados.
* Evita dependencias excesivas.
* Documenta el motivo.
* Actualiza el lockfile.
* Ejecuta las pruebas relacionadas.
* Ejecuta el build de producción.

No actualices dependencias ajenas a la tarea sin instrucción expresa.

No cambies versiones mayores para resolver una funcionalidad local.

---

## Git

### Rama protegida

```text
main
```

La rama `develop` permite push directo.

### No hagas

* Push directo a `main`.
* Force push a `main`.
* Merge a `main` sin Pull Request.
* Autoaprobación de Pull Requests.
* Merge a `main` con verificaciones fallidas.
* Merge a `main` con conversaciones pendientes.
* Reescritura del historial compartido sin coordinación.
* Mezcla de varios módulos no relacionados.
* Mezcla de frontend e infraestructura.

### Formato de ramas

```text
feature/MV-###-descripcion
bugfix/MV-###-descripcion
hotfix/MV-###-descripcion
release/MV-###-descripcion
```

Ejemplos:

```text
feature/MV-102-access-frontend
feature/MV-118-distributor-mobile-layout
feature/MV-130-relations-frontend
bugfix/MV-215-session-validation
hotfix/MV-301-login-redirect
```

### Reglas

* Crea la rama desde la base correcta.
* Mantén una tarea por rama.
* No mezcles módulos.
* No mezcles infraestructura con frontend.
* Resuelve conflictos revisando cada cambio.
* No aceptes conflictos automáticamente.
* No incluyas archivos locales.
* No incluyas dependencias instaladas.
* No incluyas resultados de compilación no requeridos.
* No incluyas secretos.
* Revisa el diff antes de enviar cambios.

---

## Commits

### Tipos permitidos

| Tipo       | Uso                                           |
| ---------- | --------------------------------------------- |
| `feat`     | Nueva funcionalidad.                          |
| `fix`      | Corrección de error.                          |
| `chore`    | Configuración, mantenimiento o tarea técnica. |
| `refactor` | Reestructuración sin cambio funcional.        |
| `test`     | Pruebas.                                      |
| `docs`     | Documentación.                                |
| `build`    | Compilación o dependencias.                   |
| `ci`       | Integración continua.                         |
| `perf`     | Rendimiento.                                  |
| `revert`   | Reversión.                                    |

### Formato

```text
tipo(alcance): descripción
```

Ejemplos:

```text
feat(access): add login form
feat(access): add mfa verification flow
feat(layouts): add distributor mobile navigation
feat(relations): add relation detail page
test(access): add authentication service tests
fix(session): handle revoked session response
docs(frontend): document local development
```

### Reglas

* Usa el módulo o feature como alcance.
* Describe una acción concreta.
* Usa inglés en commits, salvo regla distinta del repositorio.
* Mantén commits pequeños y coherentes.
* No mezcles cambios no relacionados.
* No uses mensajes como `update`, `changes`, `final`, `fix stuff` o `wip`.
* No mezcles formateo masivo con lógica.
* Revisa el diff antes de confirmar.
* Haz commits revisables y reversibles.

---

## Pull Requests

Los Pull Requests son obligatorios para integrar cambios en `main` y opcionales para `develop`.

Incluye:

* Identificador de tarea.
* Objetivo.
* Alcance.
* Módulo.
* Layouts afectados.
* Roles afectados.
* Pantallas agregadas o modificadas.
* Componentes principales.
* Servicios de API.
* Endpoints consumidos.
* Contratos utilizados.
* Riesgos.
* Impacto.
* Pruebas ejecutadas.
* Resultado de verificaciones.
* Build.
* Evidencia visual.
* Pendientes.
* Limitaciones.
* Documentación modificada.

### Reglas

* Usa un título claro.
* Mantén el PR revisable.
* No crees PRs innecesariamente grandes.
* No ocultes trabajo pendiente.
* Resuelve comentarios.
* No cierres conversaciones sin atenderlas.
* Solicita nueva revisión después de cualquier cambio posterior a una aprobación.
* No hagas merge con conflictos.
* No hagas merge con pruebas fallidas.
* No hagas merge de implementaciones incompletas.
* No incluyas cambios ajenos a la tarea.
* Incluye capturas de los layouts afectados cuando aplique.
* Incluye evidencia en escritorio, tableta o móvil según el alcance.

---

## Archivos y secretos

No incluyas en Git:

* `.env`.
* Credenciales.
* Tokens.
* Cookies.
* Secretos MFA.
* Llaves privadas.
* Certificados privados.
* Datos personales reales.
* CURP reales.
* Documentos reales.
* Fotografías reales.
* Archivos bancarios reales.
* Comprobantes reales.
* Logs sensibles.
* Configuración local del IDE.
* Dependencias instaladas.
* Archivos temporales.
* Resultados de compilación no requeridos.
* Artefactos no solicitados.

Mantén `.env.example` actualizado con valores seguros cuando corresponda.

Usa información ficticia en:

* Mocks.
* Fixtures.
* Pruebas.
* Capturas.
* Ejemplos.
* Datos de desarrollo.

---

## Prohibiciones

* No inventes reglas.
* No agregues funcionalidades no solicitadas.
* No adelantes módulos.
* No omitas requisitos.
* No cambies nombres definidos.
* No cambies contratos de API.
* No hardcodees valores configurables.
* No confíes en Angular como seguridad.
* No coloques lógica autoritativa en componentes.
* No calcules resultados financieros definitivos.
* No cambies estados definitivamente sin respuesta del backend.
* No uses almacenamiento local para sesiones sensibles.
* No uses `any` sin justificación excepcional.
* No ignores errores.
* No silencies pruebas.
* No desactives seguridad.
* No agregues bypasses.
* No incluyas secretos.
* No uses datos reales.
* No dejes placeholders.
* No dejes `TODO` ni `FIXME`.
* No presentes mocks como implementación final.
* No modifiques infraestructura desde frontend.
* No refactorices áreas no relacionadas.
* No crees una aplicación separada por layout.
* No dupliques una feature para cada dispositivo.
* No cambies endpoints por preferencia personal.
* No marques una tarea como terminada sin verificaciones.
* No afirmes que algo funciona sin evidencia.
* No ocultes riesgos ni pendientes.
* No conviertas una respuesta de error en éxito visual.
* No declares éxito antes de la confirmación del backend.

---

## Terminado

Considera una tarea terminada únicamente cuando:

* Cumple completamente el prompt.
* Respeta el orden solicitado.
* No omite submódulos.
* No agrega reglas inventadas.
* No adelanta funcionalidades.
* Respeta la aplicación Angular única.
* Respeta los tres layouts.
* Respeta los contratos de API.
* Respeta la arquitectura del repositorio.
* Incluye componentes completos.
* Incluye servicios tipados.
* Incluye validaciones de interfaz.
* Maneja errores.
* Maneja carga, vacío, error y éxito.
* Maneja sesión cuando corresponde.
* Protege datos sensibles.
* Incluye pruebas suficientes.
* Incluye regresión para correcciones.
* Pasa formato.
* Pasa lint.
* Pasa type check.
* Pasa pruebas.
* Compila en producción.
* No contiene código muerto.
* No contiene secretos.
* No contiene archivos locales.
* No contiene trabajo oculto.
* Actualiza documentación técnica.
* Tiene el diff revisado.
* Tiene un reporte final real.

No declares la tarea terminada si existen:

* Pruebas fallidas.
* Errores de compilación.
* Errores de lint.
* Errores de tipos.
* Flujos incompletos.
* Endpoints simulados.
* Pantallas incompletas.
* Contratos no respetados.
* Errores conocidos.
* Partes pendientes.

---

## Reporte final

Entrega siempre las siguientes secciones.

### Cambios realizados

* Funcionalidad implementada.
* Layout afectado.
* Roles afectados.
* Pantallas creadas o modificadas.
* Componentes principales.
* Servicios creados o modificados.
* DTOs.
* Modelos de vista.
* Mapeadores.
* Guards.
* Interceptores.
* Rutas.
* Endpoints integrados.
* Archivos principales modificados.

### Validaciones ejecutadas

* Comandos ejecutados.
* Resultado real.
* Formato.
* Lint.
* Type check.
* Pruebas.
* Build de producción.
* Comprobaciones manuales.
* Dispositivos o resoluciones revisadas.

### Impacto

* Aplicación Angular.
* Layout administrativo.
* Layout de tableta.
* Layout móvil.
* Navegación.
* Sesión.
* API.
* Seguridad.
* Permisos visuales.
* Compatibilidad.
* Rendimiento.
* Accesibilidad.
* Documentación.

### Pendientes y riesgos

* Puntos no especificados.
* Contradicciones detectadas.
* Endpoints incompletos o ambiguos.
* Verificaciones no ejecutadas.
* Limitaciones.
* Dependencias externas.
* Riesgos restantes.

No declares la tarea terminada si existen errores conocidos, verificaciones fallidas o partes incompletas.
