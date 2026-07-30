# Etapa 1 — base Angular

## Technical decisions

- The repository contains one standalone Angular SPA named `misvales`.
- `development`, `test`, and `production` use relative `/api/v1` and
  `/sanctum/csrf-cookie` URLs.
- API, command, correlation, credentials, retry, CSRF, and error behavior is
  opt-in and implemented by functional interceptors.
- Business navigation remains empty until feature routes and their exact
  backend permissions are documented.
- Tailwind 4.3.3 remains from the existing workspace. Angular Material and CDK
  are the component/accessibility base.

## Contract boundary

`GET /api/v1/auth/context` still documents:

```json
{
  "data": {
    "result": "<data con contexto efectivo y sesión>"
  }
}
```

`ContextContractGateway` therefore fails closed and does not call the endpoint.
The frontend does not define response DTO fields, map roles, or establish a
production session until the guide supplies the complete JSON or an automated
backend contract.

This blocks real FE03.02 integration and authenticated shell E2E scenarios.
The layouts, navigation filter, in-memory session port, experience guards, and
permission guards are implemented and unit-tested without inventing a fixture.
