## GET /api/v1/account-requests

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\AccountRequestController@index`

**Payload**

```jsonc
{}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve data con solicitudes. Condición: Permiso/alcance del servicio.

**Response 200**

```json
{
  "data": [
    {
      "result": "<data con solicitudes>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/account-requests

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\AccountRequestController@store`

**Payload**

```jsonc
{
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "name": "<name>",
    "email": "usuario@example.test",
    "role": "COORDINATOR", // Variantes: "VERIFIER", "CASHIER"
    "reason": "<reason>",
    "reauth_token": null
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, solicitud. Condición: Cuenta autorizada; idempotente.

**Response 201**

```json
{
  "data": {
    "result": "<201, solicitud>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/account-requests/{accountRequest}/approve

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\AccountRequestController@approve`

**Payload**

```jsonc
{
  "path": {
    "accountRequest": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reason": "<reason>",
    "reauth_token": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud decidida. Condición: Separación y reautorización del servicio.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud decidida>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/account-requests/{accountRequest}/reject

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\AccountRequestController@reject`

**Payload**

```jsonc
{
  "path": {
    "accountRequest": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reason": "<reason>",
    "reauth_token": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud decidida. Condición: Igual que aprobar.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud decidida>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/accounts

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\AccountController@store`

**Payload**

```jsonc
{
  "body": {
    "name": "<name>",
    "email": "usuario@example.test",
    "role": "COORDINATOR", // Variantes: "VERIFIER", "ADMINISTRATOR", "DISTRIBUTOR", "CASHIER"
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "authorization_token": "<authorization_token>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, cuenta/invitación. Condición: Creación directa autorizada.

**Response 201**

```json
{
  "data": {
    "result": "<201, cuenta/invitación>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/accounts/{account}/disable

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\AccountController@disable`

**Payload**

```jsonc
{
  "path": {
    "account": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "reason": "<reason>",
    "reauth_token": null,
    "compromise": true
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve resultado del ciclo de vida. Condición: Estado y autorización temporal.

**Response 200**

```json
{
  "data": {
    "result": "<resultado del ciclo de vida>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/accounts/{account}/disable-request

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\AccountRequestController@disableRequest`

**Payload**

```jsonc
{
  "path": {
    "account": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "reason": "<reason>",
    "reauth_token": null,
    "compromise": true
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud creada. Condición: Flujo sujeto a aprobación.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud creada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/accounts/{account}/invitation/resend

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\AccountController@resend`

**Payload**

```jsonc
{
  "path": {
    "account": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reauth_token": null
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve mensaje/resultado. Condición: Solo invitación pendiente.

**Response 200**

```json
{
  "message": "<mensaje>"
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/accounts/{account}/reactivate

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\AccountController@reactivate`

**Payload**

```jsonc
{
  "path": {
    "account": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "reason": "<reason>",
    "reauth_token": null,
    "compromise": true
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve resultado del ciclo de vida. Condición: Estado y autorización temporal.

**Response 200**

```json
{
  "data": {
    "result": "<resultado del ciclo de vida>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/accounts/{account}/reactivate-request

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\AccountRequestController@reactivateRequest`

**Payload**

```jsonc
{
  "path": {
    "account": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "reason": "<reason>",
    "reauth_token": null,
    "compromise": true
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud creada. Condición: Flujo sujeto a aprobación.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud creada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/accounts/{account}/recovery

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\AccountController@recovery`

**Payload**

```jsonc
{
  "path": {
    "account": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "reason": "<reason>",
    "reauth_token": null,
    "compromise": true
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve resultado del ciclo de vida. Condición: Recuperación administrativa.

**Response 200**

```json
{
  "data": {
    "result": "<resultado del ciclo de vida>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/accounts/{account}/recovery-request

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\AccountRequestController@recoveryRequest`

**Payload**

```jsonc
{
  "path": {
    "account": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "reason": "<reason>",
    "reauth_token": null,
    "compromise": true
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve solicitud creada. Condición: Flujo sujeto a aprobación.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud creada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/auth/context

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\ContextController@getContext`

**Payload**

```jsonc
{}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve data con contexto efectivo y sesión. Condición: Sesión vigente.

**Response 200**

```json
{
  "data": {
    "result": "<data con contexto efectivo y sesión>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/invitations/complete

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\CredentialController@completeInvitation`

**Payload**

```jsonc
{
  "body": {
    "exchange_token": "<exchange_token>",
    "recovery_codes_confirmed": true,
    "password": "<password>",
    "password_confirmation": "<password_confirmation>",
    "mfa": {
      "type": "<mfa.type>",
      "secret": "<mfa.secret>",
      "code": "<mfa.code>",
      "credential_identifier": "<mfa.credential_identifier>",
      "public_key": "<mfa.public_key>",
      "attestation_token": "<mfa.attestation_token>"
    }
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve cuenta/MFA y códigos según factor. Condición: Pública, token de intercambio.

**Response 200**

```json
{
  "data": {
    "result": "<cuenta/MFA y códigos según factor>"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/invitations/inspect

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\CredentialController@inspect`

**Payload**

```jsonc
{
  "body": {
    "token": "<token>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve datos mínimos de invitación. Condición: Pública.

**Response 200**

```json
{
  "data": {
    "result": "<datos mínimos de invitación>"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/login

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\LoginController@login`

**Payload**

```jsonc
{
  "body": {
    "email": "usuario@example.test",
    "password": "<password>",
    "application": "administrativa" // Variantes: "tableta", "distribuidora"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve message + data.mfa_token, expires_at, allowed_factors, webauthn_challenge. Condición: Pública; credenciales válidas aún no crean sesión completa.

**Response 200**

```json
{
  "message": "Credenciales válidas. Verificación de dos pasos requerida.",
  "data": {
    "mfa_token": "<temporary-secret>",
    "expires_at": "2026-07-29T12:05:00-06:00",
    "allowed_factors": [
      "TOTP"
    ],
    "webauthn_challenge": null
  }
}
```

**Response 401**

```json
{
  "message": "No fue posible iniciar sesión con las credenciales proporcionadas."
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 429**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Se excedió el límite de intentos permitido.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/logout

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\SessionController@logout`

**Payload**

```jsonc
{}
```

**Flujo**

Valida identidad y acceso → revoca/elimina → confirma el resultado. Condición: Invalida sesión actual y regenera CSRF.

**Response 200**

```json
{
  "message": "<mensaje>"
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/mfa/passkeys

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\PasskeyController@store`

**Payload**

```jsonc
{
  "body": {
    "clientDataJSON": "<clientDataJSON>",
    "attestationObject": "<attestationObject>",
    "reauth_token": null
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve credencial registrada. Condición: Reautenticación.

**Response 200**

```json
{
  "data": {
    "result": "<credencial registrada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/mfa/passkeys/options

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\PasskeyController@options`

**Payload**

```jsonc
{}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve opciones/desafío WebAuthn. Condición: Sesión vigente.

**Response 200**

```json
{
  "data": {
    "result": "<opciones/desafío WebAuthn>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## DELETE /api/v1/auth/mfa/passkeys/{credentialId}

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\PasskeyController@destroy`

**Payload**

```jsonc
{
  "path": {
    "credentialId": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identidad y acceso → revoca/elimina → confirma el resultado. Condición: ID entero y propiedad.

**Response 200**

```json
{
  "data": {
    "result": "<resultado de eliminación>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/mfa/recovery-code/verify

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\MfaVerificationController@verifyRecoveryCode`

**Payload**

```jsonc
{
  "body": {
    "mfa_token": "<mfa_token>",
    "code": "<code>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve sesión completada/cookie. Condición: Pública, desafío MFA temporal.

**Response 200**

```json
{
  "data": {
    "result": "<sesión completada/cookie>"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/mfa/recovery-codes/regenerate

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\RecoveryCodeController@regenerate`

**Payload**

```jsonc
{}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve nuevos códigos una sola vez. Condición: Sesión y reautenticación interna.

**Response 200**

```json
{
  "data": {
    "result": "<nuevos códigos una sola vez>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## DELETE /api/v1/auth/mfa/totp

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\TotpController@destroy`

**Payload**

```jsonc
{}
```

**Flujo**

Valida identidad y acceso → revoca/elimina → confirma el resultado. Condición: Sesión vigente.

**Response 200**

```json
{
  "data": {
    "result": "<resultado de eliminación>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/mfa/totp/confirm

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\TotpController@confirm`

**Payload**

```jsonc
{
  "body": {
    "secret": "<secret>",
    "code": "<code>",
    "reauth_token": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve TOTP activado y códigos según flujo. Condición: Reautenticación.

**Response 200**

```json
{
  "data": {
    "result": "<TOTP activado y códigos según flujo>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/mfa/totp/setup

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\TotpController@setup`

**Payload**

```jsonc
{}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve secreto/URI de enrolamiento. Condición: Sesión vigente.

**Response 200**

```json
{
  "data": {
    "result": "<secreto/URI de enrolamiento>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/mfa/totp/verify

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\MfaVerificationController@verifyTotp`

**Payload**

```jsonc
{
  "body": {
    "mfa_token": "<mfa_token>",
    "code": "<code>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve sesión completada/cookie. Condición: Pública, desafío MFA temporal.

**Response 200**

```json
{
  "data": {
    "result": "<sesión completada/cookie>"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/mfa/webauthn/verify

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\MfaVerificationController@verifyPasskey`

**Payload**

```jsonc
{
  "body": {
    "mfa_token": "<mfa_token>",
    "id": "<id>",
    "rawId": "<rawId>",
    "type": "<public-key>",
    "response": {
      "clientDataJSON": "<response.clientDataJSON>",
      "authenticatorData": "<response.authenticatorData>",
      "signature": "<response.signature>",
      "userHandle": null
    }
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve sesión completada/cookie. Condición: Pública, desafío MFA temporal.

**Response 200**

```json
{
  "data": {
    "result": "<sesión completada/cookie>"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/password/change

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\CredentialController@change`

**Payload**

```jsonc
{
  "body": {
    "password": "<password>",
    "password_confirmation": "<password_confirmation>",
    "reauth_token": null
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve message. Condición: Reautorización y revocación de sesiones.

**Response 200**

```json
{
  "message": "<mensaje>"
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/reauthenticate

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\ReauthenticationController@store`

**Payload**

```jsonc
{
  "body": {
    "method": "<method>",
    "action": "<action>",
    "resource_type": null,
    "resource_id": "00000000-0000-4000-8000-000000000000",
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "parameters": {},
    "reason": null,
    "password": "<password>",
    "totp_code": "<totp_code>",
    "challenge_id": "00000000-0000-4000-8000-000000000000",
    "assertion": {
      "id": "<assertion.id>",
      "rawId": "<assertion.rawId>",
      "type": "<public-key>",
      "response": {
        "clientDataJSON": "<assertion.response.clientDataJSON>",
        "authenticatorData": "<assertion.response.authenticatorData>",
        "signature": "<assertion.response.signature>",
        "userHandle": null
      }
    }
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve autorización temporal vinculada. Condición: Acción/recurso/alcance específicos.

**Response 200**

```json
{
  "data": {
    "result": "<autorización temporal vinculada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/recovery/password

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\CredentialController@requestRecovery`

**Payload**

```jsonc
{
  "body": {
    "email": "usuario@example.test"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve respuesta no enumerativa. Condición: Pública, limitada por intentos.

**Response 200**

```json
{
  "data": {
    "result": "<respuesta no enumerativa>"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/auth/recovery/password/complete

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\CredentialController@completeRecovery`

**Payload**

```jsonc
{
  "body": {
    "token": "<token>",
    "password": "<password>",
    "password_confirmation": "<password_confirmation>",
    "factor_type": "TOTP", // Variantes: "RECOVERY_CODE", "PASSKEY_AUTHORIZATION"
    "factor_value": null,
    "mfa": {
      "type": "<mfa.type>",
      "secret": "<mfa.secret>",
      "code": "<mfa.code>",
      "credential_identifier": "<mfa.credential_identifier>",
      "public_key": "<mfa.public_key>",
      "attestation_token": "<mfa.attestation_token>"
    }
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve recuperación completada. Condición: Pública, token/factor válidos.

**Response 200**

```json
{
  "data": {
    "result": "<recuperación completada>"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/auth/sessions

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\SessionController@index`

**Payload**

```jsonc
{}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve data con sesiones. Condición: Propietario.

**Response 200**

```json
{
  "data": [
    {
      "result": "<data con sesiones>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## DELETE /api/v1/auth/sessions/others

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\SessionController@destroyOthers`

**Payload**

```jsonc
{
  "headers": {
    "X-Reauthentication-Token": "<x-reauthentication-token>"
  },
  "body": {
    "reauth_token": "<reauth_token>"
  }
}
```

**Flujo**

Valida identidad y acceso → revoca/elimina → confirma el resultado. Condición: Consume autorización temporal.

**Response 200**

```json
{
  "message": "<mensaje>"
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## DELETE /api/v1/auth/sessions/{sessionId}

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\SessionController@destroy`

**Payload**

```jsonc
{
  "path": {
    "sessionId": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Reauthentication-Token": "<x-reauthentication-token>"
  },
  "body": {
    "reauth_token": "<reauth_token>"
  }
}
```

**Flujo**

Valida identidad y acceso → revoca/elimina → confirma el resultado. Condición: Sesión propia distinta de la actual.

**Response 200**

```json
{
  "message": "<mensaje>"
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/security/alerts

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\SecurityAlertController@index`

**Payload**

```jsonc
{}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve data con alertas. Condición: Alcance del usuario.

**Response 200**

```json
{
  "data": [
    {
      "result": "<data con alertas>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/security/alerts/{alert}/acknowledge

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\SecurityAlertController@acknowledge`

**Payload**

```jsonc
{
  "path": {
    "alert": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve alerta actualizada. Condición: Propietario/alcance.

**Response 200**

```json
{
  "data": {
    "result": "<alerta actualizada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/security/alerts/{alert}/request-action

**Controlador:** `App\Modules\Access\Presentation\Http\Controllers\SecurityAlertController@requestAction`

**Payload**

```jsonc
{
  "path": {
    "alert": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve alerta/solicitud. Condición: Restricciones del servicio.

**Response 200**

```json
{
  "data": {
    "result": "<alerta/solicitud>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/m02/assignments

**Controlador:** `App\Http\Controllers\Api\CoordinatorAssignmentController@index`

**Payload**

```jsonc
{}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve data con asignaciones. Condición: Alcance organizacional.

**Response 200**

```json
{
  "data": [
    {
      "result": "<data con asignaciones>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/m02/assignments

**Controlador:** `App\Http\Controllers\Api\CoordinatorAssignmentController@store`

**Payload**

```jsonc
{
  "body": {
    "distributor_public_id": "00000000-0000-4000-8000-000000000000",
    "coordinator_public_id": "00000000-0000-4000-8000-000000000000",
    "branch_public_id": "00000000-0000-4000-8000-000000000000",
    "starts_at": "2026-07-29T12:00:00-06:00",
    "ends_at": "2026-07-29T12:00:00-06:00",
    "reason": null
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, asignación. Condición: Policy/permiso.

**Response 201**

```json
{
  "data": {
    "result": "<201, asignación>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/m02/assignments/{uuid}

**Controlador:** `App\Http\Controllers\Api\CoordinatorAssignmentController@show`

**Payload**

```jsonc
{
  "path": {
    "uuid": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve data, asignación. Condición: Fuera de alcance se oculta.

**Response 200**

```json
{
  "data": {
    "result": "<data, asignación>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## PUT /api/v1/m02/assignments/{uuid}

**Controlador:** `App\Http\Controllers\Api\CoordinatorAssignmentController@update`

**Payload**

```jsonc
{
  "path": {
    "uuid": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "ends_at": "2026-07-29T12:00:00-06:00",
    "reason": null
  }
}
```

**Flujo**

Valida payload, versión y acceso → actualiza → devuelve data, asignación. Condición: Policy/versión según implementación.

**Response 200**

```json
{
  "data": {
    "result": "<data, asignación>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## DELETE /api/v1/m02/assignments/{uuid}

**Controlador:** `App\Http\Controllers\Api\CoordinatorAssignmentController@destroy`

**Payload**

```jsonc
{
  "path": {
    "uuid": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identidad y acceso → revoca/elimina → confirma el resultado. Condición: Policy.

**Response 200**

```json
{
  "data": {
    "result": "<respuesta de cierre>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/m02/branches

**Controlador:** `App\Http\Controllers\Api\BranchController@index`

**Payload**

```jsonc
{}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve data con sucursales. Condición: Alcance efectivo.

**Response 200**

```json
{
  "data": [
    {
      "result": "<data con sucursales>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/m02/branches/{uuid}

**Controlador:** `App\Http\Controllers\Api\BranchController@show`

**Payload**

```jsonc
{
  "path": {
    "uuid": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve data, sucursal. Condición: Alcance efectivo.

**Response 200**

```json
{
  "data": {
    "result": "<data, sucursal>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/m02/permissions

**Controlador:** `App\Http\Controllers\Api\PermissionController@index`

**Payload**

```jsonc
{}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve data con permisos. Condición: Usuario autenticado/permiso.

**Response 200**

```json
{
  "data": [
    {
      "result": "<data con permisos>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/m02/roles

**Controlador:** `App\Http\Controllers\Api\RoleController@index`

**Payload**

```jsonc
{}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve data con roles. Condición: Usuario autenticado/permiso.

**Response 200**

```json
{
  "data": [
    {
      "result": "<data con roles>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/m02/roles/{id}

**Controlador:** `App\Http\Controllers\Api\RoleController@show`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve data, rol. Condición: Usuario autenticado/permiso.

**Response 200**

```json
{
  "data": {
    "result": "<data, rol>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## PUT /api/v1/m02/roles/{id}/permissions

**Controlador:** `App\Http\Controllers\Api\RoleController@updatePermissions`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida payload, versión y acceso → actualiza → devuelve data, rol/permisos. Condición: Policy; ID entero.

**Response 200**

```json
{
  "data": {
    "result": "<data, rol/permisos>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/m02/scopes

**Controlador:** `App\Http\Controllers\Api\UserRoleScopeController@index`

**Payload**

```jsonc
{}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve data con alcances. Condición: Alcance efectivo.

**Response 200**

```json
{
  "data": [
    {
      "result": "<data con alcances>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/m02/scopes

**Controlador:** `App\Http\Controllers\Api\UserRoleScopeController@store`

**Payload**

```jsonc
{
  "body": {
    "user_public_id": "00000000-0000-4000-8000-000000000000",
    "role_id": 1,
    "scope_type": "GLOBAL", // Variantes: "BRANCH"
    "branch_public_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, alcance. Condición: Policy.

**Response 201**

```json
{
  "data": {
    "result": "<201, alcance>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/m02/users

**Controlador:** `App\Http\Controllers\Api\OrganizationUserController@index`

**Payload**

```jsonc
{
  "query": {
    "search": "<search>",
    "page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección UserOrganizationalResource. Condición: Alcance efectivo.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección UserOrganizationalResource>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/m02/users/{uuid}

**Controlador:** `App\Http\Controllers\Api\OrganizationUserController@show`

**Payload**

```jsonc
{
  "path": {
    "uuid": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve UserOrganizationalResource. Condición: Alcance efectivo.

**Response 200**

```json
{
  "data": {
    "result": "<UserOrganizationalResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/categories

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\CategoryController@index`

**Payload**

```jsonc
{
  "query": {
    "status": "DRAFT", // Variantes: "PUBLISHED", "INACTIVE"
    "page": 1,
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección de categorías/versiones.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección de categorías/versiones>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/categories

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\CategoryController@store`

**Payload**

```jsonc
{
  "body": {
    "name": "<name>",
    "description": "<description>",
    "distributor_profit_rate": "0.00"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, CategoryVersionResource. Condición: Creación autorizada.

**Response 201**

```json
{
  "data": {
    "result": "<201, CategoryVersionResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/categories/{publicId}/deactivate

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\CategoryController@deactivate`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve categoría desactivada. Condición: No elimina histórico.

**Response 200**

```json
{
  "data": {
    "result": "<categoría desactivada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/categories/{publicId}/versions

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\CategoryVersionController@index`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección de versiones.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección de versiones>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/categories/{publicId}/versions

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\CategoryVersionController@store`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "name": "<name>",
    "description": "<description>",
    "distributor_profit_rate": "0.00"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, borrador. Condición: Categoría existente.

**Response 201**

```json
{
  "data": {
    "result": "<201, borrador>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## PUT /api/v1/categories/{publicId}/versions/{versionPublicId}

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\CategoryVersionController@update`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000",
    "versionPublicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "name": "<name>",
    "description": "<description>",
    "distributor_profit_rate": "0.00",
    "lock_version": 1
  }
}
```

**Flujo**

Valida payload, versión y acceso → actualiza → devuelve versión editada. Condición: Solo borrador y lock_version.

**Response 200**

```json
{
  "data": {
    "result": "<versión editada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/categories/{publicId}/versions/{versionPublicId}/publish

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\CategoryVersionController@publish`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000",
    "versionPublicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "effective_from": "2026-07-29T12:00:00-06:00",
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve versión publicada. Condición: Vigencia/no solapamiento.

**Response 200**

```json
{
  "data": {
    "result": "<versión publicada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/configurations

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ConfigurationController@index`

**Payload**

```jsonc
{
  "query": {
    "type": "integer", // Variantes: "money", "percentage", "time", "timezone", "typed_object"
    "page": 1,
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección de configuración vigente.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección de configuración vigente>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/configurations/{key}/versions

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ConfigurationVersionController@index`

**Payload**

```jsonc
{
  "path": {
    "key": "<key>"
  },
  "query": {
    "status": "DRAFT", // Variantes: "PUBLISHED", "INACTIVE"
    "page": 1,
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección histórica. Condición: Clave soportada.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección histórica>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/configurations/{key}/versions

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ConfigurationVersionController@store`

**Payload**

```jsonc
{
  "path": {
    "key": "<key>"
  },
  "body": {
    "key": "<key>",
    "value": "<value>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, borrador. Condición: Clave/valor tipados.

**Response 201**

```json
{
  "data": {
    "result": "<201, borrador>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## PUT /api/v1/configurations/{key}/versions/{publicId}

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ConfigurationVersionController@update`

**Payload**

```jsonc
{
  "path": {
    "key": "<key>",
    "publicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "value": "<value>",
    "lock_version": 1
  }
}
```

**Flujo**

Valida payload, versión y acceso → actualiza → devuelve versión editada. Condición: lock_version.

**Response 200**

```json
{
  "data": {
    "result": "<versión editada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/configurations/{key}/versions/{publicId}/deactivate

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ConfigurationVersionController@deactivate`

**Payload**

```jsonc
{
  "path": {
    "key": "<key>",
    "publicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve versión desactivada. Condición: Estado compatible.

**Response 200**

```json
{
  "data": {
    "result": "<versión desactivada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/configurations/{key}/versions/{publicId}/publish

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ConfigurationVersionController@publish`

**Payload**

```jsonc
{
  "path": {
    "key": "<key>",
    "publicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "effective_from": "2026-07-29T12:00:00-06:00",
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve versión publicada. Condición: Vigencia/no retroactividad.

**Response 200**

```json
{
  "data": {
    "result": "<versión publicada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/products

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ProductController@index`

**Payload**

```jsonc
{
  "query": {
    "status": "DRAFT", // Variantes: "PUBLISHED", "INACTIVE"
    "page": 1,
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección de productos/versiones.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección de productos/versiones>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/products

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ProductController@store`

**Payload**

```jsonc
{
  "body": {
    "amount": "0.00",
    "loan_commission_rate": "0.00",
    "interest_rate_per_fortnight": "0.00",
    "insurance_amount": "0.00",
    "fortnight_count": 1
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, ProductVersionResource. Condición: Creación autorizada.

**Response 201**

```json
{
  "data": {
    "result": "<201, ProductVersionResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/products/{publicId}/deactivate

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ProductController@deactivate`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve producto desactivado. Condición: Conserva histórico.

**Response 200**

```json
{
  "data": {
    "result": "<producto desactivado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/products/{publicId}/versions

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ProductVersionController@index`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección de versiones.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección de versiones>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/products/{publicId}/versions

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ProductVersionController@store`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "amount": "0.00",
    "loan_commission_rate": "0.00",
    "interest_rate_per_fortnight": "0.00",
    "insurance_amount": "0.00",
    "fortnight_count": 1
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, borrador. Condición: Producto existente.

**Response 201**

```json
{
  "data": {
    "result": "<201, borrador>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## PUT /api/v1/products/{publicId}/versions/{versionPublicId}

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ProductVersionController@update`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000",
    "versionPublicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "amount": "0.00",
    "loan_commission_rate": "0.00",
    "interest_rate_per_fortnight": "0.00",
    "insurance_amount": "0.00",
    "fortnight_count": 1,
    "lock_version": 1
  }
}
```

**Flujo**

Valida payload, versión y acceso → actualiza → devuelve versión editada. Condición: Solo borrador/versión.

**Response 200**

```json
{
  "data": {
    "result": "<versión editada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/products/{publicId}/versions/{versionPublicId}/publish

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\ProductVersionController@publish`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000",
    "versionPublicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "effective_from": "2026-07-29T12:00:00-06:00",
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve versión publicada. Condición: Vigencia/no solapamiento.

**Response 200**

```json
{
  "data": {
    "result": "<versión publicada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/redemption-periods

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\RedemptionPeriodController@index`

**Payload**

```jsonc
{
  "query": {
    "status": "DRAFT", // Variantes: "PUBLISHED", "INACTIVE"
    "page": 1,
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección de periodos.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección de periodos>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/redemption-periods

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\RedemptionPeriodController@store`

**Payload**

```jsonc
{
  "body": {
    "name": "<name>",
    "description": null,
    "starts_at": "2026-07-29T12:00:00-06:00",
    "ends_at": "2026-07-29T12:00:00-06:00",
    "reason": null
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, periodo. Condición: Fechas válidas.

**Response 201**

```json
{
  "data": {
    "result": "<201, periodo>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## PUT /api/v1/redemption-periods/{publicId}

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\RedemptionPeriodController@update`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "starts_at": "2026-07-29T12:00:00-06:00",
    "ends_at": "2026-07-29T12:00:00-06:00",
    "lock_version": 1
  }
}
```

**Flujo**

Valida payload, versión y acceso → actualiza → devuelve periodo editado. Condición: lock_version.

**Response 200**

```json
{
  "data": {
    "result": "<periodo editado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/redemption-periods/{publicId}/deactivate

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\RedemptionPeriodController@deactivate`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve periodo desactivado. Condición: Estado compatible.

**Response 200**

```json
{
  "data": {
    "result": "<periodo desactivado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/redemption-periods/{publicId}/publish

**Controlador:** `App\Modules\Configuration\Presentation\Http\Controllers\RedemptionPeriodController@publish`

**Payload**

```jsonc
{
  "path": {
    "publicId": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reauthentication_token": "<reauthentication_token>",
    "reason": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve periodo publicado. Condición: Estado/reauth según Policy.

**Response 200**

```json
{
  "data": {
    "result": "<periodo publicado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributor-applications

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@index`

**Payload**

```jsonc
{
  "query": {
    "folio": "<folio>",
    "status": "CAPTURE", // Variantes: "REJECTED", "ACTIVE"
    "result": "<result>",
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "coordinator_id": "00000000-0000-4000-8000-000000000000",
    "verifier_id": "00000000-0000-4000-8000-000000000000",
    "from": "2026-07-29",
    "to": "2026-07-29",
    "sort": "created_at", // Variantes: "folio", "status"
    "direction": "asc", // Variantes: "desc"
    "per_page": 1,
    "page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección paginada. Condición: Rol/sucursal/jerarquía.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección paginada>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-applications

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@store`

**Payload**

```jsonc
{
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "contact_email": "usuario@example.test",
    "account_name": "<account_name>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, solicitud. Condición: Idempotencia.

**Response 201**

```json
{
  "data": {
    "result": "<201, solicitud>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributor-applications/{id}

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@show`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve detalle. Condición: Alcance/propiedad.

**Response 200**

```json
{
  "data": {
    "result": "<detalle>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## PATCH /api/v1/distributor-applications/{id}

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@update`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "contact_email": "usuario@example.test",
    "account_name": "<account_name>",
    "personal_data": {
      "first_name": "<first_name>",
      "paternal_surname": "<paternal_surname>",
      "official_identification_media_id": "00000000-0000-4000-8000-000000000000"
    },
    "family_members": [
      {
        "operation": "CREATE", // Variantes: "UPDATE", "RETIRE"
        "relationship_code": "<relationship_code>",
        "name": "<name>"
      }
    ]
  }
}
```

**Flujo**

Valida payload, versión y acceso → actualiza datos escalares o aplica altas, cambios y retiros trazables de colecciones → vincula medios M18 autorizados → devuelve detalle actualizado. Condición: estado `CAPTURE`, versión vigente y al menos uno de los campos admitidos. En colecciones, `UPDATE` y `RETIRE` requieren `id`; `CREATE` lo prohíbe.

**Response 200**

```json
{
  "data": {
    "result": "<detalle actualizado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributor-applications/{id}/activation

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@activation`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve estado de activación.

**Response 200**

```json
{
  "data": {
    "result": "<estado de activación>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-applications/{id}/assign-verifier

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@assignVerifier`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "verifier_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud actualizada. Condición: Rol y estado.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud actualizada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-applications/{id}/reassign-verifier

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@reassignVerifier`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "verifier_id": "00000000-0000-4000-8000-000000000000",
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida estado, versión, coordinador responsable, permiso y alcance de sucursal → cierra la asignación vigente → crea una nueva asignación conservando historial → devuelve la solicitud actualizada. Condición: estado `VISIT_ASSIGNED`, sin visita iniciada y verificador sustituto distinto.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud actualizada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-applications/{id}/coordinator-decision

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@coordinatorDecision`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "<decision>",
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve decisión registrada. Condición: Separación/estado.

**Response 200**

```json
{
  "data": {
    "result": "<decisión registrada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-applications/{id}/corrections

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@recordCorrection`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "section": "PERSONAL", // Variantes: "CONTACT", "FAMILY_MEMBER", "FAMILY_REFERENCE", "RESIDENCE", "VEHICLE", "ASSET_LIABILITY", "EMPLOYMENT", "LABOR_REFERENCE", "COMMERCIAL_CREDIT"
    "field_path": "/personal",
    "operation": "REPLACE_VALUE", // Variantes: "ADD_COLLECTION_ITEM", "DEACTIVATE_COLLECTION_ITEM", "REPLACE_DOCUMENT"
    "expected_original_value": {
      "first_name": "<original_first_name>"
    },
    "corrected_value": {
      "first_name": "<corrected_first_name>"
    },
    "reason": "<reason>",
    "difference_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve corrección registrada. Condición: Diferencia corregible.

**Response 200**

```json
{
  "data": {
    "result": "<corrección registrada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-applications/{id}/corrections/complete

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@completeCorrections`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve correcciones completadas. Condición: Sin pendientes.

**Response 200**

```json
{
  "data": {
    "result": "<correcciones completadas>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributor-applications/{id}/history

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@history`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve historial.

**Response 200**

```json
{
  "data": [
    {
      "result": "<historial>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-applications/{id}/manager-decision

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@managerDecision`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "APPROVE", // Variantes: "REJECT"
    "initial_credit_line": null,
    "reason": "<reason>",
    "reauthentication_token": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve decisión/activación. Condición: Reautenticación y estado.

**Response 200**

```json
{
  "data": {
    "result": "<decisión/activación>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-applications/{id}/request-document-correction

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@requestDocumentCorrection`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve solicitud actualizada. Condición: Estado compatible.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud actualizada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-applications/{id}/submit

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@submit`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud enviada. Condición: Expediente completo.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud enviada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-applications/{id}/visits

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@startVisit`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, visita. Condición: Verificador asignado.

**Response 201**

```json
{
  "data": {
    "result": "<201, visita>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributor-applications/{id}/visits/{visitId}

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@showVisit`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000",
    "visitId": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve detalle de visita. Condición: Relación solicitud/visita.

**Response 200**

```json
{
  "data": {
    "result": "<detalle de visita>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-applications/{id}/visits/{visitId}/complete

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@completeVisit`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000",
    "visitId": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "result": "FAVORABLE", // Variantes: "UNFAVORABLE"
    "observations": "<observations>",
    "checklist": [
      {
        "code": "<requirement_code>",
        "confirmed": true,
        "observations": null
      }
    ],
    "evidence_media_ids": [
      "00000000-0000-4000-8000-000000000000"
    ]
  }
}
```

**Flujo**

Valida estado, versión, checklist versionado, medios M18 y autorización → ejecuta la transición → devuelve visita completada. Condición: visita activa, códigos exactos de la versión de requisitos y al menos una evidencia autorizada.

**Response 200**

```json
{
  "data": {
    "result": "<visita completada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-applications/{id}/visits/{visitId}/differences

**Controlador:** `App\Modules\DistributorOnboarding\Presentation\Http\Controllers\DistributorApplicationController@recordDifference`

**Payload**

```jsonc
{
  "path": {
    "id": "00000000-0000-4000-8000-000000000000",
    "visitId": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "X-Trace-Id": "<x-trace-id>",
    "If-Match": 1,
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "section": "PERSONAL", // Variantes: "CONTACT", "FAMILY_MEMBER", "FAMILY_REFERENCE", "RESIDENCE", "VEHICLE", "ASSET_LIABILITY", "EMPLOYMENT", "LABOR_REFERENCE", "COMMERCIAL_CREDIT"
    "field_path": "/personal",
    "declared_value": {},
    "observed_value": {},
    "description": "<description>",
    "classification_code": "<classification_code>",
    "evidence_media_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida payload, destino, catálogo versionado, medio M18 y autorización → registra la diferencia con la versión de catálogo y el `request_id` → devuelve 201, diferencia. Condición: visita activa y catálogo configurado; si falta, deniega con `APPLICATION_DIFFERENCE_CATALOG_UNAVAILABLE`.

**Response 201**

```json
{
  "data": {
    "result": "<201, diferencia>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributors

**Controlador:** `App\Modules\Distributor\Presentation\Http\Controllers\DistributorQueryController@index`

**Payload**

```jsonc
{
  "query": {
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "status": "<status>",
    "distributor_number": "<distributor_number>",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección de resumen. Condición: Alcance por rol/sucursal.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección de resumen>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributors/{distributor}

**Controlador:** `App\Modules\Distributor\Presentation\Http\Controllers\DistributorQueryController@show`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve DistributorAdminDetailResource.

**Response 200**

```json
{
  "data": {
    "result": "<DistributorAdminDetailResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributors/{distributor}/capabilities

**Controlador:** `App\Modules\Distributor\Presentation\Http\Controllers\DistributorQueryController@capabilities`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve DistributorCapabilityResource. Condición: Puede devolver capacidades falsas y bloqueos.

**Response 200**

```json
{
  "data": {
    "result": "<DistributorCapabilityResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributors/{distributor}/category-assignments

**Controlador:** `App\Modules\Distributor\Presentation\Http\Controllers\DistributorQueryController@categoryAssignments`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve colección histórica.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección histórica>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributors/{distributor}/category-assignments

**Controlador:** `App\Modules\Distributor\Presentation\Http\Controllers\DistributorCategoryController@store`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "category_version_id": 1,
    "reason": "<reason>",
    "lock_version": 1
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201 o replay, asignación. Condición: Estado/version/categoría; idempotente.

**Response 200**

```json
{
  "data": {
    "result": "<201 o replay, asignación>"
  }
}
```

**Response 201**

```json
{
  "data": {
    "result": "<201 o replay, asignación>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/me/distributor-profile

**Controlador:** `App\Modules\Distributor\Presentation\Http\Controllers\DistributorProfileController@show`

**Payload**

```jsonc
{}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve DistributorAdminDetailResource. Condición: Solo perfil propio.

**Response 200**

```json
{
  "data": {
    "result": "<DistributorAdminDetailResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/clients

**Controlador:** `App\Modules\Client\Presentation\Http\Controllers\ClientController@index`

**Payload**

```jsonc
{
  "query": {
    "name": "<name>",
    "curp": "<curp>",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "registered_from": "2026-07-29",
    "registered_to": "2026-07-29",
    "portfolio_tracking_enabled": true,
    "sort": "name", // Variantes: "registered_at"
    "direction": "asc", // Variantes: "desc"
    "per_page": 1,
    "page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve ClientListResource paginado. Condición: Alcance por rol/asignación.

**Response 200**

```json
{
  "data": [
    {
      "result": "<ClientListResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/clients

**Controlador:** `App\Modules\Client\Presentation\Http\Controllers\ClientController@store`

**Payload**

```jsonc
{
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "given_names": "<given_names>",
    "surnames": "<surnames>",
    "curp": "<curp>",
    "rfc": null,
    "birth_date": "2026-07-29",
    "birth_place": null,
    "birth_state": null,
    "birth_city": null,
    "address": {
      "street": "<address.street>",
      "exterior_number": "<address.exterior_number>",
      "interior_number": null,
      "neighborhood": "<address.neighborhood>",
      "postal_code": "<address.postal_code>",
      "municipality": "<address.municipality>",
      "city": "<address.city>",
      "state": "<address.state>"
    },
    "official_identification_media_id": "00000000-0000-4000-8000-000000000000",
    "address_proof_media_id": "00000000-0000-4000-8000-000000000000",
    "bank_account": "<bank_account>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201 o replay, detalle por rol. Condición: Idempotencia, datos sensibles y dependencias.

**Response 200**

```json
{
  "data": {
    "result": "<201 o replay, detalle por rol>"
  }
}
```

**Response 201**

```json
{
  "data": {
    "result": "<201 o replay, detalle por rol>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 503**

```json
{
  "error": {
    "code": "CLIENT_DEPENDENCY_UNAVAILABLE",
    "message": "No fue posible resolver una dependencia requerida para la operación.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/clients/{client}

**Controlador:** `App\Modules\Client\Presentation\Http\Controllers\ClientController@show`

**Payload**

```jsonc
{
  "path": {
    "client": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve detalle administrativo o distribuidora. Condición: Resource varía por rol.

**Response 200**

```json
{
  "data": {
    "result": "<detalle administrativo o distribuidora>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/clients/{client}/bank-accounts

**Controlador:** `App\Modules\Client\Presentation\Http\Controllers\ClientController@bankAccounts`

**Payload**

```jsonc
{
  "path": {
    "client": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve colección enmascarada. Condición: Datos sensibles/alcance.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección enmascarada>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/clients/{client}/bank-accounts

**Controlador:** `App\Modules\Client\Presentation\Http\Controllers\ClientController@storeBankAccount`

**Payload**

```jsonc
{
  "path": {
    "client": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "If-Match": 1
  },
  "body": {
    "authorization_id": "00000000-0000-4000-8000-000000000000",
    "operation_id": "00000000-0000-4000-8000-000000000000",
    "bank_account": "<bank_account>",
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve ClientBankAccountMaskedResource. Condición: If-Match y autorización.

**Response 200**

```json
{
  "data": {
    "result": "<ClientBankAccountMaskedResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/clients/{client}/portfolio-entries

**Controlador:** `App\Modules\Client\Presentation\Http\Controllers\ClientController@portfolioEntries`

**Payload**

```jsonc
{
  "path": {
    "client": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve ClientPortfolioEntryResource paginado. Condición: Cartera habilitada/alcance.

**Response 200**

```json
{
  "data": [
    {
      "result": "<ClientPortfolioEntryResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/clients/{client}/portfolio-entries

**Controlador:** `App\Modules\Client\Presentation\Http\Controllers\ClientController@storePortfolioEntry`

**Payload**

```jsonc
{
  "path": {
    "client": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "entry_type": "<entry_type>",
    "amount": "0.00",
    "informational_status": "PENDING", // Variantes: "PARTIAL", "PAID"
    "occurred_on": "2026-07-29",
    "note": null
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201 o replay, entrada. Condición: Idempotencia.

**Response 200**

```json
{
  "data": {
    "result": "<201 o replay, entrada>"
  }
}
```

**Response 201**

```json
{
  "data": {
    "result": "<201 o replay, entrada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## PATCH /api/v1/clients/{client}/portfolio-entries/{entry}

**Controlador:** `App\Modules\Client\Presentation\Http\Controllers\ClientController@updatePortfolioEntry`

**Payload**

```jsonc
{
  "path": {
    "client": "00000000-0000-4000-8000-000000000000",
    "entry": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "If-Match": 1
  },
  "body": {
    "informational_status": "PENDING", // Variantes: "PARTIAL", "PAID"
    "note": null
  }
}
```

**Flujo**

Valida payload, versión y acceso → actualiza → devuelve entrada corregida. Condición: If-Match, relación cliente/entrada.

**Response 200**

```json
{
  "data": {
    "result": "<entrada corregida>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/credit-increase-requests

**Controlador:** `App\Modules\Credit\Presentation\Http\Controllers\CreditIncreaseController@index`

**Payload**

```jsonc
{
  "query": {
    "status": "SOLICITADO", // Variantes: "PREAUTORIZADO", "COMPLETADO"
    "branch_id": 1,
    "coordinator_id": 1,
    "distributor_id": 1,
    "from": "2026-07-29T12:00:00-06:00",
    "to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección paginada. Condición: Alcance por rol/sucursal.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección paginada>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/credit-increase-requests/{creditIncreaseRequest}

**Controlador:** `App\Modules\Credit\Presentation\Http\Controllers\CreditIncreaseController@show`

**Payload**

```jsonc
{
  "path": {
    "creditIncreaseRequest": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve CreditIncreaseRequestResource.

**Response 200**

```json
{
  "data": {
    "result": "<CreditIncreaseRequestResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/credit-increase-requests/{creditIncreaseRequest}/manager-decision

**Controlador:** `App\Modules\Credit\Presentation\Http\Controllers\CreditIncreaseController@managerDecision`

**Payload**

```jsonc
{
  "path": {
    "creditIncreaseRequest": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "authorized_amount": "0.00",
    "reason": "<reason>",
    "reauthentication_id": "00000000-0000-4000-8000-000000000000",
    "reauth_token": null,
    "lock_version": 1
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud decidida. Condición: Reautenticación, versión y separación.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud decidida>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "La solicitud cambió desde que fue consultada.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/credit-increase-requests/{creditIncreaseRequest}/preauthorize

**Controlador:** `App\Modules\Credit\Presentation\Http\Controllers\CreditIncreaseController@review`

**Payload**

```jsonc
{
  "path": {
    "creditIncreaseRequest": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "decision": "PREAUTHORIZE", // Variantes: "REJECT"
    "recommended_amount": "0.00",
    "reason": "<reason>",
    "lock_version": 1
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve solicitud preautorizada/rechazada. Condición: Coordinación, versión y regla del 50 %.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud preautorizada/rechazada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "La solicitud cambió desde que fue consultada.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributors/{distributor}/credit-increase-requests

**Controlador:** `App\Modules\Credit\Presentation\Http\Controllers\CreditIncreaseController@store`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "requested_amount": "0.00",
    "reason": "<reason>",
    "origin": {
      "type": "<origin.type>",
      "product_amount": "0.00"
    },
    "idempotency_key": "<idempotency_key>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201 o replay, solicitud. Condición: Distribuidora/alcance/idempotencia.

**Response 200**

```json
{
  "data": {
    "result": "<201 o replay, solicitud>"
  }
}
```

**Response 201**

```json
{
  "data": {
    "result": "<201 o replay, solicitud>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "La solicitud cambió desde que fue consultada.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributors/{distributor}/credit-line

**Controlador:** `App\Modules\Credit\Presentation\Http\Controllers\CreditLineController@show`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve data con línea y saldos.

**Response 200**

```json
{
  "data": {
    "result": "<data con línea y saldos>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributors/{distributor}/credit-line/movements

**Controlador:** `App\Modules\Credit\Presentation\Http\Controllers\CreditLineController@movements`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "type": "<type>",
    "from": "2026-07-29T12:00:00-06:00",
    "to": "2026-07-29T12:00:00-06:00",
    "source_type": "<source_type>",
    "source_id": "00000000-0000-4000-8000-000000000000",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve CreditLineMovementResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<CreditLineMovementResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/vouchers

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\VoucherController@index`

**Payload**

```jsonc
{
  "query": {
    "folio": null,
    "client_name": null,
    "status": "GENERADO", // Variantes: "LIBERADO", "FERIADO", "RECHAZADO", "CANCELADO"
    "type": "PREVALE", // Variantes: "VALE_DIGITAL"
    "client_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "product_id": "00000000-0000-4000-8000-000000000000",
    "generated_from": "0.00",
    "generated_to": "0.00",
    "sort": "folio", // Variantes: "type", "status", "capital_amount", "generated_at"
    "direction": "asc", // Variantes: "desc"
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve VoucherSummaryResource paginado. Condición: Gate viewAny, alcance real.

**Response 200**

```json
{
  "data": [
    {
      "result": "<VoucherSummaryResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/vouchers

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\VoucherController@store`

**Payload**

```jsonc
{
  "headers": {
    "Idempotency-Key": "<idempotency-key>",
    "X-Request-Id": "<x-request-id>"
  },
  "body": {
    "client_id": "00000000-0000-4000-8000-000000000000",
    "product_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201; replay 200; {"data": Voucher}. Condición: Gate generate; cliente, producto, categoría, crédito y riesgo.

**Response 200**

```json
{
  "data": {
    "result": "<201; replay 200; {\"data\": Voucher}>"
  }
}
```

**Response 201**

```json
{
  "data": {
    "result": "<201; replay 200; {\"data\": Voucher}>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/vouchers/{voucher}

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\VoucherController@show`

**Payload**

```jsonc
{
  "path": {
    "voucher": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve VoucherResource. Condición: Gate viewAny, detalle auditado.

**Response 200**

```json
{
  "data": {
    "result": "<VoucherResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/modification-requests

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\ModificationRequestController@index`

**Payload**

```jsonc
{
  "query": {
    "status": "PENDIENTE", // Variantes: "AUTORIZADO", "RECHAZADO", "USADO", "VENCIDO"
    "voucher_id": "00000000-0000-4000-8000-000000000000",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve ModificationRequestResource paginado. Condición: Gate/alcance.

**Response 200**

```json
{
  "data": [
    {
      "result": "<ModificationRequestResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/modification-requests/{modificationRequest}

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\ModificationRequestController@show`

**Payload**

```jsonc
{
  "path": {
    "modificationRequest": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve ModificationRequestResource. Condición: Gate/alcance.

**Response 200**

```json
{
  "data": {
    "result": "<ModificationRequestResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/modification-requests/{modificationRequest}/apply

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\ModificationRequestController@apply`

**Payload**

```jsonc
{
  "path": {
    "modificationRequest": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>",
    "X-Request-Id": "<x-request-id>"
  },
  "body": {
    "lock_version": 1,
    "token": "<token>",
    "changes": {}
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud aplicada. Condición: Token HMAC, un uso, versión.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud aplicada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/modification-requests/{modificationRequest}/authorize

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\ModificationRequestController@authorizeRequest`

**Payload**

```jsonc
{
  "path": {
    "modificationRequest": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>",
    "X-Request-Id": "<x-request-id>"
  },
  "body": {
    "lock_version": 1,
    "decision_reason": "<decision_reason>",
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud autorizada y token emitido según flujo. Condición: Reautenticación/separación.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud autorizada y token emitido según flujo>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/modification-requests/{modificationRequest}/reject

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\ModificationRequestController@rejectRequest`

**Payload**

```jsonc
{
  "path": {
    "modificationRequest": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>",
    "X-Request-Id": "<x-request-id>"
  },
  "body": {
    "lock_version": 1,
    "decision_reason": "<decision_reason>",
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud rechazada. Condición: Estado/versión.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud rechazada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/vouchers/{voucher}/fulfill

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\VoucherController@fulfill`

**Payload**

```jsonc
{
  "path": {
    "voucher": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>",
    "X-Request-Id": "<x-request-id>"
  },
  "body": {
    "lock_version": 1,
    "transaction_number": "<transaction_number>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve VoucherResource. Condición: Número de transacción único, versión.

**Response 200**

```json
{
  "data": {
    "result": "<VoucherResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/vouchers/{voucher}/modification-requests

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\VoucherController@requestModification`

**Payload**

```jsonc
{
  "path": {
    "voucher": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>",
    "X-Request-Id": "<x-request-id>"
  },
  "body": {
    "lock_version": 1,
    "fields": {},
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve ModificationRequestResource. Condición: Campos permitidos/estado.

**Response 200**

```json
{
  "data": {
    "result": "<ModificationRequestResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/vouchers/{voucher}/open-at-counter

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\VoucherController@open`

**Payload**

```jsonc
{
  "path": {
    "voucher": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>",
    "X-Request-Id": "<x-request-id>"
  },
  "body": {
    "lock_version": 1
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve VoucherResource. Condición: Caja/sucursal/versión.

**Response 200**

```json
{
  "data": {
    "result": "<VoucherResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/vouchers/{voucher}/reject

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\VoucherController@reject`

**Payload**

```jsonc
{
  "path": {
    "voucher": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>",
    "X-Request-Id": "<x-request-id>"
  },
  "body": {
    "lock_version": 1,
    "reason_code": "<reason_code>",
    "description": "<description>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve VoucherResource. Condición: Motivo permitido/versión.

**Response 200**

```json
{
  "data": {
    "result": "<VoucherResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/vouchers/{voucher}/release

**Controlador:** `App\Modules\Voucher\Presentation\Http\Controllers\VoucherController@release`

**Payload**

```jsonc
{
  "path": {
    "voucher": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>",
    "X-Request-Id": "<x-request-id>"
  },
  "body": {
    "lock_version": 1,
    "checks": {
      "identity_verified": true,
      "address_verified": true,
      "identification_verified": true,
      "proof_of_address_verified": true,
      "bank_account_verified": true
    }
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve VoucherResource. Condición: Cinco verificaciones y versión.

**Response 200**

```json
{
  "data": {
    "result": "<VoucherResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/cut-runs

**Controlador:** `App\Modules\Relation\Interfaces\Http\Controllers\CutRunController@store`

**Payload**

```jsonc
{
  "headers": {
    "X-Reauthentication-Token": "<x-reauthentication-token>"
  },
  "body": {
    "operative_date": "2026-07-29",
    "reauth_token": "<reauth_token>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, {"data": cut_run} si inicia. Condición: Reautorización RELATION_CUT_RUN; America/Monterrey.

**Response 201**

```json
{
  "data": {
    "result": "<201, {\"data\": cut_run} si inicia>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/bank-imports

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentReadController@bankImports`

**Payload**

```jsonc
{
  "query": {
    "status": "<status>",
    "business_date": "2026-07-29",
    "paid_at": "2026-07-29T12:00:00-06:00",
    "branch_id": 1,
    "distributor_id": 1,
    "relation_id": "00000000-0000-4000-8000-000000000000",
    "bank_import_id": "00000000-0000-4000-8000-000000000000",
    "bank_folio_normalized": "<bank_folio_normalized>",
    "payment_reference_normalized": "<payment_reference_normalized>",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve BankImportResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<BankImportResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/bank-imports

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentCommandController@receiveBankImport`

**Payload**

```jsonc
{
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "file": "<binary>",
    "business_date": "2026-07-29"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 202/resultado de recepción. Condición: Idempotencia; contrato bancario.

**Response 202**

```json
{
  "data": {
    "result": "<202/resultado de recepción>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El registro cambió desde que fue consultado.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/bank-imports/{bankImport}

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentReadController@bankImport`

**Payload**

```jsonc
{
  "path": {
    "bankImport": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve BankImportResource.

**Response 200**

```json
{
  "data": {
    "result": "<BankImportResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/bank-imports/{bankImport}/movements

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentReadController@importMovements`

**Payload**

```jsonc
{
  "path": {
    "bankImport": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "status": "<status>",
    "business_date": "2026-07-29",
    "paid_at": "2026-07-29T12:00:00-06:00",
    "branch_id": 1,
    "distributor_id": 1,
    "relation_id": "00000000-0000-4000-8000-000000000000",
    "bank_import_id": "00000000-0000-4000-8000-000000000000",
    "bank_folio_normalized": "<bank_folio_normalized>",
    "payment_reference_normalized": "<payment_reference_normalized>",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve BankMovementResource paginado. Condición: Importación/alcance.

**Response 200**

```json
{
  "data": [
    {
      "result": "<BankMovementResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/bank-imports/{bankImport}/retry

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentCommandController@retryBankImport`

**Payload**

```jsonc
{
  "path": {
    "bankImport": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve importación reprogramada. Condición: Estado reintentable/idempotencia.

**Response 200**

```json
{
  "data": {
    "result": "<importación reprogramada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El registro cambió desde que fue consultado.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/bank-movements

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentReadController@bankMovements`

**Payload**

```jsonc
{
  "query": {
    "status": "<status>",
    "business_date": "2026-07-29",
    "paid_at": "2026-07-29T12:00:00-06:00",
    "branch_id": 1,
    "distributor_id": 1,
    "relation_id": "00000000-0000-4000-8000-000000000000",
    "bank_import_id": "00000000-0000-4000-8000-000000000000",
    "bank_folio_normalized": "<bank_folio_normalized>",
    "payment_reference_normalized": "<payment_reference_normalized>",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve BankMovementResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<BankMovementResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/bank-movements/{bankMovement}

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentReadController@bankMovement`

**Payload**

```jsonc
{
  "path": {
    "bankMovement": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve BankMovementResource.

**Response 200**

```json
{
  "data": {
    "result": "<BankMovementResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/clarifications

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentReadController@clarifications`

**Payload**

```jsonc
{
  "query": {
    "status": "<status>",
    "business_date": "2026-07-29",
    "paid_at": "2026-07-29T12:00:00-06:00",
    "branch_id": 1,
    "distributor_id": 1,
    "relation_id": "00000000-0000-4000-8000-000000000000",
    "bank_import_id": "00000000-0000-4000-8000-000000000000",
    "bank_folio_normalized": "<bank_folio_normalized>",
    "payment_reference_normalized": "<payment_reference_normalized>",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve ClarificationResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<ClarificationResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/clarifications

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentCommandController@createClarification`

**Payload**

```jsonc
{
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "relation_id": "00000000-0000-4000-8000-000000000000",
    "reported_amount": "0.00",
    "reported_date": "2026-07-29",
    "reported_reference": "<reported_reference>",
    "reported_bank_folio": null,
    "description": "<description>",
    "evidence": "<binary>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201 o replay, aclaración. Condición: Relación/archivo/idempotencia.

**Response 200**

```json
{
  "data": {
    "result": "<201 o replay, aclaración>"
  }
}
```

**Response 201**

```json
{
  "data": {
    "result": "<201 o replay, aclaración>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El registro cambió desde que fue consultado.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/clarifications/{clarification}

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentReadController@clarification`

**Payload**

```jsonc
{
  "path": {
    "clarification": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve ClarificationResource.

**Response 200**

```json
{
  "data": {
    "result": "<ClarificationResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/clarifications/{clarification}/link-movement

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentCommandController@linkMovement`

**Payload**

```jsonc
{
  "path": {
    "clarification": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "bank_movement_id": "00000000-0000-4000-8000-000000000000",
    "lock_version": 1
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve aclaración vinculada. Condición: Estado/versión.

**Response 200**

```json
{
  "data": {
    "result": "<aclaración vinculada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El registro cambió desde que fue consultado.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/clarifications/{clarification}/reject

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentCommandController@rejectClarification`

**Payload**

```jsonc
{
  "path": {
    "clarification": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "reason": "<reason>",
    "lock_version": 1,
    "authorization_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve aclaración rechazada. Condición: Estado/versión/autorización.

**Response 200**

```json
{
  "data": {
    "result": "<aclaración rechazada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El registro cambió desde que fue consultado.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/manual-reconciliations

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentReadController@manualReconciliations`

**Payload**

```jsonc
{
  "query": {
    "status": "<status>",
    "business_date": "2026-07-29",
    "paid_at": "2026-07-29T12:00:00-06:00",
    "branch_id": 1,
    "distributor_id": 1,
    "relation_id": "00000000-0000-4000-8000-000000000000",
    "bank_import_id": "00000000-0000-4000-8000-000000000000",
    "bank_folio_normalized": "<bank_folio_normalized>",
    "payment_reference_normalized": "<payment_reference_normalized>",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve ManualReconciliationResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<ManualReconciliationResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/manual-reconciliations

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentCommandController@requestManualReconciliation`

**Payload**

```jsonc
{
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "bank_movement_id": "00000000-0000-4000-8000-000000000000",
    "relation_id": "00000000-0000-4000-8000-000000000000",
    "clarification_id": "00000000-0000-4000-8000-000000000000",
    "reason": "<reason>",
    "evidence": "<binary>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, solicitud. Condición: Relación/movimiento/evidencia.

**Response 201**

```json
{
  "data": {
    "result": "<201, solicitud>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/manual-reconciliations/{manualReconciliation}

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentReadController@manualReconciliation`

**Payload**

```jsonc
{
  "path": {
    "manualReconciliation": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve ManualReconciliationResource.

**Response 200**

```json
{
  "data": {
    "result": "<ManualReconciliationResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/manual-reconciliations/{manualReconciliation}/apply

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentCommandController@applyManual`

**Payload**

```jsonc
{
  "path": {
    "manualReconciliation": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "reason": "<reason>",
    "lock_version": 1,
    "authorization_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve conciliación aplicada. Condición: Autorización, estado, versión.

**Response 200**

```json
{
  "data": {
    "result": "<conciliación aplicada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El registro cambió desde que fue consultado.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/manual-reconciliations/{manualReconciliation}/authorize

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentCommandController@authorizeManual`

**Payload**

```jsonc
{
  "path": {
    "manualReconciliation": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "reason": "<reason>",
    "lock_version": 1,
    "authorization_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve conciliación autorizada. Condición: Separación/reauth.

**Response 200**

```json
{
  "data": {
    "result": "<conciliación autorizada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El registro cambió desde que fue consultado.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/manual-reconciliations/{manualReconciliation}/reject

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentCommandController@rejectManual`

**Payload**

```jsonc
{
  "path": {
    "manualReconciliation": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "reason": "<reason>",
    "lock_version": 1,
    "authorization_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve conciliación rechazada. Condición: Estado/versión.

**Response 200**

```json
{
  "data": {
    "result": "<conciliación rechazada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El registro cambió desde que fue consultado.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/payment-allocations/{paymentAllocation}

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentReadController@allocation`

**Payload**

```jsonc
{
  "path": {
    "paymentAllocation": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve PaymentAllocationResource con desglose.

**Response 200**

```json
{
  "data": {
    "result": "<PaymentAllocationResource con desglose>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/relations/{relation}/payments

**Controlador:** `App\Modules\Payment\Presentation\Http\Controllers\PaymentReadController@relationPayments`

**Payload**

```jsonc
{
  "path": {
    "relation": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "status": "<status>",
    "business_date": "2026-07-29",
    "paid_at": "2026-07-29T12:00:00-06:00",
    "branch_id": 1,
    "distributor_id": 1,
    "relation_id": "00000000-0000-4000-8000-000000000000",
    "bank_import_id": "00000000-0000-4000-8000-000000000000",
    "bank_folio_normalized": "<bank_folio_normalized>",
    "payment_reference_normalized": "<payment_reference_normalized>",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve colección de aplicaciones. Condición: Relación/alcance.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección de aplicaciones>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/excess-balances

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@index`

**Payload**

```jsonc
{
  "query": {
    "folio": "<folio>",
    "status": "<status>",
    "date_from": "2026-07-29",
    "date_to": "2026-07-29",
    "has_retained": true,
    "has_available": true,
    "has_reservation": true,
    "refund_pending": true,
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve ExcessBalanceResource paginado. Condición: Vista administrativa.

**Response 200**

```json
{
  "data": [
    {
      "result": "<ExcessBalanceResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/excess-balances/{excessBalance}

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@show`

**Payload**

```jsonc
{
  "path": {
    "excessBalance": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve ExcessBalanceResource.

**Response 200**

```json
{
  "data": {
    "result": "<ExcessBalanceResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/excess-balances/{excessBalance}/applications

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@applications`

**Payload**

```jsonc
{
  "path": {
    "excessBalance": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve ExcessApplicationResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<ExcessApplicationResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/me/excess-balances

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@index`

**Payload**

```jsonc
{
  "query": {
    "folio": "<folio>",
    "status": "<status>",
    "date_from": "2026-07-29",
    "date_to": "2026-07-29",
    "has_retained": true,
    "has_available": true,
    "has_reservation": true,
    "refund_pending": true,
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección propia. Condición: Distribuidora autenticada.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección propia>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/me/excess-balances/{excessBalance}

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@show`

**Payload**

```jsonc
{
  "path": {
    "excessBalance": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve ExcessBalanceResource. Condición: Propietario.

**Response 200**

```json
{
  "data": {
    "result": "<ExcessBalanceResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/me/excess-balances/{excessBalance}/credit-balance

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@chooseCredit`

**Payload**

```jsonc
{
  "path": {
    "excessBalance": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "lock_version": 1
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve excedente marcado/aplicado. Condición: Estado, saldo, versión, idempotencia.

**Response 200**

```json
{
  "data": {
    "result": "<excedente marcado/aplicado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/me/excess-balances/{excessBalance}/refund-requests

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@requestRefund`

**Payload**

```jsonc
{
  "path": {
    "excessBalance": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "lock_version": 1,
    "reason": null
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, solicitud. Condición: Saldo disponible/idempotencia.

**Response 201**

```json
{
  "data": {
    "result": "<201, solicitud>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/me/refund-requests

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@refundIndex`

**Payload**

```jsonc
{
  "query": {
    "folio": "<folio>",
    "status": "<status>",
    "date_from": "2026-07-29",
    "date_to": "2026-07-29",
    "has_retained": true,
    "has_available": true,
    "has_reservation": true,
    "refund_pending": true,
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve RefundRequestResource paginado. Condición: Propietario.

**Response 200**

```json
{
  "data": [
    {
      "result": "<RefundRequestResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/me/refund-requests/{refundRequest}

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@refundShow`

**Payload**

```jsonc
{
  "path": {
    "refundRequest": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve RefundRequestResource. Condición: Propietario.

**Response 200**

```json
{
  "data": {
    "result": "<RefundRequestResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/refund-requests

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@refundIndex`

**Payload**

```jsonc
{
  "query": {
    "folio": "<folio>",
    "status": "<status>",
    "date_from": "2026-07-29",
    "date_to": "2026-07-29",
    "has_retained": true,
    "has_available": true,
    "has_reservation": true,
    "refund_pending": true,
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve RefundRequestResource paginado. Condición: Vista administrativa.

**Response 200**

```json
{
  "data": [
    {
      "result": "<RefundRequestResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/refund-requests/{refundRequest}

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@refundShow`

**Payload**

```jsonc
{
  "path": {
    "refundRequest": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve RefundRequestResource.

**Response 200**

```json
{
  "data": {
    "result": "<RefundRequestResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/refund-requests/{refundRequest}/authorize

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@authorizeRefund`

**Payload**

```jsonc
{
  "path": {
    "refundRequest": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "lock_version": 1,
    "reauthentication_token": "<reauthentication_token>",
    "reason": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud autorizada. Condición: Reauth/separación/versión.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud autorizada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/refund-requests/{refundRequest}/complete

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@completeRefund`

**Payload**

```jsonc
{
  "path": {
    "refundRequest": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "amount": "0.00",
    "refunded_at": "2026-07-29T12:00:00-06:00",
    "method": "<method>",
    "reference": "<reference>",
    "evidence": "<binary>",
    "lock_version": 1
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud completada. Condición: Método/evidencia/versión.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud completada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/refund-requests/{refundRequest}/evidence

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@evidence`

**Payload**

```jsonc
{
  "path": {
    "refundRequest": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida acceso y disponibilidad → obtiene el contenido/resultado → lo devuelve. Condición: Policy y archivo privado.

**Response 200**

```json
{
  "data": {
    "result": "<respuesta controlada de evidencia>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/refund-requests/{refundRequest}/reject

**Controlador:** `App\Modules\ExcessBalance\Presentation\Http\Controllers\ExcessBalanceController@rejectRefund`

**Payload**

```jsonc
{
  "path": {
    "refundRequest": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "lock_version": 1,
    "reauthentication_token": "<reauthentication_token>",
    "reason": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud rechazada. Condición: Reauth/estado/versión.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud rechazada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributors/{distributor}/points

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointAccountController@show`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve PointBalanceResource. Condición: Alcance administrativo.

**Response 200**

```json
{
  "data": {
    "result": "<PointBalanceResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributors/{distributor}/points/movements

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointAccountController@movements`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "per_page": 1,
    "type": "EARNED", // Variantes: "REDEEMED"
    "status": "PENDING", // Variantes: "AUTHORIZED", "REJECTED", "COMPLETED"
    "relation_id": "00000000-0000-4000-8000-000000000000",
    "date_from": "2026-07-29T12:00:00-06:00",
    "date_to": "2026-07-29T12:00:00-06:00"
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve PointMovementResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<PointMovementResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/me/point-redemptions

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointRedemptionController@mine`

**Payload**

```jsonc
{
  "query": {
    "per_page": 1,
    "type": "EARNED", // Variantes: "REDEEMED"
    "status": "PENDING", // Variantes: "AUTHORIZED", "REJECTED", "COMPLETED"
    "relation_id": "00000000-0000-4000-8000-000000000000",
    "date_from": "2026-07-29T12:00:00-06:00",
    "date_to": "2026-07-29T12:00:00-06:00"
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve canjes propios paginados. Condición: Distribuidora autenticada.

**Response 200**

```json
{
  "data": [
    {
      "result": "<canjes propios paginados>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/me/points

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointAccountController@me`

**Payload**

```jsonc
{}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve PointBalanceResource. Condición: Cuenta propia.

**Response 200**

```json
{
  "data": {
    "result": "<PointBalanceResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/me/points/movements

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointAccountController@myMovements`

**Payload**

```jsonc
{
  "query": {
    "per_page": 1,
    "type": "EARNED", // Variantes: "REDEEMED"
    "status": "PENDING", // Variantes: "AUTHORIZED", "REJECTED", "COMPLETED"
    "relation_id": "00000000-0000-4000-8000-000000000000",
    "date_from": "2026-07-29T12:00:00-06:00",
    "date_to": "2026-07-29T12:00:00-06:00"
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve movimientos propios paginados. Condición: Cuenta propia.

**Response 200**

```json
{
  "data": [
    {
      "result": "<movimientos propios paginados>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/point-redemption-periods

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\RedemptionPeriodController@index`

**Payload**

```jsonc
{
  "query": {
    "per_page": 1,
    "page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección de periodos. Condición: Rol autorizado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección de periodos>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/point-redemption-periods

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\RedemptionPeriodController@store`

**Payload**

```jsonc
{
  "body": {
    "name": "<name>",
    "description": null,
    "starts_at": "2026-07-29T12:00:00-06:00",
    "ends_at": "2026-07-29T12:00:00-06:00",
    "reason": null
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, RedemptionPeriodResource. Condición: Rol autorizado.

**Response 201**

```json
{
  "data": {
    "result": "<201, RedemptionPeriodResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/point-redemption-periods/{period}

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\RedemptionPeriodController@show`

**Payload**

```jsonc
{
  "path": {
    "period": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve RedemptionPeriodResource.

**Response 200**

```json
{
  "data": {
    "result": "<RedemptionPeriodResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/point-redemption-periods/{period}/publish

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\RedemptionPeriodController@publish`

**Payload**

```jsonc
{
  "path": {
    "period": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reauthentication_token": "<reauthentication_token>",
    "reason": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve periodo publicado. Condición: Reauth, estado.

**Response 200**

```json
{
  "data": {
    "result": "<periodo publicado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/point-redemption-periods/current

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\RedemptionPeriodController@current`

**Payload**

```jsonc
{}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve RedemptionPeriodResource o respuesta vacía. Condición: America/Monterrey.

**Response 200**

```json
{
  "data": {
    "result": "<RedemptionPeriodResource o respuesta vacía>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/point-redemptions

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointRedemptionController@index`

**Payload**

```jsonc
{
  "query": {
    "per_page": 1,
    "type": "EARNED", // Variantes: "REDEEMED"
    "status": "PENDING", // Variantes: "AUTHORIZED", "REJECTED", "COMPLETED"
    "relation_id": "00000000-0000-4000-8000-000000000000",
    "date_from": "2026-07-29T12:00:00-06:00",
    "date_to": "2026-07-29T12:00:00-06:00"
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve PointRedemptionResource paginado. Condición: Vista administrativa.

**Response 200**

```json
{
  "data": [
    {
      "result": "<PointRedemptionResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/point-redemptions/{redemption}

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointRedemptionController@show`

**Payload**

```jsonc
{
  "path": {
    "redemption": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve PointRedemptionResource.

**Response 200**

```json
{
  "data": {
    "result": "<PointRedemptionResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/point-redemptions/{redemption}/authorize

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointRedemptionController@authorize`

**Payload**

```jsonc
{
  "path": {
    "redemption": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reauthentication_token": "<reauthentication_token>",
    "reason": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve PointRedemptionResource. Condición: Reauth, separación, reserva.

**Response 200**

```json
{
  "data": {
    "result": "<PointRedemptionResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/point-redemptions/{redemption}/reject

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointRedemptionController@reject`

**Payload**

```jsonc
{
  "path": {
    "redemption": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reauthentication_token": "<reauthentication_token>",
    "reason": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve PointRedemptionResource. Condición: Reauth, estado.

**Response 200**

```json
{
  "data": {
    "result": "<PointRedemptionResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/points-runs

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointsRunController@index`

**Payload**

```jsonc
{
  "query": {
    "per_page": 1,
    "page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve ejecuciones paginadas. Condición: Rol autorizado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<ejecuciones paginadas>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/points-runs/{run}

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointsRunController@show`

**Payload**

```jsonc
{
  "path": {
    "run": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve PointsRunResource. Condición: Rol autorizado.

**Response 200**

```json
{
  "data": {
    "result": "<PointsRunResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/points-runs/{run}/items

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointsRunController@items`

**Payload**

```jsonc
{
  "path": {
    "run": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "per_page": 1,
    "page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve elementos paginados. Condición: Rol autorizado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<elementos paginados>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/relations/{relation}/points

**Controlador:** `App\Modules\Points\Presentation\Http\Controllers\PointAccountController@relation`

**Payload**

```jsonc
{
  "path": {
    "relation": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve evaluación/movimientos de relación.

**Response 200**

```json
{
  "data": {
    "result": "<evaluación/movimientos de relación>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/delinquency/distributors/{distributor}/removal-requests

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RemovalRequestController@prepare`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reason": null
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201, solicitud preparada. Condición: Regularización/saldo/alcance.

**Response 201**

```json
{
  "data": {
    "result": "<201, solicitud preparada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/delinquency/removal-requests

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RemovalRequestController@index`

**Payload**

```jsonc
{
  "query": {
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "coordinator_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "delinquency_status": "<delinquency_status>",
    "financially_regularized": true,
    "consecutive_breaches": 1,
    "type": "<type>",
    "status": {},
    "detected_from": "2026-07-29T12:00:00-06:00",
    "detected_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve RemovalRequestResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<RemovalRequestResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/delinquency/removal-requests/{removalRequest}

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RemovalRequestController@show`

**Payload**

```jsonc
{
  "path": {
    "removalRequest": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "coordinator_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "delinquency_status": "<delinquency_status>",
    "financially_regularized": true,
    "consecutive_breaches": 1,
    "type": "<type>",
    "status": {},
    "detected_from": "2026-07-29T12:00:00-06:00",
    "detected_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve RemovalRequestResource.

**Response 200**

```json
{
  "data": {
    "result": "<RemovalRequestResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/delinquency/removal-requests/{removalRequest}/approve

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RemovalRequestController@approve`

**Payload**

```jsonc
{
  "path": {
    "removalRequest": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reauthentication_token": "<reauthentication_token>",
    "reason": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve decisión aplicada. Condición: Reauth/separación/estado.

**Response 200**

```json
{
  "data": {
    "result": "<decisión aplicada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/delinquency/removal-requests/{removalRequest}/reject

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RemovalRequestController@reject`

**Payload**

```jsonc
{
  "path": {
    "removalRequest": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reauthentication_token": "<reauthentication_token>",
    "reason": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve solicitud rechazada. Condición: Reauth/estado.

**Response 200**

```json
{
  "data": {
    "result": "<solicitud rechazada>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/risk/alerts/{alert}

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RiskAlertController@show`

**Payload**

```jsonc
{
  "path": {
    "alert": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "coordinator_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "delinquency_status": "<delinquency_status>",
    "financially_regularized": true,
    "consecutive_breaches": 1,
    "type": "<type>",
    "status": {},
    "detected_from": "2026-07-29T12:00:00-06:00",
    "detected_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve RiskAlertResource.

**Response 200**

```json
{
  "data": {
    "result": "<RiskAlertResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/risk/alerts/{alert}/apply-delinquency

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RiskAlertController@apply`

**Payload**

```jsonc
{
  "path": {
    "alert": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "reauthentication_token": "<reauthentication_token>",
    "reason": null
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve alerta/estado actualizado. Condición: Tres incumplimientos/reauth.

**Response 200**

```json
{
  "data": {
    "result": "<alerta/estado actualizado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/risk/alerts/{alert}/review

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RiskAlertController@review`

**Payload**

```jsonc
{
  "path": {
    "alert": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "coordinator_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "delinquency_status": "<delinquency_status>",
    "financially_regularized": true,
    "consecutive_breaches": 1,
    "type": "<type>",
    "status": {},
    "detected_from": "2026-07-29T12:00:00-06:00",
    "detected_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve información de revisión.

**Response 200**

```json
{
  "data": {
    "result": "<información de revisión>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/risk/distributors

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RiskProfileController@index`

**Payload**

```jsonc
{
  "query": {
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "coordinator_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "delinquency_status": "<delinquency_status>",
    "financially_regularized": true,
    "consecutive_breaches": 1,
    "type": "<type>",
    "status": {},
    "detected_from": "2026-07-29T12:00:00-06:00",
    "detected_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve RiskProfileResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<RiskProfileResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/risk/distributors/{distributor}

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RiskProfileController@show`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "coordinator_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "delinquency_status": "<delinquency_status>",
    "financially_regularized": true,
    "consecutive_breaches": 1,
    "type": "<type>",
    "status": {},
    "detected_from": "2026-07-29T12:00:00-06:00",
    "detected_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve RiskProfileResource.

**Response 200**

```json
{
  "data": {
    "result": "<RiskProfileResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/risk/distributors/{distributor}/alerts

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RiskProfileController@alerts`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "coordinator_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "delinquency_status": "<delinquency_status>",
    "financially_regularized": true,
    "consecutive_breaches": 1,
    "type": "<type>",
    "status": {},
    "detected_from": "2026-07-29T12:00:00-06:00",
    "detected_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve RiskAlertResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<RiskAlertResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/risk/distributors/{distributor}/evaluations

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RiskProfileController@evaluations`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "coordinator_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "delinquency_status": "<delinquency_status>",
    "financially_regularized": true,
    "consecutive_breaches": 1,
    "type": "<type>",
    "status": {},
    "detected_from": "2026-07-29T12:00:00-06:00",
    "detected_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve RelationRiskEvaluationResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<RelationRiskEvaluationResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/risk/distributors/{distributor}/sequence

**Controlador:** `App\Modules\RiskDelinquency\Presentation\Http\Controllers\RiskProfileController@sequence`

**Payload**

```jsonc
{
  "path": {
    "distributor": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "coordinator_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "delinquency_status": "<delinquency_status>",
    "financially_regularized": true,
    "consecutive_breaches": 1,
    "type": "<type>",
    "status": {},
    "detected_from": "2026-07-29T12:00:00-06:00",
    "detected_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve RiskSequenceResource o respuesta de fuente pendiente.

**Response 200**

```json
{
  "data": {
    "result": "<RiskSequenceResource o respuesta de fuente pendiente>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/client-reassignments

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\AdministrativeReassignmentController@index`

**Payload**

```jsonc
{
  "query": {
    "folio": "<folio>",
    "status": "<status>",
    "client_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_distributor_id": "00000000-0000-4000-8000-000000000000",
    "recipient_distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_branch_id": 1,
    "destination_branch_id": 1,
    "branch_id": 1,
    "origin_coordinator_id": 1,
    "destination_coordinator_id": 1,
    "outgoing_coordinator_id": 1,
    "date_from": "2026-07-29T12:00:00-06:00",
    "date_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve MobilityProcessResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<MobilityProcessResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/client-reassignments

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\AdministrativeReassignmentController@store`

**Payload**

```jsonc
{
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "reason": "<reason>",
    "items": {}
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201 o replay. Condición: Idempotencia/alcance/versiones.

**Response 200**

```json
{
  "data": {
    "result": "<201 o replay>"
  }
}
```

**Response 201**

```json
{
  "data": {
    "result": "<201 o replay>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/client-reassignments/{reassignment}

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\AdministrativeReassignmentController@show`

**Payload**

```jsonc
{
  "path": {
    "reassignment": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "folio": "<folio>",
    "status": "<status>",
    "client_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_distributor_id": "00000000-0000-4000-8000-000000000000",
    "recipient_distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_branch_id": 1,
    "destination_branch_id": 1,
    "branch_id": 1,
    "origin_coordinator_id": 1,
    "destination_coordinator_id": 1,
    "outgoing_coordinator_id": 1,
    "date_from": "2026-07-29T12:00:00-06:00",
    "date_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve MobilityProcessResource.

**Response 200**

```json
{
  "data": {
    "result": "<MobilityProcessResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/client-reassignments/{reassignment}/complete

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\AdministrativeReassignmentController@complete`

**Payload**

```jsonc
{
  "path": {
    "reassignment": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "expected_version": 1,
    "reason": null,
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve proceso completado. Condición: Lote íntegro/versión.

**Response 200**

```json
{
  "data": {
    "result": "<proceso completado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/client-reassignments/{reassignment}/validate

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\AdministrativeReassignmentController@validateBatch`

**Payload**

```jsonc
{
  "path": {
    "reassignment": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "expected_version": 1,
    "reason": null,
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve proceso validado. Condición: Estado/versión.

**Response 200**

```json
{
  "data": {
    "result": "<proceso validado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/client-transfers

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\ClientTransferController@index`

**Payload**

```jsonc
{
  "query": {
    "folio": "<folio>",
    "status": "<status>",
    "client_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_distributor_id": "00000000-0000-4000-8000-000000000000",
    "recipient_distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_branch_id": 1,
    "destination_branch_id": 1,
    "branch_id": 1,
    "origin_coordinator_id": 1,
    "destination_coordinator_id": 1,
    "outgoing_coordinator_id": 1,
    "date_from": "2026-07-29T12:00:00-06:00",
    "date_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve MobilityProcessResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<MobilityProcessResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/client-transfers

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\ClientTransferController@store`

**Payload**

```jsonc
{
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "client_id": "00000000-0000-4000-8000-000000000000",
    "recipient_distributor_id": "00000000-0000-4000-8000-000000000000",
    "client_version": 1,
    "portfolio_version": 1,
    "reason": null
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201 o replay. Condición: Versiones cliente/cartera.

**Response 200**

```json
{
  "data": {
    "result": "<201 o replay>"
  }
}
```

**Response 201**

```json
{
  "data": {
    "result": "<201 o replay>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/client-transfers/{transfer}

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\ClientTransferController@show`

**Payload**

```jsonc
{
  "path": {
    "transfer": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "folio": "<folio>",
    "status": "<status>",
    "client_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_distributor_id": "00000000-0000-4000-8000-000000000000",
    "recipient_distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_branch_id": 1,
    "destination_branch_id": 1,
    "branch_id": 1,
    "origin_coordinator_id": 1,
    "destination_coordinator_id": 1,
    "outgoing_coordinator_id": 1,
    "date_from": "2026-07-29T12:00:00-06:00",
    "date_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve MobilityProcessResource.

**Response 200**

```json
{
  "data": {
    "result": "<MobilityProcessResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/client-transfers/{transfer}/cancel

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\ClientTransferController@cancel`

**Payload**

```jsonc
{
  "path": {
    "transfer": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "expected_version": 1,
    "reason": null,
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve NO IMPLEMENTADO; lanza excepción. Condición: Regla de cancelación no especificada.

**Response 200**

```json
{
  "data": {
    "result": "<**NO IMPLEMENTADO**; lanza excepción>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/client-transfers/{transfer}/final-acceptance

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\ClientTransferController@finalAcceptance`

**Payload**

```jsonc
{
  "path": {
    "transfer": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "expected_version": 1,
    "reason": null,
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve proceso finalizado. Condición: Estado/versión.

**Response 200**

```json
{
  "data": {
    "result": "<proceso finalizado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/client-transfers/{transfer}/origin-decision

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\ClientTransferController@originDecision`

**Payload**

```jsonc
{
  "path": {
    "transfer": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "expected_version": 1,
    "reason": null,
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve autorizado/rechazado. Condición: Decisión de origen.

**Response 200**

```json
{
  "data": {
    "result": "<autorizado/rechazado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/client-transfers/{transfer}/preaccept

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\ClientTransferController@preaccept`

**Payload**

```jsonc
{
  "path": {
    "transfer": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "expected_version": 1,
    "reason": null,
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve preaceptado. Condición: Receptor/estado.

**Response 200**

```json
{
  "data": {
    "result": "<preaceptado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/client-transfers/{transfer}/preaccept-rejection

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\ClientTransferController@rejectPreacceptance`

**Payload**

```jsonc
{
  "path": {
    "transfer": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "expected_version": 1,
    "reason": null,
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve rechazado. Condición: Receptor/estado.

**Response 200**

```json
{
  "data": {
    "result": "<rechazado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/client-transfers/recipients

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\ClientTransferController@recipients`

**Payload**

```jsonc
{}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve NO IMPLEMENTADO; MOBILITY_DEPENDENCY_UNAVAILABLE. Condición: M15_TRANSFER_RECIPIENT_SCOPE_DEFINITION.

**Response 200**

```json
{
  "data": {
    "result": "<**NO IMPLEMENTADO**; MOBILITY_DEPENDENCY_UNAVAILABLE>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/coordinator-reassignments

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\CoordinatorReassignmentController@index`

**Payload**

```jsonc
{
  "query": {
    "folio": "<folio>",
    "status": "<status>",
    "client_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_distributor_id": "00000000-0000-4000-8000-000000000000",
    "recipient_distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_branch_id": 1,
    "destination_branch_id": 1,
    "branch_id": 1,
    "origin_coordinator_id": 1,
    "destination_coordinator_id": 1,
    "outgoing_coordinator_id": 1,
    "date_from": "2026-07-29T12:00:00-06:00",
    "date_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve MobilityProcessResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<MobilityProcessResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/coordinator-reassignments

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\CoordinatorReassignmentController@store`

**Payload**

```jsonc
{
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "outgoing_coordinator_id": "00000000-0000-4000-8000-000000000000",
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "reason": "<reason>",
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201 o replay. Condición: Reauth/idempotencia.

**Response 200**

```json
{
  "data": {
    "result": "<201 o replay>"
  }
}
```

**Response 201**

```json
{
  "data": {
    "result": "<201 o replay>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/coordinator-reassignments/{batch}

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\CoordinatorReassignmentController@show`

**Payload**

```jsonc
{
  "path": {
    "batch": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "folio": "<folio>",
    "status": "<status>",
    "client_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_distributor_id": "00000000-0000-4000-8000-000000000000",
    "recipient_distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_branch_id": 1,
    "destination_branch_id": 1,
    "branch_id": 1,
    "origin_coordinator_id": 1,
    "destination_coordinator_id": 1,
    "outgoing_coordinator_id": 1,
    "date_from": "2026-07-29T12:00:00-06:00",
    "date_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve MobilityProcessResource.

**Response 200**

```json
{
  "data": {
    "result": "<MobilityProcessResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/coordinator-reassignments/{batch}/assignments

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\CoordinatorReassignmentController@assignments`

**Payload**

```jsonc
{
  "path": {
    "batch": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "expected_version": 1,
    "items": {}
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve lote actualizado. Condición: Cobertura/versiones.

**Response 200**

```json
{
  "data": {
    "result": "<lote actualizado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/coordinator-reassignments/{batch}/complete

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\CoordinatorReassignmentController@complete`

**Payload**

```jsonc
{
  "path": {
    "batch": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "expected_version": 1,
    "reason": null,
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve lote completado. Condición: Integridad/versión.

**Response 200**

```json
{
  "data": {
    "result": "<lote completado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/coordinator-reassignments/{batch}/validate

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\CoordinatorReassignmentController@validateBatch`

**Payload**

```jsonc
{
  "path": {
    "batch": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "expected_version": 1,
    "reason": null,
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve lote validado. Condición: Cobertura/versión.

**Response 200**

```json
{
  "data": {
    "result": "<lote validado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributor-branch-changes

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\DistributorBranchChangeController@index`

**Payload**

```jsonc
{
  "query": {
    "folio": "<folio>",
    "status": "<status>",
    "client_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_distributor_id": "00000000-0000-4000-8000-000000000000",
    "recipient_distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_branch_id": 1,
    "destination_branch_id": 1,
    "branch_id": 1,
    "origin_coordinator_id": 1,
    "destination_coordinator_id": 1,
    "outgoing_coordinator_id": 1,
    "date_from": "2026-07-29T12:00:00-06:00",
    "date_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve MobilityProcessResource paginado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<MobilityProcessResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-branch-changes

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\DistributorBranchChangeController@store`

**Payload**

```jsonc
{
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "destination_branch_id": "00000000-0000-4000-8000-000000000000",
    "reason": "<reason>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 201 o replay. Condición: Idempotencia/alcance.

**Response 200**

```json
{
  "data": {
    "result": "<201 o replay>"
  }
}
```

**Response 201**

```json
{
  "data": {
    "result": "<201 o replay>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/distributor-branch-changes/{change}

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\DistributorBranchChangeController@show`

**Payload**

```jsonc
{
  "path": {
    "change": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "folio": "<folio>",
    "status": "<status>",
    "client_id": "00000000-0000-4000-8000-000000000000",
    "distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_distributor_id": "00000000-0000-4000-8000-000000000000",
    "recipient_distributor_id": "00000000-0000-4000-8000-000000000000",
    "origin_branch_id": 1,
    "destination_branch_id": 1,
    "branch_id": 1,
    "origin_coordinator_id": 1,
    "destination_coordinator_id": 1,
    "outgoing_coordinator_id": 1,
    "date_from": "2026-07-29T12:00:00-06:00",
    "date_to": "2026-07-29T12:00:00-06:00",
    "per_page": 1
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve MobilityProcessResource.

**Response 200**

```json
{
  "data": {
    "result": "<MobilityProcessResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-branch-changes/{change}/authorize

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\DistributorBranchChangeController@authorizeChange`

**Payload**

```jsonc
{
  "path": {
    "change": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "expected_version": 1,
    "reason": null,
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve cambio autorizado. Condición: Reauth/estado/versión.

**Response 200**

```json
{
  "data": {
    "result": "<cambio autorizado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-branch-changes/{change}/cancel

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\DistributorBranchChangeController@cancel`

**Payload**

```jsonc
{
  "path": {
    "change": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "expected_version": 1,
    "reason": null,
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve NO IMPLEMENTADO; lanza excepción. Condición: Regla de cancelación no especificada.

**Response 200**

```json
{
  "data": {
    "result": "<**NO IMPLEMENTADO**; lanza excepción>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-branch-changes/{change}/client-destinations

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\DistributorBranchChangeController@clientDestinations`

**Payload**

```jsonc
{
  "path": {
    "change": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "expected_version": 1,
    "items": {}
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve destinos registrados. Condición: Todos los clientes/versiones.

**Response 200**

```json
{
  "data": {
    "result": "<destinos registrados>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-branch-changes/{change}/complete

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\DistributorBranchChangeController@complete`

**Payload**

```jsonc
{
  "path": {
    "change": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "decision": "AUTHORIZE", // Variantes: "REJECT"
    "expected_version": 1,
    "reason": null,
    "reauthentication_token": "<reauthentication_token>"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve cambio completado. Condición: Integridad/versión.

**Response 200**

```json
{
  "data": {
    "result": "<cambio completado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/distributor-branch-changes/{change}/destination-coordinator

**Controlador:** `App\Modules\Mobility\Presentation\Http\Controllers\DistributorBranchChangeController@destinationCoordinator`

**Payload**

```jsonc
{
  "path": {
    "change": "00000000-0000-4000-8000-000000000000"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "destination_coordinator_id": "00000000-0000-4000-8000-000000000000",
    "expected_version": 1
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve coordinador asignado. Condición: Alcance/versión.

**Response 200**

```json
{
  "data": {
    "result": "<coordinador asignado>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/report-runs

**Controlador:** `App\Modules\Reporting\Presentation\Http\Controllers\ReportController@runs`

**Payload**

```jsonc
{
  "query": {
    "page": 1,
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve ReportRunResource paginado. Condición: Alcance/propietario.

**Response 200**

```json
{
  "data": [
    {
      "result": "<ReportRunResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/report-runs/{run}

**Controlador:** `App\Modules\Reporting\Presentation\Http\Controllers\ReportController@run`

**Payload**

```jsonc
{
  "path": {
    "run": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve ReportRunResource.

**Response 200**

```json
{
  "data": {
    "result": "<ReportRunResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/report-runs/{run}/results

**Controlador:** `App\Modules\Reporting\Presentation\Http\Controllers\ReportController@results`

**Payload**

```jsonc
{
  "path": {
    "run": "00000000-0000-4000-8000-000000000000"
  },
  "query": {
    "page": 1,
    "per_page": 1
  }
}
```

**Flujo**

Valida acceso y disponibilidad → obtiene el contenido/resultado → lo devuelve. Condición: Estado/expiración.

**Response 200**

```json
{
  "data": [
    {
      "result": "<data paginada si completado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/reports

**Controlador:** `App\Modules\Reporting\Presentation\Http\Controllers\ReportController@index`

**Payload**

```jsonc
{}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve colección de definiciones permitidas. Condición: Rol.

**Response 200**

```json
{
  "data": [
    {
      "result": "<colección de definiciones permitidas>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/reports/{code}

**Controlador:** `App\Modules\Reporting\Presentation\Http\Controllers\ReportController@execute`

**Payload**

```jsonc
{
  "path": {
    "code": "<code>"
  },
  "query": {
    "page": 1,
    "per_page": 1,
    "sort": "<sort>",
    "direction": "asc", // Variantes: "desc"
    "<filter_name>": "<value>"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve ejecución síncrona. Condición: Código, filtros, alcance.

**Response 200**

```json
{
  "data": {
    "result": "<ejecución síncrona>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/reports/{code}/definition

**Controlador:** `App\Modules\Reporting\Presentation\Http\Controllers\ReportController@definition`

**Payload**

```jsonc
{
  "path": {
    "code": "<code>"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve ReportDefinitionResource. Condición: Rol.

**Response 200**

```json
{
  "data": {
    "result": "<ReportDefinitionResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/reports/{code}/runs

**Controlador:** `App\Modules\Reporting\Presentation\Http\Controllers\ReportController@createRun`

**Payload**

```jsonc
{
  "path": {
    "code": "<code>"
  },
  "headers": {
    "Idempotency-Key": "<idempotency-key>"
  },
  "body": {
    "<filter_name>": "<value>"
  }
}
```

**Flujo**

Valida payload y autorización → crea/procesa la operación → devuelve 202/run o replay. Condición: Idempotencia, rol, filtros.

**Response 200**

```json
{
  "data": {
    "result": "<202/run o replay>"
  }
}
```

**Response 202**

```json
{
  "data": {
    "result": "<202/run o replay>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/notifications

**Controlador:** `App\Modules\Notification\Presentation\Http\Controllers\NotificationController@index`

**Payload**

```jsonc
{
  "query": {
    "status": "UNREAD" // Variantes: "READ"
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve NotificationResource paginado. Condición: Solo destinatario autenticado.

**Response 200**

```json
{
  "data": [
    {
      "result": "<NotificationResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/notifications/{notification}/read

**Controlador:** `App\Modules\Notification\Presentation\Http\Controllers\NotificationController@read`

**Payload**

```jsonc
{
  "path": {
    "notification": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida estado, versión y autorización → ejecuta la transición → devuelve NotificationResource con read_at. Condición: Propietario.

**Response 200**

```json
{
  "data": {
    "result": "<NotificationResource con read_at>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 409**

```json
{
  "error": {
    "code": "RESOURCE_VERSION_CONFLICT",
    "message": "El recurso cambió desde la última consulta.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/audit/events

**Controlador:** `App\Modules\Audit\Presentation\Http\Controllers\AuditController@index`

**Payload**

```jsonc
{
  "query": {
    "event_code": "<event_code>",
    "category": "<category>",
    "result": "<result>",
    "branch_id": "00000000-0000-4000-8000-000000000000",
    "requester_user_id": "00000000-0000-4000-8000-000000000000",
    "authorizer_user_id": "00000000-0000-4000-8000-000000000000",
    "executor_user_id": "00000000-0000-4000-8000-000000000000",
    "subject_type": "<subject_type>",
    "subject_id": "00000000-0000-4000-8000-000000000000",
    "subject_public_number": "<subject_public_number>",
    "process_code": "<process_code>",
    "request_id": "00000000-0000-4000-8000-000000000000",
    "trace_id": "00000000-0000-4000-8000-000000000000",
    "correlation_id": "00000000-0000-4000-8000-000000000000",
    "date_from": "2026-07-29",
    "date_to": "2026-07-29",
    "per_page": 1
  }
}
```

**Flujo**

Valida filtros y alcance → consulta/pagina → devuelve AuditEventSummaryResource paginado. Condición: Policy y alcance.

**Response 200**

```json
{
  "data": [
    {
      "result": "<AuditEventSummaryResource paginado>"
    }
  ],
  "links": {
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/audit/events/{auditEvent}

**Controlador:** `App\Modules\Audit\Presentation\Http\Controllers\AuditController@show`

**Payload**

```jsonc
{
  "path": {
    "auditEvent": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida identificador y acceso → consulta → devuelve AuditEventResource. Condición: Policy, alcance y acceso sensible.

**Response 200**

```json
{
  "data": {
    "result": "<AuditEventResource>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## GET /api/v1/files/{file}/content

**Controlador:** `App\Modules\Media\Presentation\Http\Controllers\MediaController@download`

**Payload**

```jsonc
{
  "path": {
    "file": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Flujo**

Valida acceso y disponibilidad → obtiene el contenido/resultado → lo devuelve. Condición: Policy; solo AVAILABLE; audita descarga.

**Response 200**

```json
{
  "content": "<binary>",
  "content_type": "application/octet-stream"
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

## POST /api/v1/files/upload-intents/{intent}/content

**Controlador:** `App\Modules\Media\Presentation\Http\Controllers\MediaController@uploadContent`

**Payload**

```jsonc
{
  "path": {
    "intent": "00000000-0000-4000-8000-000000000000"
  },
  "body": {
    "file": "<binary>"
  }
}
```

**Flujo**

Valida acceso y disponibilidad → obtiene el contenido/resultado → lo devuelve. Condición: Intención pendiente, vigente y de un uso.

**Response 202**

```json
{
  "data": {
    "result": "<202, ID/número/estado temporal>"
  }
}
```

**Response 401**

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "La operación requiere una sesión activa.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 403**

```json
{
  "error": {
    "code": "AUTH_SCOPE_DENIED",
    "message": "La cuenta no tiene autoridad para ejecutar la acción.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 404**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 422**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "La petición contiene campos inválidos.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

**Response 500**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno al procesar la solicitud.",
    "fields": {},
    "details": {},
    "request_id": "00000000-0000-4000-8000-000000000000"
  }
}
```

# Base de datos

## Branch

- Clase: `App\Models\Branch`
- Tabla: `branches`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `name` | `string(255)` | no | — | — | — |
| `is_headquarters` | `boolean` | no | `false` | — | — |
| `is_active` | `boolean` | no | `true` | — | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |
| `city` | `string(255)` | no | `Sin definir` | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## CoordinatorDistributorAssignment

- Clase: `App\Models\CoordinatorDistributorAssignment`
- Tabla: `coordinator_distributor_assignments`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `distributor_id` | `bigInteger unsigned` | no | — | — | FK → users.id |
| `coordinator_user_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id |
| `starts_at` | `timestamp` | no | — | `immutable_datetime` | — |
| `ends_at` | `timestamp` | sí | — | `immutable_datetime` | INDEX; INDEX |
| `assigned_by` | `bigInteger unsigned` | no | — | — | FK → users.id |
| `source_type` | `string(255)` | no | — | — | — |
| `source_id` | `bigInteger unsigned` | sí | — | — | — |
| `reason` | `string(255)` | sí | — | — | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `branch()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\Branch` | `branch_id → id` |
| `distributor()` | `BelongsTo` | `App\Models\User` | `distributor_id → id` |
| `coordinator()` | `BelongsTo` | `App\Models\User` | `coordinator_user_id → id` |

## User

- Clase: `App\Models\User`
- Tabla: `users`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `name` | `string(255)` | no | — | — | — |
| `email` | `string(255)` | no | — | — | UNIQUE |
| `email_verified_at` | `timestamp` | sí | — | `datetime` | — |
| `password` | `string(255)` | sí | — | `hashed` | — |
| `remember_token` | `string(100)` | sí | — | — | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |
| `role_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → roles.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | sí | — | — | FK → branches.id; delete restrict |
| `context_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `normalized_email` | `string(255)` | no | — | — | UNIQUE |
| `state` | `string(30)` | no | `PENDING_ACTIVATION` | `App\Modules\Access\Domain\Accounts\AccountState` | INDEX |
| `password_changed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `mfa_enrolled_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `last_login_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `security_suspended_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `disabled_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `credential_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `invited_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `activated_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `coordinator_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `assignment_version` | `integer unsigned` | no | `1` | `integer` | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `role()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\Role` | `role_id → id` |
| `branch()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\Branch` | `branch_id → id` |
| `coordinator()` | `BelongsTo` | `App\Models\User` | `coordinator_id → id` |

## UserRoleScope

- Clase: `App\Models\UserRoleScope`
- Tabla: `user_role_scopes`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `user_id` | `bigInteger unsigned` | no | — | — | FK → users.id |
| `role_id` | `bigInteger unsigned` | no | — | — | FK → roles.id |
| `branch_id` | `bigInteger unsigned` | sí | — | — | FK → branches.id |
| `scope_type` | `string(255)` | no | — | — | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `user()` | `BelongsTo` | `App\Models\User` | `user_id → id` |
| `role()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\Role` | `role_id → id` |
| `branch()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\Branch` | `branch_id → id` |

## AccountInvitation

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\AccountInvitation`
- Tabla: `account_invitations`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `user_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `purpose` | `string(30)` | no | — | `App\Modules\Access\Domain\Accounts\InvitationPurpose` | — |
| `token_hash` | `string(64)` | no | — | — | UNIQUE |
| `state` | `string(20)` | no | `ACTIVE` | `App\Modules\Access\Domain\Authentication\TokenState` | INDEX |
| `issued_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `expires_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `used_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `revoked_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |
| `email_hash` | `string(64)` | no | — | — | — |
| `credential_version` | `bigInteger unsigned` | no | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## AccountRequest

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\AccountRequest`
- Tabla: `account_requests`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `type` | `string(30)` | no | — | `App\Modules\Access\Domain\Accounts\AccountRequestType` | — |
| `target_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `target_email` | `string(255)` | sí | — | — | — |
| `requested_role_id` | `bigInteger unsigned` | sí | — | — | FK → roles.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | sí | — | — | INDEX; FK → branches.id; delete restrict |
| `requested_by` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `reason` | `text` | no | — | — | — |
| `state` | `string(30)` | no | `PENDING_APPROVAL` | `App\Modules\Access\Domain\Accounts\AccountRequestState` | INDEX; INDEX |
| `decision` | `string(20)` | sí | — | — | — |
| `decided_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `decided_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `decision_reason` | `text` | sí | — | — | — |
| `idempotency_key` | `string(100)` | no | — | — | UNIQUE |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |
| `target_name` | `string(255)` | sí | — | — | — |
| `result_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |

### Relaciones

- Ninguna relación Eloquent declarada.

## AuthAttempt

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\AuthAttempt`
- Tabla: `auth_attempts`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `identifier_hash` | `string(64)` | no | — | — | INDEX |
| `factor` | `string(30)` | no | — | — | INDEX |
| `ip_address` | `string(45)` | sí | — | — | INDEX |
| `device_id` | `string(255)` | sí | — | — | — |
| `application` | `string(40)` | no | — | — | — |
| `window_started_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |
| `result` | `string(30)` | no | — | — | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |

### Relaciones

- Ninguna relación Eloquent declarada.

## AuthSession

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\AuthSession`
- Tabla: `auth_sessions`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `user_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `application` | `string(40)` | no | — | — | — |
| `device_id` | `string(255)` | sí | — | — | — |
| `device_name` | `string(255)` | sí | — | — | — |
| `ip_address` | `string(45)` | sí | — | — | — |
| `user_agent` | `text` | sí | — | — | — |
| `last_activity_at` | `timestampTz` | no | — | `datetime` | INDEX; INDEX |
| `expires_at` | `timestampTz` | no | — | `datetime` | INDEX |
| `state` | `string(20)` | no | `ACTIVE` | — | INDEX |
| `version` | `bigInteger unsigned` | no | `1` | — | — |
| `context_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `revoked_at` | `timestampTz` | sí | — | `datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `user()` | `BelongsTo` | `App\Models\User` | `user_id → id` |
| `refreshTokens()` | `HasMany` | `App\Modules\Access\Infrastructure\Persistence\Models\RefreshToken` | `id ← auth_session_id` |
| `accessTokens()` | `HasMany` | `Laravel\Sanctum\PersonalAccessToken` | `id ← auth_session_id` |

## Branch

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\Branch`
- Tabla: `branches`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `name` | `string(255)` | no | — | — | — |
| `is_headquarters` | `boolean` | no | `false` | `boolean` | — |
| `is_active` | `boolean` | no | `true` | `boolean` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |
| `city` | `string(255)` | no | `Sin definir` | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `users()` | `HasMany` | `App\Models\User` | `id ← branch_id` |

## DistributorAccessLink

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\DistributorAccessLink`
- Tabla: `distributor_access_links`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `user_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → users.id; delete restrict |
| `external_request_id` | `string(100)` | no | — | — | UNIQUE |
| `external_distributor_id` | `string(100)` | no | — | — | UNIQUE |
| `branch_id` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `coordinator_user_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `authorized_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `initial_credit_line` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `authorized_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `user()` | `BelongsTo` | `App\Models\User` | `user_id → id` |

## InvitationExchange

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\InvitationExchange`
- Tabla: `invitation_exchanges`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `account_invitation_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → account_invitations.id; delete restrict |
| `token_hash` | `string(64)` | no | — | — | UNIQUE |
| `issued_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `expires_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |
| `prepared_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `used_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `revoked_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## MfaCredential

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\MfaCredential`
- Tabla: `mfa_credentials`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `user_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → users.id; delete restrict |
| `type` | `string(20)` | no | — | `App\Modules\Access\Domain\MFA\MfaType` | UNIQUE |
| `credential_identifier` | `string(255)` | no | — | — | UNIQUE |
| `public_key` | `text` | sí | — | — | — |
| `encrypted_secret` | `text` | sí | — | — | — |
| `signature_counter` | `bigInteger unsigned` | no | `0` | — | — |
| `metadata` | `jsonb` | sí | — | `array` | — |
| `state` | `string(20)` | no | `ACTIVE` | — | — |
| `registered_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `last_used_at` | `timestampTz` | sí | — | — | — |
| `revoked_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## MfaRecoveryCode

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\MfaRecoveryCode`
- Tabla: `mfa_recovery_codes`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `user_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `code_hash` | `string(64)` | no | — | — | UNIQUE |
| `issued_at` | `timestampTz` | sí | — | — | — |
| `generated_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `used_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `revoked_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## NotificationDelivery

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\NotificationDelivery`
- Tabla: `notification_deliveries`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `outbox_event_id` | `bigInteger unsigned` | no | — | — | FK → outbox_events.id; delete cascade |
| `recipient` | `string(255)` | no | — | — | — |
| `template` | `string(128)` | no | — | — | — |
| `idempotency_key` | `string(255)` | no | — | — | UNIQUE |
| `state` | `string(32)` | no | `PENDING` | — | INDEX |
| `attempts` | `integer unsigned` | no | `0` | — | — |
| `last_attempt_at` | `timestamp` | sí | — | `immutable_datetime` | — |
| `sent_at` | `timestamp` | sí | — | `immutable_datetime` | — |
| `provider_reference` | `string(255)` | sí | — | — | — |
| `result` | `string(64)` | sí | — | — | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## OperationalAuthorizationToken

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\OperationalAuthorizationToken`
- Tabla: `operational_authorization_tokens`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `requester_user_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `authorizer_user_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `executor_user_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `authorizer_session_id` | `bigInteger unsigned` | no | — | — | FK → auth_sessions.id; delete restrict |
| `action` | `string(128)` | no | — | — | INDEX |
| `resource_type` | `string(128)` | no | — | — | INDEX |
| `resource_id` | `string(128)` | no | — | — | INDEX |
| `branch_id` | `uuid` | sí | — | — | — |
| `parameters_hash` | `string(64)` | no | — | — | — |
| `reason` | `text` | no | — | — | — |
| `token_hash` | `string(64)` | no | — | — | UNIQUE |
| `context_version` | `integer unsigned` | no | — | — | — |
| `issued_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `expires_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `used_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `revoked_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `revoked_reason` | `string(128)` | sí | — | — | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## OutboxEvent

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\OutboxEvent`
- Tabla: `outbox_events`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `type` | `string(150)` | no | — | — | — |
| `payload` | `jsonb` | no | — | `array` | — |
| `idempotency_key` | `string(150)` | no | — | — | UNIQUE |
| `attempts` | `integer unsigned` | no | `0` | — | — |
| `state` | `string(20)` | no | `PENDING` | — | INDEX |
| `available_at` | `timestampTz` | no | — | — | INDEX; INDEX |
| `processed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `failed_at` | `timestampTz` | sí | — | — | — |
| `last_error` | `text` | sí | — | — | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |
| `event_uuid` | `uuid` | sí | — | — | UNIQUE |
| `recipient` | `string(255)` | sí | — | — | — |
| `template` | `string(128)` | sí | — | — | — |
| `occurred_at` | `timestamp` | sí | — | `immutable_datetime` | — |
| `next_attempt_at` | `timestamp` | sí | — | `immutable_datetime` | INDEX |
| `last_attempt_at` | `timestamp` | sí | — | `immutable_datetime` | — |
| `result` | `string(64)` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## PasswordHistory

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\PasswordHistory`
- Tabla: `password_histories`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `user_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `password_hash` | `string(255)` | no | — | — | — |
| `recorded_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |

### Relaciones

- Ninguna relación Eloquent declarada.

## Permission

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\Permission`
- Tabla: `permissions`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `code` | `string(80)` | no | — | `App\Modules\Access\Domain\Authorization\PermissionCode` | UNIQUE |
| `name` | `string(255)` | no | — | — | — |
| `is_active` | `boolean` | no | `true` | `boolean` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `roles()` | `BelongsToMany` | `App\Modules\Access\Infrastructure\Persistence\Models\Role` | `role_permissions: permission_id / role_id` |

## ProcessedDomainEvent

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\ProcessedDomainEvent`
- Tabla: `processed_domain_events`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `event_type` | `string(150)` | no | — | — | UNIQUE |
| `event_key` | `string(150)` | no | — | — | UNIQUE; UNIQUE |
| `processed_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ReauthAuthorization

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\ReauthAuthorization`
- Tabla: `reauth_authorizations`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `user_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `auth_session_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → auth_sessions.id; delete restrict |
| `action` | `string(100)` | no | — | — | — |
| `record_type` | `string(100)` | sí | — | — | — |
| `record_id` | `string(100)` | sí | — | — | — |
| `branch_id` | `uuid` | sí | — | — | — |
| `token_hash` | `string(64)` | no | — | — | UNIQUE |
| `issued_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `expires_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `used_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `revoked_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |
| `requester_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `method` | `string(32)` | no | — | — | — |
| `resource_type` | `string(128)` | sí | — | — | — |
| `parameters_hash` | `string(64)` | no | — | — | — |
| `context_version` | `integer unsigned` | no | — | `integer` | — |
| `reason` | `text` | sí | — | — | — |
| `revoked_reason` | `string(128)` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## RefreshToken

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\RefreshToken`
- Tabla: `refresh_tokens`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `refresh_token_family_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → refresh_token_families.id; delete restrict; FK → refresh_token_families.id; delete restrict |
| `auth_session_id` | `bigInteger unsigned` | no | — | — | FK → auth_sessions.id; delete restrict; FK → refresh_token_families.auth_session_id; delete restrict |
| `token_hash` | `string(64)` | no | — | — | UNIQUE |
| `state` | `string(20)` | no | `ACTIVE` | `App\Modules\Access\Domain\Authentication\TokenState` | INDEX |
| `issued_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `expires_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `used_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `replaced_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `revoked_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `replaced_by_id` | `bigInteger unsigned` | sí | — | — | FK → refresh_tokens.id; delete restrict |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `session()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\AuthSession` | `auth_session_id → id` |
| `family()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\RefreshTokenFamily` | `refresh_token_family_id → id` |

## RefreshTokenFamily

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\RefreshTokenFamily`
- Tabla: `refresh_token_families`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK; UNIQUE |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `auth_session_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → auth_sessions.id; delete restrict |
| `application` | `string(40)` | no | — | — | — |
| `state` | `string(20)` | no | `ACTIVE` | `App\Modules\Access\Domain\Sessions\SessionState` | — |
| `absolute_expires_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `revoked_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `refreshTokens()` | `HasMany` | `App\Modules\Access\Infrastructure\Persistence\Models\RefreshToken` | `id ← refresh_token_family_id` |

## Role

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\Role`
- Tabla: `roles`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `code` | `string(40)` | no | — | `App\Modules\Access\Domain\Authorization\RoleCode` | UNIQUE |
| `name` | `string(255)` | no | — | — | — |
| `scope` | `string(10)` | no | — | — | — |
| `is_active` | `boolean` | no | `true` | `boolean` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `permissions()` | `BelongsToMany` | `App\Modules\Access\Infrastructure\Persistence\Models\Permission` | `role_permissions: role_id / permission_id` |
| `users()` | `HasMany` | `App\Models\User` | `id ← role_id` |

## SecurityAlert

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\SecurityAlert`
- Tabla: `security_alerts`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `security_event_id` | `bigInteger unsigned` | no | — | — | FK → security_events.id; delete cascade |
| `affected_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | sí | — | — | INDEX; FK → branches.id; delete restrict |
| `severity` | `string(16)` | no | — | — | INDEX |
| `type` | `string(128)` | no | — | — | — |
| `state` | `string(32)` | no | `OPEN` | — | INDEX; INDEX |
| `summary` | `text` | no | — | — | — |
| `acknowledged_by_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `acknowledged_at` | `timestamp` | sí | — | `immutable_datetime` | — |
| `action_request_reason` | `text` | sí | — | — | — |
| `created_at` | `timestamp` | sí | — | — | INDEX |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## SecurityEvent

- Clase: `App\Modules\Access\Infrastructure\Persistence\Models\SecurityEvent`
- Tabla: `security_events`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `actor_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `target_user_id` | `bigInteger unsigned` | sí | — | — | INDEX; FK → users.id; delete restrict |
| `auth_session_id` | `bigInteger unsigned` | sí | — | — | FK → auth_sessions.id; delete restrict |
| `rule` | `string(128)` | no | — | — | INDEX |
| `rule_code` | `string(128)` | sí | — | — | — |
| `scope` | `string(30)` | no | `GLOBAL` | — | — |
| `result` | `string(30)` | no | — | — | — |
| `correlation_id` | `uuid` | no | — | — | INDEX |
| `metadata` | `jsonb` | sí | — | `array` | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX; INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |
| `event_uuid` | `uuid` | sí | — | — | UNIQUE |
| `event_type` | `string(128)` | sí | — | — | INDEX |
| `requester_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `authorizer_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `executor_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `role_code` | `string(64)` | sí | — | — | — |
| `branch_id` | `bigInteger unsigned` | sí | — | — | FK → branches.id; delete restrict |
| `application` | `string(64)` | sí | — | — | — |
| `display_timezone` | `string(64)` | no | `America/Monterrey` | — | — |
| `ip_address` | `string(45)` | sí | — | — | — |
| `device_id` | `string(128)` | sí | — | — | — |
| `resource_type` | `string(128)` | sí | — | — | — |
| `resource_id` | `string(128)` | sí | — | — | — |
| `before_state` | `json` | sí | — | `array` | — |
| `after_state` | `json` | sí | — | `array` | — |
| `risk_level` | `string(16)` | sí | — | — | — |
| `counter` | `integer unsigned` | sí | — | — | — |
| `reason` | `text` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## AuditEvent

- Clase: `App\Modules\Audit\Persistence\Models\AuditEvent`
- Tabla: `audit_events`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `event_code` | `string(255)` | no | — | — | INDEX |
| `event_version` | `integer` | no | `1` | — | — |
| `category` | `string(255)` | no | — | — | — |
| `occurred_at` | `timestampTz` | no | — | `datetime` | INDEX; INDEX |
| `business_datetime` | `timestamp` | sí | — | `datetime` | — |
| `requester_user_id` | `uuid` | sí | — | — | — |
| `authorizer_user_id` | `uuid` | sí | — | — | — |
| `executor_user_id` | `uuid` | sí | — | — | — |
| `process_code` | `string(255)` | sí | — | — | — |
| `role_snapshot` | `string(255)` | sí | — | — | — |
| `branch_id` | `uuid` | sí | — | — | INDEX |
| `session_id` | `string(255)` | sí | — | — | — |
| `device_id` | `string(255)` | sí | — | — | — |
| `ip_address` | `string(255)` | sí | — | — | — |
| `user_agent_summary` | `text` | sí | — | — | — |
| `subject_type` | `string(255)` | no | — | — | INDEX |
| `subject_id` | `uuid` | no | — | — | INDEX |
| `subject_public_number` | `string(255)` | sí | — | — | — |
| `action` | `string(255)` | no | — | — | — |
| `result` | `string(255)` | no | — | — | — |
| `changed_fields` | `jsonb` | sí | — | `json` | — |
| `before_data` | `jsonb` | sí | — | `json` | — |
| `after_data` | `jsonb` | sí | — | `json` | — |
| `reason_code` | `string(255)` | sí | — | — | — |
| `reason_text` | `text` | sí | — | — | — |
| `rule_code` | `string(255)` | sí | — | — | — |
| `rule_version` | `integer` | sí | — | — | — |
| `evidence_file_ids` | `jsonb` | sí | — | `json` | — |
| `request_id` | `string(255)` | sí | — | — | INDEX |
| `trace_id` | `string(255)` | sí | — | — | INDEX |
| `correlation_id` | `string(255)` | sí | — | — | INDEX |
| `causation_id` | `uuid` | sí | — | — | — |
| `idempotency_key_hash` | `string(255)` | sí | — | — | — |
| `metadata` | `jsonb` | sí | — | `json` | — |
| `created_at` | `timestamp` | no | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ProcessRun

- Clase: `App\Modules\Audit\Persistence\Models\ProcessRun`
- Tabla: `process_runs`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `process_code` | `string(255)` | no | — | — | INDEX |
| `business_identifier` | `string(255)` | sí | — | — | — |
| `status` | `string(255)` | no | `PENDING` | — | INDEX |
| `attempt` | `integer` | no | `1` | — | — |
| `started_at` | `timestamp` | sí | — | `datetime` | — |
| `finished_at` | `timestamp` | sí | — | `datetime` | — |
| `actor_user_id` | `uuid` | sí | — | — | — |
| `branch_id` | `uuid` | sí | — | — | — |
| `request_id` | `string(255)` | sí | — | — | — |
| `trace_id` | `string(255)` | sí | — | — | — |
| `correlation_id` | `string(255)` | sí | — | — | — |
| `summary` | `text` | sí | — | — | — |
| `counters` | `jsonb` | sí | — | `json` | — |
| `error_code` | `string(255)` | sí | — | — | — |
| `next_retry_at` | `timestamp` | sí | — | `datetime` | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## Client

- Clase: `App\Modules\Client\Persistence\Models\Client`
- Tabla: `clients`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `given_names` | `string(160)` | no | — | — | INDEX |
| `surnames` | `string(200)` | no | — | — | INDEX |
| `curp_ciphertext` | `text` | no | — | — | — |
| `curp_hmac` | `string(64)` | no | — | — | UNIQUE |
| `curp_last4` | `string(4)` | no | — | — | — |
| `rfc_ciphertext` | `text` | sí | — | — | — |
| `birth_date` | `date` | sí | — | `immutable_date` | — |
| `birth_place_ciphertext` | `text` | sí | — | — | — |
| `birth_state_ciphertext` | `text` | sí | — | — | — |
| `birth_city_ciphertext` | `text` | sí | — | — | — |
| `created_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `registration_operation_id` | `string(64)` | no | — | — | UNIQUE |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `updated_at` | `timestampTz` | sí | — | `immutable_datetime` | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `currentAddress()` | `HasOne` | `App\Modules\Client\Persistence\Models\ClientAddress` | `id ← client_id` |
| `addresses()` | `HasMany` | `App\Modules\Client\Persistence\Models\ClientAddress` | `id ← client_id` |
| `currentBankAccount()` | `HasOne` | `App\Modules\Client\Persistence\Models\ClientBankAccount` | `id ← client_id` |
| `bankAccounts()` | `HasMany` | `App\Modules\Client\Persistence\Models\ClientBankAccount` | `id ← client_id` |
| `currentAssignment()` | `HasOne` | `App\Modules\Client\Persistence\Models\ClientDistributorAssignment` | `id ← client_id` |
| `assignments()` | `HasMany` | `App\Modules\Client\Persistence\Models\ClientDistributorAssignment` | `id ← client_id` |
| `documents()` | `HasMany` | `App\Modules\Client\Persistence\Models\ClientDocument` | `id ← client_id` |
| `currentDocuments()` | `HasMany` | `App\Modules\Client\Persistence\Models\ClientDocument` | `id ← client_id` |
| `assignmentHistory()` | `HasMany` | `App\Modules\Client\Persistence\Models\ClientDistributorAssignment` | `id ← client_id` |
| `portfolioSettings()` | `HasMany` | `App\Modules\Client\Persistence\Models\ClientPortfolioSetting` | `id ← client_id` |

## ClientAddress

- Clase: `App\Modules\Client\Persistence\Models\ClientAddress`
- Tabla: `client_addresses`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `client_id` | `uuid` | no | — | — | UNIQUE; INDEX; FK → clients.id; delete restrict |
| `street_ciphertext` | `text` | no | — | — | — |
| `exterior_number_ciphertext` | `text` | no | — | — | — |
| `interior_number_ciphertext` | `text` | sí | — | — | — |
| `neighborhood_ciphertext` | `text` | no | — | — | — |
| `postal_code_ciphertext` | `text` | no | — | — | — |
| `municipality_ciphertext` | `text` | no | — | — | — |
| `city_ciphertext` | `text` | no | — | — | — |
| `state_ciphertext` | `text` | no | — | — | — |
| `address_fingerprint_hmac` | `string(64)` | no | — | — | UNIQUE |
| `normalization_version` | `string(20)` | no | — | — | — |
| `effective_from` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `effective_to` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `change_authorization_id` | `uuid` | sí | — | — | — |
| `created_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `active_slot` | `boolean` | sí | `true` | `boolean` | UNIQUE; UNIQUE |
| `created_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `client()` | `BelongsTo` | `App\Modules\Client\Persistence\Models\Client` | `client_id → id` |

## ClientBankAccount

- Clase: `App\Modules\Client\Persistence\Models\ClientBankAccount`
- Tabla: `client_bank_accounts`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `client_id` | `uuid` | no | — | — | UNIQUE; INDEX; FK → clients.id; delete restrict |
| `account_ciphertext` | `text` | no | — | — | — |
| `account_hmac` | `string(64)` | no | — | — | — |
| `account_last4` | `string(4)` | no | — | — | — |
| `effective_from` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `effective_to` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `change_authorization_id` | `uuid` | sí | — | — | — |
| `created_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `active_slot` | `boolean` | sí | `true` | `boolean` | UNIQUE |
| `created_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `client()` | `BelongsTo` | `App\Modules\Client\Persistence\Models\Client` | `client_id → id` |

## ClientDistributorAssignment

- Clase: `App\Modules\Client\Persistence\Models\ClientDistributorAssignment`
- Tabla: `client_distributor_assignments`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `client_id` | `uuid` | no | — | — | UNIQUE; FK → clients.id; delete restrict |
| `distributor_id` | `uuid` | no | — | — | INDEX |
| `branch_id_snapshot` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `effective_from` | `timestampTz` | no | — | `immutable_datetime` | — |
| `effective_to` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `assignment_type` | `string(40)` | no | — | `App\Modules\Client\Domain\Assignments\AssignmentType` | — |
| `mobility_operation_id` | `uuid` | sí | — | — | UNIQUE |
| `mobility_request_hash` | `string(64)` | sí | — | — | — |
| `reason` | `text` | sí | — | — | — |
| `changed_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `active_slot` | `boolean` | sí | `true` | `boolean` | UNIQUE; INDEX; INDEX |
| `created_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `client()` | `BelongsTo` | `App\Modules\Client\Persistence\Models\Client` | `client_id → id` |
| `branch()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\Branch` | `branch_id_snapshot → id` |

## ClientDocument

- Clase: `App\Modules\Client\Persistence\Models\ClientDocument`
- Tabla: `client_documents`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `client_id` | `uuid` | no | — | — | UNIQUE; INDEX; FK → clients.id; delete restrict |
| `document_type` | `string(50)` | no | — | `App\Modules\Client\Domain\Documents\ClientDocumentType` | UNIQUE; INDEX |
| `media_id` | `uuid` | no | — | — | — |
| `file_fingerprint` | `string(128)` | sí | — | — | — |
| `effective_from` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `effective_to` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `replaced_document_id` | `uuid` | sí | — | — | FK → client_documents.id; delete restrict |
| `created_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `active_slot` | `boolean` | sí | `true` | `boolean` | UNIQUE |
| `created_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `client()` | `BelongsTo` | `App\Modules\Client\Persistence\Models\Client` | `client_id → id` |

## ClientPortfolioConfirmation

- Clase: `App\Modules\Client\Persistence\Models\ClientPortfolioConfirmation`
- Tabla: `client_portfolio_confirmations`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `client_id` | `uuid` | no | — | — | INDEX; FK → clients.id; delete restrict |
| `distributor_id` | `uuid` | no | — | — | — |
| `assignment_id` | `uuid` | no | — | — | FK → client_distributor_assignments.id; delete restrict |
| `total_balance` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `overdue_balance` | `decimal(19,4)` | sí | — | `decimal:4` | — |
| `portfolio_version` | `bigInteger unsigned` | no | — | `integer` | — |
| `confirmed_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `confirmed_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `operation_id` | `uuid` | no | — | — | UNIQUE |

### Relaciones

- Ninguna relación Eloquent declarada.

## ClientPortfolioEntry

- Clase: `App\Modules\Client\Persistence\Models\ClientPortfolioEntry`
- Tabla: `client_portfolio_entries`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `client_id` | `uuid` | no | — | — | INDEX; FK → clients.id; delete restrict |
| `distributor_id` | `uuid` | no | — | — | UNIQUE |
| `assignment_id` | `uuid` | no | — | — | INDEX; FK → client_distributor_assignments.id; delete restrict |
| `voucher_id` | `uuid` | sí | — | — | UNIQUE |
| `entry_type` | `string(30)` | no | — | `App\Modules\Client\Domain\Portfolio\PortfolioEntryType` | — |
| `amount` | `decimal(19,4)` | sí | — | `decimal:4` | — |
| `informational_status` | `string(20)` | no | — | `App\Modules\Client\Domain\Portfolio\PortfolioStatus` | — |
| `occurred_on` | `date` | no | — | `immutable_date` | — |
| `note` | `text` | sí | — | `encrypted` | — |
| `created_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `idempotency_key` | `string(150)` | no | — | — | UNIQUE |
| `request_hash` | `string(64)` | no | — | — | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX; INDEX |
| `updated_at` | `timestampTz` | sí | — | `immutable_datetime` | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `client()` | `BelongsTo` | `App\Modules\Client\Persistence\Models\Client` | `client_id → id` |
| `assignment()` | `BelongsTo` | `App\Modules\Client\Persistence\Models\ClientDistributorAssignment` | `assignment_id → id` |
| `revisions()` | `HasMany` | `App\Modules\Client\Persistence\Models\ClientPortfolioEntryRevision` | `id ← entry_id` |

## ClientPortfolioEntryRevision

- Clase: `App\Modules\Client\Persistence\Models\ClientPortfolioEntryRevision`
- Tabla: `client_portfolio_entry_revisions`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `entry_id` | `uuid` | no | — | — | INDEX; FK → client_portfolio_entries.id; delete restrict |
| `previous_note` | `text` | sí | — | `encrypted` | — |
| `new_note` | `text` | sí | — | `encrypted` | — |
| `previous_status` | `string(20)` | no | — | `App\Modules\Client\Domain\Portfolio\PortfolioStatus` | — |
| `new_status` | `string(20)` | no | — | `App\Modules\Client\Domain\Portfolio\PortfolioStatus` | — |
| `previous_version` | `bigInteger unsigned` | no | — | `integer` | — |
| `changed_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `changed_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `entry()` | `BelongsTo` | `App\Modules\Client\Persistence\Models\ClientPortfolioEntry` | `entry_id → id` |

## ClientPortfolioSetting

- Clase: `App\Modules\Client\Persistence\Models\ClientPortfolioSetting`
- Tabla: `client_portfolio_settings`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `client_id` | `uuid` | no | — | — | INDEX; FK → clients.id; delete restrict |
| `distributor_id` | `uuid` | no | — | — | INDEX |
| `assignment_id` | `uuid` | no | — | — | UNIQUE; FK → client_distributor_assignments.id; delete restrict |
| `tracking_enabled` | `boolean` | no | `false` | `boolean` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `updated_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `created_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `updated_at` | `timestampTz` | sí | — | `immutable_datetime` | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `client()` | `BelongsTo` | `App\Modules\Client\Persistence\Models\Client` | `client_id → id` |
| `assignment()` | `BelongsTo` | `App\Modules\Client\Persistence\Models\ClientDistributorAssignment` | `assignment_id → id` |

## CategoryModel

- Clase: `App\Modules\Configuration\Infrastructure\Persistence\Models\CategoryModel`
- Tabla: `categories`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `status` | `string(20)` | no | `DRAFT` | — | — |
| `created_by` | `bigInteger unsigned` | no | — | `integer` | FK → users.id; delete restrict |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `versions()` | `HasMany` | `App\Modules\Configuration\Infrastructure\Persistence\Models\CategoryVersionModel` | `id ← category_id` |
| `currentVersion()` | `HasOne` | `App\Modules\Configuration\Infrastructure\Persistence\Models\CategoryVersionModel` | `id ← category_id` |
| `creator()` | `BelongsTo` | `App\Models\User` | `created_by → id` |

## CategoryVersionModel

- Clase: `App\Modules\Configuration\Infrastructure\Persistence\Models\CategoryVersionModel`
- Tabla: `category_versions`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `category_id` | `bigInteger unsigned` | no | — | — | UNIQUE; INDEX; INDEX; FK → categories.id; delete restrict |
| `version_number` | `integer unsigned` | no | — | `integer` | UNIQUE |
| `name` | `string(255)` | no | — | — | — |
| `description` | `text` | no | — | — | — |
| `distributor_profit_rate` | `decimal(7,4)` | no | — | `decimal:4` | — |
| `status` | `string(20)` | no | — | — | INDEX; INDEX |
| `effective_from` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `effective_to` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_by` | `bigInteger unsigned` | no | — | `integer` | FK → users.id; delete restrict |
| `published_by` | `bigInteger unsigned` | sí | — | `integer` | FK → users.id; delete restrict |
| `published_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `reason` | `text` | sí | — | — | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `category()` | `BelongsTo` | `App\Modules\Configuration\Infrastructure\Persistence\Models\CategoryModel` | `category_id → id` |
| `creator()` | `BelongsTo` | `App\Models\User` | `created_by → id` |
| `publisher()` | `BelongsTo` | `App\Models\User` | `published_by → id` |

## ConfigurationAuditEventModel

- Clase: `App\Modules\Configuration\Infrastructure\Persistence\Models\ConfigurationAuditEventModel`
- Tabla: `configuration_audit_events`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `event_type` | `string(128)` | no | — | — | INDEX |
| `result` | `string(32)` | no | — | — | — |
| `actor_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `executor_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `role_code` | `string(64)` | sí | — | — | — |
| `resource_type` | `string(80)` | sí | — | — | — |
| `resource_id` | `string(128)` | sí | — | — | — |
| `configuration_key` | `string(80)` | sí | — | — | — |
| `before_state` | `json` | sí | — | `json` | — |
| `after_state` | `json` | sí | — | `json` | — |
| `status_before` | `string(20)` | sí | — | — | — |
| `status_after` | `string(20)` | sí | — | — | — |
| `version_before` | `string(20)` | sí | — | — | — |
| `version_after` | `string(20)` | sí | — | — | — |
| `effective_from` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `effective_to` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `reason` | `text` | sí | — | — | — |
| `correlation_id` | `uuid` | no | — | — | — |
| `session_id` | `string(128)` | sí | — | — | — |
| `device_id` | `string(128)` | sí | — | — | — |
| `request_id` | `uuid` | no | — | — | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ConfigurationDefinitionModel

- Clase: `App\Modules\Configuration\Infrastructure\Persistence\Models\ConfigurationDefinitionModel`
- Tabla: `configuration_definitions`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `key` | `string(80)` | no | — | — | UNIQUE |
| `type` | `string(40)` | no | — | — | — |
| `is_administrable` | `boolean` | no | `true` | `boolean` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `versions()` | `HasMany` | `App\Modules\Configuration\Infrastructure\Persistence\Models\ConfigurationVersionModel` | `id ← definition_id` |
| `currentVersion()` | `HasOne` | `App\Modules\Configuration\Infrastructure\Persistence\Models\ConfigurationVersionModel` | `id ← definition_id` |

## ConfigurationVersionModel

- Clase: `App\Modules\Configuration\Infrastructure\Persistence\Models\ConfigurationVersionModel`
- Tabla: `configuration_versions`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `definition_id` | `bigInteger unsigned` | no | — | — | UNIQUE; INDEX; INDEX; FK → configuration_definitions.id; delete restrict |
| `version_number` | `integer unsigned` | no | — | `integer` | UNIQUE |
| `value` | `text` | no | — | — | — |
| `status` | `string(20)` | no | — | — | INDEX; INDEX |
| `effective_from` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `effective_to` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_by` | `bigInteger unsigned` | no | — | `integer` | FK → users.id; delete restrict |
| `published_by` | `bigInteger unsigned` | sí | — | `integer` | FK → users.id; delete restrict |
| `published_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `reason` | `text` | sí | — | — | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `definition()` | `BelongsTo` | `App\Modules\Configuration\Infrastructure\Persistence\Models\ConfigurationDefinitionModel` | `definition_id → id` |
| `creator()` | `BelongsTo` | `App\Models\User` | `created_by → id` |
| `publisher()` | `BelongsTo` | `App\Models\User` | `published_by → id` |

## ProductModel

- Clase: `App\Modules\Configuration\Infrastructure\Persistence\Models\ProductModel`
- Tabla: `products`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `status` | `string(20)` | no | `DRAFT` | — | — |
| `created_by` | `bigInteger unsigned` | no | — | `integer` | FK → users.id; delete restrict |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `versions()` | `HasMany` | `App\Modules\Configuration\Infrastructure\Persistence\Models\ProductVersionModel` | `id ← product_id` |
| `currentVersion()` | `HasOne` | `App\Modules\Configuration\Infrastructure\Persistence\Models\ProductVersionModel` | `id ← product_id` |
| `creator()` | `BelongsTo` | `App\Models\User` | `created_by → id` |

## ProductVersionModel

- Clase: `App\Modules\Configuration\Infrastructure\Persistence\Models\ProductVersionModel`
- Tabla: `product_versions`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `product_id` | `bigInteger unsigned` | no | — | — | UNIQUE; INDEX; INDEX; FK → products.id; delete restrict |
| `version_number` | `integer unsigned` | no | — | `integer` | UNIQUE |
| `amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `loan_commission_rate` | `decimal(7,4)` | no | — | `decimal:4` | — |
| `interest_rate_per_fortnight` | `decimal(7,4)` | no | — | `decimal:4` | — |
| `insurance_amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `fortnight_count` | `integer unsigned` | no | — | `integer` | — |
| `status` | `string(20)` | no | — | — | INDEX; INDEX |
| `effective_from` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `effective_to` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_by` | `bigInteger unsigned` | no | — | `integer` | FK → users.id; delete restrict |
| `published_by` | `bigInteger unsigned` | sí | — | `integer` | FK → users.id; delete restrict |
| `published_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `reason` | `text` | sí | — | — | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `product()` | `BelongsTo` | `App\Modules\Configuration\Infrastructure\Persistence\Models\ProductModel` | `product_id → id` |
| `creator()` | `BelongsTo` | `App\Models\User` | `created_by → id` |
| `publisher()` | `BelongsTo` | `App\Models\User` | `published_by → id` |

## RedemptionPeriodModel

- Clase: `App\Modules\Configuration\Infrastructure\Persistence\Models\RedemptionPeriodModel`
- Tabla: `redemption_periods`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `starts_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `ends_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `status` | `string(20)` | no | — | — | INDEX |
| `reason` | `text` | sí | — | — | — |
| `created_by` | `bigInteger unsigned` | no | — | `integer` | FK → users.id; delete restrict |
| `published_by` | `bigInteger unsigned` | sí | — | `integer` | FK → users.id; delete restrict |
| `published_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |
| `public_folio` | `string(80)` | sí | — | — | UNIQUE |
| `name` | `string(160)` | sí | — | — | — |
| `description` | `text` | sí | — | — | — |
| `version` | `bigInteger unsigned` | no | `1` | — | — |
| `closed_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `creator()` | `BelongsTo` | `App\Models\User` | `created_by → id` |
| `publisher()` | `BelongsTo` | `App\Models\User` | `published_by → id` |

## CreditAuditEventModel

- Clase: `App\Modules\Credit\Infrastructure\Persistence\Eloquent\Models\CreditAuditEventModel`
- Tabla: `credit_audit_events`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `event_type` | `string(128)` | no | — | — | INDEX |
| `result` | `string(32)` | no | — | — | — |
| `actor_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `requester_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `reviewer_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `authorizer_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `executor_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `distributor_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | sí | — | — | FK → branches.id; delete restrict |
| `role_code` | `string(64)` | sí | — | — | — |
| `resource_type` | `string(80)` | sí | — | — | — |
| `resource_id` | `string(128)` | sí | — | — | — |
| `before_state` | `json` | sí | — | `array` | — |
| `after_state` | `json` | sí | — | `array` | — |
| `metadata` | `json` | sí | — | `array` | — |
| `reason` | `text` | sí | — | — | — |
| `idempotency_key` | `string(160)` | sí | — | — | — |
| `correlation_id` | `uuid` | no | — | — | — |
| `session_id` | `string(128)` | sí | — | — | — |
| `device_id` | `string(128)` | sí | — | — | — |
| `display_timezone` | `string(64)` | no | — | — | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## CreditIncreaseRequestModel

- Clase: `App\Modules\Credit\Infrastructure\Persistence\Eloquent\Models\CreditIncreaseRequestModel`
- Tabla: `credit_increase_requests`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `folio` | `string(32)` | no | — | — | UNIQUE |
| `distributor_id` | `bigInteger unsigned` | no | — | — | UNIQUE; INDEX; FK → users.id; delete restrict |
| `credit_line_id` | `bigInteger unsigned` | no | — | — | FK → credit_lines.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `coordinator_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `requested_amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `recommended_amount` | `decimal(18,4)` | sí | — | `decimal:4` | — |
| `authorized_amount` | `decimal(18,4)` | sí | — | `decimal:4` | — |
| `origin_type` | `string(40)` | no | — | `App\Modules\Credit\Domain\Enums\IncreaseOriginType` | — |
| `product_amount` | `decimal(18,4)` | sí | — | `decimal:4` | — |
| `available_balance_snapshot` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `required_difference` | `decimal(18,4)` | sí | — | `decimal:4` | — |
| `total_authorized_snapshot` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `used_balance_snapshot` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `credit_line_version_snapshot` | `bigInteger unsigned` | no | — | `integer` | — |
| `status` | `string(40)` | no | — | `App\Modules\Credit\Domain\Enums\IncreaseRequestStatus` | INDEX; INDEX |
| `request_reason` | `text` | no | — | — | — |
| `coordinator_reason` | `text` | sí | — | — | — |
| `manager_reason` | `text` | sí | — | — | — |
| `requested_by_user_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `reviewed_by_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `decided_by_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `requested_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX; INDEX |
| `reviewed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `decided_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `restriction_id` | `bigInteger unsigned` | sí | — | — | FK → credit_usage_restrictions.id; delete restrict |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `idempotency_key` | `string(160)` | no | — | — | UNIQUE |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `distributor()` | `BelongsTo` | `App\Models\User` | `distributor_id → id` |
| `creditLine()` | `BelongsTo` | `App\Modules\Credit\Infrastructure\Persistence\Eloquent\Models\CreditLineModel` | `credit_line_id → id` |
| `restriction()` | `BelongsTo` | `App\Modules\Credit\Infrastructure\Persistence\Eloquent\Models\CreditUsageRestrictionModel` | `restriction_id → id` |

## CreditLineModel

- Clase: `App\Modules\Credit\Infrastructure\Persistence\Eloquent\Models\CreditLineModel`
- Tabla: `credit_lines`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `distributor_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → users.id; delete restrict |
| `total_authorized` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `used_balance` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `available_balance` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `recovered_capital_total` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `last_movement_id` | `bigInteger unsigned` | sí | — | — | FK → credit_line_movements.id; delete restrict |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `distributor()` | `BelongsTo` | `App\Models\User` | `distributor_id → id` |
| `movements()` | `HasMany` | `App\Modules\Credit\Infrastructure\Persistence\Eloquent\Models\CreditLineMovementModel` | `id ← credit_line_id` |
| `restrictions()` | `HasMany` | `App\Modules\Credit\Infrastructure\Persistence\Eloquent\Models\CreditUsageRestrictionModel` | `id ← credit_line_id` |

## CreditLineMovementModel

- Clase: `App\Modules\Credit\Infrastructure\Persistence\Eloquent\Models\CreditLineMovementModel`
- Tabla: `credit_line_movements`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `credit_line_id` | `bigInteger unsigned` | no | — | — | INDEX; INDEX; FK → credit_lines.id; delete restrict |
| `type` | `string(40)` | no | — | `App\Modules\Credit\Domain\Enums\CreditMovementType` | UNIQUE; INDEX |
| `total_delta` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `used_delta` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `total_before` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `total_after` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `used_before` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `used_after` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `available_before` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `available_after` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `source_type` | `string(80)` | no | — | — | UNIQUE |
| `source_id` | `string(128)` | no | — | — | UNIQUE |
| `actor_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `authorized_by_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `reason` | `text` | no | — | — | — |
| `configuration_snapshot` | `json` | sí | — | `array` | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX; INDEX |
| `idempotency_key` | `string(160)` | no | — | — | UNIQUE |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## CreditUsageRestrictionModel

- Clase: `App\Modules\Credit\Infrastructure\Persistence\Eloquent\Models\CreditUsageRestrictionModel`
- Tabla: `credit_usage_restrictions`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `credit_line_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → credit_lines.id; delete restrict |
| `trigger_type` | `string(40)` | no | — | `App\Modules\Credit\Domain\Enums\RestrictionTriggerType` | UNIQUE |
| `trigger_id` | `string(128)` | no | — | — | UNIQUE |
| `base_total_authorized` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `percentage` | `decimal(7,4)` | no | — | `decimal:4` | — |
| `tolerance_amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `reference_amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `status` | `string(20)` | no | — | `App\Modules\Credit\Domain\Enums\RestrictionStatus` | INDEX; INDEX |
| `bound_voucher_id` | `string(128)` | sí | — | — | — |
| `bound_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `consumed_by_voucher_id` | `string(128)` | sí | — | — | — |
| `consumed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `creditLine()` | `BelongsTo` | `App\Modules\Credit\Infrastructure\Persistence\Eloquent\Models\CreditLineModel` | `credit_line_id → id` |

## Distributor

- Clase: `App\Modules\Distributor\Persistence\Models\Distributor`
- Tabla: `distributors`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `distributor_number` | `string(255)` | no | — | — | UNIQUE; INDEX; INDEX |
| `onboarding_application_id` | `uuid` | no | — | — | UNIQUE; INDEX; FK → distributor_applications.public_id; delete restrict |
| `user_id` | `uuid` | no | — | — | UNIQUE; INDEX; FK → users.public_id; delete restrict |
| `branch_id` | `uuid` | no | — | — | INDEX; INDEX; FK → branches.public_id; delete restrict |
| `status` | `string(255)` | no | `ACTIVE` | — | INDEX; INDEX |
| `activated_at` | `timestamp` | no | — | `immutable_datetime` | INDEX |
| `activated_by` | `uuid` | sí | — | — | FK → users.public_id; delete restrict |
| `activation_operation_id` | `uuid` | no | — | — | UNIQUE |
| `lock_version` | `integer` | no | `1` | `integer` | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `user()` | `BelongsTo` | `App\Models\User` | `user_id → public_id` |
| `branch()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\Branch` | `branch_id → public_id` |
| `categoryAssignments()` | `HasMany` | `App\Modules\Distributor\Persistence\Models\DistributorCategoryAssignment` | `id ← distributor_id` |

## DistributorCategoryAssignment

- Clase: `App\Modules\Distributor\Persistence\Models\DistributorCategoryAssignment`
- Tabla: `distributor_category_assignments`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `distributor_id` | `uuid` | no | — | — | INDEX; FK → distributors.id; delete restrict |
| `category_id` | `uuid` | no | — | — | FK → categories.public_id; delete restrict |
| `category_version_id` | `uuid` | no | — | — | FK → category_versions.public_id; delete restrict |
| `profit_rate_snapshot` | `decimal(8,4)` | no | — | `decimal:4` | — |
| `effective_from` | `timestamp` | no | — | `datetime` | INDEX |
| `effective_to` | `timestamp` | sí | — | `datetime` | INDEX |
| `assigned_by` | `uuid` | no | — | — | FK → users.public_id; delete restrict |
| `assigned_role` | `string(255)` | no | — | — | — |
| `assigned_branch_id` | `uuid` | no | — | — | FK → branches.public_id; delete restrict |
| `reason` | `string(255)` | no | — | — | — |
| `idempotency_key` | `string(255)` | no | — | — | UNIQUE |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `distributor()` | `BelongsTo` | `App\Modules\Distributor\Persistence\Models\Distributor` | `distributor_id → id` |

## ApplicationActivationRecord

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationActivationRecord`
- Tabla: `application_activation_records`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → distributor_applications.id; delete restrict |
| `authorization_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → application_authorizations.id; delete restrict |
| `distributor_id` | `uuid` | no | — | — | UNIQUE |
| `distributor_number` | `string(80)` | no | — | — | UNIQUE |
| `account_id` | `uuid` | no | — | — | UNIQUE |
| `organization_assignment_id` | `uuid` | no | — | — | UNIQUE |
| `credit_line_id` | `uuid` | no | — | — | UNIQUE |
| `initial_movement_id` | `uuid` | no | — | — | UNIQUE |
| `first_voucher_restriction_id` | `uuid` | no | — | — | UNIQUE |
| `initial_credit_line` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `operation_key` | `string(150)` | no | — | — | UNIQUE |
| `activated_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationAssetLiability

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationAssetLiability`
- Tabla: `application_assets_liabilities`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `entry_type` | `string(30)` | no | — | `App\Modules\DistributorOnboarding\Domain\Expedients\AssetLiabilityType` | INDEX |
| `description` | `text` | no | — | `encrypted` | — |
| `amount` | `decimal(19,4)` | sí | — | `decimal:4` | — |
| `retired_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationAudit

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationAudit`
- Tabla: `application_audits`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `event_type` | `string(100)` | no | — | — | INDEX |
| `requester_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `authorizer_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `executor_user_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `auth_session_id` | `bigInteger unsigned` | sí | — | — | FK → auth_sessions.id; delete restrict |
| `actor_role` | `string(40)` | sí | — | — | — |
| `branch_id` | `bigInteger unsigned` | sí | — | — | FK → branches.id; delete restrict |
| `application_folio` | `string(40)` | no | — | — | — |
| `entity_type` | `string(80)` | no | — | — | — |
| `entity_public_id` | `uuid` | sí | — | — | — |
| `previous_status` | `string(40)` | sí | — | `App\Modules\DistributorOnboarding\Domain\Applications\ApplicationStatus` | — |
| `new_status` | `string(40)` | sí | — | `App\Modules\DistributorOnboarding\Domain\Applications\ApplicationStatus` | — |
| `protected_previous_value` | `text` | sí | — | `encrypted` | — |
| `protected_new_value` | `text` | sí | — | `encrypted` | — |
| `reason` | `text` | sí | — | `encrypted` | — |
| `result` | `string(40)` | sí | — | — | — |
| `application_version` | `bigInteger unsigned` | no | — | `integer` | — |
| `request_id` | `uuid` | no | — | — | — |
| `trace_id` | `uuid` | sí | — | — | — |
| `ip_hash` | `string(64)` | sí | — | — | — |
| `device_hash` | `string(64)` | sí | — | — | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |
| `business_occurred_at` | `dateTimeTz` | no | — | `immutable_datetime` | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `requester()` | `BelongsTo` | `App\Models\User` | `requester_user_id → id` |

## ApplicationAuthorization

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationAuthorization`
- Tabla: `application_authorizations`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | UNIQUE; UNIQUE; FK → distributor_applications.id; delete restrict |
| `decision` | `string(20)` | no | — | `App\Modules\DistributorOnboarding\Domain\Decisions\ManagerDecision` | — |
| `initial_credit_line` | `decimal(19,4)` | sí | — | `decimal:4` | — |
| `reason` | `text` | no | — | `encrypted` | — |
| `manager_user_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `manager_role` | `string(40)` | no | — | — | — |
| `manager_branch_id` | `bigInteger unsigned` | sí | — | — | FK → branches.id; delete restrict |
| `application_version` | `bigInteger unsigned` | no | — | `integer` | — |
| `decided_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `idempotency_key` | `string(150)` | no | — | — | UNIQUE |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationCaptureRevision

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationCaptureRevision`
- Tabla: `application_capture_revisions`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `section` | `string(50)` | no | — | `App\Modules\DistributorOnboarding\Domain\Expedients\ExpedientSection` | — |
| `record_public_id` | `uuid` | sí | — | — | — |
| `action` | `string(30)` | no | — | — | — |
| `previous_value` | `text` | sí | — | `encrypted` | — |
| `new_value` | `text` | sí | — | `encrypted` | — |
| `actor_user_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `request_id` | `uuid` | no | — | — | — |
| `recorded_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationCommercialCredit

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationCommercialCredit`
- Tabla: `application_commercial_credits`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `company_name` | `text` | no | — | `encrypted` | — |
| `credit_limit` | `decimal(19,4)` | sí | — | `decimal:4` | — |
| `proof_media_id` | `uuid` | sí | — | — | — |
| `retired_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationCorrection

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationCorrection`
- Tabla: `application_corrections`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `difference_id` | `bigInteger unsigned` | sí | — | — | FK → verification_differences.id; delete restrict |
| `section` | `string(50)` | no | — | `App\Modules\DistributorOnboarding\Domain\Expedients\ExpedientSection` | — |
| `field_path` | `string(255)` | no | — | — | — |
| `original_value` | `text` | no | — | `encrypted` | — |
| `corrected_value` | `text` | no | — | `encrypted` | — |
| `reason` | `text` | no | — | `encrypted` | — |
| `corrected_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `corrected_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `request_id` | `uuid` | no | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `difference()` | `BelongsTo` | `App\Modules\DistributorOnboarding\Persistence\Models\VerificationDifference` | `difference_id → id` |
| `corrector()` | `BelongsTo` | `App\Models\User` | `corrected_by → id` |

## ApplicationEmployment

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationEmployment`
- Tabla: `application_employments`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `workplace` | `text` | no | — | `encrypted` | — |
| `declared_details` | `text` | sí | — | `encrypted` | — |
| `retired_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationEvaluation

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationEvaluation`
- Tabla: `application_evaluations`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → distributor_applications.id; delete restrict |
| `coordinator_user_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `decision` | `string(40)` | no | — | `App\Modules\DistributorOnboarding\Domain\Decisions\CoordinatorDecision` | — |
| `reason` | `text` | no | — | `encrypted` | — |
| `branch_id` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `visit_id` | `bigInteger unsigned` | no | — | — | FK → verification_visits.id; delete restrict |
| `application_version` | `bigInteger unsigned` | no | — | `integer` | — |
| `requirements_version` | `string(40)` | sí | — | — | — |
| `decided_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationFamilyMember

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationFamilyMember`
- Tabla: `application_family_members`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `relationship_code` | `string(80)` | no | — | — | — |
| `name` | `text` | no | — | `encrypted` | — |
| `age` | `smallInteger unsigned` | sí | — | `integer` | — |
| `school` | `text` | sí | — | `encrypted` | — |
| `retired_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationFamilyReference

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationFamilyReference`
- Tabla: `application_family_references`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `relationship_code` | `string(80)` | no | — | — | — |
| `name` | `text` | no | — | `encrypted` | — |
| `phone` | `text` | sí | — | `encrypted` | — |
| `retired_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationLaborReference

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationLaborReference`
- Tabla: `application_labor_references`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `name` | `text` | no | — | `encrypted` | — |
| `contact` | `text` | sí | — | `encrypted` | — |
| `declared_details` | `text` | sí | — | `encrypted` | — |
| `retired_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationPersonalData

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationPersonalData`
- Tabla: `application_personal_data`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `application_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → distributor_applications.id; delete restrict |
| `first_name` | `text` | sí | — | `encrypted` | — |
| `paternal_surname` | `text` | sí | — | `encrypted` | — |
| `maternal_surname` | `text` | sí | — | `encrypted` | — |
| `curp` | `text` | sí | — | `encrypted` | — |
| `curp_hash` | `string(64)` | sí | — | — | INDEX |
| `rfc` | `text` | sí | — | `encrypted` | — |
| `rfc_hash` | `string(64)` | sí | — | — | INDEX |
| `birth_date` | `date` | sí | — | `immutable_date` | — |
| `birth_place` | `text` | sí | — | `encrypted` | — |
| `birth_state` | `text` | sí | — | `encrypted` | — |
| `birth_city` | `text` | sí | — | `encrypted` | — |
| `declared_address` | `text` | sí | — | `encrypted` | — |
| `official_identification_media_id` | `uuid` | sí | — | — | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationResidence

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationResidence`
- Tabla: `application_residences`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `structured_address` | `text` | no | — | `encrypted` | — |
| `housing_type_code` | `string(80)` | sí | — | — | — |
| `tenure_code` | `string(80)` | sí | — | — | — |
| `financing_code` | `string(80)` | sí | — | — | — |
| `dimensions` | `text` | sí | — | `encrypted` | — |
| `retired_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationReviewObservation

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationReviewObservation`
- Tabla: `application_review_observations`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `observation` | `text` | no | — | `encrypted` | — |
| `action` | `string(40)` | no | — | — | — |
| `coordinator_user_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `recorded_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationStatusHistory

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationStatusHistory`
- Tabla: `application_status_histories`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | UNIQUE; INDEX; FK → distributor_applications.id; delete restrict |
| `action` | `string(80)` | no | — | — | — |
| `previous_status` | `string(40)` | sí | — | `App\Modules\DistributorOnboarding\Domain\Applications\ApplicationStatus` | — |
| `new_status` | `string(40)` | no | — | `App\Modules\DistributorOnboarding\Domain\Applications\ApplicationStatus` | — |
| `actor_user_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `actor_role` | `string(40)` | no | — | — | — |
| `branch_id` | `bigInteger unsigned` | sí | — | — | FK → branches.id; delete restrict |
| `reason` | `text` | sí | — | `encrypted` | — |
| `result` | `string(40)` | sí | — | — | — |
| `application_version` | `bigInteger unsigned` | no | — | `integer` | — |
| `idempotency_key` | `string(150)` | no | — | — | UNIQUE |
| `request_id` | `uuid` | no | — | — | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationSubmission

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationSubmission`
- Tabla: `application_submissions`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → distributor_applications.id; delete restrict |
| `application_version` | `bigInteger unsigned` | no | — | `integer` | — |
| `requirements_version` | `string(40)` | sí | — | — | — |
| `snapshot_hash` | `string(64)` | no | — | — | — |
| `submitted_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `submitted_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `idempotency_key` | `string(150)` | no | — | — | UNIQUE |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationVehicle

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationVehicle`
- Tabla: `application_vehicles`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `declared_details` | `text` | no | — | `encrypted` | — |
| `retired_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## DistributorApplication

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\DistributorApplication`
- Tabla: `distributor_applications`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `folio` | `string(40)` | no | — | — | UNIQUE |
| `contact_email` | `text` | no | — | `encrypted` | — |
| `normalized_email_hash` | `string(64)` | no | — | — | INDEX |
| `account_name` | `text` | no | — | `encrypted` | — |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `coordinator_user_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `status` | `string(40)` | no | — | `App\Modules\DistributorOnboarding\Domain\Applications\ApplicationStatus` | INDEX; INDEX |
| `result` | `string(40)` | sí | — | `App\Modules\DistributorOnboarding\Domain\Applications\ApplicationStatus` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `submitted_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `submitted_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | INDEX; INDEX |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `branch()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\Branch` | `branch_id → id` |
| `coordinator()` | `BelongsTo` | `App\Models\User` | `coordinator_user_id → id` |
| `personalData()` | `HasOne` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationPersonalData` | `id ← application_id` |
| `familyMembers()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationFamilyMember` | `id ← application_id` |
| `familyReferences()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationFamilyReference` | `id ← application_id` |
| `residences()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationResidence` | `id ← application_id` |
| `vehicles()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationVehicle` | `id ← application_id` |
| `assetsLiabilities()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationAssetLiability` | `id ← application_id` |
| `employments()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationEmployment` | `id ← application_id` |
| `laborReferences()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationLaborReference` | `id ← application_id` |
| `commercialCredits()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationCommercialCredit` | `id ← application_id` |
| `verifierAssignments()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\VerifierAssignment` | `id ← application_id` |
| `activeVerifierAssignment()` | `HasOne` | `App\Modules\DistributorOnboarding\Persistence\Models\VerifierAssignment` | `id ← application_id` |
| `visit()` | `HasOne` | `App\Modules\DistributorOnboarding\Persistence\Models\VerificationVisit` | `id ← application_id` |
| `mediaLinks()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationMediaLink` | `id ← application_id` |
| `differences()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\VerificationDifference` | `id ← application_id` |
| `corrections()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationCorrection` | `id ← application_id` |
| `evaluation()` | `HasOne` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationEvaluation` | `id ← application_id` |
| `authorization()` | `HasOne` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationAuthorization` | `id ← application_id` |
| `activation()` | `HasOne` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationActivationRecord` | `id ← application_id` |
| `histories()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationStatusHistory` | `id ← application_id` |
| `audits()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationAudit` | `id ← application_id` |

## OnboardingIdempotencyKey

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\OnboardingIdempotencyKey`
- Tabla: `onboarding_idempotency_keys`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `application_id` | `bigInteger unsigned` | sí | — | — | FK → distributor_applications.id; delete restrict |
| `operation` | `string(80)` | no | — | — | UNIQUE |
| `scope_key` | `string(64)` | no | — | — | UNIQUE |
| `idempotency_key` | `string(150)` | no | — | — | UNIQUE |
| `request_hash` | `string(64)` | no | — | — | — |
| `resource_type` | `string(80)` | sí | — | — | — |
| `resource_public_id` | `uuid` | sí | — | — | — |
| `response_payload` | `jsonb` | sí | — | `array` | — |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ApplicationMediaLink

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\ApplicationMediaLink`
- Tabla: `application_media_links`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → distributor_applications.id; delete restrict |
| `visit_id` | `bigInteger unsigned` | sí | — | — | INDEX; FK → verification_visits.id; delete restrict |
| `media_id` | `uuid` | no | — | — | UNIQUE |
| `purpose` | `string(80)` | no | — | `App\Modules\DistributorOnboarding\Domain\Expedients\MediaPurpose` | UNIQUE; INDEX |
| `linked_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `linked_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## VerificationDifference

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\VerificationDifference`
- Tabla: `verification_differences`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → distributor_applications.id; delete restrict |
| `visit_id` | `bigInteger unsigned` | no | — | — | FK → verification_visits.id; delete restrict |
| `section` | `string(50)` | no | — | `App\Modules\DistributorOnboarding\Domain\Expedients\ExpedientSection` | — |
| `field_path` | `string(255)` | no | — | — | — |
| `declared_value` | `text` | no | — | `encrypted` | — |
| `observed_value` | `text` | no | — | `encrypted` | — |
| `description` | `text` | no | — | `encrypted` | — |
| `evidence_media_id` | `uuid` | sí | — | — | — |
| `classification_code` | `string(80)` | no | — | — | — |
| `catalog_version` | `string(40)` | sí | — | — | — |
| `verifier_user_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `recorded_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `request_id` | `uuid` | sí | — | — | — |
| `resolved_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |

### Relaciones

- Ninguna relación Eloquent declarada.

## VerificationVisit

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\VerificationVisit`
- Tabla: `verification_visits`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → distributor_applications.id; delete restrict |
| `assignment_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → application_verifier_assignments.id; delete restrict |
| `verifier_user_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `started_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `result` | `string(40)` | sí | — | `App\Modules\DistributorOnboarding\Domain\Verification\VisitResult` | — |
| `observations` | `text` | sí | — | `encrypted` | — |
| `requirements_version` | `string(40)` | sí | — | `string` | — |
| `auth_session_public_id` | `uuid` | sí | — | — | — |
| `device_context` | `text` | sí | — | `encrypted` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `checklistItems()` | `HasMany` | `App\Modules\DistributorOnboarding\Persistence\Models\VerificationVisitChecklistItem` | `id ← visit_id` |

## VerificationVisitChecklistItem

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\VerificationVisitChecklistItem`
- Tabla: `verification_visit_checklist_items`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `visit_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → verification_visits.id; delete restrict |
| `requirements_version` | `string(40)` | no | — | — | — |
| `requirement_code` | `string(80)` | no | — | — | UNIQUE |
| `confirmed` | `boolean` | no | — | `boolean` | — |
| `observations` | `text` | sí | — | `encrypted` | — |
| `recorded_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `recorded_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## VerifierAssignment

- Clase: `App\Modules\DistributorOnboarding\Persistence\Models\VerifierAssignment`
- Tabla: `application_verifier_assignments`
- Clave primaria: `id` (int; incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | `int` | PK |
| `public_id` | `uuid` | no | — | — | UNIQUE |
| `application_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → distributor_applications.id; delete restrict |
| `verifier_user_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `assigned_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `assigned_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `ended_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `reason` | `text` | sí | — | `encrypted` | — |
| `active_slot` | `boolean` | sí | `true` | `boolean` | UNIQUE; INDEX |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `verifier()` | `BelongsTo` | `App\Models\User` | `verifier_user_id → id` |

## ExcessApplicationModel

- Clase: `App\Modules\ExcessBalance\Infrastructure\Persistence\Eloquent\Models\ExcessApplicationModel`
- Tabla: `excess_applications`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `excess_balance_id` | `uuid` | no | — | — | INDEX; FK → excess_balances.id; delete restrict |
| `relation_id` | `string(128)` | no | — | — | — |
| `amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `available_before` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `available_after` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `effective_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `idempotency_key` | `string(180)` | no | — | — | UNIQUE |
| `created_at` | `timestampTz` | no | — | — | INDEX |
| `payment_allocation_id` | `uuid` | sí | — | — | UNIQUE |
| `applied_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `status` | `string(24)` | no | `APPLIED` | — | — |
| `created_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |

### Relaciones

- Ninguna relación Eloquent declarada.

## ExcessLedgerEntryModel

- Clase: `App\Modules\ExcessBalance\Infrastructure\Persistence\Eloquent\Models\ExcessLedgerEntryModel`
- Tabla: `excess_ledger_entries`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `excess_balance_id` | `uuid` | no | — | — | INDEX; FK → excess_balances.id; delete restrict |
| `entry_type` | `string(40)` | no | — | `App\Modules\ExcessBalance\Domain\Enums\ExcessLedgerEntryType` | UNIQUE |
| `amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `balance_bucket_from` | `string(24)` | sí | — | `App\Modules\ExcessBalance\Domain\Enums\ExcessBalanceBucket` | — |
| `balance_bucket_to` | `string(24)` | sí | — | `App\Modules\ExcessBalance\Domain\Enums\ExcessBalanceBucket` | — |
| `excess_application_id` | `uuid` | sí | — | — | FK → excess_applications.id; delete restrict |
| `refund_request_id` | `uuid` | sí | — | — | FK → refund_requests.id; delete restrict |
| `idempotency_key` | `string(180)` | no | — | — | UNIQUE |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `actor_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `metadata` | `jsonb` | sí | — | `array` | — |
| `created_at` | `timestampTz` | no | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ExcessStatusHistoryModel

- Clase: `App\Modules\ExcessBalance\Infrastructure\Persistence\Eloquent\Models\ExcessStatusHistoryModel`
- Tabla: `excess_status_history`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `excess_balance_id` | `uuid` | no | — | — | INDEX; FK → excess_balances.id; delete restrict |
| `refund_request_id` | `uuid` | sí | — | — | FK → refund_requests.id; delete restrict |
| `excess_application_id` | `uuid` | sí | — | — | FK → excess_applications.id; delete restrict |
| `previous_status` | `string(40)` | sí | — | — | — |
| `new_status` | `string(40)` | no | — | — | — |
| `amounts_before` | `jsonb` | no | — | `array` | — |
| `amounts_after` | `jsonb` | no | — | `array` | — |
| `actor_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `actor_type` | `string(24)` | no | — | — | — |
| `reason` | `text` | sí | — | — | — |
| `idempotency_key` | `string(180)` | no | — | — | UNIQUE |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | no | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## FileAccessGrant

- Clase: `App\Modules\Media\Persistence\Models\FileAccessGrant`
- Tabla: `file_access_grants`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `file_id` | `uuid` | no | — | — | FK → media_files.id; delete cascade |
| `actor_user_id` | `uuid` | no | — | — | INDEX |
| `action_allowed` | `string(255)` | no | — | — | — |
| `checked_resource_type` | `string(255)` | sí | — | — | — |
| `checked_resource_id` | `uuid` | sí | — | — | — |
| `expires_at` | `timestamp` | no | — | `datetime` | — |
| `status` | `string(255)` | no | `ACTIVE` | — | INDEX |
| `correlation_id` | `string(255)` | sí | — | — | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## FileUploadIntent

- Clase: `App\Modules\Media\Persistence\Models\FileUploadIntent`
- Tabla: `file_upload_intents`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `actor_user_id` | `uuid` | no | — | — | — |
| `branch_id` | `uuid` | sí | — | — | — |
| `owner_module` | `string(255)` | no | — | — | — |
| `owner_type` | `string(255)` | no | — | — | — |
| `owner_id` | `uuid` | no | — | — | — |
| `purpose` | `string(255)` | no | — | — | — |
| `technical_policy` | `string(255)` | no | — | — | — |
| `idempotency_key_hash` | `string(255)` | sí | — | — | — |
| `status` | `string(255)` | no | `PENDING` | — | — |
| `expires_at` | `timestamp` | no | — | `datetime` | — |
| `result_file_id` | `uuid` | sí | — | — | FK → media_files.id; delete set null |
| `consumed_at` | `timestamp` | sí | — | `datetime` | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## FileValidationAttempt

- Clase: `App\Modules\Media\Persistence\Models\FileValidationAttempt`
- Tabla: `file_validation_attempts`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `file_id` | `uuid` | no | — | — | UNIQUE; FK → media_files.id; delete cascade |
| `attempt_number` | `integer` | no | — | `integer` | UNIQUE |
| `job_id` | `string(255)` | sí | — | — | — |
| `started_at` | `timestamp` | sí | — | `datetime` | — |
| `finished_at` | `timestamp` | sí | — | `datetime` | — |
| `detected_mime` | `string(255)` | sí | — | — | — |
| `size_bytes` | `bigInteger` | sí | — | `integer` | — |
| `sha256` | `string(64)` | sí | — | — | — |
| `verifications_executed` | `jsonb` | sí | — | `json` | — |
| `result` | `string(255)` | sí | — | — | — |
| `error_code` | `string(255)` | sí | — | — | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## MediaFile

- Clase: `App\Modules\Media\Persistence\Models\MediaFile`
- Tabla: `media_files`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `public_number` | `string(255)` | sí | — | — | UNIQUE |
| `file_type` | `string(255)` | no | — | — | — |
| `status` | `string(255)` | no | `PENDING_UPLOAD` | — | INDEX |
| `storage_disk` | `string(255)` | no | — | — | — |
| `storage_key` | `string(255)` | no | — | — | — |
| `temporary_storage_key` | `string(255)` | sí | — | — | — |
| `original_name` | `string(255)` | sí | — | — | — |
| `safe_display_name` | `string(255)` | sí | — | — | — |
| `declared_extension` | `string(255)` | sí | — | — | — |
| `detected_extension` | `string(255)` | sí | — | — | — |
| `declared_mime` | `string(255)` | sí | — | — | — |
| `detected_mime` | `string(255)` | sí | — | — | — |
| `size_bytes` | `bigInteger` | sí | — | `integer` | — |
| `sha256` | `string(64)` | sí | — | — | — |
| `uploaded_by` | `uuid` | sí | — | — | — |
| `branch_id` | `uuid` | sí | — | — | — |
| `validated_at` | `timestamp` | sí | — | `datetime` | — |
| `validated_by_process` | `string(255)` | sí | — | — | — |
| `rejection_code` | `string(255)` | sí | — | — | — |
| `rejection_detail` | `text` | sí | — | — | — |
| `available_at` | `timestamp` | sí | — | `datetime` | — |
| `created_at` | `timestamp` | sí | — | — | INDEX |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## MediaFileBinding

- Clase: `App\Modules\Media\Persistence\Models\MediaFileBinding`
- Tabla: `media_file_bindings`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `file_id` | `uuid` | no | — | — | FK → media_files.id; delete restrict |
| `owner_module` | `string(255)` | no | — | — | — |
| `owner_type` | `string(255)` | no | — | — | INDEX |
| `owner_id` | `uuid` | no | — | — | INDEX |
| `purpose` | `string(255)` | no | — | — | INDEX |
| `version_number` | `integer` | no | `1` | — | — |
| `is_current` | `boolean` | no | `true` | `boolean` | — |
| `bound_by` | `uuid` | sí | — | — | — |
| `bound_at` | `timestamp` | no | — | `datetime` | — |
| `superseded_by_binding_id` | `uuid` | sí | — | — | — |
| `metadata` | `jsonb` | sí | — | `json` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## AdministrativeReassignment

- Clase: `App\Modules\Mobility\Infrastructure\Persistence\Models\AdministrativeReassignment`
- Tabla: `administrative_reassignments`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `reassignment_number` | `string(40)` | no | — | — | UNIQUE |
| `status` | `string(40)` | no | — | `App\Modules\Mobility\Domain\Enums\AdministrativeReassignmentStatus` | — |
| `scope_branch_id` | `bigInteger unsigned` | sí | — | — | FK → branches.id; delete restrict |
| `reason` | `text` | no | — | — | — |
| `executed_by` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → users.id; delete restrict |
| `executed_role` | `string(40)` | no | — | — | — |
| `reauthentication_id` | `bigInteger unsigned` | sí | — | — | FK → reauth_authorizations.id; delete restrict |
| `validated_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `idempotency_key` | `string(150)` | no | — | — | UNIQUE |
| `request_hash` | `string(64)` | no | — | — | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `items()` | `HasMany` | `App\Modules\Mobility\Infrastructure\Persistence\Models\AdministrativeReassignmentItem` | `id ← administrative_reassignment_id` |

## AdministrativeReassignmentItem

- Clase: `App\Modules\Mobility\Infrastructure\Persistence\Models\AdministrativeReassignmentItem`
- Tabla: `administrative_reassignment_items`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `administrative_reassignment_id` | `uuid` | no | — | — | UNIQUE; FK → administrative_reassignments.id; delete restrict |
| `client_id` | `uuid` | no | — | — | UNIQUE; INDEX; FK → clients.id; delete restrict |
| `origin_distributor_id` | `uuid` | no | — | — | — |
| `destination_distributor_id` | `uuid` | no | — | — | — |
| `origin_assignment_id` | `uuid` | no | — | — | FK → client_distributor_assignments.id; delete restrict |
| `destination_assignment_id` | `uuid` | sí | — | — | FK → client_distributor_assignments.id; delete restrict |
| `total_due_snapshot` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `overdue_snapshot` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `client_version` | `bigInteger unsigned` | no | — | `integer` | — |
| `portfolio_version` | `bigInteger unsigned` | no | — | `integer` | — |
| `status` | `string(40)` | no | — | — | INDEX |
| `error_code` | `string(80)` | sí | — | — | — |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `reassignment()` | `BelongsTo` | `App\Modules\Mobility\Infrastructure\Persistence\Models\AdministrativeReassignment` | `administrative_reassignment_id → id` |

## BranchChangeClientItem

- Clase: `App\Modules\Mobility\Infrastructure\Persistence\Models\BranchChangeClientItem`
- Tabla: `branch_change_client_items`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `branch_change_id` | `uuid` | no | — | — | UNIQUE; FK → distributor_branch_changes.id; delete restrict |
| `client_id` | `uuid` | no | — | — | UNIQUE; FK → clients.id; delete restrict |
| `origin_distributor_id` | `uuid` | no | — | — | — |
| `destination_distributor_id` | `uuid` | sí | — | — | — |
| `administrative_reassignment_id` | `uuid` | sí | — | — | FK → administrative_reassignments.id; delete restrict |
| `status` | `string(40)` | no | — | — | — |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ClientTransfer

- Clase: `App\Modules\Mobility\Infrastructure\Persistence\Models\ClientTransfer`
- Tabla: `client_transfer_requests`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `transfer_number` | `string(40)` | no | — | — | UNIQUE |
| `client_id` | `uuid` | no | — | — | UNIQUE; FK → clients.id; delete restrict |
| `origin_distributor_id` | `uuid` | no | — | — | INDEX |
| `recipient_distributor_id` | `uuid` | no | — | — | INDEX |
| `origin_branch_id` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `origin_coordinator_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `status` | `string(40)` | no | — | `App\Modules\Mobility\Domain\Enums\ClientTransferStatus` | INDEX; INDEX |
| `total_due_snapshot` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `overdue_snapshot` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `requested_by` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → users.id; delete restrict |
| `requested_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |
| `preaccepted_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `preaccepted_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `origin_decided_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `origin_decided_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `final_accepted_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `final_accepted_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `cancelled_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `reason` | `text` | sí | — | — | — |
| `idempotency_key` | `string(150)` | no | — | — | UNIQUE |
| `request_hash` | `string(64)` | no | — | — | — |
| `client_version` | `bigInteger unsigned` | no | — | `integer` | — |
| `portfolio_version` | `bigInteger unsigned` | no | — | `integer` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `active_slot` | `boolean` | sí | `true` | `boolean` | UNIQUE |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## CoordinatorReassignmentBatch

- Clase: `App\Modules\Mobility\Infrastructure\Persistence\Models\CoordinatorReassignmentBatch`
- Tabla: `coordinator_reassignment_batches`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `batch_number` | `string(40)` | no | — | — | UNIQUE |
| `outgoing_coordinator_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `status` | `string(40)` | no | — | `App\Modules\Mobility\Domain\Enums\CoordinatorReassignmentStatus` | INDEX |
| `reason` | `text` | no | — | — | — |
| `registered_by` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → users.id; delete restrict |
| `reauthentication_id` | `bigInteger unsigned` | sí | — | — | FK → reauth_authorizations.id; delete restrict |
| `snapshot_count` | `integer unsigned` | no | — | `integer` | — |
| `current_count` | `integer unsigned` | no | `0` | `integer` | — |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `idempotency_key` | `string(150)` | no | — | — | UNIQUE |
| `request_hash` | `string(64)` | no | — | — | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `active_slot` | `boolean` | sí | `true` | `boolean` | UNIQUE |
| `created_at` | `timestampTz` | sí | — | — | INDEX |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `items()` | `HasMany` | `App\Modules\Mobility\Infrastructure\Persistence\Models\CoordinatorReassignmentItem` | `id ← batch_id` |

## CoordinatorReassignmentItem

- Clase: `App\Modules\Mobility\Infrastructure\Persistence\Models\CoordinatorReassignmentItem`
- Tabla: `coordinator_reassignment_items`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `batch_id` | `uuid` | no | — | — | UNIQUE; INDEX; FK → coordinator_reassignment_batches.id; delete restrict |
| `distributor_id` | `uuid` | no | — | — | UNIQUE |
| `origin_coordinator_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `destination_coordinator_id` | `bigInteger unsigned` | sí | — | — | INDEX; FK → users.id; delete restrict |
| `origin_assignment_id` | `uuid` | sí | — | — | — |
| `destination_assignment_id` | `uuid` | sí | — | — | — |
| `status` | `string(40)` | no | — | — | — |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## DistributorBranchChange

- Clase: `App\Modules\Mobility\Infrastructure\Persistence\Models\DistributorBranchChange`
- Tabla: `distributor_branch_changes`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `change_number` | `string(40)` | no | — | — | UNIQUE |
| `distributor_id` | `uuid` | no | — | — | UNIQUE |
| `origin_branch_id` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `destination_branch_id` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `destination_coordinator_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `status` | `string(50)` | no | — | `App\Modules\Mobility\Domain\Enums\BranchChangeStatus` | INDEX |
| `reason` | `text` | no | — | — | — |
| `requested_by` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → users.id; delete restrict |
| `authorized_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `authorized_role` | `string(40)` | sí | — | — | — |
| `reauthentication_id` | `bigInteger unsigned` | sí | — | — | FK → reauth_authorizations.id; delete restrict |
| `authorized_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `idempotency_key` | `string(150)` | no | — | — | UNIQUE |
| `request_hash` | `string(64)` | no | — | — | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `active_slot` | `boolean` | sí | `true` | `boolean` | UNIQUE |
| `created_at` | `timestampTz` | sí | — | — | INDEX |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `clientItems()` | `HasMany` | `App\Modules\Mobility\Infrastructure\Persistence\Models\BranchChangeClientItem` | `id ← branch_change_id` |

## EmailDelivery

- Clase: `App\Modules\Notification\Persistence\Models\EmailDelivery`
- Tabla: `email_deliveries`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `notification_event_id` | `uuid` | no | — | — | UNIQUE; FK → notification_events.id; delete cascade |
| `notification_recipient_id` | `uuid` | no | — | — | UNIQUE; FK → notification_recipients.id; delete cascade |
| `event_code` | `string(255)` | no | — | — | — |
| `recipient_email_snapshot` | `string(255)` | no | — | — | — |
| `subject_snapshot` | `string(255)` | no | — | — | — |
| `template_version` | `integer` | no | `1` | — | — |
| `render_context_snapshot` | `jsonb` | sí | — | `json` | — |
| `message_key` | `string(255)` | no | — | — | UNIQUE |
| `status` | `string(255)` | no | `PENDING` | — | INDEX |
| `attempt_count` | `integer` | no | `0` | — | — |
| `queued_at` | `timestamp` | sí | — | `datetime` | — |
| `sent_at` | `timestamp` | sí | — | `datetime` | — |
| `failed_at` | `timestamp` | sí | — | `datetime` | — |
| `provider_message_id` | `string(255)` | sí | — | — | — |
| `last_error_code` | `string(255)` | sí | — | — | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | INDEX |

### Relaciones

- Ninguna relación Eloquent declarada.

## EmailDeliveryAttempt

- Clase: `App\Modules\Notification\Persistence\Models\EmailDeliveryAttempt`
- Tabla: `email_delivery_attempts`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `email_delivery_id` | `uuid` | no | — | — | UNIQUE; FK → email_deliveries.id; delete cascade |
| `attempt_number` | `integer` | no | — | — | UNIQUE |
| `started_at` | `timestamp` | no | — | `datetime` | — |
| `finished_at` | `timestamp` | sí | — | `datetime` | — |
| `result` | `string(255)` | sí | — | — | — |
| `provider_message_id` | `string(255)` | sí | — | — | — |
| `error_code` | `string(255)` | sí | — | — | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## Notification

- Clase: `App\Modules\Notification\Persistence\Models\Notification`
- Tabla: `notifications`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK; INDEX; INDEX |
| `notification_event_id` | `uuid` | no | — | — | UNIQUE; FK → notification_events.id; delete cascade |
| `notification_recipient_id` | `uuid` | no | — | — | FK → notification_recipients.id; delete cascade |
| `user_id` | `uuid` | no | — | — | UNIQUE; INDEX; INDEX |
| `event_code` | `string(255)` | no | — | — | — |
| `title` | `string(255)` | no | — | — | — |
| `summary` | `text` | no | — | — | — |
| `template_version` | `integer` | no | `1` | — | — |
| `target_type` | `string(255)` | sí | — | — | — |
| `target_id` | `uuid` | sí | — | — | — |
| `status` | `string(255)` | no | `UNREAD` | — | INDEX |
| `read_at` | `timestamp` | sí | — | `datetime` | — |
| `occurred_at` | `timestamp` | no | — | `datetime` | INDEX; INDEX |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## NotificationEvent

- Clase: `App\Modules\Notification\Persistence\Models\NotificationEvent`
- Tabla: `notification_events`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `outbox_event_id` | `uuid` | no | — | — | UNIQUE |
| `event_code` | `string(255)` | no | — | — | INDEX |
| `event_version` | `integer` | no | `1` | — | — |
| `aggregate_type` | `string(255)` | no | — | — | — |
| `aggregate_id` | `uuid` | no | — | — | — |
| `branch_id` | `uuid` | sí | — | — | — |
| `actor_user_id` | `uuid` | sí | — | — | — |
| `authorizer_user_id` | `uuid` | sí | — | — | — |
| `correlation_id` | `string(255)` | sí | — | — | — |
| `causation_id` | `uuid` | sí | — | — | — |
| `occurred_at` | `timestamp` | no | — | `datetime` | INDEX |
| `payload_snapshot` | `jsonb` | sí | — | `json` | — |
| `processing_status` | `string(255)` | no | `RECEIVED` | — | INDEX |
| `last_error_code` | `string(255)` | sí | — | — | — |
| `processed_at` | `timestamp` | sí | — | `datetime` | — |
| `created_at` | `timestamp` | sí | — | — | INDEX |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## NotificationRecipient

- Clase: `App\Modules\Notification\Persistence\Models\NotificationRecipient`
- Tabla: `notification_recipients`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `notification_event_id` | `uuid` | no | — | — | UNIQUE; FK → notification_events.id; delete cascade |
| `recipient_key` | `string(255)` | no | — | — | UNIQUE |
| `recipient_type` | `string(255)` | no | — | — | — |
| `user_id` | `uuid` | sí | — | — | — |
| `application_id` | `uuid` | sí | — | — | — |
| `email_snapshot` | `string(255)` | sí | — | — | — |
| `role_snapshot` | `string(255)` | sí | — | — | — |
| `branch_id_snapshot` | `uuid` | sí | — | — | — |
| `resolution_reasons` | `json` | sí | — | `json` | — |
| `resolved_at` | `timestamp` | sí | — | `datetime` | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## BankImportModel

- Clase: `App\Modules\Payment\Infrastructure\Persistence\Eloquent\Models\BankImportModel`
- Tabla: `bank_imports`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `uploaded_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `media_file_id` | `string(160)` | no | — | — | — |
| `business_date` | `date` | no | — | `immutable_date` | INDEX |
| `file_hash` | `char(64)` | no | — | — | INDEX |
| `original_name` | `string(255)` | no | — | — | — |
| `status` | `string(24)` | no | — | `App\Modules\Payment\Domain\Enums\BankImportStatus` | INDEX |
| `total_rows` | `bigInteger unsigned` | no | `0` | — | — |
| `valid_rows` | `bigInteger unsigned` | no | `0` | — | — |
| `invalid_rows` | `bigInteger unsigned` | no | `0` | — | — |
| `reconciled_rows` | `bigInteger unsigned` | no | `0` | — | — |
| `unreconciled_rows` | `bigInteger unsigned` | no | `0` | — | — |
| `duplicate_rows` | `bigInteger unsigned` | no | `0` | — | — |
| `headers` | `json` | sí | — | `array` | — |
| `file_metadata` | `json` | sí | — | `array` | — |
| `error_summary` | `json` | sí | — | `array` | — |
| `repeated_of_id` | `uuid` | sí | — | — | FK → bank_imports.id; delete restrict |
| `processing_started_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `processing_finished_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `retry_count` | `integer unsigned` | no | `0` | — | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | INDEX; INDEX |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `movements()` | `HasMany` | `App\Modules\Payment\Infrastructure\Persistence\Eloquent\Models\BankMovementModel` | `id ← bank_import_id` |

## BankMovementModel

- Clase: `App\Modules\Payment\Infrastructure\Persistence\Eloquent\Models\BankMovementModel`
- Tabla: `bank_movements`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `bank_import_id` | `uuid` | no | — | — | UNIQUE; INDEX; FK → bank_imports.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `row_number` | `bigInteger unsigned` | no | — | — | UNIQUE |
| `payment_reference_raw` | `string(255)` | sí | — | — | — |
| `payment_reference_normalized` | `string(255)` | sí | — | — | INDEX |
| `amount` | `decimal(18,4)` | sí | — | `decimal:4` | — |
| `paid_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `bank_folio_raw` | `string(160)` | sí | — | — | — |
| `bank_folio_normalized` | `string(160)` | sí | — | — | — |
| `bank_folio_scope` | `string(160)` | sí | — | — | — |
| `concept_raw` | `text` | sí | — | — | — |
| `raw_payload` | `json` | no | — | `array` | — |
| `normalized_payload` | `json` | sí | — | `array` | — |
| `status` | `string(28)` | no | — | `App\Modules\Payment\Domain\Enums\BankMovementStatus` | INDEX; INDEX |
| `validation_errors` | `json` | sí | — | `array` | — |
| `matched_relation_id` | `string(128)` | sí | — | — | — |
| `duplicate_of_id` | `uuid` | sí | — | — | FK → bank_movements.id; delete restrict |
| `result_reason` | `text` | sí | — | — | — |
| `processed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `bankImport()` | `BelongsTo` | `App\Modules\Payment\Infrastructure\Persistence\Eloquent\Models\BankImportModel` | `bank_import_id → id` |
| `allocation()` | `HasOne` | `App\Modules\Payment\Infrastructure\Persistence\Eloquent\Models\PaymentAllocationModel` | `id ← bank_movement_id` |

## ClarificationModel

- Clase: `App\Modules\Payment\Infrastructure\Persistence\Eloquent\Models\ClarificationModel`
- Tabla: `payment_clarifications`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `case_number` | `string(40)` | no | — | — | UNIQUE |
| `distributor_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `relation_id` | `string(128)` | sí | — | — | — |
| `reported_amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `reported_date` | `date` | no | — | `immutable_date` | — |
| `reported_reference` | `string(255)` | no | — | — | — |
| `reported_bank_folio` | `string(160)` | sí | — | — | — |
| `description` | `text` | no | — | — | — |
| `evidence_media_file_id` | `string(160)` | no | — | — | — |
| `status` | `string(32)` | no | — | `App\Modules\Payment\Domain\Enums\ClarificationStatus` | INDEX |
| `linked_movement_id` | `uuid` | sí | — | — | FK → bank_movements.id; delete restrict |
| `created_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `reviewed_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `reviewed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | INDEX; INDEX |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ExcessBalanceModel

- Clase: `App\Modules\Payment\Infrastructure\Persistence\Eloquent\Models\ExcessBalanceModel`
- Tabla: `excess_balances`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `distributor_id` | `bigInteger unsigned` | no | — | — | INDEX; INDEX; FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; INDEX; FK → branches.id; delete restrict |
| `origin_relation_id` | `string(128)` | no | — | — | — |
| `bank_movement_id` | `uuid` | no | — | — | UNIQUE; FK → bank_movements.id; delete restrict |
| `original_amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `available_amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `applied_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `reserved_refund_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `refunded_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `status` | `string(32)` | no | — | `App\Modules\Payment\Domain\Enums\ExcessBalanceStatus` | INDEX; INDEX; INDEX; INDEX |
| `decision` | `string(32)` | sí | — | — | — |
| `decided_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `decided_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | INDEX; INDEX |
| `updated_at` | `timestampTz` | sí | — | — | — |
| `public_number` | `string(32)` | sí | — | — | UNIQUE |
| `payment_allocation_id` | `uuid` | sí | — | — | UNIQUE; FK → payment_allocations.id; delete restrict |
| `retained_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `currency` | `char(3)` | no | `MXN` | — | — |
| `effective_paid_at` | `timestampTz` | sí | — | `immutable_datetime` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ManualReconciliationModel

- Clase: `App\Modules\Payment\Infrastructure\Persistence\Eloquent\Models\ManualReconciliationModel`
- Tabla: `manual_reconciliations`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `case_number` | `string(40)` | no | — | — | UNIQUE |
| `distributor_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `relation_id` | `string(128)` | no | — | — | — |
| `bank_movement_id` | `uuid` | no | — | — | INDEX; FK → bank_movements.id; delete restrict |
| `clarification_id` | `uuid` | sí | — | — | FK → payment_clarifications.id; delete restrict |
| `evidence_media_file_id` | `string(160)` | no | — | — | — |
| `status` | `string(32)` | no | — | `App\Modules\Payment\Domain\Enums\ManualReconciliationStatus` | INDEX; INDEX; INDEX |
| `reason` | `text` | no | — | — | — |
| `decision_reason` | `text` | sí | — | — | — |
| `requested_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `authorized_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `executed_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `authorization_id` | `string(160)` | sí | — | — | — |
| `requested_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |
| `decided_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `authorization_expires_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `authorization_consumed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `executed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `before_snapshot` | `json` | sí | — | `array` | — |
| `after_snapshot` | `json` | sí | — | `array` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## PaymentAllocationItemModel

- Clase: `App\Modules\Payment\Infrastructure\Persistence\Eloquent\Models\PaymentAllocationItemModel`
- Tabla: `payment_allocation_items`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `payment_allocation_id` | `uuid` | no | — | — | UNIQUE; FK → payment_allocations.id; delete restrict |
| `relation_item_id` | `string(128)` | no | — | — | UNIQUE |
| `voucher_id` | `string(128)` | no | — | — | — |
| `late_fee_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `interest_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `insurance_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `loan_commission_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `capital_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `pending_before` | `json` | no | — | `array` | — |
| `pending_after` | `json` | no | — | `array` | — |
| `created_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## PaymentAllocationModel

- Clase: `App\Modules\Payment\Infrastructure\Persistence\Eloquent\Models\PaymentAllocationModel`
- Tabla: `payment_allocations`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `relation_id` | `string(128)` | no | — | — | INDEX |
| `bank_movement_id` | `uuid` | sí | — | — | UNIQUE; FK → bank_movements.id; delete restrict |
| `excess_application_id` | `uuid` | sí | — | — | FK → excess_applications.id; delete restrict |
| `source_type` | `string(24)` | no | — | `App\Modules\Payment\Domain\Enums\PaymentSourceType` | — |
| `received_amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `applied_amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `excess_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `late_fee_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `interest_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `insurance_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `loan_commission_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `capital_amount` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `balance_before` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `balance_after` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `effective_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `applied_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `application_mode` | `string(24)` | no | — | `App\Modules\Payment\Domain\Enums\PaymentApplicationMode` | — |
| `manual_reconciliation_id` | `uuid` | sí | — | — | FK → manual_reconciliations.id; delete restrict |
| `idempotency_key` | `string(180)` | no | — | — | UNIQUE |
| `created_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `created_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `items()` | `HasMany` | `App\Modules\Payment\Infrastructure\Persistence\Eloquent\Models\PaymentAllocationItemModel` | `id ← payment_allocation_id` |

## RefundRequestModel

- Clase: `App\Modules\Payment\Infrastructure\Persistence\Eloquent\Models\RefundRequestModel`
- Tabla: `refund_requests`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `excess_balance_id` | `uuid` | no | — | — | FK → excess_balances.id; delete restrict |
| `distributor_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `amount` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `status` | `string(32)` | no | — | `App\Modules\Payment\Domain\Enums\RefundRequestStatus` | INDEX; INDEX |
| `requested_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `authorized_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `executed_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `request_reason` | `text` | sí | — | — | — |
| `decision_reason` | `text` | sí | — | — | — |
| `refund_method` | `string(80)` | sí | — | — | — |
| `refund_reference` | `string(160)` | sí | — | — | — |
| `evidence_media_file_id` | `string(160)` | sí | — | — | — |
| `requested_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |
| `decided_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |
| `request_number` | `string(32)` | sí | — | — | UNIQUE |
| `refund_date` | `date` | sí | — | `immutable_date` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## PointAccountModel

- Clase: `App\Modules\Points\Infrastructure\Persistence\Models\PointAccountModel`
- Tabla: `point_accounts`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `distributor_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → users.id; delete restrict |
| `total_points` | `bigInteger unsigned` | no | `0` | `integer` | — |
| `reserved_points` | `bigInteger unsigned` | no | `0` | `integer` | — |
| `available_points` | `bigInteger unsigned` | no | `0` | `integer` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `last_movement_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## PointLedgerEntryModel

- Clase: `App\Modules\Points\Infrastructure\Persistence\Models\PointLedgerEntryModel`
- Tabla: `points_ledger_entries`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK; INDEX |
| `point_account_id` | `uuid` | no | — | — | INDEX; FK → point_accounts.id; delete restrict |
| `distributor_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `type` | `string(40)` | no | — | `App\Modules\Points\Domain\Enums\PointLedgerType` | UNIQUE; UNIQUE |
| `direction` | `string(12)` | no | — | `App\Modules\Points\Domain\Enums\PointLedgerDirection` | — |
| `points` | `bigInteger unsigned` | no | — | `integer` | — |
| `signed_points` | `bigInteger` | no | — | `integer` | — |
| `balance_before` | `bigInteger unsigned` | no | — | `integer` | — |
| `balance_after` | `bigInteger unsigned` | no | — | `integer` | — |
| `reserved_before` | `bigInteger unsigned` | no | — | `integer` | — |
| `reserved_after` | `bigInteger unsigned` | no | — | `integer` | — |
| `relation_id` | `uuid` | sí | — | — | INDEX |
| `redemption_request_id` | `uuid` | sí | — | — | UNIQUE; FK → point_redemption_requests.id; delete restrict |
| `point_evaluation_id` | `uuid` | sí | — | — | UNIQUE; FK → relation_point_evaluations.id; delete restrict |
| `rule_code` | `string(80)` | no | — | — | — |
| `configuration_version_id` | `uuid` | sí | — | — | — |
| `reason` | `text` | no | — | — | — |
| `source_event_id` | `uuid` | no | — | — | UNIQUE |
| `branch_id_snapshot` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `actor_type` | `string(40)` | no | — | — | — |
| `actor_id` | `bigInteger unsigned` | sí | — | — | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |
| `created_at` | `timestampTz` | no | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## PointRedemptionRequestModel

- Clase: `App\Modules\Points\Infrastructure\Persistence\Models\PointRedemptionRequestModel`
- Tabla: `point_redemption_requests`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `public_folio` | `string(80)` | no | — | — | UNIQUE |
| `distributor_id` | `bigInteger unsigned` | no | — | — | UNIQUE; INDEX; FK → users.id; delete restrict |
| `point_account_id` | `uuid` | no | — | — | FK → point_accounts.id; delete restrict |
| `redemption_period_id` | `bigInteger unsigned` | no | — | — | FK → redemption_periods.id; delete restrict |
| `branch_id_snapshot` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `requested_points` | `bigInteger unsigned` | no | — | `integer` | — |
| `authorized_points` | `bigInteger unsigned` | sí | — | `integer` | — |
| `point_value_snapshot` | `decimal(19,4)` | sí | — | — | — |
| `point_value_version_id` | `uuid` | sí | — | — | — |
| `cash_amount` | `decimal(19,4)` | sí | — | — | — |
| `status` | `string(24)` | no | — | `App\Modules\Points\Domain\Enums\PointRedemptionStatus` | INDEX |
| `requested_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |
| `decided_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `authorized_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `rejected_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `decision_reason` | `text` | sí | — | — | — |
| `value_frozen_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `completed_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `delivery_method` | `string(80)` | sí | — | — | — |
| `delivery_reference` | `string(160)` | sí | — | — | — |
| `delivery_comment` | `text` | sí | — | — | — |
| `idempotency_key` | `string(150)` | no | — | — | UNIQUE |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `distributor()` | `BelongsTo` | `App\Models\User` | `distributor_id → id` |
| `branchSnapshot()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\Branch` | `branch_id_snapshot → id` |
| `period()` | `BelongsTo` | `App\Modules\Configuration\Infrastructure\Persistence\Models\RedemptionPeriodModel` | `redemption_period_id → id` |

## PointReservationModel

- Clase: `App\Modules\Points\Infrastructure\Persistence\Models\PointReservationModel`
- Tabla: `point_reservations`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `point_account_id` | `uuid` | no | — | — | INDEX; FK → point_accounts.id; delete restrict |
| `redemption_request_id` | `uuid` | no | — | — | UNIQUE; FK → point_redemption_requests.id; delete restrict |
| `points` | `bigInteger unsigned` | no | — | `integer` | — |
| `status` | `string(24)` | no | — | `App\Modules\Points\Domain\Enums\PointReservationStatus` | INDEX |
| `reserved_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `released_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `consumed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## PointsRunModel

- Clase: `App\Modules\Points\Infrastructure\Persistence\Models\PointsRunModel`
- Tabla: `points_runs`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `public_folio` | `string(80)` | no | — | — | UNIQUE |
| `period_start` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `period_end` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `status` | `string(32)` | no | — | `App\Modules\Points\Domain\Enums\PointsRunStatus` | INDEX |
| `started_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `finished_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `total_candidates` | `integer unsigned` | no | `0` | — | — |
| `processed_count` | `integer unsigned` | no | `0` | — | — |
| `earned_count` | `integer unsigned` | no | `0` | — | — |
| `penalized_count` | `integer unsigned` | no | `0` | — | — |
| `no_change_count` | `integer unsigned` | no | `0` | — | — |
| `blocked_count` | `integer unsigned` | no | `0` | — | — |
| `error_count` | `integer unsigned` | no | `0` | — | — |
| `initiated_by_type` | `string(40)` | no | — | — | — |
| `initiated_by_id` | `bigInteger unsigned` | sí | — | — | — |
| `error_summary` | `text` | sí | — | — | — |
| `created_at` | `timestampTz` | sí | — | — | INDEX |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## RelationPointEvaluationModel

- Clase: `App\Modules\Points\Infrastructure\Persistence\Models\RelationPointEvaluationModel`
- Tabla: `relation_point_evaluations`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `relation_id` | `uuid` | no | — | — | UNIQUE |
| `distributor_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `point_account_id` | `uuid` | no | — | — | FK → point_accounts.id; delete restrict |
| `classification` | `string(32)` | no | — | `App\Modules\Points\Domain\Enums\LiquidationClassification` | — |
| `effective_liquidation_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `products_capital_basis` | `decimal(19,4)` | no | — | — | — |
| `divisor_snapshot` | `decimal(19,4)` | no | — | — | — |
| `multiplier_snapshot` | `integer unsigned` | no | — | — | — |
| `penalty_rate_snapshot` | `decimal(9,6)` | no | — | — | — |
| `configuration_version_ids` | `jsonb` | no | — | `array` | — |
| `balance_before` | `bigInteger unsigned` | no | — | `integer` | — |
| `points_earned` | `bigInteger unsigned` | no | `0` | `integer` | — |
| `points_penalized` | `bigInteger unsigned` | no | `0` | `integer` | — |
| `balance_after` | `bigInteger unsigned` | no | — | `integer` | — |
| `result` | `string(48)` | no | — | `App\Modules\Points\Domain\Enums\RelationPointEvaluationResult` | INDEX |
| `source_event_id` | `uuid` | no | — | — | UNIQUE |
| `points_run_id` | `uuid` | sí | — | — | FK → points_runs.id; delete set null |
| `processed_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |
| `created_at` | `timestampTz` | no | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## CutRun

- Clase: `App\Modules\Relation\Infrastructure\Persistence\Models\CutRun`
- Tabla: `cut_runs`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `cut_date` | `date` | no | — | `date` | UNIQUE |
| `business_timezone` | `string(255)` | no | `America/Monterrey` | — | — |
| `status` | `string(255)` | no | — | `App\Modules\Relation\Domain\Enums\CutRunStatus` | — |
| `configuration_snapshot` | `json` | no | — | `array` | — |
| `started_at` | `timestamp` | sí | — | `datetime` | — |
| `completed_at` | `timestamp` | sí | — | `datetime` | — |
| `triggered_by` | `uuid` | sí | — | — | — |
| `trigger_type` | `string(255)` | no | — | — | — |
| `distributors_evaluated` | `integer unsigned` | no | `0` | `integer` | — |
| `relations_generated` | `integer unsigned` | no | `0` | `integer` | — |
| `distributors_without_items` | `integer unsigned` | no | `0` | `integer` | — |
| `failed_attempts` | `integer unsigned` | no | `0` | `integer` | — |
| `lock_version` | `integer unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `distributors()` | `HasMany` | `App\Modules\Relation\Infrastructure\Persistence\Models\CutRunDistributor` | `id ← cut_run_id` |
| `generatedRelations()` | `HasMany` | `App\Modules\Relation\Infrastructure\Persistence\Models\Relation` | `id ← cut_run_id` |

## CutRunDistributor

- Clase: `App\Modules\Relation\Infrastructure\Persistence\Models\CutRunDistributor`
- Tabla: `cut_run_distributors`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `cut_run_id` | `uuid` | no | — | — | INDEX; UNIQUE |
| `distributor_id` | `uuid` | no | — | — | INDEX; UNIQUE |
| `status` | `string(255)` | no | — | `App\Modules\Relation\Domain\Enums\CutAttemptStatus` | INDEX |
| `attempt_count` | `integer unsigned` | no | `0` | `integer` | — |
| `relation_id` | `uuid` | sí | — | — | INDEX |
| `error_code` | `string(255)` | sí | — | — | — |
| `error_context` | `json` | sí | — | `array` | — |
| `started_at` | `timestamp` | sí | — | `datetime` | — |
| `completed_at` | `timestamp` | sí | — | `datetime` | — |
| `lock_version` | `integer unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `cutRun()` | `BelongsTo` | `App\Modules\Relation\Infrastructure\Persistence\Models\CutRun` | `cut_run_id → id` |
| `relation()` | `BelongsTo` | `App\Modules\Relation\Infrastructure\Persistence\Models\Relation` | `relation_id → id` |

## Relation

- Clase: `App\Modules\Relation\Infrastructure\Persistence\Models\Relation`
- Tabla: `relations`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `cut_run_id` | `uuid` | no | — | — | INDEX |
| `distributor_id` | `uuid` | no | — | — | INDEX; UNIQUE |
| `branch_id` | `uuid` | no | — | — | INDEX |
| `coordinator_id` | `uuid` | no | — | — | INDEX |
| `cut_date` | `date` | no | — | `date` | INDEX; UNIQUE |
| `cut_at` | `timestamp` | no | — | `datetime` | — |
| `early_payment_starts_at` | `timestamp` | no | — | `datetime` | — |
| `early_payment_ends_at` | `timestamp` | no | — | `datetime` | — |
| `due_at` | `timestamp` | no | — | `datetime` | INDEX |
| `payment_reference` | `string(255)` | no | — | — | UNIQUE |
| `financial_status` | `string(255)` | no | — | `App\Modules\Relation\Domain\Enums\FinancialStatus` | INDEX |
| `under_review` | `boolean` | no | `false` | `boolean` | — |
| `payment_behavior` | `string(255)` | no | — | `App\Modules\Relation\Domain\Enums\PaymentBehavior` | INDEX |
| `portfolio_total` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `initial_misvales_due_total` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `surcharge_total` | `decimal(19,4)` | no | `0` | `decimal:4` | — |
| `applied_payments_total` | `decimal(19,4)` | no | `0` | `decimal:4` | — |
| `outstanding_balance` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `products_capital_basis` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `published_at` | `timestamp` | sí | — | `datetime` | — |
| `lock_version` | `integer unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `cutRun()` | `BelongsTo` | `App\Modules\Relation\Infrastructure\Persistence\Models\CutRun` | `cut_run_id → id` |
| `snapshot()` | `HasOne` | `App\Modules\Relation\Infrastructure\Persistence\Models\RelationSnapshot` | `id ← relation_id` |
| `items()` | `HasMany` | `App\Modules\Relation\Infrastructure\Persistence\Models\RelationItem` | `id ← relation_id` |
| `documents()` | `HasMany` | `App\Modules\Relation\Infrastructure\Persistence\Models\RelationDocument` | `id ← relation_id` |

## RelationDocument

- Clase: `App\Modules\Relation\Infrastructure\Persistence\Models\RelationDocument`
- Tabla: `relation_documents`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `relation_id` | `uuid` | no | — | — | INDEX; UNIQUE |
| `document_version` | `integer unsigned` | no | — | `integer` | UNIQUE |
| `status` | `string(255)` | no | — | `App\Modules\Relation\Domain\Enums\RelationDocumentStatus` | — |
| `storage_key` | `string(255)` | sí | — | — | — |
| `mime_type` | `string(255)` | sí | — | — | — |
| `size_bytes` | `integer unsigned` | sí | — | `integer` | — |
| `sha256` | `string(255)` | sí | — | — | — |
| `generated_at` | `timestamp` | sí | — | `datetime` | — |
| `error_code` | `string(255)` | sí | — | — | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `relation()` | `BelongsTo` | `App\Modules\Relation\Infrastructure\Persistence\Models\Relation` | `relation_id → id` |

## RelationItem

- Clase: `App\Modules\Relation\Infrastructure\Persistence\Models\RelationItem`
- Tabla: `relation_items`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `relation_id` | `uuid` | no | — | — | INDEX; UNIQUE |
| `voucher_installment_id` | `uuid` | no | — | — | UNIQUE |
| `voucher_id` | `uuid` | no | — | — | INDEX; UNIQUE |
| `client_id` | `uuid` | no | — | — | INDEX |
| `payment_number` | `integer unsigned` | no | — | `integer` | UNIQUE |
| `total_payments` | `integer unsigned` | no | — | `integer` | — |
| `product_snapshot` | `json` | no | — | `array` | — |
| `category_snapshot` | `json` | no | — | `array` | — |
| `capital_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `loan_commission_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `interest_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `insurance_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `distributor_profit_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `base_payment_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `client_charge_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `misvales_due_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `surcharge_amount` | `decimal(19,4)` | no | `0` | `decimal:4` | — |
| `applied_amount` | `decimal(19,4)` | no | `0` | `decimal:4` | — |
| `outstanding_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `sort_order` | `integer unsigned` | no | — | `integer` | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `relation()` | `BelongsTo` | `App\Modules\Relation\Infrastructure\Persistence\Models\Relation` | `relation_id → id` |

## RelationSnapshot

- Clase: `App\Modules\Relation\Infrastructure\Persistence\Models\RelationSnapshot`
- Tabla: `relation_snapshots`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `relation_id` | `uuid` | no | — | — | UNIQUE |
| `distributor_number` | `string(255)` | no | — | — | — |
| `distributor_name` | `string(255)` | no | — | — | — |
| `distributor_address_snapshot` | `text` | no | — | — | — |
| `branch_snapshot` | `string(255)` | no | — | — | — |
| `coordinator_snapshot` | `string(255)` | no | — | — | — |
| `total_credit_line` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `used_balance` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `available_balance` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `points_balance` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `timezone` | `string(255)` | no | — | — | — |
| `configuration_versions` | `json` | no | — | `array` | — |
| `payment_beneficiary` | `string(255)` | sí | — | — | — |
| `payment_bank` | `string(255)` | sí | — | — | — |
| `payment_agreement` | `string(255)` | sí | — | — | — |
| `payment_clabe` | `string(255)` | sí | — | — | — |
| `engine_version` | `string(255)` | no | — | — | — |
| `precision` | `integer` | no | `4` | `integer` | — |
| `rounding_rule` | `string(255)` | no | `HALF_UP` | — | — |
| `created_at` | `timestamp` | sí | — | — | — |
| `updated_at` | `timestamp` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `relation()` | `BelongsTo` | `App\Modules\Relation\Infrastructure\Persistence\Models\Relation` | `relation_id → id` |

## ReportOutboxEvent

- Clase: `App\Modules\Reporting\Infrastructure\Persistence\Models\ReportOutboxEvent`
- Tabla: `report_outbox_events`
- Clave primaria: `event_id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `event_id` | `uuid` | no | — | — | PK |
| `event_name` | `string(80)` | no | — | — | — |
| `aggregate_id` | `uuid` | sí | — | — | — |
| `report_code` | `string(80)` | sí | — | — | — |
| `actor_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete set null |
| `scope_type` | `string(20)` | sí | — | — | — |
| `correlation_id` | `uuid` | no | — | — | — |
| `payload` | `json` | no | — | `array` | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `published_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `attempts` | `smallInteger unsigned` | no | `0` | `integer` | — |
| `last_error` | `text` | sí | — | — | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## ReportQueryEvent

- Clase: `App\Modules\Reporting\Infrastructure\Persistence\Models\ReportQueryEvent`
- Tabla: `report_query_events`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `actor_id` | `bigInteger unsigned` | sí | — | — | INDEX; FK → users.id; delete set null |
| `actor_role` | `string(40)` | sí | — | — | — |
| `report_code` | `string(80)` | sí | — | — | INDEX |
| `scope_type` | `string(20)` | sí | — | — | — |
| `filters_hash` | `char(64)` | sí | — | — | — |
| `outcome` | `string(20)` | no | — | — | — |
| `rows_returned` | `bigInteger unsigned` | sí | — | `integer` | — |
| `session_id` | `string(255)` | sí | — | — | — |
| `run_id` | `uuid` | sí | — | — | — |
| `correlation_id` | `uuid` | no | — | — | — |
| `error_code` | `string(80)` | sí | — | — | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |

### Relaciones

- Ninguna relación Eloquent declarada.

## ReportRun

- Clase: `App\Modules\Reporting\Infrastructure\Persistence\Models\ReportRun`
- Tabla: `report_runs`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `run_number` | `string(40)` | no | — | — | UNIQUE |
| `report_code` | `string(80)` | no | — | `App\Modules\Reporting\Domain\Enums\ReportCode` | INDEX |
| `contract_version` | `smallInteger unsigned` | no | — | `integer` | — |
| `status` | `string(16)` | no | — | `App\Modules\Reporting\Domain\Enums\ReportRunStatus` | INDEX |
| `requested_by` | `bigInteger unsigned` | no | — | — | UNIQUE; INDEX; FK → users.id; delete restrict |
| `requested_role` | `string(40)` | no | — | — | — |
| `scope_type` | `string(20)` | no | — | `App\Modules\Reporting\Domain\Enums\ReportScopeType` | — |
| `scope_snapshot` | `json` | no | — | `array` | — |
| `filters_json` | `json` | no | — | `array` | — |
| `filters_hash` | `char(64)` | no | — | — | — |
| `idempotency_key` | `string(128)` | no | — | — | UNIQUE |
| `queued_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `started_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `failed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `expires_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `as_of` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `row_count` | `bigInteger unsigned` | sí | — | `integer` | — |
| `result_location` | `string(255)` | sí | — | — | — |
| `error_code` | `string(80)` | sí | — | — | — |
| `correlation_id` | `uuid` | no | — | — | — |
| `created_at` | `timestampTz` | sí | — | — | INDEX; INDEX |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `requester()` | `BelongsTo` | `App\Models\User` | `requested_by → id` |
| `results()` | `HasMany` | `App\Modules\Reporting\Infrastructure\Persistence\Models\ReportRunResult` | `id ← report_run_id` |

## ReportRunResult

- Clase: `App\Modules\Reporting\Infrastructure\Persistence\Models\ReportRunResult`
- Tabla: `report_run_results`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `report_run_id` | `uuid` | no | — | — | UNIQUE; FK → report_runs.id; delete cascade |
| `block_number` | `integer unsigned` | no | — | `integer` | UNIQUE |
| `row_count` | `integer unsigned` | no | — | `integer` | — |
| `payload_protected` | `text` | no | — | `encrypted:array` | — |
| `payload_hash` | `char(64)` | no | — | — | — |
| `expires_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `run()` | `BelongsTo` | `App\Modules\Reporting\Infrastructure\Persistence\Models\ReportRun` | `report_run_id → id` |

## DelinquencyDecision

- Clase: `App\Modules\RiskDelinquency\Infrastructure\Persistence\Models\DelinquencyDecision`
- Tabla: `delinquency_decisions`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `decision_number` | `uuid` | no | — | — | UNIQUE |
| `distributor_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `risk_alert_id` | `uuid` | no | — | — | UNIQUE; FK → risk_alerts.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `decision` | `string(32)` | no | `APPLIED` | — | — |
| `decided_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `decided_role` | `string(64)` | no | — | — | — |
| `reauthentication_id` | `bigInteger unsigned` | sí | — | — | FK → reauth_authorizations.id; delete restrict |
| `overdue_balance_snapshot` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `reason` | `text` | sí | — | — | — |
| `before_snapshot` | `json` | no | — | `array` | — |
| `after_snapshot` | `json` | no | — | `array` | — |
| `decided_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `idempotency_key` | `string(200)` | no | — | — | UNIQUE |
| `created_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## DelinquencyRemovalRequest

- Clase: `App\Modules\RiskDelinquency\Infrastructure\Persistence\Models\DelinquencyRemovalRequest`
- Tabla: `delinquency_removal_requests`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `request_number` | `uuid` | no | — | — | UNIQUE |
| `distributor_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `coordinator_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `delinquency_decision_id` | `uuid` | no | — | — | FK → delinquency_decisions.id; delete restrict |
| `status` | `string(32)` | no | — | `App\Modules\RiskDelinquency\Domain\Enums\RemovalRequestStatus` | INDEX; INDEX |
| `overdue_balance_snapshot` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `prepared_reason` | `text` | sí | — | — | — |
| `decided_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `decided_role` | `string(64)` | sí | — | — | — |
| `decision_reason` | `text` | sí | — | — | — |
| `reauthentication_id` | `bigInteger unsigned` | sí | — | — | FK → reauth_authorizations.id; delete restrict |
| `prepared_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `decided_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `invalidated_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `idempotency_key` | `string(200)` | no | — | — | UNIQUE |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## DistributorRiskProfile

- Clase: `App\Modules\RiskDelinquency\Infrastructure\Persistence\Models\DistributorRiskProfile`
- Tabla: `distributor_risk_profiles`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `distributor_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → users.id; delete restrict |
| `current_branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `current_coordinator_id` | `bigInteger unsigned` | sí | — | — | INDEX; FK → users.id; delete restrict |
| `consecutive_breaches` | `integer unsigned` | no | `0` | `integer` | INDEX |
| `last_evaluated_relation_id` | `uuid` | sí | — | — | — |
| `last_evaluated_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `overdue_balance` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `financially_regularized_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `delinquency_status` | `string(40)` | no | `NOT_DELINQUENT` | `App\Modules\RiskDelinquency\Domain\Enums\DelinquencyStatus` | INDEX |
| `blocked_for_new_vouchers` | `boolean` | no | `false` | `boolean` | — |
| `delinquency_applied_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `profile_status` | `string(40)` | no | `CURRENT` | `App\Modules\RiskDelinquency\Domain\Enums\RiskProfileStatus` | — |
| `lock_version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `distributor()` | `BelongsTo` | `App\Models\User` | `distributor_id → id` |
| `branch()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\Branch` | `current_branch_id → id` |
| `coordinator()` | `BelongsTo` | `App\Models\User` | `current_coordinator_id → id` |

## RelationRiskEvaluation

- Clase: `App\Modules\RiskDelinquency\Infrastructure\Persistence\Models\RelationRiskEvaluation`
- Tabla: `relation_risk_evaluations`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `relation_id` | `uuid` | no | — | — | UNIQUE |
| `distributor_id` | `bigInteger unsigned` | no | — | — | INDEX; INDEX; FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `cut_id` | `string(100)` | no | — | — | — |
| `cut_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `due_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `source_result` | `string(24)` | sí | — | `App\Modules\RiskDelinquency\Domain\Enums\FinancialResult` | — |
| `overdue_balance_snapshot` | `decimal(18,4)` | no | `0` | `decimal:4` | — |
| `evaluation_status` | `string(32)` | no | — | `App\Modules\RiskDelinquency\Domain\Enums\RelationRiskEvaluationStatus` | INDEX |
| `source_version` | `string(100)` | no | — | — | UNIQUE |
| `sequence_position` | `integer unsigned` | sí | — | `integer` | — |
| `evaluated_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `supersedes_id` | `uuid` | sí | — | — | INDEX |
| `idempotency_key` | `string(200)` | no | — | — | UNIQUE |
| `created_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## RiskAlert

- Clase: `App\Modules\RiskDelinquency\Infrastructure\Persistence\Models\RiskAlert`
- Tabla: `risk_alerts`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `alert_number` | `uuid` | no | — | — | UNIQUE |
| `distributor_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `coordinator_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `risk_sequence_id` | `uuid` | no | — | — | FK → risk_sequences.id; delete restrict |
| `alert_type` | `string(32)` | no | — | `App\Modules\RiskDelinquency\Domain\Enums\RiskAlertType` | — |
| `breach_count` | `integer unsigned` | no | — | `integer` | — |
| `overdue_balance_snapshot` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `status` | `string(40)` | no | — | `App\Modules\RiskDelinquency\Domain\Enums\RiskAlertStatus` | INDEX |
| `detected_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX |
| `resolved_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `idempotency_key` | `string(200)` | no | — | — | UNIQUE |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `relations()` | `HasMany` | `App\Modules\RiskDelinquency\Infrastructure\Persistence\Models\RiskAlertRelation` | `id ← risk_alert_id` |

## RiskAlertRelation

- Clase: `App\Modules\RiskDelinquency\Infrastructure\Persistence\Models\RiskAlertRelation`
- Tabla: `risk_alert_relations`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `risk_alert_id` | `uuid` | no | — | — | UNIQUE; FK → risk_alerts.id; delete restrict |
| `evaluation_id` | `uuid` | no | — | — | FK → relation_risk_evaluations.id; delete restrict |
| `relation_id` | `uuid` | no | — | — | UNIQUE |
| `position` | `integer unsigned` | no | — | `integer` | — |
| `cut_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `due_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `source_result` | `string(24)` | no | — | `App\Modules\RiskDelinquency\Domain\Enums\FinancialResult` | — |
| `overdue_balance_snapshot` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `source_version` | `string(100)` | no | — | — | — |
| `created_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## RiskSequence

- Clase: `App\Modules\RiskDelinquency\Infrastructure\Persistence\Models\RiskSequence`
- Tabla: `risk_sequences`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `distributor_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `status` | `string(40)` | no | — | `App\Modules\RiskDelinquency\Domain\Enums\RiskSequenceStatus` | INDEX |
| `started_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `last_incorporated_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `breach_count` | `integer unsigned` | no | `0` | `integer` | — |
| `reset_reason` | `string(80)` | sí | — | — | — |
| `breaking_relation_id` | `uuid` | sí | — | — | — |
| `regularized_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `version` | `bigInteger unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `relations()` | `HasMany` | `App\Modules\RiskDelinquency\Infrastructure\Persistence\Models\RiskSequenceRelation` | `id ← risk_sequence_id` |

## RiskSequenceRelation

- Clase: `App\Modules\RiskDelinquency\Infrastructure\Persistence\Models\RiskSequenceRelation`
- Tabla: `risk_sequence_relations`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `risk_sequence_id` | `uuid` | no | — | — | UNIQUE; UNIQUE; FK → risk_sequences.id; delete restrict |
| `evaluation_id` | `uuid` | no | — | — | FK → relation_risk_evaluations.id; delete restrict |
| `relation_id` | `uuid` | no | — | — | UNIQUE |
| `position` | `integer unsigned` | no | — | `integer` | UNIQUE |
| `overdue_balance_snapshot` | `decimal(18,4)` | no | — | `decimal:4` | — |
| `source_result` | `string(24)` | no | — | `App\Modules\RiskDelinquency\Domain\Enums\FinancialResult` | — |
| `created_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## AuthorizationTokenModel

- Clase: `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\AuthorizationTokenModel`
- Tabla: `authorization_tokens`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `data_change_request_id` | `uuid` | no | — | — | UNIQUE; FK → data_change_requests.id; delete restrict |
| `token_hash` | `char(64)` | no | — | — | UNIQUE |
| `cashier_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `voucher_id` | `uuid` | no | — | — | FK → vouchers.id; delete restrict |
| `client_id` | `uuid` | no | — | — | FK → clients.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `operation` | `string(80)` | no | — | `App\Modules\Voucher\Domain\Enums\DataChangeOperation` | — |
| `field_scope` | `json` | no | — | `array` | — |
| `issued_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `issued_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `expires_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `consumed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `revoked_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## DataChangeRequestModel

- Clase: `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\DataChangeRequestModel`
- Tabla: `data_change_requests`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `voucher_id` | `uuid` | no | — | — | INDEX; FK → vouchers.id; delete restrict |
| `client_id` | `uuid` | no | — | — | FK → clients.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `requested_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `operation` | `string(80)` | no | — | `App\Modules\Voucher\Domain\Enums\DataChangeOperation` | — |
| `authorized_fields` | `json` | no | — | `array` | — |
| `reason` | `string(500)` | no | — | — | — |
| `status` | `string(32)` | no | — | `App\Modules\Voucher\Domain\Enums\DataChangeRequestStatus` | INDEX; INDEX |
| `decided_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `decision_reason` | `string(500)` | sí | — | — | — |
| `requested_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `decided_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `used_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `expired_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `target_lock_versions` | `json` | no | — | `array` | — |
| `lock_version` | `integer unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## VoucherAuditModel

- Clase: `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherAuditModel`
- Tabla: `voucher_audits`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `event_type` | `string(120)` | no | — | — | — |
| `result` | `string(32)` | no | — | — | — |
| `voucher_id` | `uuid` | sí | — | — | INDEX |
| `actor_id` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `effective_role` | `string(64)` | sí | — | — | — |
| `branch_id` | `bigInteger unsigned` | sí | — | — | FK → branches.id; delete restrict |
| `request_id` | `uuid` | sí | — | — | — |
| `ip_hash` | `string(64)` | sí | — | — | — |
| `user_agent_hash` | `string(64)` | sí | — | — | — |
| `idempotency_key_hmac` | `char(64)` | sí | — | — | — |
| `protected_context` | `json` | no | — | `array` | — |
| `error_code` | `string(100)` | sí | — | — | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## VoucherChangeHistoryModel

- Clase: `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherChangeHistoryModel`
- Tabla: `voucher_change_history`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `data_change_request_id` | `uuid` | no | — | — | UNIQUE; FK → data_change_requests.id; delete restrict |
| `authorization_token_id` | `uuid` | no | — | — | FK → authorization_tokens.id; delete restrict |
| `client_id` | `uuid` | no | — | — | FK → clients.id; delete restrict |
| `record_type` | `string(80)` | no | — | — | — |
| `record_id` | `uuid` | sí | — | — | — |
| `field_identifier` | `string(160)` | no | — | — | UNIQUE |
| `previous_value_encrypted` | `text` | no | — | — | — |
| `new_value_encrypted` | `text` | no | — | — | — |
| `executed_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `authorized_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `request_id` | `uuid` | no | — | — | — |
| `changed_at` | `timestampTz` | no | — | — | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## VoucherFinancialSnapshotModel

- Clase: `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherFinancialSnapshotModel`
- Tabla: `voucher_financial_snapshots`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `voucher_id` | `uuid` | no | — | — | UNIQUE; FK → vouchers.id; delete restrict |
| `product_id` | `uuid` | no | — | — | — |
| `product_version_id` | `uuid` | no | — | — | — |
| `product_version` | `integer unsigned` | no | — | `integer` | — |
| `product_name` | `string(255)` | no | — | — | — |
| `capital_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `loan_commission_rate` | `decimal(9,6)` | no | — | `decimal:6` | — |
| `loan_commission_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `fortnightly_interest_rate` | `decimal(9,6)` | no | — | `decimal:6` | — |
| `total_interest_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `insurance_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `fortnights` | `smallInteger unsigned` | no | — | `integer` | — |
| `category_id` | `uuid` | no | — | — | — |
| `category_version_id` | `uuid` | no | — | — | — |
| `category_version` | `integer unsigned` | no | — | `integer` | — |
| `category_name` | `string(255)` | no | — | — | — |
| `distributor_profit_rate` | `decimal(9,6)` | no | — | `decimal:6` | — |
| `distributor_profit_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `misvales_total` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `base_installment_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `profit_installment_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `client_installment_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `client_total` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `calculation_version` | `string(20)` | no | — | — | — |
| `internal_precision` | `smallInteger unsigned` | no | — | `integer` | — |
| `rounding_rule` | `string(40)` | no | — | — | — |
| `created_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `voucher()` | `BelongsTo` | `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherModel` | `voucher_id → id` |

## VoucherFulfillmentModel

- Clase: `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherFulfillmentModel`
- Tabla: `voucher_fulfillments`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `voucher_id` | `uuid` | no | — | — | UNIQUE; FK → vouchers.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | FK → branches.id; delete restrict |
| `client_bank_account_id` | `uuid` | no | — | — | FK → client_bank_accounts.id; delete restrict |
| `capital_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `transaction_number_encrypted` | `text` | sí | — | — | — |
| `transaction_number_hmac` | `char(64)` | sí | — | — | UNIQUE |
| `released_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `released_at` | `timestampTz` | no | — | `immutable_datetime` | — |
| `fulfilled_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `fulfilled_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `lock_version` | `integer unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## VoucherIdempotencyModel

- Clase: `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherIdempotencyModel`
- Tabla: `voucher_idempotency_keys`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `actor_id` | `bigInteger unsigned` | no | — | — | UNIQUE; FK → users.id; delete restrict |
| `operation` | `string(100)` | no | — | — | UNIQUE |
| `key_hmac` | `char(64)` | no | — | — | UNIQUE |
| `request_hash` | `char(64)` | no | — | — | — |
| `response_status` | `smallInteger unsigned` | sí | — | — | — |
| `response_payload` | `json` | sí | — | `array` | — |
| `completed_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## VoucherInstallmentModel

- Clase: `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherInstallmentModel`
- Tabla: `voucher_installments`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: no

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `voucher_id` | `uuid` | no | — | — | UNIQUE; FK → vouchers.id; delete restrict |
| `payment_number` | `smallInteger unsigned` | no | — | `integer` | UNIQUE |
| `total_payments` | `smallInteger unsigned` | no | — | `integer` | — |
| `capital_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `loan_commission_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `interest_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `insurance_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `base_payment_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `distributor_profit_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `client_total_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `misvales_due_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `relation_status` | `string(30)` | no | `PENDIENTE` | — | INDEX |
| `relation_item_id` | `uuid` | sí | — | — | INDEX |
| `created_at` | `timestampTz` | no | — | `immutable_datetime` | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `voucher()` | `BelongsTo` | `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherModel` | `voucher_id → id` |

## VoucherModel

- Clase: `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherModel`
- Tabla: `vouchers`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `folio` | `string(64)` | no | — | — | UNIQUE |
| `type` | `string(20)` | no | — | `App\Modules\Voucher\Domain\Enums\VoucherType` | INDEX |
| `status` | `string(32)` | no | — | `App\Modules\Voucher\Domain\Enums\VoucherStatus` | INDEX; INDEX; INDEX |
| `distributor_id` | `uuid` | no | — | — | INDEX; FK → distributors.id; delete restrict |
| `distributor_user_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → users.id; delete restrict |
| `client_id` | `uuid` | no | — | — | INDEX; FK → clients.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | — | INDEX; FK → branches.id; delete restrict |
| `product_id` | `uuid` | no | — | — | INDEX; FK → products.public_id; delete restrict |
| `product_version_id` | `uuid` | no | — | — | FK → product_versions.public_id; delete restrict |
| `category_id` | `uuid` | no | — | — | FK → categories.public_id; delete restrict |
| `category_version_id` | `uuid` | no | — | — | FK → category_versions.public_id; delete restrict |
| `credit_line_id` | `bigInteger unsigned` | no | — | — | FK → credit_lines.id; delete restrict |
| `credit_usage_restriction_id` | `bigInteger unsigned` | sí | — | — | FK → credit_usage_restrictions.id; delete restrict |
| `capital_amount` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `credit_available_snapshot` | `decimal(19,4)` | no | — | `decimal:4` | — |
| `restriction_reference_snapshot` | `decimal(19,4)` | sí | — | `decimal:4` | — |
| `restriction_minimum_snapshot` | `decimal(19,4)` | sí | — | `decimal:4` | — |
| `restriction_maximum_snapshot` | `decimal(19,4)` | sí | — | `decimal:4` | — |
| `financial_snapshot` | `json` | no | — | `array` | — |
| `client_name_snapshot` | `string(360)` | no | — | — | — |
| `client_name_normalized` | `string(360)` | no | — | — | INDEX |
| `generated_by` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `generated_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX; INDEX; INDEX; INDEX; INDEX; INDEX |
| `lock_version` | `integer unsigned` | no | `1` | `integer` | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |
| `opened_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `opened_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `released_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `released_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `rejected_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `rejected_at` | `timestampTz` | sí | — | `immutable_datetime` | — |
| `rejection_reason_code` | `string(64)` | sí | — | — | — |
| `rejection_description` | `string(500)` | sí | — | — | — |
| `fulfilled_by` | `bigInteger unsigned` | sí | — | — | FK → users.id; delete restrict |
| `fulfilled_at` | `timestampTz` | sí | — | `immutable_datetime` | — |

### Relaciones

| Método | Tipo | Clase relacionada | Llaves |
| --- | --- | --- | --- |
| `client()` | `BelongsTo` | `App\Modules\Client\Persistence\Models\Client` | `client_id → id` |
| `distributor()` | `BelongsTo` | `App\Modules\Distributor\Persistence\Models\Distributor` | `distributor_id → id` |
| `branch()` | `BelongsTo` | `App\Modules\Access\Infrastructure\Persistence\Models\Branch` | `branch_id → id` |
| `generator()` | `BelongsTo` | `App\Models\User` | `generated_by → id` |
| `creditLine()` | `BelongsTo` | `App\Modules\Credit\Infrastructure\Persistence\Eloquent\Models\CreditLineModel` | `credit_line_id → id` |
| `creditRestriction()` | `BelongsTo` | `App\Modules\Credit\Infrastructure\Persistence\Eloquent\Models\CreditUsageRestrictionModel` | `credit_usage_restriction_id → id` |
| `financialSnapshot()` | `HasOne` | `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherFinancialSnapshotModel` | `id ← voucher_id` |
| `installments()` | `HasMany` | `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherInstallmentModel` | `id ← voucher_id` |

## VoucherOperationHistoryModel

- Clase: `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherOperationHistoryModel`
- Tabla: `voucher_operation_history`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `voucher_id` | `uuid` | no | — | — | INDEX |
| `operation` | `string(100)` | no | — | — | — |
| `status_before` | `string(32)` | sí | — | — | — |
| `status_after` | `string(32)` | sí | — | — | — |
| `actor_id` | `bigInteger unsigned` | no | — | — | FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | sí | — | — | FK → branches.id; delete restrict |
| `protected_context` | `json` | no | — | `array` | — |
| `request_id` | `uuid` | no | — | — | — |
| `idempotency_key_hmac` | `char(64)` | sí | — | — | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## VoucherOutboxEventModel

- Clase: `App\Modules\Voucher\Infrastructure\Persistence\Eloquent\Models\VoucherOutboxEventModel`
- Tabla: `voucher_outbox_events`
- Clave primaria: `id` (string; no incremental)
- Timestamps Eloquent: sí

### Campos

| Campo | Tipo SQL | Nulo | Default | Cast Eloquent | Claves |
| --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | — | PK |
| `aggregate_id` | `uuid` | no | — | — | — |
| `aggregate_type` | `string(80)` | no | `VOUCHER` | — | — |
| `event_type` | `string(120)` | no | — | — | — |
| `event_key` | `string(190)` | no | — | — | UNIQUE |
| `payload` | `json` | no | — | `array` | — |
| `occurred_at` | `timestampTz` | no | — | `immutable_datetime` | INDEX |
| `published_at` | `timestampTz` | sí | — | `immutable_datetime` | INDEX |
| `attempts` | `integer unsigned` | no | `0` | — | — |
| `created_at` | `timestampTz` | sí | — | — | — |
| `updated_at` | `timestampTz` | sí | — | — | — |

### Relaciones

- Ninguna relación Eloquent declarada.

## Tablas sin modelo Eloquent

### bank_folio_reservations

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `folio_scope` | `string(160)` | no | — | UNIQUE |
| `normalized_folio` | `string(160)` | no | — | UNIQUE |
| `first_movement_id` | `uuid` | no | — | UNIQUE; FK → bank_movements.id; delete restrict |
| `reserved_at` | `timestampTz` | no | — | — |

### cache

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `key` | `string(255)` | no | — | PK |
| `value` | `mediumText` | no | — | — |
| `expiration` | `bigInteger` | no | — | INDEX |

### cache_locks

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `key` | `string(255)` | no | — | PK |
| `owner` | `string(255)` | no | — | — |
| `expiration` | `bigInteger` | no | — | INDEX |

### client_audits

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `client_id` | `uuid` | sí | — | INDEX; FK → clients.id; delete restrict |
| `event_type` | `string(100)` | no | — | INDEX |
| `actor_user_id` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `requested_by` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `authorized_by` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `auth_session_id` | `bigInteger unsigned` | sí | — | FK → auth_sessions.id; delete restrict |
| `actor_role` | `string(40)` | sí | — | — |
| `branch_id` | `bigInteger unsigned` | sí | — | FK → branches.id; delete restrict |
| `distributor_id` | `uuid` | sí | — | — |
| `related_operation_id` | `uuid` | sí | — | — |
| `changed_fields` | `jsonb` | sí | — | — |
| `protected_previous_value` | `text` | sí | — | — |
| `protected_new_value` | `text` | sí | — | — |
| `reason` | `text` | sí | — | — |
| `result` | `string(30)` | no | — | — |
| `request_id` | `uuid` | no | — | — |
| `ip_hash` | `string(64)` | sí | — | — |
| `device_hash` | `string(64)` | sí | — | — |
| `occurred_at` | `timestampTz` | no | — | INDEX; INDEX |

### client_change_history

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `client_id` | `uuid` | no | — | FK → clients.id; delete restrict |
| `authorization_id` | `uuid` | no | — | — |
| `operation_id` | `uuid` | no | — | UNIQUE |
| `request_hash` | `string(64)` | no | — | — |
| `changed_fields` | `jsonb` | no | — | — |
| `protected_previous_values` | `text` | no | — | — |
| `protected_new_values` | `text` | no | — | — |
| `reason` | `text` | no | — | — |
| `requested_by` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `authorized_by` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `executed_by` | `bigInteger unsigned` | no | — | FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | no | — | FK → branches.id; delete restrict |
| `changed_at` | `timestampTz` | no | — | — |

### client_registration_idempotency

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | PK |
| `actor_user_id` | `bigInteger unsigned` | no | — | UNIQUE; FK → users.id; delete restrict |
| `idempotency_key` | `string(150)` | no | — | UNIQUE |
| `request_hash` | `string(64)` | no | — | — |
| `client_id` | `uuid` | sí | — | FK → clients.id; delete restrict |
| `created_at` | `timestampTz` | sí | — | — |
| `updated_at` | `timestampTz` | sí | — | — |

### excess_audits

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `action` | `string(100)` | no | — | INDEX |
| `result` | `string(32)` | no | — | — |
| `actor_id` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `actor_role` | `string(64)` | sí | — | — |
| `branch_id` | `bigInteger unsigned` | sí | — | FK → branches.id; delete restrict |
| `resource_type` | `string(80)` | no | — | — |
| `resource_id` | `string(128)` | no | — | — |
| `before_state` | `jsonb` | sí | — | — |
| `after_state` | `jsonb` | sí | — | — |
| `metadata` | `jsonb` | sí | — | — |
| `reason` | `text` | sí | — | — |
| `correlation_id` | `uuid` | no | — | — |
| `ip_address` | `string(45)` | sí | — | — |
| `user_agent` | `text` | sí | — | — |
| `occurred_at` | `timestampTz` | no | — | INDEX |

### excess_evidence_files

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `storage_file_id` | `string(160)` | no | — | UNIQUE |
| `sha256` | `char(64)` | no | — | — |
| `size_bytes` | `bigInteger unsigned` | no | — | — |
| `detected_mime` | `string(120)` | no | — | — |
| `uploaded_by` | `bigInteger unsigned` | no | — | FK → users.id; delete restrict |
| `uploaded_at` | `timestampTz` | no | — | — |
| `created_at` | `timestampTz` | no | — | — |

### excess_idempotency_keys

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `actor_id` | `bigInteger unsigned` | sí | — | UNIQUE; FK → users.id; delete restrict |
| `operation` | `string(100)` | no | — | UNIQUE |
| `resource_id` | `string(128)` | no | — | UNIQUE |
| `key_hmac` | `char(64)` | no | — | UNIQUE |
| `request_hash` | `char(64)` | no | — | — |
| `response_status` | `smallInteger unsigned` | sí | — | — |
| `response_payload` | `jsonb` | sí | — | — |
| `completed_at` | `timestampTz` | sí | — | — |
| `created_at` | `timestampTz` | sí | — | — |
| `updated_at` | `timestampTz` | sí | — | — |

### excess_processed_events

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `event_id` | `uuid` | no | — | PK |
| `event_type` | `string(100)` | no | — | UNIQUE |
| `resource_id` | `string(128)` | no | — | UNIQUE |
| `result` | `string(40)` | no | — | — |
| `processed_at` | `timestampTz` | no | — | — |
| `response_payload` | `jsonb` | sí | — | — |

### failed_jobs

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | PK |
| `uuid` | `string(255)` | no | — | UNIQUE |
| `connection` | `string(255)` | no | — | INDEX |
| `queue` | `string(255)` | no | — | INDEX |
| `payload` | `longText` | no | — | — |
| `exception` | `longText` | no | — | — |
| `failed_at` | `timestamp` | no | — | INDEX |

### job_batches

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `string(255)` | no | — | PK |
| `name` | `string(255)` | no | — | — |
| `total_jobs` | `integer` | no | — | — |
| `pending_jobs` | `integer` | no | — | — |
| `failed_jobs` | `integer` | no | — | — |
| `failed_job_ids` | `longText` | no | — | — |
| `options` | `mediumText` | sí | — | — |
| `cancelled_at` | `integer` | sí | — | — |
| `created_at` | `integer` | no | — | — |
| `finished_at` | `integer` | sí | — | — |

### jobs

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | PK |
| `queue` | `string(255)` | no | — | INDEX |
| `payload` | `longText` | no | — | — |
| `attempts` | `smallInteger unsigned` | no | — | — |
| `reserved_at` | `integer unsigned` | sí | — | — |
| `available_at` | `integer unsigned` | no | — | — |
| `created_at` | `integer unsigned` | no | — | — |

### mobility_action_idempotency

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | PK |
| `actor_user_id` | `bigInteger unsigned` | no | — | UNIQUE; FK → users.id; delete restrict |
| `action` | `string(100)` | no | — | UNIQUE |
| `idempotency_key` | `string(150)` | no | — | UNIQUE |
| `request_hash` | `string(64)` | no | — | — |
| `aggregate_type` | `string(60)` | no | — | — |
| `aggregate_id` | `uuid` | no | — | — |
| `result_version` | `bigInteger unsigned` | no | — | — |
| `created_at` | `timestampTz` | sí | — | — |
| `updated_at` | `timestampTz` | sí | — | — |

### mobility_audits

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `event_type` | `string(100)` | no | — | — |
| `aggregate_type` | `string(60)` | no | — | INDEX |
| `aggregate_id` | `uuid` | no | — | INDEX |
| `actor_user_id` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `actor_role` | `string(40)` | sí | — | — |
| `branch_id` | `bigInteger unsigned` | sí | — | FK → branches.id; delete restrict |
| `result` | `string(30)` | no | — | — |
| `reason` | `text` | sí | — | — |
| `before_snapshot` | `jsonb` | sí | — | — |
| `after_snapshot` | `jsonb` | sí | — | — |
| `ip_hash` | `string(64)` | sí | — | — |
| `device_hash` | `string(64)` | sí | — | — |
| `occurred_at` | `timestampTz` | no | — | INDEX |

### mobility_state_history

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `aggregate_type` | `string(60)` | no | — | INDEX |
| `aggregate_id` | `uuid` | no | — | INDEX |
| `previous_state` | `string(50)` | sí | — | — |
| `new_state` | `string(50)` | no | — | — |
| `actor_user_id` | `bigInteger unsigned` | no | — | FK → users.id; delete restrict |
| `actor_role` | `string(40)` | no | — | — |
| `branch_id` | `bigInteger unsigned` | sí | — | FK → branches.id; delete restrict |
| `use_case` | `string(100)` | no | — | — |
| `reason` | `text` | sí | — | — |
| `correlation_id` | `uuid` | no | — | — |
| `snapshot` | `jsonb` | sí | — | — |
| `occurred_at` | `timestampTz` | no | — | INDEX |

### password_reset_tokens

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `email` | `string(255)` | no | — | PK |
| `token` | `string(255)` | no | — | — |
| `created_at` | `timestamp` | sí | — | — |

### payment_audits

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `event_type` | `string(128)` | no | — | INDEX |
| `result` | `string(32)` | no | — | — |
| `actor_user_id` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `actor_role` | `string(64)` | sí | — | — |
| `branch_id` | `bigInteger unsigned` | sí | — | FK → branches.id; delete restrict |
| `resource_type` | `string(80)` | sí | — | — |
| `resource_id` | `string(128)` | sí | — | — |
| `reason` | `text` | sí | — | — |
| `before_state` | `json` | sí | — | — |
| `after_state` | `json` | sí | — | — |
| `metadata` | `json` | sí | — | — |
| `request_id` | `uuid` | no | — | — |
| `occurred_at` | `timestampTz` | no | — | INDEX |

### payment_idempotency_keys

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `actor_id` | `bigInteger unsigned` | no | — | UNIQUE; FK → users.id; delete restrict |
| `operation` | `string(100)` | no | — | UNIQUE |
| `key_hmac` | `char(64)` | no | — | UNIQUE |
| `request_hash` | `char(64)` | no | — | — |
| `response_status` | `smallInteger unsigned` | sí | — | — |
| `response_payload` | `json` | sí | — | — |
| `completed_at` | `timestampTz` | sí | — | — |
| `created_at` | `timestampTz` | sí | — | — |
| `updated_at` | `timestampTz` | sí | — | — |

### payment_late_fee_markers

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `relation_id` | `string(128)` | no | — | UNIQUE |
| `event_key` | `string(160)` | no | — | UNIQUE |
| `amount` | `decimal(18,4)` | no | — | — |
| `configuration_version_id` | `string(128)` | no | — | — |
| `effective_at` | `timestampTz` | no | — | — |
| `created_at` | `timestampTz` | no | — | — |

### payment_post_due_evaluations

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `relation_id` | `string(128)` | no | — | UNIQUE |
| `due_date` | `date` | no | — | UNIQUE |
| `result` | `string(20)` | no | — | — |
| `bank_import_id` | `uuid` | no | — | FK → bank_imports.id; delete restrict |
| `balance_evaluated` | `decimal(18,4)` | no | — | — |
| `evaluated_at` | `timestampTz` | no | — | — |
| `idempotency_key` | `string(180)` | no | — | UNIQUE |

### personal_access_tokens

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `bigInteger unsigned` | no | — | PK |
| `tokenable_type` | `string(255)` | no | — | INDEX |
| `tokenable_id` | `bigInteger unsigned` | no | — | INDEX |
| `name` | `text` | no | — | — |
| `token` | `string(64)` | no | — | UNIQUE |
| `abilities` | `text` | sí | — | — |
| `last_used_at` | `timestamp` | sí | — | — |
| `expires_at` | `timestamp` | sí | — | INDEX |
| `created_at` | `timestamp` | sí | — | — |
| `updated_at` | `timestamp` | sí | — | — |
| `auth_session_id` | `bigInteger unsigned` | sí | — | FK → auth_sessions.id; delete restrict |
| `context_version` | `integer unsigned` | no | `1` | — |

### point_audit_events

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `event_type` | `string(100)` | no | — | INDEX |
| `result` | `string(24)` | no | — | — |
| `resource_type` | `string(80)` | no | — | INDEX |
| `resource_id` | `string(100)` | no | — | INDEX |
| `actor_id` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `actor_role` | `string(64)` | sí | — | — |
| `distributor_id` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | sí | — | FK → branches.id; delete restrict |
| `before_state` | `jsonb` | sí | — | — |
| `after_state` | `jsonb` | sí | — | — |
| `metadata` | `jsonb` | sí | — | — |
| `correlation_id` | `string(100)` | no | — | — |
| `idempotency_key` | `string(150)` | sí | — | — |
| `ip_address` | `string(45)` | sí | — | — |
| `user_agent` | `text` | sí | — | — |
| `reason` | `text` | sí | — | — |
| `occurred_at` | `timestampTz` | no | — | INDEX |

### point_idempotency_records

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `actor_id` | `bigInteger unsigned` | no | — | UNIQUE; FK → users.id; delete restrict |
| `route` | `string(160)` | no | — | UNIQUE |
| `idempotency_key` | `string(150)` | no | — | UNIQUE |
| `request_hash` | `string(64)` | no | — | — |
| `response_status` | `smallInteger unsigned` | sí | — | — |
| `response_body` | `jsonb` | sí | — | — |
| `created_at` | `timestampTz` | sí | — | — |
| `updated_at` | `timestampTz` | sí | — | — |

### point_redemption_status_history

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `redemption_request_id` | `uuid` | no | — | INDEX; FK → point_redemption_requests.id; delete restrict |
| `from_status` | `string(24)` | sí | — | — |
| `to_status` | `string(24)` | no | — | — |
| `actor_id` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `actor_role` | `string(64)` | sí | — | — |
| `branch_id_snapshot` | `bigInteger unsigned` | sí | — | FK → branches.id; delete restrict |
| `reason` | `text` | sí | — | — |
| `idempotency_key` | `string(150)` | sí | — | — |
| `occurred_at` | `timestampTz` | no | — | INDEX |
| `security_context` | `jsonb` | sí | — | — |

### points_run_items

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `points_run_id` | `uuid` | no | — | UNIQUE; FK → points_runs.id; delete cascade |
| `relation_id` | `uuid` | no | — | UNIQUE |
| `result` | `string(48)` | no | — | — |
| `point_evaluation_id` | `uuid` | sí | — | FK → relation_point_evaluations.id; delete set null |
| `error_code` | `string(80)` | sí | — | — |
| `error_message` | `text` | sí | — | — |
| `processed_at` | `timestampTz` | no | — | — |

### risk_audit_events

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `event_type` | `string(128)` | no | — | INDEX |
| `result` | `string(32)` | no | — | — |
| `resource_type` | `string(80)` | no | — | — |
| `resource_id` | `string(128)` | no | — | — |
| `actor_id` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `actor_role` | `string(64)` | sí | — | — |
| `distributor_id` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `branch_id` | `bigInteger unsigned` | sí | — | FK → branches.id; delete restrict |
| `before_state` | `json` | sí | — | — |
| `after_state` | `json` | sí | — | — |
| `metadata` | `json` | sí | — | — |
| `reason` | `text` | sí | — | — |
| `idempotency_key` | `string(200)` | sí | — | — |
| `correlation_id` | `uuid` | no | — | — |
| `display_timezone` | `string(64)` | no | `America/Monterrey` | — |
| `operational_at` | `timestampTz` | no | — | — |
| `occurred_at` | `timestampTz` | no | — | INDEX |

### risk_idempotency_records

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `actor_id` | `bigInteger unsigned` | no | — | UNIQUE; FK → users.id; delete restrict |
| `operation` | `string(100)` | no | — | UNIQUE |
| `idempotency_key` | `string(200)` | no | — | UNIQUE |
| `request_hash` | `char(64)` | no | — | — |
| `response_status` | `smallInteger unsigned` | sí | — | — |
| `response_body` | `json` | sí | — | — |
| `created_at` | `timestampTz` | sí | — | — |
| `updated_at` | `timestampTz` | sí | — | — |

### risk_transition_history

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | no | — | PK |
| `distributor_id` | `bigInteger unsigned` | no | — | INDEX; FK → users.id; delete restrict |
| `transition_type` | `string(100)` | no | — | — |
| `previous_state` | `string(80)` | sí | — | — |
| `new_state` | `string(80)` | sí | — | — |
| `risk_alert_id` | `uuid` | sí | — | — |
| `decision_id` | `uuid` | sí | — | — |
| `removal_request_id` | `uuid` | sí | — | — |
| `actor_id` | `bigInteger unsigned` | sí | — | FK → users.id; delete restrict |
| `actor_role` | `string(64)` | sí | — | — |
| `branch_id` | `bigInteger unsigned` | sí | — | FK → branches.id; delete restrict |
| `reason` | `text` | sí | — | — |
| `before_snapshot` | `json` | sí | — | — |
| `after_snapshot` | `json` | sí | — | — |
| `effective_at` | `timestampTz` | no | — | INDEX |
| `created_at` | `timestampTz` | no | — | — |

### role_permissions

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `role_id` | `bigInteger unsigned` | no | — | PK; FK → roles.id; delete restrict |
| `permission_id` | `bigInteger unsigned` | no | — | PK; FK → permissions.id; delete restrict |

### sessions

| Campo | Tipo SQL | Nulo | Default | Claves |
| --- | --- | --- | --- | --- |
| `id` | `string(255)` | no | — | PK |
| `user_id` | `bigInteger unsigned` | sí | — | INDEX |
| `ip_address` | `string(45)` | sí | — | — |
| `user_agent` | `text` | sí | — | — |
| `payload` | `longText` | no | — | — |
| `last_activity` | `integer` | no | — | INDEX |
